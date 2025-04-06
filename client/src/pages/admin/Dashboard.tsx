import React, { useState, useEffect } from 'react';
    import { Link } from 'react-router-dom';
    import { useAuth } from '../../context/AuthContext'; // Corrected path
    import { supabase } from '../../utils/supabaseClient'; // Corrected path

    // Define a type for stats for better type safety
    type DashboardStats = {
      products: number;
      categories: number;
      announcements: number;
    };

    const Dashboard: React.FC = () => {
      const { user, signOut } = useAuth();
      const [stats, setStats] = useState<DashboardStats>({
        products: 0,
        categories: 0,
        announcements: 0
      });
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null); // Add error state

      useEffect(() => {
        const fetchStats = async () => {
          setLoading(true);
          setError(null);
          try {
            // Fetch counts concurrently
            const [productRes, categoryRes, announcementRes] = await Promise.all([
              supabase.from('products').select('*', { count: 'exact', head: true }),
              supabase.from('categories').select('*', { count: 'exact', head: true }),
              supabase.from('announcements').select('*', { count: 'exact', head: true })
            ]);

            // Check for errors in responses
            if (productRes.error) throw productRes.error;
            if (categoryRes.error) throw categoryRes.error;
            if (announcementRes.error) throw announcementRes.error;

            setStats({
              products: productRes.count || 0,
              categories: categoryRes.count || 0,
              announcements: announcementRes.count || 0
            });
          } catch (err: any) {
            console.error('Error fetching stats:', err);
            setError(err.message || 'Failed to fetch dashboard stats');
          } finally {
            setLoading(false);
          }
        };

        fetchStats();
      }, []); // Empty dependency array means run once on mount

      const handleSignOut = async () => {
        try {
          await signOut();
          // Navigation back to login or display page will be handled by AuthProvider/ProtectedRoute
        } catch (err) {
          console.error("Sign out error:", err);
          // Optionally show an error message to the user
        }
      };

      // Basic inline styles (replace with CSS Modules or styled-components later if preferred)
      const navStyle: React.CSSProperties = { backgroundColor: '#1e3a8a', color: 'white', padding: '16px' };
      const containerStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: '16px' };
      const cardStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '24px' };
      const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' };
      const linkStyle: React.CSSProperties = { color: '#2563eb', textDecoration: 'none', marginTop: '16px', display: 'inline-block' };
      const buttonStyle: React.CSSProperties = { backgroundColor: '#2563eb', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' };
      const quickLinkStyle: React.CSSProperties = { padding: '16px', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' };

      if (loading) {
        return <div>Loading dashboard...</div>; // Simple loading indicator
      }

      if (error) {
        return <div style={{ color: 'red', padding: '20px' }}>Error loading dashboard: {error}</div>;
      }

      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <nav style={navStyle}>
            <div style={{ ...containerStyle, padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>BMS Admin Dashboard</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span>{user?.email}</span>
                <button onClick={handleSignOut} style={buttonStyle}>
                  Sign Out
                </button>
              </div>
            </div>
          </nav>

          <div style={containerStyle}>
            {/* Stats Grid */}
            <div style={gridStyle}>
              <div style={cardStyle}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Products</h2>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '16px' }}>{stats.products}</p>
                <Link to="/admin/products" style={linkStyle}>Manage Products →</Link>
              </div>
              <div style={cardStyle}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Categories</h2>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '16px' }}>{stats.categories}</p>
                <Link to="/admin/categories" style={linkStyle}>Manage Categories →</Link>
              </div>
              <div style={cardStyle}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Announcements</h2>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '16px' }}>{stats.announcements}</p>
                <Link to="/admin/announcements" style={linkStyle}>Manage Announcements →</Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ ...cardStyle, marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                <Link to="/admin/products/new" style={{ ...quickLinkStyle, backgroundColor: '#dbeafe', color: '#1e40af' }}>Add New Product</Link>
                <Link to="/admin/categories/new" style={{ ...quickLinkStyle, backgroundColor: '#dcfce7', color: '#166534' }}>Add New Category</Link>
                <Link to="/admin/announcements/new" style={{ ...quickLinkStyle, backgroundColor: '#fef9c3', color: '#854d0e' }}>Add New Announcement</Link>
                <Link to="/admin/settings" style={{ ...quickLinkStyle, backgroundColor: '#f3e8ff', color: '#6b21a8' }}>System Settings</Link>
              </div>
            </div>

            {/* View Display Link */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link to="/" style={{ backgroundColor: '#1f2937', color: 'white', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none' }}>
                View Display
              </Link>
            </div>
          </div>
        </div>
      );
    };

    export default Dashboard;