import React from 'react';
import { Code2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4 mt-12 text-xs rounded-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>FinanceApp desenvolvido com React, TypeScript, Node.js, Express & PostgreSQL.</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span>Feito para o portifólio de programação</span>
        </div>
      </div>
    </footer>
  );
};