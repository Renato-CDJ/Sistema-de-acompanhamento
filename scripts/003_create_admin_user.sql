-- Create the initial Super Admin user
-- This script creates a user in Supabase Auth and a corresponding profile

-- First, create the auth user (you'll need to run this with service role key)
-- The password will be: qualidade@$.

-- Insert into auth.users (this requires service role privileges)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@empresa.com',
  crypt('qualidade@$.', gen_salt('bf')), -- Password: qualidade@$.
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Super Admin"}',
  false,
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Create the profile for the admin user
-- Note: This will be created automatically by the trigger, but we can ensure it exists
INSERT INTO public.profiles (
  id,
  email,
  name,
  role,
  cargo,
  permissions,
  blocked,
  created_at
)
SELECT 
  id,
  'admin@empresa.com',
  'Super Admin',
  'super_admin',
  'Administrador',
  '{"admin":true,"users":true,"carteiras":true,"treinamentos":true,"desligamentos":true,"operadores":true,"agentes":true,"qualidade":true,"capacitacao":true,"chat":true,"documentos":true,"agendas":true,"quadro":true,"apuracaoTIA":true,"relatorioMonitorias":true,"controleAgentes":true}'::jsonb,
  false,
  now()
FROM auth.users
WHERE email = 'admin@empresa.com'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'super_admin',
  permissions = '{"admin":true,"users":true,"carteiras":true,"treinamentos":true,"desligamentos":true,"operadores":true,"agentes":true,"qualidade":true,"capacitacao":true,"chat":true,"documentos":true,"agendas":true,"quadro":true,"apuracaoTIA":true,"relatorioMonitorias":true,"controleAgentes":true}'::jsonb;
