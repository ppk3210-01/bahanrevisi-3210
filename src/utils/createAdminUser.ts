
import { supabase } from "@/integrations/supabase/client";

// This function can be run from the browser console to create an admin user
export const createAdminUser = async () => {
  // First, sign up the user
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: 'admin@bahan-revisi-3210.com',
    password: 'admin3210!',
    options: {
      data: {
        username: 'admin',
        full_name: 'Administrator',
        role: 'admin'
      }
    }
  });

  if (signupError) {
    console.error('Error creating admin user:', signupError);
    return;
  }

  console.log('Admin user created successfully:', signupData);
  return signupData;
};

// This function can be run from the browser console to create a standard user
export const createStandardUser = async () => {
  // Create the user with the specified username and password
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: 'sosial3210@bahan-revisi-3210.com',
    password: 'bps3210@',
    options: {
      data: {
        username: 'sosial 3210',
        full_name: 'User Sosial',
        role: 'user'
      }
    }
  });

  if (signupError) {
    console.error('Error creating standard user:', signupError);
    return;
  }

  console.log('Standard user created successfully:', signupData);
  return signupData;
};

// Run these functions from the console:
// import { createAdminUser, createStandardUser } from './src/utils/createAdminUser.ts';
// createAdminUser();
// createStandardUser();
