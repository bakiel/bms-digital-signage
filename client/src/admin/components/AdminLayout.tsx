import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/utils/supabaseClient'; // Use alias
import { useAuth } from '@/context/AuthContext'; // Use alias

// Icon imports (to be replaced with proper imports if using a library like react-icons)
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>;
const ProductsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>;
const CategoriesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>;
const AnnouncementsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const ImportExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const DisplayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" /></svg>;

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.FC;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth(); // Use the hook to get user
  const userEmail = user?.email || 'admin@bms-test.com'; // Access user from context

  const navItems: NavItem[] = [
    { path: '/admin', label: 'Dashboard', icon: DashboardIcon },
    { path: '/admin/products', label: 'Products', icon: ProductsIcon },
    { path: '/admin/categories', label: 'Categories', icon: CategoriesIcon },
    { path: '/admin/announcements', label: 'Announcements', icon: AnnouncementsIcon },
    { path: '/admin/settings', label: 'Settings', icon: SettingsIcon },
    { path: '/admin/import', label: 'Import/Export', icon: ImportExportIcon },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleViewDisplay = () => {
    navigate('/');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || 
           (path !== '/admin' && location.pathname.startsWith(path));
  };

  return (
    <div className="admin-layout"> {/* Use class from admin.css */}
      {/* Header */}
      <header className="admin-header"> {/* Use class from admin.css */}
        <div className="admin-header-inner"> {/* Custom class */}
          <div className="admin-header-left"> {/* Custom class */}
            {/* BMS Logo (use the correct src when available) */}
            <img 
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/branding/1_BMS%20white%20Logo.svg`} /* Use White Logo */
              alt="BMS White Logo"
              className="admin-header-logo" /* Custom class */
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <h1 className="admin-header-title">BMS Admin Dashboard</h1> {/* Custom class */}
          </div>
          <div className="admin-header-right"> {/* Custom class */}
            <span className="admin-header-user">{userEmail}</span> {/* Custom class */}
            <button 
              onClick={handleSignOut}
              className="admin-button admin-button-signout" /* Use custom classes */
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="admin-nav"> {/* Use class from admin.css */}
        <div className="container mx-auto px-4"> {/* Keep utils for inner div */}
          <div className="flex flex-wrap items-center"> {/* Keep Tailwind for now */}
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-link ${ /* Use classes from admin.css */
                  isActivePath(item.path)
                    ? 'admin-nav-link-active'
                    : 'admin-nav-link-inactive'
                }`}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-main"> {/* Use class from admin.css */}
        {children}
      </main>

      {/* Footer */}
      <footer className="admin-footer"> {/* Use class from admin.css */}
        <div className="admin-footer-inner"> {/* Custom class for inner content */}
          <div className="admin-footer-left"> {/* Wrapper for text and logo */}
            <img
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/branding/2_BMS_Logo.svg`} /* Use Blue Logo */
              alt="BMS Logo"
              className="admin-footer-logo" /* Custom class */
            />
            <span className="admin-footer-text"> {/* Custom class */}
              BMS Digital Signage Admin © {new Date().getFullYear()}
            </span>
          </div>
          {/* Corrected button structure */}
          <button
            onClick={handleViewDisplay}
            className="admin-button admin-button-dark" /* Use custom classes */
          >
            <DisplayIcon />
            <span>View Display</span>
          </button>
          {/* Removed duplicate closing tag */}
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
