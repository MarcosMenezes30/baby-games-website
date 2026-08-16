import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageCircle, MapPin, Mail, Phone, ShieldCheck,
  ArrowRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';

// Types & Data
import { Product, CartItem, Auction, OrderLog } from './types';
import { TESTIMONIALS, INITIAL_PRODUCTS, INITIAL_AUCTIONS } from './data';

// Supabase API
import { fetchProducts, fetchAuctions, fetchOrders, createOrder, updateProduct, createProduct, deleteProduct, updateOrderStatus, createAuction, updateAuction, deleteAuction } from './lib/api';

// Auth
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import AboutUs from './components/AboutUs';
import Testimonials from './components/Testimonials';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import CartDrawer from './components/CartDrawer';

export default function App() {
  const { user, loading: authLoading } = useAuth();

  // ─── State ─────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [orderLogs, setOrderLogs] = useState<OrderLog[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bg_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => {
    return localStorage.getItem('bg_whatsapp_number') || '5515981579514';
  });

  const DEFAULT_CATEGORIES = ['Funko Pop', 'Action Figure', 'Estátua', 'Acessórios', 'Outros'];
  const DEFAULT_THEMES = ['Marvel', 'DC Comics', 'Naruto', 'Dragon Ball', 'Jujutsu Kaisen', 'Disney', 'Outros'];

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('bg_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [themes, setThemes] = useState<string[]>(() => {
    const saved = localStorage.getItem('bg_themes');
    return saved ? JSON.parse(saved) : DEFAULT_THEMES;
  });

  const [loading, setLoading] = useState(true);

  // ─── Routing ────────────────────────────────────────────────────────────────
  const location = useLocation();
  const navigate = useNavigate();

  type Tab = 'store' | 'catalog' | 'auctions' | 'about' | 'admin';
  const pathToTab: Record<string, Tab> = {
    '/': 'store',
    '/catalogo': 'catalog',
    '/leiloes': 'auctions',
    '/sobre': 'about',
    '/admin': 'admin',
  };
  const tabToPath: Record<Tab, string> = {
    store: '/',
    catalog: '/catalogo',
    auctions: '/leiloes',
    about: '/sobre',
    admin: '/admin',
  };
  const activeTab: Tab = pathToTab[location.pathname] ?? 'store';

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart, whatsapp number, categories and themes in localStorage
  useEffect(() => {
    localStorage.setItem('bg_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('bg_whatsapp_number', whatsappNumber);
  }, [whatsappNumber]);

  useEffect(() => {
    localStorage.setItem('bg_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('bg_themes', JSON.stringify(themes));
  }, [themes]);

  useEffect(() => {
    localStorage.setItem('bg_auctions', JSON.stringify(auctions));
  }, [auctions]);

  const getDeletedAuctionIds = (): string[] => {
    try {
      const saved = localStorage.getItem('bg_deleted_auction_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const markAuctionAsDeleted = (id: string) => {
    try {
      const current = getDeletedAuctionIds();
      if (!current.includes(id)) {
        localStorage.setItem('bg_deleted_auction_ids', JSON.stringify([...current, id]));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleAddCategory = (cat: string) => {
    if (!categories.includes(cat)) {
      setCategories(prev => [...prev, cat]);
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(prev => prev.filter(c => c !== cat));
  };

  const handleAddTheme = (th: string) => {
    if (!themes.includes(th)) {
      setThemes(prev => [...prev, th]);
    }
  };

  const handleRemoveTheme = (th: string) => {
    setThemes(prev => prev.filter(t => t !== th));
  };

  // ─── Public data load (products + auctions) — no auth required ─────────────
  const loadPublicData = useCallback(async () => {
    try {
      const [prods, aucs] = await Promise.all([
        fetchProducts(),
        fetchAuctions(),
      ]);
      setProducts(prods && prods.length > 0 ? prods : INITIAL_PRODUCTS);

      const deletedIds = getDeletedAuctionIds();
      if (Array.isArray(aucs)) {
        setAuctions(aucs.filter(a => !deletedIds.includes(a.id)));
      } else {
        setAuctions(INITIAL_AUCTIONS.filter(a => !deletedIds.includes(a.id)));
      }
    } catch {
      // Graceful fallback on network failure
      const deletedIds = getDeletedAuctionIds();
      setProducts(INITIAL_PRODUCTS);
      setAuctions(INITIAL_AUCTIONS.filter(a => !deletedIds.includes(a.id)));
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Silent refresh on navigation (imperceptible to user) ──────────────────
  const loadPublicDataSilent = useCallback(async () => {
    try {
      const [prods, aucs] = await Promise.all([
        fetchProducts(),
        fetchAuctions(),
      ]);
      if (prods && prods.length > 0) setProducts(prods);
      if (Array.isArray(aucs)) {
        const deletedIds = getDeletedAuctionIds();
        setAuctions(aucs.filter(a => !deletedIds.includes(a.id)));
      }
    } catch (err) {
      console.error('Silent refresh error:', err);
    }
  }, []);

  useEffect(() => {
    loadPublicDataSilent();
  }, [activeTab, loadPublicDataSilent]);

  // ─── Admin data load (orders) — only when authenticated ────────────────────
  const loadAdminData = useCallback(async () => {
    if (!user) return;
    try {
      const orders = await fetchOrders();
      setOrderLogs(orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  }, [user]);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user, loadAdminData]);

  // Track if the user was previously authenticated to detect logout events
  const wasAuthenticated = useRef(false);
  useEffect(() => {
    if (user) {
      wasAuthenticated.current = true;
    } else if (wasAuthenticated.current && activeTab === 'admin') {
      // User just logged out while on admin tab — redirect to store
      wasAuthenticated.current = false;
      navigate('/');
    }
  }, [user, activeTab, navigate]);

  // ─── Cart handlers ─────────────────────────────────────────────────────────

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { handleRemoveCartItem(productId); return; }
    setCartItems(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  /**
   * Called after the customer clicks "Continuar no WhatsApp".
   * Saves the order to Supabase so the admin can later confirm it.
   */
  const handleCheckoutComplete = async (customerName: string, address: string, items: CartItem[], total: number) => {
    const formattedTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newOrder: OrderLog = {
      id: `ped-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      address,
      items: items.map(it => ({ productName: it.product.name, quantity: it.quantity, price: it.product.price })),
      totalValue: total,
      timestamp: `Hoje, ${formattedTime}`,
      status: 'Pendente',
    };

    setCartItems([]);

    // Optimistic update to admin orders list if admin is logged in
    if (user) {
      setOrderLogs(prev => [newOrder, ...prev]);
    }

    // Persist to Supabase (public insert policy allows this without auth)
    try {
      await createOrder(newOrder);
    } catch (err) {
      console.error('Failed to save order to Supabase:', err);
    }
  };

  // ─── Admin product handlers (wired to Supabase) ───────────────────────────

  const handleSetProducts = async (updater: Product[] | ((prev: Product[]) => Product[])) => {
    const prev = products;
    const next = typeof updater === 'function' ? updater(prev) : updater;

    if (next.length > prev.length) {
      const newProd = next[0];
      try {
        const saved = await createProduct({
          name: newProd.name,
          category: newProd.category,
          theme: newProd.theme,
          price: newProd.price,
          originalPrice: newProd.originalPrice,
          imageUrl: newProd.imageUrl,
          description: newProd.description,
          isAvailable: newProd.isAvailable,
          isFeatured: newProd.isFeatured,
          stock: newProd.stock,
        });
        setProducts([saved, ...prev]);
      } catch (err) {
        console.error('Failed to create product:', err);
        setProducts(prev);
      }
      return;
    }

    if (next.length < prev.length) {
      const deletedProd = prev.find(p => !next.some(n => n.id === p.id));
      setProducts(next);
      if (deletedProd) {
        try {
          await deleteProduct(deletedProd.id);
        } catch (err) {
          console.error('Failed to delete product:', err);
        }
      }
      return;
    }

    setProducts(next);
    const changedProd = next.find((p, i) => JSON.stringify(p) !== JSON.stringify(prev[i]));
    if (changedProd) {
      try {
        await updateProduct(changedProd.id, changedProd);
      } catch (err) {
        console.error('Failed to update product:', err);
        setProducts(prev);
      }
    }
  };

  const handleSetOrderLogs = async (updater: OrderLog[] | ((prev: OrderLog[]) => OrderLog[])) => {
    const prev = orderLogs;
    const next = typeof updater === 'function' ? updater(prev) : updater;

    const changedOrder = next.find((o) => {
      const prevOrder = prev.find(p => p.id === o.id);
      return prevOrder && prevOrder.status !== o.status;
    });

    setOrderLogs(next);

    if (changedOrder) {
      try {
        await updateOrderStatus(changedOrder.id, changedOrder.status);
      } catch (err) {
        console.error('Failed to update order status:', err);
        setOrderLogs(prev);
      }
    }
  };

  const handleSetAuctions = async (updater: Auction[] | ((prev: Auction[]) => Auction[])) => {
    const prev = auctions;
    const next = typeof updater === 'function' ? updater(prev) : updater;

    // New auction added
    if (next.length > prev.length) {
      const newAuc = next[0];
      try {
        const saved = await createAuction({
          title: newAuc.title,
          description: newAuc.description,
          imageUrl: newAuc.imageUrl,
          currentBid: newAuc.currentBid,
          minIncrement: newAuc.minIncrement,
          endsAt: newAuc.endsAt,
          status: newAuc.status,
          bidsCount: newAuc.bidsCount,
        });
        setAuctions([saved, ...prev]);
      } catch (err) {
        console.error('Failed to create auction:', err);
        setAuctions(prev);
      }
      return;
    }

    // Auction deleted
    if (next.length < prev.length) {
      const deletedAuc = prev.find(a => !next.some(n => n.id === a.id));
      setAuctions(next);
      if (deletedAuc) {
        markAuctionAsDeleted(deletedAuc.id);
        try {
          await deleteAuction(deletedAuc.id);
        } catch (err) {
          console.error('Failed to delete auction:', err);
        }
      }
      return;
    }

    // Auction updated
    setAuctions(next);
    const changedAuc = next.find((a, i) => JSON.stringify(a) !== JSON.stringify(prev[i]));
    if (changedAuc) {
      try {
        await updateAuction(changedAuc.id, changedAuc);
      } catch (err) {
        console.error('Failed to update auction:', err);
        setAuctions(prev);
      }
    }
  };

  // ─── Refresh handler — re-fetches all data from Supabase ───────────────────
  const handleRefresh = async () => {
    await Promise.all([loadPublicData(), loadAdminData()]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navTo = (tab: Tab) => {
    navigate(tabToPath[tab]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Loading state (auth + products) ───────────────────────────────────────

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050510' }}>
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-violet-400 animate-spin mx-auto" />
          <p className="text-white/40 text-sm font-mono uppercase tracking-widest">Carregando Baby Games...</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-gray-100 flex flex-col font-sans selection:bg-violet-600 selection:text-white pb-16 md:pb-0 relative overflow-x-hidden"
      style={{ background: '#050510' }}>

      {/* Global ambient background — fixed deep layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', filter: 'blur(60px)', transform: 'translate(-50%, -30%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)', filter: 'blur(60px)', transform: 'translate(30%, 30%)' }} />
      </div>

      {/* Announcement ticker */}
      <div className="relative z-20 overflow-hidden py-2.5 px-4 text-center"
        style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.3), rgba(5,5,16,0.6) 30%, rgba(5,5,16,0.6) 70%, rgba(236,72,153,0.3))', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="marquee-track text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-widest text-white/50 gap-8"
          style={{ animationDuration: '25s' }}>
          {[...Array(6)].map((_, i) => (
            <span key={i} className="flex items-center gap-8 whitespace-nowrap pr-8">
              <span>🚀 Enviamos para todo o Brasil</span>
              <span className="text-violet-400">•</span>
              <span>Leilões ao Vivo toda Quinta às 19h</span>
              <span className="text-pink-400">•</span>
              <span>100% Produtos Originais Garantidos</span>
              <span className="text-violet-400">•</span>
            </span>
          ))}
        </div>
      </div>

      <Navbar
        activeTab={activeTab}
        setActiveTab={navTo}
        cartCount={totalCartCount}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* ── PUBLIC VIEWS ── */}

            {activeTab === 'store' && (
              <>
                <Hero
                  onExploreClick={() => {
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onAuctionClick={() => {
                    const el = document.getElementById('auctions-section-main');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                <AboutUs auctions={auctions} showAboutOnly={true} whatsappNumber={whatsappNumber} />

                <div id="auctions-section-main">
                  <AboutUs auctions={auctions} showAuctionsOnly={true} whatsappNumber={whatsappNumber} />
                </div>

                <Testimonials testimonials={TESTIMONIALS} />

                <Catalog products={products} onAddToCart={handleAddToCart} availableCategories={categories} availableThemes={themes} />
              </>
            )}

            {activeTab === 'auctions' && (
              <>
                <AboutUs auctions={auctions} showAuctionsOnly={true} whatsappNumber={whatsappNumber} />
                <Testimonials testimonials={TESTIMONIALS} />
              </>
            )}

            {activeTab === 'about' && (
              <>
                <AboutUs auctions={auctions} showAboutOnly={true} whatsappNumber={whatsappNumber} />
                <Testimonials testimonials={TESTIMONIALS} />
              </>
            )}

            {/* ── CATALOG-ONLY VIEW ── */}

            {activeTab === 'catalog' && (
              <Catalog
                products={products}
                onAddToCart={handleAddToCart}
                availableCategories={categories}
                availableThemes={themes}
                showAll
              />
            )}

            {/* ── ADMIN VIEW ── */}

            {activeTab === 'admin' && (
              user ? (
                <AdminDashboard
                  products={products}
                  setProducts={handleSetProducts}
                  auctions={auctions}
                  setAuctions={handleSetAuctions}
                  orderLogs={orderLogs}
                  setOrderLogs={handleSetOrderLogs}
                  onRefresh={handleRefresh}
                  whatsappNumber={whatsappNumber}
                  onUpdateWhatsappNumber={setWhatsappNumber}
                  categories={categories}
                  themes={themes}
                  onAddCategory={handleAddCategory}
                  onRemoveCategory={handleRemoveCategory}
                  onAddTheme={handleAddTheme}
                  onRemoveTheme={handleRemoveTheme}
                />
              ) : (
                <AdminLogin
                  onSuccess={() => navigate('/admin')}
                  onBack={() => navigate('/')}
                />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutComplete={handleCheckoutComplete}
        whatsappNumber={whatsappNumber}
      />

      {/* Premium Footer — only shown on public tabs */}
      {activeTab !== 'admin' && (
        <footer className="relative overflow-hidden z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Footer bg */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(5,5,16,0) 0%, rgba(13,13,26,0.95) 30%, #0D0D1A 100%)' }} />

          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), rgba(236,72,153,0.4), transparent)' }} />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

              {/* Brand column */}
              <div className="md:col-span-5 space-y-5">
                <div className="flex items-center gap-3">
                  <img src="/logo.jpeg" alt="Baby Games" className="h-10 w-auto object-contain hover:scale-105 transition-transform duration-300" />
                </div>

                <p className="text-xs text-white/35 font-sans leading-relaxed max-w-xs">
                  Curadoria oficial de Action Figures, Funkos e raridades colecionáveis. Unindo colecionadores de todo o Brasil através de lances disputados e compras garantidas.
                </p>

                <div className="flex items-center gap-2.5">
                  <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, '') || '5515981579514'}`} target="_blank" rel="noreferrer"
                    title="WhatsApp"
                    className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300"
                    style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', color: '#4ade80' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#16a34a'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(22,163,74,0.1)'; (e.currentTarget as HTMLElement).style.color = '#4ade80'; }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Nav links */}
              <div className="md:col-span-3 space-y-4">
                <h4 className="text-[10px] font-mono font-600 text-white/30 uppercase tracking-[0.2em]">Navegação</h4>
                <div className="space-y-2 text-sm font-display font-600">
                  {[
                    { label: 'Início', tab: 'store' as const },
                    { label: 'Catálogo', tab: 'catalog' as const },
                    { label: 'Leilões WhatsApp', tab: 'auctions' as const },
                    { label: 'Sobre Nós', tab: 'about' as const },
                  ].map(link => (
                    <button
                      key={link.tab}
                      onClick={() => navTo(link.tab)}
                      className="flex items-center gap-2 text-white/35 hover:text-white transition-colors group cursor-pointer"
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="md:col-span-4 space-y-4">
                <h4 className="text-[10px] font-mono font-600 text-white/30 uppercase tracking-[0.2em]">Atendimento</h4>
                <div className="space-y-3 text-sm text-white/35">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span>Rua Geek, 404 · Bairro Consoles, São Paulo — SP</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-pink-400 flex-shrink-0" />
                    <span>suporte@babygamesgeek.com.br</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-violet-400 flex-shrink-0" />
                    <span>Seg a Sex, 10h às 19h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="text-[11px] text-white/20 font-mono">
                © 2026 Baby Games Collectibles. Todos os direitos reservados.
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/30 font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/70" />
                Curadoria 100% Protegida & Autêntica
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
