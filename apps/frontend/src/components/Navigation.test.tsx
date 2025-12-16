import { render, screen } from '@testing-library/react'
import Navigation from './Navigation'

describe('Navigation', () => {
  it('renders the application title', () => {
    render(<Navigation />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Fullstack Cloudflare Boilerplate'
    )
  })

  it('renders navigation with proper structure', () => {
    render(<Navigation />)

    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveClass('bg-white', 'shadow-sm', 'border-b')
  })
})
