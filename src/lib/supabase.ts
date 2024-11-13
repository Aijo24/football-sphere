import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iayeyrbwangzyxbkeomt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWV5cmJ3YW5nenl4Ymtlb210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczNDI0NzIsImV4cCI6MjA0MjkxODQ3Mn0.6rU2o1-L2EWydsfwvNRppSeWjhs1lF0e5Q8ZtemAAsQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 