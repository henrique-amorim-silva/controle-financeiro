import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMetas } from '../useMetas';
import { supabase } from '../../services/supabaseClient';

// Simula o módulo do cliente Supabase para interceptar as chamadas nos testes
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useMetas Hook - Testes com Supabase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Silencia logs de erro esperados
    globalThis.alert = vi.fn(); // Mock do alert global
  });

  it('deve carregar as metas do Supabase com sucesso ao iniciar', async () => {
    const metasMock = [
      {
        id: 1,
        categoria: 'Alimentação',
        valor_meta: 800,
        tipo: 'limite_gasto',
        frequencia: 'mensal',
        mes: '2026-08',
        usuario_id: 'fake-token',
      },
    ];

    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: metasMock, error: null }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as any);

    const { result } = renderHook(() => useMetas('fake-token'));

    await waitFor(() => {
      expect(result.current.metas.length).toBe(1);
    });

    expect(result.current.metas[0].categoria).toBe('Alimentação');
    expect(result.current.metas[0].valorMeta).toBe(800);
  });

  it('deve adicionar uma nova meta com sucesso no Supabase', async () => {
    const novaMetaInput = {
      categoria: 'Lazer',
      valorMeta: 400,
      tipo: 'limite_gasto' as const,
      frequencia: 'mensal' as const,
      mes: '2026-08',
    };
    
    const metaRetornada = { 
      id: 2, 
      categoria: novaMetaInput.categoria,
      valor_meta: novaMetaInput.valorMeta,
      tipo: novaMetaInput.tipo,
      frequencia: novaMetaInput.frequencia,
      mes: novaMetaInput.mes,
      usuario_id: 'fake-token' 
    };

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: metaRetornada, error: null }),
      }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: insertMock,
    } as any);

    const { result } = renderHook(() => useMetas('fake-token'));

    await waitFor(() => {
      expect(result.current.metas).toEqual([]);
    });

    await act(async () => {
      await result.current.handleAdicionarMeta(novaMetaInput);
    });

    expect(result.current.metas.length).toBe(1);
    expect(result.current.metas[0].categoria).toBe('Lazer');
    expect(result.current.metas[0].valorMeta).toBe(400);
  });

  it('deve excluir uma meta com sucesso ao chamar handleDeletarMeta', async () => {
    const metaExistente = {
      id: 1,
      categoria: 'Viagem',
      valor_meta: 1500,
      tipo: 'limite_gasto' as const,
      frequencia: 'anual' as const,
      mes: '2026-12',
      usuario_id: 'fake-token',
    };

    const deleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [metaExistente], error: null }),
      }),
      delete: deleteMock,
    } as any);

    const { result } = renderHook(() => useMetas('fake-token'));

    await waitFor(() => {
      expect(result.current.metas.length).toBe(1);
    });

    await act(async () => {
      await result.current.handleDeletarMeta('1');
    });

    expect(result.current.metas.length).toBe(0);
  });
});