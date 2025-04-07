
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md mb-8 text-center">
        <img 
          src="/lovable-uploads/234c2470-e258-4fcb-8dc3-87747ed54c6e.png" 
          alt="Logo" 
          className="h-16 w-16 mx-auto mb-4" 
        />
        <h1 className="text-2xl font-bold text-blue-900">Bahan Revisi-3210</h1>
        <p className="text-gray-600">Aplikasi Bahan Revisi Pagu Anggaran "Semula vs Menjadi"</p>
      </div>
      
      <AuthForm onSuccess={() => navigate('/')} />
    </div>
  );
};

export default Login;
