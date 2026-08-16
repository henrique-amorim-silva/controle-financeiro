export interface CartaoCredito {
  id: string;
  user_id?: string;
  nome: string;
  banco: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
}