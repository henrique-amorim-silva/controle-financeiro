import { useCallback } from 'react';
import { Header } from "./components/Header";
import { DashboardResumo } from "./components/DashboardResumo";
import { FormularioTransacao } from "./components/FormularioTransacao";
import { FormularioCartao } from "./components/FormularioCartao";
import { ListaTransacoes } from "./components/ListaTransacoes";
import { Footer } from "./components/Footer";
import { SaldosPorBanco } from "./components/SaldosPorBanco";
import { Login } from "./components/Login";
import { SecaoGraficos } from "./components/SecaoGraficos";
import { AcoesRapidas } from "./components/AcoesRapidas";
import { FiltrosTransacao } from "./components/FiltrosTransacao";
import { SecaoMetasLimites } from "./components/SecaoMetasLimites";

import { useAuth } from "./hooks/useAuth";
import { useTransacoes } from "./hooks/useTransacoes";
import { useCartoes } from "./hooks/useCartoes";
import { useMetas } from "./hooks/useMetas";

export default function App() {
  const { token, usuario, handleLogout, handleLoginSucesso, fetchAutenticado: fetchAuthBase } =
    useAuth();

  // Garante que a referência de fetchAutenticado seja estável para evitar loops nos useEffects dos hooks
  const fetchAutenticado = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      return fetchAuthBase(endpoint, {
        ...options,
        headers: {
          'ngrok-skip-browser-warning': 'true',
          ...(options.headers || {}),
        },
      });
    },
    [fetchAuthBase]
  );

  const {
    transacoes,
    transacaoEmEdicao,
    setTransacaoEmEdicao,
    mesFiltro,
    setMesFiltro,
    filtros,
    setFiltros,
    formularioRef,
    bancosUnicos,
    categoriasUnicas,
    transacoesMetricasGerais,
    transacoesFiltradasHistorico,
    handleLimparFiltrosHistorico,
    handleAdicionarTransacao,
    handleEditarTransacao,
    handleIniciarEdicao,
    handleDeletarTransacao,
    handleAlternarPago,
    handlePagarFaturaLote,
    handleDuplicarGastosFixos,
  } = useTransacoes(token, fetchAutenticado);

  const { cartoes, handleAdicionarCartao, handleDeletarCartao } = useCartoes(
    token,
    fetchAutenticado
  );

  const { metas, handleAdicionarMeta, handleDeletarMeta } = useMetas(
    token,
    fetchAutenticado
  );

  if (!token) {
    return <Login onLoginSucesso={handleLoginSucesso} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm shadow-slate-950/20">
          <div>
            <p className="text-xs text-slate-400">Usuário Autenticado</p>
            <h3 className="text-sm font-semibold text-emerald-400">
              {usuario?.nome}
            </h3>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium"
          >
            Sair da Conta
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-slate-950/20">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Métricas Gerais por Mês
            </h2>
            <p className="text-xs text-slate-400">
              Selecione o mês de referência para o resumo e gráficos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
            />
            {mesFiltro && (
              <button
                onClick={() => setMesFiltro("")}
                className="text-xs text-slate-400 hover:text-slate-200 underline px-2 py-1 cursor-pointer"
              >
                Balanço Geral
              </button>
            )}
          </div>
        </div>

        <DashboardResumo transacoes={transacoesMetricasGerais} />

        <SecaoMetasLimites
          transacoes={transacoesMetricasGerais}
          categorias={categoriasUnicas}
          mesAtual={mesFiltro}
          metas={metas}
          onAdicionarMeta={handleAdicionarMeta}
          onDeletarMeta={handleDeletarMeta}
        />

        <SaldosPorBanco transacoes={transacoes} />

        <SecaoGraficos transacoes={transacoesMetricasGerais} />

        <AcoesRapidas onDuplicarGastosFixos={handleDuplicarGastosFixos} />

        <FormularioCartao
          onAdicionarCartao={handleAdicionarCartao}
          cartoes={cartoes}
          onDeletarCartao={handleDeletarCartao}
        />

        <div ref={formularioRef}>
          <FormularioTransacao
            onAdicionarTransacao={handleAdicionarTransacao}
            onEditarTransacao={handleEditarTransacao}
            transacaoEmEdicao={transacaoEmEdicao}
            onCancelarEdicao={() => setTransacaoEmEdicao(null)}
            cartoes={cartoes}
          />
        </div>

        <div className="mt-8">
          <FiltrosTransacao
            filtros={filtros}
            setFiltros={setFiltros}
            bancos={bancosUnicos}
            categorias={categoriasUnicas}
            onLimpar={handleLimparFiltrosHistorico}
          />

          <ListaTransacoes
            transacoes={transacoesFiltradasHistorico}
            onDeletarTransacao={handleDeletarTransacao}
            onAlternarPago={handleAlternarPago}
            onIniciarEdicao={handleIniciarEdicao}
            onPagarFaturaLote={handlePagarFaturaLote}
          />
        </div>

        <Footer />
      </main>
    </div>
  );
}