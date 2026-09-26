import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

// Função auxiliar para gerar o hash SHA-256 da nova senha
async function gerarHashSenha(senha: string): Promise<string> {
  const encoder = new TextEncoder();
  const dados = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dados);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface AlterarSenhaProps {
  token: string | null;
}

export const AlterarSenha: React.FC<AlterarSenhaProps> = ({ token }) => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem({ texto: '', tipo: '' });

    if (novaSenha !== confirmarSenha) {
      setMensagem({ texto: 'A nova senha e a confirmação não coincidem.', tipo: 'erro' });
      return;
    }

    if (novaSenha.length < 6) {
      setMensagem({ texto: 'A nova senha deve ter pelo menos 6 caracteres.', tipo: 'erro' });
      return;
    }

    if (!token) {
      setMensagem({ texto: 'Usuário não autenticado.', tipo: 'erro' });
      return;
    }

    try {
      // Busca os dados do usuário atual no banco
      const { data: usuario, error: erroBusca } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', token)
        .single();

      if (erroBusca || !usuario) {
        throw new Error('Erro ao localizar dados do usuário.');
      }

      const hashSenhaAtual = await gerarHashSenha(senhaAtual);

      // Valida se a senha atual está correta (testando o hash ou a senha antiga em texto plano)
      let senhaValida = false;
      if (usuario.senha_hash === hashSenhaAtual || usuario.senha_hash === senhaAtual) {
        senhaValida = true;
      }

      if (!senhaValida) {
        throw new Error('A senha atual (ou temporária) está incorreta.');
      }

      // Gera o novo hash seguro para a nova senha
      const novoHash = await gerarHashSenha(novaSenha);

      // Atualiza a tabela de usuários com o novo hash
      const { error: erroUpdate } = await supabase
        .from('usuarios')
        .update({ senha_hash: novoHash })
        .eq('id', token);

      if (erroUpdate) throw erroUpdate;

      setMensagem({ texto: 'Senha alterada com sucesso!', tipo: 'sucesso' });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err: any) {
      setMensagem({ texto: err.message || 'Erro ao alterar a senha.', tipo: 'erro' });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '30px auto', padding: '24px', border: '1px solid #93c5fd', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 4px 14px rgba(30,64,175,0.1)', fontFamily: 'sans-serif', color: '#1e293b' }}>
      <h3 style={{ marginBottom: '16px', color: '#1e293b', textAlign: 'center' }}>Alterar Senha</h3>

      {mensagem.texto && (
        <div style={{ padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', backgroundColor: mensagem.tipo === 'sucesso' ? '#dcfce7' : '#ffe4e6', color: mensagem.tipo === 'sucesso' ? '#166534' : '#9f1239' }}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleAlterarSenha}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#475569' }}>Senha Atual (ou 123456):</label>
          <input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #93c5fd', backgroundColor: '#f8fafc', color: '#1e293b', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#475569' }}>Nova Senha:</label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #93c5fd', backgroundColor: '#f8fafc', color: '#1e293b', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#475569' }}>Confirmar Nova Senha:</label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #93c5fd', backgroundColor: '#f8fafc', color: '#1e293b', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Atualizar Senha
        </button>
      </form>
    </div>
  );
};

export default AlterarSenha;