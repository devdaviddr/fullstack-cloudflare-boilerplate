import { useAuth } from '../contexts/AuthContext'

export default function Navigation() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <img
                src="https://developers.cloudflare.com/_astro/logo.DAG2yejx.svg"
                alt="Cloudflare Logo"
                className="h-8 w-8"
              />
            </div>
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                Fullstack Cloudflare Boilerplate
              </h1>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.displayName || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
