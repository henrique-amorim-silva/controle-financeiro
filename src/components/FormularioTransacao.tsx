import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import type {
  Transacao,
  TipoTransacao,
  TipoGasto,
  Banco,
  CategoriaDespesa,
  CategoriaReceita,
} from '../types/finance';

interface FormularioTransacaoProps {
  onAdicionarTransacao: (transacao: Omit<Transacao, 'id'>) => void;
}

const bancosDisponiveis: Banco[] = [
  'Nubank',
  'Itaú',
  'Bradesco',
  'Santander',
  'Banco do Brasil',
  'Inter',
  'Caixa',
  'C6 Bank',
  'Carteira / Dinheiro',
  'Outro',
];

const categoriasDespesa: CategoriaDespesa[] = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Educação',
  'Contas Fixas',
  'Cartão de Crédito',
  'Investimentos',
  'Outros',
];

const categoriasReceita: CategoriaReceita[] = [
  'Salário',
  'Freelance',
  'Rendimentos',
  'Vendas',
  'Saldo Inicial',
  'Outros',
];

export const FormularioTransacao: React.FC<FormularioTransacaoProps> = ({
  onAdicionarTransacao,
}) => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<TipoTransacao>('despesa');
  const [banco, setBanco] = useState<Banco>('Nubank');
  const [categoria, setCategoria] = useState<string>('Alimentação');
  const [tipoGasto, setTipoGasto] = useState<TipoGasto>('variavel');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [pago, setPago] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Tratamento do valor (conversão de vírgula em ponto caso o usuário digite "15,50")
    const valorTratado = parseFloat(valor.toString().replace(',', '.'));

    if (!descricao || isNaN(valorTratado) || valorTratado <= 0) {
      alert('Por favor, preencha a descrição e um valor válido.');
      return;
    }

    // Mapeamento mantendo compatibilidade com as colunas do PostgreSQL
    const novaTransacaoPayload: any = {
      descricao,
      valor: valorTratado,
      tipo,
      banco: banco || 'Geral',
      categoria: categoria || 'Geral',
      data,
      pago,
      tipogasto: tipo === 'despesa' ? tipoGasto : null,
    };

    onAdicionarTransacao(novaTransacaoPayload);

    // Limpa os campos após o envio
    setDescricao('');
    setValor('');
  };

  return (
    <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-sm shadow-slate-950/20 mb-8">
      <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-emerald-500" />
        Novo Lançamento
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => {
              const novoTipo = e.target.value as TipoTransacao;
              setTipo(novoTipo);
              setCategoria(novoTipo === 'receita' ? 'Salário' : 'Alimentação');
            }}
            className="bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="despesa">Saída (Despesa)</option>
            <option value="receita">Entrada (Receita)</option>
          </select>
        </div>

        {/* Descrição */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Descrição</label>
          <input
            type="text"
            placeholder="Ex: Supermercado, Salário..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Valor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Campo de Banco */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Banco / Conta</label>
          <select
            value={banco}
            onChange={(e) => setBanco(e.target.value as Banco)}
            className="bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {bancosDisponiveis.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Categoria */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {tipo === 'despesa'
              ? categoriasDespesa.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))
              : categoriasReceita.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
          </select>
        </div>

        {/* Tipo de Gasto */}
        {tipo === 'despesa' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Classificação</label>
            <select
              value={tipoGasto}
              onChange={(e) => setTipoGasto(e.target.value as TipoGasto)}
              className="bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="fixo">Gasto Fixo</option>
              <option value="variavel">Gasto Variável</option>
            </select>
          </div>
        )}

        {/* Data */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Checkbox Status */}
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="pago"
            checked={pago}
            onChange={(e) => setPago(e.target.checked)}
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
          <label htmlFor="pago" className="text-sm text-slate-300 cursor-pointer">
            {tipo === 'receita' ? 'Já recebido' : 'Já pago'}
          </label>
        </div>

        {/* Botão */}
        <div className="flex items-end lg:col-span-4">
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            Adicionar Lançamento
          </button>
        </div>
      </form>
    </div>
  );
};