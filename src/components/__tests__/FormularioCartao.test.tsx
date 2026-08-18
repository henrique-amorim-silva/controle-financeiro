import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioCartao } from '../FormularioCartao';
import type { CartaoCredito } from '../../types/cartao';

describe('FormularioCartao Component', () => {
  const cartoesMock: CartaoCredito[] = [
    {
      id: 1 as unknown as CartaoCredito['id'], // Compatibilidade para ID numérico
      nome: 'Nubank Platinum',
      banco: 'Nubank',
      limite: 5000,
      diaFechamento: 5,
      diaVencimento: 12,
    },
  ];

  it('deve expandir o formulário ao clicar e cadastrar um novo cartão', async () => {
    const user = userEvent.setup();
    const handleAdicionarCartaoMock = vi.fn().mockResolvedValue(undefined);

    render(
      <FormularioCartao
        onAdicionarCartao={handleAdicionarCartaoMock}
        cartoes={[]}
        onDeletarCartao={async () => {}}
      />
    );

    // Inicialmente o campo de nome não está visível
    expect(screen.queryByPlaceholderText(/nome do cartão/i)).not.toBeInTheDocument();

    // Expande o painel
    await user.click(screen.getByText('Cadastrar Novo Cartão'));

    const inputNome = screen.getByPlaceholderText(/nome do cartão/i);
    const inputLimite = screen.getByPlaceholderText(/limite \(r\$/i);
    const botaoSalvar = screen.getByRole('button', { name: /salvar cartão/i });

    // Preenche os dados
    await user.type(inputNome, 'Visa Infinite');
    await user.type(inputLimite, '300000'); // Valor que será tratado pelo formatador para R$ 3.000,00

    await user.click(botaoSalvar);

    // Valida se a função de adicionar foi disparada
    expect(handleAdicionarCartaoMock).toHaveBeenCalledTimes(1);
    expect(handleAdicionarCartaoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Visa Infinite',
        limite: 3000,
      })
    );
  });

  it('deve exibir a lista de cartões cadastrados e permitir excluí-los', async () => {
    const user = userEvent.setup();
    const handleDeletarCartaoMock = vi.fn().mockResolvedValue(undefined);

    render(
      <FormularioCartao
        onAdicionarCartao={async () => {}}
        cartoes={cartoesMock}
        onDeletarCartao={handleDeletarCartaoMock}
      />
    );

    // Expande o painel para visualizar os cartões
    await user.click(screen.getByText('Cadastrar Novo Cartão'));

    // Verifica se o cartão mockado aparece na listagem
    expect(screen.getByText('Nubank Platinum')).toBeInTheDocument();

    const botaoExcluir = screen.getByRole('button', { name: /excluir/i });
    await user.click(botaoExcluir);

    // Verifica se disparou a função de deleção passando o id correto (número 1)
    expect(handleDeletarCartaoMock).toHaveBeenCalledTimes(1);
    expect(handleDeletarCartaoMock).toHaveBeenCalledWith(1);
  });
});

export default FormularioCartao;