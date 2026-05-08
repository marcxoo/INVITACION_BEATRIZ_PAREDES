
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role if available for deletion policies, otherwise anon

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

async function deleteRecord() {
    console.log("Searching for 'sss'...");

    // First find it to confirm
    const { data: found, error: findError } = await supabase
        .from('invitations')
        .select('*')
        .ilike('family_name', '%sss%');

    if (findError) {
        console.error('Error finding record:', findError);
        return;
    }

    if (!found || found.length === 0) {
        console.log("No record found with name containing 'sss'");
        return;
    }

    console.log(`Found ${found.length} record(s):`, found.map(f => `${f.family_name} (${f.event_slug})`));

    // Delete
    const { error: deleteError } = await supabase
        .from('invitations')
        .delete()
        .ilike('family_name', '%sss%');

    if (deleteError) {
        console.error('Error deleting:', deleteError);
    } else {
        console.log("Successfully deleted record(s) with 'sss'");
    }
}

deleteRecord();
