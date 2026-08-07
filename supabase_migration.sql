-- =============================================================================
-- Baby Games — Migration Completa
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABELA: products
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  theme TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  image_url TEXT,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_write_admin" ON products;

-- Qualquer pessoa pode VER os produtos
CREATE POLICY "products_select_public" ON products
  FOR SELECT USING (true);

-- Apenas admin autenticado pode criar/editar/deletar
CREATE POLICY "products_write_admin" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- TABELA: orders
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  total_value NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'Pendente',
  timestamp TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_insert_public" ON orders;
DROP POLICY IF EXISTS "orders_admin_all" ON orders;

-- Qualquer pessoa (anon) pode CRIAR pedidos (quando clica em "Continuar no WhatsApp")
CREATE POLICY "orders_insert_public" ON orders
  FOR INSERT WITH CHECK (true);

-- Admin autenticado pode VER e ATUALIZAR todos os pedidos
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- TABELA: order_items
-- =============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_insert_public" ON order_items;
DROP POLICY IF EXISTS "order_items_admin_all" ON order_items;

-- Anon pode inserir itens junto com o pedido
CREATE POLICY "order_items_insert_public" ON order_items
  FOR INSERT WITH CHECK (true);

-- Admin pode ver e manipular
CREATE POLICY "order_items_admin_all" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- TABELA: auctions
-- =============================================================================
CREATE TABLE IF NOT EXISTS auctions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  current_bid NUMERIC(10,2) DEFAULT 0,
  min_increment NUMERIC(10,2) DEFAULT 10,
  ends_at TEXT,
  status TEXT DEFAULT 'upcoming',
  bids_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir que a coluna id aceita texto/IDs personalizados
ALTER TABLE auctions ALTER COLUMN id TYPE TEXT;

ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auctions_select_public" ON auctions;
DROP POLICY IF EXISTS "auctions_write_admin" ON auctions;

CREATE POLICY "auctions_select_public" ON auctions
  FOR SELECT USING (true);

CREATE POLICY "auctions_write_admin" ON auctions
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- SEED: Produtos iniciais (só insere se a tabela estiver vazia)
-- =============================================================================
INSERT INTO products (name, category, theme, price, original_price, image_url, description, is_available, is_featured, stock)
SELECT * FROM (VALUES
  ('Funko Pop! Iron Man - Avengers EndGame (Glow in the Dark)', 'Funko Pop', 'Marvel', 189.90, 220.00, '/images/iron_man.png', 'Edição especial exclusiva Glow in the Dark do Homem de Ferro em seu momento épico com as Joias do Infinito. Um item indispensável para qualquer fã da Marvel.', true, true, 5),
  ('Action Figure Uzumaki Naruto - Modo Sábio dos Seis Caminhos', 'Action Figure', 'Naruto', 349.90, NULL, 'https://images.unsplash.com/photo-1620336655055-088d06e36bf0?auto=format&fit=crop&q=80&w=600', 'Action Figure altamente detalhada do Naruto em sua forma mais poderosa de Seis Caminhos.', true, true, 3),
  ('Action Figure Gojo Satoru - Unlimited Void Especial', 'Action Figure', 'Jujutsu Kaisen', 399.90, 450.00, 'https://images.unsplash.com/photo-1608889174636-4074f7626960?auto=format&fit=crop&q=80&w=600', 'Estátua premium do feiticeiro mais forte, Gojo Satoru, executando sua Expansão de Domínio.', true, true, 2),
  ('Funko Pop! Goku Super Saiyajin Deus (Blue Aura)', 'Funko Pop', 'Dragon Ball', 159.90, NULL, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600', 'Goku em sua forma Super Saiyajin Deus com aura translúcida azul metálica.', true, false, 8),
  ('Funko Pop! Mickey Mouse - Fantasia Edição 80 Anos', 'Funko Pop', 'Disney', 179.90, 199.90, 'https://images.unsplash.com/photo-1592188657297-c6473609e988?auto=format&fit=crop&q=80&w=600', 'Edição comemorativa histórica do Mickey Mouse Feiticeiro no clássico filme Fantasia.', true, false, 12),
  ('Estátua Batman Noir - The Dark Knight Deluxe', 'Estátua', 'DC Comics', 799.90, NULL, 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=600', 'Estátua de colecionador com escala 1:10 em resina maciça. Pintura em tons de cinza.', true, true, 1),
  ('Funko Pop! Kakashi Hatake com Susanoo (Exclusivo)', 'Funko Pop', 'Naruto', 199.90, 240.00, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&q=80&w=600', 'O ninja copiador Kakashi invocando seu Susanoo perfeito.', false, false, 0),
  ('Luminária de Neon LED Gamepad Control', 'Acessórios', 'Outros', 129.90, NULL, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600', 'Luminária de acrílico com iluminação neon em LED azul e rosa.', true, false, 15)
) AS v(name, category, theme, price, original_price, image_url, description, is_available, is_featured, stock)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- =============================================================================
-- SEED: Leilões iniciais (só insere se a tabela estiver vazia)
-- =============================================================================
INSERT INTO auctions (id, title, description, image_url, current_bid, min_increment, ends_at, status, bids_count)
SELECT * FROM (VALUES
  ('auc-1', 'Estátua Vegeta Super Saiyajin Blue - Escala 1/8 RARA', 'Peça sensacional de colecionador, com pintura cromada e LEDs internos na base.', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600', 520.00, 20.00, 'Hoje às 22:00', 'active', 14),
  ('auc-2', 'Lote Premium: 3 Funkos Pops Originais Marvel Zombies', 'Lote contendo Zombie Captain America, Zombie Iron Man e Zombie Deadpool.', '/images/marvel_zombies.png', 280.00, 15.00, 'Amanhã às 20:00', 'active', 9),
  ('auc-3', 'Funko Pop! Luffy Gear 5 - Edição Limitada Chrome', 'Leilão já encerrado com enorme engajamento de nossa comunidade.', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600', 420.00, 10.00, 'Encerrado ontem', 'ended', 23)
) AS v(id, title, description, image_url, current_bid, min_increment, ends_at, status, bids_count)
WHERE NOT EXISTS (SELECT 1 FROM auctions LIMIT 1);

-- =============================================================================
-- CRIAR USUÁRIO ADMIN (via Supabase Dashboard > Authentication > Users)
-- Depois de rodar este SQL, vá em:
--   Authentication > Users > Add User
--   Email: admin@babygames.com.br
--   Password: BabyGames@2026 (trocar depois!)
-- =============================================================================
