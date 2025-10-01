import React, { useState } from 'react'
import Auth from './components/Auth/Auth'
import JobTracker from './components/JobTracker/JobTracker'
import './App.css'

interface User {
  email: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, you'd validate credentials against a backend
      // For demo purposes, any email/password combination works
      setUser({ email: credentials.email })

      // Store user session
      localStorage.setItem('user', JSON.stringify({ email: credentials.email }))
    } catch (error) {
      throw new Error('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, you'd create a new user account
      // For demo purposes, registration always succeeds
      setUser({ email: credentials.email })

      // Store user session
      localStorage.setItem('user', JSON.stringify({ email: credentials.email }))
    } catch (error) {
      throw new Error('Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  // Check for existing session on app load
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.warn('Error loading user session:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  if (!user) {
    return (
      <div className="auth-container">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            🚀 AI Career Hub
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#6b7280',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Track your job applications and accelerate your career with our professional interface
          </p>
          <Auth
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>
      {/* Header */}
      <header className="header-gradient" style={{ padding: '1rem 0' }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: 0
          }}>
            🚀 AI Career Hub
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              Welcome, <strong style={{ color: '#1f2937' }}>{user.email}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="btn-danger"
              style={{ fontSize: '0.875rem' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '2rem 0',
        width: '100%'
      }}>
        <JobTracker />
      </main>

      {/* Footer */}
      <footer className="footer-gradient" style={{ padding: '1.5rem 0' }}>
        <div className="container" style={{
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Built with Test-Driven Development ✅ | Your career journey starts here 🌟
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
