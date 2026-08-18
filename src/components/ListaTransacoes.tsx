import React, { useState, useEffect } from "react";
import type { Transacao } from "../types/finance";
import { formatarData } from "../utils/formatters";

interface ListaTransacoesProps {
  transacoes: Transacao[];
  onDeletarTransacao: (id: string) => void;
  onAlternarPago: (transacao: Transacao) => void;
  onIniciarEdicao?: (transacao: Transacao) => void;
  onPagarFaturaLote?: (ids: string[]) => Promise<void> | void;
}

const formatarFormaPagamento = (metodo?: string) => {
  if (!metodo) return "—";
  const m = metodo.toLowerCase();
  if (m.includes("cartao_credito") || m.includes("credito")) return "Cartão de Crédito";
  if (m.includes("pix")) return "PIX";
  if (m.includes("debito")) return "Débito";
  if (m.includes("dinheiro")) return "Dinheiro";
  return metodo;
};

export const ListaTransacoes: React.FC<ListaTransacoesProps> = ({
  transacoes = [],
  onDeletarTransacao,
  onAlternarPago,
  onIniciarEdicao,
  onPagarFaturaLote: _onPagarFaturaLote,
}) => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

  useEffect(() => {
    setPaginaAtual(1);
  }, [transacoes]);

  if (!transacoes || transacoes.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        Nenhum lançamento encontrado.
      </div>
    );
  }

  const totalItens = transacoes.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const transacoesPaginadas = transacoes.slice(indiceInicial, indiceFinal);

  const handleMudarItensPorPagina = (novosItens: number) => {
    setItensPorPagina(novosItens);
    setPaginaAtual(1);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-md shadow-slate-950/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="p-3">Status</th>
              <th className="p-3">Data</th>
              <th className="p-3">Descrição</th>
              <th className="p-3">Classificação</th>
              <th className="p-3">Forma de Pagamento</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Banco / Conta</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transacoesPaginadas.map((t) => {
              const tipoGastoValor = String(
                t.tipoGasto ?? t.tipogasto ?? t.tipo_gasto ?? ""
              ).toLowerCase();

              const bancoDestinoFinal = t.bancoDestino || t.banco_destino;
              const isTransferencia = t.tipo === "transferencia";
              const estaPago = Boolean(t.pago);
              const valorNumerico = Number(t.valor || 0);
              const metodoPagamento = t.metodoPagamento || t.metodo_pagamento;

              return (
                <tr
                  key={t.id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => onAlternarPago(t)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase cursor-pointer transition-colors ${
                        estaPago
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                      }`}
                    >
                      {estaPago ? "Concluído" : "Pendente"}
                    </button>
                  </td>

                  <td className="p-3 whitespace-nowrap text-slate-400">
                    {t.data ? formatarData(t.data) : "-"}
                  </td>

                  <td className="p-3 font-medium text-slate-100">
                    {t.descricao || "(Sem Descrição)"}
                  </td>

                  <td className="p-3">
                    {isTransferencia ? (
                      <span className="px-2 py-0.5 rounded-lg border text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                        Transferência
                      </span>
                    ) : t.tipo === "despesa" ? (
                      <span
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-medium capitalize ${
                          tipoGastoValor.includes("fixo")
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                        }`}
                      >
                        {tipoGastoValor.includes("fixo") ? "Fixo" : "Variável"}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  <td className="p-3">
                    <span className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700/50">
                      {formatarFormaPagamento(metodoPagamento)}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700/50">
                      {t.categoria || (isTransferencia ? "Transferência" : "Geral")}
                    </span>
                  </td>

                  <td className="p-3 text-slate-300">
                    {isTransferencia && bancoDestinoFinal ? (
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-slate-300">{t.banco || "Geral"}</span>
                        <span className="text-cyan-400 font-bold">➔</span>
                        <span className="text-slate-200">{bancoDestinoFinal}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">{t.banco || "Geral"}</span>
                    )}
                  </td>

                  <td
                    className={`p-3 text-right font-semibold whitespace-nowrap ${
                      isTransferencia
                        ? "text-cyan-400"
                        : t.tipo === "receita"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {isTransferencia ? "↔ " : t.tipo === "receita" ? "+ " : "- "}
                    R${" "}
                    {valorNumerico.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {onIniciarEdicao && (
                        <button
                          type="button"
                          onClick={() => onIniciarEdicao(t)}
                          className="text-slate-500 hover:text-amber-400 transition-colors p-1 cursor-pointer"
                          title="Editar Lançamento"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 012.828 0L20.5 5.828a2 2 0 010 2.828L11.828 17.172a2 2 0 01-.707.414l-4 1 1-4a2 2 0 01.414-.707l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeletarTransacao(t.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                        title="Excluir Lançamento"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Exibir:</span>
          <select
            value={itensPorPagina}
            onChange={(e) => handleMudarItensPorPagina(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700/80 text-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value={10}>10 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
          <span className="ml-2 hidden sm:inline">
            Mostrando {Math.min(indiceInicial + 1, totalItens)}–
            {Math.min(indiceFinal, totalItens)} de {totalItens} resultados
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="sm:hidden">
            Página {paginaAtual} de {totalPaginas}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors font-medium cursor-pointer"
            >
              Anterior
            </button>

            <span className="hidden sm:inline px-3 text-slate-400 font-medium">
              {paginaAtual} / {totalPaginas}
            </span>

            <button
              type="button"
              onClick={() =>
                setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
              }
              disabled={paginaAtual === totalPaginas || totalPaginas === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors font-medium cursor-pointer"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaTransacoes;