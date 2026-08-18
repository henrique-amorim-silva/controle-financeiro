import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DollarSign } from 'lucide-react';
import { CardResumo } from '../CardResumo'; // Ajuste o caminho se necessário

describe('CardResumo Component', () => {
  it('deve renderizar o título e o valor formatado corretamente', () => {
    render(
      <CardResumo
        titulo="Saldo Total"
        valor={1250.5}
        icon={DollarSign}
      />
    );

    // Verifica se o título do card está presente
    expect(screen.getByText('Saldo Total')).toBeInTheDocument();

    // Verifica se o valor foi formatado corretamente em moeda (ex: R$ 1.250,50)
    expect(screen.getByText(/1\.250,50/)).toBeInTheDocument();
  });

  it('deve aplicar as classes de destaque quando a prop destaque for verdadeira', () => {
    const { container } = render(
      <CardResumo
        titulo="Receita"
        valor={3000}
        icon={DollarSign}
        destaque={true}
      />
    );

    // Seleciona o elemento container principal do Card
    const cardElement = container.firstChild as HTMLElement;

    // Valida se a classe de estilo para destaque foi aplicada
    expect(cardElement).toHaveClass('bg-slate-900/90');
  });
});
