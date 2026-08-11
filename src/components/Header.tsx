import React from 'react';
import { Wallet } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white py-6 px-4 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logotipo e Título */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              FinanceApp <span className="text-emerald-600 dark:text-emerald-400 font-normal">| Controle Pessoal</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gestão de Receitas, Despesas e Investimentos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50 text-sm text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Período Ativo: <strong>Agosto / 2026</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};