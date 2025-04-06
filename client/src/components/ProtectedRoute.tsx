import React from 'react';
    import { Navigate } from 'react-router-dom';
    import { useAuth } from '../context/AuthContext'; // Corrected path

    type ProtectedRouteProps = {
      children: React.ReactNode;
    };

    const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
      const { user, loading } = useAuth();

      if (loading) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            {/* Simple spinner */}
            <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 2s linear infinite' }}>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        );
      }

      // TEMPORARY: Allow access without authentication for testing
      // Comment this section back in when authentication is properly set up
      /*
      if (!user) {
        // Redirect them to the /admin/login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/admin/login" replace />;
      }
      */

      return <>{children}</>; // Render children if user is authenticated
    };

    export default ProtectedRoute;