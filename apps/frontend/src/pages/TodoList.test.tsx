import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import TodoList from './TodoList'

// Mock the API module
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { api } from '../lib/api'

// Create a test QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
)

describe('TodoList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock the todos query to return empty array by default
    api.get.mockResolvedValue({ data: [] })
  })

  it('renders the todo list title and description', async () => {
    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    )

    expect(await screen.findByText('Todo List')).toBeInTheDocument()
    expect(
      screen.getByText('Stay organized and track your tasks')
    ).toBeInTheDocument()
  })

  it('shows empty state when no todos exist', async () => {
    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    )

    expect(await screen.findByText('No tasks yet')).toBeInTheDocument()
    expect(
      screen.getByText('Get started by adding a new task above.')
    ).toBeInTheDocument()
  })

  it('renders todo form elements', async () => {
    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    )

    await screen.findByText('Todo List') // Wait for loading to complete

    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /add task/i })
    ).toBeInTheDocument()
  })

  it('calls API when adding a todo', async () => {
    const user = userEvent.setup()
    // Mock successful todo creation
    api.post.mockResolvedValue({
      data: {
        id: '1',
        text: 'Test todo item',
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    })

    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    )

    await screen.findByText('Todo List') // Wait for loading

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByRole('button', { name: /add task/i })

    await user.type(input, 'Test todo item')
    await user.click(addButton)

    expect(api.post).toHaveBeenCalledWith('/todos', { text: 'Test todo item' })
  })

  it('handles keyboard input for adding todos', async () => {
    const user = userEvent.setup()
    // Mock successful todo creation
    vi.mocked(api.post).mockResolvedValue({
      data: {
        id: '1',
        text: 'Enter key test',
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    })

    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    )

    await screen.findByText('Todo List') // Wait for loading

    const input = screen.getByPlaceholderText('Add a new task...')

    await user.type(input, 'Enter key test{enter}')

    expect(api.post).toHaveBeenCalledWith('/todos', { text: 'Enter key test' })
  })
  it('renders the todo list title and description', () => {
    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    )

    expect(screen.getByText('Todo List')).toBeInTheDocument()
    expect(
      screen.getByText('Stay organized and track your tasks')
    ).toBeInTheDocument()
  })

  it('shows empty state when no todos exist', () => {
    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    )

    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(
      screen.getByText('Get started by adding a new task above.')
    ).toBeInTheDocument()
  })

  it('shows empty state when no todos exist', () => {
    render(<TodoList />)

    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(
      screen.getByText('Get started by adding a new task above.')
    ).toBeInTheDocument()
  })

  it('allows adding a new todo', async () => {
    const user = userEvent.setup()
    // Mock successful todo creation
    vi.mocked(api.post).mockResolvedValue({
      data: {
        id: '1',
        text: 'Test todo item',
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    })

    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    )

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByRole('button', { name: /add task/i })

    await user.type(input, 'Test todo item')
    await user.click(addButton)

    expect(api.post).toHaveBeenCalledWith('/todos', { text: 'Test todo item' })
  })

  it('allows toggling todo completion', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    )

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByRole('button', { name: /add task/i })

    await user.type(input, 'Complete me')
    await user.click(addButton)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(screen.getByText('1 of 1 completed')).toBeInTheDocument()
  })

  it('allows deleting todos', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    )

    const input = screen.getByPlaceholderText('Add a new task...')
    const addButton = screen.getByRole('button', { name: /add task/i })

    await user.type(input, 'Delete me')
    await user.click(addButton)

    expect(screen.getByText('Delete me')).toBeInTheDocument()

    const deleteButton = screen.getByTitle('Delete task')
    await user.click(deleteButton)

    expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('handles keyboard input for adding todos', async () => {
    const user = userEvent.setup()
    // Mock successful todo creation
    api.post.mockResolvedValue({
      data: {
        id: '1',
        text: 'Enter key test',
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    })

    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    )

    await screen.findByText('Todo List') // Wait for loading

    const input = screen.getByPlaceholderText('Add a new task...')

    await user.type(input, 'Enter key test{enter}')

    expect(api.post).toHaveBeenCalledWith('/todos', { text: 'Enter key test' })
  })
})
