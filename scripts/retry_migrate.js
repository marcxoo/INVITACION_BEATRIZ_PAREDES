
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function retryMigrate() {
    console.log("Retrying migration from 'arelys' to 'invitacion-arelys'...");

    const { data, error } = await supabase
        .from('invitations')
        .update({ event_slug: 'invitacion-arelys' })
        .eq('event_slug', 'arelys')
        .select();

    if (error) {
        console.error('Update error:', error);
    } else {
        console.log(`Updated ${data.length} records.`);
        data.forEach(d => console.log(`- ${d.family_name} -> ${d.event_slug}`));
    }
}

retryMigrate();
