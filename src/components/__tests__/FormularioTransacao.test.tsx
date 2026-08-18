import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormularioTransacao from '../FormularioTransacao';

describe('FormularioTransacao Component', () => {
  it('deve permitir preencher os campos do formulário e chamar a função de adicionar', async () => {
    const user = userEvent.setup();
    const handleAdicionarTransacaoMock = vi.fn();

    render(<FormularioTransacao onAdicionarTransacao={handleAdicionarTransacaoMock} />);

    // Seleciona os inputs utilizando os placeholders presentes no componente
    const inputDescricao = screen.getByPlaceholderText(/supermercado, aluguel, salário/i);
    const inputValor = screen.getByPlaceholderText(/r\$ 0,00/i);
    const botaoSalvar = screen.getByRole('button', { name: /salvar transação/i });

    // Simula a interação do usuário preenchendo os dados
    await user.type(inputDescricao, 'Supermercado');
    await user.type(inputValor, '15000'); 
    await user.click(botaoSalvar);

    // Valida se a função foi disparada com sucesso
    expect(handleAdicionarTransacaoMock).toHaveBeenCalled();
  });
});
