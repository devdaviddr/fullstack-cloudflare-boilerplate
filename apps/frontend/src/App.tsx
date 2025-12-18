import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'
import TodoList from './pages/TodoList'
import Login from './pages/Login'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="h-screen flex flex-col overflow-hidden">
              <Navigation />
              <div className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <TodoList />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
              <footer className="bg-blue-600 text-white px-6 py-3 text-sm font-medium text-center border-t-4 border-blue-700 shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-blue-200">🚀</span>
                  <span>Version: <span className="font-bold text-yellow-300">{import.meta.env.VITE_BUILD_VERSION || 'dev'}</span></span>
                  <span className="text-blue-200">✨</span>
                </div>
              </footer>
            </div>
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
