
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import LoginModal from './LoginModal';
import { useAuth } from '@/contexts/AuthContext';
import UserManagement from './UserManagement';
import { FileSpreadsheet } from 'lucide-react';

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const {
    user,
    isAdmin,
    signOut,
    profile
  } = useAuth();
  
  const handleOpenSpreadsheet = () => {
    window.open('https://docs.google.com/spreadsheets/d/1SgC_2TQz3AZdYTsbx-cIKg-DEvtOt3GtNl76zCzjLxU/edit?gid=1559424693#gid=1559424693', '_blank');
  };
  
  return <header className="bg-gradient-to-r from-slate-900 to-blue-950 py-2 px-4 fixed top-0 left-0 right-0 z-10 text-white w-full">
      <div className="flex justify-between items-center max-w-full mx-auto px-2">
        <div className="flex items-center">
          <img src="/lovable-uploads/234c2470-e258-4fcb-8dc3-87747ed54c6e.png" alt="Logo" className="h-9 w-9 mr-3" />
          <div>
            <h1 className="text-xl font-bold text-white">Bahan Revisi-3210</h1>
            <p className="text-gray-200 text-sm">Aplikasi Bahan Revisi Pagu Anggaran "Semula vs Menjadi"</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenSpreadsheet}
            className="bg-transparent border border-white text-white hover:bg-white/10 flex items-center gap-1"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Bahan Revisi - Spreadsheet
          </Button>
          
          {isAdmin && <UserManagement buttonClassName="bg-primary text-primary-foreground hover:bg-primary/90" />}
          
          {user ? <>
              <div className="text-right text-white">
                <p className="font-medium text-slate-100">{profile?.username || 'User'}</p>
                <p className="text-xs opacity-80 text-slate-100">{isAdmin ? 'Admin' : 'User'}</p>
              </div>
              <Button size="sm" onClick={signOut} className="bg-transparent border border-white text-white hover:bg-white/10">
                Logout
              </Button>
            </> : <Button size="sm" onClick={() => setIsLoginModalOpen(true)} className="bg-transparent border border-white text-white hover:bg-white/10">
              Login
            </Button>}
        </div>
      </div>
      
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>;
};
export default Header;
