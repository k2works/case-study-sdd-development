import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('初期表示時にショップ名が表示される', () => {
    render(<App />)
    expect(screen.getByText('フレール・メモワール')).toBeInTheDocument()
  })

  it('初期表示時に準備中メッセージが表示される', () => {
    render(<App />)
    expect(screen.getByText('ただいま準備中です。')).toBeInTheDocument()
  })
})
