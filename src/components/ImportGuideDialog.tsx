
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
            email: 'PPK3210',
            password: 'bellamy',
            full_name: 'Andries Kurniawan',
            role: 'admin'
          },
          {
            email: 'SOSIAL3210',
            password: 'BPS3210',
            full_name: 'Elitya Tri Permana',
            role: 'user'
          },
          {
            email: 'PRODUKSI3210',
            password: 'BPS3210',
            full_name: 'Deni Sarantika',
            role: 'user'
          },
          {
            email: 'DISTRIBUSI3210',
            password: 'BPS3210',
            full_name: 'Devane S.W',
            role: 'user'
          },
          {
            email: 'NERACA3210',
            password: 'BPS3210',
            full_name: 'Fenty Jimika',
            role: 'user'
          },
          {
            email: 'IPDS3210',
            password: 'BPS3210',
            full_name: 'Aep Saepudin',
            role: 'user'
          },
          {
            email: 'TU3210',
            password: 'BPS3210',
            full_name: 'Nia Kania',
            role: 'user'
          }
        ];

        // Create each user
        for (const user of users) {
          // Check if user exists
          const { data: existingUsers } = await supabase
            .from('user_profiles')
            .select('username')
            .eq('username', user.email);

          if (existingUsers && existingUsers.length > 0) {
            console.log(`User ${user.email} already exists, skipping.`);
            continue;
          }

          // Create the user
          const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
              data: {
                full_name: user.full_name,
                role: user.role
              }
            }
          });

          if (error) {
            console.error(`Error creating user ${user.email}:`, error);
          } else {
            console.log(`User ${user.email} created successfully.`);
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
