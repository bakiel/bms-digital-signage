import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/utils/supabaseClient';
import ImageManager from './ImageManager'; // Assuming this uses admin.css or is self-contained
import ImageUploader from './ImageUploader'; // Assuming this uses admin.css or is self-contained
import { 
  FiLoader, FiAlertCircle, FiCheckCircle, FiImage, FiX, FiPlus, FiDollarSign, FiPackage, FiTag, FiToggleRight, FiSave, FiArrowLeft
  // Removed unused: FiUpload, FiFolderPlus, FiGlobe
} from 'react-icons/fi'; // Icons remain

// Define available currencies
const AVAILABLE_CURRENCIES = ['BWP', 'ZAR', 'USD', 'GBP', 'EUR'];

// Interfaces remain the same
interface Category { id: string; name: string; }
interface PriceTier { id?: string; tier_name: string; price: number; original_price: number|null; currency: string; }
interface ProductFormData {
  name: string; description: string; category_id: string; image_url: string;
  active: boolean; featured: boolean; special: boolean; prices: PriceTier[];
}

const ProductForm: React.FC = () => {
  // State and logic remain the same
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '', description: '', category_id: '', image_url: '',
    active: true, featured: false, special: false,
    prices: [{ tier_name: '', price: 0, original_price: null, currency: AVAILABLE_CURRENCIES[0] }] // Default to first currency
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  useEffect(() => { (async () => {
    try {
      setLoading(true);
      const { data: cats, error: catErr } = await supabase.from('categories').select('id,name').order('name');
      if (catErr) throw catErr;
      setCategories(cats || []);
      if (isEditMode && id) {
        const { data: prod, error: prodErr } = await supabase.from('products').select('*, prices:product_prices(*)').eq('id', id).single();
        if (prodErr) throw prodErr;
        setFormData({
          name: prod.name || '', description: prod.description || '', category_id: prod.category_id || '',
          image_url: prod.image_url || '', active: prod.active ?? true, featured: prod.featured ?? false, special: prod.special ?? false,
          prices: prod.prices?.length ? prod.prices.map((p: any) => ({
            id: p.id, tier_name: p.tier_name || '', price: p.price || 0, original_price: p.original_price || null, currency: p.currency || 'BWP'
          })) : [{ tier_name: '', price: 0, original_price: null, currency: 'BWP' }]
        });
      }
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  })(); }, [id, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); setSuccess(null);
  };
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
    setError(null); setSuccess(null);
  };
  const handlePriceChange = (i:number, field:keyof PriceTier, value:any) => {
    const prices = [...formData.prices];
    prices[i] = { ...prices[i], [field]: value };
    setFormData({ ...formData, prices }); setError(null); setSuccess(null);
  };
  const addPriceTier = () => setFormData({ ...formData, prices: [...formData.prices, { tier_name:'', price:0, original_price:null, currency: AVAILABLE_CURRENCIES[0] }] }); // Default new tiers
  const removePriceTier = (i:number) => {
    if(formData.prices.length<=1) return;
    const prices = [...formData.prices]; prices.splice(i,1);
    setFormData({ ...formData, prices });
  };
  const handleImageSelection = useCallback((path:string) => {
    setFormData(f => ({...f, image_url:path})); 
    setSuccess('Image selected'); setTimeout(()=>setSuccess(null),2000);
  },[]);
  const handleImageUpload = useCallback((path:string) => {
    setFormData(f => ({...f, image_url:path})); setSuccess('Image uploaded'); setTimeout(()=>setSuccess(null),2000);
  },[]);
  const handleClearImage = () => setFormData(f => ({...f, image_url:''}));

  const handleSubmit = async(e:React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true); setError(null); setSuccess(null);
      if(!formData.name.trim()) throw new Error('Product name required');
      if(!formData.category_id) throw new Error('Select a category');
      for(const [i,tier] of formData.prices.entries()){
        if(tier.price<=0) throw new Error(`Price > 0 for tier ${i+1}`);
        if(tier.original_price!==null && tier.original_price<=tier.price) throw new Error(`Original price > price for tier ${i+1}`);
      }
      if(formData.special && !formData.prices.some(t=>t.original_price!==null)) throw new Error('Specials need original price');
      if(isEditMode && id){
        const { error:upErr } = await supabase.from('products').update({
          name:formData.name, description:formData.description, category_id:formData.category_id, image_url:formData.image_url,
          active:formData.active, featured:formData.featured, special:formData.special
        }).eq('id',id);
        if(upErr) throw upErr;
        for(const tier of formData.prices){
          if(tier.id){
            const { error } = await supabase.from('product_prices').update({
              tier_name:tier.tier_name, price:tier.price, original_price:tier.original_price, currency:tier.currency
            }).eq('id',tier.id);
            if(error) throw error;
          } else {
            const { error } = await supabase.from('product_prices').insert({
              product_id:id, tier_name:tier.tier_name, price:tier.price, original_price:tier.original_price, currency:tier.currency
            });
            if(error) throw error;
          }
        }
        const { data:dbPrices, error:fetchErr } = await supabase.from('product_prices').select('id').eq('product_id',id);
        if(fetchErr) throw fetchErr;
        const formIds = formData.prices.map(p=>p.id).filter(Boolean);
        const toDelete = dbPrices.filter((p:any)=>!formIds.includes(p.id)).map((p:any)=>p.id);
        if(toDelete.length){
          const { error } = await supabase.from('product_prices').delete().in('id',toDelete);
          if(error) throw error;
        }
        setSuccess('Product updated');
      } else {
        const { data:newProd, error:insErr } = await supabase.from('products').insert({
          name:formData.name, description:formData.description, category_id:formData.category_id, image_url:formData.image_url,
          active:formData.active, featured:formData.featured, special:formData.special
        }).select('id').single();
        if(insErr) throw insErr;
        const priceRows = formData.prices.map(t=>({
          product_id:newProd.id, tier_name:t.tier_name, price:t.price, original_price:t.original_price, currency:t.currency
        }));
        const { error:priceErr } = await supabase.from('product_prices').insert(priceRows);
        if(priceErr) throw priceErr;
        setSuccess('Product created');
        navigate(`/admin/products/edit/${newProd.id}`);
      }
    } catch(e:any){ setError(e.message||'Save failed'); } finally{ setSubmitting(false); }
  };

  // Refactored JSX using admin.css classes
  return (
    // Use a general container class if available, or just style directly
    <div className="form-container"> 
      {/* Header - Assuming a standard header style isn't in admin.css for forms, keep simple */}
      <h2 className="form-title"> 
        <FiPackage style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> {/* Inline style for icon spacing */}
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </h2>

      {loading ? (
        <div className="loading-indicator">
          <FiLoader className="loading-spinner" />
          <p className="loading-text">Loading product data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Error/success messages */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}> {/* Inline style for margin */}
              <div className="alert-icon"><FiAlertCircle /></div>
              <div className="alert-content"><p>{error}</p></div>
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}> {/* Inline style for margin */}
              <div className="alert-icon"><FiCheckCircle /></div>
              <div className="alert-content"><p>{success}</p></div>
            </div>
          )}
          
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
              {/* Product Details Section */}
              <div className="form-section">
                 <h3 className="form-section-title"><FiTag style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/>Product Details</h3>
                 <div className="form-group">
                   <label htmlFor="name" className="form-label">Name <span style={{ color: 'red' }}>*</span></label>
                   <input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="form-input"/>
                 </div>
                 <div className="form-group">
                   <label htmlFor="category_id" className="form-label">Category <span style={{ color: 'red' }}>*</span></label>
                   <select id="category_id" name="category_id" value={formData.category_id} onChange={handleInputChange} required className="form-select">
                     <option value="">Select category</option>
                     {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
                 <div className="form-group">
                   <label htmlFor="description" className="form-label">Description</label>
                   <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} className="form-textarea" placeholder="Enter product description..."/>
                 </div>
              </div>

              {/* Status Section */}
              <div className="form-section">
                <h3 className="form-section-title"><FiToggleRight style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/>Product Status</h3>
                <div className="checkbox-group">
                  {[ { name: 'active', label: 'Active', desc: 'Visible on signage' }, { name: 'featured', label: 'Featured', desc: 'Highlight product' }, { name: 'special', label: 'Special Offer', desc: 'Show discount' } ].map(toggle => (
                    <div key={toggle.name} className="checkbox-item">
                       <input type="checkbox" name={toggle.name} id={toggle.name} checked={formData[toggle.name as keyof ProductFormData] as boolean} onChange={handleCheckboxChange} />
                       <label htmlFor={toggle.name} className="checkbox-label">
                         <span className="checkbox-label-text">{toggle.label}</span>
                         <span className="checkbox-label-description">{toggle.desc}</span>
                       </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Pricing Section */}
              <div className="form-section">
                <h3 className="form-section-title"><FiDollarSign style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/>Pricing</h3>
                {formData.prices.map((tier, i) => (
                  <div key={i} className="price-tier">
                    <div className="price-tier-header">
                      <h4 className="price-tier-title">{tier.tier_name || `Price Tier ${i + 1}`}</h4>
                      {formData.prices.length > 1 && (
                        <button type="button" onClick={() => removePriceTier(i)} className="price-tier-remove">
                          <FiX />
                        </button>
                      )}
                    </div>
                    <div className="price-tier-grid">
                      <div className="form-group">
                        <label htmlFor={`tier_name_${i}`} className="form-label">Tier Name/Size (optional)</label>
                        <input id={`tier_name_${i}`} type="text" placeholder="e.g., Size 4, Small" value={tier.tier_name} onChange={e=>handlePriceChange(i,'tier_name',e.target.value)} className="form-input"/>
                      </div>
                      <div className="form-group">
                        <label htmlFor={`price_${i}`} className="form-label">Price (BWP) <span style={{ color: 'red' }}>*</span></label>
                        <input id={`price_${i}`} type="number" placeholder="0.00" value={tier.price} onChange={e=>handlePriceChange(i,'price',parseFloat(e.target.value)||0)} min="0" step="0.01" required className="form-input"/>
                      </div>
                      <div className="form-group">
                        <label htmlFor={`original_price_${i}`} className="form-label">Original Price (BWP) {formData.special && <span style={{ color: 'red' }}>*</span>}</label>
                        <input id={`original_price_${i}`} type="number" placeholder={formData.special ? "Required for specials" : "Optional"} value={tier.original_price??''} onChange={e=>handlePriceChange(i,'original_price',e.target.value?parseFloat(e.target.value):null)} min="0" step="0.01" required={formData.special} className="form-input"/>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}> {/* Inline style for hint */}
                          {formData.special ? "Required for special offers" : "Leave empty if not on special"}
                        </p>
                      </div>
                       <div className="form-group">
                         <label htmlFor={`currency_${i}`} className="form-label">Currency</label>
                         <select 
                            id={`currency_${i}`} 
                            value={tier.currency} 
                            onChange={e=>handlePriceChange(i,'currency',e.target.value)} 
                            className="form-select"
                         >
                            {AVAILABLE_CURRENCIES.map(curr => (
                              <option key={curr} value={curr}>{curr}</option>
                            ))}
                         </select>
                       </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addPriceTier} className="add-price-tier-button">
                  <FiPlus /> Add Another Price Tier
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
              {/* Product Image Section */}
              <div className="form-section">
                <h3 className="form-section-title"><FiImage style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/>Product Image</h3>
                
                {/* Let ImageManager handle preview and selection button */}
                <div className="form-group">
                 <label className="form-label">Select or Upload Image</label>
                 {/* ImageManager renders its own preview and "Select Image" button */}
                 {/* Pass handleClearImage to the new onDelete prop */}
                 <ImageManager 
                    currentImage={formData.image_url} 
                    onSelect={handleImageSelection} 
                    onDelete={handleClearImage} 
                    bucket="products" 
                 /> 
              </div>

              {/* Separator or distinct section for Upload */}
                <div className="form-group" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                   <label className="form-label">Upload New Image</label>
                   {/* ImageUploader provides the upload interface */}
                   <ImageUploader bucket="products" onUploadComplete={handleImageUpload} />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={()=>navigate('/admin/products')} className="admin-button admin-button-secondary">
              <FiArrowLeft style={{ marginRight: '0.5rem' }}/>Cancel
            </button>
            <button type="submit" disabled={submitting} className="admin-button admin-button-primary">
              <FiSave style={{ marginRight: '0.5rem' }}/>{submitting?'Saving...':'Save Product'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductForm;
