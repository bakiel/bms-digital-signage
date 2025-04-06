import React from 'react';
    import { BrowserRouter, Routes, Route } from 'react-router-dom';
    import { AuthProvider } from './context/AuthContext';
    import ProtectedRoute from './components/ProtectedRoute';
    import AdminLayout from './components/admin/AdminLayout'; // Import AdminLayout

    // Import actual page components
    import Display from './pages/Display';
    import MockDisplay from './pages/MockDisplay';
    import TestImages from './pages/TestImages';
    import Login from './pages/admin/Login';
    import Dashboard from './pages/admin/Dashboard';
    import Products from './pages/admin/Products';
    import Categories from './pages/admin/Categories';
    import Announcements from './pages/admin/Announcements';
    import ImportExport from './pages/admin/ImportExport'; // Import ImportExport

    // Simple styled components without TailwindCSS
    // const Categories = () => <div style={{ padding: '20px' }}>Categories Page</div>; // Removed placeholder
    const Settings = () => <div style={{ padding: '20px' }}>Settings Page</div>;

    function App() {
      return (
        <AuthProvider>
          <BrowserRouter>
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
              {/* Replace placeholder Categories component with the actual one */}
              <Route path="/admin/categories" element={
                <ProtectedRoute>
                  <AdminLayout><Categories /></AdminLayout> {/* Wrap with AdminLayout */}
                </ProtectedRoute>
              } />
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
          </BrowserRouter>
        </AuthProvider>
      );
    }

    export default App;
