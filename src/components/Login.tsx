import React, { useState } from 'react';

interface LoginProps {
  onLoginSucesso: (token: string, usuario: { nome: string; email: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSucesso }) => {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const endpoint = modoCadastro ? '/auth/register' : '/auth/login';
    const body = modoCadastro ? { nome, email, senha } : { email, senha };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.mensagem || 'Erro ao processar requisição.');
        return;
      }

      if (modoCadastro) {
        alert('Conta criada com sucesso! Faça login para continuar.');
        setModoCadastro(false);
        setSenha('');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        onLoginSucesso(data.token, data.usuario);
      }
    } catch (err) {
      setErro('Erro de conexão com o servidor.');
    }
  };

  return (
    <div style={{ maxWidth: '380px', margin: '60px auto', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {modoCadastro ? 'Criar Conta' : 'Controle Financeiro'}
      </h2>

      {erro && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {modoCadastro && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {modoCadastro ? 'Cadastrar' : 'Entrar'}
        </button>
      </form>

      <p
        style={{ marginTop: '16px', textAlign: 'center', cursor: 'pointer', color: '#2563eb', fontSize: '14px' }}
        onClick={() => { setModoCadastro(!modoCadastro); setErro(''); }}
      >
        {modoCadastro ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
      </p>
    </div>
  );
};