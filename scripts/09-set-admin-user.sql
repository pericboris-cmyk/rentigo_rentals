-- Setze den Benutzer peric.boris@hotmail.com als Admin
-- Dieses Script macht den spezifischen Benutzer zum Administrator

-- Aktualisiere den Benutzer zur Admin-Rolle
UPDATE users 
SET role = 'admin', 
    updated_at = NOW()
WHERE email = 'peric.boris@hotmail.com';

-- Bestätige die Änderung
SELECT id, email, full_name, role, created_at, updated_at 
FROM users 
WHERE email = 'peric.boris@hotmail.com';

-- Falls der Benutzer noch nicht in der users-Tabelle existiert, erstelle ihn
-- (Dies sollte normalerweise während der Registrierung geschehen)
INSERT INTO users (id, email, role, created_at, updated_at)
SELECT 
    id,
    email,
    'admin' as role,
    now() as created_at,
    now() as updated_at
FROM auth.users
WHERE email = 'peric.boris@hotmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    updated_at = now();

-- Finale Überprüfung
SELECT 
    u.id, 
    u.email, 
    u.full_name, 
    u.role,
    u.created_at,
    au.email_confirmed_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'peric.boris@hotmail.com';
