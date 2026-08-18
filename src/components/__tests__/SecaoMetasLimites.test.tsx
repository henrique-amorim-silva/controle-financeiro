import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SecaoMetasLimites } from '../SecaoMetasLimites';
import type { MetaCategoria } from '../../types/meta';
import type { Transacao } from '../../types/finance';

describe('SecaoMetasLimites Component', () => {
  const metasMock: MetaCategoria[] = [
    {
      id: '1',
      categoria: 'Alimentação',
      valorMeta: 1000,
      tipo: 'limite_gasto',
      frequencia: 'fixo',
    },
    {
      id: '2',
      categoria: 'Investimentos',
      valorMeta: 2000,
      tipo: 'meta_investimento',
      frequencia: 'fixo',
    },
  ];

  const transacoesMock: Transacao[] = [
    {
      id: 't1',
      descricao: 'Supermercado',
      valor: 800,
      tipo: 'despesa',
      pago: true,
      categoria: 'Alimentação',
      banco: 'Nubank',
      data: '2026-08-10',
    },
  ];

  it('deve exibir mensagem quando nenhuma meta ou limite estiver configurado', () => {
    render(
      <SecaoMetasLimites
        transacoes={[]}
        mesAtual="2026-08"
        metas={[]}
        onAdicionarMeta={() => {}}
        onDeletarMeta={() => {}}
      />
    );

    expect(
      screen.getByText(/nenhuma meta ou limite configurado para este período/i)
    ).toBeInTheDocument();
  });

  it('deve renderizar as metas corretamente com base nas transações realizadas', () => {
    render(
      <SecaoMetasLimites
        transacoes={transacoesMock}
        mesAtual="2026-08"
        metas={metasMock}
        onAdicionarMeta={() => {}}
        onDeletarMeta={() => {}}
      />
    );

    // Verifica se as categorias aparecem
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Investimentos')).toBeInTheDocument();

    // Verifica o realizado na Alimentação (800 de 1000)
    expect(screen.getByText(/800\.00/)).toBeInTheDocument();
  });

  it('deve chamar onDeletarMeta ao clicar no botão de excluir meta', async () => {
    const user = userEvent.setup();
    const handleDeletarMetaMock = vi.fn();

    render(
      <SecaoMetasLimites
        transacoes={[]}
        mesAtual="2026-08"
        metas={metasMock}
        onAdicionarMeta={() => {}}
        onDeletarMeta={handleDeletarMetaMock}
      />
    );

    const botoesExcluir = screen.getAllByTitle(/excluir meta/i);
    await user.click(botoesExcluir[0]);

    expect(handleDeletarMetaMock).toHaveBeenCalledTimes(1);
    expect(handleDeletarMetaMock).toHaveBeenCalledWith('1');
  });

  it('deve abrir o formulário e permitir adicionar uma nova meta', async () => {
    const user = userEvent.setup();
    const handleAdicionarMetaMock = vi.fn();

    render(
      <SecaoMetasLimites
        transacoes={[]}
        mesAtual="2026-08"
        metas={[]}
        onAdicionarMeta={handleAdicionarMetaMock}
        onDeletarMeta={() => {}}
      />
    );

    // Clica para abrir o formulário
    const botaoAbrirForm = screen.getByRole('button', { name: /nova meta \/ limite/i });
    await user.click(botaoAbrirForm);

    // Seleciona o primeiro combobox (Categoria)
    const selects = screen.getAllByRole('combobox');
    const selectCategoria = selects[0];
    await user.selectOptions(selectCategoria, 'Alimentação');

    const inputValor = screen.getByPlaceholderText('R$ 0,00');
    await user.type(inputValor, '150000'); // Equivalente a R$ 1.500,00

    const botaoSalvar = screen.getByRole('button', { name: /^salvar$/i });
    await user.click(botaoSalvar);

    expect(handleAdicionarMetaMock).toHaveBeenCalledTimes(1);
    expect(handleAdicionarMetaMock).toHaveBeenCalledWith({
      categoria: 'Alimentação',
      valorMeta: 1500,
      tipo: 'limite_gasto',
      frequencia: 'fixo',
      mes: undefined,
    });
  });
});