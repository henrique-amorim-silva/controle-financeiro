import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaturaCartaoModal } from '../FaturaCartaoModal';
import type { Transacao } from '../../types/finance';

describe('FaturaCartaoModal Component', () => {
  const transacoesMock: Transacao[] = [
    {
      id: '1',
      descricao: 'Compra na Amazon',
      valor: 150,
      tipo: 'despesa',
      pago: false,
      categoria: 'Compras',
      banco: 'Nubank',
      data: '2026-09-01',
      metodoPagamento: 'cartao_credito',
      dataVencimentoFatura: '2026-09-10',
    },
    {
      id: '2',
      descricao: 'Netflix',
      valor: 50,
      tipo: 'despesa',
      pago: true,
      categoria: 'Assinaturas',
      banco: 'Nubank',
      data: '2026-09-02',
      metodoPagamento: 'cartao_credito',
      dataVencimentoFatura: '2026-09-10',
    },
    {
      id: '3',
      descricao: 'Supermercado',
      valor: 300,
      tipo: 'despesa',
      pago: false,
      categoria: 'Alimentação',
      banco: 'Nubank',
      data: '2026-10-01',
      metodoPagamento: 'cartao_credito',
      dataVencimentoFatura: '2026-10-10', // Mês diferente, não deve aparecer na fatura de 2026-09
    },
  ];

  it('deve exibir apenas os itens da fatura do mês especificado e calcular o total corretamente', () => {
    render(
      <FaturaCartaoModal
        transacoes={transacoesMock}
        mesFatura="2026-09"
        onPagarFatura={() => {}}
      />
    );

    // Verifica o título e quantidade de itens da fatura correta
    expect(screen.getByText(/fatura do cartão - 2026-09/i)).toBeInTheDocument();
    expect(screen.getByText(/2 item\(ns\) nesta fatura/i)).toBeInTheDocument();

    // Verifica se os itens do mês 09 aparecem
    expect(screen.getByText('Compra na Amazon')).toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();

    // O item do mês 10 não deve estar visível nesta fatura
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();

    // Total da fatura do mês 09 deve ser 150 + 50 = 200.00
    expect(screen.getByText(/200\.00/i)).toBeInTheDocument();
  });

  it('deve chamar a função onPagarFatura com os IDs dos itens pendentes ao clicar no botão', async () => {
    const user = userEvent.setup();
    const handlePagarFaturaMock = vi.fn();

    render(
      <FaturaCartaoModal
        transacoes={transacoesMock}
        mesFatura="2026-09"
        onPagarFatura={handlePagarFaturaMock}
      />
    );

    const botaoQuitar = screen.getByRole('button', {
      name: /quitar fatura completa/i,
    });
    expect(botaoQuitar).toBeInTheDocument();

    await user.click(botaoQuitar);

    // Como apenas o item '1' (Amazon) está pendente ('pago: false'), deve enviar apenas o ID '1'
    expect(handlePagarFaturaMock).toHaveBeenCalledTimes(1);
    expect(handlePagarFaturaMock).toHaveBeenCalledWith(['1']);
  });

  it('não deve exibir o botão de quitar se todos os itens da fatura já estiverem pagos', () => {
    const transacoesPagasMock: Transacao[] = [
      {
        id: '4',
        descricao: 'Uber',
        valor: 40,
        tipo: 'despesa',
        pago: true,
        categoria: 'Transporte',
        banco: 'Nubank',
        data: '2026-09-03',
        metodoPagamento: 'cartao_credito',
        dataVencimentoFatura: '2026-09-10',
      },
    ];

    render(
      <FaturaCartaoModal
        transacoes={transacoesPagasMock}
        mesFatura="2026-09"
        onPagarFatura={() => {}}
      />
    );

    // O botão de quitação não deve aparecer na tela
    const botaoQuitar = screen.queryByRole('button', {
      name: /quitar fatura completa/i,
    });
    expect(botaoQuitar).not.toBeInTheDocument();
  });
});