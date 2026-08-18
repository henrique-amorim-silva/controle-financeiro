import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth Hook', () => {
  // Limpa o localStorage antes de cada teste para garantir isolamento
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve iniciar sem token e sem usuário quando o localStorage estiver vazio', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.token).toBeNull();
    expect(result.current.usuario).toBeNull();
  });

  it('deve realizar o login com sucesso, salvando no localStorage e atualizando o estado', () => {
    const { result } = renderHook(() => useAuth());

    const tokenFake = 'jwt-token-123456';
    const usuarioFake = { nome: 'Usuário Teste', email: 'teste@email.com' };

    // Executa a função de login dentro do 'act' (necessário para atualizações de estado do React)
    act(() => {
      result.current.handleLoginSucesso(tokenFake, usuarioFake);
    });

    // Valida se o estado foi atualizado
    expect(result.current.token).toBe(tokenFake);
    expect(result.current.usuario).toEqual(usuarioFake);

    // Valida se salvou corretamente no localStorage
    expect(localStorage.getItem('token')).toBe(tokenFake);
    expect(localStorage.getItem('usuario')).toBe(JSON.stringify(usuarioFake));
  });

  it('deve realizar o logout, limpando o localStorage e removendo o token/usuário', () => {
    // Configura um estado inicial logado
    localStorage.setItem('token', 'jwt-token-123456');
    localStorage.setItem('usuario', JSON.stringify({ nome: 'Usuário Teste', email: 'teste@email.com' }));

    const { result } = renderHook(() => useAuth());

    // Garante que começou logado
    expect(result.current.token).not.toBeNull();

    // Executa o logout
    act(() => {
      result.current.handleLogout();
    });

    // Valida se os estados foram limpos
    expect(result.current.token).toBeNull();
    expect(result.current.usuario).toBeNull();

    // Valida se removeu do localStorage
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });
});