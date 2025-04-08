
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates an admin user if one does not already exist
 */
export const createAdminUser = async () => {
  console.log('Checking for existing admin user...');
  
  // First, check if we already have an admin user
  const { data: existingAdmins, error: queryError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('role', 'admin')
    .limit(1);
  
  if (queryError) {
    console.error('Error checking for admin users:', queryError);
    return;
  }
  
  // If we already have an admin, no need to create one
  if (existingAdmins && existingAdmins.length > 0) {
    console.log('Admin user already exists');
    return;
  }
  
  console.log('No admin user found, creating one...');
  
  // Create admin user
  const adminEmail = 'admin@bahanrevisi.com';
  const adminPassword = 'Admin123!';
  
  try {
    // First try to create the user
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: 'Admin User',
          role: 'admin'
        }
      }
    });
    
    if (signupError) {
      console.error('Error creating admin user:', signupError);
      return;
    }
    
    if (authData.user) {
      console.log('Admin user created successfully with ID:', authData.user.id);
      
      // Create the user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          username: adminEmail,
          full_name: 'Admin User',
          role: 'admin'
        }]);
      
      if (profileError) {
        console.error('Error creating admin profile:', profileError);
      } else {
        console.log('Admin profile created successfully');
      }
    }
  } catch (error) {
    console.error('Unexpected error creating admin user:', error);
  }
};

// Export other database population functions here
