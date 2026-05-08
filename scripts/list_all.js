
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listAll() {
    const { data, error } = await supabase
        .from('invitations')
        .select('id, family_name, event_slug, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error(error);
        return;
    }

    console.log("Most recent 50 records:");
    data.forEach(d => {
        console.log(`[${d.event_slug}] ${d.family_name} (${d.created_at})`);
    });
}

listAll();
