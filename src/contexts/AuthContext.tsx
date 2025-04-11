
import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the types
type UserRole = 'admin' | 'user';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface AuthContextProps {
  user: UserProfile | null;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  profile: UserProfile | null;
  signIn: (emailOrUsername: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, username: string) => Promise<boolean>;
  signOut: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAdmin: false,
  login: async () => false,
  logout: () => {},
  loading: false,
  profile: null,
  signIn: async () => false,
  signUp: async () => false,
  signOut: () => {},
});

// Create a custom hook to use the context
export const useAuth = () => useContext(AuthContext);

// Create the provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (emailOrUsername: string, password?: string) => {
    setLoading(true);
    try {
      // Simulate fetching user data from an API or database
      // Here, we'll use hardcoded credentials for simplicity
      const profile = checkHardcodedCredentials(emailOrUsername, password || '');

      if (profile) {
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
        return true;
      } else {
        // Handle login failure
        console.log('Login failed: Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Add these new methods to align with the interface
  const signIn = async (emailOrUsername: string, password: string) => {
    return login(emailOrUsername, password);
  };

  const signUp = async (email: string, password: string, username: string) => {
    console.log('Sign up not implemented yet', { email, password, username });
    // In a real implementation, we would add the user to the database
    return false;
  };

  const signOut = () => {
    logout();
  };

  const hardcodedCredentials = {
    admin: {
      email: 'ppk3210@bahan-revisi-3210.com',
      username: 'ppk3210',
      password: 'bellamy',
      profile: {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'ppk3210',
        full_name: 'Administrator PPK',
        role: 'admin' as UserRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    },
    users: [
      {
        email: 'produksi3210@bahan-revisi-3210.com',
        username: 'produksi3210',
        password: 'bps3210',
        profile: {
          id: '00000000-0000-0000-0000-000000000002',
          username: 'produksi3210',
          full_name: 'User Produksi',
          role: 'user' as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      },
      {
        email: 'distribusi3210@bahan-revisi-3210.com',
        username: 'distribusi3210',
        password: 'bps3210',
        profile: {
          id: '00000000-0000-0000-0000-000000000003',
          username: 'distribusi3210',
          full_name: 'User Distribusi',
          role: 'user' as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      },
      {
        email: 'neraca3210@bahan-revisi-3210.com',
        username: 'neraca3210',
        password: 'bps3210',
        profile: {
          id: '00000000-0000-0000-0000-000000000004',
          username: 'neraca3210',
          full_name: 'User Neraca',
          role: 'user' as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      },
      {
        email: 'ipds3210@bahan-revisi-3210.com',
        username: 'ipds3210',
        password: 'bps3210',
        profile: {
          id: '00000000-0000-0000-0000-000000000005',
          username: 'ipds3210',
          full_name: 'User IPDS',
          role: 'user' as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      },
      {
        email: 'tu3210@bahan-revisi-3210.com',
        username: 'tu3210',
        password: 'bps3210',
        profile: {
          id: '00000000-0000-0000-0000-000000000006',
          username: 'tu3210',
          full_name: 'User TU',
          role: 'user' as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      {
        email: 'sosial3210@bahan-revisi-3210.com',
        username: 'sosial3210',
        password: 'bps3210',
        profile: {
          id: '00000000-0000-0000-0000-000000000007',
          username: 'Elitya Tri Permana',
          full_name: 'User SOSIAL',
          role: 'user' as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
    ]
  };

  const checkHardcodedCredentials = (emailOrUsername: string, password: string) => {
    // Check admin credentials - allow login with either email or username
    if (
      (hardcodedCredentials.admin.email === emailOrUsername || 
       hardcodedCredentials.admin.username === emailOrUsername) && 
      hardcodedCredentials.admin.password === password
    ) {
      return { ...hardcodedCredentials.admin.profile };
    }

    // Check user credentials - allow login with either email or username
    const matchedUser = hardcodedCredentials.users.find(u => 
      (u.email === emailOrUsername || u.username === emailOrUsername) && 
      u.password === password
    );
    
    if (matchedUser) {
      return { ...matchedUser.profile };
    }

    return null;
  };

  const isAdmin = user?.role === 'admin';
  const profile = user; // Add profile for compatibility

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      login, 
      logout, 
      loading, 
      profile, 
      signIn, 
      signUp, 
      signOut 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
