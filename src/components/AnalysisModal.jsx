import { useState } from 'react';
import { X, Bot, Clipboard, Check } from 'lucide-react';
import styles from './AnalysisModal.module.css';

export default function AnalysisModal({ isOpen, onClose, job }) {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

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
    setHasCopied(false);

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
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
      
      setAnalysis(result);

    } catch (e) {
      console.error("Analysis failed:", e);
      setError(e.message || "Failed to get analysis. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (analysis && analysis.rewritten_resume) {
      // Using the Clipboard API
      navigator.clipboard.writeText(analysis.rewritten_resume).then(() => {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        // Fallback for older browsers
        try {
          const textArea = document.createElement('textarea');
          textArea.value = analysis.rewritten_resume;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setHasCopied(true);
          setTimeout(() => setHasCopied(false), 2000);
        } catch (fallbackErr) {
          console.error('Fallback copy failed:', fallbackErr);
        }
      });
    }
  };

  const handleClose = () => {
    setResumeText('');
    setAnalysis(null);
    setIsLoading(false);
    setError('');
    setHasCopied(false);
    onClose();
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Tailor Resume for: {job.jobTitle}</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <X height={24} width={24} color="#64748b" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="resumeText" className={styles.formLabel}>
              Paste your original resume content here
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
                <p>Rewriting your resume... Please wait.</p>
            </div>
          )}

          {analysis && analysis.rewritten_resume && (
            <div className={styles.analysisResult}>
              <h3 className={styles.analysisTitle}>AI-Tailored Resume</h3>
              <div className={styles.rewrittenResumeContainer}>
                <textarea
                  readOnly
                  className={styles.rewrittenResumeTextarea}
                  value={analysis.rewritten_resume}
                />
                <button onClick={handleCopyToClipboard} className={styles.copyButton}>
                  {hasCopied ? <Check size={14} /> : <Clipboard size={14} />}
                  {hasCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
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
            Rewrite Resume
          </button>
        </div>
      </div>
    </div>
  );
}
