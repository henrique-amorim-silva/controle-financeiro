import React, { useState } from 'react';

interface FormularioTransacaoProps {
  onAdicionarTransacao: (transacao: any) => void;
}

export const FormularioTransacao: React.FC<FormularioTransacaoProps> = ({
  onAdicionarTransacao,
}) => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa' | 'transferencia'>('despesa');
  const [tipoGasto, setTipoGasto] = useState<'fixo' | 'variavel'>('variavel');
  const [categoria, setCategoria] = useState('Moradia');
  const [banco, setBanco] = useState('Nubank');
  const [bancoDestino, setBancoDestino] = useState('Banco do Brasil');
  const [pago, setPago] = useState(true);
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  const opcoesCategoriaDespesa = [
    'Moradia',
    'Alimentação',
    'Transporte',
    'Saúde',
    'Lazer',
    'Educação',
    'Contas Fixas',
    'Cartão de Crédito',
    'Investimentos',
    'Financiamento',
    'Empréstimo',
    'Combustível',
    'Outros',
  ];

  const opcoesCategoriaReceita = [
    'Salário',
    'Freelance',
    'Rendimentos',
    'Vendas',
    'Saldo Inicial',
    'Outros',
  ];

  const opcoesBanco = [
    'Nubank',
    'Banco do Brasil',
    'Caixa',
    'Santander',
    'Inter',
    'Bradesco',
    'Itaú',
    'Mercado Pago',
    'Outros',
  ];

  const handleValorChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setValor('');
      return;
    }

    const numericValue = Number(digits) / 100;
    setValor(
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao || !valor || !data) {
      alert('Preencha os campos obrigatórios (Descrição, Valor e Data).');
      return;
    }

    if (tipo === 'transferencia' && banco === bancoDestino) {
      alert('O banco de origem deve ser diferente do banco de destino.');
      return;
    }

    const valorNumerico = typeof valor === 'string'
      ? Number(valor.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'))
      : Number(valor);

    const novaTransacao = {
      descricao,
      valor: valorNumerico,
      tipo,
      tipoGasto: tipo === 'despesa' ? tipoGasto : undefined,
      tipogasto: tipo === 'despesa' ? tipoGasto : undefined,
      categoria: tipo === 'transferencia' ? 'Transferência' : (categoria || 'Geral'),
      banco: banco || 'Geral',
      bancoDestino: tipo === 'transferencia' ? bancoDestino : undefined,
      banco_destino: tipo === 'transferencia' ? bancoDestino : undefined,
      pago,
      data,
    };

    onAdicionarTransacao(novaTransacao);

    setDescricao('');
    setValor('');
    setCategoria(tipo === 'despesa' ? 'Moradia' : 'Salário');
    setTipoGasto('variavel');
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6 shadow-md shadow-slate-950/30">
      <div className="mb-5 border-b border-slate-800 pb-4">
        <h3 className="text-base font-semibold text-white">Nova Transação</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Tipo de Transação
          </label>
          <select
            value={tipo}
            onChange={(e) => {
              const novoTipo = e.target.value as 'receita' | 'despesa' | 'transferencia';
              setTipo(novoTipo);
              if (novoTipo === 'despesa') setCategoria('Moradia');
              if (novoTipo === 'receita') setCategoria('Salário');
              if (novoTipo === 'transferencia') setCategoria('Transferência');
            }}
            className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
            <option value="transferencia">Transferência Entre Contas</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Descrição
          </label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder={tipo === 'transferencia' ? 'Ex: Transferência Poupança -> Corrente' : 'Ex: Supermercado, Aluguel, Salário...'}
            required
            className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Valor (R$)
            </label>
            <input
              type="text"
              value={valor}
              onChange={(e) => handleValorChange(e.target.value)}
              placeholder="R$ 0,00"
              required
              className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {tipo === 'despesa' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Classificação do Gasto
              </label>
              <select
                value={tipoGasto}
                onChange={(e) =>
                  setTipoGasto(e.target.value as 'fixo' | 'variavel')
                }
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="variavel">Variável</option>
                <option value="fixo">Fixo</option>
              </select>
            </div>
          )}
        </div>

        {tipo !== 'transferencia' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {(tipo === 'despesa' ? opcoesCategoriaDespesa : opcoesCategoriaReceita).map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Banco / Conta
              </label>
              <select
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {opcoesBanco.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          /* Campos Específicos para Transferência */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Banco Origem (Sai Dinheiro)
              </label>
              <select
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {opcoesBanco.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Banco Destino (Entra Dinheiro)
              </label>
              <select
                value={bancoDestino}
                onChange={(e) => setBancoDestino(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {opcoesBanco.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Data
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <input
            id="pago"
            type="checkbox"
            checked={pago}
            onChange={(e) => setPago(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
          />
          <label htmlFor="pago" className="text-sm text-slate-300 cursor-pointer">
            Pago / Concluído
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 shadow-sm shadow-emerald-900/30"
        >
          Salvar Transação
        </button>
      </form>
    </div>
  );
};

export default FormularioTransacao;