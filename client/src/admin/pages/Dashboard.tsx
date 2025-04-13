import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/utils/supabaseClient'; // Use alias
// import AdminLayout from '../../components/admin/AdminLayout'; // Unused import

// Component for summary cards that show count and link to section
interface SummaryCardProps {
  title: string;
  count: number;
  linkTo: string;
  linkText: string;
  color: string;
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  count, 
  linkTo, 
  linkText, 
  color,
  icon
}) => (
  <div className="dashboard-summary-card"> {/* Use class from admin.css */}
    <div className="dashboard-summary-card-header"> {/* Use class from admin.css */}
      <div>
        <h3 className="dashboard-summary-card-title">{title}</h3> {/* Use class from admin.css */}
        {/* Apply color class dynamically */}
        <p className={`dashboard-summary-card-count ${color.replace('text-', 'dashboard-count-')}`}>{count}</p>
      </div>
      {icon && <div className="dashboard-summary-card-icon">{icon}</div>} {/* Use class from admin.css */}
    </div>
    <Link
      to={linkTo}
      className="dashboard-summary-card-link" /* Use class from admin.css */
    >
      {linkText} →
    </Link>
  </div>
);

// Component for action buttons
interface ActionButtonProps {
  title: string;
  linkTo: string;
  bgColor: string;
  icon?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  title, 
  linkTo, 
  bgColor,
  icon
}) => (
  <Link
    to={linkTo}
    // Apply background color class dynamically
    className={`dashboard-action-button dashboard-action-bg-${bgColor.split('-')[1]}`} /* Use classes from admin.css */
  >
    <div className="dashboard-action-button-content"> {/* Use class from admin.css */}
      {icon && <div className="dashboard-action-button-icon">{icon}</div>} {/* Use class from admin.css */}
      <span className="dashboard-action-button-text">{title}</span> {/* Use class from admin.css */}
    </div>
  </Link>
);

// Icons
const ProductIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> {/* Remove size class, handled by admin.css */}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> {/* Remove size class, handled by admin.css */}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const AnnouncementIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> {/* Remove size class, handled by admin.css */}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const Dashboard: React.FC = () => {
  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    announcements: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // Fetch counts from Supabase
        const [productsResponse, categoriesResponse, announcementsResponse] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact' }),
          supabase.from('categories').select('id', { count: 'exact' }),
          supabase.from('announcements').select('id', { count: 'exact' })
        ]);
        
        if (productsResponse.error) throw new Error(productsResponse.error.message);
        if (categoriesResponse.error) throw new Error(categoriesResponse.error.message);
        if (announcementsResponse.error) throw new Error(announcementsResponse.error.message);
        
        setCounts({
          products: productsResponse.count || 0,
          categories: categoriesResponse.count || 0,
          announcements: announcementsResponse.count || 0
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, []);

  return (
      <div className="dashboard-container"> {/* Use class from admin.css */}
        {/* Dashboard Header */}
        <div className="dashboard-header"> {/* Use class from admin.css */}
          <h1 className="dashboard-title">Dashboard</h1> {/* Use class from admin.css */}
          <p className="dashboard-subtitle">Manage your digital signage content</p> {/* Use class from admin.css */}
        </div>
        
        {loading ? (
          <div className="dashboard-loading"> {/* Use class from admin.css */}
            <svg className="dashboard-loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> {/* Use class from admin.css */}
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="dashboard-loading-text">Loading dashboard data...</p> {/* Use class from admin.css */}
          </div>
        ) : error ? (
          <div className="dashboard-error-container"> {/* Use class from admin.css */}
            <div className="dashboard-error"> {/* Use class from admin.css */}
              <div className="flex-shrink-0"> {/* Keep utility if needed */}
                <svg className="dashboard-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> {/* Use class from admin.css */}
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div> {/* Remove ml-3 */}
                <p className="dashboard-error-text"> {/* Use class from admin.css */}
                  {error}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {/* Summary Cards */}
            <div className="dashboard-grid dashboard-summary-grid"> {/* Use classes from admin.css */}
              <SummaryCard 
                title="Products" 
                count={counts.products} 
                linkTo="/admin/products" 
                linkText="Manage Products" 
                color="text-blue-600"
                icon={<ProductIcon />}
              />
              <SummaryCard 
                title="Categories" 
                count={counts.categories} 
                linkTo="/admin/categories" 
                linkText="Manage Categories" 
                color="text-green-600"
                icon={<CategoryIcon />}
              />
              <SummaryCard 
                title="Announcements" 
                count={counts.announcements} 
                linkTo="/admin/announcements" 
                linkText="Manage Announcements" 
                color="text-yellow-600"
                icon={<AnnouncementIcon />}
              />
            </div>
            
            {/* Quick Actions */}
            {/* Quick Actions */}
            <div className="dashboard-actions-section"> {/* Use class from admin.css */}
              <h2 className="dashboard-actions-title">Quick Actions</h2> {/* Use class from admin.css */}
              <div className="dashboard-grid dashboard-actions-grid"> {/* Use classes from admin.css */}
                <ActionButton 
                  title="Add New Product" 
                  linkTo="/admin/products" 
                  bgColor="bg-blue-600"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                />
                <ActionButton 
                  title="Add New Category" 
                  linkTo="/admin/categories/new" 
                  bgColor="bg-green-600"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                />
                <ActionButton 
                  title="Add Announcement" 
                  linkTo="/admin/announcements" 
                  bgColor="bg-yellow-600"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                />
                <ActionButton 
                  title="System Settings" 
                  linkTo="/admin/settings" 
                  bgColor="bg-purple-600"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
                {/* Added View Display as an ActionButton */}
                <ActionButton
                  title="View Display"
                  linkTo="/"
                  bgColor="bg-gray-800"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  }
                />
              </div>
            </div>
          </>
        )}
      </div>
  );
};

export default Dashboard;
