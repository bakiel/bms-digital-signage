import './index.css'; // Import global styles
// import React from 'react'; // Not needed for JSX transform
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'; // Import useNavigate
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from '@admin/components/AdminLayout'; // Use alias
import { initCurrencySettings } from './utils/currencyUtils';

    // Import actual page components
    import Display from './pages/Display';
    import MockDisplay from './pages/MockDisplay';
    import TestImages from './pages/TestImages';
    import Login from '@admin/pages/Login'; // Use alias
    import Dashboard from '@admin/pages/Dashboard'; // Use alias
    import Products from '@admin/pages/Products'; // Use alias
    import Categories from '@admin/pages/Categories'; // Use alias
    import Announcements from '@admin/pages/Announcements'; // Use alias
    import ImportExport from '@admin/pages/ImportExport'; // Use alias
    import Settings from '@admin/pages/Settings'; // Use alias
    import CategoryForm from '@admin/components/CategoryForm'; // Import CategoryForm
    import ProductForm from '@admin/components/ProductForm'; // Import ProductForm

    // Wrapper component for the New Category page to handle navigation
    const NewCategoryPageWrapper = () => {
      const navigate = useNavigate(); // Use hook inside the wrapper

      const handleSave = () => {
        navigate('/admin/categories'); // Navigate back to list on save
      };

      const handleCancel = () => {
        navigate('/admin/categories'); // Navigate back to list on cancel
      };

      return <CategoryForm onSave={handleSave} onCancel={handleCancel} />;
    };

function App() {
  // Initialize settings when the app starts
  useEffect(() => {
    // Initialize currency settings
    initCurrencySettings().catch(error => {
      console.error('Failed to initialize currency settings:', error);
    });
  }, []);

  return (
    <AuthProvider>
      {/* BrowserRouter will be added in main.tsx */}
      <Routes>
              <Route path="/" element={<Display />} />
              <Route path="/mock" element={<MockDisplay />} />
              <Route path="/test-images" element={<TestImages />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout><Dashboard /></AdminLayout> {/* Wrap with AdminLayout */}
                </ProtectedRoute>
              } />
              {/* Add Announcements route */}
               <Route path="/admin/announcements" element={
                <ProtectedRoute>
                  <AdminLayout><Announcements /></AdminLayout> {/* Wrap with AdminLayout */}
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute>
                  <AdminLayout><Products /></AdminLayout> {/* Wrap with AdminLayout */}
                </ProtectedRoute>
              } />
              {/* Add route for editing a product */}
              <Route path="/admin/products/edit/:id" element={
                <ProtectedRoute>
                  <AdminLayout><ProductForm /></AdminLayout> {/* Render ProductForm for editing */}
                </ProtectedRoute>
              } />
              {/* Replace placeholder Categories component with the actual one */}
              <Route path="/admin/categories" element={
                <ProtectedRoute>
                  <AdminLayout><Categories /></AdminLayout> {/* Wrap with AdminLayout */}
                </ProtectedRoute>
              } />
              {/* Add route for creating a new category */}
              <Route path="/admin/categories/new" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <NewCategoryPageWrapper /> {/* Render the wrapper */}
                  </AdminLayout>
                </ProtectedRoute>
              } />
              {/* TODO: Add route for editing a category: /admin/categories/edit/:id */}
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <AdminLayout><Settings /></AdminLayout> {/* Wrap with AdminLayout */}
                </ProtectedRoute>
              } />
              {/* Add route for Import/Export */}
              <Route path="/admin/import" element={
                <ProtectedRoute>
                  <AdminLayout><ImportExport /></AdminLayout>
                </ProtectedRoute>
              } />
          </Routes>
        </AuthProvider>
      );
    }

    export default App;
