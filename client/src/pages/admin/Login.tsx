import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '../../context/AuthContext'; // Corrected path

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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
          <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>BMS Digital Signage</h1>
              <p style={{ color: '#666' }}>Admin Login</p>
            </div>

            {error && (
              <div style={{ backgroundColor: '#ffebee', border: '1px solid #ef9a9a', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '16px', textAlign: 'center' }}>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="email" style={{ display: 'block', color: '#333', fontWeight: '500', marginBottom: '8px' }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: 'calc(100% - 24px)', // Account for padding
                    padding: '10px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                  required
                  autoComplete="email"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="password" style={{ display: 'block', color: '#333', fontWeight: '500', marginBottom: '8px' }}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: 'calc(100% - 24px)', // Account for padding
                    padding: '10px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#9ca3af' : '#2563eb', // Gray out when loading
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  fontSize: '1rem',
                  transition: 'background-color 0.2s'
                }}
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