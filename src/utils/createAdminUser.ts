
import { supabase } from "@/integrations/supabase/client";

// This function can be run from the browser console to create an admin user
export const createAdminUser = async () => {
  // First, sign up the user
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: 'ppk3210@bahan-revisi-3210.com',
    password: 'bellamy',
    options: {
      data: {
        username: 'ppk3210',
        full_name: 'Administrator PPK',
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

// Create standard users with specified usernames
export const createStandardUsers = async () => {
  const users = [
    { username: 'produksi3210', fullName: 'User Produksi' },
    { username: 'distribusi3210', fullName: 'User Distribusi' },
    { username: 'neraca3210', fullName: 'User Neraca' },
    { username: 'ipds3210', fullName: 'User IPDS' },
    { username: 'tu3210', fullName: 'User TU' }
  ];

  const results = [];

  for (const user of users) {
    // Create the user with the specified username and password
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: `${user.username}@bahan-revisi-3210.com`,
      password: 'bps3210',
      options: {
        data: {
          username: user.username,
          full_name: user.fullName,
          role: 'user'
        }
      }
    });

    if (signupError) {
      console.error(`Error creating user ${user.username}:`, signupError);
    } else {
      console.log(`User ${user.username} created successfully:`, signupData);
      results.push(signupData);
    }
  }

  return results;
};

// Run these functions from the console:
// import { createAdminUser, createStandardUsers } from './src/utils/createAdminUser.ts';
// createAdminUser();
// createStandardUsers();
