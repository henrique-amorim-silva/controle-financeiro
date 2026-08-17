# 💰 Controle Financeiro - Sistema de Gestão Financeira Pessoal

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Aplicação web moderna e responsiva para controle financeiro pessoal. Gerecie suas transações, cartões de crédito, metas de gastos e visualize seus dados através de gráficos interativos.

## 🎯 Sobre o Projeto

**Controle Financeiro** é um sistema SPA (Single Page Application) desenvolvido com as tecnologias mais modernas do ecossistema React, focando em performance, segurança e experiência do usuário. A aplicação permite que usuários gerenciem suas finanças pessoais de forma intuitiva, com autenticação segura e persistência de dados em backend.

### Principais Características

- ✅ **Autenticação e Segurança**: Sistema de login com geração de tokens
- 📊 **Dashboard Inteligente**: Resumo visual das finanças com gráficos em tempo real
- 💳 **Gerenciamento de Cartões**: Cadastre múltiplos cartões de crédito com limites e datas de fechamento
- 💸 **Controle de Transações**: Registre despesas, receitas e transferências entre contas
- 📈 **Metas e Limites**: Estabeleça metas de gastos por categoria e monitore seu progresso
- 🏦 **Múltiplos Bancos**: Suporte para diversos bancos e carteiras digitais
- 🔍 **Filtros Avançados**: Filtre transações por período, categoria, banco e status de pagamento
- 📱 **Design Responsivo**: Interface adaptada para desktop, tablet e dispositivos móveis
- 🌙 **Tema Escuro**: Interface dark mode para melhor experiência visual
- ⚡ **Performance Otimizada**: Construído com Vite para inicialização e build extremamente rápidos

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.2.8** - Framework UI com Hooks e Server Components
- **TypeScript 6.0** - Tipagem estática para maior segurança
- **Vite 8.2** - Build tool ultrarrápido com HMR (Hot Module Replacement)
- **Tailwind CSS 4.3** - Framework de CSS utilizado para estilização
- **Recharts 3.10** - Biblioteca de gráficos responsivos
- **Lucide React 1.31** - Conjunto de ícones SVG
- **ESLint 10.8** - Linter para manutenção de código
- **TypeScript ESLint** - Integração de linting com TypeScript

### Arquitetura
- **React Hooks** - Estado e efeitos com hooks customizados
- **Context API** - Gerenciamento de estado global (tema)
- **Custom Hooks** - Lógica reutilizável encapsulada
- **Componentes Funcionais** - Componentes modernos baseados em funções
- **Compositional Design** - Componentes pequenos e reutilizáveis

## 📂 Estrutura do Projeto

```
controle-financeiro/
├── src/
│   ├── components/              # Componentes React reutilizáveis
│   │   ├── AcoesRapidas.tsx
│   │   ├── CardResumo.tsx
│   │   ├── DashboardResumo.tsx
│   │   ├── FaturaCartaoModal.tsx
│   │   ├── FiltrosTransacao.tsx
│   │   ├── FormularioCartao.tsx
│   │   ├── FormularioTransacao.tsx
│   │   ├── Header.tsx
│   │   ├── ListaTransacoes.tsx
│   │   ├── Login.tsx
│   │   ├── SaldosPorBanco.tsx
│   │   ├── SecaoGraficos.tsx
│   │   ├── SecaoMetasLimites.tsx
│   │   └── Footer.tsx
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useAuth.ts          # Gerenciamento de autenticação
│   │   ├── useCartoes.ts       # Gerenciamento de cartões
│   │   ├── useTransacoes.ts    # Gerenciamento de transações
│   │   └── useMetas.ts         # Gerenciamento de metas
│   ├── context/                 # Contextos do React
│   │   └── ThemeContext.tsx    # Contexto de tema (dark/light)
│   ├── types/                   # Definições TypeScript
│   │   ├── cartao.ts           # Interface CartaoCredito
│   │   ├── finance.ts          # Tipos e interfaces financeiras
│   │   └── meta.ts             # Interface MetaCategoria
│   ├── data/                    # Dados iniciais
│   │   └── initialData.ts
│   ├── utils/                   # Funções utilitárias
│   │   ├── cartaoUtils.ts
│   │   └── formatters.ts       # Funções de formatação
│   ├── assets/                  # Recursos estáticos
│   ├── App.tsx                  # Componente raiz
│   ├── main.tsx                 # Ponto de entrada
│   └── index.css                # Estilos globais
├── public/                      # Arquivos públicos
├── vite.config.ts               # Configuração do Vite
├── tsconfig.json                # Configuração TypeScript
├── tailwind.config.js           # Configuração Tailwind CSS
├── eslint.config.js             # Configuração ESLint
├── package.json                 # Dependências do projeto
├── index.html                   # Arquivo HTML principal
└── README.md                    # Documentação original
```

