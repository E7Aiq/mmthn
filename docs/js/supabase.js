import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://hswidotyrnlvkkeddszn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzd2lkb3R5cm5sdmtrZWRkc3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3Njg2NDQsImV4cCI6MjA5NjM0NDY0NH0.H_xibI87OI0Vj_ae_Y_TwPuljQYH0NEQSFWkTM0BL1M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
