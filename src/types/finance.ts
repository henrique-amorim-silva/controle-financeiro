export type TipoTransacao = 'receita' | 'despesa';
export type TipoGasto = 'fixo' | 'variavel';

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
  | 'Outros';

export type CategoriaReceita =
  | 'Salário'
  | 'Freelance'
  | 'Rendimentos'
  | 'Vendas'
  | 'Saldo Inicial'
  | 'Outros';

export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria: CategoriaDespesa | CategoriaReceita;
  banco: Banco; // <--- Novo campo obrigatório
  data: string;
  pago: boolean;
  tipoGasto?: TipoGasto;
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