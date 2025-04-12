
import { supabase } from '@/integrations/supabase/client';

export const createSosialUser = async () => {
  try {
    // Check if the user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', 'sosial3210@example.com')
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', checkError);
      return;
    }
    
    if (existingUser) {
      console.log('User sosial3210 already exists');
      return;
    }
    
    // Create the user
    const { data, error } = await supabase.auth.signUp({
      email: 'sosial3210@example.com',
      password: 'bps3210',
      options: {
        data: {
          full_name: 'Sosial User',
          username: 'sosial3210',
          role: 'user'
        }
      }
    });
    
    if (error) {
      console.error('Error creating user:', error.message);
      return;
    }
    
    console.log('Successfully created user sosial3210');
    return data;
  } catch (error) {
    console.error('Unexpected error creating user:', error);
  }
};
