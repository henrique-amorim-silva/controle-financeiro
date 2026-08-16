import { useState, useMemo } from "react";
import type { MetaCategoria } from "../types/meta";
import type { Transacao } from "../types/finance";
import { opcoesCategoriaDespesa } from "../types/finance";
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  ShoppingBag,
  Home,
  Utensils,
  Car,
  Briefcase,
  DollarSign
} from "lucide-react";

interface SecaoMetasLimitesProps {
  transacoes: Transacao[];
  categorias?: string[];
  mesAtual: string;
  metas: MetaCategoria[];
  onAdicionarMeta: (meta: Omit<MetaCategoria, "id">) => void;
  onDeletarMeta: (id: string) => void;
}

// Mapeamento dinâmico de ícones por nome de categoria
const getIconeCategoria = (categoria: string) => {
  const cat = categoria.toLowerCase();
  if (cat.includes("alim") || cat.includes("mercad") || cat.includes("comida")) return Utensils;
  if (cat.includes("casa") || cat.includes("mora") || cat.includes("aluguel")) return Home;
  if (cat.includes("transp") || cat.includes("combust") || cat.includes("carro")) return Car;
  if (cat.includes("compra") || cat.includes("loja")) return ShoppingBag;
  if (cat.includes("invest") || cat.includes("aport") || cat.includes("poupa")) return TrendingUp;
  if (cat.includes("trabalh") || cat.includes("servico")) return Briefcase;
  return DollarSign;
};

export function SecaoMetasLimites({
  transacoes,
  mesAtual,
  metas,
  onAdicionarMeta,
  onDeletarMeta,
}: SecaoMetasLimitesProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaSel, setCategoriaSel] = useState("");
  const [valorMeta, setValorMeta] = useState("");
  const [tipo, setTipo] = useState<MetaCategoria["tipo"]>("limite_gasto");
  const [frequencia, setFrequencia] = useState<MetaCategoria["frequencia"]>("fixo");

  // Lista composta estritamente pelas categorias de despesas declaradas no finance.ts
  const categoriasDespesaDisponiveis = useMemo(() => {
    return [...opcoesCategoriaDespesa].sort((a, b) => a.localeCompare(b));
  }, []);

  // Filtrar metas aplicáveis para o mês corrente
  const metasDoMes = metas.filter(
    (m) => m.frequencia === "fixo" || m.mes === mesAtual
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaSel || !valorMeta || Number(valorMeta) <= 0) return;

    onAdicionarMeta({
      categoria: categoriaSel,
      valorMeta: Number(valorMeta),
      tipo,
      frequencia,
      mes: frequencia === "mensal" ? mesAtual : undefined,
    });

    setCategoriaSel("");
    setValorMeta("");
    setMostrarFormulario(false);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl mb-8 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Metas e Limites por Categoria</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe seus teto de gastos e metas de investimento mensais
          </p>
        </div>

        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl transition-all font-medium cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {mostrarFormulario ? "Fechar" : "Nova Meta / Limite"}
        </button>
      </div>

      {/* Formulário de Criação */}
      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Categoria (Despesas)</label>
            <select
              value={categoriaSel}
              onChange={(e) => setCategoriaSel(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-emerald-500"
            >
              <option value="">Selecione...</option>
              {categoriasDespesaDisponiveis.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as MetaCategoria["tipo"])}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-emerald-500"
            >
              <option value="limite_gasto">Limite de Gasto (Despesa)</option>
              <option value="meta_investimento">Meta de Investimento (Aporte)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Valor Meta (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={valorMeta}
              onChange={(e) => setValorMeta(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Frequência</label>
            <select
              value={frequencia}
              onChange={(e) => setFrequencia(e.target.value as MetaCategoria["frequencia"])}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-emerald-500"
            >
              <option value="fixo">Recorrente (Todo mês)</option>
              <option value="mensal">Apenas Mês Atual ({mesAtual})</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs p-2.5 rounded-lg transition-all cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </form>
      )}

      {/* Grid de Cards */}
      {metasDoMes.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500">Nenhuma meta ou limite configurado para este período.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metasDoMes.map((meta) => {
            // Calcular valor atual realizado na categoria no mês atual
            const realizacao = transacoes
              .filter((t) => t.categoria === meta.categoria)
              .reduce((acc, curr) => acc + curr.valor, 0);

            const percentual = Math.min(Math.round((realizacao / meta.valorMeta) * 100), 100);
            const ultrapassouOuAtingiu = realizacao >= meta.valorMeta;
            const IconeCategoria = getIconeCategoria(meta.categoria);

            // Regra de Cores Dinâmicas
            let corBorda = "border-slate-800";
            let corTextoStatus = "text-slate-400";
            let corBarra = "bg-slate-700";
            let IconeStatus = CheckCircle2;

            if (meta.tipo === "limite_gasto") {
              if (ultrapassouOuAtingiu) {
                corBorda = "border-rose-500/50 bg-rose-950/10";
                corTextoStatus = "text-rose-400";
                corBarra = "bg-rose-500";
                IconeStatus = AlertTriangle;
              } else if (percentual > 85) {
                corBorda = "border-amber-500/50 bg-amber-950/10";
                corTextoStatus = "text-amber-400";
                corBarra = "bg-amber-500";
                IconeStatus = AlertTriangle;
              } else {
                corBorda = "border-emerald-500/30 bg-slate-900/50";
                corTextoStatus = "text-emerald-400";
                corBarra = "bg-emerald-500";
              }
            } else {
              // meta_investimento
              if (ultrapassouOuAtingiu) {
                corBorda = "border-emerald-500/50 bg-emerald-950/10";
                corTextoStatus = "text-emerald-400";
                corBarra = "bg-emerald-500";
                IconeStatus = CheckCircle2;
              } else {
                corBorda = "border-amber-500/30 bg-slate-900/50";
                corTextoStatus = "text-amber-400";
                corBarra = "bg-amber-500";
                IconeStatus = TrendingUp;
              }
            }

            return (
              <div
                key={meta.id}
                className={`p-4 rounded-xl border ${corBorda} transition-all relative group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200">
                        <IconeCategoria className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{meta.categoria}</h3>
                        <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 flex items-center gap-1">
                          {meta.tipo === "limite_gasto" ? (
                            <span className="text-rose-400 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Limite Gasto</span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Meta Aporte</span>
                          )}
                          • {meta.frequencia}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeletarMeta(meta.id)}
                      className="text-slate-600 hover:text-rose-400 transition-colors p-1 rounded cursor-pointer"
                      title="Excluir Meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Detalhes Financeiros */}
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs text-slate-400">
                      Realizado: <strong className="text-white">R$ {realizacao.toFixed(2)}</strong>
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Meta: R$ {meta.valorMeta.toFixed(2)}
                    </span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${corBarra} transition-all duration-500`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span className={`flex items-center gap-1.5 font-medium ${corTextoStatus}`}>
                    <IconeStatus className="w-3.5 h-3.5" />
                    {meta.tipo === "limite_gasto"
                      ? ultrapassouOuAtingiu
                        ? "Limite Estourado!"
                        : `${100 - percentual}% restante`
                      : ultrapassouOuAtingiu
                      ? "Meta Alcançada!"
                      : `${percentual}% alcançado`}
                  </span>
                  <span className="text-slate-500 text-[11px] font-semibold">{percentual}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}