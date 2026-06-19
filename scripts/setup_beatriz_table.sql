-- ============================================================
-- TABLA EXCLUSIVA PARA BEATRIZ PAREDES
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- 1. Crear la tabla
CREATE TABLE IF NOT EXISTS beatriz_rsvp (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  family_name     text NOT NULL,
  guest_limit     integer DEFAULT 1,
  confirmed_count integer DEFAULT 0,
  status          text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  view_key        text,          -- slug de la invitación personalizada
  is_public       boolean DEFAULT false,
  phone           text,
  created_at      timestamptz DEFAULT now()
);

-- 2. Habilitar Row Level Security
ALTER TABLE beatriz_rsvp ENABLE ROW LEVEL SECURITY;

-- 3. Políticas públicas (anon puede leer, insertar y borrar sus propios registros)
CREATE POLICY "beatriz_select" ON beatriz_rsvp
  FOR SELECT USING (true);

CREATE POLICY "beatriz_insert" ON beatriz_rsvp
  FOR INSERT WITH CHECK (true);

CREATE POLICY "beatriz_delete" ON beatriz_rsvp
  FOR DELETE USING (true);

-- ============================================================
-- MIGRACIÓN OPCIONAL: copiar invitados existentes de Beatriz
-- desde la tabla compartida 'invitations' a la nueva tabla.
-- Solo ejecutar si ya tienes registros previos en 'invitations'.
-- ============================================================

/*
INSERT INTO beatriz_rsvp (
  id, family_name, guest_limit, confirmed_count, status,
  view_key, is_public, phone, created_at
)
SELECT
  id, family_name, guest_limit, confirmed_count, status,
  view_key, is_public, phone, created_at
FROM invitations
WHERE event_slug = 'invitacion-beatriz-paredes';
*/

-- ============================================================
-- SIEMBRA DE INVITADOS PERSONALIZADOS (ejemplo)
-- Agrega aquí los slugs de cada familia invitada.
-- Cada fila = un link único: /invitacion/<view_key>
-- ============================================================

/*
INSERT INTO beatriz_rsvp (family_name, view_key, guest_limit, status) VALUES
  ('Familia García',    'garcia-001',   4, 'pending'),
  ('Familia Rodríguez', 'rodriguez-002', 3, 'pending'),
  ('Juan y María',      'juan-maria-003', 2, 'pending');
*/
