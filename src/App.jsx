import { useState, useEffect } from 'react';
import { Plus, Briefcase, Bot, LogOut } from 'lucide-react';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase.js';
import NewApplicationModal from './components/NewApplicationModal.jsx';
import AnalysisModal from './components/AnalysisModal.jsx';
import AuthPage from './pages/AuthPage.jsx'; // Import the new AuthPage
import styles from './App.module.css';

// This is the main component for the authenticated part of the app
function Dashboard({ user }) {
  const [jobs, setJobs] = useState([]);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // useEffect to fetch data based on the logged-in user
  useEffect(() => {
    if (!user) return; // Don't fetch if no user

    // IMPORTANT: The path now includes the user's ID to fetch only their jobs
    // We create a reference to the user's specific 'jobs' sub-collection
    const jobsCollectionRef = collection(db, 'users', user.uid, 'jobs');
    const q = query(jobsCollectionRef);
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobsArray = [];
      querySnapshot.forEach((doc) => {
        jobsArray.push({ ...doc.data(), id: doc.id });
      });
      jobsArray.sort((a, b) => (b.dateApplied?.toMillis() || 0) - (a.dateApplied?.toMillis() || 0));
      setJobs(jobsArray);
    });
    return () => unsubscribe();
  }, [user]); // Rerun this effect if the user changes

  const handleSaveApplication = async (newJobData) => {
    try {
      // IMPORTANT: The path now includes the user's ID to save the job under their profile
      await addDoc(collection(db, "users", user.uid, "jobs"), {
        ...newJobData,
        dateApplied: new Date()
      });
      setIsNewAppModalOpen(false);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
  
  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Sign out error", error));
  };

  const openAnalysisModal = (job) => {
    setSelectedJob(job);
    setIsAnalysisModalOpen(true);
  };

  const jobItemActionsStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem'
  };
  const analyzeButtonStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#16a34a', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600'
  };

  return (
    <div className="container">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>AI Career Hub</h1>
          <p className={styles.headerSubtitle}>Welcome, {user.email}</p>
        </div>
        <div className={styles.headerRight}>
          <button onClick={() => setIsNewAppModalOpen(true)} className={styles.newAppButton}>
            <Plus height={20} width={20} /> New Application
          </button>
          <button onClick={handleSignOut} className={styles.signOutButton}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main>
        <h2 className={styles.mainContentTitle}>My Job Applications</h2>
        <div className={styles.jobsListContainer}>
          {jobs.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIconContainer}><Briefcase height={32} width={32} color="#64748b" /></div>
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
                    <button style={analyzeButtonStyle} onClick={() => openAnalysisModal(job)}>
                      <Bot height={16} width={16} /> Analyze
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}><p>&copy; 2025 AI Career Hub. Built with Gemini.</p></footer>
      
      <NewApplicationModal isOpen={isNewAppModalOpen} onClose={() => setIsNewAppModalOpen(false)} onSave={handleSaveApplication} />
      {selectedJob && <AnalysisModal isOpen={isAnalysisModalOpen} onClose={() => { setIsAnalysisModalOpen(false); setSelectedJob(null); }} job={selectedJob} />}
    </div>
  );
}

// This is the main router component
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to the Firebase Auth state and set the user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{textAlign: 'center', paddingTop: '5rem', fontSize: '1.2rem'}}>Loading...</div>; // Or a fancy spinner component
  }

  return user ? <Dashboard user={user} /> : <AuthPage />;
}
