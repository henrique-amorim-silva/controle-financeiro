import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, PiggyBank } from 'lucide-react';
import type { Transacao } from '../types/finance';
import { CardResumo } from './CardResumo';

interface DashboardResumoProps {
  transacoes: Transacao[]; // Transações do mês filtrado
  todasTransacoesSistema?: Transacao[]; // Todas as transações do sistema
  isBalancoGeral: boolean;
  mesFiltroSelecionado?: string; // Ex: '2026-09'
}

export const DashboardResumo: React.FC<DashboardResumoProps> = ({ 
  transacoes, 
  todasTransacoesSistema = [], 
  isBalancoGeral,
  mesFiltroSelecionado = ''
}) => {
  // 1. Transações liquidadas do mês atual (para preencher os cards de Entradas/Saídas/Saldo do mês)
  const transacoesLiquidadasMes = transacoes.filter((t) => t.pago);

  const totalReceitas = transacoesLiquidadasMes
    .filter((t) => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalDespesas = transacoesLiquidadasMes
    .filter((t) => t.tipo === 'despesa' && t.categoria !== 'Investimentos')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalInvestimentos = transacoesLiquidadasMes
    .filter((t) => t.tipo === 'despesa' && t.categoria === 'Investimentos')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const saldoFinal = totalReceitas - totalDespesas - totalInvestimentos;

  // 2. Base global do sistema para o "Total em Contas"
  const baseSistema = todasTransacoesSistema.length > 0 ? todasTransacoesSistema : transacoes;

  const totalEmContasGeral = baseSistema
  .filter((t) => t.pago)
  .reduce((acc, t) => {
    const valor = Number(t.valor);
    if (t.tipo === 'receita') return acc + valor;
    if (t.tipo === 'despesa') return acc - valor;
    return acc; // Ignora transferências no saldo geral de contas
  }, 0);

  // Função auxiliar ultra segura para extrair 'YYYY-MM' de qualquer formato de data (ISO, YYYY-MM-DD ou DD/MM/YYYY)
  const obterAnoMes = (dataStr: string): string => {
    if (!dataStr) return '';
    
    // Se já estiver no formato YYYY-MM ou YYYY-MM-DD
    if (dataStr.includes('-')) {
      const partes = dataStr.split('T')[0].split('-');
      if (partes.length >= 2) {
        return `${partes[0]}-${partes[1].padStart(2, '0')}`;
      }
    }
    
    // Se estiver no formato brasileiro DD/MM/YYYY
    if (dataStr.includes('/')) {
      const partes = dataStr.split('T')[0].split('/');
      if (partes.length >= 3) {
        const mes = partes[1];
        const ano = partes[2];
        // Valida se o ano tem 4 dígitos (geralmente formato BR)
        if (ano.length === 4) {
          return `${ano}-${mes.padStart(2, '0')}`;
        }
      }
    }

    // Fallback usando o objeto Date nativo do JS
    const dataObj = new Date(dataStr);
    if (!isNaN(dataObj.getTime())) {
      const ano = dataObj.getFullYear();
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      return `${ano}-${mes}`;
    }

    return '';
  };

  // 3. Cálculo das pendências acumuladas (considerando o mês selecionado e todos para trás)
  let pendenciasSaidaTotal = 0;
  let pendenciasEntradaTotal = 0;

  if (isBalancoGeral) {
    // No balanço geral: considera todas as pendências do sistema inteiro
    pendenciasSaidaTotal = baseSistema
      .filter((t) => !t.pago && t.tipo === 'despesa')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    pendenciasEntradaTotal = baseSistema
      .filter((t) => !t.pago && t.tipo === 'receita')
      .reduce((acc, t) => acc + Number(t.valor), 0);
  } else {
    // Em um mês específico: compara de forma segura 'YYYY-MM' <= mesFiltroSelecionado ('2026-09')
    const transacoesAteMesSelecionado = baseSistema.filter((t) => {
      const anoMesTransacao = obterAnoMes(t.data);
      if (!anoMesTransacao) return false;
      return anoMesTransacao <= mesFiltroSelecionado;
    });

    pendenciasSaidaTotal = transacoesAteMesSelecionado
      .filter((t) => !t.pago && t.tipo === 'despesa')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    pendenciasEntradaTotal = transacoesAteMesSelecionado
      .filter((t) => !t.pago && t.tipo === 'receita')
      .reduce((acc, t) => acc + Number(t.valor), 0);
  }

  // 4. Previsão Total: Total em Contas - Saídas Pendentes Acumuladas + Entradas Pendentes Acumuladas
  const saldoPrevistoTotal = totalEmContasGeral - pendenciasSaidaTotal + pendenciasEntradaTotal;

  // Pendências estritamente do mês atual (para os avisos de texto embaixo)
  const pendenciasSaidaMes = transacoes
    .filter((t) => !t.pago && t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const pendenciasEntradaMes = transacoes
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
          icon= {PiggyBank}
          corTexto="text-blue-400"
          corIconeBg="bg-blue-500/10 text-blue-400 border border-blue-500/20"
        />

        <div className="relative">
          <CardResumo
            titulo={isBalancoGeral ? "SALDO REAL TOTAL" : "SALDO REAL MENSAL"}
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

          <div className="mt-1.5 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium" title="Total em Contas - Pendências acumuladas até o período">
              Previsão Total (c/ pendentes):
            </span>
            <span className={`font-semibold ${saldoPrevistoTotal >= 0 ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
              R$ {saldoPrevistoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Alertas de pendências do mês selecionado */}
      <div className="mt-3 flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 sm:gap-4 text-xs font-medium">
        {pendenciasEntradaMes > 0 && (
          <div className="text-emerald-400/90">
            ℹ️ Você possui <strong>R$ {pendenciasEntradaMes.toFixed(2)}</strong> em receitas a receber pendentes neste período.
          </div>
        )}

        {pendenciasSaidaMes > 0 && (
          <div className="text-amber-400/90">
            ⚠️ Você possui <strong>R$ {pendenciasSaidaMes.toFixed(2)}</strong> em contas a pagar pendentes neste período.
          </div>
        )}
      </div>
    </section>
  );
};