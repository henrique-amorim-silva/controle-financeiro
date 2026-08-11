import React from 'react';
import { Wallet } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 py-6 px-4 shadow-sm shadow-slate-950/20">
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
          <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 text-sm text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-200">Período Ativo: <strong>Agosto / 2026</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};