import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCartoes } from '../useCartoes';
import { supabase } from '../../services/supabaseClient';

// Simula o módulo do cliente Supabase para interceptar as chamadas nos testes
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useCartoes Hook - Testes com Supabase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.alert = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('deve carregar os cartões do Supabase com sucesso ao iniciar', async () => {
    const cartoesMock = [
      { id: 1, nome: 'Nubank', banco: 'Nubank', limite: 5000, dia_fechamento: 5, dia_vencimento: 10, usuario_id: 'fake-token' },
    ];

    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: cartoesMock, error: null }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(() => useCartoes('fake-token'));

    await waitFor(() => {
      expect(result.current.cartoes.length).toBe(1);
    });

    expect(result.current.cartoes[0].nome).toBe('Nubank');
  });

  it('deve adicionar um novo cartão com sucesso no Supabase', async () => {
    const novoCartaoInput = { 
      nome: 'Inter', 
      banco: 'Inter', 
      limite: 3000, 
      diaFechamento: 10, 
      diaVencimento: 15 
    };
    
    const cartaoRetornado = { id: 2, ...novoCartaoInput, usuario_id: 'fake-token' };

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: cartaoRetornado, error: null }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: insertMock,
    } as any);

    const { result } = renderHook(() => useCartoes('fake-token'));

    await waitFor(() => {
      expect(result.current.cartoes).toEqual([]);
    });

    await act(async () => {
      await result.current.handleAdicionarCartao(novoCartaoInput);
    });

    expect(result.current.cartoes.length).toBe(1);
    expect(result.current.cartoes[0].nome).toBe('Inter');
    expect(globalThis.alert).toHaveBeenCalledWith('Cartão cadastrado com sucesso!');
  });

  it('deve deletar um cartão com sucesso ao confirmar a exclusão', async () => {
    const cartaoExistente = { id: 1, nome: 'Nubank', banco: 'Nubank', limite: 5000, diaFechamento: 5, diaVencimento: 10, usuario_id: 'fake-token' };

    const deleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [cartaoExistente], error: null }),
        }),
      }),
      delete: deleteMock,
    } as any);

    const { result } = renderHook(() => useCartoes('fake-token'));

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