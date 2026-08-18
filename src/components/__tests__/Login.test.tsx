import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '../Login';

describe('Login Component', () => {
  const onLoginSucessoMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock global do fetch para simular respostas da API
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'fake-jwt-token-123',
          usuario: { nome: 'Usuário Teste', email: 'teste@teste.com' },
        }),
      })
    );
  });

  it('deve alternar entre modo de login e modo de cadastro ao clicar no link de alternância', async () => {
    const user = userEvent.setup();

    render(<Login onLoginSucesso={onLoginSucessoMock} />);

    // Inicialmente exibe o título de login
    expect(screen.getByRole('heading', { name: /controle financeiro/i })).toBeInTheDocument();
    
    // Clica para alternar para o modo de cadastro
    await user.click(screen.getByText(/não tem conta\? cadastre-se/i));

    // Agora o título deve mudar para criar conta
    expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('deve realizar o login com sucesso, salvar no localStorage e chamar onLoginSucesso', async () => {
    const user = userEvent.setup();

    render(<Login onLoginSucesso={onLoginSucessoMock} />);

    // Seleciona os inputs diretamente pelos seus tipos no DOM
    const inputEmail = document.querySelector('input[type="email"]') as HTMLInputElement;
    const inputSenha = document.querySelector('input[type="password"]') as HTMLInputElement;
    const botaoEntrar = screen.getByRole('button', { name: /^entrar$/i });

    await user.type(inputEmail, 'teste@teste.com');
    await user.type(inputSenha, '123456');
    await user.click(botaoEntrar);

    // Aguarda o fluxo assíncrono e verifica se salvou no localStorage
    expect(localStorage.getItem('token')).toBe('fake-jwt-token-123');
    expect(localStorage.getItem('usuario')).toBeTruthy();

    // Valida se a função de sucesso foi chamada com os dados retornados
    expect(onLoginSucessoMock).toHaveBeenCalledTimes(1);
    expect(onLoginSucessoMock).toHaveBeenCalledWith('fake-jwt-token-123', {
      nome: 'Usuário Teste',
      email: 'teste@teste.com',
    });
  });
});