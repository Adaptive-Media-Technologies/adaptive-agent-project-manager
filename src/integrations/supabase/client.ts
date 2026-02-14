import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pdzbejpiilgwgqhmbrso.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ixQOWUd9wszPJNc2f2rj0A_yTBWd2_J';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
