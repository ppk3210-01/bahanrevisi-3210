
import React from 'react';
import BudgetComparison from '@/components/BudgetComparison';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto py-6 flex items-center">
          <img 
            src="/lovable-uploads/234c2470-e258-4fcb-8dc3-87747ed54c6e.png" 
            alt="Logo" 
            className="h-10 w-10 mr-3" 
          />
          <div>
            <h1 className="text-2xl font-bold">Bahan Revisi-3210</h1>
            <p className="text-gray-600">Aplikasi Bahan Revisi Anggaran "Semula vs Menjadi"</p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6">
        <BudgetComparison />
      </main>
      
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto py-4 text-center text-gray-500 text-sm">
          © 2025 bahanrevisi-3210. Powered by Andries-3210.
        </div>
      </footer>
    </div>
  );
};

export default Index;
