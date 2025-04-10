
import { supabase } from "@/integrations/supabase/client";

// This function can be run from the browser console to create admin user
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

// Add these users to local storage for offline login
export const setupLocalUsers = () => {
  const adminUser = {
    email: 'admin@bps3210.id',
    username: 'ppk3210',
    password: 'bellamy',
    profile: {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'ppk3210',
      full_name: 'Administrator PPK',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  };

  const standardUsers = [
    {
      email: 'produksi3210@bps3210.id',
      username: 'produksi3210',
      password: 'bps3210',
      profile: {
        id: '00000000-0000-0000-0000-000000000002',
        username: 'produksi3210',
        full_name: 'User Produksi',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    },
    {
      email: 'distribusi3210@bps3210.id',
      username: 'distribusi3210',
      password: 'bps3210',
      profile: {
        id: '00000000-0000-0000-0000-000000000003',
        username: 'distribusi3210',
        full_name: 'User Distribusi',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    },
    {
      email: 'neraca3210@bps3210.id',
      username: 'neraca3210',
      password: 'bps3210',
      profile: {
        id: '00000000-0000-0000-0000-000000000004',
        username: 'neraca3210',
        full_name: 'User Neraca',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    },
    {
      email: 'ipds3210@bps3210.id',
      username: 'ipds3210',
      password: 'bps3210',
      profile: {
        id: '00000000-0000-0000-0000-000000000005',
        username: 'ipds3210',
        full_name: 'User IPDS',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    },
    {
      email: 'tu3210@bps3210.id',
      username: 'tu3210',
      password: 'bps3210',
      profile: {
        id: '00000000-0000-0000-0000-000000000006',
        username: 'tu3210',
        full_name: 'User TU',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  ];

  // Store credentials in localStorage
  const credentials = [
    {
      email: adminUser.email,
      password: adminUser.password,
      profileId: adminUser.profile.id
    },
    ...standardUsers.map(user => ({
      email: user.email,
      password: user.password,
      profileId: user.profile.id
    }))
  ];

  localStorage.setItem('app.credentials', JSON.stringify(credentials));

  // Store profiles
  const profiles = [
    adminUser.profile,
    ...standardUsers.map(user => user.profile)
  ];

  localStorage.setItem('app.users', JSON.stringify(profiles));

  console.log('Local users set up successfully');
  return { adminUser, standardUsers };
};

// Run these functions from the console:
// import { createAdminUser, createStandardUsers, setupLocalUsers } from './src/utils/createAdminUser.ts';
// createAdminUser();
// createStandardUsers();
// setupLocalUsers();
