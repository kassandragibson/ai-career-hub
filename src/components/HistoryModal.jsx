import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './HistoryModal.module.css';

export default function HistoryModal({ isOpen, onClose, job, user }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !user || !job) {
      return;
    }

    setIsLoading(true);
    const analysesCollectionRef = collection(db, 'users', user.uid, 'jobs', job.id, 'analyses');
    const q = query(analysesCollectionRef, orderBy('analyzed_at', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const historyArray = [];
      querySnapshot.forEach((doc) => {
        historyArray.push({ ...doc.data(), id: doc.id });
      });
      setHistory(historyArray);
      setIsLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [isOpen, user, job]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Analysis History for: {job.jobTitle}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X height={24} width={24} color="#64748b" />
          </button>
        </div>

        <div className={styles.modalBody}>
          {isLoading ? (
            <p className={styles.loadingText}>Loading history...</p>
          ) : history.length === 0 ? (
            <p className={styles.emptyText}>No analysis history found for this job.</p>
          ) : (
            <div className={styles.historyList}>
              {history.map((entry) => (
                <div key={entry.id} className={styles.historyItem}>
                  <h3 className={styles.historyItemHeader}>
                    Analyzed on: {entry.analyzed_at ? new Date(entry.analyzed_at.seconds * 1000).toLocaleString() : 'N/A'}
                  </h3>
                  <textarea
                    readOnly
                    className={styles.rewrittenResumeTextarea}
                    value={entry.rewritten_resume || 'No rewritten resume found.'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
