import React from 'react';
import type { Transacao } from '../types/finance';

interface FaturaCartaoModalProps {
  transacoes: Transacao[];
  mesFatura: string; // Ex: "2026-09"
  onPagarFatura: (ids: string[]) => void;
}

export const FaturaCartaoModal: React.FC<FaturaCartaoModalProps> = ({
  transacoes,
  mesFatura,
  onPagarFatura,
}) => {
  // Filtra compras do cartão pertencentes a este mês de vencimento
  const itensFatura = transacoes.filter(
    (t) =>
      t.metodoPagamento === 'cartao_credito' &&
      t.dataVencimentoFatura?.startsWith(mesFatura)
  );

  const totalFatura = itensFatura.reduce((acc, t) => acc + Number(t.valor), 0);
  const estaPaga = itensFatura.length > 0 && itensFatura.every((t) => t.pago);

  const handleQuitarFatura = () => {
    const idsParaPagar = itensFatura.filter((t) => !t.pago).map((t) => t.id);
    if (idsParaPagar.length > 0) {
      onPagarFatura(idsParaPagar);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold">Fatura do Cartão - {mesFatura}</h3>
          <p className="text-xs text-slate-400">{itensFatura.length} item(ns) nesta fatura</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-base font-bold text-rose-400">R$ {totalFatura.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {itensFatura.map((item) => (
          <div key={item.id} className="flex justify-between text-xs p-2 bg-slate-800/50 rounded-lg">
            <span>{item.descricao}</span>
            <span className={item.pago ? 'text-emerald-400' : 'text-amber-400'}>
              R$ {Number(item.valor).toFixed(2)} ({item.pago ? 'Pago' : 'Pendente'})
            </span>
          </div>
        ))}
      </div>

      {!estaPaga && itensFatura.length > 0 && (
        <button
          onClick={handleQuitarFatura}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer"
        >
          Quitar Fatura Completa
        </button>
      )}
    </div>
  );
};