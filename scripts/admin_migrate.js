
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// USE SERVICE ROLE KEY TO BYPASS RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error("No SERVICE_ROLE_KEY found!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function adminMigrate() {
    console.log("Migrating 'arelys' to 'invitacion-arelys' using SERVICE ROLE...");

    const { data, error } = await supabase
        .from('invitations')
        .update({ event_slug: 'invitacion-arelys' })
        .eq('event_slug', 'arelys')
        .select();

    if (error) {
        console.error('Update error:', error);
    } else {
        console.log(`Successfully updated ${data.length} records.`);
        data.forEach(d => console.log(`- ${d.family_name}`));
    }
}

adminMigrate();
