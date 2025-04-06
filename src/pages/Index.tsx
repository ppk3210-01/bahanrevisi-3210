
import React from 'react';
import BudgetComparison from '@/components/BudgetComparison';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b sticky top-0 z-50">
        <div className="container mx-auto py-2 flex items-center">
          <img 
            src="/lovable-uploads/234c2470-e258-4fcb-8dc3-87747ed54c6e.png" 
            alt="Logo" 
            className="h-8 w-8 mr-2" 
          />
          <div>
            <h1 className="text-xl font-bold">Bahan Revisi-3210</h1>
            <p className="text-white text-sm opacity-80">Aplikasi Bahan Revisi Pagu Anggaran "Semula vs Menjadi"</p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-2">
        <BudgetComparison />
      </main>
      
      <footer className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-t mt-6">
        <div className="container mx-auto py-2 text-center text-sm">
          © 2025 bahanrevisi-3210. Powered by Andries-3210.
        </div>
      </footer>
    </div>
  );
};

export default Index;
