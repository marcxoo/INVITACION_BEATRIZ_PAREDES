
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function forceMigrate() {
    console.log("Fetching 'arelys' records...");

    const { data, error } = await supabase
        .from('invitations')
        .select('id, family_name, event_slug')
        .eq('event_slug', 'arelys');

    if (error) {
        console.error('Fetch error:', error);
        return;
    }

    console.log(`Found ${data.length} records to update.`);

    for (const record of data) {
        console.log(`Updating ${record.family_name} (${record.id})...`);
        const { error: updateError } = await supabase
            .from('invitations')
            .update({ event_slug: 'invitacion-arelys' })
            .eq('id', record.id); // Update by ID

        if (updateError) {
            console.error(`Failed to update ${record.family_name}:`, updateError);
        } else {
            console.log(`OK: ${record.family_name}`);
        }
    }
}

forceMigrate();
