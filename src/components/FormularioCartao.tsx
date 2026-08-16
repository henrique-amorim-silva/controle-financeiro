import React, { useState } from 'react';
import type { CartaoCredito } from '../types/cartao';
import { opcoesBanco, type Banco } from '../types/finance';

interface FormularioCartaoProps {
  onAdicionarCartao: (cartao: Omit<CartaoCredito, 'id'>) => Promise<void>;
  cartoes: CartaoCredito[];
  onDeletarCartao: (id: number) => Promise<void>;
}

export const FormularioCartao: React.FC<FormularioCartaoProps> = ({
  onAdicionarCartao,
  cartoes,
  onDeletarCartao,
}) => {
  const [isAberto, setIsAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [banco, setBanco] = useState<Banco>('Nubank');
  const [limite, setLimite] = useState('');
  const [diaFechamento, setDiaFechamento] = useState('1');
  const [diaVencimento, setDiaVencimento] = useState('10');

  const handleLimiteChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setLimite('');
      return;
    }

    const numericValue = Number(digits) / 100;
    setLimite(
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !limite) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    await onAdicionarCartao({
      nome,
      banco,
      limite: Number(
        limite
          .replace(/[^\d,.-]/g, '')
          .replace('.', '')
          .replace(',', '.')
      ),
      diaFechamento: Number(diaFechamento),
      diaVencimento: Number(diaVencimento),
    });

    setNome('');
    setLimite('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl mb-6 overflow-hidden transition-all">
      <div
        onClick={() => setIsAberto(!isAberto)}
        className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            Cadastrar Novo Cartão
          </span>
          <span className="text-xs text-slate-400 font-normal hidden sm:inline">
            — clique para {isAberto ? 'recolher' : 'cadastrar cartão'}
          </span>
        </div>

        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
            isAberto ? 'rotate-180 text-emerald-400' : ''
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

      {isAberto && (
        <div className="p-4 space-y-4 border-t border-slate-800/80 bg-slate-950/40">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Nome do Cartão (ex: Cartão Principal)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={banco}
                onChange={(e) => setBanco(e.target.value as Banco)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
              >
                {opcoesBanco.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Limite (R$)"
                value={limite}
                onChange={(e) => handleLimiteChange(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Dia Fechamento</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={diaFechamento}
                  onChange={(e) => setDiaFechamento(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Dia Vencimento</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Salvar Cartão
            </button>
          </form>

          {cartoes.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <h5 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Cartões Cadastrados
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cartoes.map((cartao) => (
                  <div
                    key={cartao.id}
                    className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{cartao.nome}</p>
                      <p className="text-xs text-slate-400">
                        {cartao.banco} | Limite: R$ {Number(cartao.limite).toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeletarCartao(Number(cartao.id))}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};