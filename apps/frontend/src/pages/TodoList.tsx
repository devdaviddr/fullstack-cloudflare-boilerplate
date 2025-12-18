import { useState } from 'react'
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} from '../hooks/useTodos'
import { TodoSkeleton } from '../components/Skeleton'

export default function TodoList() {
  const [newTodo, setNewTodo] = useState('')
  const { data: todos = [], isLoading, error } = useTodos()
  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()

  const addTodo = async () => {
    if (newTodo.trim()) {
      try {
        await createTodo.mutateAsync({ text: newTodo.trim() })
        setNewTodo('')
      } catch (error) {
        alert('Failed to add todo. Please try again.')
      }
    }
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      try {
        await updateTodo.mutateAsync({
          id,
          data: { completed: !todo.completed },
        })
      } catch (error) {
        alert('Failed to update todo. Please try again.')
      }
    }
  }

  const handleDeleteTodo = async (id: string) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo.mutateAsync(id)
      } catch (error) {
        alert('Failed to delete todo. Please try again.')
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !createTodo.isPending) {
      addTodo()
    }
  }

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="animate-pulse bg-gray-200 rounded h-8 w-48 mb-2"></div>
            <div className="animate-pulse bg-gray-200 rounded h-4 w-64"></div>
          </div>

          {/* Add Todo Form Skeleton */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 animate-pulse bg-gray-200 rounded-md h-12"></div>
              <div className="animate-pulse bg-gray-200 rounded-md h-12 w-24"></div>
            </div>
          </div>

          {/* Todo List Skeleton */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="animate-pulse bg-gray-200 rounded h-6 w-32"></div>
            </div>
            <div className="p-4 sm:p-6">
              <TodoSkeleton count={5} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load todos
          </h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Todo List</h1>
          <p className="mt-2 text-gray-600">
            Stay organized and track your tasks
          </p>
        </div>

        {/* Add Todo Form */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
            <button
              onClick={addTodo}
              disabled={!newTodo.trim() || createTodo.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2 min-h-[48px] touch-manipulation"
            >
              {createTodo.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Task</span>
              )}
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Your Tasks</h3>
              {totalCount > 0 && (
                <span className="text-sm text-gray-500">
                  {completedCount} of {totalCount} completed
                </span>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {todos.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No tasks yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding a new task above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                    />
                    <span
                      className={`flex-1 text-sm sm:text-base ${
                        todo.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-900'
                      }`}
                    >
                      {todo.text}
                    </span>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                      title="Delete task"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
