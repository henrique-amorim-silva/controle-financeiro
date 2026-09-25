import { useState, useEffect } from "react";
import type { CartaoCredito } from "../types/cartao";
import { supabase } from "../services/supabaseClient";

export function useCartoes(token: string | null) {
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);

  useEffect(() => {
    if (!token) return;

    const carregarCartoes = async () => {
      const { data, error } = await supabase
        .from("cartoes") // Alterado de "cartoes_credito" para "cartoes"
        .select("*")
        .eq("usuario_id", token) // Ajustado para "usuario_id" conforme o esquema do banco
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro ao carregar cartões:", error);
      } else if (data) {
        setCartoes(data as CartaoCredito[]);
      }
    };

    carregarCartoes();
  }, [token]);

  const handleAdicionarCartao = async (
    novoCartao: Omit<CartaoCredito, "id">,
  ) => {
    try {
      const payload = {
        nome: novoCartao.nome,
        banco: novoCartao.banco,
        limite: novoCartao.limite,
        dia_fechamento: novoCartao.diaFechamento, // Mapeia para o nome correto da coluna
        dia_vencimento: novoCartao.diaVencimento, // Mapeia para o nome correto da coluna
        usuario_id: token,
      };

      const { data, error } = await supabase
        .from("cartoes") // Alterado de "cartoes_credito" para "cartoes"
        .insert([payload])
        .select()
        .single();

      if (error) {
        alert(`Erro ao cadastrar cartão: ${error.message}`);
        return;
      }

      if (data) {
        setCartoes((prev) => [...prev, data as CartaoCredito]);
        alert("Cartão cadastrado com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao salvar cartão:", err);
    }
  };

  const handleDeletarCartao = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este cartão?")) return;

    try {
      const { error } = await supabase
        .from("cartoes") // Alterado de "cartoes_credito" para "cartoes"
        .delete()
        .eq("id", id);

      if (error) {
        alert(`Não foi possível excluir o cartão: ${error.message}`);
        return;
      }

      setCartoes((prev) => prev.filter((c) => Number(c.id) !== id));
      alert("Cartão excluído com sucesso!");
    } catch (err: unknown) {
      console.error("Erro ao excluir cartão:", err);
      alert("Erro de conexão ao tentar excluir o cartão.");
    }
  };

  return {
    cartoes,
    setCartoes,
    handleAdicionarCartao,
    handleDeletarCartao,
  };
}

export default useCartoes;
