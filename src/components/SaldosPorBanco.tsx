import React from 'react';
import { Landmark, Wallet } from 'lucide-react';
import type { Transacao } from '../types/finance';
import { formatarMoeda } from '../utils/formatters';

interface SaldosPorBancoProps {
  transacoes: Transacao[];
}

export const SaldosPorBanco: React.FC<SaldosPorBancoProps> = ({ transacoes }) => {
  // Apenas transações já liquidadas entram no saldo acumulado
  const liquidadas = transacoes.filter((t) => t.pago);

  // Mapeamento dos saldos agregados por banco
  const saldos = liquidadas.reduce<Record<string, number>>((acc, t) => {
    const nomeBanco = t.banco || 'Outro';
    const valorAtual = Number(t.valor);
    if (!acc[nomeBanco]) acc[nomeBanco] = 0;

    if (t.tipo === 'receita') {
      acc[nomeBanco] += valorAtual;
    } else {
      acc[nomeBanco] -= valorAtual;
    }
    return acc;
  }, {});

  const bancosComSaldo = Object.entries(saldos);

  // Soma de todos os saldos de todos os bancos
  const saldoTotalGeral = bancosComSaldo.reduce((acc, [_, valor]) => acc + Number(valor), 0);

  if (bancosComSaldo.length === 0) return null;

  return (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-sm shadow-slate-950/20 mb-8">
      {/* Cabeçalho e Total Geral */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-500" />
          Saldo por Banco / Conta
        </h3>

        {/* Card em Destaque: Total do Patrimônio / Todos os Bancos */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium text-slate-200">
            Total em Contas:
          </span>
          <span
            className={`text-sm font-bold ${
              saldoTotalGeral >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatarMoeda(saldoTotalGeral)}
          </span>
        </div>
      </div>

      {/* Grid com Saldos Individuais por Banco */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {bancosComSaldo.map(([banco, saldo]) => (
          <div
            key={banco}
            className="bg-slate-900 border border-slate-700/60 p-3 rounded-xl"
          >
            <span className="text-xs font-medium text-slate-400 block truncate">
              {banco}
            </span>
            <span
              className={`text-sm font-bold block mt-0.5 ${
                saldo >= 0 ? 'text-slate-100' : 'text-rose-500'
              }`}
            >
              {formatarMoeda(saldo)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};