## 🚀 Como Começar

### Pré-requisitos

- **Node.js** 18.0.0 ou superior
- **npm** 9.0.0 ou superior (ou yarn/pnpm)
- **Git** para controle de versão

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/controle-financeiro.git
   cd controle-financeiro
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure variáveis de ambiente** (se necessário)
   ```bash
   cp .env.example .env.local
   # Edite o arquivo com suas configurações
   ```

### Executando o Projeto

**Modo de Desenvolvimento**
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`

**Build para Produção**
```bash
npm run build
```

**Preview da Build de Produção**
```bash
npm run preview
```

**Verificar Qualidade do Código**
```bash
npm run lint
```

## 📱 Funcionalidades Detalhadas

### 🔐 Autenticação
- Sistema de login com validação de credenciais
- Geração de tokens JWT para sessões seguras
- Persistência de autenticação entre sessões
- Logout com limpeza de sessão

### 💳 Gerenciamento de Cartões de Crédito
- Cadastro de múltiplos cartões
- Configuração de limite de crédito
- Definição de dia de fechamento e vencimento
- Suporte a diversos bancos (Nubank, Itaú, Bradesco, etc.)
- Visualização de faturas por cartão

### 💰 Controle de Transações
- Registro de três tipos de transações:
  - **Despesas**: Gastos pessoais categorizados
  - **Receitas**: Ganhos com diversas fontes
  - **Transferências**: Movimentações entre contas
- Categorização automática de gastos
- Marcação de pagamento (pago/pendente)
- Suporte a parcelamentos
- Histórico completo e editável
- Duplicação de gastos fixos para facilitar entrada de dados

### 📊 Análise e Visualização
- Dashboard com resumo financeiro
- Gráficos interativos com Recharts
- Análise de gastos por categoria
- Visualização de saldos por banco
- Métricas gerais de receitas e despesas

### 🎯 Metas e Limites de Gastos
- Definição de metas por categoria
- Tipos de metas:
  - **Limite de Gasto**: Máximo permitido em uma categoria
  - **Meta de Investimento**: Valores alvo para poupança
- Acompanhamento de progresso
- Alertas visuais quando limites são ultrapassados

### 🔍 Filtros Avançados
- Filtrar por período (mês/ano)
- Filtrar por categoria
- Filtrar por banco
- Filtrar por tipo de transação
- Filtrar por status de pagamento
- Combinação de múltiplos filtros

## 🏗️ Arquitetura e Padrões

### Componentes
A aplicação segue a arquitetura de componentes React com separação clara de responsabilidades:

- **Componentes de Página**: Containers que gerenciam estado e lógica
- **Componentes de UI**: Componentes puros de apresentação
- **Componentes Funcionais**: Todos os componentes usam Hooks

### State Management
- **Context API** para tema global
- **Custom Hooks** para lógica de domínio (transações, cartões, metas)
- **Estado Local** para UI temporária (modais, formulários)

### Tipagem TypeScript
- Interfaces bem definidas para todos os tipos
- Types discriminados para transações
- Enums para valores fixos
- Type Safety em toda a aplicação

## 🔌 Integração com Backend

A aplicação espera uma API REST com os seguintes endpoints:

### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/logout` - Logout
- `GET /auth/perfil` - Dados do usuário autenticado

