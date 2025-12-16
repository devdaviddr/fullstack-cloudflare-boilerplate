import { useHealth } from '../hooks/useHealth'

export default function Dashboard() {
  const { data: health, isLoading, error, refetch } = useHealth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor your application health and status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Health Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Backend Health</h3>
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

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">Failed to fetch health status</p>
                </div>
              )}

              {health && (
                <div className={`p-3 rounded-md border ${
                  health.status === 'ok'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      health.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`font-medium ${
                      health.status === 'ok' ? 'text-green-800' : 'text-red-800'
                    }`}>
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