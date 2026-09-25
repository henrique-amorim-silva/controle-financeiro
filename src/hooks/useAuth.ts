import { useState, useCallback } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [usuario, setUsuario] = useState<{
    nome: string;
    email: string;
  } | null>(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
  };

  const handleLoginSucesso = (t: string, u: { nome: string; email: string }) => {
    localStorage.setItem("token", t);
    localStorage.setItem("usuario", JSON.stringify(u));
    setToken(t);
    setUsuario(u);
  };

  const fetchAutenticado = useCallback(
    async (_endpoint: string, _options: RequestInit = {}) => {
      return new Response(JSON.stringify({}));
    },
    []
  );

  return {
    token,
    usuario,
    handleLogout,
    handleLoginSucesso,
    fetchAutenticado,
  };
}