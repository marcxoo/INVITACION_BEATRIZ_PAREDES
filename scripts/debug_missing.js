
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugMissing() {
    const { data, error } = await supabase
        .from('invitations')
        .select('id, family_name, event_slug, confirmed_count')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    console.log("ALL RECORDS:");
    data.forEach(d => {
        console.log(`[${d.event_slug}] ${d.family_name} (Count: ${d.confirmed_count})`);
    });
}

debugMissing();
