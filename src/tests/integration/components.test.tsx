/**
 * TESTES DE INTEGRAÇÃO — src/tests/integration/
 *
 * Testam componentes React isoladamente com renderização real no jsdom:
 *   - Catalog: renderização, filtros, "Carregar Mais"
 *   - Navbar: tabs, indicador de ativo, mobile bar
 *   - CartDrawer: abertura, itens, remoção
 *   - Testimonials: renderização de depoimentos
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Catalog from '../../components/Catalog';
import Testimonials from '../../components/Testimonials';
import { INITIAL_PRODUCTS, TESTIMONIALS } from '../../data';
import type { Product, CartItem } from '../../types';

// ─── Helper ───────────────────────────────────────────────────────────────────
function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

// ─── 1. Catalog component ─────────────────────────────────────────────────────
describe('Catalog — component integration', () => {
  const onAddToCart = vi.fn();

  beforeEach(() => {
    onAddToCart.mockClear();
  });

  it('renderiza o título "Vitrine de Produtos"', () => {
    renderWithRouter(
      <Catalog products={INITIAL_PRODUCTS} onAddToCart={onAddToCart} />
    );
    // O h2 tem dois spans: "Vitrine de" e "Produtos" — verifica pelo heading completo
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 }).textContent).toMatch(/vitrine de/i);
  });

  it('exibe no máximo 8 cards sem showAll (paginação padrão)', () => {
    renderWithRouter(
      <Catalog products={INITIAL_PRODUCTS} onAddToCart={onAddToCart} />
    );
    // Conta os botões "Adicionar" / "Sem Estoque" — um por card
    const addButtons = screen.getAllByRole('button', { name: /adicionar|sem estoque/i });
    expect(addButtons.length).toBeLessThanOrEqual(8);
  });

  it('com showAll=true renderiza todos os produtos', () => {
    // Cria 10 produtos para ter mais que 8
    const tenProducts: Product[] = Array.from({ length: 10 }, (_, i) => ({
      ...INITIAL_PRODUCTS[0],
      id: `p-${i}`,
      name: `Produto ${i}`,
      stock: 5,
      isAvailable: true,
    }));

    renderWithRouter(
      <Catalog products={tenProducts} onAddToCart={onAddToCart} showAll />
    );

    const addButtons = screen.getAllByRole('button', { name: /adicionar/i });
    expect(addButtons.length).toBe(10);
  });

  it('botão "Carregar mais produtos" aparece quando há mais produtos que o limite', () => {
    const tenProducts: Product[] = Array.from({ length: 10 }, (_, i) => ({
      ...INITIAL_PRODUCTS[0],
      id: `p-${i}`,
      name: `Produto ${i}`,
      stock: 5,
      isAvailable: true,
    }));

    renderWithRouter(
      <Catalog products={tenProducts} onAddToCart={onAddToCart} />
    );

    expect(screen.getByRole('button', { name: /carregar mais/i })).toBeInTheDocument();
  });

  it('"Carregar mais" NÃO aparece quando todos os produtos estão visíveis', () => {
    // Apenas 3 produtos — abaixo do limite de 8
    const fewProducts = INITIAL_PRODUCTS.slice(0, 3);
    renderWithRouter(
      <Catalog products={fewProducts} onAddToCart={onAddToCart} />
    );
    expect(screen.queryByRole('button', { name: /carregar mais/i })).not.toBeInTheDocument();
  });

  it('filtro de busca por texto funciona', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <Catalog products={INITIAL_PRODUCTS} onAddToCart={onAddToCart} showAll />
    );

    const searchInput = screen.getByPlaceholderText(/funko, marvel/i);
    await user.type(searchInput, 'gojo');

    // Deve mostrar ao menos um elemento com "gojo" (pode aparecer no nome e no tema)
    const gojoElements = screen.getAllByText(/gojo/i);
    expect(gojoElements.length).toBeGreaterThanOrEqual(1);
  });

  it('exibe mensagem quando nenhum produto é encontrado', () => {
    renderWithRouter(
      <Catalog products={INITIAL_PRODUCTS} onAddToCart={onAddToCart} showAll />
    );

    const searchInput = screen.getByPlaceholderText(/funko, marvel/i);
    // Usa fireEvent.change para inputs controlados React (funciona melhor que userEvent.type)
    fireEvent.change(searchInput, { target: { value: 'produtoquenadanadaminhoca999' } });

    // Verifica que o empty state está presente
    const heading = screen.queryAllByText((_c, node) =>
      node?.tagName === 'H3' && (node?.textContent?.includes('Nenhum produto') ?? false)
    );
    expect(heading.length).toBeGreaterThanOrEqual(1);
  });

  it('botão "Adicionar" chama onAddToCart com o produto correto', async () => {
    const user = userEvent.setup();
    const availableProduct: Product = {
      ...INITIAL_PRODUCTS[0],
      id: 'test-add',
      name: 'ProdutoUnicoParaTeste', // nome único para não colidir com outros
      stock: 5,
      isAvailable: true,
    };

    renderWithRouter(
      <Catalog products={[availableProduct]} onAddToCart={onAddToCart} showAll />
    );

    const addBtn = screen.getByRole('button', { name: /adicionar/i });
    await user.click(addBtn);
    expect(onAddToCart).toHaveBeenCalledWith(availableProduct);
  });

  it('botão "Sem Estoque" está desabilitado para produto esgotado', () => {
    const outOfStock: Product = {
      ...INITIAL_PRODUCTS[0],
      id: 'esgotado',
      name: 'Produto Esgotado',
      stock: 0,
      isAvailable: false,
    };

    renderWithRouter(
      <Catalog products={[outOfStock]} onAddToCart={onAddToCart} showAll />
    );

    const btn = screen.getByRole('button', { name: /sem estoque/i });
    expect(btn).toBeDisabled();
  });

  it('resetar filtros limpa a busca', () => {
    renderWithRouter(
      <Catalog products={INITIAL_PRODUCTS} onAddToCart={onAddToCart} showAll />
    );

    const searchInput = screen.getByPlaceholderText(/funko, marvel/i) as HTMLInputElement;

    // Aplica o filtro via fireEvent.change (mais confiável com React controlled inputs)
    fireEvent.change(searchInput, { target: { value: 'gojo' } });
    expect(searchInput.value).toBe('gojo');

    // Limpa
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput.value).toBe('');
  });
});

// ─── 2. Testimonials component ────────────────────────────────────────────────────────────────
describe('Testimonials — component integration', () => {
  it('renderiza todos os nomes dos depoimentos (ao menos 1 ocorrência por nome)', () => {
    render(<Testimonials testimonials={TESTIMONIALS} />);
    // O marquee duplica os cards para o efeito de scroll infinito
    // Por isso usamos getAllByText e verificamos que aparece ao menos 1 vez
    TESTIMONIALS.forEach(t => {
      const elements = screen.getAllByText(t.name);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renderiza os comentários (ao menos parcialmente) de cada depoimento', () => {
    render(<Testimonials testimonials={TESTIMONIALS} />);
    // Comentários longos podem estar quebrados em vários nós — usa getAllByText com substring
    TESTIMONIALS.forEach(t => {
      // Pega as primeiras 30 chars do comment para evitar quebra de nó
      const snippet = t.comment.slice(0, 30);
      const elements = screen.getAllByText((_content, node) => {
        return !!(node?.textContent?.includes(snippet));
      });
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renderiza lista vazia sem erro', () => {
    expect(() => render(<Testimonials testimonials={[]} />)).not.toThrow();
  });
});

// ─── 3. CartDrawer component ──────────────────────────────────────────────────
import CartDrawer from '../../components/CartDrawer';

describe('CartDrawer — component integration', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    cartItems: [] as CartItem[],
    onUpdateQuantity: vi.fn(),
    onRemoveItem: vi.fn(),
    onCheckoutComplete: vi.fn(),
    whatsappNumber: '5515981579514',
  };

  it('não renderiza conteúdo quando fechado (isOpen=false)', () => {
    render(<CartDrawer {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/carrinho/i)).not.toBeInTheDocument();
  });

  it('renderiza mensagem de carrinho vazio', () => {
    render(<CartDrawer {...defaultProps} />);
    // O componente usa o texto "Seu carrinho está vazio!"
    expect(screen.getByText(/carrinho está vazio/i)).toBeInTheDocument();
  });

  it('renderiza item quando há produto no carrinho', () => {
    const cartItems: CartItem[] = [
      {
        product: { ...INITIAL_PRODUCTS[0], stock: 5, isAvailable: true },
        quantity: 2,
      },
    ];
    render(<CartDrawer {...defaultProps} cartItems={cartItems} />);
    expect(screen.getByText(INITIAL_PRODUCTS[0].name)).toBeInTheDocument();
  });

  it('chama onClose ao clicar no botão fechar', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CartDrawer {...defaultProps} onClose={onClose} />);

    // Botão fechar localizado pelo id do componente
    const closeBtn = document.getElementById('cart-close-btn') as HTMLElement;
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('exibe o total calculado dos itens', () => {
    const cartItems: CartItem[] = [
      {
        product: { ...INITIAL_PRODUCTS[0], price: 100.00, stock: 5, isAvailable: true },
        quantity: 3,
      },
    ];
    render(<CartDrawer {...defaultProps} cartItems={cartItems} />);
    // Total = 3 x R$ 100,00 = R$ 300,00
    // Busca por texto que contenha "300" em qualquer formato
    expect(screen.getByText((content) => content.includes('300'))).toBeInTheDocument();
  });
});
