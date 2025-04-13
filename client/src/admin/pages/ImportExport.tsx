import React, { useState, useCallback, DragEvent } from 'react';
import { supabase } from '@/utils/supabaseClient';
import Papa from 'papaparse';

interface CSVParsedData {
  data: any[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

interface ImportResult {
  type: 'success' | 'error' | 'warning';
  message: string;
  details?: string[];
}

const ImportExport: React.FC = () => {
  const [importType, setImportType] = useState<'products' | 'categories' | 'announcements'>('products');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // CSV templates
  const csvTemplates = {
    products: `name,description,category_id,image_url,active,featured,special,price,original_price,tier_name,currency\nGIS Sky Blue Shirt,Short sleeve sky blue shirt for GIS,1,uniforms/shirt-ssleeve-gis-sky-blue.png,true,true,false,149.99,,Size 4,BWP`,
    categories: `name,description,image_url,icon,color,display_order\nSchool Uniforms,School uniforms for various schools,,shirt,#3b82f6,1`,
    announcements: `title,content,image_url,type,active,start_date,end_date\nBack to School Sale,Get up to 20% off on all school uniforms!,,ticker,true,2025-01-01,2025-02-28`
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setResults([]);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setResults([]);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        setResults([{ type: 'error', message: 'Invalid file type. Please drop a CSV file.' }]);
        setFile(null);
      }
    }
  }, []);

  // Parse CSV file
  const parseCSV = (fileToParse: File): Promise<CSVParsedData> => {
    return new Promise((resolve, reject) => {
      Papa.parse(fileToParse, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => resolve(results as CSVParsedData),
        error: (error) => reject(error)
      });
    });
  };

  // Convert string values to appropriate types
  const convertValues = (data: any) => {
    const converted: any = { ...data };

    ['active', 'featured', 'special'].forEach(field => {
      if (typeof converted[field] === 'string') {
        converted[field] = converted[field].toLowerCase() === 'true';
      } else if (typeof converted[field] !== 'boolean') {
         converted[field] = field === 'active'; // Default active to true if not specified
      }
    });

    ['price', 'original_price'].forEach(field => {
       if (converted[field] !== null && converted[field] !== undefined && converted[field] !== '') {
         const num = Number(converted[field]);
         converted[field] = isNaN(num) ? null : num;
       } else {
         converted[field] = null;
       }
    });

    ['category_id', 'display_order'].forEach(field => {
        if (converted[field] !== null && converted[field] !== undefined && converted[field] !== '') {
            const num = parseInt(String(converted[field]), 10);
            converted[field] = isNaN(num) ? null : num;
        } else {
            converted[field] = null;
        }
    });

    ['start_date', 'end_date'].forEach(field => {
        if (converted[field] && !isNaN(new Date(converted[field]).getTime())) {
             converted[field] = new Date(converted[field]).toISOString();
        } else {
            converted[field] = null;
        }
    });

    return converted;
  };

  // Handle import
  const handleImport = async () => {
    if (!file) {
      setResults([{ type: 'error', message: 'Please select a file to import' }]);
      return;
    }

    setImporting(true);
    setResults([]);

    try {
      const parsedData = await parseCSV(file);

      if (parsedData.errors.length > 0) {
        setResults([{
          type: 'error',
          message: 'CSV parsing errors',
          details: parsedData.errors.map(e => `Row ${e.row}: ${e.message}`)
        }]);
        return;
      }

      if (parsedData.data.length === 0) {
        setResults([{ type: 'warning', message: 'The CSV file contains no data rows to import.' }]);
        return;
      }

      switch (importType) {
        case 'products':
          await importProducts(parsedData.data);
          break;
        case 'categories':
          await importCategories(parsedData.data);
          break;
        case 'announcements':
          await importAnnouncements(parsedData.data);
          break;
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setResults([{ type: 'error', message: `Failed to import data: ${err.message || 'Unknown error'}` }]);
    } finally {
      setImporting(false);
    }
  };

  // Import products
  const importProducts = async (data: any[]) => {
    const importResults: ImportResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    const processedData = data.map(convertValues).filter(row => row.name && row.price !== null);

    if (processedData.length !== data.length) {
        importResults.push({ type: 'warning', message: `${data.length - processedData.length} rows skipped due to missing name or price.` });
    }

    if (processedData.length === 0) {
        importResults.push({ type: 'error', message: 'No valid product rows found to import.' });
        setResults(importResults);
        return;
    }

    const productsToUpsert = processedData.map(row => ({
        name: row.name,
        description: row.description || null,
        category_id: row.category_id || null,
        image_url: row.image_url || null,
        active: row.active !== undefined ? row.active : true,
        featured: row.featured !== undefined ? row.featured : false,
        special: row.special !== undefined ? row.special : false
    }));

    const { data: upsertedProducts, error: productUpsertError } = await supabase
        .from('products')
        .upsert(productsToUpsert, { onConflict: 'name' })
        .select('id, name');

    if (productUpsertError) {
        importResults.push({ type: 'error', message: `Error upserting products: ${productUpsertError.message}` });
        setResults(importResults);
        return;
    }

    const productMap = new Map(upsertedProducts?.map(p => [p.name, p.id]));
    const pricesToUpsert = processedData
        .map(row => {
            const productId = productMap.get(row.name);
            if (!productId) return null;
            return {
                product_id: productId,
                tier_name: row.tier_name || null,
                price: row.price,
                original_price: row.original_price || null,
                currency: row.currency || 'BWP'
            };
        })
        .filter(p => p !== null);

    if (pricesToUpsert.length > 0) {
        const { error: priceUpsertError } = await supabase
            .from('product_prices')
            .upsert(pricesToUpsert as any[], { onConflict: 'product_id, tier_name' });

        if (priceUpsertError) {
            importResults.push({ type: 'error', message: `Error upserting prices: ${priceUpsertError.message}` });
        }
    }

    successCount = upsertedProducts?.length || 0;
    errorCount = data.length - successCount - (data.length - processedData.length);

    importResults.push({
      type: errorCount > 0 || importResults.some(r => r.type === 'error') ? 'warning' : 'success',
      message: `Import completed: ${successCount} products processed. Check details for errors.`
    });

    setResults(importResults);
  };

  // Import categories
  const importCategories = async (data: any[]) => {
    const importResults: ImportResult[] = [];
    const processedData = data.map(convertValues).filter(row => row.name);

    if (processedData.length !== data.length) {
        importResults.push({ type: 'warning', message: `${data.length - processedData.length} rows skipped due to missing name.` });
    }

    if (processedData.length === 0) {
        importResults.push({ type: 'error', message: 'No valid category rows found to import.' });
        setResults(importResults);
        return;
    }

    const categoriesToUpsert = processedData.map(row => ({
        name: row.name,
        description: row.description || null,
        image_url: row.image_url || null,
        icon: row.icon || null,
        color: row.color || null,
        display_order: row.display_order || null
    }));

    const { error } = await supabase
        .from('categories')
        .upsert(categoriesToUpsert, { onConflict: 'name' });

    if (error) {
        importResults.push({ type: 'error', message: `Error upserting categories: ${error.message}` });
    } else {
        importResults.push({ type: 'success', message: `Import completed: ${processedData.length} categories processed.` });
    }
    setResults(importResults);
  };

  // Import announcements
  const importAnnouncements = async (data: any[]) => {
    const importResults: ImportResult[] = [];
    const processedData = data.map(convertValues).filter(row => row.title && row.content && row.type && ['ticker', 'slide', 'popup'].includes(row.type));

     if (processedData.length !== data.length) {
        importResults.push({ type: 'warning', message: `${data.length - processedData.length} rows skipped due to missing required fields or invalid type.` });
    }

    if (processedData.length === 0) {
        importResults.push({ type: 'error', message: 'No valid announcement rows found to import.' });
        setResults(importResults);
        return;
    }

    const announcementsToUpsert = processedData.map(row => ({
        title: row.title,
        content: row.content,
        image_url: row.image_url || null,
        type: row.type,
        active: row.active !== undefined ? row.active : true,
        start_date: row.start_date || null,
        end_date: row.end_date || null
    }));

    const { error } = await supabase
        .from('announcements')
        .upsert(announcementsToUpsert, { onConflict: 'title' });

    if (error) {
        importResults.push({ type: 'error', message: `Error upserting announcements: ${error.message}` });
    } else {
        importResults.push({ type: 'success', message: `Import completed: ${processedData.length} announcements processed.` });
    }
    setResults(importResults);
  };

  // Export data
  const handleExport = async (type: 'products' | 'categories' | 'announcements') => {
    setExporting(type);
    setResults([]);

    try {
      let dataToExport: any[] = [];
      let fileName = `bms_${type}_export_${new Date().toISOString().split('T')[0]}.csv`;

      switch (type) {
        case 'products':
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select(`*, prices:product_prices(*)`);
          if (productsError) throw productsError;
          dataToExport = products.map(p => {
            const price = p.prices?.[0];
            return {
              name: p.name, description: p.description, category_id: p.category_id, image_url: p.image_url,
              active: p.active, featured: p.featured, special: p.special,
              price: price?.price ?? '', original_price: price?.original_price ?? '',
              tier_name: price?.tier_name ?? '', currency: price?.currency ?? ''
            };
          });
          break;
        case 'categories':
          const { data: categories, error: categoriesError } = await supabase.from('categories').select('*');
          if (categoriesError) throw categoriesError;
          dataToExport = categories;
          break;
        case 'announcements':
          const { data: announcements, error: announcementsError } = await supabase.from('announcements').select('*');
          if (announcementsError) throw announcementsError;
          dataToExport = announcements;
          break;
      }

      if (dataToExport.length === 0) {
          setResults([{ type: 'warning', message: `No ${type} found to export.` }]);
          return;
      }

      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error('Export error:', err);
      setResults([{ type: 'error', message: `Failed to export data: ${err.message || 'Unknown error'}` }]);
    } finally {
      setExporting(null);
    }
  };

  // Download template
  const downloadTemplate = (type: 'products' | 'categories' | 'announcements') => {
    const template = csvTemplates[type];
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bms_${type}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render success, warning, or error icon based on result type
  const renderResultIcon = (type: 'success' | 'error' | 'warning') => {
    if (type === 'success') {
      return (
        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else if (type === 'warning') {
      return (
        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className="product-page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Import & Export Data</h1>
      </div>
      
      <div className="form-container">
        <p className="dashboard-subtitle">Import data from CSV files or export data to CSV format</p>
        
        <div className="import-export-grid">
          {/* Import Section */}
          <div className="import-export-section">
            <h3 className="import-export-section-title">Import Data</h3>
            <p className="import-export-section-description">
              Import data from a CSV file. Download a template to see the required format.
            </p>

            <div className="import-export-content">
              <div className="form-group">
                <label htmlFor="import-type" className="form-label">Import Type</label>
                <select
                  id="import-type"
                  name="import-type"
                  className="form-select"
                  value={importType}
                  onChange={(e) => setImportType(e.target.value as any)}
                  disabled={importing}
                >
                  <option value="products">Products</option>
                  <option value="categories">Categories</option>
                  <option value="announcements">Announcements</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">CSV File</label>
                <div
                  className={`file-dropzone ${isDragging ? 'file-dropzone-dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="file-dropzone-content">
                    <svg
                      className="file-dropzone-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="file-dropzone-text">
                      <label htmlFor="file-upload" className="file-dropzone-label">
                        <span>Select CSV file</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          accept=".csv" 
                          onChange={handleFileChange} 
                          disabled={importing} 
                        />
                      </label>
                      <p className="file-dropzone-or">{isDragging ? 'Drop the file here' : 'or drag and drop'}</p>
                    </div>
                    <p className="file-dropzone-hint">CSV files only</p>
                  </div>
                </div>
                {file && (
                  <div className="file-selected-info">
                    Selected file: <span className="file-selected-name">{file.name}</span> 
                    <span className="file-selected-size">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={handleImport} 
                  disabled={importing || !file} 
                  className="admin-button admin-button-primary"
                >
                  {importing ? (
                    <>
                      <svg className="loading-spinner-small" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : 'Import Data'}
                </button>
                <button 
                  type="button" 
                  onClick={() => downloadTemplate(importType)} 
                  className="admin-button admin-button-secondary"
                >
                  <svg className="download-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="import-export-section">
            <h3 className="import-export-section-title">Export Data</h3>
            <p className="import-export-section-description">
              Export your data to CSV format for backup or editing.
            </p>
            
            <div className="import-export-content">
              <div className="export-buttons">
                {['products', 'categories', 'announcements'].map((type) => (
                  <button 
                    key={type}
                    type="button" 
                    onClick={() => handleExport(type as any)} 
                    disabled={exporting === type} 
                    className="admin-button admin-button-secondary export-button"
                  >
                    {exporting === type ? (
                      <>
                        <svg className="loading-spinner-small" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Exporting {type.charAt(0).toUpperCase() + type.slice(1)}...
                      </>
                    ) : (
                      <>
                        <svg className="download-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Export {type.charAt(0).toUpperCase() + type.slice(1)}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Import Results */}
        {results.length > 0 && (
          <div className="import-results">
            <h3 className="import-export-section-title">Import Results</h3>
            <div className="import-results-list">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`alert ${
                    result.type === 'success' ? 'alert-success' :
                    result.type === 'warning' ? 'alert-warning' :
                    'alert-error'
                  }`}
                >
                  <div className="alert-icon">
                    {renderResultIcon(result.type)}
                  </div>
                  <div className="alert-content">
                    <p className="alert-message">{result.message}</p>
                    {result.details && result.details.length > 0 && (
                      <ul className="alert-details">
                        {result.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportExport;
