import React from 'react';

interface AcoesRapidasProps {
  onDuplicarGastosFixos: () => void;
}

export const AcoesRapidas: React.FC<AcoesRapidasProps> = ({
  onDuplicarGastosFixos,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-md shadow-slate-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h4 className="text-sm font-semibold text-white">Ações Rápidas</h4>
        <p className="text-xs text-slate-400">
          Agilize o preenchimento duplicando lançamentos recorrentes.
        </p>
      </div>

      <button
        onClick={onDuplicarGastosFixos}
        type="button"
        className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-95"
      >
        <svg
          className="w-4 h-4 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        Importar Gastos Fixos do Mês Anterior
      </button>
    </div>
  );
};