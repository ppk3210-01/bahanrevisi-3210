
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'user' | 'viewer';

export interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  role: UserRole;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string, role?: UserRole) => Promise<void>;
  getUserProfiles: () => Promise<UserProfile[]>;
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Fetch user profile after state change if user exists
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        fetchUserProfile(initialSession.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setProfile(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message
        });
        throw error;
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Logout failed",
          description: error.message
        });
        throw error;
      }
      
      // Clear local state
      setSession(null);
      setUser(null);
      setProfile(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: UserRole = 'user') => {
    try {
      setLoading(true);
      
      // Create user with metadata
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: error.message
        });
        throw error;
      }
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully."
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const getUserProfiles = async (): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching user profiles:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user profiles"
        });
        throw error;
      }
      
      return data as UserProfile[];
    } catch (error) {
      console.error('Error in getUserProfiles:', error);
      return [];
    }
  };
  
  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating user profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update user profile"
        });
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "User profile has been updated successfully"
      });
      
      // Refresh profile if updating current user
      if (userId === user?.id) {
        fetchUserProfile(userId);
      }
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      throw error;
    }
  };
  
  const deleteUser = async (userId: string) => {
    try {
      // For now, we'll just delete the profile since we don't have admin API access
      // In a real app with backend, you would delete the auth user as well
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Error deleting user:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete user"
        });
        throw error;
      }
      
      toast({
        title: "User deleted",
        description: "User has been deleted successfully"
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  };

  const contextValue = {
    session,
    user,
    profile,
    loading,
    login,
    logout,
    signup,
    getUserProfiles,
    updateUserProfile,
    deleteUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
