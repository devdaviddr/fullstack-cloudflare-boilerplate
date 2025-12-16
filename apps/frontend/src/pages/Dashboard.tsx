import { useHealth } from '../hooks/useHealth'
import { useLogs } from '../hooks/useLogs'
import { useRestartService, useDeployUpdate } from '../hooks/useServiceActions'

interface ApiError {
  message: string
  status: number
  data?: unknown
}

export default function Dashboard() {
  const {
    data: health,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useHealth()
  const {
    data: logs,
    isLoading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useLogs()
  const restartService = useRestartService()
  const deployUpdate = useDeployUpdate()

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  const handleRestart = async () => {
    if (
      confirm(
        'Are you sure you want to restart the service? This may cause temporary downtime.'
      )
    ) {
      try {
        await restartService.mutateAsync()
        alert('Service restart completed successfully!')
      } catch (error) {
        alert('Failed to restart service. Please check the logs for details.')
      }
    }
  }

  const handleDeploy = async () => {
    if (
      confirm(
        'Are you sure you want to deploy an update? This will update the application.'
      )
    ) {
      try {
        await deployUpdate.mutateAsync()
        alert('Deployment completed successfully!')
      } catch (error) {
        alert('Failed to deploy update. Please check the logs for details.')
      }
    }
  }

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
                onClick={() => refetchHealth()}
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
    <div className="h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor your application health and status
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Health Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Backend Health
              </h3>
              <button
                onClick={() => refetchHealth()}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={healthLoading}
              >
                Refresh
              </button>
            </div>

            <div className="mt-4">
              {healthLoading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Checking...</span>
                </div>
              )}

              {healthError && renderError(healthError as ApiError)}

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

          {/* System Logs Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">System Logs</h3>
              <button
                onClick={() => refetchLogs()}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={logsLoading}
              >
                Refresh
              </button>
            </div>

            <div className="mt-4">
              {logsLoading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading logs...</span>
                </div>
              )}

              {logsError && renderError(logsError as ApiError)}

              {logs && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logs.logs.length === 0 ? (
                    <p className="text-gray-500 text-sm">No logs available</p>
                  ) : (
                    logs.logs.map((log, index) => (
                      <div
                        key={index}
                        className="text-xs font-mono bg-gray-50 p-2 rounded border"
                      >
                        {log}
                      </div>
                    ))
                  )}
                  {logs.total > logs.logs.length && (
                    <p className="text-xs text-gray-500 mt-2">
                      Showing last {logs.logs.length} of {logs.total} total logs
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Service Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleRestart}
                disabled={restartService.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center space-x-2"
              >
                {restartService.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Restarting...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Restart Service</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDeploy}
                disabled={deployUpdate.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center space-x-2"
              >
                {deployUpdate.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span>Deploy Update</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* System Stats Card */}
          {health?.stats && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                System Statistics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatUptime(health.stats.uptime)}
                  </div>
                  <div className="text-sm text-gray-500">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {health.stats.responseTime}ms
                  </div>
                  <div className="text-sm text-gray-500">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {health.stats.requestCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Requests</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
