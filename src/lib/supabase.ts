import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache client instance
let cachedClient: SupabaseClient | null = null;
let lastUrl: string | null = null;
let lastKey: string | null = null;

/**
 * Retrieves the active Supabase credentials from environment or localStorage.
 */
export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Check localStorage overrides if running in browser
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('nailedit_supabase_url');
    const localKey = localStorage.getItem('nailedit_supabase_anon_key');
    if (localUrl && localKey) {
      url = localUrl;
      anonKey = localKey;
    }
  }

  const isConfigured = Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 20);
  return { url, anonKey, isConfigured };
}

/**
 * Returns the configured Supabase client, or null if credentials are not yet set.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  // Reuse existing client if credentials match
  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Persists custom Supabase credentials to localStorage.
 */
export function setSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nailedit_supabase_url', url.trim());
    localStorage.setItem('nailedit_supabase_anon_key', anonKey.trim());
  }
  // Reset cache
  cachedClient = null;
  lastUrl = null;
  lastKey = null;
}

/**
 * Clears custom Supabase credentials from localStorage.
 */
export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nailedit_supabase_url');
    localStorage.removeItem('nailedit_supabase_anon_key');
  }
  cachedClient = null;
  lastUrl = null;
  lastKey = null;
}

/**
 * Tests connection to the Supabase database.
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  tableCount?: number;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials are not configured. Please supply your Project URL and Anon API Key.',
    };
  }

  try {
    // Attempt a light query to test access
    const { error } = await client.from('clients').select('id', { count: 'exact', head: true });
    
    if (error) {
      // If table doesn't exist yet, it still connects to the project!
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! The database tables have not been created yet. Please execute the SQL schema in the Supabase SQL Editor.',
          tableCount: 0,
        };
      }
      return {
        success: false,
        message: `Supabase query failed: ${error.message} (Code: ${error.code})`,
      };
    }

    return {
      success: true,
      message: 'Connected to Supabase successfully! Cloud persistence is active.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection error: ${err?.message || 'Unknown network error'}`,
    };
  }
}
