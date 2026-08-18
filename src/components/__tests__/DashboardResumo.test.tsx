import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardResumo } from '../DashboardResumo';
import type { Transacao } from '../../types/finance';

describe('DashboardResumo Component', () => {
  const transacoesMock: Transacao[] = [
    { id: '1', descricao: 'Salário', valor: 5000, tipo: 'receita', pago: true, categoria: 'Salário', banco: 'Nubank', data: '2026-08-01' },
    { id: '2', descricao: 'Aluguel', valor: 1500, tipo: 'despesa', pago: true, categoria: 'Moradia', banco: 'Nubank', data: '2026-08-05' },
    { id: '3', descricao: 'Ações', valor: 500, tipo: 'despesa', pago: true, categoria: 'Investimentos', banco: 'Nubank', data: '2026-08-10' },
    { id: '4', descricao: 'Freelance', valor: 1000, tipo: 'receita', pago: false, categoria: 'Extra', banco: 'Nubank', data: '2026-08-15' },
  ];

  it('deve calcular corretamente os totais de transações liquidadas', () => {
    render(<DashboardResumo transacoes={transacoesMock} />);

    // Encontra o container principal do card subindo até o bloco pai correto
    const cardReceitas = screen.getByText('Entradas Realizadas').closest('div')?.parentElement;
    expect(cardReceitas).toHaveTextContent(/5\.000,00/i);

    const cardDespesas = screen.getByText('Saídas Realizadas').closest('div')?.parentElement;
    expect(cardDespesas).toHaveTextContent(/1\.500,00/i);

    const cardInvestimentos = screen.getByText('Investimentos').closest('div')?.parentElement;
    expect(cardInvestimentos).toHaveTextContent(/500,00/i);

    const cardSaldo = screen.getByText('Saldo Real Mensal').closest('div')?.parentElement;
    expect(cardSaldo).toHaveTextContent(/3\.000,00/i);
  });

  it('deve exibir avisos de pendências quando houver transações não pagas', () => {
    render(<DashboardResumo transacoes={transacoesMock} />);

    expect(screen.getByText(/receitas a receber pendentes/i)).toBeInTheDocument();
  });
});