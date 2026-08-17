import { useState, useEffect } from "react";
import type { CartaoCredito } from "../types/cartao";

export function useCartoes(
  token: string | null,
  fetchAutenticado: (endpoint: string, options?: RequestInit) => Promise<Response>
) {
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);

  useEffect(() => {
    if (!token) return;

    fetchAutenticado("/cartoes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCartoes(data);
        }
      })
      .catch((err) => console.error("Erro ao carregar cartões:", err));
  }, [token]);

  const handleAdicionarCartao = async (
    novoCartao: Omit<CartaoCredito, "id">
  ) => {
    try {
      const response = await fetchAutenticado("/cartoes", {
        method: "POST",
        body: JSON.stringify(novoCartao),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          `Erro ao cadastrar cartão: ${
            data.erro || data.mensagem || "Falha no servidor"
          }`
        );
        return;
      }

      setCartoes((prev) => [...prev, data]);
      alert("Cartão cadastrado com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar cartão:", err);
    }
  };

  const handleDeletarCartao = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este cartão?")) return;

    try {
      const response = await fetchAutenticado(`/cartoes/${id}`, {
        method: "DELETE",
      });

      const rawText = await response.text();
      let data: any = {};

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(
          `Servidor retornou erro (${response.status}). Certifique-se de ter reiniciado o backend para carregar a rota DELETE.`
        );
      }

      if (!response.ok) {
        alert(data.mensagem || "Não foi possível excluir o cartão.");
        return;
      }

      setCartoes((prev) => prev.filter((c) => Number(c.id) !== id));
      alert(data.mensagem || "Cartão excluído com sucesso!");
    } catch (err: any) {
      console.error("Erro ao excluir cartão:", err);
      alert(err.message || "Erro de conexão ao tentar excluir o cartão.");
    }
  };

  return {
    cartoes,
    setCartoes,
    handleAdicionarCartao,
    handleDeletarCartao,
  };
}