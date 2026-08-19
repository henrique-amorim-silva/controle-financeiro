export const opcoesTipoTransacao = [
  { value: "despesa", label: "Despesa" },
  { value: "receita", label: "Receita" },
  { value: "transferencia", label: "Transferência Entre Contas" },
] as const;

export const opcoesTipoGasto = [
  { value: "variavel", label: "Variável" },
  { value: "fixo", label: "Fixo" },
] as const;

export const opcoesMetodoPagamento = [
  { value: "pix", label: "PIX" },
  { value: "debito", label: "Débito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "transferencia", label: "Trasferência" },
] as const;

export const opcoesBanco = [
  "Banco do Brasil",
  "Bradesco",
  "C6 Bank",
  "Caixa",
  "Carteira / Dinheiro",
  "Inter",
  "Itaú",
  "Mercado Pago",
  "Nubank",
  "Santander",
  "Outro",
] as const;

export const opcoesCategoriaDespesa = [
  "Alimentação",
  "Combustível",
  "Compras",
  "Contas Fixas",
  "Educação",
  "Empréstimo",
  "Financiamento",
  "Investimentos",
  "Lazer",
  "Moradia",
  "PET",
  "Saúde",
  "Transporte",
  "Vestimenta",
  "Outros",
] as const;

export const opcoesCategoriaReceita = [
  "Salário",
  "Freelance",
  "Rendimentos",
  "Vendas",
  "Saldo Inicial",
  "Extra",
] as const;

export type TipoTransacao =
  | (typeof opcoesTipoTransacao)[number]["value"]
  | (string & {});
export type TipoGasto =
  | (typeof opcoesTipoGasto)[number]["value"]
  | (string & {});

export type MetodoPagamento =
  | (typeof opcoesMetodoPagamento)[number]["value"]
  | (string & {});

export type Banco = (typeof opcoesBanco)[number] | (string & {});
export type CategoriaDespesa =
  | (typeof opcoesCategoriaDespesa)[number]
  | (string & {});
export type CategoriaReceita =
  | (typeof opcoesCategoriaReceita)[number]
  | (string & {});

export type CategoriaTransferencia = "Transferência";

export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria:
    | CategoriaDespesa
    | CategoriaReceita
    | CategoriaTransferencia
    | string;
  banco: Banco;
  bancoDestino?: Banco;
  banco_destino?: Banco;
  data: string;
  pago: boolean;
  tipoGasto?: TipoGasto;
  tipogasto?: TipoGasto;
  tipo_gasto?: TipoGasto;
  metodoPagamento?: MetodoPagamento;
  metodo_pagamento?: MetodoPagamento;
  cartaoId?: string;
  dataVencimentoFatura?: string;
  parcelaAtual?: number;
  totalParcelas?: number;
}

export interface ResumoFinanceiro {
  saldoInicial: number;
  totalReceitas: number;
  totalDespesas: number;
  despesasFixas: number;
  despesasVariaveis: number;
  saldoFinal: number;
  totalInvestimentos: number;
}
