
import React from 'react';
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/types/auth";
import { UserCircle2, LogOut } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuthStatusProps {
  user: User | null;
  profile: UserProfile | null;
}

const AuthStatus: React.FC<AuthStatusProps> = ({ user, profile }) => {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout Berhasil",
        description: "Anda telah berhasil keluar dari aplikasi"
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout Gagal",
        description: "Terjadi kesalahan saat logout. Silakan coba lagi."
      });
    }
  };

  if (!user) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <a href="/login" className="text-blue-600 hover:text-blue-800">
          Login
        </a>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-gray-600 hidden md:block">
        Selamat datang, <span className="font-semibold">{profile?.full_name || user.email}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <UserCircle2 className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {profile?.full_name || user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout} className="text-red-600 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AuthStatus;
