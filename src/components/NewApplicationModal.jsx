import { useState } from 'react';
import { X } from 'lucide-react';
import styles from './NewApplicationModal.module.css'; // Import the CSS module

export default function NewApplicationModal({ isOpen, onClose, onSave }) {
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave({ company, jobTitle, jobDescription });
    setCompany('');
    setJobTitle('');
    setJobDescription('');
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>New Job Application</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X height={24} width={24} color="#64748b" /> {/* slate-500 */}
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="company" className={styles.formLabel}>Company Name</label>
            <input 
              type="text" 
              id="company" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={styles.input}
              placeholder="e.g., Google"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="jobTitle" className={styles.formLabel}>Job Title</label>
            <input 
              type="text" 
              id="jobTitle" 
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={styles.input}
              placeholder="e.g., Software Engineer"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="jobDescription" className={styles.formLabel}>Job Description</label>
            <textarea 
              id="jobDescription" 
              rows="8"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={styles.textarea}
              placeholder="Paste the full job description here..."
              required
            ></textarea>
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={`${styles.button} ${styles.cancelButton}`}>
              Cancel
            </button>
            <button type="submit" className={`${styles.button} ${styles.saveButton}`}>
              Save Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
