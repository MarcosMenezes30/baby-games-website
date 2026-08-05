# 🎮 Baby Games — Loja de Colecionáveis Geek

> Loja online premium de Action Figures, Funkos e raridades colecionáveis. Inclui catálogo público, leilões via WhatsApp e painel administrativo protegido.

---

## ✨ Funcionalidades

### 🌐 View Pública (Clientes)
- **Catálogo de produtos** carregado do Supabase com fallback para dados estáticos
- **Carrinho de compras** persistente via localStorage
- **Checkout via WhatsApp** — pedido é salvo no banco ao clicar em "Continuar no WhatsApp"
- **Leilões ao Vivo** exibidos com status em tempo real
- **Seção Sobre Nós** e depoimentos de clientes
- Design dark premium com glassmorphism, animações suaves e responsivo

### 🔒 View Administrativa (Acesso Restrito)
- **Login seguro** via Supabase Auth (email/senha)
- **Gestão completa de produtos**: criar, editar, deletar, ajustar estoque, disponibilidade e destaque
- **Gestão de pedidos**: visualizar todos os pedidos gerados pelo checkout, confirmar ou cancelar
- **Acompanhamento de leilões**
- **Métricas do painel**: faturamento, pedidos pendentes, valor em estoque

---

## 🏗 Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Estilo | Tailwind CSS v4 + Vanilla CSS |
| Animações | Motion (Framer Motion) |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Ícones | Lucide React |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuita)

### 1. Clone e instale dependências

```bash
git clone https://github.com/seu-usuario/baby-games.git
cd baby-games
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL="https://SEU-PROJECT-REF.supabase.co"
VITE_SUPABASE_ANON_KEY="sua-anon-key"
```

> Encontre em: **Supabase Dashboard → Project Settings → API**

### 3. Configure o banco de dados

Abra o **SQL Editor** no Supabase Dashboard e execute o conteúdo de [`supabase_migration.sql`](./supabase_migration.sql).

Este arquivo cria:
- Tabelas: `products`, `orders`, `order_items`, `auctions`
- Políticas de Row Level Security (RLS)
- Dados iniciais (8 produtos + 3 leilões)

### 4. Crie o usuário administrador

No Supabase Dashboard → **Authentication → Users → Add User**:
- Email: `admin@babygames.com.br` (ou o que preferir)
- Password: uma senha forte

### 5. Rode o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura do Projeto

```
baby-games/
├── public/               # Assets estáticos (logo, imagens)
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx   # Painel admin completo
│   │   ├── AdminLogin.tsx       # Tela de login admin
│   │   ├── Catalog.tsx          # Catálogo público
│   │   ├── CartDrawer.tsx       # Drawer do carrinho
│   │   ├── Hero.tsx             # Banner principal
│   │   ├── AboutUs.tsx          # Seção sobre + leilões
│   │   ├── Testimonials.tsx     # Depoimentos
│   │   └── Navbar.tsx           # Navbar com auth
│   ├── context/
│   │   └── AuthContext.tsx      # Contexto de autenticação
│   ├── lib/
│   │   ├── api.ts               # Funções Supabase CRUD
│   │   ├── auth.ts              # Helpers de autenticação
│   │   └── supabase.ts          # Cliente Supabase
│   ├── App.tsx                  # Lógica principal + roteamento
│   ├── data.ts                  # Dados estáticos (fallback)
│   ├── types.ts                 # TypeScript interfaces
│   ├── index.css                # Estilos globais
│   └── main.tsx                 # Entry point
├── supabase_migration.sql       # Migration completa do banco
├── .env.example                 # Template de variáveis de ambiente
└── vite.config.ts
```

---

## 🔐 Fluxo de Autenticação

```
Cliente acessa /          → View pública (sem auth)
Clica no 🔒 na navbar    → Tela de login admin
Login com sucesso         → AdminDashboard (Supabase session)
Fecha o browser           → Sessão restaurada automaticamente
Clica em "Sair"           → Volta para view pública
```

---

## 🗃 Schema do Banco de Dados

```sql
products        -- Produtos gerenciados pelo admin
  id, name, category, theme, price, original_price,
  image_url, description, is_available, is_featured, stock

orders          -- Pedidos criados pelos clientes (anon)
  id, customer_name, address, phone, total_value, status, timestamp

order_items     -- Itens de cada pedido
  id, order_id, product_name, quantity, price

auctions        -- Leilões gerenciados pelo admin
  id, title, description, image_url, current_bid,
  min_increment, ends_at, status, bids_count
```

### Políticas RLS

| Tabela | SELECT | INSERT | UPDATE/DELETE |
|---|---|---|---|
| `products` | ✅ Público | 🔒 Admin | 🔒 Admin |
| `orders` | 🔒 Admin | ✅ Público (clientes) | 🔒 Admin |
| `order_items` | 🔒 Admin | ✅ Público (clientes) | 🔒 Admin |
| `auctions` | ✅ Público | 🔒 Admin | 🔒 Admin |

---

## 📜 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (porta 3000)
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Verificação TypeScript
```

---

## 🤝 Deploy

O projeto é um SPA (Single Page Application) e pode ser deployado em:
- [Vercel](https://vercel.com) — `npm run build` → pasta `dist/`
- [Netlify](https://netlify.com) — configurar redirect para `index.html`
- Qualquer CDN estático

Configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel da plataforma de deploy.

---

## 📝 Licença

MIT © Baby Games Collectibles 2026
