import { useState, useEffect } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase.js'; // Import our database connection
import NewApplicationModal from './components/NewApplicationModal.jsx';
import styles from './App.module.css';

// Main application component
export default function App() {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // useEffect to fetch and listen for data from Firestore
  useEffect(() => {
    // Create a query against the 'jobs' collection
    const q = query(collection(db, 'jobs'));
    
    // onSnapshot sets up a real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobsArray = [];
      querySnapshot.forEach((doc) => {
        // Add the document data and its ID to our array
        jobsArray.push({ ...doc.data(), id: doc.id });
      });
      // Sort jobs by date applied, newest first
      jobsArray.sort((a, b) => b.dateApplied.toMillis() - a.dateApplied.toMillis());
      setJobs(jobsArray);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []); // The empty array [] means this effect runs once on mount

  // handleSaveApplication is now an async function to work with the database
  const handleSaveApplication = async (newJobData) => {
    try {
      // Add a new document with a generated id.
      await addDoc(collection(db, "jobs"), {
        ...newJobData,
        dateApplied: new Date() // Store the full date object
      });
      // No need to call setJobs here, onSnapshot will do it for us!
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error adding document: ", e);
      // You could add some user-facing error handling here
    }
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
                    {/* Convert Firestore Timestamp to readable date */}
                    <p className={styles.jobItemDate}>Applied: {new Date(job.dateApplied.seconds * 1000).toLocaleDateString()}</p>
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
