import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardResumo } from './components/DashboardResumo';
import { FormularioTransacao } from './components/FormularioTransacao';
import { ListaTransacoes } from './components/ListaTransacoes';
import { transacoesIniciais } from './data/initialData';
import type { Transacao } from './types/finance';
import { Footer } from './components/Footer';
import { SaldosPorBanco } from './components/SaldosPorBanco';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function App() {

  // 1. Carrega do LocalStorage ou usa os dados iniciais
  const [transacoes, setTransacoes] = useState<Transacao[]>(() => {
    const dadosSalvos = localStorage.getItem('@finance_app_transacoes');
    if (dadosSalvos) {
      try {
        return JSON.parse(dadosSalvos);
      } catch (error) {
        console.error('Erro ao carregar dados do LocalStorage', error);
      }
    }
    return transacoesIniciais;
  });

  // Estado para filtrar por mês (formato "YYYY-MM")
  const [mesFiltro, setMesFiltro] = useState<string>('2026-08');

  // 2. Salva no LocalStorage sempre que a lista de transações mudar
  useEffect(() => {
    localStorage.setItem('@finance_app_transacoes', JSON.stringify(transacoes));
  }, [transacoes]);

  // Funções de manipulação (CRUD)
  const handleAdicionarTransacao = (novaTransacao: Omit<Transacao, 'id'>) => {
    const itemCompleto: Transacao = {
      ...novaTransacao,
      id: crypto.randomUUID(),
    };
    setTransacoes((prev) => [itemCompleto, ...prev]);
  };

  const handleDeletarTransacao = (id: string) => {
    setTransacoes((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAlternarPago = (id: string) => {
    setTransacoes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pago: !item.pago } : item
      )
    );
  };

  // Filtrar transações com base no mês selecionado
  const transacoesFiltradas = transacoes.filter((t) => {
    if (!mesFiltro) return true;
    return t.data.startsWith(mesFiltro);
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-100 font-sans antialiased">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Barra de Filtro de Mês */}
        <div className="bg-white dark:bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <h2 className="text-sm font-semibold text-white">Filtrar Período</h2>
            <p className="text-xs text-slate-400">Selecione o mês de referência para análise</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            />
            {mesFiltro && (
              <button
                onClick={() => setMesFiltro('')}
                className="text-xs text-slate-400 hover:text-slate-200 underline px-2 py-1 cursor-pointer"
              >
                Ver Todos
              </button>
            )}
          </div>
        </div>

        {/* Cards de Métricas (Calculados com base nas transações filtradas) */}
        <DashboardResumo transacoes={transacoesFiltradas} />
        <SaldosPorBanco transacoes={transacoes} />

        {/* Formulário de Adição */}
        <FormularioTransacao onAdicionarTransacao={handleAdicionarTransacao} />

        {/* Tabela de Lançamentos */}
        <ListaTransacoes
          transacoes={transacoesFiltradas}
          onDeletarTransacao={handleDeletarTransacao}
          onAlternarPago={handleAlternarPago}
        />
        <Footer/>
      </main>
    </div>
  );
}