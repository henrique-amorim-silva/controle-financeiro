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
  fetch(`${API_URL}/transacoes`)
    .then((res) => res.json())
    .then((data) => setTransacoes(data))
    .catch((err) => console.error('Erro ao carregar transações:', err));
}, []);

  // Funções de manipulação (CRUD)
  const handleAdicionarTransacao = async (novaTransacao: Omit<Transacao, 'id'>) => {
  try {
    const response = await fetch(`${API_URL}/transacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaTransacao),
    });
    const transacaoSalva: Transacao = await response.json();
    setTransacoes((prev) => [transacaoSalva, ...prev]);
  } catch (err) {
    console.error('Erro ao salvar transação:', err);
  }
};

  const handleDeletarTransacao = async (id: string) => {
  try {
    await fetch(`${API_URL}/transacoes/${id}`, {
      method: 'DELETE',
    });
    setTransacoes((prev) => prev.filter((t) => t.id !== id));
  } catch (err) {
    console.error('Erro ao deletar transação:', err);
  }
};

  const handleAlternarPago = async (id: string) => {
  try {
    const transacaoAtual = transacoes.find((t) => t.id === id);
    if (!transacaoAtual) return;

    await fetch(`${API_URL}/transacoes/${id}/pago`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pago: !transacaoAtual.pago }),
    });

    setTransacoes((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, pago: !t.pago } : t
      )
    );
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
  }
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