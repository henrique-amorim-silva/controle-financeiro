import React from 'react';
import { Trash2, CheckCircle2, Clock, Landmark } from 'lucide-react';
import type { Transacao } from '../types/finance';
import { formatarMoeda, formatarData } from '../utils/formatters';

interface ListaTransacoesProps {
  transacoes: Transacao[];
  onDeletarTransacao: (id: string) => void;
  onAlternarPago: (id: string) => void;
}

export const ListaTransacoes: React.FC<ListaTransacoesProps> = ({
  transacoes,
  onDeletarTransacao,
  onAlternarPago,
}) => {
  if (transacoes.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center text-slate-500 dark:text-slate-400">
        Nenhuma transação registrada até o momento.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Histórico de Lançamentos
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Descrição</th>
              <th className="py-3 px-4">Banco</th>
              <th className="py-3 px-4">Categoria</th>
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-4 text-right">Valor</th>
              <th className="py-3 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {transacoes.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                {/* Status */}
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => onAlternarPago(item.id)}
                    className="flex items-center gap-1.5 cursor-pointer text-xs font-medium"
                    title="Clique para alternar status"
                  >
                    {item.pago ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Liquidado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" /> Pendente
                      </span>
                    )}
                  </button>
                </td>

                {/* Descrição */}
                <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                  {item.descricao}
                  {item.tipoGasto && (
                    <span className="ml-2 text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {item.tipoGasto}
                    </span>
                  )}
                </td>

                {/* Banco / Conta */}
                <td className="py-3.5 px-4">
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <Landmark className="w-3.5 h-3.5 text-slate-400" />
                    {item.banco}
                  </span>
                </td>

                {/* Categoria */}
                <td className="py-3.5 px-4">
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs px-2.5 py-1 rounded-lg">
                    {item.categoria}
                  </span>
                </td>

                {/* Data */}
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                  {formatarData(item.data)}
                </td>

                {/* Valor */}
                <td
                  className={`py-3.5 px-4 font-semibold text-right ${
                    item.tipo === 'receita'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {item.tipo === 'receita' ? '+' : '-'} {formatarMoeda(item.valor)}
                </td>

                {/* Botão Deletar */}
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => onDeletarTransacao(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Excluir lançamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};