
import React from 'react';
import BudgetComparison from '@/components/BudgetComparison';
import Header from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto py-3 px-4 sm:px-6 pt-[76px]">
        <BudgetComparison />
      </main>
      
      <footer className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-t mt-6">
        <div className="container mx-auto py-3 px-4 sm:px-6 text-center">
          <div className="text-sm font-medium text-right">© 2025 bahanrevisi-3210</div>
          <div className="text-xs opacity-80 text-right">Powered by Andries-3210</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
