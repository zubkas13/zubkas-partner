import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://isvocrjxyehcgiqwhusp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzdm9jcmp4eWVoY2dpcXdodXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MTQ4NjUsImV4cCI6MjEwOTM5MDg2NX0.grxMYxxNuM6srpW6OWt-6Hi-ap70G2HLUrMMA9MHWX8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
