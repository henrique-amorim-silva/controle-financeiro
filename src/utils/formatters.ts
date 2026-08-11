// Formata números no padrão de Moeda Brasileira (BRL)
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// Formata data para DD/MM/YYYY
// Aceita formatos: YYYY-MM-DD, YYYY-MM-DDTHH:MM:SS.sssZ, e objetos Date
export function formatarData(dataIso: string | Date): string {
  if (!dataIso) {
    return '';
  }

  try {
    let data: Date;

    if (dataIso instanceof Date) {
      data = dataIso;
    } else if (typeof dataIso === 'string') {
      const trimmed = dataIso.trim();

      // Trata formato ISO com timestamp (2026-08-11T03:00:00.000Z)
      if (trimmed.includes('T')) {
        data = new Date(trimmed);
        if (isNaN(data.getTime())) {
          return '';
        }
      } else {
        // Trata formato simples YYYY-MM-DD
        const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
        const match = trimmed.match(regex);

        if (!match) {
          return '';
        }

        const [, ano, mes, dia] = match;
        const anoNum = parseInt(ano, 10);
        const mesNum = parseInt(mes, 10);
        const diaNum = parseInt(dia, 10);

        if (mesNum < 1 || mesNum > 12 || diaNum < 1 || diaNum > 31) {
          return '';
        }

        data = new Date(anoNum, mesNum - 1, diaNum);
      }
    } else {
      return '';
    }

    // Formata usando Intl.DateTimeFormat
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(data);
  } catch (err) {
    console.error(`[formatarData] Erro ao formatar data:`, err);
    return '';
  }
}