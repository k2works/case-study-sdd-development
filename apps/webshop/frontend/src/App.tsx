import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app">
          <header className="app-header">
            <h1>フレール・メモワール</h1>
            <p className="subtitle">WEB ショップ</p>
          </header>
          <main className="app-main">
            <p>ただいま準備中です。</p>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
