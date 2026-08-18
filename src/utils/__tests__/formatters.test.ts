import { describe, it, expect } from 'vitest';

// Exemplo de função utilitária pura que você pode isolar
const normalizarTexto = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

describe('Utilitários - Formatação e Normalização', () => {
  it('deve remover acentos e transformar o texto em minúsculo', () => {
    const textoOriginal = 'Supermercado Pão de Açúcar';
    const resultadoEsperado = 'supermercado pao de acucar';

    expect(normalizarTexto(textoOriginal)).toBe(resultadoEsperado);
  });
});