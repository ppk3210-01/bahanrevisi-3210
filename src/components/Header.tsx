
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import LoginModal from './LoginModal';
import { useAuth } from '@/contexts/AuthContext';
import UserManagement from './UserManagement';

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();

  // Common button style class for login and user management
  const headerButtonClass = "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-white hover:from-blue-600 hover:to-indigo-700 hover:text-white";

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
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="text-right">
                <p className="font-medium">{profile?.username}</p>
                <p className="text-xs opacity-80">{isAdmin ? 'Admin' : 'User'}</p>
              </div>
              {isAdmin && 
                <UserManagement buttonClassName={headerButtonClass} />
              }
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut} 
                className={headerButtonClass}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsLoginModalOpen(true)}
              className={headerButtonClass}
            >
              Login
            </Button>
          )}
        </div>
      </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};

export default Header;
