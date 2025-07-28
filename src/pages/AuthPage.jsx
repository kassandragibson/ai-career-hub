import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // On successful login/signup, the onAuthStateChanged listener in App.jsx will handle the redirect.
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        <p className={styles.subtitle}>
          {isLogin ? 'Sign in to continue' : 'Get started with your AI Career Hub'}
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className={styles.input}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
        <p className={styles.toggleText}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <a onClick={() => setIsLogin(!isLogin)} className={styles.toggleLink}>
            {isLogin ? ' Sign Up' : ' Login'}
          </a>
        </p>
      </div>
    </div>
  );
}
