export type TipoTransacao = 'receita' | 'despesa' | 'transferencia' | string;
export type TipoGasto = 'fixo' | 'variavel' | string;

// Nova tipagem para Bancos / Contas
export type Banco =
  | 'Nubank'
  | 'Itaú'
  | 'Bradesco'
  | 'Santander'
  | 'Banco do Brasil'
  | 'Inter'
  | 'Caixa'
  | 'C6 Bank'
  | 'Carteira / Dinheiro'
  | 'Outro';

export type CategoriaDespesa =
  | 'Moradia'
  | 'Alimentação'
  | 'Transporte'
  | 'Saúde'
  | 'Lazer'
  | 'Educação'
  | 'Contas Fixas'
  | 'Cartão de Crédito'
  | 'Investimentos'
  | 'Financiamento'
  | 'Empréstimo'
  | 'Combustível'
  | 'Outros';

export type CategoriaReceita =
  | 'Salário'
  | 'Freelance'
  | 'Rendimentos'
  | 'Vendas'
  | 'Saldo Inicial'
  | 'Outros';

// Categoria para movimentações internas entre contas
export type CategoriaTransferencia = 'Transferência';

export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria: CategoriaDespesa | CategoriaReceita | CategoriaTransferencia | string;
  banco: Banco; // Banco de Origem
  bancoDestino?: Banco; // Banco de Destino (para transferências)
  banco_destino?: Banco; // Fallback para compatibilidade com o PostgreSQL
  data: string;
  pago: boolean;
  tipoGasto?: TipoGasto;
  tipogasto?: TipoGasto;
  tipo_gasto?: TipoGasto;
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