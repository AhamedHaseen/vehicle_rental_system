import { createClient } from '@supabase/supabase-js';

// Read from env or localStorage
const getSavedCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem('rentflow_supabase_url');
  const localKey = localStorage.getItem('rentflow_supabase_anon_key');

  const url = (localUrl || envUrl || '').trim();
  const key = (localKey || envKey || '').trim();

  return { url, key };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSavedCredentials();

export const isSupabaseConfigured = () => {
  const { url, key } = getSavedCredentials();
  return Boolean(
    url && 
    key && 
    url.startsWith('https://') && 
    !url.includes('your-project-id') &&
    key.length > 20
  );
};

export const createSupabaseClientInstance = (customUrl, customKey) => {
  const url = customUrl || supabaseUrl;
  const key = customKey || supabaseAnonKey;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

export const supabase = isSupabaseConfigured() 
  ? createSupabaseClientInstance(supabaseUrl, supabaseAnonKey) 
  : null;

// Function to save new Supabase credentials and reload
export const saveSupabaseCredentials = (url, key) => {
  if (url) localStorage.setItem('rentflow_supabase_url', url.trim());
  if (key) localStorage.setItem('rentflow_supabase_anon_key', key.trim());
  window.location.reload();
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('rentflow_supabase_url');
  localStorage.removeItem('rentflow_supabase_anon_key');
  window.location.reload();
};

// Test connection
export const testSupabaseConnection = async (testUrl, testKey) => {
  try {
    const testClient = createClient(testUrl, testKey);
    const { data, error } = await testClient.from('vehicles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's connected to Supabase but needs schema
      if (error.message?.includes('relation "public.vehicles" does not exist')) {
        return { success: true, message: 'Connected to Supabase! (Note: Run supabase_schema.sql to create tables)' };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected and verified database!' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection failed' };
  }
};
