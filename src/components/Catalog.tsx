import { useState, useMemo, useRef, useEffect, MouseEvent } from 'react';
import { Search, Check, AlertCircle, ShoppingCart, Info, Sparkles, RefreshCw, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Product } from '../types';


interface CatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  availableCategories?: string[];
  availableThemes?: string[];
  /** Quando true, exibe todos os produtos sem paginação (página dedicada de catálogo) */
  showAll?: boolean;
}

// 3D tilt hook for each card
function useTilt() {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 25 });
  const glowX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => { mouseX.set(0); mouseY.set(0); };

  return { cardRef, rotateX, rotateY, glowX, glowY, onMove, onLeave };
}

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (p: Product) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { cardRef, rotateX, rotateY, glowX, glowY, onMove, onLeave } = useTilt();
  const [isAdded, setIsAdded] = useState(false);
  const isOutOfStock = product.stock <= 0 || !product.isAvailable;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <motion.div
      layout
      ref={cardRef}
      id={`product-card-${product.id}`}
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.35 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: '900px',
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative flex flex-col h-full rounded-2xl overflow-hidden group cursor-pointer"
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
    >
      {/* Card border glow (holo effect on hover) */}
      <div className="holo-border absolute inset-0 rounded-2xl pointer-events-none z-20" />

      {/* Mouse-follow glare */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(255,255,255,0.05) 0%, transparent 60%)`,
        }}
      />

      {/* Card body */}
      <div className="relative flex flex-col h-full rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(17,17,40,0.9)',
          border: product.isFeatured
            ? '1px solid rgba(236,72,153,0.25)'
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow: product.isFeatured
            ? '0 0 20px rgba(236,72,153,0.06), 0 4px 20px rgba(0,0,0,0.5)'
            : '0 4px 20px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Featured badge */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-[9px] font-orbitron font-bold uppercase"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', boxShadow: '0 0 15px rgba(124,58,237,0.4)' }}>
            <Sparkles className="h-2.5 w-2.5" />
            Destaque
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute top-3 right-3 z-20">
          {isOutOfStock ? (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase shadow-lg"
              style={{
                background: 'rgba(18, 6, 8, 0.95)',
                border: '1px solid rgba(248, 113, 113, 0.7)',
                color: '#fca5a5',
                boxShadow: '0 4px 14px rgba(0,0,0,0.7), 0 0 10px rgba(239,68,68,0.25)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Esgotado
            </span>
          ) : product.stock <= 2 ? (
            <motion.span
              animate={{ opacity: [1, 0.75, 1], scale: [1, 1.02, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase shadow-lg"
              style={{
                background: 'rgba(26, 14, 2, 0.95)',
                border: '1px solid rgba(245, 158, 11, 0.8)',
                color: '#fde047',
                boxShadow: '0 4px 14px rgba(0,0,0,0.7), 0 0 12px rgba(245,158,11,0.35)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
              Só {product.stock} restam!
            </motion.span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase shadow-lg"
              style={{
                background: 'rgba(4, 24, 14, 0.95)',
                border: '1px solid rgba(52, 211, 153, 0.7)',
                color: '#6ee7b7',
                boxShadow: '0 4px 14px rgba(0,0,0,0.7), 0 0 10px rgba(16,185,129,0.25)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Em Estoque
            </span>
          )}
        </div>

        {/* Image */}
        <div className="relative aspect-square overflow-hidden" style={{ background: 'rgba(5,5,16,0.8)' }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isOutOfStock ? 'opacity-30 grayscale' : 'group-hover:scale-110'
            }`}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(17,17,40,1) 0%, transparent 60%)' }} />

          {/* Theme + category tags */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            <span className="section-label text-[9px] py-0.5 px-2" style={{ borderRadius: '6px' }}>
              {product.theme}
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-md font-bold"
              style={{ background: 'rgba(10,10,22,0.92)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
              {product.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <h3 className="font-display font-700 text-white text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
              {product.name}
            </h3>
            <p className="text-[12px] text-white/35 line-clamp-2 font-sans leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price + action */}
          <div className="space-y-3 pt-1">
            <div className="flex items-end justify-between">
              <div>
                {product.originalPrice && (
                  <div className="text-[11px] text-white/25 line-through font-mono">
                    R$ {product.originalPrice.toFixed(2)}
                  </div>
                )}
                <div className="price-tag text-lg font-black" style={{ color: '#F59E0B', textShadow: '0 0 15px rgba(245,158,11,0.4)' }}>
                  R$ {product.price.toFixed(2)}
                </div>
              </div>
              <div className="text-[10px] text-white/20 font-mono">#{product.id.slice(-8).toUpperCase()}</div>
            </div>

            <button
              id={`add-to-cart-${product.id}`}
              disabled={isOutOfStock}
              onClick={handleAdd}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display text-xs font-700 uppercase tracking-wider transition-all duration-300 cursor-pointer relative overflow-hidden ${
                isOutOfStock
                  ? 'opacity-30 cursor-not-allowed'
                  : isAdded
                    ? ''
                    : 'group/btn'
              }`}
              style={
                isAdded
                  ? { background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }
                  : isOutOfStock
                    ? { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }
                    : { background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)', color: '#A78BFA' }
              }
              onMouseEnter={e => {
                if (!isOutOfStock && !isAdded) {
                  (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #7C3AED, #EC4899)';
                  (e.currentTarget as HTMLElement).style.color = 'white';
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(124,58,237,0.3)';
                }
              }}
              onMouseLeave={e => {
                if (!isOutOfStock && !isAdded) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.12)';
                  (e.currentTarget as HTMLElement).style.color = '#A78BFA';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.35)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }
              }}
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Adicionado!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span>{isOutOfStock ? 'Sem Estoque' : 'Adicionar'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const ITEMS_PER_PAGE = 8;

export default function Catalog({ products, onAddToCart, availableCategories = [], availableThemes = [], showAll = false }: CatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const categories = useMemo(() => {
    const list = new Set([...availableCategories, ...products.map(p => p.category)]);
    return ['all', ...Array.from(list)];
  }, [products, availableCategories]);

  const themes = useMemo(() => {
    const list = new Set([...availableThemes, ...products.map(p => p.theme)]);
    return ['all', ...Array.from(list)];
  }, [products, availableThemes]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.theme.toLowerCase().includes(term)
      );
    }
    if (selectedCategory !== 'all') result = result.filter(p => p.category === selectedCategory);
    if (selectedTheme !== 'all') result = result.filter(p => p.theme === selectedTheme);
    if (onlyAvailable) result = result.filter(p => p.isAvailable && p.stock > 0);
    if (sortBy === 'featured') result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.id.localeCompare(a.id);
    });
    else if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, searchTerm, selectedCategory, selectedTheme, onlyAvailable, sortBy]);

  // Reset visible count whenever the filtered result set changes (filter applied or products updated)
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedCategory, selectedTheme, onlyAvailable, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTheme('all');
    setOnlyAvailable(false);
    setSortBy('featured');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedTheme !== 'all' || onlyAvailable;

  const visibleProducts = showAll ? filteredProducts : filteredProducts.slice(0, visibleCount);
  const hasMore = !showAll && visibleCount < filteredProducts.length;

  const selectClass = "w-full px-4 py-3 rounded-xl font-sans text-sm text-white/80 focus:outline-none transition-all appearance-none cursor-pointer";
  const selectStyle = {
    background: 'rgba(17,17,40,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  return (
    <section id="catalog-section" className="py-16 px-4 sm:px-6 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />

      <div className="mx-auto max-w-7xl space-y-10 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-3">
            <div className="section-label">
              <Sparkles className="h-3 w-3" />
              Pronta Entrega
            </div>
            <h2 className="text-4xl sm:text-5xl font-display font-700 tracking-tight uppercase">
              <span className="text-white">Vitrine de </span>
              <span className="text-gradient-violet">Produtos</span>
            </h2>
            <p className="text-white/40 max-w-xl text-sm font-sans">
              Monte seu pedido diretamente pela vitrine. Adicione produtos ao carrinho e feche via WhatsApp.
            </p>
          </div>


        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-2xl p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-display font-600 text-white/50 uppercase tracking-wider">Filtros</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                id="catalog-search"
                type="text"
                placeholder="Funko, Marvel, Dragon Ball..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl font-sans text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                style={{ ...selectStyle, ...(searchTerm ? { borderColor: 'rgba(139,92,246,0.5)', boxShadow: '0 0 0 3px rgba(124,58,237,0.1)' } : {}) }}
              />
            </div>

            <div className="lg:col-span-3">
              <select id="catalog-filter-category" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={selectClass} style={selectStyle}>
                <option value="all">Todas Categorias</option>
                {categories.filter(c => c !== 'all').map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="lg:col-span-3">
              <select id="catalog-filter-theme" value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)} className={selectClass} style={selectStyle}>
                <option value="all">Todos os Temas</option>
                {themes.filter(t => t !== 'all').map(theme => <option key={theme} value={theme}>{theme}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select id="catalog-sort" value={sortBy} onChange={e => setSortBy(e.target.value as any)} className={selectClass} style={selectStyle}>
                <option value="featured">Destaques</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <label className="flex items-center gap-2.5 text-sm text-white/50 cursor-pointer select-none">
              <div
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={`relative w-9 h-5 rounded-full transition-all duration-300 cursor-pointer ${onlyAvailable ? 'bg-violet-600' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${onlyAvailable ? 'left-4' : 'left-0.5'}`} />
              </div>
              Apenas disponíveis em estoque
            </label>

            <div className="flex items-center gap-4">
              <span className="text-[11px] text-white/25 font-mono">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
              </span>
              {hasActiveFilters && (
                <button id="catalog-reset-filters" onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs font-display font-600 text-pink-400 hover:text-white transition-colors cursor-pointer">
                  <RefreshCw className="h-3 w-3" />
                  Limpar
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl space-y-4" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
            <AlertCircle className="mx-auto h-12 w-12 text-pink-400/50" />
            <h3 className="text-lg font-display font-700 text-white">Nenhum produto encontrado</h3>
            <p className="text-white/35 max-w-sm mx-auto text-sm">Tente limpar os filtros para ver todos os produtos.</p>
            <button onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl font-display text-xs font-700 uppercase tracking-wider transition-all cursor-pointer"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#A78BFA' }}>
              Resetar Filtros
            </button>
          </div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              <AnimatePresence>
                {visibleProducts.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More button */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-3 pt-4"
              >
                <span className="text-[11px] font-mono text-white/25">
                  Exibindo {visibleCount} de {filteredProducts.length} produtos
                </span>
                <button
                  id="catalog-load-more"
                  onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-display text-sm font-700 uppercase tracking-wider transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(124,58,237,0.35)',
                    color: '#A78BFA',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #7C3AED, #EC4899)';
                    (e.currentTarget as HTMLElement).style.color = 'white';
                    (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(124,58,237,0.35)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.12)';
                    (e.currentTarget as HTMLElement).style.color = '#A78BFA';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.35)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                  Carregar mais produtos
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* Bottom info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <Info className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h4 className="font-display font-600 text-white text-sm">Como funciona o catálogo?</h4>
              <p className="text-xs text-white/35">Monte o carrinho e finalize via WhatsApp com suporte individual.</p>
            </div>
          </div>
          <div className="text-xs text-white/50 font-mono px-4 py-2 rounded-lg flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            📦 Embalagem blindada inclusa
          </div>
        </motion.div>
      </div>
    </section>
  );
}
