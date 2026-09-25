import { useState, useEffect } from "react";
import type { MetaCategoria } from "../types/meta";
import { supabase } from "../services/supabaseClient";

export function useMetas(token: string | null) {
  const [metas, setMetas] = useState<MetaCategoria[]>([]);

  useEffect(() => {
    if (!token) return;

    const carregarMetas = async () => {
      const { data, error } = await supabase
        .from("metas_categorias")
        .select("*")
        .eq("usuario_id", token); // Correlação com a tabela usuarios

      if (error) {
        console.error("Erro ao carregar metas:", error);
      } else if (data) {
        const metasFormatadas = data.map((m: any) => ({
          id: String(m.id),
          categoria: m.categoria,
          valorMeta: Number(m.valor_meta ?? m.valorMeta),
          tipo: m.tipo,
          frequencia: m.frequencia,
          mes: m.mes,
        }));
        setMetas(metasFormatadas);
      }
    };

    carregarMetas();
  }, [token]);

  const handleAdicionarMeta = async (novaMeta: Omit<MetaCategoria, "id">) => {
    try {
      const payload = {
        categoria: novaMeta.categoria,
        valor_meta: novaMeta.valorMeta,
        tipo: novaMeta.tipo,
        frequencia: novaMeta.frequencia,
        mes: novaMeta.mes,
        usuario_id: token, // Associa à tabela usuarios
      };

      const { data, error } = await supabase
        .from("metas_categorias")
        .insert([payload])
        .select()
        .single();

      if (error) {
        alert(`Erro ao cadastrar meta: ${error.message}`);
        return;
      }

      if (data) {
        const metaCriada: MetaCategoria = {
          id: String(data.id),
          categoria: data.categoria,
          valorMeta: Number(data.valor_meta ?? data.valorMeta),
          tipo: data.tipo,
          frequencia: data.frequencia,
          mes: data.mes,
        };
        setMetas((prev) => [...prev, metaCriada]);
      }
    } catch (err) {
      console.error("Erro ao salvar meta:", err);
    }
  };

  const handleDeletarMeta = async (id: string) => {
    try {
      const { error } = await supabase
        .from("metas_categorias")
        .delete()
        .eq("id", id);

      if (error) {
        alert(error.message || "Erro ao excluir meta.");
      } else {
        setMetas((prev) => prev.filter((m) => m.id !== id));
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