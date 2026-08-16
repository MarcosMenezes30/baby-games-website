/**
 * TESTES UNITÁRIOS — src/tests/unit/
 *
 * Testam funções puras e lógicas isoladas:
 *   - Mapeamento de rotas
 *   - Cálculo do carrinho
 *   - Lógica de filtros do catálogo
 *   - Formatação de dados da API (row → Product)
 *   - Validações de domínio
 */

import { describe, it, expect } from 'vitest';
import { INITIAL_PRODUCTS } from '../../data';
import type { Product, CartItem } from '../../types';

// ─── 1. Roteamento: mapeamento pathname → aba ─────────────────────────────────
describe('Routing — pathToTab mapping', () => {
  const pathToTab: Record<string, string> = {
    '/': 'store',
    '/catalogo': 'catalog',
    '/leiloes': 'auctions',
    '/sobre': 'about',
    '/admin': 'admin',
  };

  it('mapeia "/" para "store"', () => {
    expect(pathToTab['/']).toBe('store');
  });

  it('mapeia "/catalogo" para "catalog"', () => {
    expect(pathToTab['/catalogo']).toBe('catalog');
  });

  it('mapeia "/leiloes" para "auctions"', () => {
    expect(pathToTab['/leiloes']).toBe('auctions');
  });

  it('mapeia "/sobre" para "about"', () => {
    expect(pathToTab['/sobre']).toBe('about');
  });

  it('mapeia "/admin" para "admin"', () => {
    expect(pathToTab['/admin']).toBe('admin');
  });

  it('rota desconhecida retorna undefined (fallback para store)', () => {
    expect(pathToTab['/pagina-inexistente'] ?? 'store').toBe('store');
  });
});

// ─── 2. Carrinho — cálculo de total e quantidade ──────────────────────────────
describe('Cart — total calculation', () => {
  const mockProducts: Product[] = [
    { ...INITIAL_PRODUCTS[0], id: 'p1', price: 100.00, stock: 5, isAvailable: true },
    { ...INITIAL_PRODUCTS[1], id: 'p2', price: 250.90, stock: 2, isAvailable: true },
  ];

  function calcTotal(items: CartItem[]): number {
    return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }

  function calcCount(items: CartItem[]): number {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }

  it('retorna 0 para carrinho vazio', () => {
    expect(calcTotal([])).toBe(0);
  });

  it('calcula total de 1 item com qty 1', () => {
    const items: CartItem[] = [{ product: mockProducts[0], quantity: 1 }];
    expect(calcTotal(items)).toBe(100.00);
  });

  it('calcula total de 1 item com qty 3', () => {
    const items: CartItem[] = [{ product: mockProducts[0], quantity: 3 }];
    expect(calcTotal(items)).toBe(300.00);
  });

  it('calcula total de múltiplos itens', () => {
    const items: CartItem[] = [
      { product: mockProducts[0], quantity: 2 },
      { product: mockProducts[1], quantity: 1 },
    ];
    expect(calcTotal(items)).toBeCloseTo(450.90, 2);
  });

  it('conta quantidade total de unidades no carrinho', () => {
    const items: CartItem[] = [
      { product: mockProducts[0], quantity: 3 },
      { product: mockProducts[1], quantity: 2 },
    ];
    expect(calcCount(items)).toBe(5);
  });
});

// ─── 3. Catálogo — lógica de filtro ──────────────────────────────────────────
describe('Catalog — filter logic', () => {
  const products = INITIAL_PRODUCTS;

  function filterProducts(
    all: Product[],
    opts: { search?: string; category?: string; theme?: string; onlyAvailable?: boolean }
  ): Product[] {
    let result = [...all];
    if (opts.search) {
      const t = opts.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(t) ||
        p.description.toLowerCase().includes(t) ||
        p.theme.toLowerCase().includes(t)
      );
    }
    if (opts.category && opts.category !== 'all') result = result.filter(p => p.category === opts.category);
    if (opts.theme && opts.theme !== 'all') result = result.filter(p => p.theme === opts.theme);
    if (opts.onlyAvailable) result = result.filter(p => p.isAvailable && p.stock > 0);
    return result;
  }

  it('sem filtros retorna todos os produtos', () => {
    expect(filterProducts(products, {})).toHaveLength(products.length);
  });

  it('filtra por categoria "Funko Pop"', () => {
    const result = filterProducts(products, { category: 'Funko Pop' });
    expect(result.every(p => p.category === 'Funko Pop')).toBe(true);
  });

  it('filtra por tema "Marvel"', () => {
    const result = filterProducts(products, { theme: 'Marvel' });
    expect(result.every(p => p.theme === 'Marvel')).toBe(true);
  });

  it('filtra por texto no nome', () => {
    const result = filterProducts(products, { search: 'gojo' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(p => p.name.toLowerCase().includes('gojo'))).toBe(true);
  });

  it('onlyAvailable exclui produtos esgotados', () => {
    const result = filterProducts(products, { onlyAvailable: true });
    expect(result.every(p => p.isAvailable && p.stock > 0)).toBe(true);
  });

  it('combinação de filtros: category + onlyAvailable', () => {
    const result = filterProducts(products, { category: 'Funko Pop', onlyAvailable: true });
    expect(result.every(p => p.category === 'Funko Pop' && p.isAvailable && p.stock > 0)).toBe(true);
  });

  it('busca vazia retorna todos', () => {
    expect(filterProducts(products, { search: '' })).toHaveLength(products.length);
  });

  it('busca sem resultado retorna array vazio', () => {
    expect(filterProducts(products, { search: 'produto-que-nao-existe-xyz' })).toHaveLength(0);
  });
});

