import { useHealth } from '../hooks/useHealth'

interface ApiError {
  message: string
  status: number
  data?: unknown
}

export default function Dashboard() {
  const { data: health, isLoading, error, refetch } = useHealth()

  const renderError = (error: ApiError) => {
    const getErrorTitle = (status: number) => {
      if (status >= 500) return 'Server Error'
      if (status >= 400) return 'Client Error'
      if (!status) return 'Network Error'
      return 'Error'
    }

    const getErrorDescription = (status: number, message: string) => {
      if (!status)
        return 'Unable to connect to the server. Please check your internet connection.'
      if (status >= 500) return `Server error (${status}): ${message}`
      if (status >= 400) return `Request error (${status}): ${message}`
      return message
    }

    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {getErrorTitle(error.status)}
            </h3>
            <div className="mt-1 text-sm text-red-700">
              <p>{getErrorDescription(error.status, error.message)}</p>
            </div>
            <div className="mt-3">
              <button
                onClick={() => refetch()}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor your application health and status
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Health Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Backend Health
              </h3>
              <button
                onClick={() => refetch()}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={isLoading}
              >
                Refresh
              </button>
            </div>

            <div className="mt-4">
              {isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Checking...</span>
                </div>
              )}

              {error && renderError(error as ApiError)}

              {health && (
                <div
                  className={`p-3 rounded-md border ${
                    health.status === 'ok'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        health.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></div>
                    <span
                      className={`font-medium ${
                        health.status === 'ok'
                          ? 'text-green-800'
                          : 'text-red-800'
                      }`}
                    >
                      {health.status === 'ok' ? 'Healthy' : 'Unhealthy'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Last checked: {new Date(health.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">System Stats</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime</span>
                <span className="font-medium">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Time</span>
                <span className="font-medium">45ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Requests</span>
                <span className="font-medium">1,234</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                View Logs
              </button>
              <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                Restart Service
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Deploy Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
