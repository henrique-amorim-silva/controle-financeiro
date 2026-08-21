import { useState, useCallback } from "react";

const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = (
  rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : `https://${rawUrl}`
).replace(/\/$/, "");

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
    async (endpoint: string, options: RequestInit = {}) => {
      const headers = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      return response;
    },
    [token]
  );

  return {
    token,
    usuario,
    handleLogout,
    handleLoginSucesso,
    fetchAutenticado,
  };
}