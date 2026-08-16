import { useState } from 'react';
import { ShoppingCart, Flame, HelpCircle, Lock, LogOut, ShieldCheck, Home, LayoutGrid } from 'lucide-react';
import { motion, useScroll, useSpring, useMotionValueEvent } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'store' | 'catalog' | 'auctions' | 'about' | 'admin';
  setActiveTab: (tab: 'store' | 'catalog' | 'auctions' | 'about' | 'admin') => void;
  cartCount: number;
  onCartClick: () => void;
}

interface NavItem {
  id: 'store' | 'catalog' | 'auctions' | 'about';
  label: string;
  icon: any;
  badge?: string;
}

export default function Navbar({ activeTab, setActiveTab, cartCount, onCartClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 300);
  });

  const isMinimized = isScrolled && !isHovered;

  const navItems: NavItem[] = [
    { id: 'store', label: 'Início', icon: Home },
    { id: 'catalog', label: 'Catálogo', icon: LayoutGrid },
    { id: 'auctions', label: 'Leilões', icon: Flame, badge: 'LIVE' },
    { id: 'about', label: 'Sobre', icon: HelpCircle },
  ];

  const handleAdminClick = () => {
    // If authenticated, go to admin dashboard; else go to admin login screen
    setActiveTab('admin');
  };

  const handleLogout = async () => {
    await logout();
    setActiveTab('store');
  };

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
        style={{
          scaleX,
          background: 'linear-gradient(90deg, #7C3AED, #EC4899, #F59E0B)',
          boxShadow: '0 0 10px rgba(124,58,237,0.8)',
        }}
      />

      <nav
        className="fixed top-0 z-50 w-full transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Frosted glass layer */}
        <div className="glass border-b border-white/[0.06] transition-all duration-300" style={{ background: 'rgba(5,5,16,0.85)' }}>
          <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 transition-all duration-300 ${isMinimized ? 'py-1.5' : 'py-3.5'}`}>

            {/* Logo */}
            <div
              onClick={() => setActiveTab('store')}
              className="flex cursor-pointer items-center gap-3 group"
              id="nav-logo"
            >
              <img src="/logo.jpeg" alt="Baby Games" className={`w-auto object-contain group-hover:scale-105 transition-all duration-300 ${isMinimized ? 'h-7' : 'h-10'}`} />
            </div>

            {/* Desktop nav — Public items only */}
            <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-display text-[13px] font-600 tracking-wide transition-all duration-300 cursor-pointer ${
                      isActive ? 'text-white' : 'text-white/40 hover:text-white/80'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBg"
                        className="absolute inset-0 rounded-xl border border-violet-500/25"
                        style={{ background: 'rgba(124,58,237,0.15)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <Icon className={`h-3.5 w-3.5 relative z-10 ${isActive ? 'text-violet-400' : ''}`} />
                    <span className="relative z-10">{item.label}</span>
                    {item.badge && (
                      <span className="relative z-10 px-1.5 py-0.5 text-[9px] font-orbitron font-bold rounded-md bg-red-500 text-white" style={{ letterSpacing: '0.05em' }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Admin tab — only visible when authenticated */}
              {user && (
                <button
                  id="nav-link-admin"
                  onClick={handleAdminClick}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-display text-[13px] font-600 tracking-wide transition-all duration-300 cursor-pointer ${
                    activeTab === 'admin'
                      ? 'text-amber-300'
                      : 'text-amber-400/60 hover:text-amber-300'
                  }`}
                >
                  {activeTab === 'admin' && (
                    <motion.div
                      layoutId="activeNavBg"
                      className="absolute inset-0 rounded-xl bg-amber-500/10 border border-amber-500/25"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <ShieldCheck className="h-3.5 w-3.5 relative z-10" />
                  <span className="relative z-10">Admin</span>
                </button>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2.5">
              {/* Cart button */}
              <button
                id="nav-cart-btn"
                onClick={onCartClick}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-white/60 hover:text-violet-400 hover:border-violet-500/40 transition-all duration-300 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-orbitron font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Admin lock icon (desktop) — opens login or shows logout */}
              {user ? (
                <button
                  id="nav-logout-btn"
                  onClick={handleLogout}
                  title="Sair do painel admin"
                  className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 text-amber-400/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 cursor-pointer"
                  style={{ background: 'rgba(245,158,11,0.06)' }}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              ) : (
                <button
                  id="nav-admin-login-btn"
                  onClick={handleAdminClick}
                  title="Acesso administrativo"
                  className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] text-white/20 hover:text-amber-400/70 hover:border-amber-500/20 transition-all duration-300 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <Lock className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Mobile admin shortcut */}
              <button
                id="mobile-admin-shortcut"
                onClick={user ? handleAdminClick : handleAdminClick}
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 text-amber-400/70 hover:bg-amber-500/10 transition-all duration-300 cursor-pointer"
                style={{ background: 'rgba(245,158,11,0.06)' }}
              >
                {user ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile bottom tab bar — Public tabs only */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] py-2 px-3 flex justify-around" style={{ background: 'rgba(5,5,16,0.95)', backdropFilter: 'blur(20px)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-mobile-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all duration-300 cursor-pointer ${isActive ? 'scale-110' : 'opacity-40'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveNav"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <div className="relative">
                  <Icon className={`h-5 w-5 mb-0.5 relative z-10 ${isActive ? 'text-violet-400' : 'text-white/50'}`} />
                  {item.badge && isActive && (
                    <span className="absolute -top-2 -right-3 px-1 text-[7px] font-bold rounded bg-red-500 text-white z-20">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-display font-600 tracking-wide relative z-10 ${isActive ? 'text-white' : 'text-white/40'}`}>{item.label}</span>
              </button>
            );
          })}

          {/* Admin mobile tab — only if authenticated */}
          {user && (
            <button
              id="nav-link-mobile-admin"
              onClick={handleAdminClick}
              className={`relative flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all duration-300 cursor-pointer ${activeTab === 'admin' ? 'scale-110' : 'opacity-40'}`}
            >
              {activeTab === 'admin' && (
                <motion.div
                  layoutId="mobileActiveNav"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <ShieldCheck className={`h-5 w-5 mb-0.5 relative z-10 ${activeTab === 'admin' ? 'text-amber-400' : 'text-white/50'}`} />
              <span className={`text-[9px] font-display font-600 tracking-wide relative z-10 ${activeTab === 'admin' ? 'text-amber-300' : 'text-white/40'}`}>Admin</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
