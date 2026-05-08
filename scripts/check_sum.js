
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSum() {
    const { data, error } = await supabase
        .from('invitations')
        .select('confirmed_count, family_name')
        .eq('event_slug', 'invitacion-arelys');

    if (error) {
        console.error(error);
        return;
    }

    const total = data.reduce((acc, curr) => acc + (curr.confirmed_count || 0), 0);

    console.log("Records found:", data.length);
    console.log("Total People (confirmed_count sum):", total);

    data.forEach(d => console.log(`- ${d.family_name}: ${d.confirmed_count}`));
}

checkSum();
