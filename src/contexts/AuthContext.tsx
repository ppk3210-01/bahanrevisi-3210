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

type UserRole = 'admin' | 'user';

const HARDCODED_USERS = {
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
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
        
        localStorage.setItem('app.profile', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const checkHardcodedUser = (identifier: string, password: string): { matchedUser: any, type: 'admin' | 'user' | null } => {
    if (identifier === HARDCODED_USERS.admin.email || identifier === HARDCODED_USERS.admin.username) {
      if (password === HARDCODED_USERS.admin.password) {
        return { matchedUser: HARDCODED_USERS.admin, type: 'admin' };
      }
    }
    
    for (const user of HARDCODED_USERS.users) {
      if (identifier === user.email || identifier === user.username) {
        if (password === user.password) {
          return { matchedUser: user, type: 'user' };
        }
      }
    }
    
    return { matchedUser: null, type: null };
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      setLoading(true);
      console.log('Signing in with:', emailOrUsername);
      
      const { matchedUser, type } = checkHardcodedUser(emailOrUsername, password);
      
      if (matchedUser) {
        console.log(`Login successful with ${type} user:`, matchedUser.email || matchedUser.username);
        
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
        
        setSession(fakeSession as any);
        setUser(fakeSession.user as any);
        setProfile(matchedUser.profile as any);
        setIsAdmin(matchedUser.profile.role === 'admin');
        
        localStorage.setItem('app.session', JSON.stringify(fakeSession));
        localStorage.setItem('app.user', JSON.stringify(fakeSession.user));
        localStorage.setItem('app.profile', JSON.stringify(matchedUser.profile));
        
        toast({
          title: "Login successful",
          description: "You have been logged in successfully",
        });
        
        return { user: fakeSession.user, session: fakeSession } as any;
      }
      
      const storedCredentials = JSON.parse(localStorage.getItem('app.credentials') || '[]');
      const storedUsers = JSON.parse(localStorage.getItem('app.users') || '[]');
      
      const isEmail = emailOrUsername.includes('@');
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
          const fakeSession = {
            access_token: `fake-token-${Date.now()}`,
            refresh_token: `fake-refresh-${Date.now()}`,
            expires_at: Date.now() + 3600 * 1000,
            user: {
              id: matchedStoredProfile.id,
              email: matchedCredential.email,
              user_metadata: {
                username: matchedStoredProfile.username,
                full_name: matchedStoredProfile.full_name,
                role: matchedStoredProfile.role
              }
            }
          };
          
          setSession(fakeSession as any);
          setUser(fakeSession.user as any);
          setProfile(matchedStoredProfile);
          setIsAdmin(matchedStoredProfile.role === 'admin');
          
          localStorage.setItem('app.session', JSON.stringify(fakeSession));
          localStorage.setItem('app.user', JSON.stringify(fakeSession.user));
          localStorage.setItem('app.profile', JSON.stringify(matchedStoredProfile));
          
          toast({
            title: "Login successful",
            description: "You have been logged in successfully",
          });
          
          return { user: fakeSession.user, session: fakeSession } as any;
        }
      }
      
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
          
          setSession(data.session);
          setUser(data.user);
          
          if (data.session) {
            localStorage.setItem('app.session', JSON.stringify(data.session));
            localStorage.setItem('app.user', JSON.stringify(data.user));
          }
          
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
      
      if (email === HARDCODED_USERS.admin.email || email === HARDCODED_USERS.user.email) {
        toast({
          title: "Registration successful",
          description: "This account already exists. Please login instead.",
        });
        return;
      }
      
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
      
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
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
          newUserProfile.id = data.user.id;
          
          const updatedUsers = users.map((u: any) => 
            u.id === userId ? { ...u, id: data.user!.id } : u
          );
          localStorage.setItem('app.users', JSON.stringify(updatedUsers));
          
          const updatedCredentials = storedCredentials.map((c: any) => 
            c.profileId === userId ? { ...c, profileId: data.user!.id } : c
          );
          localStorage.setItem('app.credentials', JSON.stringify(updatedCredentials));
          
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
      
      localStorage.removeItem('app.session');
      localStorage.removeItem('app.user');
      localStorage.removeItem('app.profile');
      
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
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

  useEffect(() => {
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
        localStorage.removeItem('app.session');
        localStorage.removeItem('app.user');
        localStorage.removeItem('app.profile');
      }
    }
    
    setLoading(false);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            
            if (newSession.user) {
              fetchUserProfile(newSession.user.id);
            }
          }
        } else if (event === 'SIGNED_OUT') {
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
