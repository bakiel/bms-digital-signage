// src/components/admin/AdminLayout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/admin" className="text-xl font-bold flex items-center">
            <span className="mr-2">BMS Admin Dashboard</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span>{user?.email}</span>
            <button
              onClick={signOut}
              className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto">
            <NavLink to="/admin" exact={true}>Dashboard</NavLink>
            <NavLink to="/admin/products">Products</NavLink>
            <NavLink to="/admin/categories">Categories</NavLink>
            <NavLink to="/admin/announcements">Announcements</NavLink>
            <NavLink to="/admin/settings">Settings</NavLink>
            <NavLink to="/admin/import">Import/Export</NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          <p>BMS Digital Signage Admin © 2025</p>
        </div>
      </footer>
    </div>
  );
};

// Helper component for navigation links
const NavLink: React.FC<{ to: string; exact?: boolean; children: React.ReactNode }> = ({ 
  to, 
  exact = false, // Default exact to false
  children 
}) => {
  const location = useLocation();
  // Adjusted isActive logic for better matching
  const isActive = exact 
    ? location.pathname === to 
    : location.pathname === to || (location.pathname.startsWith(to) && location.pathname.charAt(to.length) === '/');
  
  // Handle the exact match for the root admin path explicitly
  if (to === '/admin' && exact) {
    const isActiveRoot = location.pathname === '/admin';
    return (
      <Link
        to={to}
        className={`px-4 py-3 inline-block border-b-2 font-medium ${
          isActiveRoot 
            ? 'border-blue-600 text-blue-600' 
            : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800'
        }`}
      >
        {children}
      </Link>
    );
  }

  // Handle non-exact matching for other paths
  return (
    <Link
      to={to}
      className={`px-4 py-3 inline-block border-b-2 font-medium ${
        isActive && !exact // Ensure this logic applies correctly for non-exact paths
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800'
      }`}
    >
      {children}
    </Link>
  );
};

export default AdminLayout;