import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../utils/supabaseClient';
import Papa from 'papaparse';

const ImportExport: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [importType, setImportType] = useState<'products' | 'categories' | 'announcements'>('products');
  const [importStatus, setImportStatus] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(0);
  
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    setImporting(true);
    setImportStatus('Reading CSV file...');
    setImportErrors([]);
    setImportSuccess(0);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data, errors } = results;
        
        if (errors.length > 0) {
          setImportErrors(errors.map(err => `CSV Error: ${err.message} at row ${err.row}`));
          setImporting(false);
          return;
        }
        
        setImportStatus(`Processing ${data.length} rows...`);
        
        try {
          let successCount = 0;
          const errorMessages: string[] = [];
          
          if (importType === 'products') {
            // Process products
            for (const item of data as any[]) {
              try {
                // First, insert the product
                const { data: productData, error: productError } = await supabase
                  .from('products')
                  .insert({
                    name: item.name,
                    description: item.description,
                    category_id: item.category_id,
                    image_url: item.image_url,
                    active: item.active === 'true',
                    featured: item.featured === 'true',
                    special: item.special === 'true'
                  })
                  .select('id');
                
                if (productError) throw productError;
                
                if (productData && productData.length > 0) {
                  // Insert price tiers if provided
                  const priceFields = ['price', 'original_price', 'tier_name'];
                  if (priceFields.some(field => item[field])) {
                    const { error: priceError } = await supabase
                      .from('product_prices')
                      .insert({
                        product_id: productData[0].id,
                        price: parseFloat(item.price),
                        original_price: item.original_price ? parseFloat(item.original_price) : null,
                        tier_name: item.tier_name || 'Retail',
                        currency: item.currency || 'BWP'
                      });
                    
                    if (priceError) throw priceError;
                  }
                }
                
                successCount++;
              } catch (error: any) {
                errorMessages.push(`Error importing product "${item.name}": ${error.message}`);
              }
            }
          } else if (importType === 'categories') {
            // Process categories
            for (const item of data as any[]) {
              try {
                const { error } = await supabase
                  .from('categories')
                  .insert({
                    name: item.name,
                    description: item.description,
                    image_url: item.image_url,
                    icon: item.icon,
                    color: item.color,
                    display_order: item.display_order ? parseInt(item.display_order) : null
                  });
                
                if (error) throw error;
                successCount++;
              } catch (error: any) {
                errorMessages.push(`Error importing category "${item.name}": ${error.message}`);
              }
            }
          } else if (importType === 'announcements') {
            // Process announcements
            for (const item of data as any[]) {
              try {
                const { error } = await supabase
                  .from('announcements')
                  .insert({
                    title: item.title,
                    content: item.content,
                    image_url: item.image_url,
                    type: item.type || 'ticker',
                    active: item.active === 'true',
                    start_date: item.start_date || null,
                    end_date: item.end_date || null
                  });
                
                if (error) throw error;
                successCount++;
              } catch (error: any) {
                errorMessages.push(`Error importing announcement "${item.title}": ${error.message}`);
              }
            }
          }
          
          setImportSuccess(successCount);
          if (errorMessages.length > 0) {
            setImportErrors(errorMessages);
          }
          
        } catch (error: any) {
          setImportErrors([`General error: ${error.message}`]);
        } finally {
          setImporting(false);
          setImportStatus('Import completed');
        }
      },
      error: (error) => {
        setImportErrors([`Failed to parse CSV: ${error.message}`]);
        setImporting(false);
      }
    });
  };
  
  const handleExport = async (type: 'products' | 'categories' | 'announcements') => {
    let data: any[] = [];
    let fileName = '';
    
    try {
      if (type === 'products') {
        const { data: products, error } = await supabase
          .from('products')
          .select('*, product_prices(*), category:categories(name)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform data for CSV
        data = products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          category_id: product.category_id,
          category_name: product.category?.name,
          image_url: product.image_url,
          active: product.active,
          featured: product.featured,
          special: product.special,
          price: product.product_prices?.[0]?.price,
          original_price: product.product_prices?.[0]?.original_price,
          tier_name: product.product_prices?.[0]?.tier_name,
          currency: product.product_prices?.[0]?.currency,
          created_at: product.created_at
        }));
        
        fileName = 'bms-products-export.csv';
      } else if (type === 'categories') {
        const { data: categories, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        data = categories;
        fileName = 'bms-categories-export.csv';
      } else if (type === 'announcements') {
        const { data: announcements, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        data = announcements;
        fileName = 'bms-announcements-export.csv';
      }
      
      // Convert to CSV and download
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error: any) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    }
  };
  
  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold">Import & Export Data</h1>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Import Section */}
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Import Data</h2>
              
              <div className="mb-4">
                <label className="block mb-2">Import Type</label>
                <select
                  value={importType}
                  onChange={(e) => setImportType(e.target.value as any)}
                  className="w-full p-2 border rounded"
                  disabled={importing}
                >
                  <option value="products">Products</option>
                  <option value="categories">Categories</option>
                  <option value="announcements">Announcements</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2">CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  disabled={importing}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              {importing && (
                <div className="my-4 p-3 bg-blue-50 text-blue-700 rounded">
                  <p>{importStatus}</p>
                </div>
              )}
              
              {importSuccess > 0 && (
                <div className="my-4 p-3 bg-green-50 text-green-700 rounded">
                  <p>Successfully imported {importSuccess} {importType}.</p>
                </div>
              )}
              
              {importErrors.length > 0 && (
                <div className="my-4 p-3 bg-red-50 text-red-700 rounded">
                  <p className="font-medium mb-2">Import Errors:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {importErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">CSV Template Format</h3>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                  {importType === 'products' && (
                    <pre>name,description,category_id,image_url,active,featured,special,price,original_price,tier_name,currency</pre>
                  )}
                  {importType === 'categories' && (
                    <pre>name,description,image_url,icon,color,display_order</pre>
                  )}
                  {importType === 'announcements' && (
                    <pre>title,content,image_url,type,active,start_date,end_date</pre>
                  )}
                </div>
              </div>
            </div>
            
            {/* Export Section */}
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Export Data</h2>
              
              <p className="mb-4 text-gray-600">
                Export your data as CSV files for backup or editing in spreadsheet software.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleExport('products')}
                  className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                >
                  Export Products
                </button>
                
                <button
                  onClick={() => handleExport('categories')}
                  className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                >
                  Export Categories
                </button>
                
                <button
                  onClick={() => handleExport('announcements')}
                  className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                >
                  Export Announcements
                </button>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Export Notes</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Products export includes basic price information</li>
                  <li>Dates are exported in ISO format (YYYY-MM-DD)</li>
                  <li>Boolean values are exported as true/false</li>
                  <li>IDs are included for reference only</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ImportExport;