import React, { useState, useMemo, useEffect } from 'react'

export interface Job {
  id: string
  company: string
  title: string
  description: string
  status: 'applied' | 'interviewed' | 'offer' | 'rejected'
  dateApplied: string
  notes?: string
}

interface JobTrackerProps {
  initialJobs?: Job[]
}

interface JobFormData {
  company: string
  title: string
  description: string
  dateApplied: string
  notes: string
}

const STORAGE_KEY = 'jobs'

const loadJobsFromStorage = (): Job[] => {
  try {
    const savedJobs = localStorage.getItem(STORAGE_KEY)
    if (savedJobs) {
      return JSON.parse(savedJobs)
    }
  } catch (error) {
    console.warn('Error loading jobs from localStorage:', error)
  }
  return []
}

const saveJobsToStorage = (jobs: Job[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  } catch (error) {
    console.warn('Error saving jobs to localStorage:', error)
  }
}

const JobTracker: React.FC<JobTrackerProps> = ({ initialJobs = [] }) => {
  const [jobs, setJobs] = useState<Job[]>(() => {
    // Use initialJobs if provided (for testing), otherwise load from localStorage
    return initialJobs.length > 0 ? initialJobs : loadJobsFromStorage()
  })
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [formData, setFormData] = useState<JobFormData>({
    company: '',
    title: '',
    description: '',
    dateApplied: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState({
    company: '',
    title: '',
    dateApplied: ''
  })

  // Save jobs to localStorage whenever jobs state changes
  useEffect(() => {
    saveJobsToStorage(jobs)
  }, [jobs])

  const validateForm = (): boolean => {
    const errors = {
      company: formData.company ? '' : 'Company is required',
      title: formData.title ? '' : 'Job title is required',
      dateApplied: formData.dateApplied ? '' : 'Date applied is required'
    }

    setFormErrors(errors)
    return !Object.values(errors).some(error => error !== '')
  }

  const resetForm = () => {
    setFormData({
      company: '',
      title: '',
      description: '',
      dateApplied: '',
      notes: ''
    })
    setFormErrors({
      company: '',
      title: '',
      dateApplied: ''
    })
    setEditingJob(null)
    setShowForm(false)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const jobData: Job = {
      id: editingJob ? editingJob.id : Date.now().toString(),
      company: formData.company,
      title: formData.title,
      description: formData.description,
      status: editingJob ? editingJob.status : 'applied',
      dateApplied: formData.dateApplied,
      notes: formData.notes || undefined
    }

    if (editingJob) {
      setJobs(jobs.map(job => job.id === editingJob.id ? jobData : job))
    } else {
      setJobs([...jobs, jobData])
    }

    resetForm()
  }

  const handleAddJob = () => {
    setShowForm(true)
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setFormData({
      company: job.company,
      title: job.title,
      description: job.description,
      dateApplied: job.dateApplied,
      notes: job.notes || ''
    })
    setShowForm(true)
  }

  const handleDeleteJob = (jobId: string) => {
    setDeleteConfirm(jobId)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      setJobs(jobs.filter(job => job.id !== deleteConfirm))
      setDeleteConfirm(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  const handleStatusChange = (jobId: string, newStatus: Job['status']) => {
    setJobs(jobs.map(job =>
      job.id === jobId ? { ...job, status: newStatus } : job
    ))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear field-specific error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchTerm === '' ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [jobs, searchTerm, statusFilter])

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'applied': return '#6366f1'
      case 'interviewed': return '#f59e0b'
      case 'offer': return '#10b981'
      case 'rejected': return '#ef4444'
      default: return '#6b7280'
    }
  }

  if (showForm) {
    return (
      <div className="container">
        <div className="card">
          <h2 style={{
            textAlign: 'center',
            marginBottom: '2rem',
            fontSize: '1.75rem',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {editingJob ? 'Edit Job Application' : 'Add New Job Application'}
          </h2>

          <form onSubmit={handleFormSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="company" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="form-input"
                style={{
                  border: formErrors.company ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '0.75rem'
                }}
                placeholder="e.g., Google, Microsoft, Startup Inc."
              />
              {formErrors.company && (
                <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '8px', fontWeight: '500' }}>
                  {formErrors.company}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="title" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Job Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                style={{
                  border: formErrors.title ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '0.75rem'
                }}
                placeholder="e.g., Frontend Developer, Product Manager"
              />
              {formErrors.title && (
                <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '8px', fontWeight: '500' }}>
                  {formErrors.title}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Brief description of the role, requirements, or any notes..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="dateApplied" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Date Applied
              </label>
              <input
                type="date"
                id="dateApplied"
                name="dateApplied"
                value={formData.dateApplied}
                onChange={handleInputChange}
                className="form-input"
                style={{
                  border: formErrors.dateApplied ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '0.75rem'
                }}
              />
              {formErrors.dateApplied && (
                <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '8px', fontWeight: '500' }}>
                  {formErrors.dateApplied}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="notes" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                style={{ minHeight: '80px' }}
                placeholder="Any additional thoughts, interview tips, contact info..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: '500' }}
              >
                Save Job
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
                style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: '500' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '2rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Job Application Tracker
        </h1>
        <button
          onClick={handleAddJob}
          className="btn-primary"
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          Add Job
        </button>
      </div>

      {jobs.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search jobs by company or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label htmlFor="statusFilter" style={{ fontWeight: '600', color: '#374151' }}>
                Filter:
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
                style={{
                  minWidth: '150px',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="interviewed">Interviewed</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {filteredJobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1rem'
          }}>
            {jobs.length === 0 ? 'No jobs tracked yet' : 'No matching jobs found'}
          </h3>
          <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '2rem' }}>
            {jobs.length === 0
              ? 'Start tracking your job applications and take control of your career journey.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {jobs.length === 0 && (
            <button
              onClick={handleAddJob}
              className="btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              Add Your First Job
            </button>
          )}
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {job.company}
                  </h3>
                  <h4 style={{
                    margin: '0 0 0.75rem 0',
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#4f46e5'
                  }}>
                    {job.title}
                  </h4>
                  <p style={{
                    margin: '0 0 0.75rem 0',
                    color: '#64748b',
                    fontSize: '0.95rem',
                    lineHeight: '1.5'
                  }}>
                    {job.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Applied: <strong>{new Date(job.dateApplied).toLocaleDateString()}</strong>
                    </span>
                  </div>
                  {job.notes && (
                    <p style={{
                      margin: '0.5rem 0 0 0',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      fontStyle: 'italic',
                      background: '#f9fafb',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      borderLeft: '3px solid #4f46e5'
                    }}>
                      {job.notes}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                  <button
                    onClick={() => handleEditJob(job)}
                    className="btn-secondary"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="btn-danger"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      const dropdown = document.getElementById(`status-${job.id}`)
                      if (dropdown) {
                        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'
                      }
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      backgroundColor: getStatusColor(job.status),
                      color: 'white',
                      minWidth: '120px'
                    }}
                  >
                    {job.status}
                  </button>
                  <div
                    id={`status-${job.id}`}
                    style={{
                      display: 'none',
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      zIndex: 10,
                      minWidth: '120px'
                    }}
                  >
                    {(['applied', 'interviewed', 'offer', 'rejected'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          handleStatusChange(job.id, status)
                          const dropdown = document.getElementById(`status-${job.id}`)
                          if (dropdown) dropdown.style.display = 'none'
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '0.5rem 1rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textTransform: 'capitalize',
                          color: '#374151'
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              color: '#1f2937',
              fontWeight: '600'
            }}>
              Delete Job Application?
            </h3>
            <p style={{
              margin: '0 0 2rem 0',
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              This action cannot be undone. The job application and all its data will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={confirmDelete}
                className="btn-danger"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="btn-secondary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobTracker