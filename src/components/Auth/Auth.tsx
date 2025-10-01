import React, { useState } from 'react'

interface AuthCredentials {
  email: string
  password: string
}

interface AuthProps {
  onLogin?: (credentials: AuthCredentials) => Promise<void>
  onRegister?: (credentials: AuthCredentials) => Promise<void>
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: ''
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const credentials = {
        email: formData.email,
        password: formData.password
      }

      if (isSignUp && onRegister) {
        await onRegister(credentials)
      } else if (!isSignUp && onLogin) {
        await onLogin(credentials)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear field-specific error when user starts typing, except for email validation
    if (errors[name as keyof typeof errors] && name !== 'email') {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setFormData({ email: '', password: '', confirmPassword: '' })
    setErrors({ email: '', password: '', confirmPassword: '' })
    setError('')
  }

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#333',
        fontSize: '2rem',
        fontWeight: '600'
      }}>
        {isSignUp ? '🎯 Join the Hub' : '🔐 Welcome Back'}
      </h2>

      {error && (
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
            📧 Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            style={{
              border: errors.email ? '2px solid #ff6b6b' : '2px solid rgba(255, 255, 255, 0.3)'
            }}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <div style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '8px', fontWeight: '500' }}>
              {errors.email}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
            🔒 Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-input"
            style={{
              border: errors.password ? '2px solid #ff6b6b' : '2px solid rgba(255, 255, 255, 0.3)'
            }}
            placeholder="Enter your password"
          />
          {errors.password && (
            <div style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '8px', fontWeight: '500' }}>
              {errors.password}
            </div>
          )}
        </div>

        {isSignUp && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
              🔐 Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              style={{
                border: errors.confirmPassword ? '2px solid #ff6b6b' : '2px solid rgba(255, 255, 255, 0.3)'
              }}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <div style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '8px', fontWeight: '500' }}>
                {errors.confirmPassword}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={isLoading ? '' : 'btn-primary'}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            background: isLoading ? 'linear-gradient(135deg, #ccc 0%, #999 100%)' : undefined,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : (
            <>
              {isSignUp ? '🚀 Create Account' : '✨ Sign In'}
            </>
          )}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          padding: '1rem',
          borderRadius: '12px',
          color: '#555'
        }}>
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={toggleMode}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                ✨ Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={toggleMode}
                style={{
                  background: 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                🚀 Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth