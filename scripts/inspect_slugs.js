
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSlugs() {
    const { data, error } = await supabase
        .from('invitations')
        .select('id, event_slug');

    if (error) {
        console.error(error);
        return;
    }

    console.log("Inspecting slugs:");
    data.forEach(d => {
        if (d.event_slug && d.event_slug.includes('arelys')) {
            console.log(`'${d.event_slug}' (Length: ${d.event_slug.length})`);
        }
    });
}

inspectSlugs();
