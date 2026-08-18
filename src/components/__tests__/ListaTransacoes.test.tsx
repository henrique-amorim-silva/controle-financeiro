import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListaTransacoes } from '../ListaTransacoes';
import type { Transacao } from '../../types/finance';

describe('ListaTransacoes Component', () => {
  const transacoesMock: Transacao[] = [
    {
      id: '1',
      descricao: 'Supermercado Mensal',
      valor: 450.50,
      tipo: 'despesa',
      pago: true,
      categoria: 'Alimentação',
      banco: 'Nubank',
      data: '2026-08-10',
      tipoGasto: 'variavel',
    },
    {
      id: '2',
      descricao: 'Salário Empresa',
      valor: 7500.00,
      tipo: 'receita',
      pago: false,
      categoria: 'Salário',
      banco: 'Itaú',
      data: '2026-08-05',
    },
  ];

  it('deve exibir mensagem de nenhum lançamento quando a lista estiver vazia', () => {
    render(
      <ListaTransacoes
        transacoes={[]}
        onDeletarTransacao={() => {}}
        onAlternarPago={() => {}}
      />
    );

    expect(screen.getByText(/nenhum lançamento encontrado/i)).toBeInTheDocument();
  });

  it('deve renderizar a tabela com as transações corretas e formatadas', () => {
    render(
      <ListaTransacoes
        transacoes={transacoesMock}
        onDeletarTransacao={() => {}}
        onAlternarPago={() => {}}
      />
    );

    // Verifica se as descrições aparecem
    expect(screen.getByText('Supermercado Mensal')).toBeInTheDocument();
    expect(screen.getByText('Salário Empresa')).toBeInTheDocument();

    // Verifica se os valores formatados aparecem
    expect(screen.getByText(/450,50/)).toBeInTheDocument();
    expect(screen.getByText(/7\.500,00/)).toBeInTheDocument();
  });

  it('deve chamar onAlternarPago ao clicar no botão de status', async () => {
    const user = userEvent.setup();
    const handleAlternarPagoMock = vi.fn();

    render(
      <ListaTransacoes
        transacoes={transacoesMock}
        onDeletarTransacao={() => {}}
        onAlternarPago={handleAlternarPagoMock}
      />
    );

    // Clica no botão de status da primeira transação ("Concluído")
    const botaoStatus = screen.getByRole('button', { name: /concluído/i });
    await user.click(botaoStatus);

    expect(handleAlternarPagoMock).toHaveBeenCalledTimes(1);
    expect(handleAlternarPagoMock).toHaveBeenCalledWith(transacoesMock[0]);
  });

  it('deve chamar onDeletarTransacao ao clicar no botão de exclusão', async () => {
    const user = userEvent.setup();
    const handleDeletarTransacaoMock = vi.fn();

    render(
      <ListaTransacoes
        transacoes={transacoesMock}
        onDeletarTransacao={handleDeletarTransacaoMock}
        onAlternarPago={() => {}}
      />
    );

    // Localiza os botões de excluir pelo título (title="Excluir Lançamento")
    const botoesExcluir = screen.getAllByTitle(/excluir lançamento/i);
    await user.click(botoesExcluir[0]);

    expect(handleDeletarTransacaoMock).toHaveBeenCalledTimes(1);
    expect(handleDeletarTransacaoMock).toHaveBeenCalledWith('1');
  });
});