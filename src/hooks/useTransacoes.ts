import { useState, useEffect, useMemo, useRef } from "react";
import type { Transacao } from "../types/finance";
import type { FiltrosState } from "../components/FiltrosTransacao";
import { supabase } from "../services/supabaseClient";

const normalizarTexto = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function useTransacoes(token: string | null) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState<Transacao | null>(null);
  const [mesFiltro, setMesFiltro] = useState<string>(() => {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
  });

  const formularioRef = useRef<HTMLDivElement>(null);

  const [filtros, setFiltros] = useState<FiltrosState>({
    tipo: "todos",
    tipoGasto: "todos",
    status: "todos",
    metodoPagamento: "todos",
    descricao: "",
    banco: "todos",
    categoria: "todas",
    dataInicio: "",
    dataFim: "",
  });

  const normalizarTransacao = (transacao: Record<string, unknown>): Transacao => {
    const tipoGastoBruto =
      transacao.tipoGasto ?? transacao.tipogasto ?? transacao.tipo_gasto ?? "";
    const metodoPagamentoBruto =
      transacao.metodoPagamento ?? transacao.metodo_pagamento ?? "pix";
    const cartaoIdBruto = transacao.cartaoId ?? transacao.cartao_id;

    return {
      ...(transacao as unknown as Transacao),
      valor: Number(String(transacao.valor ?? 0).replace(",", ".")),
      tipoGasto: String(tipoGastoBruto).trim().toLowerCase(),
      metodoPagamento: String(metodoPagamentoBruto).trim().toLowerCase(),
      id: String(transacao.id ?? ""),
      data: String(transacao.data ?? ""),
      cartaoId: cartaoIdBruto ? String(cartaoIdBruto) : undefined,
      bancoDestino: String(transacao.bancoDestino ?? transacao.banco_destino ?? ""),
    };
  };

  useEffect(() => {
    if (!token) return;

    const carregarTransacoes = async () => {
      const { data, error } = await supabase
        .from("transacoes")
        .select("*")
        .eq("usuario_id", token) // Correlação com a tabela usuarios
        .order("data", { ascending: false });

      if (error) {
        console.error("Erro ao carregar transações:", error);
      } else if (data) {
        setTransacoes(data.map((item) => normalizarTransacao(item as Record<string, unknown>)));
      }
    };

    carregarTransacoes();
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
        const tObj = t as unknown as Record<string, unknown>;
        const tipoGastoItem = String(
          t.tipoGasto ?? tObj.tipogasto ?? tObj.tipo_gasto ?? ""
        )
          .trim()
          .toLowerCase();

        if (filtros.tipoGasto === "fixo" && !tipoGastoItem.includes("fixo")) {
          return false;
        }
        if (filtros.tipoGasto === "variavel" && tipoGastoItem.includes("fixo")) {
          return false;
        }
      }

      if (filtros.status === "pago" && !t.pago) return false;
      if (filtros.status === "pendente" && t.pago) return false;

      if (filtros.metodoPagamento !== "todos") {
        const metodoItem = (t.metodoPagamento || (t as unknown as Record<string, unknown>).metodo_pagamento || "").toString().toLowerCase();
        if (!metodoItem.includes(filtros.metodoPagamento.toLowerCase())) {
          return false;
        }
      }

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
      metodoPagamento: "todos",
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
      const payload = {
        descricao: novaTransacao.descricao,
        valor: novaTransacao.valor,
        tipo: novaTransacao.tipo,
        tipogasto: novaTransacao.tipoGasto,
        categoria: novaTransacao.categoria,
        banco: novaTransacao.banco,
        banco_destino: novaTransacao.bancoDestino,
        pago: novaTransacao.pago,
        data: novaTransacao.data,
        metodo_pagamento: novaTransacao.metodoPagamento,
        cartao_id: novaTransacao.cartaoId ? Number(novaTransacao.cartaoId) : null,
        usuario_id: token, // Associa à tabela usuarios
      };

      const { data, error } = await supabase
        .from("transacoes")
        .insert([payload])
        .select()
        .single();

      if (error) {
        alert(`Erro ao salvar transação: ${error.message}`);
        return;
      }

      if (data) {
        setTransacoes((prev) => [normalizarTransacao(data as Record<string, unknown>), ...prev]);
      }
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
    }
  };

  const handleEditarTransacao = async (
    id: string,
    transacaoAtualizada: Omit<Transacao, "id">
  ) => {
    try {
      const payload = {
        descricao: transacaoAtualizada.descricao,
        valor: transacaoAtualizada.valor,
        tipo: transacaoAtualizada.tipo,
        tipogasto: transacaoAtualizada.tipoGasto,
        categoria: transacaoAtualizada.categoria,
        banco: transacaoAtualizada.banco,
        banco_destino: transacaoAtualizada.bancoDestino,
        pago: transacaoAtualizada.pago,
        data: transacaoAtualizada.data,
        metodo_pagamento: transacaoAtualizada.metodoPagamento,
        cartao_id: transacaoAtualizada.cartaoId ? Number(transacaoAtualizada.cartaoId) : null,
      };

      const { data, error } = await supabase
        .from("transacoes")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        alert(`Erro ao atualizar transação: ${error.message}`);
        return;
      }

      if (data) {
        setTransacoes((prev) =>
          prev.map((t) => (t.id === id ? normalizarTransacao(data as Record<string, unknown>) : t))
        );
        setTransacaoEmEdicao(null);
      }
    } catch (err) {
      console.error("Erro ao editar transação:", err);
    }
  };

  const handleIniciarEdicao = (transacao: Transacao) => {
    setTransacaoEmEdicao(transacao);
    if (formularioRef.current) {
      formularioRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleDeletarTransacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transacoes")
        .delete()
        .eq("id", id);

      if (!error) {
        setTransacoes((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(`Erro ao excluir transação: ${error.message}`);
      }
    } catch (err) {
      console.error("Erro ao deletar transação:", err);
    }
  };

  const handleAlternarPago = async (transacao: Transacao) => {
    try {
      const novoStatus = !transacao.pago;
      const { error } = await supabase
        .from("transacoes")
        .update({ pago: novoStatus })
        .eq("id", transacao.id);

      if (!error) {
        setTransacoes((prev) =>
          prev.map((t) =>
            t.id === transacao.id ? { ...t, pago: novoStatus } : t
          )
        );
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const handlePagarFaturaLote = async (cartaoIdSelecionado: string) => {
    try {
      const transacoesParaPagar = transacoes.filter((t) => {
        const transacaoCartaoId = (t.cartaoId || (t as unknown as Record<string, unknown>).cartao_id || "").toString();
        const matchCartaoId = transacaoCartaoId === cartaoIdSelecionado;
        const matchMes = mesFiltro ? t.data?.startsWith(mesFiltro) : true;
        const ePendente = !t.pago;
        const metodo = (t.metodoPagamento || (t as unknown as Record<string, unknown>).metodo_pagamento || "").toString().toLowerCase();
        const ehCartaoCredito = metodo.includes("cartao_credito") || metodo.includes("crédito");

        return matchCartaoId && matchMes && ePendente && ehCartaoCredito;
      });

      if (transacoesParaPagar.length === 0) {
        alert(`Não há faturas de cartão de crédito pendentes para este cartão no mês ${mesFiltro || 'selecionado'}.`);
        return;
      }

      const ids = transacoesParaPagar.map((t) => t.id);

      const { error } = await supabase
        .from("transacoes")
        .update({ pago: true })
        .in("id", ids);

      if (error) {
        alert(`Erro ao quitar fatura: ${error.message}`);
        return;
      }

      setTransacoes((prev) =>
        prev.map((t) => (ids.includes(t.id) ? { ...t, pago: true } : t))
      );

      alert(`Fatura de cartão de crédito quitada com sucesso!`);
    } catch (err) {
      console.error("Erro ao quitar fatura:", err);
      alert("Erro ao tentar quitar a fatura.");
    }
  };

  const handleDuplicarGastosFixos = async () => {
    if (!mesFiltro) {
      alert("Por favor, selecione um mês de referência no filtro superior.");
      return;
    }

    const [anoDestino, mesDestino] = mesFiltro.split("-").map(Number);
    const dataOrigem = new Date(anoDestino, mesDestino - 2, 1);
    const mesOrigemNum = dataOrigem.getMonth() + 1;
    const anoOrigemNum = dataOrigem.getFullYear();

    const gastosFixosMesAnterior = transacoes.filter((t) => {
      if (!t.data) return false;
      const partes = t.data.split("-").map(Number);
      const ano = partes[0];
      const mes = partes[1];
      const tipoGasto = String(t.tipoGasto || "").toLowerCase();

      return (
        t.tipo === "despesa" &&
        tipoGasto.includes("fixo") &&
        mes === mesOrigemNum &&
        ano === anoOrigemNum
      );
    });

    if (gastosFixosMesAnterior.length === 0) {
      alert(`Nenhum gasto fixo encontrado no período anterior para importar.`);
      return;
    }

    if (!window.confirm(`Deseja importar ${gastosFixosMesAnterior.length} gasto(s) fixo(s) para ${mesFiltro} como PENDENTES?`))
      return;

    try {
      for (const gasto of gastosFixosMesAnterior) {
        const diaStr = gasto.data.split("-")[2] || "01";
        const novaData = `${anoDestino}-${String(mesDestino).padStart(2, "0")}-${diaStr}`;

        await handleAdicionarTransacao({
          descricao: gasto.descricao,
          valor: gasto.valor,
          tipo: "despesa",
          tipoGasto: "fixo",
          categoria: gasto.categoria,
          banco: gasto.banco,
          metodoPagamento: gasto.metodoPagamento || "pix",
          pago: false,
          data: novaData,
        });
      }
      alert(`Gastos fixos importados com sucesso!`);
    } catch (error) {
      console.error("Erro ao duplicar gastos fixos:", error);
      alert("Ocorreu um erro ao importar alguns gastos.");
    }
  };

  return {
    transacoes,
    setTransacoes,
    transacaoEmEdicao,
    setTransacaoEmEdicao,
    mesFiltro,
    setMesFiltro,
    filtros,
    setFiltros,
    formularioRef,
    bancosUnicos,
    categoriasUnicas,
    transacoesMetricasGerais,
    transacoesFiltradasHistorico,
    handleLimparFiltrosHistorico,
    handleAdicionarTransacao,
    handleEditarTransacao,
    handleIniciarEdicao,
    handleDeletarTransacao,
    handleAlternarPago,
    handlePagarFaturaLote,
    handleDuplicarGastosFixos,
  };
}

export default useTransacoes;