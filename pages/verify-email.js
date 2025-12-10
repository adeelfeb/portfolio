import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';

function formatErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  const detail =
    typeof payload.error === 'string'
      ? payload.error
      : Array.isArray(payload.error)
      ? payload.error.join(', ')
      : '';
  if (detail) {
    return `${payload.message || fallback}: ${detail}`;
  }
  return payload.message || fallback;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const email = router.query.email || '';

  useEffect(() => {
    // If no email is provided, redirect back to login
    if (router.isReady && !email) {
      router.replace('/login');
    }
  }, [router.isReady, email, router]);

  const isDisabled = useMemo(() => {
    return loading || !otp.trim() || otp.trim().length < 4;
  }, [otp, loading]);

  async function onResend(e) {
    e.preventDefault();
    if (resending || !email) return;
    
    setResending(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Failed to resend code');
      } else {
        setSuccess('Verification code sent! Please check your email.');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (isDisabled) return;
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp: otp.trim() }),
      });
      
      const text = await res.text();
      let data = {};
      
      if (text && text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
            setError("Server error. Please try again.");
            setLoading(false);
            return;
        }
      }
      
      if (!res.ok || !data.success) {
        setError(formatErrorMessage(data, "Verification failed"));
        setLoading(false);
        return;
      }
      
      // Success
      setSuccess('Email verified successfully!');
      
      if (data.data && data.data.token) {
        localStorage.setItem('token', data.data.token);
      }
      
      // Small delay before redirect
      await new Promise(resolve => setTimeout(resolve, 800));
      
      router.replace('/dashboard');
      
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!router.isReady) return null;

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-shell">
        <div className="auth-card">
          <header className="card-header">
            <h1>Verify your email</h1>
            <p>We've sent a verification code to <strong>{email}</strong></p>
          </header>

          {error && (
            <div className="alert" role="alert" aria-live="assertive">
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success" role="alert" aria-live="polite">
              {success}
            </div>
          )}

          <form onSubmit={onSubmit} className="form" noValidate>
            <label className="field">
              <span>Verification Code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                id="otp"
                name="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
              />
            </label>
            
            <button type="submit" disabled={isDisabled}>
              {loading && <span className="spinner" aria-hidden="true" />}
              <span>{loading ? 'Verifying…' : 'Verify Email'}</span>
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button 
                    type="button" 
                    onClick={onResend} 
                    disabled={resending}
                    className="text-btn"
                >
                    {resending ? 'Sending...' : 'Resend Code'}
                </button>
            </div>
          </form>

          <footer className="card-footer">
            <span>Wrong email?</span>
            <Link href="/signup" className="cta-link">
              Create a new account
            </Link>
          </footer>

        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .auth-shell {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8rem 1.5rem 4rem;
          flex: 1;
          background: radial-gradient(circle at top, rgba(0, 112, 243, 0.15), transparent 55%),
            radial-gradient(circle at bottom, rgba(35, 159, 255, 0.12), transparent 40%);
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem 2.5rem 2rem;
          border-radius: 1.5rem;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 24px 60px rgba(15, 35, 95, 0.12);
          backdrop-filter: blur(6px);
          animation: fadeIn 0.45s ease 0.05s both;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .card-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #102a43;
          margin-bottom: 0.35rem;
        }
        .card-header p {
          color: #4b5d73;
          line-height: 1.5;
        }
        .alert {
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(220, 38, 38, 0.08);
          color: #b91c1c;
          border: 1px solid rgba(220, 38, 38, 0.24);
          font-weight: 500;
        }
        .alert-success {
          background: rgba(16, 185, 129, 0.08);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.22);
        }
        .form {
          display: grid;
          gap: 1.25rem;
        }
        .field {
          display: grid;
          gap: 0.55rem;
        }
        .field span {
          font-weight: 600;
          color: #0f1c2f;
          font-size: 0.94rem;
        }
        input {
          padding: 0.9rem 1rem;
          border-radius: 0.9rem;
          border: 1px solid rgba(15, 35, 95, 0.12);
          background: #fff;
          font-size: 1rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        input:focus {
          outline: none;
          border-color: rgba(0, 112, 243, 0.55);
          box-shadow: 0 0 0 4px rgba(0, 112, 243, 0.12);
        }
        input:disabled {
          background: #f5f7fb;
        }
        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          padding: 0.95rem 1.25rem;
          border-radius: 0.95rem;
          border: none;
          background: linear-gradient(135deg, #0070f3, #3291ff);
          color: #fff;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        }
        button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(0, 112, 243, 0.25);
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.72;
          box-shadow: none;
        }
        .text-btn {
            background: none;
            color: #0070f3;
            padding: 0.5rem;
            font-size: 0.9rem;
            box-shadow: none;
        }
        .text-btn:hover {
            text-decoration: underline;
            background: none;
            box-shadow: none;
            transform: none;
        }
        .spinner {
          width: 1rem;
          height: 1rem;
          border-radius: 999px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #fff;
          animation: spin 0.65s linear infinite;
        }
        .card-footer {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          color: #4b5d73;
        }
        .cta-link {
          color: #0070f3;
          font-weight: 600;
          text-decoration: none;
        }
        .cta-link:hover {
          text-decoration: underline;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 600px) {
          .auth-shell {
            padding: 6rem 1rem 3rem;
          }
          .auth-card {
            padding: 2rem 1.65rem;
            border-radius: 1.25rem;
          }
          .card-header h1 {
            font-size: 1.75rem;
          }
          .card-header p {
            font-size: 0.9rem;
          }
        }
      `}</style>
      <Footer />
    </div>
  );
}

