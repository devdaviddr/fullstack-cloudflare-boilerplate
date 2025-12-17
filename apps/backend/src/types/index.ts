export interface Env extends Record<string, unknown> {
  DB: D1Database
  FIREBASE_PROJECT_ID: string
  FIREBASE_CLIENT_EMAIL: string
  FIREBASE_PRIVATE_KEY: string
}

export interface User {
  uid: string
  email: string
  name: string
}

export type Variables = {
  user: User
}

export interface JWTPayload {
  sub: string // User ID
  email: string
  name?: string
  aud: string // Audience (project ID)
  iss: string // Issuer
  exp: number // Expiration timestamp
  iat: number // Issued at timestamp
}

export interface JWTHeader {
  alg: string
  kid: string
  typ: string
}