import React, { useState } from "react";

export interface FiltrosState {
  tipo: "todos" | "despesa" | "receita";
  status: "todos" | "pago" | "pendente";
  descricao: string;
  banco: string;
  categoria: string;
  dataInicio: string;
  dataFim: string;
}

interface FiltrosProps {
  filtros: FiltrosState;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosState>>;
  bancos: string[];
  categorias: string[];
  onLimpar: () => void;
}

export const FiltrosTransacao: React.FC<FiltrosProps> = ({
  filtros,
  setFiltros,
  bancos,
  categorias,
  onLimpar,
}) => {
  const [isAberto, setIsAberto] = useState(false);

  const temFiltroAtivo =
    filtros.tipo !== "todos" ||
    filtros.status !== "todos" ||
    filtros.descricao !== "" ||
    filtros.banco !== "todos" ||
    filtros.categoria !== "todas" ||
    filtros.dataInicio !== "" ||
    filtros.dataFim !== "";

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl mb-4 shadow-md shadow-slate-950/30 overflow-hidden transition-all">
      {/* Cabeçalho Clicável */}
      <div
        onClick={() => setIsAberto(!isAberto)}
        className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            Filtros Avançados
          </span>
          {temFiltroAtivo && (
            <span
              className="flex h-2 w-2 rounded-full bg-emerald-500"
              title="Filtro ativo"
            />
          )}
          <span className="text-xs text-slate-400 font-normal hidden sm:inline">
            — clique para {isAberto ? "recolher" : "filtrar histórico"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {temFiltroAtivo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLimpar();
              }}
              type="button"
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium transition-colors"
            >
              Limpar Filtros
            </button>
          )}

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

      {/* Conteúdo Expansível */}
      {isAberto && (
        <div className="p-5 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Filtro por Descrição */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Descrição
              </label>
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={filtros.descricao}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, descricao: e.target.value }))
                }
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-600"
              />
            </div>

            {/* Filtro por Tipo */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    tipo: e.target.value as "todos" | "despesa" | "receita",
                  }))
                }
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="despesa">Saída (Despesa)</option>
                <option value="receita">Entrada (Receita)</option>
              </select>
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Status
              </label>
              <select
                value={filtros.status}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    status: e.target.value as "todos" | "pago" | "pendente",
                  }))
                }
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="todos">Todos os Status</option>
                <option value="pago">Pago / Recebido</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>

            {/* Filtro por Banco */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Banco / Conta
              </label>
              <select
                value={filtros.banco}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, banco: e.target.value }))
                }
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="todos">Todos os Bancos</option>
                {bancos.map((banco) => (
                  <option key={banco} value={banco}>
                    {banco}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Categoria */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Categoria
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, categoria: e.target.value }))
                }
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="todas">Todas as Categorias</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Data Inicial */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Data Inicial
              </label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    dataInicio: e.target.value,
                  }))
                }
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              />
            </div>

            {/* Filtro por Data Final */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Data Final
              </label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    dataFim: e.target.value,
                  }))
                }
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};