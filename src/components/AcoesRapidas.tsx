import React, { useState } from 'react';
import type { CartaoCredito } from '../types/cartao';

interface AcoesRapidasProps {
  onDuplicarGastosFixos: () => void;
  onPagarFaturaLote: (cartaoId: string) => void;
  cartoes: CartaoCredito[];
}

export const AcoesRapidas: React.FC<AcoesRapidasProps> = ({
  onDuplicarGastosFixos,
  onPagarFaturaLote,
  cartoes,
}) => {
  const [cartaoIdSelecionado, setCartaoIdSelecionado] = useState<string>('');

  const handleQuitarFaturaClick = () => {
    if (!cartaoIdSelecionado) {
      alert('Selecione um cartão para quitar a fatura.');
      return;
    }

    const cartaoObj = cartoes.find((c) => c.id === cartaoIdSelecionado);
    const nomeExibicao = cartaoObj ? `${cartaoObj.nome} (${cartaoObj.banco})` : 'cartão';

    if (
      window.confirm(
        `Deseja marcar todas as contas pendentes do cartão "${nomeExibicao}" para o mês selecionado como pagas?`
      )
    ) {
      onPagarFaturaLote(cartaoIdSelecionado);
      setCartaoIdSelecionado(''); // Reseta a seleção após a ação
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-md shadow-slate-950/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div>
        <h4 className="text-sm font-semibold text-white">Ações Rápidas</h4>
        <p className="text-xs text-slate-400">
          Agilize o preenchimento de lançamentos e gestão de faturas.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
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
          Importar Gastos Fixos
        </button>

        <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 border border-slate-800 p-1 rounded-xl">
          {/* O value agora é o ID, mas o texto exibido mostra o Nome e Banco */}
          <select
            value={cartaoIdSelecionado}
            onChange={(e) => setCartaoIdSelecionado(e.target.value)}
            className="bg-transparent text-xs text-slate-300 px-2 py-1.5 outline-none cursor-pointer"
          >
            <option value="" disabled className="bg-slate-900 text-slate-400">
              Selecionar Cartão...
            </option>
            {cartoes.map((cartao) => (
              <option key={cartao.id} value={cartao.id} className="bg-slate-900 text-slate-200">
                {cartao.nome} ({cartao.banco})
              </option>
            ))}
          </select>

          <button
            onClick={handleQuitarFaturaClick}
            type="button"
            className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-95"
          >
            <svg
              className="w-4 h-4 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Pagar Fatura
          </button>
        </div>
      </div>
    </div>
  );
};