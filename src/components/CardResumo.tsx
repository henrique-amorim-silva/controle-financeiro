import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { formatarMoeda } from '../utils/formatters';

interface CardResumoProps {
  titulo: string;
  valor: number;
  icon: LucideIcon;
  corTexto?: string;
  corIconeBg?: string;
  destaque?: boolean;
}

export const CardResumo: React.FC<CardResumoProps> = ({
  titulo,
  valor,
  icon: Icon,
  corTexto = 'text-slate-900 dark:text-white',
  corIconeBg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  destaque = false,
}) => {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
        destaque
          ? 'bg-slate-50 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 shadow-md'
          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {titulo}
        </span>
        <div className={`p-2.5 rounded-xl text-sm ${corIconeBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <h3 className={`text-2xl font-bold tracking-tight ${corTexto}`}>
          {formatarMoeda(valor)}
        </h3>
      </div>
    </div>
  );
};