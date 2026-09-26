import React from 'react';

interface HeaderProps {
  mesFiltro: string; // Ex: "2026-09"
}

export const Header: React.FC<HeaderProps> = ({ mesFiltro }) => {
  // Formata a string "YYYY-MM" para algo como "Setembro / 2026"
  const formatarMesAno = (dataStr: string) => {
    if (!dataStr) return 'Balanço Geral';
    
    const [ano, mes] = dataStr.split('-');
    if (!ano || !mes) return dataStr;

    const data = new Date(Number(ano), Number(mes) - 1, 1);
    const nomeMes = data.toLocaleString('pt-BR', { month: 'long' });
    // Capitaliza a primeira letra do mês
    const mesFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

    return `${mesFormatado} / ${ano}`;
  };

  return (
    <header className="bg-brand-navy border-b border-brand-blue/30 text-white py-6 px-4 shadow-sm shadow-brand-navy/20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logotipo e Título */}
        <div className="flex items-center gap-3">
          <div className="bg-brand-blue/15 p-2.5 rounded-xl border border-brand-cyan/30">
            <img src="/F.svg" alt="Logo do FinanceApp" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              FinanceApp <span className="text-brand-cyan font-normal">| Controle Pessoal</span>
            </h1>
            <p className="text-xs text-white/65">
              Gestão de Receitas, Despesas e Investimentos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-sm text-white/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-white">
              Período Ativo: <strong>{formatarMesAno(mesFiltro)}</strong>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};