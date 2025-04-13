import { supabase } from './supabaseClient';

export interface Settings {
  id: number;
  display_duration: number;
  transition_duration: number;
  enable_auto_rotation: boolean;
  default_currency: string;
  store_timezone: string;
  store_location: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
}

// Default settings to use if no settings are found in the database
export const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'updated_at'> = {
  display_duration: 10,
  transition_duration: 1,
  enable_auto_rotation: true,
  default_currency: 'BWP',
  store_timezone: 'Africa/Gaborone',
  store_location: 'Gaborone, Botswana',
  logo_url: '',
  primary_color: '#1e3a8a',
  secondary_color: '#2563eb'
};

/**
 * Fetches the application settings from the database
 * Always returns a settings object, using defaults if no settings are found
 */
export async function getSettings(): Promise<Settings> {
  try {
    // Fetch all settings records
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('id', { ascending: true })
      .limit(1);
    
    if (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
    
    // If we have settings data, return the first record
    if (data && data.length > 0) {
      return data[0] as Settings;
    }
    
    // If no settings exist, return default values with ID 1
    return {
      id: 1,
      ...DEFAULT_SETTINGS,
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    
    // Return default settings in case of error
    return {
      id: 1,
      ...DEFAULT_SETTINGS,
      updated_at: new Date().toISOString()
    };
  }
}

/**
 * Updates the application settings in the database
 * @param settings The settings to save
 */
export async function updateSettings(settings: Partial<Settings>): Promise<{ success: boolean; error?: any }> {
  try {
    // First check if any settings exist
    const { data: existingSettings, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    let settingsId = 1; // Default ID
    
    // If settings exist, use the ID of the first record
    if (existingSettings && existingSettings.length > 0) {
      settingsId = existingSettings[0].id;
    }
    
    // Now upsert with the correct ID
    const { error } = await supabase
      .from('settings')
      .upsert({
        id: settingsId,
        ...settings,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, error };
  }
}
