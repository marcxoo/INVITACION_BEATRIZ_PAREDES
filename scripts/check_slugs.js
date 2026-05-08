
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSlugs() {
    const { data, error } = await supabase
        .from('invitations')
        .select('id, family_name, event_slug, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    console.log("Total records:", data.length);
    console.log("Sample records:");
    data.forEach(d => {
        console.log(`${d.created_at} - ${d.family_name} [${d.event_slug}]`);
    });
}

checkSlugs();
