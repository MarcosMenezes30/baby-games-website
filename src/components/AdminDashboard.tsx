import { useState, useMemo, FormEvent } from 'react';
import { 
  TrendingUp, ShoppingBag, Flame, Users, PlusCircle, Trash2, Edit, Save, 
  X, Check, DollarSign, Package, Eye, Clock, ListFilter, RotateCcw, AlertTriangle,
  LayoutGrid, List, FileText, Filter, Calendar, DownloadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Auction, OrderLog, AdminStats } from '../types';

interface AdminDashboardProps {
  products: Product[];
  setProducts: (updater: Product[] | ((prev: Product[]) => Product[])) => void;
  auctions: Auction[];
  setAuctions: (updater: Auction[] | ((prev: Auction[]) => Auction[])) => void;
  orderLogs: OrderLog[];
  setOrderLogs: (updater: OrderLog[] | ((prev: OrderLog[]) => OrderLog[])) => void;
  stats: AdminStats;
}

export default function AdminDashboard({
  products,
  setProducts,
  auctions,
  setAuctions,
  orderLogs,
  setOrderLogs,
  stats,
}: AdminDashboardProps) {
  // Tabs inside admin panel: 'overview' | 'products' | 'auctions' | 'orders'
  const [adminTab, setAdminTab] = useState<'overview' | 'products' | 'auctions' | 'orders'>('overview');

  // Form states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // New Product Form fields
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '',
    category: 'Funko Pop',
    theme: 'Marvel',
    price: 150.00,
    originalPrice: undefined,
    imageUrl: 'https://images.unsplash.com/photo-1608889174636-4074f7626960?auto=format&fit=crop&q=80&w=600',
    description: '',
    isAvailable: true,
    isFeatured: false,
    stock: 5
  });

  // Edit Product local fields
  const [editProd, setEditProd] = useState<Partial<Product>>({});

  // Local feedback banners
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filters and Views
  const [productView, setProductView] = useState<'list' | 'gallery'>('list');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTheme, setFilterTheme] = useState<string>('all');

  // Report Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDate, setReportDate] = useState('7days');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (filterTheme !== 'all' && p.theme !== filterTheme) return false;
      return true;
    });
  }, [products, filterCategory, filterTheme]);

  // Calculations for Admin Stats based on current list state
  const computedStats = useMemo(() => {
    const totalCatalog = products.length;
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const activeAuctionsCount = auctions.filter(a => a.status === 'active').length;
    const pendingOrdersCount = orderLogs.filter(o => o.status === 'Pendente').length;
    const totalOrderRevenue = orderLogs
      .filter(o => o.status === 'Concluído')
      .reduce((acc, o) => acc + o.totalValue, 0);

    return {
      totalCatalog,
      totalValue,
      activeAuctionsCount,
      pendingOrdersCount,
      totalOrderRevenue
    };
  }, [products, auctions, orderLogs]);

  // Handle product addition
  const handleAddProductSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price || !newProd.imageUrl) {
      showFeedback('Por favor, preencha nome, preço e imagem.');
      return;
    }

    const created: Product = {
      id: `bg-p-${Date.now()}`,
      name: newProd.name,
      category: newProd.category as any,
      theme: newProd.theme as any,
      price: Number(newProd.price),
      originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : undefined,
      imageUrl: newProd.imageUrl,
      description: newProd.description || 'Nenhuma descrição fornecida.',
      isAvailable: !!newProd.isAvailable,
      isFeatured: !!newProd.isFeatured,
      stock: Number(newProd.stock || 0)
    };

    setProducts(prev => [created, ...prev]);
    setIsAddingProduct(false);
    showFeedback(`Sucesso: "${created.name}" adicionado ao catálogo!`);
    
    // reset form
    setNewProd({
      name: '',
      category: 'Funko Pop',
      theme: 'Marvel',
      price: 150.00,
      originalPrice: undefined,
      imageUrl: 'https://images.unsplash.com/photo-1608889174636-4074f7626960?auto=format&fit=crop&q=80&w=600',
      description: '',
      isAvailable: true,
      isFeatured: false,
      stock: 5
    });
  };

  // Start Editing Product
  const startEditing = (p: Product) => {
    setEditingProductId(p.id);
    setEditProd({ ...p });
  };

  // Save Product changes
  const saveProductChanges = () => {
    if (!editProd.name || !editProd.price) {
      showFeedback('Nome e preço são obrigatórios na edição.');
      return;
    }

    setProducts(prev => prev.map(p => {
      if (p.id === editingProductId) {
        return {
          ...p,
          ...editProd,
          price: Number(editProd.price),
          originalPrice: editProd.originalPrice ? Number(editProd.originalPrice) : undefined,
          stock: Number(editProd.stock ?? 0)
        } as Product;
      }
      return p;
    }));

    setEditingProductId(null);
    showFeedback('Produto atualizado com sucesso!');
  };

  // Delete product
  const deleteProduct = (id: string) => {
    const item = products.find(p => p.id === id);
    if (confirm(`Tem certeza de que deseja deletar "${item?.name}" do catálogo?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showFeedback('Produto removido.');
    }
  };

  // Simulate incoming WhatsApp Order
  const simulateWhatsAppOrder = () => {
    const names = ['Guilherme M.', 'Ana Clara L.', 'Vitor Hugo', 'Beatriz S.', 'Gabriel N.', 'Larissa F.'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 2) + 1;
    const value = randomProduct.price * qty;

    const newOrder: OrderLog = {
      id: `ped-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: randomName,
      address: 'Pedido via WhatsApp — endereço a confirmar',
      phone: `(${Math.floor(11 + Math.random() * 88)}) 9${Math.floor(8000 + Math.random() * 1999)}-${Math.floor(1000 + Math.random() * 8999)}`,
      items: [{ productName: randomProduct.name, quantity: qty, price: randomProduct.price }],
      totalValue: value,
      timestamp: 'Agora mesmo',
      status: 'Pendente'
    };

    setOrderLogs(prev => [newOrder, ...prev]);
    showFeedback(`🛒 Novo pedido simulado gerado para ${randomName}!`);
  };

  // Toggle order status
  const toggleOrderStatus = (id: string, newStatus: 'Concluído' | 'Cancelado') => {
    setOrderLogs(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    showFeedback(`Pedido ${id} atualizado para ${newStatus}.`);
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  return (
    <section className="py-12 px-4 sm:px-6 bg-dark-bg/20">
      <div className="mx-auto max-w-7xl space-y-10">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 rounded-full">
              Ambiente de Demonstração
            </span>
            <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">
              Painel Administrativo <span className="text-yellow-400 glow-yellow">Baby Games</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-xl">
              Simule a gestão do seu e-commerce geek. Adicione produtos rústicos, mude preços, confira o balanço financeiro e veja as métricas de leilão em tempo real.
            </p>
          </div>

          <button
            onClick={simulateWhatsAppOrder}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-dark-bg font-display text-xs font-black uppercase tracking-wider hover:from-white hover:to-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 animate-spin-slow" />
            <span>Simular Pedido Whats</span>
          </button>
        </div>

        {/* Feedback Alert banner */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-display text-sm font-bold flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center space-x-2.5">
                <Check className="h-5 w-5 bg-yellow-400 text-dark-bg rounded-full p-0.5" />
                <span>{feedback}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-yellow-400/60 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulated General Dashboard stats summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Faturamento Concluído</span>
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              R$ {(stats.totalSales + computedStats.totalOrderRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-emerald-400 font-mono">✦ Balanço financeiro simulado ativo</p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Pedidos</span>
              <ShoppingBag className="h-5 w-5 text-neon-blue" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats.totalOrders + orderLogs.length}
            </div>
            <p className="text-[10px] text-gray-400 font-mono">✦ {computedStats.pendingOrdersCount} pendentes de aprovação</p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Produtos no Catálogo</span>
              <Package className="h-5 w-5 text-neon-pink" />
            </div>
            <div className="text-2xl font-black text-white">
              {computedStats.totalCatalog} itens
            </div>
            <p className="text-[10px] text-neon-pink font-mono">✦ Valor total em estoque: R$ {computedStats.totalValue.toLocaleString('pt-BR')}</p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-card border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visualizações na Loja</span>
              <Eye className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats.viewsCount}
            </div>
            <p className="text-[10px] text-yellow-400 font-mono">✦ Taxa de conversão: 7.3%</p>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setAdminTab('overview')}
            className={`py-3 px-6 font-display text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              adminTab === 'overview' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Métricas Gerais
          </button>
          <button
            onClick={() => setAdminTab('products')}
            className={`py-3 px-6 font-display text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              adminTab === 'products' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Estoque ({products.length})
          </button>
          <button
            onClick={() => setAdminTab('auctions')}
            className={`py-3 px-6 font-display text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              adminTab === 'auctions' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Leilão Ativo ({auctions.length})
          </button>
          <button
            onClick={() => setAdminTab('orders')}
            className={`py-3 px-6 font-display text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              adminTab === 'orders' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Pedidos Whats ({orderLogs.length})
          </button>
        </div>

        {/* Tab Content Rendering */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 min-h-[350px]">
          
          {/* OVERVIEW TAB */}
          {adminTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-white text-base">Metas e Comparativos Semanais</h3>
                <span className="text-[11px] font-mono text-gray-400">Atualizado: Agora</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Simulated Chart/Visual 1 */}
                <div className="p-5 bg-dark-bg/85 rounded-xl border border-white/5 space-y-4">
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">Balanço Semanal de Arrecadações (Leilões vs. Direta)</div>
                  
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Vendas Diretas no Catálogo (60%)</span>
                        <span className="text-neon-blue font-bold">R$ 50.610,00</span>
                      </div>
                      <div className="h-3.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-blue rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Arremates de Leilão Whats (40%)</span>
                        <span className="text-neon-pink font-bold">R$ 33.740,00</span>
                      </div>
                      <div className="h-3.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-pink rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 leading-relaxed font-sans pt-2">
                    A proporção histórica mostra que a comunidade no WhatsApp serve como excelente gerador de tráfego, trazendo leads altamente qualificados que acabam fechando múltiplos itens da vitrine direta.
                  </div>
                </div>

                {/* Simulated Chart/Visual 2 */}
                <div className="p-5 bg-dark-bg/85 rounded-xl border border-white/5 space-y-4">
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">Temas Mais Vendidos (Por Faturamento)</div>
                  
                  <div className="grid grid-cols-5 gap-2 items-end h-32 pt-4">
                    <div className="text-center space-y-2">
                      <div className="text-[10px] text-neon-pink font-bold">35%</div>
                      <div className="bg-neon-pink w-full rounded-t" style={{ height: '70px' }}></div>
                      <div className="text-[9px] text-gray-400 font-mono truncate">Marvel</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-[10px] text-neon-blue font-bold">28%</div>
                      <div className="bg-neon-blue w-full rounded-t" style={{ height: '56px' }}></div>
                      <div className="text-[9px] text-gray-400 font-mono truncate">Naruto</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-[10px] text-neon-yellow font-bold">20%</div>
                      <div className="bg-neon-yellow w-full rounded-t" style={{ height: '40px' }}></div>
                      <div className="text-[9px] text-gray-400 font-mono truncate">DBZ</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-[10px] text-purple-400 font-bold">12%</div>
                      <div className="bg-purple-500 w-full rounded-t" style={{ height: '24px' }}></div>
                      <div className="text-[9px] text-gray-400 font-mono truncate">Jujutsu</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-[10px] text-emerald-400 font-bold">5%</div>
                      <div className="bg-emerald-500 w-full rounded-t" style={{ height: '10px' }}></div>
                      <div className="text-[9px] text-gray-400 font-mono truncate">Outros</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 font-mono text-center pt-2">
                    * Dados consolidados das últimas 4 semanas de pedidos validados.
                  </div>
                </div>

              </div>

              {/* Tips */}
              <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20 text-xs text-yellow-400/90 leading-relaxed flex items-start space-x-2">
                <AlertTriangle className="h-4.5 w-4.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Dica de Estratégia de Venda:</strong> Colecionáveis com temas de Dragon Ball e Naruto têm picos de engajamento às quintas-feiras à noite. Recomendamos agendar leilões relâmpago às 19:30 no WhatsApp para aumentar o lance final em até 18%.
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 mt-4">
                <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-xl font-display font-bold text-sm uppercase tracking-wide hover:bg-neon-blue/20 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Imprimir Relatório de Vendas</span>
                </button>
              </div>
            </div>
          )}

          {/* STOCK TAB (PRODUCTS MANAGEMENT) */}
          {adminTab === 'products' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-display font-bold text-white text-base">Controle de Estoque Ativo</h3>
                  <div className="flex items-center bg-dark-card border border-white/10 rounded-lg p-0.5">
                    <button 
                      onClick={() => setProductView('list')}
                      className={`p-1.5 rounded-md transition-colors ${productView === 'list' ? 'bg-neon-blue text-dark-bg' : 'text-gray-400 hover:text-white'}`}
                      title="Visualização em Lista"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setProductView('gallery')}
                      className={`p-1.5 rounded-md transition-colors ${productView === 'gallery' ? 'bg-neon-blue text-dark-bg' : 'text-gray-400 hover:text-white'}`}
                      title="Visualização em Galeria"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-dark-card border border-white/10 text-xs text-white rounded-lg px-3 py-2.5 outline-none focus:border-neon-blue"
                  >
                    <option value="all">Categorias</option>
                    <option value="Funko Pop">Funko Pop</option>
                    <option value="Action Figure">Action Figure</option>
                    <option value="Estátua">Estátua</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Outros">Outros</option>
                  </select>

                  <select 
                    value={filterTheme}
                    onChange={(e) => setFilterTheme(e.target.value)}
                    className="bg-dark-card border border-white/10 text-xs text-white rounded-lg px-3 py-2.5 outline-none focus:border-neon-blue"
                  >
                    <option value="all">Temas</option>
                    <option value="Marvel">Marvel</option>
                    <option value="DC Comics">DC Comics</option>
                    <option value="Naruto">Naruto</option>
                    <option value="Dragon Ball">Dragon Ball</option>
                    <option value="Jujutsu Kaisen">Jujutsu Kaisen</option>
                    <option value="Disney">Disney</option>
                    <option value="Outros">Outros</option>
                  </select>

                  <button
                    id="admin-btn-add-product"
                    onClick={() => setIsAddingProduct(!isAddingProduct)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-neon-blue text-dark-bg font-display text-xs font-black uppercase tracking-wider hover:bg-white transition-all cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{isAddingProduct ? 'Cancelar' : 'Novo'}</span>
                  </button>
                </div>
              </div>

              {/* Add Product Form Collapse */}
              <AnimatePresence>
                {isAddingProduct && (
                  <motion.form
                    onSubmit={handleAddProductSubmit}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 rounded-xl bg-dark-bg/85 border border-neon-blue/40 space-y-4 overflow-hidden"
                  >
                    <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider text-neon-blue">Preencher Informações do Colecionável</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400">Nome do Produto *</label>
                        <input
                          type="text"
                          required
                          value={newProd.name}
                          onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                          placeholder="Ex: Funko Pop Luffy Gear 5"
                          className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-neon-blue"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-400">Categoria *</label>
                        <select
                          value={newProd.category}
                          onChange={(e) => setNewProd({ ...newProd, category: e.target.value as any })}
                          className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-neon-blue"
                        >
                          <option value="Funko Pop">Funko Pop</option>
                          <option value="Action Figure">Action Figure</option>
                          <option value="Estátua">Estátua</option>
                          <option value="Acessórios">Acessórios</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-400">Tema/Franquia *</label>
                        <select
                          value={newProd.theme}
                          onChange={(e) => setNewProd({ ...newProd, theme: e.target.value as any })}
                          className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-neon-blue"
                        >
                          <option value="Marvel">Marvel</option>
                          <option value="Naruto">Naruto</option>
                          <option value="Jujutsu Kaisen">Jujutsu Kaisen</option>
                          <option value="Dragon Ball">Dragon Ball</option>
                          <option value="Disney">Disney</option>
                          <option value="DC Comics">DC Comics</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400">Preço de Venda (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newProd.price}
                          onChange={(e) => setNewProd({ ...newProd, price: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-neon-blue"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-400">Preço Original (R$ - Opcional)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProd.originalPrice || ''}
                          onChange={(e) => setNewProd({ ...newProd, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                          placeholder="Risco de promoção"
                          className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-neon-blue"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-400">Estoque Inicial *</label>
                        <input
                          type="number"
                          required
                          value={newProd.stock}
                          onChange={(e) => setNewProd({ ...newProd, stock: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-neon-blue"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-400">URL da Imagem *</label>
                        <input
                          type="text"
                          required
                          value={newProd.imageUrl}
                          onChange={(e) => setNewProd({ ...newProd, imageUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Descrição Detalhada do Item</label>
                      <textarea
                        value={newProd.description}
                        onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                        placeholder="Edição rara, detalhes da pintura, acessórios inclusos..."
                        rows={2}
                        className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-neon-blue"
                      />
                    </div>

                    <div className="flex space-x-6">
                      <label className="flex items-center space-x-2 cursor-pointer text-xs text-gray-300">
                        <input
                          type="checkbox"
                          checked={newProd.isAvailable}
                          onChange={(e) => setNewProd({ ...newProd, isAvailable: e.target.checked })}
                          className="rounded bg-dark-card border-white/10 text-neon-blue focus:ring-neon-blue"
                        />
                        <span>Marcar como Disponível</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer text-xs text-gray-300">
                        <input
                          type="checkbox"
                          checked={newProd.isFeatured}
                          onChange={(e) => setNewProd({ ...newProd, isFeatured: e.target.checked })}
                          className="rounded bg-dark-card border-white/10 text-neon-pink focus:ring-neon-pink"
                        />
                        <span>Destacar no Topo da Vitrine</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-neon-blue text-dark-bg font-display text-xs font-black uppercase tracking-wider rounded-lg hover:bg-white transition-all cursor-pointer"
                    >
                      Salvar Item no Catálogo
                    </button>

                  </motion.form>
                )}
              </AnimatePresence>

              {/* Scrollable Products Table list */}
              {productView === 'list' && (
              <div className="overflow-x-auto border border-white/10 rounded-xl bg-dark-bg/40">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-mono">
                      <th className="p-3">Foto</th>
                      <th className="p-3">Item / Categoria</th>
                      <th className="p-3">Preço</th>
                      <th className="p-3">Estoque</th>
                      <th className="p-3">Opções</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                    {filteredProducts.map((p) => {
                      const isEditing = editingProductId === p.id;

                      return (
                        <tr key={p.id} className="hover:bg-white/2">
                          
                          {/* Col 1: Photo */}
                          <td className="p-3">
                            <img 
                              src={p.imageUrl} 
                              alt="" 
                              className="h-10 w-10 object-cover rounded-md bg-dark-card border border-white/10"
                            />
                          </td>

                          {/* Col 2: Name & categorization */}
                          <td className="p-3 space-y-1 max-w-[220px]">
                            {isEditing ? (
                              <input 
                                type="text"
                                value={editProd.name || ''}
                                onChange={(e) => setEditProd({ ...editProd, name: e.target.value })}
                                className="w-full bg-dark-card border border-white/20 p-1 text-white rounded text-xs"
                              />
                            ) : (
                              <span className="font-bold text-white block truncate">{p.name}</span>
                            )}
                            <div className="flex space-x-2 text-[10px] text-gray-400">
                              <span>{p.category}</span>
                              <span>•</span>
                              <span className="text-neon-blue">{p.theme}</span>
                            </div>
                          </td>

                          {/* Col 3: Price */}
                          <td className="p-3">
                            {isEditing ? (
                              <input 
                                type="number"
                                step="0.01"
                                value={editProd.price || 0}
                                onChange={(e) => setEditProd({ ...editProd, price: parseFloat(e.target.value) })}
                                className="w-20 bg-dark-card border border-white/20 p-1 text-white rounded text-xs font-mono"
                              />
                            ) : (
                              <span className="font-mono font-bold text-white">R$ {p.price.toFixed(2)}</span>
                            )}
                          </td>

                          {/* Col 4: Stock */}
                          <td className="p-3">
                            {isEditing ? (
                              <input 
                                type="number"
                                value={editProd.stock ?? 0}
                                onChange={(e) => setEditProd({ ...editProd, stock: parseInt(e.target.value) })}
                                className="w-14 bg-dark-card border border-white/20 p-1 text-white rounded text-xs font-mono"
                              />
                            ) : (
                              <span className={`font-mono font-bold ${p.stock <= 2 ? 'text-yellow-400' : 'text-gray-300'}`}>
                                {p.stock} un
                              </span>
                            )}
                          </td>

                          {/* Col 5: Toggles */}
                          <td className="p-3 space-y-1">
                            <div className="flex flex-col gap-1 text-[10px]">
                              <button
                                onClick={() => {
                                  setProducts(prev => prev.map(item => item.id === p.id ? { ...item, isAvailable: !item.isAvailable } : item));
                                  showFeedback(`Status de disponibilidade de "${p.name}" alterado.`);
                                }}
                                className={`px-2 py-0.5 rounded text-center font-bold cursor-pointer max-w-[80px] ${
                                  p.isAvailable 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                              >
                                {p.isAvailable ? 'Disponível' : 'Pausado'}
                              </button>

                              <button
                                onClick={() => {
                                  setProducts(prev => prev.map(item => item.id === p.id ? { ...item, isFeatured: !item.isFeatured } : item));
                                  showFeedback(`Filtro de Destaque alterado para "${p.name}".`);
                                }}
                                className={`px-2 py-0.5 rounded text-center font-bold cursor-pointer max-w-[80px] ${
                                  p.isFeatured 
                                    ? 'bg-neon-pink/15 text-neon-pink border border-neon-pink/30' 
                                    : 'bg-white/5 text-gray-400'
                                }`}
                              >
                                {p.isFeatured ? 'Destaque ⭐' : 'Comum'}
                              </button>
                            </div>
                          </td>

                          {/* Col 6: Edit Actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {isEditing ? (
                                <>
                                  <button
                                    id={`save-edit-${p.id}`}
                                    onClick={saveProductChanges}
                                    className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                                    title="Salvar"
                                  >
                                    <Save className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingProductId(null)}
                                    className="p-1.5 rounded bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                                    title="Cancelar"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    id={`edit-product-${p.id}`}
                                    onClick={() => startEditing(p)}
                                    className="p-1.5 rounded bg-white/5 border border-white/10 text-white hover:border-yellow-400 hover:text-yellow-400 cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    id={`delete-product-${p.id}`}
                                    onClick={() => deleteProduct(p.id)}
                                    className="p-1.5 rounded bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/20 cursor-pointer"
                                    title="Deletar"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
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

              {/* Gallery View */}
              {productView === 'gallery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-dark-card border border-white/10 rounded-xl overflow-hidden group">
                      <div className="aspect-video w-full overflow-hidden bg-black/50 relative">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        {p.isFeatured && (
                          <div className="absolute top-2 right-2 bg-neon-pink text-dark-bg px-2 py-0.5 rounded text-[10px] font-bold">
                            Destaque
                          </div>
                        )}
                        {!p.isAvailable && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded font-bold text-xs uppercase tracking-wider">Pausado</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="font-display font-bold text-white text-sm line-clamp-2">{p.name}</h4>
                          <div className="flex space-x-2 text-[10px] text-gray-400 mt-1">
                            <span>{p.category}</span>
                            <span>•</span>
                            <span className="text-neon-blue">{p.theme}</span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between border-t border-white/10 pt-3">
                          <div>
                            <span className="block text-[10px] text-gray-500 font-mono">Preço</span>
                            <span className="font-mono font-bold text-neon-blue">R$ {p.price.toFixed(2)}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] text-gray-500 font-mono">Estoque</span>
                            <span className={`font-mono font-bold ${p.stock <= 2 ? 'text-yellow-400' : 'text-gray-300'}`}>{p.stock} un</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* AUCTIONS TAB */}
          {adminTab === 'auctions' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-sans text-xs leading-relaxed space-y-1">
                <p className="font-bold">📢 CONTROLE INTEGRADO DO WHATSAPP</p>
                <p>
                  O controle e a moderação de lances acontecem 100% de forma direta e segura dentro dos grupos oficiais do WhatsApp da <strong>Baby Games</strong>. 
                  Para assegurar a integridade do sistema do cliente, este painel não possui controles de lances manuais — toda a gestão de lances é feita de forma autônoma pelos moderadores no aplicativo.
                </p>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-display font-bold text-white text-base">Acompanhamento de Leilões WhatsApp</h3>
                <span className="text-xs text-gray-400 font-mono">Sincronização passiva de dados</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {auctions.map((auc) => {
                  const isEnded = auc.status === 'ended';
                  return (
                    <div key={auc.id} className="p-5 rounded-xl bg-dark-bg/85 border border-white/5 space-y-4">
                      
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-display font-bold text-white text-sm">{auc.title}</h4>
                          <span className="text-[10px] text-gray-500 font-mono">ID: {auc.id}</span>
                        </div>
                        
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isEnded 
                            ? 'bg-white/5 text-gray-500' 
                            : 'bg-neon-pink/10 text-neon-pink border border-neon-pink/20 animate-pulse'
                        }`}>
                          {isEnded ? 'CONCLUÍDO' : 'ATIVO NO WHATSAPP'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-lg bg-dark-card border border-white/5">
                        <div>
                          <span className="text-[9px] text-gray-400 block uppercase font-mono">Lance Atual</span>
                          <span className="text-sm font-black text-neon-yellow">R$ {auc.currentBid.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 block uppercase font-mono">Min Incremento</span>
                          <span className="text-xs font-bold text-neon-blue">R$ {auc.minIncrement.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 block uppercase font-mono">Lances</span>
                          <span className="text-sm font-black text-white">{auc.bidsCount}</span>
                        </div>
                      </div>

                      <div className="pt-2 text-center text-[10px] text-gray-500 font-mono">
                        {isEnded ? '✦ Peça arrematada e finalizada.' : '✦ Lance ativo sendo moderado no WhatsApp.'}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {adminTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-white text-base">Livro de Pedidos Redirecionados (WhatsApp)</h3>
                <span className="text-xs text-gray-400 font-mono">Sempre que o usuário inicia checkout, gera um log aqui</span>
              </div>

              {orderLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-mono italic">
                  Nenhum pedido recebido ainda. Vá à vitrine e adicione itens ao carrinho para simular!
                </div>
              ) : (
                <div className="space-y-4">
                  {orderLogs.map((order) => (
                    <div 
                      key={order.id} 
                      className="p-4 rounded-xl bg-dark-bg/85 border border-white/5 space-y-3 hover:border-yellow-400/30 transition-all"
                    >
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-400 font-display font-black text-sm">{order.id}</span>
                          <span className="text-gray-500">•</span>
                          <span className="font-bold text-white text-xs">{order.customerName}</span>
                          <span className="text-[10px] text-gray-400 font-mono line-clamp-1 max-w-[150px]" title={order.address}>({order.address})</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-gray-400 font-mono">{order.timestamp}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            order.status === 'Concluído' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : order.status === 'Pendente'
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="space-y-1.5 text-xs text-gray-300">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between font-sans">
                            <span>
                              <strong className="text-white">{it.quantity}x</strong> {it.productName}
                            </span>
                            <span className="font-mono text-gray-400">R$ {(it.price * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions inside order card */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <div>
                          <span className="text-gray-400">Total do Pedido: </span>
                          <strong className="text-white font-mono">R$ {order.totalValue.toFixed(2)}</strong>
                        </div>

                        {order.status === 'Pendente' && (
                          <div className="flex space-x-1.5">
                            <button
                              id={`approve-order-${order.id}`}
                              onClick={() => toggleOrderStatus(order.id, 'Concluído')}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] flex items-center space-x-1 cursor-pointer"
                            >
                              <Check className="h-3 w-3" />
                              <span>Concluir</span>
                            </button>
                            <button
                              id={`cancel-order-${order.id}`}
                              onClick={() => toggleOrderStatus(order.id, 'Cancelado')}
                              className="px-2.5 py-1 rounded bg-white/5 text-red-400 hover:bg-red-500/20 font-semibold text-[10px] flex items-center space-x-1 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                              <span>Cancelar</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-dark-bg border border-neon-blue/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-bold text-white text-xl">Relatório de Vendas</h3>
                    <p className="text-xs text-gray-400 font-mono mt-1">Exportar consolidação de pedidos</p>
                  </div>
                  <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-white p-1 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-mono">Período *</label>
                    <select
                      value={reportDate}
                      onChange={e => setReportDate(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-neon-blue"
                    >
                      <option value="today">Hoje</option>
                      <option value="7days">Últimos 7 dias</option>
                      <option value="30days">Últimos 30 dias</option>
                      <option value="all">Todo o histórico</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-mono">Formato de Exportação *</label>
                    <select
                      value={reportFormat}
                      onChange={e => setReportFormat(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-card border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-neon-blue"
                    >
                      <option value="pdf">PDF (Relatório Visual)</option>
                      <option value="csv">Excel / CSV (Dados Brutos)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsGeneratingReport(true);
                    setTimeout(() => {
                      setIsGeneratingReport(false);
                      setIsReportModalOpen(false);
                      showFeedback('Relatório gerado com sucesso (simulação).');
                    }, 2000);
                  }}
                  disabled={isGeneratingReport}
                  className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isGeneratingReport ? 'bg-white/10 text-gray-400 cursor-not-allowed' : 'bg-neon-blue text-dark-bg hover:bg-white'
                  }`}
                >
                  {isGeneratingReport ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="w-4 h-4" />
                      <span>Baixar Arquivo</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
}
