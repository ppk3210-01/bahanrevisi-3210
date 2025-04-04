
import React from 'react';
import BudgetComparison from '@/components/BudgetComparison';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold">Anggaran Insight Fusion</h1>
          <p className="text-gray-600">Aplikasi Dinamis Penyandingan Data Anggaran "Semula vs Menjadi"</p>
        </div>
      </header>
      
      <main className="container mx-auto py-6">
        <BudgetComparison />
      </main>
      
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto py-4 text-center text-gray-500 text-sm">
          © 2025 Anggaran Insight Fusion. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
