const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY_ANON;
const supabaseServiceKey = process.env.SUPABASE_KEY_SERVICE;

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase, supabaseService };
