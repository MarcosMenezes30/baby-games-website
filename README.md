<div align="center">

<img src="./public/logo.jpeg" alt="Baby Games Logo" width="120" style="border-radius: 16px;" />

# Baby Games — Loja de Colecionáveis Geek

**E-commerce full-stack com painel administrativo completo, leilões em tempo real e checkout via WhatsApp**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

[🚀 Demo ao Vivo](#) · [📖 Documentação](#-como-rodar-localmente) · [🐛 Reportar Bug](../../issues) · [💡 Sugerir Feature](../../issues)

</div>

---

## 📸 Preview

> Design dark premium com glassmorphism, animações fluidas e layout totalmente responsivo.

| Vista Pública | Painel Administrativo |
|:---:|:---:|
| Catálogo de produtos com filtros e carrinho | CRUD completo + métricas do negócio |

---

## ✨ Sobre o Projeto

**Baby Games** é uma plataforma de e-commerce especializada em Action Figures, Funkos Pop e raridades colecionáveis geek. O projeto combina uma vitrine pública elegante com um robusto painel de gestão, demonstrando uma arquitetura full-stack moderna do início ao fim.

### Por que este projeto é interessante?

- 🎯 **Problema real resolvido**: o checkout via WhatsApp é o fluxo preferido de pequenos lojistas brasileiros — o projeto digitaliza esse processo salvando pedidos no banco automaticamente
- 🔐 **Segurança em camadas**: Row Level Security (RLS) no PostgreSQL + Supabase Auth + proteção de rotas no frontend
- ⚡ **UX premium**: glassmorphism, animações com Motion/GSAP, feedback otimista nas ações do admin
- 🧪 **Testado**: suite de testes com Vitest + Testing Library

---

## 🏗 Stack Técnica

| Camada | Tecnologia | Motivo da escolha |
|:---|:---|:---|
| **Frontend** | React 19 + TypeScript | Tipagem forte e componentes declarativos |
| **Build** | Vite 6 | HMR instantâneo e build otimizado |
| **Estilo** | Tailwind CSS v4 + CSS custom | Produtividade + controle total |
| **Animações** | Motion (Framer Motion) + GSAP | Micro-interações fluidas |
| **Banco de dados** | Supabase (PostgreSQL) | BaaS com RLS nativo e realtime |
| **Autenticação** | Supabase Auth | Auth seguro sem backend próprio |
| **Ícones** | Lucide React | Biblioteca leve e consistente |
| **Roteamento** | React Router v7 | SPA com histórico limpo |
| **Testes** | Vitest + Testing Library | Unit e integration tests |

---

## 🌟 Funcionalidades

### 🌐 Vista Pública (Clientes)

- 🛍 **Catálogo dinâmico** — produtos carregados do Supabase com fallback para dados estáticos
- 🛒 **Carrinho persistente** — estado salvo via `localStorage`, sobrevive ao reload
- 📱 **Checkout via WhatsApp** — pedido é salvo no banco no momento do clique, cliente é redirecionado com mensagem pré-formatada
- 🔨 **Leilões ao vivo** — seção dedicada com status em tempo real e contagem regressiva
- 💬 **Depoimentos de clientes** e seção institucional
- 🌙 **Dark mode** nativo com paleta cuidadosamente curada

### 🔒 Painel Administrativo (Acesso Restrito)

- 🔑 **Login seguro** via Supabase Auth com email/senha + suporte a MFA/2FA
- 📦 **Gestão de produtos**: criar, editar, deletar, ajustar estoque, disponibilidade e destaque em tempo real
- 🧾 **Gestão de pedidos**: visualizar, confirmar ou cancelar pedidos gerados pelo checkout
- 🔨 **Acompanhamento de leilões**: gerenciar leilões ativos
- 📊 **Dashboard com métricas**: faturamento, pedidos pendentes, valor total em estoque
- ⚡ **Feedback otimista**: UI atualiza instantaneamente, rollback automático em caso de erro

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- **Node.js** 18+
- Conta gratuita no [Supabase](https://supabase.com)

### 1. Clone e instale dependências

```bash
git clone https://github.com/MarcosMenezes30/baby-games.git
cd baby-games
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL="https://SEU-PROJECT-REF.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-anon-key"
```

> 💡 Encontre em: **Supabase Dashboard → Project Settings → API**

### 3. Configure o banco de dados

No **SQL Editor** do Supabase Dashboard, execute o conteúdo de [`supabase_migration.sql`](./supabase_migration.sql).

O script cria automaticamente:
- ✅ Tabelas: `products`, `orders`, `order_items`, `auctions`
- ✅ Políticas de Row Level Security (RLS)
- ✅ Dados iniciais (8 produtos + 3 leilões de exemplo)

### 4. Crie o usuário administrador

No **Supabase Dashboard → Authentication → Users → Add User**:
- Email: `admin@seudominio.com`
- Password: uma senha forte

### 5. Rode o servidor

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura do Projeto

```
baby-games/
├── public/                     # Assets estáticos (logo, favicons, imagens)
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx  # Painel admin — CRUD + métricas
│   │   ├── AdminLogin.tsx      # Tela de login com glassmorphism
│   │   ├── Catalog.tsx         # Catálogo público com filtros
│   │   ├── CartDrawer.tsx      # Drawer lateral do carrinho
│   │   ├── Hero.tsx            # Banner principal animado
│   │   ├── AboutUs.tsx         # Sobre + seção de leilões
│   │   ├── Testimonials.tsx    # Depoimentos de clientes
│   │   └── Navbar.tsx          # Navbar responsiva com auth
│   ├── context/
│   │   └── AuthContext.tsx     # Context de autenticação global
│   ├── lib/
│   │   ├── api.ts              # Funções CRUD (Supabase)
│   │   ├── auth.ts             # Helpers de autenticação
│   │   ├── device.ts           # Detecção de dispositivo / MFA
│   │   └── supabase.ts         # Inicialização do cliente Supabase
│   ├── tests/
│   │   ├── unit/               # Testes unitários (Vitest)
│   │   ├── integration/        # Testes de integração
│   │   └── setup.ts            # Configuração global de testes
│   ├── App.tsx                 # Lógica principal + roteamento
│   ├── data.ts                 # Dados estáticos (fallback offline)
│   ├── types.ts                # Interfaces TypeScript
│   ├── index.css               # Design system e estilos globais
│   └── main.tsx                # Entry point
├── supabase_migration.sql      # Migration completa do banco
├── .env.example                # Template de variáveis de ambiente
├── vercel.json                 # Configuração de deploy (SPA routing)
└── vite.config.ts              # Configuração do Vite
```

---

## 🔐 Arquitetura de Segurança

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                  │
│  ┌───────────────┐     ┌─────────────────────────┐  │
│  │ Vista Pública │     │   Painel Administrativo  │  │
│  │  (sem auth)   │     │  (protegido por AuthCtx) │  │
│  └───────────────┘     └───────────┬─────────────┘  │
└──────────────────────────────────┬─┼─────────────────┘
                                   │ │
                    ┌──────────────▼─▼──────────────┐
                    │        Supabase Auth           │
                    │   (JWT + sessão persistente)   │
                    └────────────────┬───────────────┘
                                     │
                    ┌────────────────▼───────────────┐
                    │      PostgreSQL + RLS           │
                    │  SELECT público: products,      │
                    │  auctions                       │
                    │  INSERT público: orders,        │
                    │  order_items                    │
                    │  UPDATE/DELETE: apenas admin    │
                    └────────────────────────────────┘
```

### Fluxo de autenticação

```
Cliente acessa /          → Vista pública (sem auth)
Clica no 🔒 na navbar    → Tela de login admin
Login com sucesso         → AdminDashboard (sessão Supabase)
Fecha o browser           → Sessão restaurada automaticamente
Clica em "Sair"           → onAuthStateChange, volta para view pública
```

---

## 🗃 Schema do Banco de Dados

```sql
-- Produtos gerenciados pelo admin
products (
  id UUID PRIMARY KEY,
  name TEXT, category TEXT, theme TEXT,
  price NUMERIC, original_price NUMERIC,
  image_url TEXT, description TEXT,
  is_available BOOLEAN, is_featured BOOLEAN,
  stock INTEGER, created_at TIMESTAMPTZ
)

-- Pedidos criados pelos clientes (anônimos)
orders (
  id UUID PRIMARY KEY,
  customer_name TEXT, address TEXT, phone TEXT,
  total_value NUMERIC, status TEXT, timestamp TIMESTAMPTZ
)

-- Itens de cada pedido
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders,
  product_name TEXT, quantity INTEGER, price NUMERIC
)

-- Leilões gerenciados pelo admin
auctions (
  id UUID PRIMARY KEY,
  title TEXT, description TEXT, image_url TEXT,
  current_bid NUMERIC, min_increment NUMERIC,
  ends_at TIMESTAMPTZ, status TEXT, bids_count INTEGER
)
```

### Políticas RLS

| Tabela | SELECT | INSERT | UPDATE / DELETE |
|:---|:---:|:---:|:---:|
| `products` | ✅ Público | 🔒 Admin | 🔒 Admin |
| `orders` | 🔒 Admin | ✅ Público | 🔒 Admin |
| `order_items` | 🔒 Admin | ✅ Público | 🔒 Admin |
| `auctions` | ✅ Público | 🔒 Admin | 🔒 Admin |

---

## 📜 Scripts Disponíveis

```bash
npm run dev              # Servidor de desenvolvimento (localhost:3000)
npm run build            # Build de produção (pasta dist/)
npm run preview          # Preview do build de produção
npm run lint             # Verificação TypeScript (tsc --noEmit)
npm run test             # Roda todos os testes
npm run test:unit        # Apenas testes unitários
npm run test:integration # Apenas testes de integração
npm run test:coverage    # Relatório de cobertura de testes
```

---

## 🚢 Deploy

O projeto é um **SPA** e pode ser deployado em qualquer CDN/plataforma estática:

### Vercel (recomendado)

```bash
npm run build
# Faça upload da pasta dist/ ou conecte o repositório no Vercel
```

O arquivo `vercel.json` já está configurado para roteamento correto do SPA.

### Netlify

Configure o redirect no dashboard:
- **From**: `/*`
- **To**: `/index.html`
- **Status**: `200`

> ⚠️ **Importante**: configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel da sua plataforma de deploy.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes.

---

## 📝 Licença

Distribuído sob a licença MIT. Veja [LICENSE](./LICENSE) para mais informações.

---

<div align="center">

Feito com ❤️ por **Marcos Menezes**

[![GitHub](https://img.shields.io/badge/GitHub-MarcosMenezes30-181717?style=for-the-badge&logo=github)](https://github.com/MarcosMenezes30)

</div>