### Transações
- `GET /transacoes` - Listar transações
- `POST /transacoes` - Criar transação
- `PUT /transacoes/:id` - Editar transação
- `DELETE /transacoes/:id` - Deletar transação
- `POST /transacoes/:id/toggle-pago` - Marcar como pago/pendente
- `POST /transacoes/pagar-lote` - Pagar múltiplas transações

### Cartões
- `GET /cartoes` - Listar cartões
- `POST /cartoes` - Criar cartão
- `DELETE /cartoes/:id` - Deletar cartão

### Metas
- `GET /metas` - Listar metas
- `POST /metas` - Criar meta
- `DELETE /metas/:id` - Deletar meta

## 🎨 Temas e Personalizações

### Dark Mode
A aplicação implementa um tema escuro profissional usando Tailwind CSS com as seguintes cores:
- **Background**: `slate-950`, `slate-900`
- **Text**: `slate-100`, `slate-400`
- **Accents**: `emerald`, `rose`, `amber`, `blue`

### Customização
Para personalizar cores e temas, edite:
- `src/context/ThemeContext.tsx` - Lógica de tema
- `tailwind.config.js` - Configuração de cores

## 📈 Performance

- **Code Splitting**: Vite realiza bundling otimizado
- **Tree Shaking**: Remoção automática de código não utilizado
- **Lazy Loading**: Carregamento sob demanda de componentes
- **HMR**: Hot Module Replacement em desenvolvimento
- **CSS Otimizado**: Tailwind CSS gera apenas CSS utilizado

### Métricas
- Build time: < 1s em desenvolvimento
- Bundle size: ~150KB (gzipped)
- FCP (First Contentful Paint): < 1s
- LCP (Largest Contentful Paint): < 2s

## 🔒 Segurança

### Práticas Implementadas
- ✅ Autenticação baseada em tokens
- ✅ Validação de entrada de dados
- ✅ TypeScript para verificação de tipos em tempo de compilação
- ✅ CORS configurado no backend
- ✅ Tokens armazenados de forma segura

### Recomendações
- Use HTTPS em produção
- Implemente rate limiting no backend
- Configure CORS apropriadamente
- Use refresh tokens com expiração
- Valide e sanitize dados no backend

## 🧪 Testes

### Setup para Testes (Recomendado)
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Executar Testes
```bash
npm run test
```

### Cobertura de Testes
```bash
npm run test:coverage
```

## 📚 Documentação Adicional

- [Documentação do React](https://react.dev)
- [Guia do Vite](https://vitejs.dev/)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use TypeScript com tipos explícitos
- Siga as regras do ESLint
- Mantenha componentes pequenos e focados
- Documente código complexo
- Use nomes descritivos para variáveis e funções

## 📋 Roadmap

### v1.1.0 (Próximo)
- [ ] Exportação de dados em PDF/Excel
- [ ] Gráficos de evolução temporal
- [ ] Categorias customizáveis
- [ ] Notificações de limites atingidos

### v1.2.0
- [ ] Suporte a múltiplas moedas
- [ ] Integração com bancos (Open Banking)
- [ ] Previsão de fluxo de caixa
- [ ] Análise preditiva com IA

### v2.0.0
- [ ] Versão mobile nativa (React Native)
- [ ] Sincronização em tempo real
- [ ] Compartilhamento de orçamentos
- [ ] Suporte offline

## 🐛 Relatando Bugs

Para reportar bugs, por favor:

1. Verifique se o bug já foi relatado
2. Descreva o comportamento esperado vs. atual
3. Forneça passos para reproduzir
4. Inclua screenshots se relevante
5. Mencione sua versão do Node.js e navegador

## 💡 Sugestões de Melhorias

Veja o arquivo [IMPROVEMENTS.md](./IMPROVEMENTS.md) para sugestões técnicas de melhorias na arquitetura, performance e funcionalidades do projeto.

## 📝 Changelog

### v0.0.1 (2024)
- Versão inicial com funcionalidades básicas de controle financeiro