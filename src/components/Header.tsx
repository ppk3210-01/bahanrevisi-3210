
import React, { useState } from 'react';
import { LogIn, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { UserManagementDialog } from '@/components/auth/UserManagementDialog';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const { user, profile, logout } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [userManagementDialogOpen, setUserManagementDialogOpen] = useState(false);
  
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b sticky top-0 z-50">
      <div className="container mx-auto py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/234c2470-e258-4fcb-8dc3-87747ed54c6e.png" 
            alt="Logo" 
            className="h-9 w-9 mr-3" 
          />
          <div>
            <h1 className="text-xl font-bold">Bahan Revisi-3210</h1>
            <p className="text-white text-sm opacity-90">Aplikasi Bahan Revisi Pagu Anggaran "Semula vs Menjadi"</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right mr-2">
                <div className="text-sm font-medium">{profile?.full_name || user.email}</div>
                <div className="text-xs opacity-80 capitalize">{profile?.role || 'user'}</div>
              </div>
              
              {profile?.role === 'admin' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-blue-500"
                  onClick={() => setUserManagementDialogOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Users</span>
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-blue-500"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-white hover:bg-blue-500"
              onClick={() => setLoginDialogOpen(true)}
            >
              <LogIn className="h-4 w-4 mr-1" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
      
      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen} 
      />
      
      <UserManagementDialog 
        open={userManagementDialogOpen} 
        onOpenChange={setUserManagementDialogOpen} 
      />
    </header>
  );
};

export default Header;
