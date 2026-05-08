const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fonbczonxolkusygojpz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbmJjem9ueG9sa3VzeWdvanB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExNTYyMiwiZXhwIjoyMDg2NjkxNjIyfQ.rPgHLlsiFNQAblfTytvIUNBV8y2IIJ2OcOzNML3BTdU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    // Try to query information_schema (might fail due to permissions)
    // Or check if we can query a non-existent table to see the error, or just try common names

    // Actually, let's just try to select from 'rosita_invitations' to see if it exists
    const { data, error } = await supabase.from('rosita_invitations').select('*').limit(1);

    if (error) {
        console.log("rosita_invitations does not look accessible/existing:", error.message);
    } else {
        console.log("rosita_invitations EXISTS!");
    }
}

listTables();
