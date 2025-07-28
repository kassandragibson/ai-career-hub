import { useState } from 'react';
import { X, Bot, Clipboard, Check, FileText } from 'lucide-react';
import styles from './AnalysisModal.module.css';

export default function AnalysisModal({ isOpen, onClose, job, user }) {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCopiedResume, setHasCopiedResume] = useState(false);
  
  // New state for cover letter
  const [coverLetter, setCoverLetter] = useState('');
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [hasCopiedLetter, setHasCopiedLetter] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text before analyzing.');
      return;
    }
    setError('');
    setIsLoading(true);
    setAnalysis(null);
    setCoverLetter(''); // Clear previous cover letter
    setHasCopiedResume(false);
    setHasCopiedLetter(false);

    try {
      const response = await fetch('http://127.0.0.1:5001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, jobId: job.id, resumeText }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `HTTP error! status: ${response.status}`);
      setAnalysis(result);
    } catch (e) {
      console.error("Analysis failed:", e);
      setError(e.message || "Failed to get analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!analysis?.rewritten_resume) return;
    
    setIsGeneratingLetter(true);
    setError('');
    setCoverLetter('');
    setHasCopiedLetter(false);

    try {
      const response = await fetch('http://127.0.0.1:5001/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, jobId: job.id, resumeText: analysis.rewritten_resume }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `HTTP error! status: ${response.status}`);
      setCoverLetter(result.cover_letter);
    } catch (e) {
      console.error("Cover letter generation failed:", e);
      setError(e.message || "Failed to generate cover letter.");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const copyToClipboard = (text, setCopiedState) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    }).catch(err => console.error('Failed to copy text: ', err));
  };

  const handleClose = () => {
    setResumeText('');
    setAnalysis(null);
    setCoverLetter('');
    setIsLoading(false);
    setIsGeneratingLetter(false);
    setError('');
    setHasCopiedResume(false);
    setHasCopiedLetter(false);
    onClose();
  };

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
            <label htmlFor="resumeText" className={styles.formLabel}>Paste your original resume content here</label>
            <textarea id="resumeText" value={resumeText} onChange={(e) => setResumeText(e.target.value)} className={styles.textarea} placeholder="Paste the full text of your resume..." disabled={isLoading || isGeneratingLetter} />
          </div>

          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          {isLoading && <div style={{textAlign: 'center', margin: '1rem 0'}}><div className={styles.loader} style={{margin: '0 auto'}}></div><p>Rewriting your resume...</p></div>}

          {analysis?.rewritten_resume && (
            <div className={styles.analysisResult}>
              <h3 className={styles.analysisTitle}>AI-Tailored Resume</h3>
              <div className={styles.rewrittenResumeContainer}>
                <textarea readOnly className={styles.rewrittenResumeTextarea} value={analysis.rewritten_resume} />
                <button onClick={() => copyToClipboard(analysis.rewritten_resume, setHasCopiedResume)} className={styles.copyButton}>
                  {hasCopiedResume ? <Check size={14} /> : <Clipboard size={14} />}
                  {hasCopiedResume ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {isGeneratingLetter && <div style={{textAlign: 'center', margin: '1rem 0'}}><div className={styles.loader}></div><p>Generating cover letter...</p></div>}
          
          {coverLetter && (
            <div className={styles.coverLetterContainer}>
              <h3 className={styles.analysisTitle}>Generated Cover Letter</h3>
              <div className={styles.rewrittenResumeContainer}>
                <textarea readOnly className={styles.rewrittenResumeTextarea} value={coverLetter} />
                <button onClick={() => copyToClipboard(coverLetter, setHasCopiedLetter)} className={styles.copyButton}>
                  {hasCopiedLetter ? <Check size={14} /> : <Clipboard size={14} />}
                  {hasCopiedLetter ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button onClick={handleAnalyze} className={`${styles.button} ${styles.analyzeButton}`} disabled={isLoading || isGeneratingLetter || !resumeText.trim()}>
            {isLoading ? <div className={styles.loader}></div> : <Bot height={20} width={20} />}
            Rewrite Resume
          </button>
          {analysis?.rewritten_resume && !coverLetter && (
            <button onClick={handleGenerateCoverLetter} className={`${styles.button} ${styles.coverLetterButton}`} disabled={isGeneratingLetter}>
              {isGeneratingLetter ? <div className={styles.loader}></div> : <FileText height={20} width={20} />}
              Generate Cover Letter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
