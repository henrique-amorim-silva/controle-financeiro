import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AcoesRapidas } from '../AcoesRapidas'; // Ajuste o caminho se necessário

describe('AcoesRapidas Component', () => {
  it('deve renderizar o título e chamar a função ao clicar no botão de duplicar gastos fixos', async () => {
    const user = userEvent.setup();
    const handleDuplicarGastosFixosMock = vi.fn();

    // Renderiza o componente passando a prop exigida
    render(<AcoesRapidas onDuplicarGastosFixos={handleDuplicarGastosFixosMock} />);

    // Verifica se o texto descritivo está na tela
    expect(screen.getByText(/ações rápidas/i)).toBeInTheDocument();

    // Encontra o botão pelo texto visível
    const botaoDuplicar = screen.getByRole('button', {
      name: /importar gastos fixos do mês anterior/i,
    });

    // Simula o clique do usuário
    await user.click(botaoDuplicar);

    // Valida se a função mock foi disparada exatamente uma vez
    expect(handleDuplicarGastosFixosMock).toHaveBeenCalledTimes(1);
  });
});