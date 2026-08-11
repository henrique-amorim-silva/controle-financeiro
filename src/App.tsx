import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DashboardResumo } from "./components/DashboardResumo";
import { FormularioTransacao } from "./components/FormularioTransacao";
import { ListaTransacoes } from "./components/ListaTransacoes";
import type { Transacao } from "./types/finance";
import { Footer } from "./components/Footer";
import { SaldosPorBanco } from "./components/SaldosPorBanco";
import { Login } from "./components/Login";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  // 1. Estados de Autenticação
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [usuario, setUsuario] = useState<{
    nome: string;
    email: string;
  } | null>(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
  });

  // 2. Estados da Aplicação
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [mesFiltro, setMesFiltro] = useState<string>("2026-08");

  // Função para deslogar o usuário
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
    setTransacoes([]);
  };

  // Função auxiliar para enviar requisições com o Token JWT
  const fetchAutenticado = async (
    endpoint: string,
    options: RequestInit = {},
  ) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      handleLogout();
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    return response;
  };

  // 3. Carrega as transações do usuário logado
  useEffect(() => {
    if (!token) return;

    fetchAutenticado("/transacoes")
      .then((res) => res.json())
      .then((data) => setTransacoes(data))
      .catch((err) => console.error("Erro ao carregar transações:", err));
  }, [token]);

  // 4. Manipulação de Transações (CRUD)
  const handleAdicionarTransacao = async (
    novaTransacao: Omit<Transacao, "id">,
  ) => {
    try {
      const response = await fetchAutenticado("/transacoes", {
        method: "POST",
        body: JSON.stringify(novaTransacao),
      });
      const transacaoSalva: Transacao = await response.json();
      setTransacoes((prev) => [transacaoSalva, ...prev]);
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
    }
  };

  const handleDeletarTransacao = async (id: string) => {
    try {
      await fetchAutenticado(`/transacoes/${id}`, {
        method: "DELETE",
      });
      setTransacoes((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Erro ao deletar transação:", err);
    }
  };

  const handleAlternarPago = async (id: string) => {
    try {
      const transacaoAtual = transacoes.find((t) => t.id === id);
      if (!transacaoAtual) return;

      await fetchAutenticado(`/transacoes/${id}/pago`, {
        method: "PATCH",
        body: JSON.stringify({ pago: !transacaoAtual.pago }),
      });

      setTransacoes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, pago: !t.pago } : t)),
      );
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  // 5. Se não houver token, exibe a tela de Login/Cadastro
  if (!token) {
    return (
      <Login
        onLoginSucesso={(t, u) => {
          localStorage.setItem("token", t);
          localStorage.setItem("usuario", JSON.stringify(u));
          setToken(t);
          setUsuario(u);
        }}
      />
    );
  }

  // Filtrar transações com base no mês selecionado
  const transacoesFiltradas = transacoes.filter((t) => {
    if (!mesFiltro) return true;
    return t.data.startsWith(mesFiltro);
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-100 font-sans antialiased">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Barra de Identificação do Usuário e Logout */}
        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-400">Usuário Autenticado</p>
            <h3 className="text-sm font-semibold text-emerald-400">
              {usuario?.nome}
            </h3>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium"
          >
            Sair da Conta
          </button>
        </div>

        {/* Barra de Filtro de Mês */}
        <div className="bg-white dark:bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Filtrar Período
            </h2>
            <p className="text-xs text-slate-400">
              Selecione o mês de referência para análise
            </p>
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
                onClick={() => setMesFiltro("")}
                className="text-xs text-slate-400 hover:text-slate-200 underline px-2 py-1 cursor-pointer"
              >
                Ver Todos
              </button>
            )}
          </div>
        </div>

        {/* Cards de Métricas e Saldos */}
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

        <Footer />
      </main>
    </div>
  );
}