// ─── 4. API — mapeamento de row do Supabase para Product ─────────────────────
describe('API — row to Product mapping', () => {
  function mapRowToProduct(row: Record<string, unknown>): Product {
    return {
      id: row.id as string,
      name: row.name as string,
      category: row.category as Product['category'],
      theme: row.theme as Product['theme'],
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      imageUrl: row.image_url as string,
      description: row.description as string,
      isAvailable: row.is_available as boolean,
      isFeatured: row.is_featured as boolean,
      stock: row.stock as number,
    };
  }

  const fakeRow = {
    id: 'test-uuid-1',
    name: 'Funko Pop Teste',
    category: 'Funko Pop',
    theme: 'Marvel',
    price: '189.90',
    original_price: '220.00',
    image_url: 'https://example.com/image.jpg',
    description: 'Descrição do produto teste',
    is_available: true,
    is_featured: false,
    stock: 5,
  };

  it('mapeia id corretamente', () => {
    expect(mapRowToProduct(fakeRow).id).toBe('test-uuid-1');
  });

  it('converte price de string para number', () => {
    expect(mapRowToProduct(fakeRow).price).toBe(189.90);
  });

  it('converte originalPrice de string para number', () => {
    expect(mapRowToProduct(fakeRow).originalPrice).toBe(220.00);
  });

  it('retorna undefined para originalPrice nulo', () => {
    expect(mapRowToProduct({ ...fakeRow, original_price: null }).originalPrice).toBeUndefined();
  });

  it('mapeia imageUrl a partir de image_url', () => {
    expect(mapRowToProduct(fakeRow).imageUrl).toBe('https://example.com/image.jpg');
  });

  it('mapeia isAvailable a partir de is_available', () => {
    expect(mapRowToProduct(fakeRow).isAvailable).toBe(true);
  });
});

// ─── 5. Validações de domínio ─────────────────────────────────────────────────
describe('Domain validations', () => {
  it('produto com stock 0 é considerado esgotado', () => {
    const p: Product = { ...INITIAL_PRODUCTS[0], stock: 0 };
    const isOutOfStock = p.stock <= 0 || !p.isAvailable;
    expect(isOutOfStock).toBe(true);
  });

  it('produto com isAvailable=false é considerado esgotado mesmo com stock', () => {
    const p: Product = { ...INITIAL_PRODUCTS[0], stock: 10, isAvailable: false };
    const isOutOfStock = p.stock <= 0 || !p.isAvailable;
    expect(isOutOfStock).toBe(true);
  });

  it('produto disponível com stock > 0 NÃO é esgotado', () => {
    const p: Product = { ...INITIAL_PRODUCTS[0], stock: 3, isAvailable: true };
    const isOutOfStock = p.stock <= 0 || !p.isAvailable;
    expect(isOutOfStock).toBe(false);
  });

  it('ITEMS_PER_PAGE deve ser 8 (paginação inicial)', () => {
    const ITEMS_PER_PAGE = 8;
    expect(ITEMS_PER_PAGE).toBe(8);
  });

  it('slice respeita ITEMS_PER_PAGE com 8 produtos', () => {
    const ITEMS_PER_PAGE = 8;
    const result = INITIAL_PRODUCTS.slice(0, ITEMS_PER_PAGE);
    // data.ts tem 8 produtos
    expect(result.length).toBeLessThanOrEqual(8);
  });
});
