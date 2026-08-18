import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiltrosTransacao, type FiltrosState } from '../FiltrosTransacao';

describe('FiltrosTransacao Component', () => {
  const filtrosIniciaisMock: FiltrosState = {
    tipo: 'todos',
    tipoGasto: 'todos',
    status: 'todos',
    descricao: '',
    banco: 'todos',
    categoria: 'todas',
    dataInicio: '',
    dataFim: '',
  };

  it('deve renderizar o painel recolhido por padrão e expandir ao clicar', async () => {
    const user = userEvent.setup();
    const setFiltrosMock = vi.fn();

    render(
      <FiltrosTransacao
        filtros={filtrosIniciaisMock}
        setFiltros={setFiltrosMock}
        bancos={['Nubank', 'Itaú']}
        categorias={['Alimentação', 'Transporte']}
        onLimpar={() => {}}
      />
    );

    // O título principal deve aparecer
    expect(screen.getByText('Filtros Avançados')).toBeInTheDocument();

    // Inicialmente o input de descrição não deve estar visível (painel fechado)
    expect(screen.queryByPlaceholderText(/buscar por nome/i)).not.toBeInTheDocument();

    // Clica para expandir os filtros
    await user.click(screen.getByText('Filtros Avançados'));

    // Agora o campo de descrição deve estar visível
    const inputDescricao = screen.getByPlaceholderText(/buscar por nome/i);
    expect(inputDescricao).toBeInTheDocument();

    // Simula a digitação de uma busca
    await user.type(inputDescricao, 'Supermercado');
    expect(setFiltrosMock).toHaveBeenCalled();
  });

  it('deve exibir o botão de limpar filtros e acionar onLimpar quando houver filtro ativo', async () => {
    const user = userEvent.setup();
    const onLimparMock = vi.fn();

    // Filtros com alteração ativa (ex: descrição preenchida)
    const filtrosComAtivo: FiltrosState = {
      ...filtrosIniciaisMock,
      descricao: 'Café',
    };

    render(
      <FiltrosTransacao
        filtros={filtrosComAtivo}
        setFiltros={() => {}}
        bancos={['Nubank']}
        categorias={['Alimentação']}
        onLimpar={onLimparMock}
      />
    );

    // O botão "Limpar Filtros" deve estar visível por ter um filtro ativo
    const botaoLimpar = screen.getByRole('button', { name: /limpar filtros/i });
    expect(botaoLimpar).toBeInTheDocument();

    await user.click(botaoLimpar);

    expect(onLimparMock).toHaveBeenCalledTimes(1);
  });
});