const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Faltan credenciales de Supabase en las variables de entorno.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Iniciando latido de mantenimiento para evitar pausa de Supabase...');
    
    // 1. Realizar una lectura para generar tráfico de API
    const { data: readData, error: readError } = await supabase
        .from('invitations')
        .select('id')
        .limit(1);
    
    if (readError) {
        console.error('Error en lectura:', readError.message);
    } else {
        console.log('Lectura de prueba: OK');
    }

    // 2. Realizar una inserción pequeña para generar actividad de escritura
    // Usamos un slug especial 'invitacion-keep-alive' para identificar estos registros
    const { error: insertError } = await supabase
        .from('invitations')
        .insert([{ 
            family_name: 'Mantenimiento Automático (Anti-Pausa)', 
            event_slug: 'invitacion-keep-alive', 
            status: 'confirmed', 
            confirmed_count: 0 
        }]);

    if (insertError) {
        console.error('Error en escritura:', insertError.message);
    } else {
        console.log('Escritura de mantenimiento: OK');
    }

    // 3. Limpiar registros viejos de mantenimiento para no llenar la tabla
    // Borramos registros de 'keep-alive' que tengan más de un mes si existen
    const { error: deleteError } = await supabase
        .from('invitations')
        .delete()
        .eq('event_slug', 'invitacion-keep-alive')
        .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (deleteError) {
        console.error('Error al limpiar registros viejos:', deleteError.message);
    }

    console.log('Mantenimiento completado:', new Date().toISOString());
}

run();
