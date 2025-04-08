
// This is a script to create an admin user via Supabase API
// This would normally be run server-side or in a secure environment
// For demonstration, we'll create this file, but you would use the Supabase dashboard 
// to create the admin user in a real application

/*
To create an admin user:

1. Go to https://supabase.com/dashboard/project/vodfnexxrevgrxmmaksy/auth/users
2. Click "Create user"
3. Enter email: admin@bahanrevisi.com
4. Enter password: Admin123!
5. Click "Create user"
6. Go to SQL Editor (https://supabase.com/dashboard/project/vodfnexxrevgrxmmaksy/sql/new)
7. Run the following SQL:

UPDATE public.user_profiles
SET role = 'admin'
WHERE username = 'admin@bahanrevisi.com';

This will give the admin@bahanrevisi.com user admin privileges.
*/

// Admin credentials:
// Email: admin@bahanrevisi.com
// Password: Admin123!
