
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
        await signIn(emailOrUsername, password);
        onClose();
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      setError('Invalid login credentials. Please check your input and password.');
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

  // Add demo account options for easy login
  const useDemoAccount = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmailOrUsername('admin@bps3210.id');
      setPassword('bps3210admin');
    } else {
      setEmailOrUsername('sosial@bps3210.id');
      setPassword('bps3210@');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isRegistering ? 'Create an Account' : 'Login to Your Account'}</DialogTitle>
          <DialogDescription>
            {isRegistering 
              ? 'Enter your details to create a new account.' 
              : 'Enter your credentials to access your account.'}
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
                placeholder="Enter your username"
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="emailOrUsername">{isRegistering ? 'Email' : 'Email or Username'}</Label>
            <Input
              id="emailOrUsername"
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder={isRegistering ? "Enter your email" : "Enter your email or username"}
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
              placeholder="Enter your password"
              required
            />
          </div>
          
          {!isRegistering && (
            <div className="flex flex-col space-y-2">
              <p className="text-xs text-gray-500">Demo accounts:</p>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="text-xs py-1 h-7"
                  onClick={() => useDemoAccount('admin')}
                >
                  Use Admin Account
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="text-xs py-1 h-7"
                  onClick={() => useDemoAccount('user')}
                >
                  Use User Account
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-between pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isRegistering ? 'Already have an account?' : 'Need an account?'}
            </Button>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : isRegistering ? 'Register' : 'Login'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
