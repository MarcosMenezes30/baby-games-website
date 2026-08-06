import { useState, useMemo, FormEvent } from 'react';
import {
  TrendingUp, ShoppingBag, Flame, PlusCircle, Trash2, Edit, Save,
  X, Check, DollarSign, Package, Clock, AlertTriangle,
  LayoutGrid, List, FileText, Search, Gavel, RefreshCw,
  ArrowUpRight, ArrowDownRight, Star, ToggleLeft, ToggleRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Auction, OrderLog } from '../types';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  products: Product[];
  setProducts: (updater: Product[] | ((prev: Product[]) => Product[])) => void;
  auctions: Auction[];
  setAuctions: (updater: Auction[] | ((prev: Auction[]) => Auction[])) => void;
  orderLogs: OrderLog[];
  setOrderLogs: (updater: OrderLog[] | ((prev: OrderLog[]) => OrderLog[])) => void;
  onRefresh: () => Promise<void>;
}

type AdminTab = 'overview' | 'products' | 'auctions' | 'orders';
type FeedbackType = 'success' | 'error';

export default function AdminDashboard({
  products,
  setProducts,
  auctions,
  setAuctions,
  orderLogs,
  setOrderLogs,
  onRefresh,
}: AdminDashboardProps) {
  const { user } = useAuth();

  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [feedback, setFeedback] = useState<{ msg: string; type: FeedbackType } | null>(null);

  // Products
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProd, setEditProd] = useState<Partial<Product>>({});
  const [productView, setProductView] = useState<'list' | 'gallery'>('list');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTheme, setFilterTheme] = useState('all');
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '', category: 'Funko Pop', theme: 'Marvel',
    price: 150, originalPrice: undefined,
    imageUrl: '', description: '', isAvailable: true, isFeatured: false, stock: 1,
  });

  // Auctions
  const [isAddingAuction, setIsAddingAuction] = useState(false);
  const [editingAuctionId, setEditingAuctionId] = useState<string | null>(null);
  const [editAuc, setEditAuc] = useState<Partial<Auction>>({});
  const [newAuc, setNewAuc] = useState<Partial<Auction>>({
    title: '', description: '', imageUrl: '',
    currentBid: 100, minIncrement: 10,
    endsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
    status: 'upcoming', bidsCount: 0,
  });

  // Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'Pendente' | 'Concluído' | 'Cancelado'>('all');

  // ─── Real computed stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStockValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
    const activeAuctions = auctions.filter(a => a.status === 'active').length;
    const pendingOrders = orderLogs.filter(o => o.status === 'Pendente').length;
    const concludedOrders = orderLogs.filter(o => o.status === 'Concluído');
    const totalRevenue = concludedOrders.reduce((acc, o) => acc + o.totalValue, 0);
    const totalOrders = orderLogs.length;

    const byCategory: Record<string, number> = {};
    products.forEach(p => { byCategory[p.category] = (byCategory[p.category] || 0) + 1; });

    const byTheme: Record<string, number> = {};
    products.forEach(p => { byTheme[p.theme] = (byTheme[p.theme] || 0) + 1; });

    const ordersByStatus = {
      Pendente: orderLogs.filter(o => o.status === 'Pendente').length,
      Concluído: concludedOrders.length,
      Cancelado: orderLogs.filter(o => o.status === 'Cancelado').length,
    };

    const avgOrderValue = concludedOrders.length > 0 ? totalRevenue / concludedOrders.length : 0;

    return { totalProducts, totalStockValue, activeAuctions, pendingOrders, totalRevenue, totalOrders, byCategory, byTheme, ordersByStatus, avgOrderValue };
  }, [products, auctions, orderLogs]);

  const filteredProducts = useMemo(() => products.filter(p => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (filterTheme !== 'all' && p.theme !== filterTheme) return false;
    return true;
  }), [products, filterCategory, filterTheme]);

  const filteredOrders = useMemo(() => orderLogs.filter(o => {
    const matchSearch = orderSearch === '' ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  }), [orderLogs, orderSearch, orderStatusFilter]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const showFeedback = (msg: string, type: FeedbackType = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try { await onRefresh(); showFeedback('Dados sincronizados com o Supabase!'); }
    catch { showFeedback('Erro ao sincronizar dados.', 'error'); }
    finally { setIsRefreshing(false); }
  };

  // ─── Product handlers ─────────────────────────────────────────────────────
  const handleAddProductSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price || !newProd.imageUrl) { showFeedback('Preencha nome, preço e URL da imagem.', 'error'); return; }
    const created: Product = {
      id: `bg-p-${Date.now()}`,
      name: newProd.name!, category: newProd.category as Product['category'], theme: newProd.theme as Product['theme'],
      price: Number(newProd.price), originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : undefined,
      imageUrl: newProd.imageUrl!, description: newProd.description || '',
      isAvailable: !!newProd.isAvailable, isFeatured: !!newProd.isFeatured, stock: Number(newProd.stock || 1),
    };
    setProducts(prev => [created, ...prev]);
    setIsAddingProduct(false);
    showFeedback(`"${created.name}" adicionado!`);
    setNewProd({ name: '', category: 'Funko Pop', theme: 'Marvel', price: 150, imageUrl: '', description: '', isAvailable: true, isFeatured: false, stock: 1 });
  };

  const saveProductChanges = () => {
    if (!editProd.name || !editProd.price) { showFeedback('Nome e preço obrigatórios.', 'error'); return; }
    setProducts(prev => prev.map(p => p.id === editingProductId
      ? { ...p, ...editProd, price: Number(editProd.price), originalPrice: editProd.originalPrice ? Number(editProd.originalPrice) : undefined, stock: Number(editProd.stock ?? 0) } as Product
      : p));
    setEditingProductId(null);
    showFeedback('Produto atualizado!');
  };

  const handleDeleteProduct = (id: string) => {
    const item = products.find(p => p.id === id);
    if (confirm(`Deletar "${item?.name}"?`)) { setProducts(prev => prev.filter(p => p.id !== id)); showFeedback('Produto removido.'); }
  };

  const toggleProductField = (id: string, field: 'isAvailable' | 'isFeatured') => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: !p[field] } : p));
  };

  // ─── Auction handlers ─────────────────────────────────────────────────────
  const handleAddAuctionSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newAuc.title || !newAuc.imageUrl) { showFeedback('Preencha título e imagem.', 'error'); return; }
    const created: Auction = {
      id: `bg-a-${Date.now()}`, title: newAuc.title!, description: newAuc.description || '',
      imageUrl: newAuc.imageUrl!, currentBid: Number(newAuc.currentBid || 0),
      minIncrement: Number(newAuc.minIncrement || 10),
      endsAt: newAuc.endsAt || new Date().toISOString(),
      status: (newAuc.status as Auction['status']) || 'upcoming', bidsCount: 0,
    };
    setAuctions(prev => [created, ...prev]);
    setIsAddingAuction(false);
    showFeedback(`Leilão "${created.title}" criado!`);
    setNewAuc({ title: '', description: '', imageUrl: '', currentBid: 100, minIncrement: 10, endsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16), status: 'upcoming', bidsCount: 0 });
  };

  const saveAuctionChanges = () => {
    if (!editAuc.title) { showFeedback('Título obrigatório.', 'error'); return; }
    setAuctions(prev => prev.map(a => a.id === editingAuctionId ? { ...a, ...editAuc } as Auction : a));
    setEditingAuctionId(null);
    showFeedback('Leilão atualizado!');
  };

  const handleDeleteAuction = (id: string) => {
    const item = auctions.find(a => a.id === id);
    if (confirm(`Remover leilão "${item?.title}"?`)) { setAuctions(prev => prev.filter(a => a.id !== id)); showFeedback('Leilão removido.'); }
  };

  const handleAuctionStatusChange = (id: string, status: Auction['status']) => {
    setAuctions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    showFeedback(`Status atualizado para "${status}".`);
  };

  // ─── Order handlers ───────────────────────────────────────────────────────
  const toggleOrderStatus = (id: string, newStatus: 'Concluído' | 'Cancelado') => {
    setOrderLogs(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    showFeedback(`Pedido ${id} → ${newStatus}.`);
  };

  // ─── Real CSV export ──────────────────────────────────────────────────────
  const exportOrdersCSV = () => {
    const rows = [
      ['ID', 'Cliente', 'Endereço', 'Telefone', 'Itens', 'Total (R$)', 'Data/Hora', 'Status'],
      ...filteredOrders.map(o => [
        o.id, o.customerName, o.address, o.phone || '',
        o.items.map(i => `${i.quantity}x ${i.productName}`).join(' | '),
        o.totalValue.toFixed(2), o.timestamp, o.status,
      ]),
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos_babygames_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showFeedback('CSV exportado com sucesso!');
  };

  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const adminEmail = user?.email ?? 'admin';
  const accessTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const TABS: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'products', label: 'Estoque', count: products.length },
    { id: 'auctions', label: 'Leilões', count: auctions.length },
    { id: 'orders', label: 'Pedidos', count: orderLogs.length },
  ];

  const statCards = [
    { label: 'Faturamento Concluído', value: fmtBRL(stats.totalRevenue), sub: `${stats.ordersByStatus.Concluído} pedidos concluídos`, icon: DollarSign, gradient: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', iconColor: 'text-emerald-400', trend: stats.ordersByStatus.Concluído > 0 ? 'up' : 'neutral' },
    { label: 'Pedidos Recebidos', value: String(stats.totalOrders), sub: `${stats.pendingOrders} pendentes`, icon: ShoppingBag, gradient: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/20', iconColor: 'text-violet-400', trend: stats.pendingOrders > 0 ? 'warn' : 'neutral' },
    { label: 'Itens no Catálogo', value: `${stats.totalProducts}`, sub: `Estoque: ${fmtBRL(stats.totalStockValue)}`, icon: Package, gradient: 'from-pink-500/20 to-pink-500/5', border: 'border-pink-500/20', iconColor: 'text-pink-400', trend: 'neutral' },
    { label: 'Leilões Ativos', value: String(stats.activeAuctions), sub: `${auctions.length} no total`, icon: Flame, gradient: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20', iconColor: 'text-amber-400', trend: stats.activeAuctions > 0 ? 'up' : 'neutral' },
  ];

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
  const cardStyle = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' };

  return (
    <section className="min-h-screen py-10 px-4 sm:px-6" style={{ background: 'rgba(5,5,16,0.4)' }}>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-widest">
                Painel Ativo · {adminEmail} · {accessTime}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Painel <span style={{ background: 'linear-gradient(90deg,#7C3AED,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Administrativo</span>
            </h2>
            <p className="text-sm text-white/40 max-w-lg">Gerencie produtos, leilões e pedidos em tempo real — sincronizado com o Supabase.</p>
          </div>
          <button onClick={handleRefresh} disabled={isRefreshing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isRefreshing ? 'Sincronizando...' : 'Atualizar Dados'}
          </button>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-3.5 rounded-xl text-sm font-medium"
              style={{ background: feedback.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)', border: `1px solid ${feedback.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.3)'}`, color: feedback.type === 'error' ? '#f87171' : '#6ee7b7' }}>
              <div className="flex items-center gap-2.5">
                {feedback.type === 'error' ? <AlertTriangle className="h-4 w-4 flex-shrink-0" /> : <Check className="h-4 w-4 flex-shrink-0" />}
                <span>{feedback.msg}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="opacity-60 hover:opacity-100 cursor-pointer transition-opacity"><X className="h-4 w-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} whileHover={{ scale: 1.02, y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`p-5 rounded-2xl border bg-gradient-to-br ${card.gradient} ${card.border} space-y-3 relative overflow-hidden cursor-default`}>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-wider leading-tight">{card.label}</span>
                  <div className={`p-1.5 rounded-lg ${card.iconColor}`} style={{ background: 'rgba(255,255,255,0.06)' }}><Icon className="h-3.5 w-3.5" /></div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white leading-none">{card.value}</div>
                <div className="flex items-center gap-1.5">
                  {card.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-400" />}
                  {card.trend === 'warn' && <ArrowDownRight className="h-3 w-3 text-amber-400" />}
                  <span className="text-[10px] font-mono text-white/30">{card.sub}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setAdminTab(tab.id)}
              className={`relative flex-1 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${adminTab === tab.id ? 'text-white' : 'text-white/35 hover:text-white/70'}`}>
              {adminTab === tab.id && (
                <motion.div layoutId="adminTabBg" className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(236,72,153,0.15))', border: '1px solid rgba(124,58,237,0.3)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
              )}
              <span className="relative z-10">
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black ${adminTab === tab.id ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40'}`}>{tab.count}</span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={adminTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

            {/* ════ OVERVIEW ════ */}
            {adminTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Orders by status */}
                  <div className="p-5 rounded-2xl space-y-4" style={cardStyle}>
                    <div className="text-[11px] font-mono font-bold text-white/40 uppercase tracking-widest">Status dos Pedidos</div>
                    {stats.totalOrders === 0 ? (
                      <p className="text-sm text-white/25 font-mono italic py-6 text-center">Nenhum pedido registrado ainda.</p>
                    ) : (
                      <div className="space-y-3">
                        {[
                          { label: 'Concluídos', count: stats.ordersByStatus.Concluído, color: '#34d399' },
                          { label: 'Pendentes', count: stats.ordersByStatus.Pendente, color: '#fbbf24' },
                          { label: 'Cancelados', count: stats.ordersByStatus.Cancelado, color: '#f87171' },
                        ].map(item => {
                          const pct = stats.totalOrders > 0 ? (item.count / stats.totalOrders) * 100 : 0;
                          return (
                            <div key={item.label}>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-white/50">{item.label}</span>
                                <span className="font-mono font-bold" style={{ color: item.color }}>{item.count} ({pct.toFixed(0)}%)</span>
                              </div>
                              <div className="h-2 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <motion.div className="h-full rounded-full" style={{ background: item.color, width: `${pct}%` }}
                                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Products by category */}
                  <div className="p-5 rounded-2xl space-y-4" style={cardStyle}>
                    <div className="text-[11px] font-mono font-bold text-white/40 uppercase tracking-widest">Catálogo por Categoria</div>
                    {products.length === 0 ? (
                      <p className="text-sm text-white/25 font-mono italic py-6 text-center">Nenhum produto cadastrado ainda.</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(stats.byCategory).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([cat, countRaw]) => {
                          const count = countRaw as number;
                          const pct = (count / stats.totalProducts) * 100;
                          return (
                            <div key={cat}>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-white/50">{cat}</span>
                                <span className="font-mono font-bold text-violet-400">{count} ({pct.toFixed(0)}%)</span>
                              </div>
                              <div className="h-2 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#7C3AED,#EC4899)', width: `${pct}%` }}
                                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Ticket Médio', value: fmtBRL(stats.avgOrderValue), color: '#a78bfa' },
                    { label: 'Valor em Estoque', value: fmtBRL(stats.totalStockValue), color: '#ec4899' },
                    { label: 'Temas Diferentes', value: `${Object.keys(stats.byTheme).length} temas`, color: '#fbbf24' },
                  ].map(item => (
                    <div key={item.label} className="p-4 rounded-xl" style={cardStyle}>
                      <div className="text-[10px] text-white/35 font-mono uppercase mb-1">{item.label}</div>
                      <div className="text-sm font-black" style={{ color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════ PRODUCTS ════ */}
            {adminTab === 'products' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-white">Estoque ({filteredProducts.length})</h3>
                    <div className="flex p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {(['list', 'gallery'] as const).map(v => (
                        <button key={v} onClick={() => setProductView(v)}
                          className={`p-1.5 rounded-md transition-all cursor-pointer ${productView === v ? 'bg-violet-600 text-white' : 'text-white/30 hover:text-white/60'}`}>
                          {v === 'list' ? <List className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                      className="text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
                      style={{ ...inputStyle, color: 'rgba(255,255,255,0.7)' }}>
                      <option value="all">Todas Categorias</option>
                      {['Funko Pop', 'Action Figure', 'Estátua', 'Acessórios', 'Outros'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={filterTheme} onChange={e => setFilterTheme(e.target.value)}
                      className="text-xs rounded-lg px-3 py-2 outline-none cursor-pointer"
                      style={{ ...inputStyle, color: 'rgba(255,255,255,0.7)' }}>
                      <option value="all">Todos os Temas</option>
                      {['Marvel', 'DC Comics', 'Naruto', 'Dragon Ball', 'Jujutsu Kaisen', 'Disney', 'Outros'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button id="admin-btn-add-product" onClick={() => setIsAddingProduct(v => !v)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                      style={{ background: isAddingProduct ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg,#7C3AED,#EC4899)', color: isAddingProduct ? '#f87171' : 'white', border: isAddingProduct ? '1px solid rgba(239,68,68,0.3)' : 'none' }}>
                      {isAddingProduct ? <><X className="h-3.5 w-3.5" /> Cancelar</> : <><PlusCircle className="h-3.5 w-3.5" /> Novo Produto</>}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isAddingProduct && (
                    <motion.form onSubmit={handleAddProductSubmit}
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="rounded-2xl p-5 space-y-4 overflow-hidden"
                      style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.25)' }}>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400">Novo Produto</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-white/40 uppercase font-mono">Nome *</label>
                          <input type="text" required value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                            placeholder="Ex: Funko Pop Luffy Gear 5" className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputStyle} />
                        </div>
                        {[
                          { label: 'Categoria', field: 'category', options: ['Funko Pop', 'Action Figure', 'Estátua', 'Acessórios', 'Outros'] },
                          { label: 'Tema', field: 'theme', options: ['Marvel', 'Naruto', 'Jujutsu Kaisen', 'Dragon Ball', 'Disney', 'DC Comics', 'Outros'] },
                        ].map(({ label, field, options }) => (
                          <div key={field}>
                            <label className="text-[10px] text-white/40 uppercase font-mono">{label} *</label>
                            <select value={(newProd as any)[field]} onChange={e => setNewProd({ ...newProd, [field]: e.target.value })}
                              className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none cursor-pointer" style={inputStyle}>
                              {options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        ))}
                        <div>
                          <label className="text-[10px] text-white/40 uppercase font-mono">Estoque *</label>
                          <input type="number" min="0" required value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputStyle} />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 uppercase font-mono">Preço (R$) *</label>
                          <input type="number" step="0.01" required value={newProd.price} onChange={e => setNewProd({ ...newProd, price: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputStyle} />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 uppercase font-mono">Preço Original (opcional)</label>
                          <input type="number" step="0.01" value={newProd.originalPrice || ''} onChange={e => setNewProd({ ...newProd, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                            className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputStyle} />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-white/40 uppercase font-mono">URL da Imagem *</label>
                          <input type="url" required value={newProd.imageUrl} onChange={e => setNewProd({ ...newProd, imageUrl: e.target.value })}
                            placeholder="https://..." className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputStyle} />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-white/40 uppercase font-mono">Descrição</label>
                          <textarea value={newProd.description} onChange={e => setNewProd({ ...newProd, description: e.target.value })}
                            rows={2} className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none resize-none" style={inputStyle} />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-5">
                        {([['isAvailable', 'Disponível'], ['isFeatured', 'Destaque']] as const).map(([field, label]) => (
                          <label key={field} className="flex items-center gap-2 cursor-pointer text-xs text-white/60 hover:text-white transition-colors">
                            <input type="checkbox" checked={!!newProd[field]} onChange={e => setNewProd({ ...newProd, [field]: e.target.checked })} className="rounded" />
                            {label}
                          </label>
                        ))}
                        <button type="submit" className="ml-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>Salvar Produto</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Product List */}
                {productView === 'list' && (
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/30"
                          style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <th className="px-4 py-3">Produto</th>
                          <th className="px-4 py-3 hidden sm:table-cell">Preço</th>
                          <th className="px-4 py-3 hidden sm:table-cell">Estoque</th>
                          <th className="px-4 py-3 hidden md:table-cell">Status</th>
                          <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length === 0 && (
                          <tr><td colSpan={5} className="py-12 text-center text-sm text-white/25 font-mono italic">Nenhum produto encontrado.</td></tr>
                        )}
                        {filteredProducts.map(p => {
                          const isEditing = editingProductId === p.id;
                          return (
                            <tr key={p.id} className="group transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <img src={p.imageUrl} alt="" className="h-9 w-9 rounded-lg object-cover flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                                  <div>
                                    {isEditing
                                      ? <input type="text" value={editProd.name || ''} onChange={e => setEditProd({ ...editProd, name: e.target.value })}
                                          className="text-sm text-white bg-transparent border-b outline-none w-full" style={{ borderColor: 'rgba(124,58,237,0.5)' }} />
                                      : <span className="text-sm font-bold text-white">{p.name}</span>}
                                    <div className="text-[10px] text-white/35 font-mono">{p.category} · <span className="text-violet-400">{p.theme}</span></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                {isEditing
                                  ? <input type="number" step="0.01" value={editProd.price || 0} onChange={e => setEditProd({ ...editProd, price: Number(e.target.value) })}
                                      className="w-20 text-sm font-mono text-white bg-transparent border-b outline-none" style={{ borderColor: 'rgba(124,58,237,0.5)' }} />
                                  : <span className="text-sm font-mono font-bold text-white">R$ {p.price.toFixed(2)}</span>}
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                {isEditing
                                  ? <input type="number" value={editProd.stock ?? 0} onChange={e => setEditProd({ ...editProd, stock: Number(e.target.value) })}
                                      className="w-14 text-sm font-mono text-white bg-transparent border-b outline-none" style={{ borderColor: 'rgba(124,58,237,0.5)' }} />
                                  : <span className={`text-sm font-mono font-bold ${p.stock <= 2 ? 'text-amber-400' : 'text-white/70'}`}>{p.stock} un</span>}
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <div className="flex flex-col gap-1">
                                  <button onClick={() => toggleProductField(p.id, 'isAvailable')}
                                    className="flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
                                    style={{ color: p.isAvailable ? '#34d399' : '#f87171' }}>
                                    {p.isAvailable ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                                    {p.isAvailable ? 'Disponível' : 'Pausado'}
                                  </button>
                                  <button onClick={() => toggleProductField(p.id, 'isFeatured')}
                                    className="flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors"
                                    style={{ color: p.isFeatured ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>
                                    <Star className={`h-3 w-3 ${p.isFeatured ? 'fill-amber-400' : ''}`} />
                                    {p.isFeatured ? 'Destaque' : 'Normal'}
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1.5">
                                  {isEditing ? (
                                    <>
                                      <button id={`save-edit-${p.id}`} onClick={saveProductChanges} className="p-1.5 rounded-lg cursor-pointer transition-colors"
                                        style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}><Save className="h-3.5 w-3.5" /></button>
                                      <button onClick={() => setEditingProductId(null)} className="p-1.5 rounded-lg cursor-pointer"
                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}><X className="h-3.5 w-3.5" /></button>
                                    </>
                                  ) : (
                                    <>
                                      <button id={`edit-product-${p.id}`} onClick={() => { setEditingProductId(p.id); setEditProd({ ...p }); }}
                                        className="p-1.5 rounded-lg cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}><Edit className="h-3.5 w-3.5" /></button>
                                      <button id={`delete-product-${p.id}`} onClick={() => handleDeleteProduct(p.id)}
                                        className="p-1.5 rounded-lg cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}><Trash2 className="h-3.5 w-3.5" /></button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Gallery */}
                {productView === 'gallery' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(p => (
                      <motion.div key={p.id} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="rounded-xl overflow-hidden group relative" style={cardStyle}>
                        <div className="aspect-square relative overflow-hidden bg-black/40">
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                          {!p.isAvailable && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md"
                                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>Pausado</span>
                            </div>
                          )}
                          {p.isFeatured && <div className="absolute top-2 right-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /></div>}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end gap-1.5 p-2">
                            <button onClick={() => { setEditingProductId(p.id); setEditProd({ ...p }); setProductView('list'); }}
                              className="p-1.5 rounded-lg cursor-pointer backdrop-blur-sm"
                              style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}><Edit className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg cursor-pointer backdrop-blur-sm"
                              style={{ background: 'rgba(239,68,68,0.6)', color: 'white' }}><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <span className="text-xs font-bold text-white line-clamp-1">{p.name}</span>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-black text-violet-400">R$ {p.price.toFixed(2)}</span>
                            <span className={`text-[10px] font-mono ${p.stock <= 2 ? 'text-amber-400' : 'text-white/35'}`}>{p.stock}un</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════ AUCTIONS ════ */}
            {adminTab === 'auctions' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Leilões ({auctions.length})</h3>
                  <button onClick={() => setIsAddingAuction(v => !v)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    style={{ background: isAddingAuction ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg,#F59E0B,#EC4899)', color: isAddingAuction ? '#f87171' : 'white', border: isAddingAuction ? '1px solid rgba(239,68,68,0.3)' : 'none' }}>
                    {isAddingAuction ? <><X className="h-3.5 w-3.5" /> Cancelar</> : <><Gavel className="h-3.5 w-3.5" /> Novo Leilão</>}
                  </button>
                </div>

                <AnimatePresence>
                  {isAddingAuction && (
                    <motion.form onSubmit={handleAddAuctionSubmit}
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="rounded-2xl p-5 space-y-4 overflow-hidden"
                      style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">Novo Leilão</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-white/40 uppercase font-mono">Título *</label>
                          <input type="text" required value={newAuc.title} onChange={e => setNewAuc({ ...newAuc, title: e.target.value })}
                            placeholder="Ex: Vegeta SSJ Blue Escala 1/8" className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputStyle} />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 uppercase font-mono">Lance Inicial (R$) *</label>
                          <input type="number" step="0.01" required value={newAuc.currentBid} onChange={e => setNewAuc({ ...newAuc, currentBid: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputStyle} />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 uppercase font-mono">Incremento Mínimo (R$)</label>
                          <input type="number" step="0.01" value={newAuc.minIncrement} onChange={e => setNewAuc({ ...newAuc, minIncrement: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputStyle} />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 uppercase font-mono">Encerramento</label>
                          <input type="datetime-local" value={newAuc.endsAt?.slice(0, 16)} onChange={e => setNewAuc({ ...newAuc, endsAt: e.target.value })}
                            className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none" style={{ ...inputStyle, colorScheme: 'dark' } as any} />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 uppercase font-mono">Status inicial</label>
                          <select value={newAuc.status} onChange={e => setNewAuc({ ...newAuc, status: e.target.value as Auction['status'] })}
                            className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none cursor-pointer" style={inputStyle}>
                            <option value="upcoming">Agendado</option>
                            <option value="active">Ativo</option>
                            <option value="ended">Encerrado</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-white/40 uppercase font-mono">URL da Imagem *</label>
                          <input type="url" required value={newAuc.imageUrl} onChange={e => setNewAuc({ ...newAuc, imageUrl: e.target.value })}
                            placeholder="https://..." className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none" style={inputStyle} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-white/40 uppercase font-mono">Descrição</label>
                          <textarea value={newAuc.description} onChange={e => setNewAuc({ ...newAuc, description: e.target.value })}
                            rows={2} className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-white outline-none resize-none" style={inputStyle} />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg,#F59E0B,#EC4899)' }}>Criar Leilão</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {auctions.length === 0 ? (
                  <div className="py-16 text-center text-white/25 font-mono italic text-sm">Nenhum leilão cadastrado ainda.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {auctions.map(auc => {
                      const isEditing = editingAuctionId === auc.id;
                      const sc = {
                        active: { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', text: '#f472b6', label: '● ATIVO' },
                        upcoming: { bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.3)', text: '#a78bfa', label: '◷ AGENDADO' },
                        ended: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.3)', label: '✓ ENCERRADO' },
                      }[auc.status];

                      return (
                        <div key={auc.id} className="rounded-2xl overflow-hidden" style={cardStyle}>
                          <div className="flex gap-3 p-4">
                            <img src={auc.imageUrl} alt={auc.title} className="h-20 w-20 rounded-xl object-cover flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                            <div className="flex-1 min-w-0 space-y-1.5">
                              {isEditing
                                ? <input type="text" value={editAuc.title || ''} onChange={e => setEditAuc({ ...editAuc, title: e.target.value })}
                                    className="text-sm font-bold text-white bg-transparent border-b w-full outline-none" style={{ borderColor: 'rgba(245,158,11,0.5)' }} />
                                : <h4 className="text-sm font-bold text-white line-clamp-2">{auc.title}</h4>}
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-black text-amber-400">R$ {auc.currentBid.toFixed(2)}</span>
                                <span className="text-[10px] text-white/30">·</span>
                                <span className="text-[10px] text-white/40 font-mono">{auc.bidsCount} lances</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>{sc.label}</span>
                                {isEditing && (
                                  <select value={editAuc.status} onChange={e => setEditAuc({ ...editAuc, status: e.target.value as Auction['status'] })}
                                    className="text-xs text-white rounded-lg px-2 py-1 outline-none cursor-pointer"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    <option value="upcoming">Agendado</option>
                                    <option value="active">Ativo</option>
                                    <option value="ended">Encerrado</option>
                                  </select>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="px-4 pb-4 flex items-center justify-between gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {!isEditing && (
                              <div className="flex items-center gap-2 flex-wrap">
                                {(['active', 'upcoming', 'ended'] as Auction['status'][]).filter(s => s !== auc.status).map(s => (
                                  <button key={s} onClick={() => handleAuctionStatusChange(auc.id, s)}
                                    className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg cursor-pointer transition-all"
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    → {s === 'active' ? 'Ativar' : s === 'ended' ? 'Encerrar' : 'Agendar'}
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 ml-auto">
                              {isEditing ? (
                                <>
                                  <button onClick={saveAuctionChanges} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                    style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                                    <Save className="h-3.5 w-3.5" /> Salvar
                                  </button>
                                  <button onClick={() => setEditingAuctionId(null)} className="p-1.5 rounded-lg cursor-pointer"
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}><X className="h-3.5 w-3.5" /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => { setEditingAuctionId(auc.id); setEditAuc({ ...auc }); }}
                                    className="p-1.5 rounded-lg cursor-pointer transition-all"
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}><Edit className="h-3.5 w-3.5" /></button>
                                  <button onClick={() => handleDeleteAuction(auc.id)}
                                    className="p-1.5 rounded-lg cursor-pointer transition-all"
                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}><Trash2 className="h-3.5 w-3.5" /></button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ════ ORDERS ════ */}
            {adminTab === 'orders' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                      placeholder="Buscar por cliente ou ID..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none" style={inputStyle} />
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value as typeof orderStatusFilter)}
                      className="text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                      style={{ ...inputStyle, color: 'rgba(255,255,255,0.7)' }}>
                      <option value="all">Todos</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                    <button onClick={exportOrdersCSV}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                      style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                      <FileText className="h-3.5 w-3.5" /> CSV
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-white/30">
                  {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="py-16 text-center text-white/25 font-mono italic text-sm">
                    {orderLogs.length === 0 ? 'Nenhum pedido recebido ainda.' : 'Nenhum pedido encontrado para este filtro.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map(order => {
                      const statusStyle = {
                        Concluído: { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)', text: '#6ee7b7' },
                        Pendente: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', text: '#fcd34d' },
                        Cancelado: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', text: '#fca5a5' },
                      }[order.status];
                      return (
                        <motion.div key={order.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl p-4 space-y-3 transition-all" style={cardStyle}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black" style={{ color: '#a78bfa' }}>{order.id}</span>
                              <span className="text-white/20">·</span>
                              <span className="text-sm font-bold text-white">{order.customerName}</span>
                              {order.phone && <span className="text-xs text-white/35 font-mono hidden sm:inline">{order.phone}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-white/30">{order.timestamp}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, color: statusStyle.text }}>{order.status}</span>
                            </div>
                          </div>
                          {order.address && <div className="text-xs text-white/30 font-mono">{order.address}</div>}
                          <div className="space-y-1 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-white/60"><span className="text-white font-bold">{it.quantity}×</span> {it.productName}</span>
                                <span className="font-mono text-white/50">R$ {(it.price * it.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <span className="text-sm font-black text-white">Total: <span className="text-violet-400">R$ {order.totalValue.toFixed(2)}</span></span>
                            {order.status === 'Pendente' && (
                              <div className="flex gap-2">
                                <button id={`approve-order-${order.id}`} onClick={() => toggleOrderStatus(order.id, 'Concluído')}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                                  style={{ background: 'rgba(52,211,153,0.15)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.25)' }}>
                                  <Check className="h-3 w-3" /> Concluir
                                </button>
                                <button id={`cancel-order-${order.id}`} onClick={() => toggleOrderStatus(order.id, 'Cancelado')}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                                  style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                                  <X className="h-3 w-3" /> Cancelar
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
