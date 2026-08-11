import { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { DashboardResumo } from "./components/DashboardResumo";
import { FormularioTransacao } from "./components/FormularioTransacao";
import { ListaTransacoes } from "./components/ListaTransacoes";
import type { Transacao } from "./types/finance";
import { Footer } from "./components/Footer";
import { SaldosPorBanco } from "./components/SaldosPorBanco";
import { Login } from "./components/Login";
import { SecaoGraficos } from "./components/SecaoGraficos";
import {
  FiltrosTransacao,
  type FiltrosState,
} from "./components/FiltrosTransacao";

const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = (
  rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : `https://${rawUrl}`
).replace(/\/$/, "");

const normalizarTexto = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [usuario, setUsuario] = useState<{
    nome: string;
    email: string;
  } | null>(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
  });

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [mesFiltro, setMesFiltro] = useState<string>("2026-08");

  const [filtros, setFiltros] = useState<FiltrosState>({
    tipo: "todos",
    tipoGasto: "todos",
    status: "todos",
    descricao: "",
    banco: "todos",
    categoria: "todas",
    dataInicio: "",
    dataFim: "",
  });

  const normalizarTransacao = (transacao: any): Transacao => {
    const tipoGastoBruto =
      transacao.tipoGasto ?? transacao.tipogasto ?? transacao.tipo_gasto ?? "";

    return {
      ...transacao,
      valor: Number(String(transacao.valor ?? 0).replace(",", ".")),
      tipoGasto: String(tipoGastoBruto).trim().toLowerCase(),
      id: String(transacao.id ?? ""),
      data: String(transacao.data ?? ""),
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
    setTransacoes([]);
  };

  const fetchAutenticado = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const headers = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
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

  useEffect(() => {
    if (!token) return;

    fetchAutenticado("/transacoes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTransacoes(data.map(normalizarTransacao));
        }
      })
      .catch((err) => console.error("Erro ao carregar transações:", err));
  }, [token]);

  const bancosUnicos = useMemo(() => {
    if (!Array.isArray(transacoes)) return [];
    const lista = transacoes.map((t) => t.banco).filter(Boolean);
    return Array.from(new Set(lista));
  }, [transacoes]);

  const categoriasUnicas = useMemo(() => {
    if (!Array.isArray(transacoes)) return [];
    const lista = transacoes.map((t) => t.categoria).filter(Boolean);
    return Array.from(new Set(lista));
  }, [transacoes]);

  const transacoesMetricasGerais = useMemo(() => {
    if (!Array.isArray(transacoes)) return [];
    return transacoes.filter((t) => {
      if (!mesFiltro) return true;
      return t?.data ? t.data.startsWith(mesFiltro) : false;
    });
  }, [transacoes, mesFiltro]);

  const transacoesFiltradasHistorico = useMemo(() => {
    if (!Array.isArray(transacoes)) return [];

    return transacoes.filter((t) => {
      if (mesFiltro && !filtros.dataInicio && !filtros.dataFim) {
        if (!t?.data?.startsWith(mesFiltro)) return false;
      }

      if (filtros.dataInicio && t.data < filtros.dataInicio) return false;
      if (filtros.dataFim && t.data > filtros.dataFim) return false;

      if (filtros.tipo !== "todos" && t.tipo !== filtros.tipo) return false;

      // Filtro de Fixos vs Variáveis
      if (filtros.tipoGasto !== "todos") {
        if (t.tipo !== "despesa") return false;
        const tipoGastoItem = String(
          t.tipoGasto ?? t.tipogasto ?? t.tipo_gasto ?? ""
        )
          .trim()
          .toLowerCase();

        if (
          filtros.tipoGasto === "fixo" &&
          !tipoGastoItem.includes("fixo")
        ) {
          return false;
        }
        if (
          filtros.tipoGasto === "variavel" &&
          tipoGastoItem.includes("fixo")
        ) {
          return false;
        }
      }

      if (filtros.status === "pago" && !t.pago) return false;
      if (filtros.status === "pendente" && t.pago) return false;

      if (
        filtros.descricao.trim() !== "" &&
        !normalizarTexto(t.descricao).includes(
          normalizarTexto(filtros.descricao)
        )
      ) {
        return false;
      }

      if (filtros.banco !== "todos" && t.banco !== filtros.banco) return false;

      if (
        filtros.categoria !== "todas" &&
        t.categoria !== filtros.categoria
      ) {
        return false;
      }

      return true;
    });
  }, [transacoes, mesFiltro, filtros]);

  const handleLimparFiltrosHistorico = () => {
    setFiltros({
      tipo: "todos",
      tipoGasto: "todos",
      status: "todos",
      descricao: "",
      banco: "todos",
      categoria: "todas",
      dataInicio: "",
      dataFim: "",
    });
  };

  const handleAdicionarTransacao = async (
    novaTransacao: Omit<Transacao, "id">
  ) => {
    try {
      const response = await fetchAutenticado("/transacoes", {
        method: "POST",
        body: JSON.stringify(novaTransacao),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          `Erro ao salvar transação: ${
            data.erro || data.mensagem || "Falha no servidor"
          }`
        );
        return;
      }

      setTransacoes((prev) => [normalizarTransacao(data), ...prev]);
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
    }
  };

  const handleDeletarTransacao = async (id: string) => {
    try {
      const response = await fetchAutenticado(`/transacoes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTransacoes((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Erro ao deletar transação:", err);
    }
  };

  const handleAlternarPago = async (id: string) => {
    try {
      const transacaoAtual = transacoes.find((t) => t.id === id);
      if (!transacaoAtual) return;

      const response = await fetchAutenticado(`/transacoes/${id}/pago`, {
        method: "PATCH",
        body: JSON.stringify({ pago: !transacaoAtual.pago }),
      });

      if (response.ok) {
        setTransacoes((prev) =>
          prev.map((t) => (t.id === id ? { ...t, pago: !t.pago } : t))
        );
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm shadow-slate-950/20">
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

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-slate-950/20">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Métricas Gerais por Mês
            </h2>
            <p className="text-xs text-slate-400">
              Selecione o mês de referência para o resumo e gráficos
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

        <DashboardResumo transacoes={transacoesMetricasGerais} />
        <SaldosPorBanco transacoes={transacoes} />

        <SecaoGraficos transacoes={transacoesMetricasGerais} />

        <FormularioTransacao onAdicionarTransacao={handleAdicionarTransacao} />

        <div className="mt-8">
          <FiltrosTransacao
            filtros={filtros}
            setFiltros={setFiltros}
            bancos={bancosUnicos}
            categorias={categoriasUnicas}
            onLimpar={handleLimparFiltrosHistorico}
          />

          <ListaTransacoes
            transacoes={transacoesFiltradasHistorico}
            onDeletarTransacao={handleDeletarTransacao}
            onAlternarPago={handleAlternarPago}
          />
        </div>

        <Footer />
      </main>
    </div>
  );
}