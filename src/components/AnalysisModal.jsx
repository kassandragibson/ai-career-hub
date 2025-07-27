import { useState } from 'react';
import { X, Bot } from 'lucide-react';
import styles from './AnalysisModal.module.css';

export default function AnalysisModal({ isOpen, onClose, job }) {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text before analyzing.');
      return;
    }
    setError('');
    setIsLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch('http://127.0.0.1:5001/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          resumeText: resumeText,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Use the error message from the backend if available
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
      
      // --- FIX: No need to parse the result anymore ---
      // The backend now sends a clean JSON object.
      setAnalysis(result);

    } catch (e) {
      console.error("Analysis failed:", e);
      setError(e.message || "Failed to get analysis. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // When closing the modal, reset all the state
  const handleClose = () => {
    setResumeText('');
    setAnalysis(null);
    setIsLoading(false);
    setError('');
    onClose();
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Analyze Resume for: {job.jobTitle}</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <X height={24} width={24} color="#64748b" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="resumeText" className={styles.formLabel}>
              Paste your resume content here
            </label>
            <textarea
              id="resumeText"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className={styles.textarea}
              placeholder="Paste the full text of your resume..."
              disabled={isLoading}
            />
          </div>

          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

          {isLoading && (
            <div style={{textAlign: 'center', margin: '1rem 0'}}>
                <div className={styles.loader} style={{margin: '0 auto'}}></div>
                <p>Analyzing... Please wait.</p>
            </div>
          )}

          {analysis && (
            <div className={styles.analysisResult}>
              <h3 className={styles.analysisTitle}>AI Suggestions</h3>
              <div className={styles.analysisSummary}>
                <strong>Summary:</strong> {analysis.summary}
              </div>
              <ul className={styles.suggestionList}>
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button
            onClick={handleAnalyze}
            className={`${styles.button} ${styles.analyzeButton}`}
            disabled={isLoading || !resumeText.trim()}
          >
            {isLoading ? <div className={styles.loader}></div> : <Bot height={20} width={20} />}
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
}
