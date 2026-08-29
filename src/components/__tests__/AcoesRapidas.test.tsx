import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AcoesRapidas } from "../AcoesRapidas"; // Ajuste o caminho se necessário

describe("AcoesRapidas Component", () => {
  it("deve renderizar o título e chamar a função ao clicar no botão de duplicar gastos fixos", async () => {
    const user = userEvent.setup();
    const handleDuplicarGastosFixosMock = vi.fn();
    
    // Declaração dos mocks exigidos pelas novas props
    const handlePagarFaturaLoteMock = vi.fn();
    const cartoesMock = [
      { id: "1", nome: "Nubank", banco: "Nubank", limite: 1000, diaFechamento: 10, diaVencimento: 17 }
    ];

    // Renderiza o componente passando todas as props obrigatórias
    render(
      <AcoesRapidas
        onDuplicarGastosFixos={handleDuplicarGastosFixosMock}
        onPagarFaturaLote={handlePagarFaturaLoteMock}
        cartoes={cartoesMock}
      />,
    );

    // Verifica se o texto descritivo está na tela
    expect(screen.getByText(/ações rápidas/i)).toBeInTheDocument();

    // Encontra o botão pelo texto visível (ajustado para o texto real do componente)
    const botaoDuplicar = screen.getByRole("button", {
      name: /importar gastos fixos/i,
    });

    // Simula o clique do usuário
    await user.click(botaoDuplicar);

    // Valida se a função mock foi disparada exatamente uma vez
    expect(handleDuplicarGastosFixosMock).toHaveBeenCalledTimes(1);
  });
});