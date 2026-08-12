import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { Transacao } from "../types/finance";

interface SecaoGraficosProps {
  transacoes: Transacao[];
}

type TipoGrafico =
  | "gastos_tipo"
  | "receitas_cat"
  | "receitas_desc"
  | "despesas_cat"
  | "despesas_desc"
  | "cartao_desc"
  | "investimentos_desc";

const CORES = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
  "#84cc16",
];

const normalizarTexto = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const SecaoGraficos: React.FC<SecaoGraficosProps> = ({ transacoes }) => {
  const [isAberto, setIsAberto] = useState(false);
  const [graficoSelecionado, setGraficoSelecionado] =
    useState<TipoGrafico>("gastos_tipo");

  // 1. Gastos Fixos vs Variáveis
  const dadosGastosTipo = useMemo(() => {
    let fixos = 0;
    let variaveis = 0;

    transacoes
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => {
        const valorPropriedade = String(
          t.tipoGasto ?? t.tipogasto ?? t.tipo_gasto ?? ""
        )
          .trim()
          .toLowerCase();

        if (valorPropriedade.includes("fixo")) {
          fixos += Number(t.valor);
        } else {
          variaveis += Number(t.valor);
        }
      });

    const total = fixos + variaveis;
    if (total === 0) return [];

    return [
      { name: "Gastos Fixos", value: fixos },
      { name: "Gastos Variáveis", value: variaveis },
    ].filter((item) => item.value > 0);
  }, [transacoes]);

  // 2. Receitas por Categoria
  const dadosReceitasCat = useMemo(() => {
    const mapa: Record<string, number> = {};
    transacoes
      .filter((t) => t.tipo === "receita")
      .forEach((t) => {
        const cat = t.categoria || "Outros";
        mapa[cat] = (mapa[cat] || 0) + Number(t.valor);
      });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [transacoes]);

  // 3. Receitas por Descrição
  const dadosReceitasDesc = useMemo(() => {
    const mapa: Record<string, number> = {};
    transacoes
      .filter((t) => t.tipo === "receita")
      .forEach((t) => {
        const desc = t.descricao || "Sem Descrição";
        mapa[desc] = (mapa[desc] || 0) + Number(t.valor);
      });
    return Object.entries(mapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transacoes]);

  // 4. Despesas por Categoria
  const dadosDespesasCat = useMemo(() => {
    const mapa: Record<string, number> = {};
    transacoes
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => {
        const cat = t.categoria || "Outros";
        mapa[cat] = (mapa[cat] || 0) + Number(t.valor);
      });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [transacoes]);

  // 5. Despesas por Descrição
  const dadosDespesasDesc = useMemo(() => {
    const mapa: Record<string, number> = {};
    transacoes
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => {
        const desc = t.descricao || "Sem Descrição";
        mapa[desc] = (mapa[desc] || 0) + Number(t.valor);
      });
    return Object.entries(mapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transacoes]);

  // 6. Cartão de Crédito x Descrição
  const dadosCartaoDesc = useMemo(() => {
    const mapa: Record<string, number> = {};
    transacoes
      .filter(
        (t) =>
          t.tipo === "despesa" &&
          normalizarTexto(t.categoria || "").includes("cartao de credito")
      )
      .forEach((t) => {
        const desc = t.descricao || "Sem Descrição";
        mapa[desc] = (mapa[desc] || 0) + Number(t.valor);
      });

    return Object.entries(mapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transacoes]);

  // 7. Investimentos x Descrição
  const dadosInvestimentosDesc = useMemo(() => {
    const mapa: Record<string, number> = {};
    transacoes
      .filter((t) =>
        normalizarTexto(t.categoria || "").includes("investimento")
      )
      .forEach((t) => {
        const desc = t.descricao || "Sem Descrição";
        mapa[desc] = (mapa[desc] || 0) + Number(t.valor);
      });

    return Object.entries(mapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transacoes]);

  // Mapeamento dinâmico
  const dadosAtuais = useMemo(() => {
    switch (graficoSelecionado) {
      case "gastos_tipo":
        return dadosGastosTipo;
      case "receitas_cat":
        return dadosReceitasCat;
      case "receitas_desc":
        return dadosReceitasDesc;
      case "despesas_cat":
        return dadosDespesasCat;
      case "despesas_desc":
        return dadosDespesasDesc;
      case "cartao_desc":
        return dadosCartaoDesc;
      case "investimentos_desc":
        return dadosInvestimentosDesc;
      default:
        return [];
    }
  }, [
    graficoSelecionado,
    dadosGastosTipo,
    dadosReceitasCat,
    dadosReceitasDesc,
    dadosDespesasCat,
    dadosDespesasDesc,
    dadosCartaoDesc,
    dadosInvestimentosDesc,
  ]);

  // Cálculo do valor total exibido no gráfico
  const totalValor = useMemo(
    () => dadosAtuais.reduce((acc, item) => acc + item.value, 0),
    [dadosAtuais]
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl mb-6 shadow-md shadow-slate-950/30 overflow-hidden transition-all">
      <div
        onClick={() => setIsAberto(!isAberto)}
        className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            Análise Gráfica
          </span>
          <span className="text-xs text-slate-400 font-normal hidden sm:inline">
            — clique para {isAberto ? "recolher" : "visualizar gráficos"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
              isAberto ? "rotate-180 text-emerald-400" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isAberto && (
        <div className="p-5 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
            <div>
              <p className="text-xs text-slate-400">
                Selecione a visualização desejada
              </p>
            </div>

            <select
              value={graficoSelecionado}
              onChange={(e) =>
                setGraficoSelecionado(e.target.value as TipoGrafico)
              }
              className="bg-slate-950 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer w-full sm:w-auto font-medium"
            >
              <option value="gastos_tipo">Gastos Fixos vs Variáveis (%)</option>
              <option value="receitas_cat">Receitas por Categoria (%)</option>
              <option value="receitas_desc">Receitas por Descrição (%)</option>
              <option value="despesas_cat">Despesas por Categoria (%)</option>
              <option value="despesas_desc">Despesas por Descrição (%)</option>
              <option value="cartao_desc">Cartão de Crédito por Descrição (%)</option>
              <option value="investimentos_desc">Investimentos por Descrição (%)</option>
            </select>
          </div>

          {/* EXIBIÇÃO DO VALOR TOTAL DO GRÁFICO */}
          {dadosAtuais.length > 0 && (
            <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5">
              <span className="text-xs text-slate-400 font-medium">Total Analisado:</span>
              <span className="text-sm font-bold text-emerald-400">
                R$ {totalValor.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          {dadosAtuais.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              Nenhum dado disponível para o gráfico selecionado neste período.
            </div>
          ) : (
            <div className="h-80 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosAtuais}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ percent }: { percent?: number }) =>
                      `${((percent ?? 0) * 100).toFixed(1)}%`
                    }
                  >
                    {dadosAtuais.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CORES[index % CORES.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => {
                      const valNum = Number(value ?? 0);
                      return [
                        `R$ ${valNum.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} (${((valNum / (totalValor || 1)) * 100).toFixed(1)}%)`,
                        "Valor",
                      ];
                    }}
                    contentStyle={{
                      backgroundColor: "#020617",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-slate-300 text-xs font-medium ml-1">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};