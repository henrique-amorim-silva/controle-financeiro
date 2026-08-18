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

  const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const API_URL = (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') 
    ? rawUrl 
    : `https://${rawUrl}`).replace(/\/$/, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const endpoint = modoCadastro ? '/auth/register' : '/auth/login';
    const body = modoCadastro ? { nome, email, senha } : { email, senha };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
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
    } catch (_err) {
      setErro('Erro de conexão com o servidor.');
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