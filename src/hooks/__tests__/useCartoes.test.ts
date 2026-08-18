import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCartoes } from '../useCartoes';

describe('useCartoes Hook - Testes Avançados', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.alert = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true); // Simula confirmação positiva do usuário
  });

  it('deve carregar os cartões da API com sucesso ao iniciar', async () => {
    const cartoesMock = [
      { id: '1', nome: 'Nubank', banco: 'Nubank', limite: 5000, diaFechamento: 5, diaVencimento: 10 },
    ];

    const fetchAutenticadoMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => cartoesMock,
    });

    const { result } = renderHook(() =>
      useCartoes('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(result.current.cartoes.length).toBe(1);
    });

    expect(result.current.cartoes[0].nome).toBe('Nubank');
  });

  it('deve tratar falhas de requisição GET no carregamento inicial', async () => {
    const fetchAutenticadoMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => [],
    });

    const { result } = renderHook(() =>
      useCartoes('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(fetchAutenticadoMock).toHaveBeenCalledTimes(1);
    });

    expect(result.current.cartoes).toEqual([]);
  });

  it('deve adicionar um novo cartão com sucesso e disparar alerta de sucesso', async () => {
    const novoCartaoMock = { 
      nome: 'Inter', 
      banco: 'Inter', 
      limite: 3000, 
      diaFechamento: 10, 
      diaVencimento: 15 
    };
    const cartaoRetornado = { id: '2', ...novoCartaoMock };

    const fetchAutenticadoMock = vi.fn().mockImplementation((_url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => cartaoRetornado,
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    const { result } = renderHook(() =>
      useCartoes('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(fetchAutenticadoMock).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.handleAdicionarCartao(novoCartaoMock);
    });

    expect(result.current.cartoes.length).toBe(1);
    expect(result.current.cartoes[0].nome).toBe('Inter');
    expect(globalThis.alert).toHaveBeenCalledWith('Cartão cadastrado com sucesso!');
  });

  it('deve tratar erro ao tentar cadastrar cartão (resposta com falha)', async () => {
    const novoCartaoMock = { 
      nome: 'Itaú', 
      banco: 'Itaú', 
      limite: 2000, 
      diaFechamento: 5, 
      diaVencimento: 10 
    };

    const fetchAutenticadoMock = vi.fn().mockImplementation((_url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ erro: 'Cartão já cadastrado' }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    const { result } = renderHook(() =>
      useCartoes('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(fetchAutenticadoMock).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.handleAdicionarCartao(novoCartaoMock);
    });

    expect(result.current.cartoes.length).toBe(0);
    expect(globalThis.alert).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao cadastrar cartão')
    );
  });

  it('deve deletar um cartão com sucesso ao confirmar a exclusão', async () => {
    const cartaoExistente = { id: '1', nome: 'Nubank', banco: 'Nubank', limite: 5000, diaFechamento: 5, diaVencimento: 10 };

    const fetchAutenticadoMock = vi.fn().mockImplementation((_url, options) => {
      if (options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          text: async () => JSON.stringify({ mensagem: 'Cartão excluído com sucesso!' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [cartaoExistente],
      });
    });

    const { result } = renderHook(() =>
      useCartoes('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(result.current.cartoes.length).toBe(1);
    });

    await act(async () => {
      await result.current.handleDeletarCartao(1);
    });

    expect(result.current.cartoes.length).toBe(0);
    expect(globalThis.alert).toHaveBeenCalledWith('Cartão excluído com sucesso!');
  });
});