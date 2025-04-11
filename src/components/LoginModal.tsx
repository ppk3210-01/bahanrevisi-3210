
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      console.log(`Attempting to ${isRegistering ? 'register' : 'login'} with email/username:`, emailOrUsername);
      
      if (isRegistering) {
        await signUp(emailOrUsername, password, username);
      } else {
        // Try login with email/username and password
        const success = await signIn(emailOrUsername, password);
        if (success) {
          onClose();
        } else {
          setError('Kredensial login tidak valid. Silakan periksa kembali username dan password Anda.');
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      setError('Autentikasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    // Reset fields when switching modes
    setEmailOrUsername('');
    setPassword('');
    setUsername('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isRegistering ? 'Buat Akun Baru' : 'Login ke Akun Anda'}</DialogTitle>
          <DialogDescription>
            {isRegistering 
              ? 'Masukkan detail Anda untuk membuat akun baru.' 
              : 'Masukkan kredensial Anda untuk mengakses akun Anda.'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="emailOrUsername">{isRegistering ? 'Email' : 'Email atau Username'}</Label>
            <Input
              id="emailOrUsername"
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder={isRegistering ? "Masukkan email Anda" : "Masukkan email atau username Anda"}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password Anda"
              required
            />
          </div>
          
          <div className="flex justify-between pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isRegistering ? 'Sudah punya akun?' : 'Butuh akun baru?'}
            </Button>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Memproses...' : isRegistering ? 'Daftar' : 'Login'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
