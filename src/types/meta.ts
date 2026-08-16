export type TipoMeta = "limite_gasto" | "meta_investimento";

export interface MetaCategoria {
  id: string;
  categoria: string;
  valorMeta: number;
  tipo: TipoMeta;
  frequencia: "mensal" | "fixo"; // Mensal para um mês específico ou Fixo para todos
  mes?: string; // Formato "YYYY-MM" caso a frequência seja mensal
}