import React from 'react';
import { Code2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4 mt-12 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>FinanceApp desenvolvido com React, TypeScript & Tailwind CSS.</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span>Feito com</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>para o portfólio de programação.</span>
        </div>
      </div>
    </footer>
  );
};