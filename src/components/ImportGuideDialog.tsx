
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// This component is used to create initial user accounts
// It doesn't render anything visible in the UI
const ImportGuideDialog: React.FC = () => {
  useEffect(() => {
    const createInitialUsers = async () => {
      try {
        // Define the users to create
        const users = [
          {
            email: 'ppk.bps3210@gmail.com',
            password: 'bellamy',
            full_name: 'Andries Kurniawan',
            role: 'admin',
            username: 'PPK3210'
          },
          {
            email: 'sosial3210@example.com',
            password: 'BPS3210',
            full_name: 'Elitya Tri Permana',
            role: 'user',
            username: 'SOSIAL3210'
          },
          {
            email: 'produksi3210@example.com',
            password: 'BPS3210',
            full_name: 'Deni Sarantika',
            role: 'user',
            username: 'PRODUKSI3210'
          },
          {
            email: 'distribusi3210@example.com',
            password: 'BPS3210',
            full_name: 'Devane S.W',
            role: 'user',
            username: 'DISTRIBUSI3210'
          },
          {
            email: 'neraca3210@example.com',
            password: 'BPS3210',
            full_name: 'Fenty Jimika',
            role: 'user',
            username: 'NERACA3210'
          },
          {
            email: 'ipds3210@example.com',
            password: 'BPS3210',
            full_name: 'Aep Saepudin',
            role: 'user',
            username: 'IPDS3210'
          },
          {
            email: 'tu3210@example.com',
            password: 'BPS3210',
            full_name: 'Nia Kania',
            role: 'user',
            username: 'TU3210'
          }
        ];

        // Create each user
        for (const user of users) {
          // Check if user exists
          const { data: existingUsers } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('username', user.username);

          if (existingUsers && existingUsers.length > 0) {
            console.log(`User ${user.username} already exists, skipping.`);
            continue;
          }

          // Create the user with email
          const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
              data: {
                full_name: user.full_name,
                role: user.role,
                username: user.username
              }
            }
          });

          if (error) {
            console.error(`Error creating user ${user.username}:`, error);
          } else {
            console.log(`User ${user.username} created successfully.`);
          }
        }
      } catch (error) {
        console.error('Error creating initial users:', error);
      }
    };

    // Run once on component mount
    createInitialUsers();
  }, []);

  return null;
};

export default ImportGuideDialog;
