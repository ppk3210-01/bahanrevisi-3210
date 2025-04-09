
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserProfile, AuthResponse } from '@/types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (emailOrUsername: string, password: string) => Promise<AuthResponse | void>;
  signUp: (email: string, password: string, username: string) => Promise<AuthResponse | void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

// Define UserRole type since it was missing
type UserRole = 'admin' | 'user';

// Hardcoded users for direct access without database dependency
const HARDCODED_USERS = {
  admin: {
    email: 'admin@bps3210.id',
    username: 'admin',
    password: 'bps3210admin',
    profile: {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'admin',
      full_name: 'Administrator',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  sosial: {
    email: 'sosial@bps3210.id',
    username: 'sosial3210',
    password: 'bps3210@',
    profile: {
      id: '00000000-0000-0000-0000-000000000002',
      username: 'sosial3210',
      full_name: 'Elitya Tri Permana',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  produksi: {
    email: 'produksi@bps3210.id',
    username: 'produksi3210',
    password: 'bps3210@',
    profile: {
      id: '00000000-0000-0000-0000-000000000003',
      username: 'produksi3210',
      full_name: 'Deni Sarantika',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  distribusi: {
    email: 'distribusi@bps3210.id',
    username: 'distribusi3210',
    password: 'bps3210@',
    profile: {
      id: '00000000-0000-0000-0000-000000000004',
      username: 'distribusi3210',
      full_name: 'Devane S.W',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  ipds: {
    email: 'ipds@bps3210.id',
    username: 'ipds3210',
    password: 'bps3210@',
    profile: {
      id: '00000000-0000-0000-0000-000000000005',
      username: 'ipds3210',
      full_name: 'Aep Saepudin',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  neraca: {
    email: 'neraca@bps3210.id',
    username: 'neraca3210',
    password: 'bps3210@',
    profile: {
      id: '00000000-0000-0000-0000-000000000006',
      username: 'neraca3210',
      full_name: 'Fenty Jimika',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  tu: {
    email: 'tu@bps3210.id',
    username: 'tu3210',
    password: 'bps3210@',
    profile: {
      id: '00000000-0000-0000-0000-000000000007',
      username: 'tu3210',
      full_name: 'Nia Kania',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  ppk: {
    email: 'ppk@bps3210.id',
    username: 'ppk3210',
    password: 'bellamy',
    profile: {
      id: '00000000-0000-0000-0000-000000000008',
      username: 'ppk3210',
      full_name: 'Andries Kurniawan',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Declare all state variables at the top level of the component
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Define other functions
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      console.log('User profile data:', data);
      if (data) {
        setProfile(data);
        setIsAdmin(data.role === 'admin');
        
        // Store in local storage for persistence
        localStorage.setItem('app.profile', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      setLoading(true);
      console.log('Signing in with:', emailOrUsername);
      
      // Check if the input is a username or email by checking for @
      const isEmail = emailOrUsername.includes('@');
      let matchedUser = null;
      
      // Check for hardcoded users first
      if (emailOrUsername === HARDCODED_USERS.admin.email || 
          emailOrUsername === HARDCODED_USERS.admin.username) {
        if (password === HARDCODED_USERS.admin.password) {
          matchedUser = HARDCODED_USERS.admin;
        }
      } else if (emailOrUsername === HARDCODED_USERS.user.email || 
                 emailOrUsername === HARDCODED_USERS.user.username) {
        if (password === HARDCODED_USERS.user.password) {
          matchedUser = HARDCODED_USERS.user;
        }
      } else {
        // Check if the user exists in local storage
        const storedCredentials = JSON.parse(localStorage.getItem('app.credentials') || '[]');
        const storedUsers = JSON.parse(localStorage.getItem('app.users') || '[]');
        
        // Find by email or username
        const matchedCredential = storedCredentials.find((cred: any) => 
          (isEmail && cred.email === emailOrUsername) || 
          (!isEmail && storedUsers.find((u: any) => 
            u.id === cred.profileId && u.username.toLowerCase() === emailOrUsername.toLowerCase()
          ))
        );
        
        if (matchedCredential && matchedCredential.password === password) {
          const matchedStoredProfile = storedUsers.find(
            (u: any) => u.id === matchedCredential.profileId
          );
          
          if (matchedStoredProfile) {
            matchedUser = {
              email: matchedCredential.email,
              password,
              profile: matchedStoredProfile
            };
          }
        }
      }
      
      if (matchedUser) {
        console.log('Login successful with user:', matchedUser.email || matchedUser.username);
        
        // Create a fake session and user for the frontend
        const fakeSession = {
          access_token: `fake-token-${Date.now()}`,
          refresh_token: `fake-refresh-${Date.now()}`,
          expires_at: Date.now() + 3600 * 1000,
          user: {
            id: matchedUser.profile.id,
            email: matchedUser.email,
            user_metadata: {
              username: matchedUser.profile.username,
              full_name: matchedUser.profile.full_name,
              role: matchedUser.profile.role
            }
          }
        };
        
        // Store auth data
        setSession(fakeSession as any);
        setUser(fakeSession.user as any);
        setProfile(matchedUser.profile as any);
        setIsAdmin(matchedUser.profile.role === 'admin');
        
        // Store in local storage for persistence
        localStorage.setItem('app.session', JSON.stringify(fakeSession));
        localStorage.setItem('app.user', JSON.stringify(fakeSession.user));
        localStorage.setItem('app.profile', JSON.stringify(matchedUser.profile));
        
        toast({
          title: "Login successful",
          description: "You have been logged in successfully",
        });
        
        return { user: fakeSession.user, session: fakeSession } as any;
      }
      
      // If no hardcoded match and it's an email, try Supabase authentication as fallback
      if (isEmail) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ 
            email: emailOrUsername, 
            password 
          });
          
          if (error) {
            throw error;
          }

          console.log('Supabase login successful:', data);
          
          // Store session and user
          setSession(data.session);
          setUser(data.user);
          
          // Store in local storage for persistence
          if (data.session) {
            localStorage.setItem('app.session', JSON.stringify(data.session));
            localStorage.setItem('app.user', JSON.stringify(data.user));
          }
          
          // Fetch user profile
          if (data.user) {
            await fetchUserProfile(data.user.id);
          }
          
          toast({
            title: "Login successful",
            description: "You have been logged in successfully",
          });
          
          return data;
        } catch (supabaseError) {
          console.error('Supabase authentication error:', supabaseError);
        }
      }
      
      // If we reach here, authentication failed
      toast({
        title: "Login failed",
        description: "Invalid login credentials",
        variant: "destructive",
      });
      throw new Error("Invalid login credentials");
      
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      console.log('Signing up with:', email, username);
      
      // If trying to sign up with hardcoded credentials, show success but don't actually create account
      if (email === HARDCODED_USERS.admin.email || email === HARDCODED_USERS.user.email) {
        toast({
          title: "Registration successful",
          description: "This account already exists. Please login instead.",
        });
        return;
      }
      
      // Check if email already exists in local storage
      const storedCredentials = JSON.parse(localStorage.getItem('app.credentials') || '[]');
      const emailExists = storedCredentials.some((cred: any) => cred.email === email);
      
      if (emailExists) {
        toast({
          title: "Registration failed",
          description: "Email already exists. Please try another email or login.",
          variant: "destructive",
        });
        return;
      }
      
      // Generate a UUID for local storage users
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      // Create new user in local storage
      const userId = generateUUID();
      const newUserProfile = {
        id: userId,
        username,
        role: 'user' as UserRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        full_name: null,
        avatar_url: null
      };
      
      const users = JSON.parse(localStorage.getItem('app.users') || '[]');
      users.push(newUserProfile);
      localStorage.setItem('app.users', JSON.stringify(users));
      
      storedCredentials.push({
        email,
        password,
        profileId: userId
      });
      localStorage.setItem('app.credentials', JSON.stringify(storedCredentials));
      
      // Try Supabase signup as well if available
      try {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username,
            }
          }
        });
        
        if (error) {
          console.error('Supabase registration error:', error);
        } else if (data && data.user) {
          // Override the local user id with the Supabase user id
          newUserProfile.id = data.user.id;
          
          // Update the local users array with the new ID
          const updatedUsers = users.map((u: any) => 
            u.id === userId ? { ...u, id: data.user!.id } : u
          );
          localStorage.setItem('app.users', JSON.stringify(updatedUsers));
          
          // Update credentials with new user ID
          const updatedCredentials = storedCredentials.map((c: any) => 
            c.profileId === userId ? { ...c, profileId: data.user!.id } : c
          );
          localStorage.setItem('app.credentials', JSON.stringify(updatedCredentials));
          
          // Create profile in Supabase
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username,
              role: 'user',
              avatar_url: null,
              full_name: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (profileError) {
            console.error('Supabase error creating profile:', profileError);
          }
          
          // Immediately sign in the user after registration
          await signIn(email, password);
        }
      } catch (err) {
        console.error('Error with Supabase signup:', err);
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      });
      
      return { user: { id: userId, email }, session: null };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local storage
      localStorage.removeItem('app.session');
      localStorage.removeItem('app.user');
      localStorage.removeItem('app.profile');
      
      // Reset state
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Also sign out from Supabase (for cases where the user was authenticated with Supabase)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Logout failed",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect for initialization
  useEffect(() => {
    // Check for existing session in local storage
    const storedSession = localStorage.getItem('app.session');
    const storedUser = localStorage.getItem('app.user');
    const storedProfile = localStorage.getItem('app.profile');
    
    if (storedSession && storedUser && storedProfile) {
      try {
        const parsedSession = JSON.parse(storedSession);
        const parsedUser = JSON.parse(storedUser);
        const parsedProfile = JSON.parse(storedProfile);
        
        setSession(parsedSession);
        setUser(parsedUser);
        setProfile(parsedProfile);
        setIsAdmin(parsedProfile.role === 'admin');
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        // Clear invalid stored data
        localStorage.removeItem('app.session');
        localStorage.removeItem('app.user');
        localStorage.removeItem('app.profile');
      }
    }
    
    setLoading(false);
    
    // Set up auth state listener for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            
            // Fetch user profile
            if (newSession.user) {
              fetchUserProfile(newSession.user.id);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear local storage on sign out
          localStorage.removeItem('app.session');
          localStorage.removeItem('app.user');
          localStorage.removeItem('app.profile');
          
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
