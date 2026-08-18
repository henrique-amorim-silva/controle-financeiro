import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTransacoes } from '../useTransacoes';

describe('useTransacoes Hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Silencia logs de erro esperados no console
  });

  it('deve carregar e normalizar as transações da API com sucesso', async () => {
    const transacoesMock = [
      {
        id: '1',
        descricao: '  SUPERMERCADO PÃO DE AÇÚCAR  ',
        valor: '150,50',
        tipo: 'despesa',
        tipogasto: 'VARIÁVEL',
        metodo_pagamento: 'CREDITO',
        data: '2026-08-10',
        banco: 'Nubank',
        categoria: 'Alimentação',
        pago: true,
      },
    ];

    const fetchAutenticadoMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => transacoesMock,
    });

    const { result } = renderHook(() =>
      useTransacoes('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(result.current.transacoes.length).toBe(1);
    });

    const transacaoNormalizada = result.current.transacoes[0];
    expect(transacaoNormalizada.valor).toBe(150.5);
    expect(transacaoNormalizada.tipoGasto).toBe('variável');
    expect(transacaoNormalizada.metodoPagamento).toBe('credito');
  });

  it('deve tratar estados vazios quando a API retorna uma lista vazia', async () => {
    const fetchAutenticadoMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() =>
      useTransacoes('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(fetchAutenticadoMock).toHaveBeenCalledTimes(1);
    });

    expect(result.current.transacoes).toEqual([]);
    expect(result.current.bancosUnicos).toEqual([]);
    expect(result.current.categoriasUnicas).toEqual([]);
    expect(result.current.transacoesFiltradasHistorico).toEqual([]);
  });

  it('deve lidar com erros de API ao falhar na requisição inicial', async () => {
    const fetchAutenticadoMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ erro: 'Falha interna no servidor' }),
    });

    const { result } = renderHook(() =>
      useTransacoes('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(fetchAutenticadoMock).toHaveBeenCalledTimes(1);
    });

    // O hook ignora respostas que não sejam arrays válidos, mantendo o estado vazio de forma segura
    expect(result.current.transacoes).toEqual([]);
  });

  it('deve filtrar as transações corretamente por período (dataInicio e dataFim)', async () => {
    const transacoesMock = [
      { id: '1', descricao: 'Antiga', valor: 100, tipo: 'despesa', data: '2026-07-15', pago: true, banco: 'Nubank', categoria: 'Outros' },
      { id: '2', descricao: 'No Período', valor: 200, tipo: 'despesa', data: '2026-08-10', pago: true, banco: 'Nubank', categoria: 'Outros' },
      { id: '3', descricao: 'Futura', valor: 300, tipo: 'despesa', data: '2026-09-05', pago: true, banco: 'Nubank', categoria: 'Outros' },
    ];

    const fetchAutenticadoMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => transacoesMock,
    });

    const { result } = renderHook(() =>
      useTransacoes('fake-token', fetchAutenticadoMock)
    );

    await waitFor(() => {
      expect(result.current.transacoes.length).toBe(3);
    });

    // Aplicando filtro por período via setFiltros
    act(() => {
      result.current.setFiltros((prev) => ({
        ...prev,
        dataInicio: '2026-08-01',
        dataFim: '2026-08-31',
      }));
    });

    // Deve retornar apenas a transação que está dentro do mês de agosto de 2026
    expect(result.current.transacoesFiltradasHistorico.length).toBe(1);
    expect(result.current.transacoesFiltradasHistorico[0].descricao).toBe('No Período');
  });
});