import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center space-x-8 mb-8">
            <a
              href="https://vitejs.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-110"
            >
              <img src="/vite.svg" className="h-16 w-16" alt="Vite logo" />
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-110"
            >
              <img
                src="https://vitejs.dev/logo.svg"
                className="h-16 w-16 animate-spin"
                alt="React logo"
                style={{ animationDuration: '20s' }}
              />
            </a>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Vite + React + Tailwind
          </h1>

          <div className="text-center">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
            >
              Count is {count}
            </button>

            <p className="mt-4 text-gray-600 text-sm">
              Edit <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">src/App.tsx</code> and save to test HMR
            </p>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              Built with Vite, React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App