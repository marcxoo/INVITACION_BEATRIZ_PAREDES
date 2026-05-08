
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use Service Role Key to bypass any RLS policies just in case
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error("No SERVICE_ROLE_KEY found in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearRosita() {
    console.log("Clearing all records for 'invitacion-rosita-maria'...");

    // First count them
    const { count, error: countError } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('event_slug', 'invitacion-rosita-maria');

    if (countError) {
        console.error('Count error:', countError);
        return;
    }

    console.log(`Found ${count} records to delete.`);

    if (count === 0) return;

    // Delete
    const { error: deleteError } = await supabase
        .from('invitations')
        .delete()
        .eq('event_slug', 'invitacion-rosita-maria');

    if (deleteError) {
        console.error('Delete error:', deleteError);
    } else {
        console.log("Successfully deleted all Rosita Maria records.");
    }
}

clearRosita();
