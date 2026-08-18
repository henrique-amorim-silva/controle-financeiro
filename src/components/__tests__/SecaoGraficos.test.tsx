import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SecaoGraficos } from '../SecaoGraficos';
import type { Transacao } from '../../types/finance';

// Mock do ResizeObserver e do Recharts para evitar erros de dimensões em ambiente de testes Node/JSDOM
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

describe('SecaoGraficos Component', () => {
  const transacoesMock: Transacao[] = [
    {
      id: '1',
      descricao: 'Salário Mensal',
      valor: 5000,
      tipo: 'receita',
      pago: true,
      categoria: 'Salário',
      banco: 'Itaú',
      data: '2026-08-01',
    },
    {
      id: '2',
      descricao: 'Aluguel',
      valor: 1200,
      tipo: 'despesa',
      pago: true,
      tipoGasto: 'fixo',
      categoria: 'Moradia',
      banco: 'Nubank',
      data: '2026-08-05',
    },
    {
      id: '3',
      descricao: 'Supermercado',
      valor: 300,
      tipo: 'despesa',
      pago: true,
      tipoGasto: 'variavel',
      categoria: 'Alimentação',
      metodoPagamento: 'Cartão de Crédito',
      banco: 'Nubank',
      data: '2026-08-10',
    },
  ];

  it('deve iniciar com os gráficos ocultos e exibi-los ao clicar no cabeçalho', async () => {
    const user = userEvent.setup();
    render(<SecaoGraficos transacoes={transacoesMock} />);

    // Verifica que o título está presente, mas o select de opções ainda não está visível
    expect(screen.getByText('Análise Gráfica')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    // Clica para expandir a seção
    await user.click(screen.getByText('Análise Gráfica'));

    // Agora o select de escolha do gráfico deve aparecer
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('deve exibir mensagem de nenhum dado disponível quando a lista estiver vazia para o gráfico', async () => {
    const user = userEvent.setup();
    render(<SecaoGraficos transacoes={[]} />);

    // Expande a seção
    await user.click(screen.getByText('Análise Gráfica'));

    // Verifica a mensagem de estado vazio
    expect(
      screen.getByText(/nenhum dado disponível para o gráfico selecionado/i)
    ).toBeInTheDocument();
  });

  it('deve calcular e exibir corretamente o total analisado ao alternar entre os gráficos', async () => {
    const user = userEvent.setup();
    render(<SecaoGraficos transacoes={transacoesMock} />);

    // Expande a seção de gráficos
    await user.click(screen.getByText('Análise Gráfica'));

    const selectGrafico = screen.getByRole('combobox');

    // Por padrão o gráfico selecionado é "Gastos Fixos vs Variáveis" (Aluguel 1200 + Supermercado 300 = 1500)
    expect(screen.getByText(/1\.500,00/)).toBeInTheDocument();

    // Altera para "Receitas por Categoria" (Salário 5000)
    await user.selectOptions(selectGrafico, 'receitas_cat');
    expect(screen.getByText(/5\.000,00/)).toBeInTheDocument();

    // Altera para "Cartão de Crédito por Categoria" (Supermercado 300)
    await user.selectOptions(selectGrafico, 'cartao_cat');
    expect(screen.getByText(/300,00/)).toBeInTheDocument();
  });
});