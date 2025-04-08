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
  signIn: (email: string, password: string) => Promise<AuthResponse | void>;
  signUp: (email: string, password: string, username: string) => Promise<AuthResponse | void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

// Hardcoded users for direct access without database dependency
const HARDCODED_USERS = {
  admin: {
    email: 'admin@bps3210.id',
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
  user: {
    email: 'sosial@bps3210.id',
    password: 'bps3210@',
    profile: {
      id: '00000000-0000-0000-0000-000000000002',
      username: 'sosial 3210',
      full_name: 'User Sosial',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
    
    // Set up auth state listener for Supabase auth changes (still keep this for future use)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_OUT') {
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
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Signing in with:', email);
      
      // Check if the user is one of our hardcoded users
      let matchedUser = null;
      
      if (email === HARDCODED_USERS.admin.email && password === HARDCODED_USERS.admin.password) {
        matchedUser = HARDCODED_USERS.admin;
      } else if (email === HARDCODED_USERS.user.email && password === HARDCODED_USERS.user.password) {
        matchedUser = HARDCODED_USERS.user;
      }
      
      if (matchedUser) {
        console.log('Login successful with hardcoded user:', matchedUser.email);
        
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
      
      // If no hardcoded match, try Supabase authentication as fallback
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: "Invalid login credentials",
          variant: "destructive",
        });
        console.error('Authentication error:', error);
        throw error;
      }

      console.log('Supabase login successful:', data);
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });
      
      return data;
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
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        console.error('Registration error:', error);
        throw error;
      }

      console.log('Registration successful:', data);
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account",
      });
      
      return data;
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
