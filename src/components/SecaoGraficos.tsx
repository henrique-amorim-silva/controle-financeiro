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

type TipoGrafico = "gastos_tipo" | "receitas_cat" | "despesas_cat" | "despesas_desc";

const CORES = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#a855f7",
];

export const SecaoGraficos: React.FC<SecaoGraficosProps> = ({ transacoes }) => {
  const [graficoSelecionado, setGraficoSelecionado] = useState<TipoGrafico>("gastos_tipo");

  // 1. Dados: Gastos Fixos vs Variáveis
  const dadosGastosTipo = useMemo(() => {
    let fixos = 0;
    let variaveis = 0;

    transacoes
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => {
        const tipoGasto = t.tipoGasto?.toLowerCase();
        if (tipoGasto === "fixo") fixos += t.valor;
        else variaveis += t.valor;
      });

    const total = fixos + variaveis;
    if (total === 0) return [];

    return [
      { name: "Gastos Fixos", value: fixos },
      { name: "Gastos Variáveis", value: variaveis },
    ].filter((item) => item.value > 0);
  }, [transacoes]);

  // 2. Dados: Receitas por Categoria
  const dadosReceitasCat = useMemo(() => {
    const mapa: Record<string, number> = {};

    transacoes
      .filter((t) => t.tipo === "receita")
      .forEach((t) => {
        const cat = t.categoria || "Outros";
        mapa[cat] = (mapa[cat] || 0) + t.valor;
      });

    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [transacoes]);

  // 3. Dados: Despesas por Categoria
  const dadosDespesasCat = useMemo(() => {
    const mapa: Record<string, number> = {};

    transacoes
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => {
        const cat = t.categoria || "Outros";
        mapa[cat] = (mapa[cat] || 0) + t.valor;
      });

    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  }, [transacoes]);

  // 4. Dados: Despesas por Descrição
  const dadosDespesasDesc = useMemo(() => {
    const mapa: Record<string, number> = {};

    transacoes
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => {
        const desc = t.descricao || "Sem Descrição";
        mapa[desc] = (mapa[desc] || 0) + t.valor;
      });

    return Object.entries(mapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Ordena do maior para o menor
  }, [transacoes]);

  // Define qual conjunto de dados utilizar no gráfico visível
  const dadosAtuais = useMemo(() => {
    switch (graficoSelecionado) {
      case "gastos_tipo":
        return dadosGastosTipo;
      case "receitas_cat":
        return dadosReceitasCat;
      case "despesas_cat":
        return dadosDespesasCat;
      case "despesas_desc":
        return dadosDespesasDesc;
      default:
        return [];
    }
  }, [
    graficoSelecionado,
    dadosGastosTipo,
    dadosReceitasCat,
    dadosDespesasCat,
    dadosDespesasDesc,
  ]);

  const totalValor = useMemo(
    () => dadosAtuais.reduce((acc, item) => acc + item.value, 0),
    [dadosAtuais]
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6 shadow-md shadow-slate-950/30">
      {/* Controles do Seletor */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Análise Gráfica</h2>
          <p className="text-xs text-slate-400">
            Selecione o tipo de visualização desejado
          </p>
        </div>

        <select
          value={graficoSelecionado}
          onChange={(e) => setGraficoSelecionado(e.target.value as TipoGrafico)}
          className="bg-slate-950 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer w-full sm:w-auto font-medium"
        >
          <option value="gastos_tipo">Gastos Fixos vs Variáveis (%)</option>
          <option value="receitas_cat">Receitas por Categoria (%)</option>
          <option value="despesas_cat">Despesas por Categoria (%)</option>
          <option value="despesas_desc">Despesas por Descrição (%)</option>
        </select>
      </div>

      {/* ÁREA DO GRÁFICO */}
      {dadosAtuais.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs text-slate-500">
          Nenhum dado disponível para o gráfico selecionado neste período.
        </div>
      ) : (
        <div className="h-80 w-full">
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
                label={({ percent = 0 }) => `${(percent * 100).toFixed(1)}%`}
              >
                {dadosAtuais.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CORES[index % CORES.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  const numericValue = Number(
                    Array.isArray(value) ? value[0] : value ?? 0
                  );

                  return [
                    `R$ ${numericValue.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} (${((numericValue / (totalValor || 1)) * 100).toFixed(1)}%)`,
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
  );
};