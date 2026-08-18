import { useState, useEffect } from "react";
import type { MetaCategoria } from "../types/meta";

export function useMetas(
  token: string | null,
  fetchAutenticado: (endpoint: string, options?: RequestInit) => Promise<Response>
) {
  const [metas, setMetas] = useState<MetaCategoria[]>([]);

  useEffect(() => {
    if (!token) return;

    fetchAutenticado("/metas")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMetas(data);
        }
      })
      .catch((err) => console.error("Erro ao carregar metas:", err));
  }, [token, fetchAutenticado]);

  const handleAdicionarMeta = async (novaMeta: Omit<MetaCategoria, "id">) => {
    try {
      const response = await fetchAutenticado("/metas", {
        method: "POST",
        body: JSON.stringify(novaMeta),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          `Erro ao cadastrar meta: ${data.mensagem || "Falha no servidor"}`
        );
        return;
      }

      setMetas((prev) => [...prev, data]);
    } catch (err) {
      console.error("Erro ao salvar meta:", err);
    }
  };

  const handleDeletarMeta = async (id: string) => {
    try {
      const response = await fetchAutenticado(`/metas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMetas((prev) => prev.filter((m) => m.id !== id));
      } else {
        const data = await response.json();
        alert(data.mensagem || "Erro ao excluir meta.");
      }
    } catch (err) {
      console.error("Erro ao deletar meta:", err);
    }
  };

  return {
    metas,
    setMetas,
    handleAdicionarMeta,
    handleDeletarMeta,
  };
}

export default useMetas;