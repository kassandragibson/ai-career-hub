import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Auth from './Auth'

describe('Auth Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Login Form', () => {
    it('renders login form by default', () => {
      render(<Auth />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    })

    it('displays validation errors for empty fields', async () => {
      const user = userEvent.setup()
      render(<Auth />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<Auth />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'invalid-email')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
      })
    })

    it('calls onLogin with valid credentials', async () => {
      const mockOnLogin = vi.fn()
      const user = userEvent.setup()

      render(<Auth onLogin={mockOnLogin} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  describe('Registration Form', () => {
    it('switches to registration form when clicking signup link', async () => {
      const user = userEvent.setup()
      render(<Auth />)

      const signupLink = screen.getByText(/sign up/i)
      await user.click(signupLink)

      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('validates password confirmation', async () => {
      const user = userEvent.setup()
      render(<Auth />)

      const signupLink = screen.getByText(/sign up/i)
      await user.click(signupLink)

      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password456')
      await user.click(submitButton)

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })

    it('calls onRegister with valid data', async () => {
      const mockOnRegister = vi.fn()
      const user = userEvent.setup()

      render(<Auth onRegister={mockOnRegister} />)

      const signupLink = screen.getByText(/sign up/i)
      await user.click(signupLink)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      expect(mockOnRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  describe('Authentication State', () => {
    it('shows loading state during authentication', async () => {
      const slowLogin = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      const user = userEvent.setup()

      render(<Auth onLogin={slowLogin} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('displays error message on authentication failure', async () => {
      const failingLogin = vi.fn(() => Promise.reject(new Error('Invalid credentials')))
      const user = userEvent.setup()

      render(<Auth onLogin={failingLogin} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })
  })
})