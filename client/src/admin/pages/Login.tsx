import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Use alias

    const Login: React.FC = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState<string | null>(null);
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
      const { signIn } = useAuth();

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
          const { error: signInError } = await signIn(email, password); // Destructure error

          if (signInError) {
            throw signInError;
          }

          navigate('/admin'); // Navigate to dashboard on success
        } catch (err: any) {
          console.error("Login error:", err);
          setError(err.message || 'Failed to sign in');
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">BMS Digital Signage</h1>
              <p className="login-subtitle">Admin Login</p>
            </div>

            {error && (
              <div className="login-error">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="email" className="login-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="login-form-group-large">
                <label htmlFor="password" className="login-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className={`login-button ${
                  loading
                    ? 'login-button-disabled'
                    : 'login-button-primary'
                }`}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Optional: Link back to display */}
            {/* <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
                Return to Display
              </a>
            </div> */}
          </div>
        </div>
      );
    };

    export default Login;