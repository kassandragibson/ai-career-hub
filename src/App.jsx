import { useState, useEffect } from 'react';
import { Plus, Briefcase, Bot } from 'lucide-react';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase.js';
import NewApplicationModal from './components/NewApplicationModal.jsx';
import AnalysisModal from './components/AnalysisModal.jsx'; // Import the new modal
import styles from './App.module.css';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // To track which job to analyze

  useEffect(() => {
    const q = query(collection(db, 'jobs'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobsArray = [];
      querySnapshot.forEach((doc) => {
        jobsArray.push({ ...doc.data(), id: doc.id });
      });
      // Sort jobs by date applied, newest first
      jobsArray.sort((a, b) => {
        const dateA = a.dateApplied?.toMillis() || 0;
        const dateB = b.dateApplied?.toMillis() || 0;
        return dateB - dateA;
      });
      setJobs(jobsArray);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveApplication = async (newJobData) => {
    try {
      await addDoc(collection(db, "jobs"), {
        ...newJobData,
        dateApplied: new Date()
      });
      setIsNewAppModalOpen(false);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Function to open the analysis modal
  const openAnalysisModal = (job) => {
    setSelectedJob(job);
    setIsAnalysisModalOpen(true);
  };
  
  // A new CSS class for the actions container
  const jobItemActionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem'
  };
  
  const analyzeButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: '#16a34a', /* green-600 */
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '600'
  };


  return (
    <div className="container">
      <header className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>AI Career Hub</h1>
          <p className={styles.headerSubtitle}>Your intelligent assistant for the job search</p>
        </div>
        <button 
          onClick={() => setIsNewAppModalOpen(true)}
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
                  <div style={jobItemActionsStyle}>
                    <p className={styles.jobItemDate}>Applied: {job.dateApplied ? new Date(job.dateApplied.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                    <button 
                      style={analyzeButtonStyle}
                      onClick={() => openAnalysisModal(job)}
                    >
                      <Bot height={16} width={16} />
                      Analyze
                    </button>
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
        isOpen={isNewAppModalOpen} 
        onClose={() => setIsNewAppModalOpen(false)}
        onSave={handleSaveApplication}
      />

      {/* Conditionally render the Analysis Modal */}
      {selectedJob && (
        <AnalysisModal 
          isOpen={isAnalysisModalOpen}
          onClose={() => {
            setIsAnalysisModalOpen(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
        />
      )}
    </div>
  );
}
