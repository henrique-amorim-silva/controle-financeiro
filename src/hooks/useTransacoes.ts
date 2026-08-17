import { useState, useEffect, useMemo, useRef } from "react";
import type { Transacao } from "../types/finance";
import type { FiltrosState } from "../components/FiltrosTransacao";

const normalizarTexto = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function useTransacoes(
  token: string | null,
  fetchAutenticado: (endpoint: string, options?: RequestInit) => Promise<Response>
) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState<Transacao | null>(null);
  const [mesFiltro, setMesFiltro] = useState<string>("2026-08");

  const formularioRef = useRef<HTMLDivElement>(null);

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
        if (filtros.tipoGasto === "variavel" && tipoGastoItem.includes("fixo")) {
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
      formularioRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
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
      const response = await fetchAutenticado(
        `/transacoes/${transacao.id}/pago`,
        {
          method: "PATCH",
          body: JSON.stringify({ pago: !transacao.pago }),
        }
      );

      if (response.ok) {
        setTransacoes((prev) =>
          prev.map((t) =>
            t.id === transacao.id ? { ...t, pago: !t.pago } : t
          )
        );
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
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

      let ano = 0;
      let mes = 0;

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
        `Nenhum gasto fixo encontrado em ${String(mesOrigemNum).padStart(
          2,
          "0"
        )}/${anoOrigemNum} para importar.`
      );
      return;
    }

    const strOrigem = `${String(mesOrigemNum).padStart(2, "0")}/${anoOrigemNum}`;
    const strDestino = `${String(mesDestino).padStart(2, "0")}/${anoDestino}`;

    if (
      !window.confirm(
        `Encontramos ${gastosFixosMesAnterior.length} gasto(s) fixo(s) em ${strOrigem}. Deseja importá-los para ${strDestino} como PENDENTES?`
      )
    )
      return;

    try {
      for (const gasto of gastosFixosMesAnterior) {
        let diaStr = "01";
        if (gasto.data.includes("-")) diaStr = gasto.data.split("-")[2];
        else if (gasto.data.includes("/")) diaStr = gasto.data.split("/")[0];

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
          metodoPagamento:
            gasto.metodoPagamento || gasto.metodo_pagamento || "pix",
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