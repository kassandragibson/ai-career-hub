import { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import NewApplicationModal from './components/NewApplicationModal.jsx';
import styles from './App.module.css'; // Import the CSS module for App

// Main application component
export default function App() {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveApplication = (newJobData) => {
    const newJob = { 
      ...newJobData, 
      id: crypto.randomUUID(),
      dateApplied: new Date().toLocaleDateString() 
    };
    setJobs(prevJobs => [newJob, ...prevJobs]);
    setIsModalOpen(false);
  };

  return (
    <div className="container">
      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>AI Career Hub</h1>
          <p className={styles.headerSubtitle}>Your intelligent assistant for the job search</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className={styles.newAppButton}
        >
          <Plus height={20} width={20} />
          New Application
        </button>
      </header>

      <main>
        <h2 className={styles.mainContentTitle}>My Job Applications</h2>
        
        <div className={styles.jobsListContainer}>
          {jobs.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIconContainer}>
                <Briefcase height={32} width={32} color="#64748b" />
              </div>
              <h3 className={styles.emptyStateTitle}>No applications yet</h3>
              <p className={styles.emptyStateSubtitle}>Click "New Application" to start tracking your job search.</p>
            </div>
          ) : (
            <div className={styles.jobsList}>
              {jobs.map(job => (
                <div key={job.id} className={styles.jobItem}>
                  <div>
                    <h3 className={styles.jobItemTitle}>{job.jobTitle}</h3>
                    <p className={styles.jobItemCompany}>{job.company}</p>
                  </div>
                  <div className={styles.jobItemDetails}>
                    <p className={styles.jobItemDate}>Applied: {job.dateApplied}</p>
                    <span className={styles.jobItemStatus}>
                      Applied
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 AI Career Hub. Built with Gemini.</p>
      </footer>
      
      <NewApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveApplication}
      />
    </div>
  );
}
