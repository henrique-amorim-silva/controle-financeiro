export const opcoesTipoTransacao = [
  { value: 'despesa', label: 'Despesa' },
  { value: 'receita', label: 'Receita' },
  { value: 'transferencia', label: 'Transferência Entre Contas' },
] as const;

export const opcoesTipoGasto = [
  { value: 'variavel', label: 'Variável' },
  { value: 'fixo', label: 'Fixo' },
] as const;

export const opcoesMetodoPagamento = [
  { value: 'pix', label: 'PIX' },
  { value: 'debito', label: 'Débito' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'transferencia', label: 'Trasferência' },
] as const;

export const opcoesBanco = [
  'Nubank',
  'Itaú',
  'Bradesco',
  'Santander',
  'Banco do Brasil',
  'Inter',
  'Caixa',
  'C6 Bank',
  'Carteira / Dinheiro',
  'Mercado Pago',
  'Outro',
] as const;

export const opcoesCategoriaDespesa = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Educação',
  'Contas Fixas',
  'Investimentos',
  'Financiamento',
  'Empréstimo',
  'Combustível',
  'Vestimenta',
  'PET',
  'Outros',
] as const;

export const opcoesCategoriaReceita = [
  'Salário',
  'Freelance',
  'Rendimentos',
  'Vendas',
  'Saldo Inicial',
  'Outros',
] as const;

export type TipoTransacao =
  | (typeof opcoesTipoTransacao)[number]['value']
  | (string & {});
export type TipoGasto = (typeof opcoesTipoGasto)[number]['value'] | (string & {});

export type MetodoPagamento =
  | (typeof opcoesMetodoPagamento)[number]['value']
  | (string & {});

export type Banco = (typeof opcoesBanco)[number] | (string & {});
export type CategoriaDespesa =
  | (typeof opcoesCategoriaDespesa)[number]
  | (string & {});
export type CategoriaReceita =
  | (typeof opcoesCategoriaReceita)[number]
  | (string & {});

export type CategoriaTransferencia = 'Transferência';

export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria: CategoriaDespesa | CategoriaReceita | CategoriaTransferencia | string;
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