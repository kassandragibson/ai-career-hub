import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import JobTracker from './JobTracker'

interface Job {
  id: string
  company: string
  title: string
  description: string
  status: 'applied' | 'interviewed' | 'offer' | 'rejected'
  dateApplied: string
  notes?: string
}

describe('JobTracker Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Job List Display', () => {
    it('renders empty state when no jobs exist', () => {
      render(<JobTracker />)

      expect(screen.getByText(/no jobs tracked yet/i)).toBeInTheDocument()
      expect(screen.getByText(/add your first job/i)).toBeInTheDocument()
    })

    it('displays list of jobs when jobs exist', () => {
      const mockJobs: Job[] = [
        {
          id: '1',
          company: 'TechCorp',
          title: 'Frontend Developer',
          description: 'React position',
          status: 'applied',
          dateApplied: '2024-01-15',
          notes: 'Great opportunity'
        },
        {
          id: '2',
          company: 'StartupInc',
          title: 'Full Stack Developer',
          description: 'Node.js and React',
          status: 'interviewed',
          dateApplied: '2024-01-10'
        }
      ]

      render(<JobTracker initialJobs={mockJobs} />)

      expect(screen.getByText('TechCorp')).toBeInTheDocument()
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
      expect(screen.getByText('StartupInc')).toBeInTheDocument()
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument()
    })

    it('shows correct status badges for each job', () => {
      const mockJobs: Job[] = [
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

      render(<JobTracker initialJobs={mockJobs} />)

      const statusButtons = screen.getAllByRole('button').filter(button =>
        button.textContent === 'applied' || button.textContent === 'interviewed'
      )

      expect(statusButtons).toHaveLength(2)
      expect(statusButtons.some(button => button.textContent === 'applied')).toBe(true)
      expect(statusButtons.some(button => button.textContent === 'interviewed')).toBe(true)
    })
  })

  describe('Add New Job', () => {
    it('shows add job form when clicking add job button', async () => {
      const user = userEvent.setup()
      render(<JobTracker />)

      const addButton = screen.getByRole('button', { name: /add job/i })
      await user.click(addButton)

      expect(screen.getByLabelText(/company/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/date applied/i)).toBeInTheDocument()
    })

    it('validates required fields when submitting job form', async () => {
      const user = userEvent.setup()
      render(<JobTracker />)

      const addButton = screen.getByRole('button', { name: /add job/i })
      await user.click(addButton)

      const submitButton = screen.getByRole('button', { name: /save job/i })
      await user.click(submitButton)

      expect(screen.getByText(/company is required/i)).toBeInTheDocument()
      expect(screen.getByText(/job title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/date applied is required/i)).toBeInTheDocument()
    })

    it('adds new job when form is submitted with valid data', async () => {
      const user = userEvent.setup()
      render(<JobTracker />)

      const addButton = screen.getByRole('button', { name: /add job/i })
      await user.click(addButton)

      await user.type(screen.getByLabelText(/company/i), 'TechCorp')
      await user.type(screen.getByLabelText(/job title/i), 'Frontend Developer')
      await user.type(screen.getByLabelText(/description/i), 'React developer position')
      await user.type(screen.getByLabelText(/date applied/i), '2024-01-15')

      const submitButton = screen.getByRole('button', { name: /save job/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('TechCorp')).toBeInTheDocument()
        expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'applied' })).toBeInTheDocument()
      })
    })

    it('cancels add job form and returns to list view', async () => {
      const user = userEvent.setup()
      render(<JobTracker />)

      const addButton = screen.getByRole('button', { name: /add job/i })
      await user.click(addButton)

      expect(screen.getByLabelText(/company/i)).toBeInTheDocument()

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(screen.queryByLabelText(/company/i)).not.toBeInTheDocument()
      expect(screen.getByText(/no jobs tracked yet/i)).toBeInTheDocument()
    })
  })

  describe('Job Status Updates', () => {
    it('allows updating job status from applied to interviewed', async () => {
      const user = userEvent.setup()
      const mockJob: Job = {
        id: '1',
        company: 'TechCorp',
        title: 'Frontend Developer',
        description: 'React position',
        status: 'applied',
        dateApplied: '2024-01-15'
      }

      render(<JobTracker initialJobs={[mockJob]} />)

      const statusButton = screen.getByRole('button', { name: 'applied' })
      await user.click(statusButton)

      const interviewedOption = screen.getByRole('button', { name: 'interviewed' })
      await user.click(interviewedOption)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'interviewed' })).toBeInTheDocument()
      })
    })

    it('shows all status options in dropdown', async () => {
      const user = userEvent.setup()
      const mockJob: Job = {
        id: '1',
        company: 'TechCorp',
        title: 'Frontend Developer',
        description: 'React position',
        status: 'applied',
        dateApplied: '2024-01-15'
      }

      render(<JobTracker initialJobs={[mockJob]} />)

      const statusButton = screen.getByRole('button', { name: 'applied' })
      await user.click(statusButton)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: 'applied' })).toHaveLength(2)
        expect(screen.getByRole('button', { name: 'interviewed' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'offer' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'rejected' })).toBeInTheDocument()
      })
    })
  })

  describe('Job Management', () => {
    it('allows editing an existing job', async () => {
      const user = userEvent.setup()
      const mockJob: Job = {
        id: '1',
        company: 'TechCorp',
        title: 'Frontend Developer',
        description: 'React position',
        status: 'applied',
        dateApplied: '2024-01-15'
      }

      render(<JobTracker initialJobs={[mockJob]} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      const companyInput = screen.getByDisplayValue('TechCorp')
      await user.clear(companyInput)
      await user.type(companyInput, 'MegaCorp')

      const saveButton = screen.getByRole('button', { name: /save job/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('MegaCorp')).toBeInTheDocument()
        expect(screen.queryByText('TechCorp')).not.toBeInTheDocument()
      })
    })

    it('allows deleting a job', async () => {
      const user = userEvent.setup()
      const mockJob: Job = {
        id: '1',
        company: 'TechCorp',
        title: 'Frontend Developer',
        description: 'React position',
        status: 'applied',
        dateApplied: '2024-01-15'
      }

      render(<JobTracker initialJobs={[mockJob]} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.queryByText('TechCorp')).not.toBeInTheDocument()
        expect(screen.getByText(/no jobs tracked yet/i)).toBeInTheDocument()
      })
    })

    it('shows confirmation dialog before deleting job', async () => {
      const user = userEvent.setup()
      const mockJob: Job = {
        id: '1',
        company: 'TechCorp',
        title: 'Frontend Developer',
        description: 'React position',
        status: 'applied',
        dateApplied: '2024-01-15'
      }

      render(<JobTracker initialJobs={[mockJob]} />)

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(screen.getByText(/are you sure you want to delete this job/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })

  describe('Job Search and Filtering', () => {
    it('filters jobs by company name', async () => {
      const user = userEvent.setup()
      const mockJobs: Job[] = [
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

      render(<JobTracker initialJobs={mockJobs} />)

      const searchInput = screen.getByPlaceholderText(/search jobs/i)
      await user.type(searchInput, 'TechCorp')

      expect(screen.getByText('TechCorp')).toBeInTheDocument()
      expect(screen.queryByText('StartupInc')).not.toBeInTheDocument()
    })

    it('filters jobs by status', async () => {
      const user = userEvent.setup()
      const mockJobs: Job[] = [
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

      render(<JobTracker initialJobs={mockJobs} />)

      const statusFilter = screen.getByLabelText(/filter by status/i)
      await user.selectOptions(statusFilter, 'applied')

      expect(screen.getByText('TechCorp')).toBeInTheDocument()
      expect(screen.queryByText('StartupInc')).not.toBeInTheDocument()
    })
  })
})