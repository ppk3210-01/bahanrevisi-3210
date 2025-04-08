
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Creates an admin user if one does not already exist
 */
export const createAdminUser = async () => {
  console.log('Checking for existing admin user...');
  
  try {
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
    
    // Admin credentials
    const adminEmail = 'admin@bahanrevisi.com';
    const adminPassword = 'Admin123!';
    
    // Check if auth user already exists first
    const { data, error: getUserError } = await supabase.auth.admin.listUsers();
    
    if (getUserError) {
      console.error('Error checking for existing users:', getUserError);
      return;
    }
    
    // Fix the typing issue by properly checking the users array
    const users = data?.users || [];
    const existingUser = users.find(user => user.email === adminEmail);
    
    if (existingUser) {
      console.log('Admin auth user already exists, ensuring profile exists');
      
      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', existingUser.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking for admin profile:', profileError);
      }
      
      // If profile doesn't exist, create it
      if (!profileData) {
        const { error: insertProfileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: existingUser.id,
            username: adminEmail,
            full_name: 'Admin User',
            role: 'admin'
          }]);
        
        if (insertProfileError) {
          console.error('Error creating admin profile for existing user:', insertProfileError);
        } else {
          console.log('Created admin profile for existing user');
        }
      }
      
      return;
    }
    
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
        toast({
          title: "Admin user created",
          description: "Admin user has been created successfully"
        });
      }
    }
  } catch (error) {
    console.error('Unexpected error creating admin user:', error);
  }
};

// Export other database population functions here
