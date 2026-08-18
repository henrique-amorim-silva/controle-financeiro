import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMetas } from '../useMetas';

describe('useMetas Hook - Testes Avançados', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Silencia logs de erro esperados
    globalThis.alert = vi.fn(); // Mock do alert global
  });

  it('deve carregar as metas da API com sucesso ao iniciar', async () => {
    const metasMock = [
      {
        id: '1',
        categoria: 'Alimentação',
        valorMeta: 800,
        tipo: 'limite_gasto',
        frequencia: 'mensal',
        mes: '2026-08',
      },
    ];

    const fetchAutenticadoMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => metasMock,
    });

    const { result } = renderHook(() =>
      useMetas('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(result.current.metas.length).toBe(1);
    });

    expect(result.current.metas[0].categoria).toBe('Alimentação');
    expect(result.current.metas[0].valorMeta).toBe(800);
  });

  it('deve lidar com falha no carregamento inicial (erro de API no GET)', async () => {
    const fetchAutenticadoMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ mensagem: 'Erro interno' }),
    });

    const { result } = renderHook(() =>
      useMetas('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(fetchAutenticadoMock).toHaveBeenCalledTimes(1);
    });

    // Mantém o estado vazio de forma segura sem quebrar o componente
    expect(result.current.metas).toEqual([]);
  });

  it('deve adicionar uma nova meta com sucesso', async () => {
    const novaMetaMock = {
      categoria: 'Lazer',
      valorMeta: 400,
      tipo: 'limite_gasto' as const,
      frequencia: 'mensal' as const,
      mes: '2026-08',
    };
    const metaRetornada = { id: '2', ...novaMetaMock };

    const fetchAutenticadoMock = vi.fn().mockImplementation((_url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => metaRetornada,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });

    const { result } = renderHook(() =>
      useMetas('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(fetchAutenticadoMock).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.handleAdicionarMeta(novaMetaMock);
    });

    expect(result.current.metas.length).toBe(1);
    expect(result.current.metas[0].categoria).toBe('Lazer');
    expect(result.current.metas[0].valorMeta).toBe(400);
  });

  it('deve exibir alerta e não adicionar a meta caso a API retorne erro no POST', async () => {
    const novaMetaMock = {
      categoria: 'Saúde',
      valorMeta: 200,
      tipo: 'limite_gasto' as const,
      frequencia: 'mensal' as const,
      mes: '2026-08',
    };

    const fetchAutenticadoMock = vi.fn().mockImplementation((_url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ mensagem: 'Categoria já possui meta ativa' }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    const { result } = renderHook(() =>
      useMetas('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(fetchAutenticadoMock).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.handleAdicionarMeta(novaMetaMock);
    });

    expect(result.current.metas.length).toBe(0);
    expect(globalThis.alert).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao cadastrar meta')
    );
  });

  it('deve excluir uma meta com sucesso ao chamar handleDeletarMeta', async () => {
    const metaExistente = {
      id: '1',
      categoria: 'Viagem',
      valorMeta: 1500,
      tipo: 'limite_gasto' as const,
      frequencia: 'anual' as const,
      mes: '2026-12',
    };

    const fetchAutenticadoMock = vi.fn().mockImplementation((_url, options) => {
      if (options?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ mensagem: 'Meta excluída' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [metaExistente],
      });
    });

    const { result } = renderHook(() =>
      useMetas('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(result.current.metas.length).toBe(1);
    });

    await act(async () => {
      await result.current.handleDeletarMeta('1');
    });

    expect(result.current.metas.length).toBe(0);
  });
});