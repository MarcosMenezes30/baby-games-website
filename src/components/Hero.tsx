import { useState, useEffect, useRef, MouseEvent } from 'react';
import { ArrowRight, Flame, ShieldCheck, Sparkles, Trophy, Zap } from 'lucide-react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';


interface HeroProps {
  onExploreClick: () => void;
  onAuctionClick: () => void;
}

export default function Hero({ onExploreClick, onAuctionClick }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Parallax layers
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 100]);
  const textY = useTransform(scrollY, [0, 600], [0, -40]);
  const graphicY = useTransform(scrollY, [0, 600], [0, -65]);

  // 3D card mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Typewriter
  const words = ["Funko Pops", "Action Figures", "Colecionáveis", "ser geek"];
  const [displayedText, setDisplayedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const currentFullWord = words[wordIndex];
    const handleType = () => {
      if (!isDeleting) {
        setDisplayedText(currentFullWord.substring(0, displayedText.length + 1));
        setTypingSpeed(80);
        if (displayedText === currentFullWord) {
          // Always cycle: pause then delete, looping back to index 0
          setTypingSpeed(1800);
          setIsDeleting(true);
        }
      } else {
        setDisplayedText(currentFullWord.substring(0, displayedText.length - 1));
        setTypingSpeed(40);
        if (displayedText === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
          setTypingSpeed(300);
        }
      }
    };
    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, wordIndex, typingSpeed]);

  // Countdown timer for the hero card auction
  const INITIAL_SECONDS = 2 * 3600 + 45 * 60 + 18; // 02:45:18
  const [countdown, setCountdown] = useState(INITIAL_SECONDS);
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(tick);
  }, []);
  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };


  const quickThemes = [
    { label: 'Marvel', color: '#ef4444' },
    { label: 'Naruto', color: '#f97316' },
    { label: 'JJK', color: '#8b5cf6' },
    { label: 'Dragon Ball', color: '#eab308' },
    { label: 'DC Comics', color: '#3b82f6' },
    { label: 'Disney', color: '#ec4899' },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden hex-grid min-h-[90vh] flex items-center py-20 lg:py-28 px-4 sm:px-6">

      {/* Deep background layers */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none z-0">
        {/* Radial light sources */}
        <div className="absolute top-[-15%] left-[10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full pointer-events-none z-0"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            background: i % 2 === 0 ? 'rgba(139,92,246,0.6)' : 'rgba(236,72,153,0.6)',
            boxShadow: i % 2 === 0 ? '0 0 10px rgba(139,92,246,0.8)' : '0 0 10px rgba(236,72,153,0.8)',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i * 0.8,
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="mx-auto max-w-7xl relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left: Text content */}
          <motion.div style={{ y: textY }} className="lg:col-span-7 space-y-8 text-center lg:text-left">

            {/* Section label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="section-label justify-center lg:justify-start"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              <Flame className="h-3 w-3" />
              O Maior Clube Geek do Brasil
            </motion.div>

            {/* Main headline with glitch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, type: 'spring' }}
            >
              <h1
                className="font-display font-700 leading-[0.88] tracking-tight uppercase"
                style={{ fontSize: 'clamp(4rem, 10vw, 8rem)' }}
              >
                <span className="block text-white">Baby</span>
                <span
                  className="block text-gradient-violet glitch"
                  data-text="Games"
                >
                  Games
                </span>
              </h1>
            </motion.div>

            {/* Typewriter line */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center lg:justify-start gap-2 text-xl sm:text-2xl font-display font-600"
            >
              <span className="text-white/60">A melhor em</span>
              <span className="relative flex items-center" style={{ color: '#A78BFA' }}>
                <span style={{ textShadow: '0 0 20px rgba(167,139,250,0.5)' }}>{displayedText}</span>
                <span
                  className="ml-0.5 inline-block w-[2px] h-6 animate-pulse"
                  style={{ background: '#A78BFA', boxShadow: '0 0 8px rgba(167,139,250,0.9)' }}
                />
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-white/50 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed"
            >
              Explore nossa vitrine de Funkos exclusivos, Action Figures importados e estátuas de luxo.
              Lances ao vivo toda semana no WhatsApp com a maior comunidade geek do país.
            </motion.p>

            {/* Theme chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="flex flex-wrap justify-center lg:justify-start gap-2"
            >
              {quickThemes.map((theme) => (
                <button
                  key={theme.label}
                  onClick={onExploreClick}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-display font-600 tracking-wide cursor-pointer transition-all duration-200 hover:scale-105"
                  style={{
                    background: `${theme.color}12`,
                    border: `1px solid ${theme.color}30`,
                    color: theme.color,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${theme.color}25`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${theme.color}60`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${theme.color}30`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = `${theme.color}12`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${theme.color}30`;
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {theme.label}
                </button>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                id="hero-explore-cta"
                onClick={onExploreClick}
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Explorar Catálogo
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                id="hero-auction-cta"
                onClick={onAuctionClick}
                className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Flame className="h-4 w-4" />
                Leilões ao Vivo
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex items-stretch gap-0 pt-6 max-w-md mx-auto lg:mx-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              {[
                { value: '100%', label: 'Originais', color: '#10b981' },
                { value: '+2mil', label: 'Membros', color: '#EC4899' },
                { value: '+500', label: 'Lances/sem', color: '#A78BFA' },
              ].map((stat, idx) => (
                <div key={stat.label} className="flex items-stretch">
                  {idx > 0 && (
                    <div className="w-px self-stretch mx-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  )}
                  <div className="text-center lg:text-left">
                    <div className="price-tag text-xl sm:text-2xl font-black" style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}60` }}>
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-white/40 mt-0.5">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

          </motion.div>

          {/* Right: 3D Card */}
          <motion.div style={{ y: graphicY }} className="lg:col-span-5 relative flex justify-center">

            {/* Floating badges behind */}
            <motion.div
              className="absolute -top-6 -right-2 z-10 glass px-3 py-2 rounded-xl flex items-center gap-2 pointer-events-none shadow-xl"
              animate={{ y: [0, -8, 0], rotate: [-2, 0, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="text-[11px] font-display font-600 text-white/80 whitespace-nowrap">Autenticidade Garantida</span>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-2 z-10 glass px-3 py-2 rounded-xl flex items-center gap-2 pointer-events-none shadow-xl"
              animate={{ y: [0, 8, 0], rotate: [2, 0, 2] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <Zap className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span className="text-[11px] font-display font-600 text-white/80 whitespace-nowrap">Peças Limitadas</span>
            </motion.div>

            {/* Main 3D card */}
            <motion.div
              ref={cardRef}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: '1000px' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[360px] rounded-3xl overflow-hidden cursor-pointer"
            >
              {/* Card glow */}
              <div className="absolute inset-0 rounded-3xl z-0" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(236,72,153,0.3) 100%)', filter: 'blur(1px)' }} />
              
              {/* Card body */}
              <div className="relative z-10 rounded-3xl overflow-hidden" style={{ background: 'rgba(13,13,26,0.95)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                {/* Top bar */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    LEILÃO AO VIVO
                  </div>
                </div>

                {/* Image */}
                <div className="relative aspect-square overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600"
                    alt="Leilão em destaque"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,13,26,0.95) 0%, rgba(13,13,26,0.2) 50%, transparent 100%)' }} />

                  {/* LIVE badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-white text-[10px] font-orbitron font-bold"
                    style={{ background: 'rgba(239,68,68,0.9)', boxShadow: '0 0 15px rgba(239,68,68,0.5)', backdropFilter: 'blur(4px)' }}>
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="h-1.5 w-1.5 rounded-full bg-white"
                    />
                    LIVE
                  </div>

                  {/* Theme tag */}
                  <div className="absolute bottom-3 right-3 glass px-2 py-1 rounded-lg text-[10px] font-display font-600" style={{ color: '#F59E0B' }}>
                    Dragon Ball · RARO
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-display font-700 text-white text-base leading-tight">
                    Vegeta SSJ Blue — Escala 1/8 RARO
                  </h3>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl" style={{ background: 'rgba(5,5,16,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div className="text-[9px] text-white/30 uppercase tracking-widest font-mono mb-1">Lance Atual</div>
                      <div className="price-tag text-xl font-black" style={{ color: '#F59E0B', textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>
                        R$ 520
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-white/30 uppercase tracking-widest font-mono mb-1">Termina em</div>
                  <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="price-tag text-sm font-black"
                        style={{ color: countdown === 0 ? '#6b7280' : '#EC4899' }}
                      >
                        {formatCountdown(countdown)}
                      </motion.div>

                    </div>
                  </div>

                  <button
                    onClick={onAuctionClick}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-xs cursor-pointer"
                    style={{ borderRadius: '10px', padding: '12px' }}
                  >
                    <Trophy className="h-3.5 w-3.5" />
                    Dar Lance no WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
