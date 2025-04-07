
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Username dan password tidak boleh kosong"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Try to find user's email from username
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, username, full_name')
        .eq('username', username)
        .single();
      
      if (profileError || !profileData) {
        throw new Error('Username atau password tidak valid');
      }
      
      // Get user's email from auth.users table using the id
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, email')
        .eq('username', username)
        .single();
      
      if (userError || !userData || !userData.email) {
        throw new Error('Username atau password tidak valid');
      }
      
      // Now login with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast({
          title: "Login Berhasil",
          description: "Selamat datang di Aplikasi Bahan Revisi Pagu Anggaran"
        });
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: error.message || "Username atau password tidak valid"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
      <CardHeader className="pb-4 space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center text-sm">
          Masukkan username dan password Anda untuk mengakses aplikasi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              autoComplete="username"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            disabled={loading}
          >
            {loading ? 'Sedang Login...' : 'Login'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="text-center text-sm text-gray-500 w-full">
          Jika mengalami kendala login, hubungi administrator.
        </div>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
