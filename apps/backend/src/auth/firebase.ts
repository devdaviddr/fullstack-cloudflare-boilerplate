import type { User, JWTPayload, JWTHeader } from '../types'
import { logger } from '../logger'

/**
 * Decodes a base64url-encoded string (used in JWT)
 */
function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  )
  return atob(padded)
}

/**
 * Converts base64url string to Uint8Array for cryptographic verification
 */
function base64UrlToUint8Array(str: string): Uint8Array {
  const decoded = base64UrlDecode(str)
  const bytes = new Uint8Array(decoded.length)
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i)
  }
  return bytes
}

/**
 * Fetches Firebase public keys for JWT verification
 * Returns keys from Google's public certificate endpoint
 */
async function getFirebasePublicKeys(): Promise<Record<string, string>> {
  const url =
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch public keys: ${response.status}`)
    }
    return (await response.json()) as Record<string, string>
  } catch (error) {
    logger.error('Error fetching public keys', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw new Error('Failed to fetch public keys for token verification')
  }
}

/**
 * Extracts the SubjectPublicKeyInfo from a PEM-encoded X.509 certificate
 * This is required to import the key into Web Crypto API
 */
function extractPublicKeyFromCertificate(pem: string): Uint8Array {
  // Remove PEM headers and whitespace
  const pemContents = pem
    .replace(/-----BEGIN CERTIFICATE-----/, '')
    .replace(/-----END CERTIFICATE-----/, '')
    .replace(/\s/g, '')

  // Decode base64 to get DER-encoded certificate
  const binaryDer = atob(pemContents)
  const certData = new Uint8Array(binaryDer.length)
  for (let i = 0; i < binaryDer.length; i++) {
    certData[i] = binaryDer.charCodeAt(i)
  }

  // Find SubjectPublicKeyInfo in the certificate
  // X.509 structure: SEQUENCE > TBSCertificate SEQUENCE > SubjectPublicKeyInfo SEQUENCE
  let offset = 0

  // Skip outer SEQUENCE
  if (certData[offset++] !== 0x30) throw new Error('Invalid certificate format')
  offset += getLengthBytes(certData, offset).bytesRead

  // Skip TBSCertificate SEQUENCE
  if (certData[offset++] !== 0x30) throw new Error('Invalid TBSCertificate')
  const tbsLength = getLengthBytes(certData, offset)
  offset += tbsLength.bytesRead
  const tbsEnd = offset + tbsLength.length

  // Find SubjectPublicKeyInfo (SEQUENCE containing algorithm OID and public key)
  while (offset < tbsEnd - 10) {
    if (certData[offset] === 0x30) {
      const savedOffset = offset
      offset++
      const seqLength = getLengthBytes(certData, offset)
      offset += seqLength.bytesRead

      // Check if this contains an AlgorithmIdentifier with RSA OID
      if (certData[offset] === 0x30) {
        offset++
        const algLength = getLengthBytes(certData, offset)
        offset += algLength.bytesRead

        // Check for RSA OID (1.2.840.113549.1.1.1)
        if (certData[offset] === 0x06 && certData[offset + 1] === 0x09) {
          const oid = Array.from(certData.slice(offset + 2, offset + 11))
          const rsaOid = [0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01]

          if (oid.every((val, idx) => val === rsaOid[idx])) {
            // Found it! Calculate exact SPKI length
            // SPKI = tag (1 byte) + length bytes + content
            const spkiLength = 1 + seqLength.bytesRead + seqLength.length
            return certData.slice(savedOffset, savedOffset + spkiLength)
          }
        }
      }
      offset = savedOffset + 1
    } else {
      offset++
    }
  }

  throw new Error('Could not find SubjectPublicKeyInfo in certificate')
}

/**
 * Decodes ASN.1 length field
 */
function getLengthBytes(
  data: Uint8Array,
  offset: number
): { length: number; bytesRead: number } {
  let length = data[offset++]
  let bytesRead = 1

  if (length & 0x80) {
    const lengthBytes = length & 0x7f
    length = 0
    for (let i = 0; i < lengthBytes; i++) {
      length = (length << 8) | data[offset++]
      bytesRead++
    }
  }

  return { length, bytesRead }
}

/**
 * Imports a PEM-encoded RSA public key using Web Crypto API
 */
async function importPublicKey(pem: string): Promise<CryptoKey> {
  const spkiData = extractPublicKeyFromCertificate(pem)

  return await crypto.subtle.importKey(
    'spki',
    spkiData,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['verify']
  )
}

/**
 * Verifies JWT signature using Firebase public keys and Web Crypto API
 */
async function verifyJWTSignature(
  token: string,
  header: JWTHeader,
  publicKeys: Record<string, string>
): Promise<boolean> {
  logger.debug('Verifying signature', { kid: header.kid })

  const publicKeyPem = publicKeys[header.kid]
  if (!publicKeyPem) {
    logger.error('Public key not found', {
      kid: header.kid,
      availableKeys: Object.keys(publicKeys),
    })
    throw new Error(`Public key not found for kid: ${header.kid}`)
  }

  try {
    const publicKey = await importPublicKey(publicKeyPem)

    const parts = token.split('.')
    const dataToVerify = `${parts[0]}.${parts[1]}`
    const encoder = new TextEncoder()
    const data = encoder.encode(dataToVerify)
    const signature = base64UrlToUint8Array(parts[2])

    const isValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signature,
      data
    )

    if (!isValid) {
      logger.warn('Signature verification failed')
    }

    return isValid
  } catch (error) {
    logger.error('Signature verification error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}

/**
 * Verifies a Firebase ID token using Web Crypto API
 *
 * This implementation is optimized for Cloudflare Workers which:
 * - Don't support Node.js APIs (fs, http, crypto module)
 * - Do support Web Crypto API (crypto.subtle)
 * - Require lightweight, edge-compatible code
 *
 * @param token - Firebase ID token (JWT)
 * @param projectId - Firebase project ID
 * @param clientEmail - Not used (kept for backward compatibility)
 * @param privateKey - Not used (kept for backward compatibility)
 * @returns User data from verified token
 */
export async function verifyFirebaseToken(
  token: string,
  projectId: string
): Promise<User> {
  logger.debug('Starting token verification', { projectId })

  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format')
  }

  let header: JWTHeader
  let payload: JWTPayload

  try {
    header = JSON.parse(base64UrlDecode(parts[0]))
    payload = JSON.parse(base64UrlDecode(parts[1]))
  } catch (error) {
    throw new Error('Failed to decode token')
  }

  // Validate claims
  const now = Math.floor(Date.now() / 1000)

  if (!payload.exp || payload.exp < now) {
    logger.warn('Token expired', { exp: payload.exp, now })
    throw new Error('Token expired')
  }

  if (!payload.iat || payload.iat > now + 300) {
    throw new Error('Token used before issued')
  }

  if (payload.aud !== projectId) {
    logger.error('Audience mismatch', { expected: projectId, got: payload.aud })
    throw new Error('Invalid token audience')
  }

  const expectedIssuer = `https://securetoken.google.com/${projectId}`
  if (payload.iss !== expectedIssuer) {
    logger.error('Issuer mismatch', {
      expected: expectedIssuer,
      got: payload.iss,
    })
    throw new Error('Invalid token issuer')
  }

  if (!payload.sub) {
    throw new Error('Token missing subject')
  }

  logger.debug('Claims validated successfully')

  // Verify cryptographic signature
  const publicKeys = await getFirebasePublicKeys()

  const isValid = await verifyJWTSignature(token, header, publicKeys)

  if (!isValid) {
    throw new Error('Invalid token signature')
  }

  logger.info('Token verified successfully', {
    userId: payload.sub,
    email: payload.email,
  })

  return {
    id: payload.sub,
    firebase_uid: payload.sub,
    email: payload.email || '',
    name: payload.name || payload.email || 'Unknown User',
  }
}
