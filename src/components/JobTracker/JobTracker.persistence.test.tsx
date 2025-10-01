import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import JobTracker from './JobTracker'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('JobTracker Persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Data Loading', () => {
    it('loads jobs from localStorage on initialization', () => {
      const savedJobs = [
        {
          id: '1',
          company: 'TechCorp',
          title: 'Frontend Developer',
          description: 'React position',
          status: 'applied',
          dateApplied: '2024-01-15'
        },
        {
          id: '2',
          company: 'StartupInc',
          title: 'Backend Developer',
          description: 'Node.js position',
          status: 'interviewed',
          dateApplied: '2024-01-10'
        }
      ]

      localStorage.setItem('jobs', JSON.stringify(savedJobs))

      render(<JobTracker />)

      expect(screen.getByText('TechCorp')).toBeInTheDocument()
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
      expect(screen.getByText('StartupInc')).toBeInTheDocument()
      expect(screen.getByText('Backend Developer')).toBeInTheDocument()
    })

    it('handles empty localStorage gracefully', () => {
      render(<JobTracker />)

      expect(screen.getByText(/no jobs tracked yet/i)).toBeInTheDocument()
    })

    it('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem('jobs', 'invalid-json')

      render(<JobTracker />)

      expect(screen.getByText(/no jobs tracked yet/i)).toBeInTheDocument()
    })
  })

  describe('Data Saving', () => {
    it('saves new job to localStorage when added', async () => {
      const user = userEvent.setup()
      render(<JobTracker />)

      const addButton = screen.getByRole('button', { name: /add job/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/company/i), 'TechCorp')
      await user.type(screen.getByLabelText(/job title/i), 'Frontend Developer')
      await user.type(screen.getByLabelText(/description/i), 'React position')
      await user.type(screen.getByLabelText(/date applied/i), '2024-01-15')

      const submitButton = screen.getByRole('button', { name: /save job/i })
      await user.click(submitButton)

      await waitFor(() => {
        const savedData = localStorage.getItem('jobs')
        expect(savedData).not.toBeNull()

        const jobs = JSON.parse(savedData!)
        expect(jobs).toHaveLength(1)
        expect(jobs[0].company).toBe('TechCorp')
        expect(jobs[0].title).toBe('Frontend Developer')
        expect(jobs[0].status).toBe('applied')
      })
    })

    it('saves job edits to localStorage', async () => {
      const user = userEvent.setup()
      const initialJobs = [
        {
          id: '1',
          company: 'TechCorp',
          title: 'Frontend Developer',
          description: 'React position',
          status: 'applied',
          dateApplied: '2024-01-15'
        }
      ]

      localStorage.setItem('jobs', JSON.stringify(initialJobs))
      render(<JobTracker />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      const companyInput = screen.getByDisplayValue('TechCorp')
      await user.clear(companyInput)
      await user.type(companyInput, 'MegaCorp')

      const saveButton = screen.getByRole('button', { name: /save job/i })
      await user.click(saveButton)

      await waitFor(() => {
        const savedData = localStorage.getItem('jobs')
        const jobs = JSON.parse(savedData!)
        expect(jobs[0].company).toBe('MegaCorp')
      })
    })

    it('saves status updates to localStorage', async () => {
      const user = userEvent.setup()
      const initialJobs = [
        {
          id: '1',
          company: 'TechCorp',
          title: 'Frontend Developer',
          description: 'React position',
          status: 'applied',
          dateApplied: '2024-01-15'
        }
      ]

      localStorage.setItem('jobs', JSON.stringify(initialJobs))
      render(<JobTracker />)

      const statusButton = screen.getByRole('button', { name: 'applied' })
      await user.click(statusButton)

      const interviewedOption = screen.getByRole('button', { name: 'interviewed' })
      await user.click(interviewedOption)

      await waitFor(() => {
        const savedData = localStorage.getItem('jobs')
        const jobs = JSON.parse(savedData!)
        expect(jobs[0].status).toBe('interviewed')
      })
    })

    it('removes deleted job from localStorage', async () => {
      const user = userEvent.setup()
      const initialJobs = [
        {
          id: '1',
          company: 'TechCorp',
          title: 'Frontend Developer',
          description: 'React position',
          status: 'applied',
          dateApplied: '2024-01-15'
        }
      ]

      localStorage.setItem('jobs', JSON.stringify(initialJobs))
      render(<JobTracker />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i })
      await user.click(confirmButton)

      await waitFor(() => {
        const savedData = localStorage.getItem('jobs')
        const jobs = JSON.parse(savedData!)
        expect(jobs).toHaveLength(0)
      })
    })
  })

  describe('Data Synchronization', () => {
    it('maintains data consistency across multiple operations', async () => {
      const user = userEvent.setup()
      render(<JobTracker />)

      // Add first job
      let addButton = screen.getByRole('button', { name: /add job/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/company/i), 'TechCorp')
      await user.type(screen.getByLabelText(/job title/i), 'Frontend Developer')
      await user.type(screen.getByLabelText(/description/i), 'React position')
      await user.type(screen.getByLabelText(/date applied/i), '2024-01-15')

      let submitButton = screen.getByRole('button', { name: /save job/i })
      await user.click(submitButton)

      // Add second job
      addButton = screen.getByRole('button', { name: /add job/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/company/i), 'StartupInc')
      await user.type(screen.getByLabelText(/job title/i), 'Backend Developer')
      await user.type(screen.getByLabelText(/description/i), 'Node.js position')
      await user.type(screen.getByLabelText(/date applied/i), '2024-01-10')

      submitButton = screen.getByRole('button', { name: /save job/i })
      await user.click(submitButton)

      // Update first job status
      const statusButtons = screen.getAllByRole('button', { name: 'applied' })
      await user.click(statusButtons[0])

      const interviewedOption = screen.getByRole('button', { name: 'interviewed' })
      await user.click(interviewedOption)

      await waitFor(() => {
        const savedData = localStorage.getItem('jobs')
        const jobs = JSON.parse(savedData!)

        expect(jobs).toHaveLength(2)
        expect(jobs.find((job: any) => job.company === 'TechCorp')?.status).toBe('interviewed')
        expect(jobs.find((job: any) => job.company === 'StartupInc')?.status).toBe('applied')
      })
    })

    it('persists data across component remounts', async () => {
      const user = userEvent.setup()

      // First render - add a job
      const { unmount } = render(<JobTracker />)

      const addButton = screen.getByRole('button', { name: /add job/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/company/i), 'TechCorp')
      await user.type(screen.getByLabelText(/job title/i), 'Frontend Developer')
      await user.type(screen.getByLabelText(/description/i), 'React position')
      await user.type(screen.getByLabelText(/date applied/i), '2024-01-15')

      const submitButton = screen.getByRole('button', { name: /save job/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('TechCorp')).toBeInTheDocument()
      })

      // Unmount and remount
      unmount()
      render(<JobTracker />)

      // Verify data persisted
      expect(screen.getByText('TechCorp')).toBeInTheDocument()
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
    })
  })

  describe('Storage Error Handling', () => {
    it('handles localStorage quota exceeded gracefully', async () => {
      const user = userEvent.setup()

      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      render(<JobTracker />)

      const addButton = screen.getByRole('button', { name: /add job/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/company/i), 'TechCorp')
      await user.type(screen.getByLabelText(/job title/i), 'Frontend Developer')
      await user.type(screen.getByLabelText(/description/i), 'React position')
      await user.type(screen.getByLabelText(/date applied/i), '2024-01-15')

      const submitButton = screen.getByRole('button', { name: /save job/i })
      await user.click(submitButton)

      // Should still show the job in memory even if localStorage fails
      await waitFor(() => {
        expect(screen.getByText('TechCorp')).toBeInTheDocument()
      })

      // Restore original setItem
      localStorage.setItem = originalSetItem
    })

    it('handles localStorage getItem errors gracefully', () => {
      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error')
      })

      render(<JobTracker />)

      // Should show empty state when localStorage fails
      expect(screen.getByText(/no jobs tracked yet/i)).toBeInTheDocument()

      // Restore original getItem
      localStorage.getItem = originalGetItem
    })
  })
})