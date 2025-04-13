import React, { useState } from 'react';
import { getSettings, updateSettings, DEFAULT_SETTINGS } from '@/utils/settingsUtils';

interface SettingsFormData {
  displayDuration: number;
  transitionDuration: number;
  enableAutoRotation: boolean;
  defaultCurrency: string;
  storeTimezone: string;
  storeLocation: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SettingsFormData>({
    displayDuration: 10,
    transitionDuration: 1,
    enableAutoRotation: true,
    defaultCurrency: 'BWP',
    storeTimezone: 'Africa/Gaborone',
    storeLocation: 'Gaborone, Botswana',
    logoUrl: '',
    primaryColor: '#1e3a8a',
    secondaryColor: '#2563eb'
  });

  // Fetch settings on component mount
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        const settings = await getSettings();

        // Add a check to ensure settings object is valid (though getSettings should handle this)
        if (!settings || typeof settings.id === 'undefined') {
            throw new Error('Received invalid settings data.');
        }
        
        setFormData({
          displayDuration: settings.display_duration,
          transitionDuration: settings.transition_duration,
          enableAutoRotation: settings.enable_auto_rotation,
          defaultCurrency: settings.default_currency,
          storeTimezone: settings.store_timezone,
          storeLocation: settings.store_location,
          logoUrl: settings.logo_url || '',
          primaryColor: settings.primary_color,
          secondaryColor: settings.secondary_color
        });
      } catch (err: any) {
        console.error('Error fetching settings:', err);
        
        // Provide a more user-friendly error message if settings fail to load
        setError(
          'Failed to load settings from the database. This might be due to a connection issue or a problem with the settings table structure. ' +
          'Default values are being used. Please ensure the database is configured correctly. ' +
          `Original error: ${err.message || 'Unknown error'}`
        );
        
        // Use default values if there's an error
        console.log('Using default settings due to error.');
        setFormData({
          displayDuration: DEFAULT_SETTINGS.display_duration,
          transitionDuration: DEFAULT_SETTINGS.transition_duration,
          enableAutoRotation: DEFAULT_SETTINGS.enable_auto_rotation,
          defaultCurrency: DEFAULT_SETTINGS.default_currency,
          storeTimezone: DEFAULT_SETTINGS.store_timezone,
          storeLocation: DEFAULT_SETTINGS.store_location,
          logoUrl: DEFAULT_SETTINGS.logo_url || '',
          primaryColor: DEFAULT_SETTINGS.primary_color,
          secondaryColor: DEFAULT_SETTINGS.secondary_color
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear success/error messages when form is changed
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setSuccess(false);
      setError(null);
      
      const result = await updateSettings({
        display_duration: formData.displayDuration,
        transition_duration: formData.transitionDuration,
        enable_auto_rotation: formData.enableAutoRotation,
        default_currency: formData.defaultCurrency,
        store_timezone: formData.storeTimezone,
        store_location: formData.storeLocation,
        logo_url: formData.logoUrl || '',
        primary_color: formData.primaryColor,
        secondary_color: formData.secondaryColor
      });
      
      if (!result.success) {
        throw result.error || new Error('Unknown error');
      }
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">System Settings</h2>
        <p className="dashboard-subtitle">Configure global settings for your digital signage system</p>
      </div>
      
      {/* Loading Indicator */}
      {loading && !error && (
        <div className="dashboard-loading">
          <svg className="dashboard-loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="dashboard-loading-text">Loading settings...</p>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="dashboard-error-container">
          <div className="dashboard-error">
            <div className="flex-shrink-0">
              <svg className="dashboard-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="dashboard-error-text">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="alert alert-success">
          <div className="alert-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="alert-content">
            <p>Settings saved successfully!</p>
          </div>
        </div>
      )}
      
      {/* Settings Form */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* Display Settings Section */}
          <div className="form-section">
            <h3 className="form-section-title">Display Settings</h3>
            <p className="form-section-description">Configure how content is displayed on digital signage screens.</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="displayDuration" className="form-label">
                  Display Duration (seconds)
                </label>
                <div className="form-input-wrapper">
                  <input
                    type="number"
                    name="displayDuration"
                    id="displayDuration"
                    min="1"
                    max="60"
                    className="form-input"
                    value={formData.displayDuration}
                    onChange={handleInputChange}
                  />
                </div>
                <p className="form-help-text">How long each slide is displayed before transitioning.</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="transitionDuration" className="form-label">
                  Transition Duration (seconds)
                </label>
                <div className="form-input-wrapper">
                  <input
                    type="number"
                    name="transitionDuration"
                    id="transitionDuration"
                    min="0.1"
                    max="5"
                    step="0.1"
                    className="form-input"
                    value={formData.transitionDuration}
                    onChange={handleInputChange}
                  />
                </div>
                <p className="form-help-text">Duration of transition animation between slides.</p>
              </div>
            </div>
            
            <div className="form-group">
              <div className="form-checkbox">
                <input
                  id="enableAutoRotation"
                  name="enableAutoRotation"
                  type="checkbox"
                  checked={formData.enableAutoRotation}
                  onChange={handleInputChange}
                />
                <div>
                  <label htmlFor="enableAutoRotation" className="form-label">Enable Auto-Rotation</label>
                  <p className="form-help-text">Automatically rotate through slides in the display.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Store Settings Section */}
          <div className="form-section">
            <h3 className="form-section-title">Store Settings</h3>
            <p className="form-section-description">Configure store-specific settings.</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="defaultCurrency" className="form-label">
                  Default Currency
                </label>
                <div className="form-input-wrapper">
                  <select
                    id="defaultCurrency"
                    name="defaultCurrency"
                    className="form-select"
                    value={formData.defaultCurrency}
                    onChange={handleInputChange}
                  >
                    <option value="BWP">Botswana Pula (BWP)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="ZAR">South African Rand (ZAR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="storeTimezone" className="form-label">
                  Store Timezone
                </label>
                <div className="form-input-wrapper">
                  <select
                    id="storeTimezone"
                    name="storeTimezone"
                    className="form-select"
                    value={formData.storeTimezone}
                    onChange={handleInputChange}
                  >
                    <option value="Africa/Gaborone">Africa/Gaborone</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                    <option value="Africa/Lagos">Africa/Lagos</option>
                    <option value="Africa/Nairobi">Africa/Nairobi</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="storeLocation" className="form-label">
                Store Location
              </label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  name="storeLocation"
                  id="storeLocation"
                  className="form-input"
                  value={formData.storeLocation}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          {/* Branding Settings Section */}
          <div className="form-section">
            <h3 className="form-section-title">Branding Settings</h3>
            <p className="form-section-description">Configure branding and appearance settings.</p>
            
            <div className="form-group">
              <label htmlFor="logoUrl" className="form-label">
                Logo URL
              </label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  name="logoUrl"
                  id="logoUrl"
                  className="form-input"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                />
              </div>
              <p className="form-help-text">URL to your store logo image. Recommended size: 200x60px.</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="primaryColor" className="form-label">
                  Primary Color
                </label>
                <div className="form-color-input-wrapper">
                  <input
                    type="color"
                    name="primaryColor"
                    id="primaryColor"
                    className="form-color-picker"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    aria-label="Primary color hex value"
                    className="form-input"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="secondaryColor" className="form-label">
                  Secondary Color
                </label>
                <div className="form-color-input-wrapper">
                  <input
                    type="color"
                    name="secondaryColor"
                    id="secondaryColor"
                    className="form-color-picker"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    aria-label="Secondary color hex value"
                    className="form-input"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="admin-button admin-button-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
