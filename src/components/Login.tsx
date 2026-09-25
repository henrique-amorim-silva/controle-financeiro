import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface LoginProps {
  onLoginSucesso: (token: string, usuario: { nome: string; email: string }) => void;
}

// Função auxiliar para transformar a senha em hash SHA-256 (hexadecimal)
async function gerarHashSenha(senha: string): Promise<string> {
  const encoder = new TextEncoder();
  const dados = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dados);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const Login: React.FC<LoginProps> = ({ onLoginSucesso }) => {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    try {
      const senhaHash = await gerarHashSenha(senha);

      if (modoCadastro) {
        // Verifica se o e-mail já existe
        const { data: usuarioExistente } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (usuarioExistente) {
          throw new Error('Este e-mail já está cadastrado.');
        }

        // Insere o novo usuário salvando o hash na coluna 'senha_hash'
        const { error: erroInsercao } = await supabase
          .from('usuarios')
          .insert([{ nome, email, senha_hash: senhaHash }])
          .select()
          .single();

        if (erroInsercao) throw erroInsercao;

        alert('Conta criada com sucesso! Faça login para continuar.');
        setModoCadastro(false);
        setSenha('');
      } else {
        // Busca o usuário pelo e-mail
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (error) throw error;

        if (!usuario) {
          throw new Error('E-mail ou senha incorretos.');
        }

        let senhaValida = false;

        // 1. Verifica se a senha digitada confere com o novo hash seguro
        if (usuario.senha_hash === senhaHash) {
          senhaValida = true;
        } 
        // 2. Migração automática: se não bateu o hash, verifica se bate com a senha antiga em texto plano
        else if (usuario.senha_hash === senha) {
          senhaValida = true;
          // Atualiza automaticamente o banco para o novo hash seguro sem alterar os dados/lançamentos
          await supabase
            .from('usuarios')
            .update({ senha_hash: senhaHash })
            .eq('id', usuario.id);
        }

        if (!senhaValida) {
          throw new Error('E-mail ou senha incorretos.');
        }

        // Utiliza o ID do usuário como referência de sessão
        const token = String(usuario.id);
        const dadosUsuario = {
          nome: usuario.nome || email.split('@')[0],
          email: usuario.email || email,
        };

        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
        onLoginSucesso(token, dadosUsuario);
      }
    } catch (err: any) {
      setErro(err.message || 'Erro ao processar requisição.');
    }
  };

  return (
    <div style={{ maxWidth: '380px', margin: '60px auto', padding: '24px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a', boxShadow: '0 4px 14px rgba(15,23,42,0.7)', fontFamily: 'sans-serif', color: '#e2e8f0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#f8fafc' }}>
        {modoCadastro ? 'Criar Conta' : 'Controle Financeiro'}
      </h2>

      {erro && (
        <div style={{ background: '#7f1d1d', color: '#fee2e2', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {modoCadastro && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#cbd5e1' }}>Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#e2e8f0', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#cbd5e1' }}>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#e2e8f0', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#cbd5e1' }}>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#e2e8f0', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          style={{ width: '100%', padding: '10px', backgroundColor: '#16a34a', color: '#f8fafc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {modoCadastro ? 'Cadastrar' : 'Entrar'}
        </button>
      </form>

      <p
        role="button"
        tabIndex={0}
        style={{ marginTop: '16px', textAlign: 'center', cursor: 'pointer', color: '#7dd3fc', fontSize: '14px' }}
        onClick={() => { setModoCadastro(!modoCadastro); setErro(''); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setModoCadastro(!modoCadastro);
            setErro('');
          }
        }}
      >
        {modoCadastro ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
      </p>
    </div>
  );
};

export default Login;