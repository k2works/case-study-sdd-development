import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('未ログイン時にログインページが表示される', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument()
  })
})
