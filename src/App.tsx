import { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "./components/Header";
import { DashboardResumo } from "./components/DashboardResumo";
import { FormularioTransacao } from "./components/FormularioTransacao";
import { FormularioCartao } from "./components/FormularioCartao";
import { ListaTransacoes } from "./components/ListaTransacoes";
import type { Transacao } from "./types/finance";
import type { CartaoCredito } from "./types/cartao";
import { Footer } from "./components/Footer";
import { SaldosPorBanco } from "./components/SaldosPorBanco";
import { Login } from "./components/Login";
import { SecaoGraficos } from "./components/SecaoGraficos";
import { AcoesRapidas } from "./components/AcoesRapidas";
import {
  FiltrosTransacao,
  type FiltrosState,
} from "./components/FiltrosTransacao";
import { SecaoMetasLimites } from "./components/SecaoMetasLimites";
import type { MetaCategoria } from "./types/meta";

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
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState<Transacao | null>(null);

  const [metas, setMetas] = useState<MetaCategoria[]>([]);

  const formularioRef = useRef<HTMLDivElement>(null);

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

    const metodoPagamentoBruto =
      transacao.metodoPagamento ?? transacao.metodo_pagamento ?? "pix";

    return {
      ...transacao,
      valor: Number(String(transacao.valor ?? 0).replace(",", ".")),
      tipoGasto: String(tipoGastoBruto).trim().toLowerCase(),
      metodoPagamento: String(metodoPagamentoBruto).trim().toLowerCase(),
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
    setCartoes([]);
    setMetas([]);
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

  useEffect(() => {
    if (!token) return;

    fetchAutenticado("/cartoes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCartoes(data);
        }
      })
      .catch((err) => console.error("Erro ao carregar cartões:", err));
  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetchAutenticado("/metas")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMetas(data);
        }
      })
      .catch((err) => console.error("Erro ao carregar metas:", err));
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

      if (filtros.tipoGasto !== "todos") {
        if (t.tipo !== "despesa") return false;
        const tipoGastoItem = String(
          t.tipoGasto ?? t.tipogasto ?? t.tipo_gasto ?? ""
        )
          .trim()
          .toLowerCase();

        if (filtros.tipoGasto === "fixo" && !tipoGastoItem.includes("fixo")) {
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

      if (filtros.categoria !== "todas" && t.categoria !== filtros.categoria) {
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

  const handleEditarTransacao = async (
    id: string,
    transacaoAtualizada: Omit<Transacao, "id">
  ) => {
    try {
      const response = await fetchAutenticado(`/transacoes/${id}`, {
        method: "PUT",
        body: JSON.stringify(transacaoAtualizada),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          `Erro ao atualizar transação: ${
            data.erro || data.mensagem || "Falha no servidor"
          }`
        );
        return;
      }

      setTransacoes((prev) =>
        prev.map((t) => (t.id === id ? normalizarTransacao(data) : t))
      );
      setTransacaoEmEdicao(null);
    } catch (err) {
      console.error("Erro ao editar transação:", err);
    }
  };

  const handleIniciarEdicao = (transacao: Transacao) => {
    setTransacaoEmEdicao(transacao);
    if (formularioRef.current) {
      formularioRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAdicionarCartao = async (
    novoCartao: Omit<CartaoCredito, "id">
  ) => {
    try {
      const response = await fetchAutenticado("/cartoes", {
        method: "POST",
        body: JSON.stringify(novoCartao),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          `Erro ao cadastrar cartão: ${
            data.erro || data.mensagem || "Falha no servidor"
          }`
        );
        return;
      }

      setCartoes((prev) => [...prev, data]);
      alert("Cartão cadastrado com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar cartão:", err);
    }
  };

  const handleDeletarCartao = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este cartão?")) return;

    try {
      const response = await fetchAutenticado(`/cartoes/${id}`, {
        method: "DELETE",
      });

      const rawText = await response.text();
      let data: any = {};

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(
          `Servidor retornou erro (${response.status}). Certifique-se de ter reiniciado o backend para carregar a rota DELETE.`
        );
      }

      if (!response.ok) {
        alert(data.mensagem || "Não foi possível excluir o cartão.");
        return;
      }

      setCartoes((prev) => prev.filter((c) => Number(c.id) !== id));
      alert(data.mensagem || "Cartão excluído com sucesso!");
    } catch (err: any) {
      console.error("Erro ao excluir cartão:", err);
      alert(err.message || "Erro de conexão ao tentar excluir o cartão.");
    }
  };

  const handleDuplicarGastosFixos = async () => {
    if (!mesFiltro) {
      alert(
        "Por favor, selecione um mês de referência no filtro superior para realizar a importação."
      );
      return;
    }

    const [anoDestino, mesDestino] = mesFiltro.split("-").map(Number);

    const dataOrigem = new Date(anoDestino, mesDestino - 2, 1);
    const mesOrigemNum = dataOrigem.getMonth() + 1;
    const anoOrigemNum = dataOrigem.getFullYear();

    const gastosFixosMesAnterior = transacoes.filter((t) => {
      if (!t.data) return false;

      let ano: number = 0;
      let mes: number = 0;

      if (t.data.includes("-")) {
        const partes = t.data.split("-").map(Number);
        ano = partes[0];
        mes = partes[1];
      } else if (t.data.includes("/")) {
        const partes = t.data.split("/").map(Number);
        mes = partes[1];
        ano = partes[2];
      } else {
        return false;
      }

      const tipoGasto = String(
        t.tipoGasto ?? t.tipogasto ?? t.tipo_gasto ?? ""
      ).toLowerCase();

      return (
        t.tipo === "despesa" &&
        tipoGasto.includes("fixo") &&
        mes === mesOrigemNum &&
        ano === anoOrigemNum
      );
    });

    if (gastosFixosMesAnterior.length === 0) {
      alert(
        `Nenhum gasto fixo foi encontrado no mês ${String(
          mesOrigemNum
        ).padStart(2, "0")}/${anoOrigemNum} para importar.`
      );
      return;
    }

    const strOrigem = `${String(mesOrigemNum).padStart(
      2,
      "0"
    )}/${anoOrigemNum}`;
    const strDestino = `${String(mesDestino).padStart(2, "0")}/${anoDestino}`;

    const confirmacao = window.confirm(
      `Encontramos ${gastosFixosMesAnterior.length} gasto(s) fixo(s) em ${strOrigem}. Deseja importá-los para ${strDestino} como PENDENTES?`
    );

    if (!confirmacao) return;

    try {
      for (const gasto of gastosFixosMesAnterior) {
        let diaStr = "01";

        if (gasto.data.includes("-")) {
          diaStr = gasto.data.split("-")[2];
        } else if (gasto.data.includes("/")) {
          diaStr = gasto.data.split("/")[0];
        }

        const novaData = `${anoDestino}-${String(mesDestino).padStart(
          2,
          "0"
        )}-${diaStr.padStart(2, "0")}`;

        const novaTransacao: Omit<Transacao, "id"> = {
          descricao: gasto.descricao,
          valor: gasto.valor,
          tipo: "despesa",
          tipoGasto: "fixo",
          categoria: gasto.categoria,
          banco: gasto.banco,
          metodoPagamento: gasto.metodoPagamento || gasto.metodo_pagamento || "pix",
          pago: false,
          data: novaData,
        };

        await handleAdicionarTransacao(novaTransacao);
      }

      alert(`Gastos fixos importados com sucesso para ${strDestino}!`);
    } catch (error) {
      console.error("Erro ao duplicar gastos fixos:", error);
      alert("Ocorreu um erro ao importar alguns gastos.");
    }
  };

  const handlePagarFaturaLote = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await fetchAutenticado(`/transacoes/${id}/pago`, {
          method: "PATCH",
          body: JSON.stringify({ pago: true }),
        });
      }

      setTransacoes((prev) =>
        prev.map((t) => (ids.includes(t.id) ? { ...t, pago: true } : t))
      );

      alert("Fatura quitada com sucesso!");
    } catch (err) {
      console.error("Erro ao quitar fatura:", err);
      alert("Erro ao tentar quitar a fatura.");
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

  const handleAlternarPago = async (transacao: Transacao) => {
    try {
      const response = await fetchAutenticado(`/transacoes/${transacao.id}/pago`, {
        method: "PATCH",
        body: JSON.stringify({ pago: !transacao.pago }),
      });
      
      console.log("Resposta do servidor:", response.status); // <--- E isso

      if (response.ok) {
        setTransacoes((prev) =>
          prev.map((t) => (t.id === transacao.id ? { ...t, pago: !t.pago } : t))
        );
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const handleAdicionarMeta = async (novaMeta: Omit<MetaCategoria, "id">) => {
    try {
      const response = await fetchAutenticado("/metas", {
        method: "POST",
        body: JSON.stringify(novaMeta),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Erro ao cadastrar meta: ${data.mensagem || "Falha no servidor"}`);
        return;
      }

      setMetas((prev) => [...prev, data]);
    } catch (err) {
      console.error("Erro ao salvar meta:", err);
    }
  };

  const handleDeletarMeta = async (id: string) => {
    try {
      const response = await fetchAutenticado(`/metas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMetas((prev) => prev.filter((m) => m.id !== id));
      } else {
        const data = await response.json();
        alert(data.mensagem || "Erro ao excluir meta.");
      }
    } catch (err) {
      console.error("Erro ao deletar meta:", err);
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
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
            />
            {mesFiltro && (
              <button
                onClick={() => setMesFiltro("")}
                className="text-xs text-slate-400 hover:text-slate-200 underline px-2 py-1 cursor-pointer"
              >
                Balanço Geral
              </button>
            )}
          </div>
        </div>

        <DashboardResumo transacoes={transacoesMetricasGerais} />

        <SecaoMetasLimites
          transacoes={transacoesMetricasGerais}
          categorias={categoriasUnicas}
          mesAtual={mesFiltro}
          metas={metas}
          onAdicionarMeta={handleAdicionarMeta}
          onDeletarMeta={handleDeletarMeta}
        />

        <SaldosPorBanco transacoes={transacoes} />

        <SecaoGraficos transacoes={transacoesMetricasGerais} />

        <AcoesRapidas onDuplicarGastosFixos={handleDuplicarGastosFixos} />

        <FormularioCartao
          onAdicionarCartao={handleAdicionarCartao}
          cartoes={cartoes}
          onDeletarCartao={handleDeletarCartao}
        />

        <div ref={formularioRef}>
          <FormularioTransacao
            onAdicionarTransacao={handleAdicionarTransacao}
            onEditarTransacao={handleEditarTransacao}
            transacaoEmEdicao={transacaoEmEdicao}
            onCancelarEdicao={() => setTransacaoEmEdicao(null)}
            cartoes={cartoes}
          />
        </div>

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
            onIniciarEdicao={handleIniciarEdicao}
            onPagarFaturaLote={handlePagarFaturaLote}
          />
        </div>

        <Footer />
      </main>
    </div>
  );
}