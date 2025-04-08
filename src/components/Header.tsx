import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import LoginModal from './LoginModal';
import { useAuth } from '@/contexts/AuthContext';
import UserManagement from './UserManagement';

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();

  return (
    <header className="bg-white border-b shadow-sm py-2 px-4 fixed top-0 left-0 right-0 z-10">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
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
          {isAdmin && (
            <UserManagement buttonClassName="bg-primary text-primary-foreground hover:bg-primary/90" />
          )}
          
          {user ? (
            <>
              <div className="text-right">
                <p className="font-medium">{profile?.username}</p>
                <p className="text-xs opacity-80">{isAdmin ? 'Admin' : 'User'}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-white hover:from-blue-600 hover:to-indigo-700 hover:text-white"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-white hover:from-blue-600 hover:to-indigo-700 hover:text-white"
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
