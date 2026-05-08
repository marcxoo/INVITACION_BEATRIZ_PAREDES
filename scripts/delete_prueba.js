
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deletePruebaRecords() {
    console.log("Searching for 'prueba'...");

    // First find them
    const { data: found, error: findError } = await supabase
        .from('invitations')
        .select('*')
        .ilike('family_name', '%prueba%');

    if (findError) {
        console.error('Error finding records:', findError);
        return;
    }

    if (!found || found.length === 0) {
        console.log("No records found with name containing 'prueba'");
        return;
    }

    console.log(`Found ${found.length} record(s):`);
    found.forEach(f => console.log(`- ${f.family_name} (${f.event_slug})`));

    // Delete
    const { error: deleteError } = await supabase
        .from('invitations')
        .delete()
        .ilike('family_name', '%prueba%');

    if (deleteError) {
        console.error('Error deleting:', deleteError);
    } else {
        console.log("Successfully deleted record(s) with 'prueba'");
    }
}

deletePruebaRecords();
