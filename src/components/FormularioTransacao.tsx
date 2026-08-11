import React, { useState } from 'react';

interface FormularioTransacaoProps {
  onAdicionarTransacao: (transacao: any) => void;
}

export const FormularioTransacao: React.FC<FormularioTransacaoProps> = ({
  onAdicionarTransacao,
}) => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');
  const [tipoGasto, setTipoGasto] = useState<'fixo' | 'variavel'>('variavel');
  const [categoria, setCategoria] = useState('');
  const [banco, setBanco] = useState('');
  const [pago, setPago] = useState(true);
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao || !valor || !data) {
      alert('Preencha os campos obrigatórios (Descrição, Valor e Data).');
      return;
    }

    // Tratamento de valor para número com ponto flutuante
    const valorNumerico = typeof valor === 'string'
      ? parseFloat(valor.replace(',', '.'))
      : Number(valor);

    // Monta o objeto de envio
    const novaTransacao = {
      descricao,
      valor: valorNumerico,
      tipo,
      // Envia tipoGasto e tipogasto para mapear corretamente com a API/Banco de dados
      tipoGasto: tipo === 'despesa' ? tipoGasto : undefined,
      tipogasto: tipo === 'despesa' ? tipoGasto : undefined,
      categoria: categoria || 'Geral',
      banco: banco || 'Geral',
      pago,
      data,
    };

    onAdicionarTransacao(novaTransacao);

    // Limpa o formulário mantendo os valores padrão
    setDescricao('');
    setValor('');
    setCategoria('');
    setBanco('');
    setTipoGasto('variavel');
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-transacao">
      <h3>Nova Transação</h3>

      <div className="campo">
        <label>Tipo de Transação:</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as 'receita' | 'despesa')}
        >
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>
      </div>

      <div className="campo">
        <label>Descrição:</label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Supermercado, Aluguel, Salário..."
          required
        />
      </div>

      <div className="campo">
        <label>Valor (R$):</label>
        <input
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0,00"
          required
        />
      </div>

      {/* Exibe a opção de tipo de gasto SOMENTE quando for uma Despesa */}
      {tipo === 'despesa' && (
        <div className="campo">
          <label>Classificação do Gasto:</label>
          <select
            value={tipoGasto}
            onChange={(e) =>
              setTipoGasto(e.target.value as 'fixo' | 'variavel')
            }
          >
            <option value="variavel">Variável</option>
            <option value="fixo">Fixo</option>
          </select>
        </div>
      )}

      <div className="campo">
        <label>Categoria:</label>
        <input
          type="text"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Ex: Alimentação, Moradia, Lazer..."
        />
      </div>

      <div className="campo">
        <label>Banco / Conta:</label>
        <input
          type="text"
          value={banco}
          onChange={(e) => setBanco(e.target.value)}
          placeholder="Ex: Banco do Brasil, Nubank..."
        />
      </div>

      <div className="campo">
        <label>Data:</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />
      </div>

      <div className="campo-checkbox">
        <label>
          <input
            type="checkbox"
            checked={pago}
            onChange={(e) => setPago(e.target.checked)}
          />
          Pago / Concluído
        </label>
      </div>

      <button type="submit" className="btn-salvar">
        Salvar Transação
      </button>
    </form>
  );
};

export default FormularioTransacao;