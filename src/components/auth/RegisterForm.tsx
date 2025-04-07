
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

export interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !username || !email || !password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Semua kolom harus diisi"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password dan konfirmasi password tidak cocok"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if username already exists
      const { data: existingUser, error: usernameError } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        throw new Error('Username sudah digunakan, silakan pilih username lain');
      }
      
      // Create user with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
            role: 'user' // Default role for new users
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Registrasi Berhasil",
        description: "Akun berhasil dibuat. Silakan login menggunakan kredensial Anda."
      });
      
      // Redirect to login page after successful registration
      navigate('/login');
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registrasi Gagal",
        description: error.message || "Terjadi kesalahan saat mendaftar"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
      <CardHeader className="pb-4 space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Daftar Akun Baru</CardTitle>
        <CardDescription className="text-center text-sm">
          Isi formulir berikut untuk membuat akun baru
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input 
              id="fullName" 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
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
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Masukkan konfirmasi password"
              disabled={loading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            disabled={loading}
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="text-center text-sm text-gray-500 w-full">
          Sudah punya akun? <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
