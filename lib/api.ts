import { supabase } from './supabaseClient';

// This is a custom fetch wrapper that automatically adds the Supabase auth token.
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // Get the current session from Supabase.
  const { data: { session } } = await supabase.auth.getSession();

  // --- THIS IS THE FIX ---
  // We explicitly define the type of 'headers' as a flexible string-to-string map.
  const headers: { [key: string]: string } = {
    // We still include any headers passed in the original options
    ...(options.headers as { [key: string]: string }),
    // And we set our default Content-Type
    'Content-Type': 'application/json',
  };
  // -----------------------

  // If a session exists, add the Authorization header.
  // TypeScript now understands that adding this property is allowed.
  if (session) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // Perform the fetch call with the original options and the new headers.
  const response = await fetch(url, {
    ...options,
    headers, // Pass our new, correctly typed headers object
  });

  return response;
};