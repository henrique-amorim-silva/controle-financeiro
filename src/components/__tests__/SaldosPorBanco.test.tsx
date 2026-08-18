import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SaldosPorBanco } from '../SaldosPorBanco';
import type { Transacao } from '../../types/finance';

describe('SaldosPorBanco Component', () => {
  const transacoesMock: Transacao[] = [
    {
      id: '1',
      descricao: 'Salário',
      valor: 5000,
      tipo: 'receita',
      pago: true,
      banco: 'Nubank',
      data: '2026-08-01',
      categoria: 'Salário',
    },
    {
      id: '2',
      descricao: 'Supermercado',
      valor: 500,
      tipo: 'despesa',
      pago: true,
      banco: 'Nubank',
      data: '2026-08-02',
      categoria: 'Alimentação',
    },
    {
      id: '3',
      descricao: 'Pix enviado',
      valor: 1000,
      tipo: 'transferencia',
      pago: true,
      banco: 'Nubank',
      bancoDestino: 'Itaú',
      data: '2026-08-03',
      categoria: 'Transferência',
    },
    {
      id: '4',
      descricao: 'Conta não paga',
      valor: 300,
      tipo: 'despesa',
      pago: false, // Não deve entrar no cálculo de saldo
      banco: 'Itaú',
      data: '2026-08-04',
      categoria: 'Contas',
    },
  ];

  it('não deve renderizar nada se não houver transações liquidadas', () => {
    const { container } = render(<SaldosPorBanco transacoes={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('deve calcular corretamente o saldo por banco e o total geral considerando apenas transações pagas', () => {
    render(<SaldosPorBanco transacoes={transacoesMock} />);

    // Verifica se os nomes dos bancos aparecem
    expect(screen.getByText('Nubank')).toBeInTheDocument();
    expect(screen.getByText('Itaú')).toBeInTheDocument();

    // Nubank: +5000 (receita) - 500 (despesa) - 1000 (transferência) = 3500
    // Itaú: +1000 (transferência recebida) = 1000
    // Total Geral: 3500 + 1000 = 4500
    
    expect(screen.getByText(/total em contas:/i)).toBeInTheDocument();
    
    // Verifica se os valores formatados aparecem na tela
    expect(screen.getByText(/3\.500,00/)).toBeInTheDocument();
    expect(screen.getByText(/1\.000,00/)).toBeInTheDocument();
    expect(screen.getByText(/4\.500,00/)).toBeInTheDocument();
  });
});