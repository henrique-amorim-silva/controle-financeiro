import React, { useState, useEffect } from "react";
import type { CartaoCredito } from "../types/cartao";
import {
  opcoesBanco,
  opcoesCategoriaDespesa,
  opcoesCategoriaReceita,
  opcoesMetodoPagamento,
  opcoesTipoGasto,
  opcoesTipoTransacao,
  type Banco,
  type MetodoPagamento,
  type TipoGasto,
  type TipoTransacao,
  type Transacao,
} from "../types/finance";
import { calcularVencimentoFatura } from "../utils/cartaoUtils";

interface FormularioTransacaoProps {
  onAdicionarTransacao: (
    transacao: Omit<Transacao, "id">
  ) => Promise<void> | void;
  onEditarTransacao?: (
    id: string,
    transacao: Omit<Transacao, "id">
  ) => Promise<void> | void;
  transacaoEmEdicao?: Transacao | null;
  onCancelarEdicao?: () => void;
  cartoes?: CartaoCredito[];
}

export const FormularioTransacao: React.FC<FormularioTransacaoProps> = ({
  onAdicionarTransacao,
  onEditarTransacao,
  transacaoEmEdicao,
  onCancelarEdicao,
  cartoes = [],
}) => {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>("despesa");
  const [tipoGasto, setTipoGasto] = useState<TipoGasto>("variavel");
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>("pix");
  const [cartaoId, setCartaoId] = useState<string>("");
  const [totalParcelas, setTotalParcelas] = useState<number>(1);
  const [categoria, setCategoria] = useState<string>("Moradia");
  const [banco, setBanco] = useState<Banco>("Nubank");
  const [bancoDestino, setBancoDestino] = useState<Banco>("Banco do Brasil");
  const [pago, setPago] = useState(true);
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (transacaoEmEdicao) {
      setDescricao(transacaoEmEdicao.descricao || "");
      
      const valorNum = Number(transacaoEmEdicao.valor || 0);
      setValor(
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(valorNum)
      );

      setTipo(transacaoEmEdicao.tipo || "despesa");
      
      const tipoGastoBruto = (
        transacaoEmEdicao.tipoGasto ?? 
        transacaoEmEdicao.tipogasto ?? 
        transacaoEmEdicao.tipo_gasto ?? 
        "variavel"
      ) as TipoGasto;
      setTipoGasto(tipoGastoBruto.includes("fixo") ? "fixo" : "variavel");

      setCategoria(transacaoEmEdicao.categoria || "Geral");
      setBanco(transacaoEmEdicao.banco || "Geral");
      setBancoDestino(transacaoEmEdicao.bancoDestino || transacaoEmEdicao.banco_destino || "Banco do Brasil");
      setPago(transacaoEmEdicao.pago ?? true);
      
      if (transacaoEmEdicao.data) {
        const dataFormatada = transacaoEmEdicao.data.split("T")[0];
        setData(dataFormatada);
      }

      if (transacaoEmEdicao.metodoPagamento) {
        setMetodoPagamento(transacaoEmEdicao.metodoPagamento);
      }
    } else {
      resetForm();
    }
  }, [transacaoEmEdicao]);

  const resetForm = () => {
    setDescricao("");
    setValor("");
    setTipo("despesa");
    setTipoGasto("variavel");
    setMetodoPagamento("pix");
    setCartaoId("");
    setTotalParcelas(1);
    setCategoria("Moradia");
    setBanco("Nubank");
    setBancoDestino("Banco do Brasil");
    setPago(true);
    setData(new Date().toISOString().split("T")[0]);
  };

  const handleValorChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setValor("");
      return;
    }

    const numericValue = Number(digits) / 100;
    setValor(
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao || !valor || !data) {
      alert("Preencha os campos obrigatórios (Descrição, Valor e Data).");
      return;
    }

    if (tipo === "transferencia" && banco === bancoDestino) {
      alert("O banco de origem deve ser diferente do banco de destino.");
      return;
    }

    const valorNumerico =
      typeof valor === "string"
        ? Number(
            valor
              .replace(/[^\d,.-]/g, "")
              .replace(".", "")
              .replace(",", ".")
          )
        : Number(valor);

    if (transacaoEmEdicao) {
      // Edição de transação existente
      const transacaoAtualizada: Omit<Transacao, "id"> = {
        descricao,
        valor: valorNumerico,
        tipo,
        tipoGasto: tipo === "despesa" ? tipoGasto : undefined,
        tipogasto: tipo === "despesa" ? tipoGasto : undefined,
        categoria: tipo === "transferencia" ? "Transferência" : categoria || "Geral",
        banco: banco || "Geral",
        bancoDestino: tipo === "transferencia" ? bancoDestino : undefined,
        banco_destino: tipo === "transferencia" ? bancoDestino : undefined,
        pago,
        data,
        metodoPagamento: tipo === "despesa" ? metodoPagamento : undefined,
      };

      if (onEditarTransacao) {
        await onEditarTransacao(transacaoEmEdicao.id, transacaoAtualizada);
      }
    } else {
      // Inserção de nova transação
      if (tipo === "despesa" && metodoPagamento === "cartao_credito") {
        const cartaoSelecionado = cartoes.find(
          (c) => String(c.id) === String(cartaoId)
        );

        if (!cartaoSelecionado) {
          alert("Selecione um cartão de crédito para continuar.");
          return;
        }

        const valorParcela = valorNumerico / totalParcelas;

        for (let i = 0; i < totalParcelas; i++) {
          const dataVencimentoFatura = calcularVencimentoFatura(
            data,
            cartaoSelecionado,
            i
          );

          const novaTransacao: Omit<Transacao, "id"> = {
            descricao:
              totalParcelas > 1
                ? `${descricao} (${i + 1}/${totalParcelas})`
                : descricao,
            valor: valorParcela,
            tipo: "despesa",
            tipoGasto,
            tipogasto: tipoGasto,
            categoria: "Cartão de Crédito",
            banco: cartaoSelecionado.banco,
            pago: false,
            data: dataVencimentoFatura,
            metodoPagamento: "cartao_credito",
            cartaoId: String(cartaoSelecionado.id),
            dataVencimentoFatura,
            parcelaAtual: i + 1,
            totalParcelas,
          };

          await onAdicionarTransacao(novaTransacao);
        }
      } else {
        const novaTransacao: Omit<Transacao, "id"> = {
          descricao,
          valor: valorNumerico,
          tipo,
          tipoGasto: tipo === "despesa" ? tipoGasto : undefined,
          tipogasto: tipo === "despesa" ? tipoGasto : undefined,
          categoria:
            tipo === "transferencia" ? "Transferência" : categoria || "Geral",
          banco: banco || "Geral",
          bancoDestino: tipo === "transferencia" ? bancoDestino : undefined,
          banco_destino: tipo === "transferencia" ? bancoDestino : undefined,
          pago,
          data,
          metodoPagamento: tipo === "despesa" ? metodoPagamento : undefined,
        };

        await onAdicionarTransacao(novaTransacao);
      }
    }

    resetForm();
    if (onCancelarEdicao) onCancelarEdicao();
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6 shadow-md shadow-slate-950/30">
      <div className="mb-5 border-b border-slate-800 pb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">
          {transacaoEmEdicao ? "Editar Transação" : "Nova Transação"}
        </h3>
        {transacaoEmEdicao && (
          <button
            type="button"
            onClick={onCancelarEdicao}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl transition-colors"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Tipo de Transação
          </label>
          <select
            value={tipo}
            onChange={(e) => {
              const novoTipo = e.target.value as TipoTransacao;
              setTipo(novoTipo);
              if (novoTipo === "despesa") setCategoria("Moradia");
              if (novoTipo === "receita") setCategoria("Salário");
              if (novoTipo === "transferencia") setCategoria("Transferência");
            }}
            className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {opcoesTipoTransacao.map((opcao) => (
              <option key={opcao.value} value={opcao.value}>
                {opcao.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Descrição
          </label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder={
              tipo === "transferencia"
                ? "Ex: Transferência Poupança -> Corrente"
                : "Ex: Supermercado, Aluguel, Salário..."
            }
            required
            className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Valor (R$)
            </label>
            <input
              type="text"
              value={valor}
              onChange={(e) => handleValorChange(e.target.value)}
              placeholder="R$ 0,00"
              required
              className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {tipo === "despesa" && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Classificação do Gasto
              </label>
              <select
                value={tipoGasto}
                onChange={(e) =>
                  setTipoGasto(e.target.value as TipoGasto)
                }
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {opcoesTipoGasto.map((opcao) => (
                  <option key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Método de Pagamento para Despesas */}
        {tipo === "despesa" && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Forma de Pagamento
            </label>
            <select
              value={metodoPagamento}
              onChange={(e) => {
                const metodo = e.target.value as MetodoPagamento;
                setMetodoPagamento(metodo);
                if (metodo === "cartao_credito") {
                  setPago(false);
                  setCategoria("Cartão de Crédito");
                }
              }}
              disabled={!!transacaoEmEdicao}
              className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {opcoesMetodoPagamento.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Campos Condicionais para Cartão de Crédito */}
        {!transacaoEmEdicao && tipo === "despesa" && metodoPagamento === "cartao_credito" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Cartão
              </label>
              <select
                value={cartaoId}
                onChange={(e) => setCartaoId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">Selecione o Cartão</option>
                {cartoes.map((cartao) => (
                  <option key={cartao.id} value={String(cartao.id)}>
                    {cartao.nome} ({cartao.banco})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Número de Parcelas
              </label>
              <select
                value={totalParcelas}
                onChange={(e) => setTotalParcelas(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}x {n === 1 ? "(À vista)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {tipo !== "transferencia" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={
                  tipo === "despesa" && metodoPagamento === "cartao_credito"
                }
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {(tipo === "despesa"
                  ? opcoesCategoriaDespesa
                  : opcoesCategoriaReceita
                ).map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>

            {metodoPagamento !== "cartao_credito" && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Banco / Conta
                </label>
                <select
                  value={banco}
                  onChange={(e) => setBanco(e.target.value as Banco)}
                  className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {opcoesBanco.map((opcao) => (
                    <option key={opcao} value={opcao}>
                      {opcao}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Banco Origem (Sai Dinheiro)
              </label>
              <select
                value={banco}
                onChange={(e) => setBanco(e.target.value as Banco)}
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {opcoesBanco.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Banco Destino (Entra Dinheiro)
              </label>
              <select
                value={bancoDestino}
                onChange={(e) => setBancoDestino(e.target.value as Banco)}
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {opcoesBanco.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Data
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        {metodoPagamento !== "cartao_credito" && (
          <div className="flex items-center gap-3 pt-1">
            <input
              id="pago"
              type="checkbox"
              checked={pago}
              onChange={(e) => setPago(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
            />
            <label
              htmlFor="pago"
              className="text-sm text-slate-300 cursor-pointer"
            >
              Pago / Concluído
            </label>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 shadow-sm shadow-emerald-900/30"
        >
          {transacaoEmEdicao ? "Atualizar Transação" : "Salvar Transação"}
        </button>
      </form>
    </div>
  );
};

export default FormularioTransacao;