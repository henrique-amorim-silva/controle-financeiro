import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, PiggyBank } from 'lucide-react';
import type { Transacao } from '../types/finance';
import { CardResumo } from './CardResumo';

interface DashboardResumoProps {
  transacoes: Transacao[];
}

export const DashboardResumo: React.FC<DashboardResumoProps> = ({ transacoes }) => {
  // Filtramos apenas as transações LIQUIDADAS (pago === true)
  const transacoesLiquidadas = transacoes.filter((t) => t.pago);

  // Totais considerando apenas o que já foi efetivado
  const totalReceitas = transacoesLiquidadas
    .filter((t) => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalDespesas = transacoesLiquidadas
    .filter((t) => t.tipo === 'despesa' && t.categoria !== 'Investimentos')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalInvestimentos = transacoesLiquidadas
    .filter((t) => t.tipo === 'despesa' && t.categoria === 'Investimentos')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  // Saldo real em conta (apenas o que foi pago/recebido)
  const saldoFinal = totalReceitas - totalDespesas - totalInvestimentos;

  // Cálculo de pendências
  const pendenciasSaida = transacoes
    .filter((t) => !t.pago && t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const pendenciasEntrada = transacoes
    .filter((t) => !t.pago && t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardResumo
          titulo="Entradas Realizadas"
          valor={totalReceitas}
          icon={ArrowUpCircle}
          corTexto="text-emerald-400"
          corIconeBg="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />

        <CardResumo
          titulo="Saídas Realizadas"
          valor={totalDespesas}
          icon={ArrowDownCircle}
          corTexto="text-rose-400"
          corIconeBg="bg-rose-500/10 text-rose-400 border border-rose-500/20"
        />

        <CardResumo
          titulo="Investimentos"
          valor={totalInvestimentos}
          icon={PiggyBank}
          corTexto="text-cyan-400"
          corIconeBg="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
        />

        <CardResumo
          titulo="Saldo Real Mensal"
          valor={saldoFinal}
          icon={Wallet}
          corTexto={saldoFinal >= 0 ? 'text-emerald-400' : 'text-rose-400'}
          corIconeBg={
            saldoFinal >= 0
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/20 text-rose-300'
          }
          destaque={true}
        />
      </div>

      {/* Alertas discretos para pendências de entradas e saídas */}
      <div className="mt-3 flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 sm:gap-4 text-xs font-medium">
        {pendenciasEntrada > 0 && (
          <div className="text-emerald-400/90">
            ℹ️ Você possui <strong>R$ {pendenciasEntrada.toFixed(2)}</strong> em receitas a receber pendentes.
          </div>
        )}

        {pendenciasSaida > 0 && (
          <div className="text-amber-400/90">
            ⚠️ Você possui <strong>R$ {pendenciasSaida.toFixed(2)}</strong> em contas a pagar pendentes.
          </div>
        )}
      </div>
    </section>
  );
};