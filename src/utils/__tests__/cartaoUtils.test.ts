import { describe, it, expect } from 'vitest';
import { calcularVencimentoFatura } from '../cartaoUtils';
import type { CartaoCredito } from '../../types/cartao';

describe('cartaoUtils - calcularVencimentoFatura', () => {
  const cartaoComum: CartaoCredito = {
    id: '1',
    nome: 'Nubank',
    banco: 'Nubank',
    limite: 5000,
    diaFechamento: 10,
    diaVencimento: 17,
  };

  const cartaoVencimentoAntesFechamento: CartaoCredito = {
    id: '2',
    nome: 'Itaú',
    banco: 'Itaú',
    limite: 4000,
    diaFechamento: 25,
    diaVencimento: 5, // Vence no mês seguinte ao fechamento
  };

  it('deve calcular corretamente a fatura para uma compra feita antes do fechamento', () => {
    // Compra dia 05/08 (antes do fechamento dia 10). Vence no mesmo mês (17/08).
    const resultado = calcularVencimentoFatura('2026-08-05', cartaoComum);
    expect(resultado).toBe('2026-08-17');
  });

  it('deve avançar para o próximo mês se a compra for feita no dia do fechamento ou depois', () => {
    // Compra dia 10/08 (igual ao fechamento). Vai para a fatura de setembro, vencendo em 17/09.
    const resultadoNoFechamento = calcularVencimentoFatura('2026-08-10', cartaoComum);
    expect(resultadoNoFechamento).toBe('2026-09-17');

    // Compra dia 15/08 (após o fechamento). Vence em 17/09.
    const resultadoAposFechamento = calcularVencimentoFatura('2026-08-15', cartaoComum);
    expect(resultadoAposFechamento).toBe('2026-09-17');
  });

  it('deve calcular corretamente quando o dia de vencimento é menor que o dia de fechamento', () => {
    // Compra dia 20/08 (antes do fechamento dia 25, mas vencimento menor que fechamento adiciona mês extra)
    const resultado = calcularVencimentoFatura('2026-08-20', cartaoVencimentoAntesFechamento);
    expect(resultado).toBe('2026-09-05');
  });

  it('deve calcular corretamente faturas futuras utilizando offsetMeses', () => {
    // Compra dia 05/08, vencimento inicial em 17/08. Com offset 2, deve ser outubro (17/10).
    const resultadoParcela3 = calcularVencimentoFatura('2026-08-05', cartaoComum, 2);
    expect(resultadoParcela3).toBe('2026-10-17');
  });
});