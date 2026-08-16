import type { CartaoCredito } from '../types/cartao';

export function calcularVencimentoFatura(
  dataCompraStr: string,
  cartao: CartaoCredito,
  offsetMeses: number = 0 // Usado para parcelas futuras (0 = atual, 1 = próxima parcela, etc.)
): string {
  const [ano, mes, dia] = dataCompraStr.split('-').map(Number);

  let mesVencimento = mes - 1 + offsetMeses; // JavaScript usa mês de 0 a 11
  let anoVencimento = ano;

  // Se a compra foi realizada no dia do fechamento ou depois, vai para a fatura seguinte
  if (dia >= cartao.diaFechamento) {
    mesVencimento += 1;
  }

  // Se o dia do vencimento for menor que o de fechamento (ex: fecha dia 25 e vence dia 05 do outro mês)
  if (cartao.diaVencimento < cartao.diaFechamento) {
    mesVencimento += 1;
  }

  const dataResultado = new Date(anoVencimento, mesVencimento, cartao.diaVencimento);
  const anoFinal = dataResultado.getFullYear();
  const mesFinal = String(dataResultado.getMonth() + 1).padStart(2, '0');
  const diaFinal = String(cartao.diaVencimento).padStart(2, '0');

  return `${anoFinal}-${mesFinal}-${diaFinal}`;
}