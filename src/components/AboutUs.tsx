import { useRef, useState } from 'react';
import { MessageCircle, ShieldCheck, Flame, Trophy, Award, Users, TrendingUp, Calendar, ArrowRight, Zap, UserPlus, Eye, Gavel, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { Auction } from '../types';

interface AboutUsProps {
  auctions: Auction[];
  showAboutOnly?: boolean;
  showAuctionsOnly?: boolean;
  whatsappNumber?: string;
}

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Parse the numeric part
  const match = value.match(/^([+R$\s]*)(\d[\d.,]*)(.*)$/);
  const prefix = match ? match[1] : '';
  const numStr = match ? match[2].replace(',', '.') : '';
  const rest = match ? match[3] : value;
  const num = parseFloat(numStr.replace('.', '')) || 0;

  return (
    <span ref={ref} className="price-tag text-2xl sm:text-3xl font-black">
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.1 }}
      >
        <motion.span
          initial={0}
          animate={isInView ? num : 0}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {(latest: number) => {
            const formatted = Math.round(latest).toLocaleString('pt-BR');
            return `${formatted}`;
          }}
        </motion.span>
      </motion.span>
      {rest}{suffix}
    </span>
  );
}

export default function AboutUs({ auctions, showAboutOnly = false, showAuctionsOnly = false, whatsappNumber = '5515981579514' }: AboutUsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cleanPhone = whatsappNumber.replace(/\D/g, '') || '5515981579514';
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const yParallax = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const statsList = [
    { id: 'stat-1', icon: Users, value: '2400', display: '2.400+', label: 'Membros no WhatsApp', desc: 'Divididos em 3 grupos moderados', color: '#7C3AED' },
    { id: 'stat-2', icon: Trophy, value: '1250', display: '1.250+', label: 'Leilões Finalizados', desc: 'Raridades arrematadas com segurança', color: '#EC4899' },
    { id: 'stat-3', icon: Award, value: '100', display: '100%', label: 'Produtos Originais', desc: 'Curadoria rígida anti-réplicas', color: '#10b981' },
    { id: 'stat-4', icon: TrendingUp, value: '850', display: 'R$ 850', label: 'Maior Lance Histórico', desc: 'Funko exclusivo autografado', color: '#F59E0B' },
  ];

  const renderAbout = !showAuctionsOnly;
  const renderAuctions = !showAboutOnly;

  return (
    <section ref={sectionRef} id="about-us-section" className={`py-20 px-4 sm:px-6 relative overflow-hidden ${showAboutOnly ? 'border-b border-white/[0.06]' : ''}`}>

      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[-10%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/4 right-[-5%] w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div className="mx-auto max-w-7xl space-y-24 relative z-10">

        {/* ABOUT SECTION */}
        {renderAbout && (
          <div className="space-y-20">

            {/* Story Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
                className="lg:col-span-7 space-y-7"
              >
                <div className="section-label">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                  Conheça a Baby Games
                </div>

                <h2 className="text-4xl sm:text-5xl font-display font-700 uppercase tracking-tight leading-tight">
                  <span className="text-white">Mais que uma loja,</span>
                  <br />
                  <span className="text-gradient-fire">uma Comunidade Geek</span>
                </h2>

                <div className="space-y-4 text-white/50 text-sm sm:text-base leading-relaxed font-sans">
                  <p>
                    A <strong className="text-white">Baby Games</strong> nasceu do desejo ardente de conectar apaixonados pela cultura Geek com os melhores colecionáveis do mercado global. Especializados em Action Figures premium, Funkos autênticos e estátuas de altíssimo detalhamento.
                  </p>
                  <p>
                    Toda peça adquirida é <strong className="text-violet-300">100% original</strong>, embalada em caixa reforçada multicamadas e enviada com rastreamento completo.
                  </p>
                  <p>
                    Nossa grande vertente é o <strong className="text-pink-400">WhatsApp Auction Club</strong>: um ambiente seguro e dinâmico onde colecionadores disputam peças exclusivas toda semana.
                  </p>
                </div>

                {/* Feature pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: ShieldCheck, label: 'Autenticidade Certificada', desc: 'Zero pirataria. Vistoria de caixa e selos.', color: '#06B6D4' },
                    { icon: Flame, label: 'Comunidade Viva', desc: 'Mostre sua coleção, troque ideias.', color: '#EC4899' },
                    { icon: Zap, label: 'Envio Blindado', desc: 'Embalagem dupla camada anti-dano.', color: '#F59E0B' },
                    { icon: Trophy, label: 'Lances Semanais', desc: 'Peças raras toda quinta às 19h.', color: '#A78BFA' },
                  ].map((feat) => {
                    const Icon = feat.icon;
                    return (
                      <div key={feat.label} className="flex items-start gap-3 p-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${feat.color}30`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                      >
                        <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${feat.color}15` }}>
                          <Icon className="h-4 w-4" style={{ color: feat.color }} />
                        </div>
                        <div>
                          <h4 className="font-display font-700 text-white text-xs uppercase tracking-wide">{feat.label}</h4>
                          <p className="text-[11px] text-white/35 mt-0.5">{feat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Visual card */}
              <motion.div
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
                style={{ y: yParallax }}
                className="lg:col-span-5 flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative max-w-sm w-full"
                >
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }} />

                  <div className="relative p-7 rounded-3xl text-center space-y-6"
                    style={{
                      background: 'rgba(13,13,26,0.95)',
                      border: '1px solid rgba(124,58,237,0.35)',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                  >
                    {/* Logo mark */}
                    <div className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden"
                      style={{
                        background: 'rgba(13,13,26,0.95)',
                        border: '1px solid rgba(124,58,237,0.4)',
                        boxShadow: '0 0 30px rgba(124,58,237,0.2)',
                      }}
                    >
                      <img src="/logo.jpeg" alt="Baby Games Logo" className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-700 text-2xl uppercase tracking-widest text-gradient-violet">Baby Games</h3>
                      <p className="text-[11px] font-mono tracking-[0.25em] text-white/30 uppercase">Collectibles & Auctions</p>
                    </div>

                    <div className="p-4 rounded-xl text-left space-y-2.5"
                      style={{ background: 'rgba(5,5,16,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono border-b border-white/[0.06] pb-2 flex justify-between">
                        <span>Inauguração</span>
                        <span style={{ color: '#A78BFA' }}>Setembro 2021</span>
                      </div>
                      <div className="text-[12px] text-white/45 font-sans leading-relaxed">
                        Fundada por colecionadores com <span className="text-white/80 font-semibold">+10 mil pacotes</span> despachados em perfeito estado.
                      </div>
                    </div>

                    <div className="text-[10px] text-white/25 font-mono italic">
                      "De fãs para colecionadores de verdade."
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="space-y-8 pt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-2"
              >
                <h3 className="text-2xl sm:text-3xl font-display font-700 uppercase text-white">
                  Nossos <span className="text-gradient-cyan">Números</span>
                </h3>
                <p className="text-sm text-white/35 max-w-lg mx-auto">
                  Resultados reais da nossa curadoria de leilões e catálogo de vendas
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statsList.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.5, delay: idx * 0.1, type: 'spring', stiffness: 100 }}
                      whileHover={{ y: -8, scale: 1.03 }}
                      className="p-6 rounded-2xl text-center space-y-3 transition-all duration-300 cursor-pointer group"
                      style={{
                        background: 'rgba(17,17,40,0.9)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${stat.color}35`; (e.currentTarget as HTMLElement).style.boxShadow = `0 15px 30px rgba(0,0,0,0.4), 0 0 30px ${stat.color}15`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }}
                    >
                      <div className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300"
                        style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}25` }}>
                        <Icon className="h-5 w-5 transition-colors" style={{ color: stat.color }} />
                      </div>
                      <div>
                        <div style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}50` }}>
                          <span className="price-tag text-2xl sm:text-3xl font-black">{stat.display}</span>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mt-1">{stat.label}</div>
                      </div>
                      <p className="text-xs text-white/30 font-sans leading-relaxed">{stat.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* AUCTIONS SECTION */}
        {renderAuctions && (
          <div className="space-y-8 pt-4" id="auctions-interactive-sub"
            style={renderAbout ? { borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4rem' } : {}}>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="section-label" style={{ color: '#EC4899', borderColor: 'rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.08)' }}>
                  <Flame className="h-3 w-3 fill-current" />
                  Club de Leilões
                </div>
                <h3 className="text-4xl sm:text-5xl font-display font-700 uppercase tracking-tight">
                  <span className="text-white">Leilões </span>
                  <span className="text-gradient-fire">WhatsApp</span>
                </h3>
                <p className="text-sm text-white/40 max-w-xl font-sans leading-relaxed">
                  Leilões transparentes direto no nosso grupo do WhatsApp. Abaixo os itens em disputa e lances recentes da comunidade.
                </p>
              </div>

              <a
                href={`https://wa.me/${cleanPhone}?text=Quero%20entrar%20no%20grupo%20de%20leiloes`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 py-3 px-6 rounded-xl text-white font-display font-700 text-sm uppercase tracking-wider transition-all flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 0 20px rgba(22,163,74,0.3)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(22,163,74,0.5)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(22,163,74,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <MessageCircle className="h-4.5 w-4.5" />
                Entrar no Grupo
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* How it works — redesigned */}
            {(() => {
              const steps = [
                {
                  n: '01',
                  icon: UserPlus,
                  label: 'Entre no Grupo',
                  desc: 'Clique no botão e entre no grupo exclusivo de curadoria. Lá você encontra uma comunidade de colecionadores apaixonados.',
                  tip: 'Acesso 100% gratuito',
                  tipIcon: CheckCircle2,
                  color: '#A78BFA',
                  glow: 'rgba(167,139,250,0.18)',
                  border: 'rgba(167,139,250,0.3)',
                  bg: 'rgba(124,58,237,0.08)',
                },
                {
                  n: '02',
                  icon: Eye,
                  label: 'Acompanhe os Anúncios',
                  desc: 'Moderadores postam peças raras com fotos em alta qualidade, preço de partida e regras do leilão, tudo transparente!',
                  tip: 'Novidades todos os dias das 11 às 17!',
                  tipIcon: Flame,
                  color: '#EC4899',
                  glow: 'rgba(236,72,153,0.18)',
                  border: 'rgba(236,72,153,0.3)',
                  bg: 'rgba(236,72,153,0.08)',
                },
                {
                  n: '03',
                  icon: Gavel,
                  label: 'Dê seu Lance',
                  desc: 'Responda no chat com seu valor. O maior lance registrado até o encerramento arremata a peça, simples assim!',
                  tip: 'Envio garantido para todo o Brasil',
                  tipIcon: Zap,
                  color: '#F59E0B',
                  glow: 'rgba(245,158,11,0.18)',
                  border: 'rgba(245,158,11,0.3)',
                  bg: 'rgba(245,158,11,0.08)',
                },
              ];

              return (
                <div className="space-y-6">
                  {/* Section label */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-2"
                  >
                    <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/30">Passo a passo</p>
                    <h3 className="text-2xl sm:text-3xl font-display font-700 text-white">Como participar de um leilão?</h3>
                  </motion.div>

                  {/* Cards + connector */}
                  <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">


                    {steps.map((step, i) => {
                      const Icon = step.icon;
                      const TipIcon = step.tipIcon;
                      return (
                        <motion.div
                          key={step.n}
                          initial={{ opacity: 0, y: 32 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-30px' }}
                          transition={{ duration: 0.55, delay: i * 0.15, type: 'spring', stiffness: 80 }}
                          whileHover={{ y: -6, scale: 1.02 }}
                          className="relative flex flex-col gap-5 rounded-2xl p-6 cursor-default z-10 transition-shadow duration-300"
                          style={{
                            background: step.bg,
                            border: `1px solid ${step.border}`,
                            boxShadow: `0 4px 30px ${step.glow}`,
                          }}
                        >
                          {/* Number badge */}
                          <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-orbitron font-bold"
                            style={{ background: step.color, color: '#050510', boxShadow: `0 0 16px ${step.glow}` }}
                          >
                            {step.n}
                          </div>

                          {/* Icon circle */}
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl flex-shrink-0"
                            style={{ background: `rgba(255,255,255,0.04)`, border: `1px solid ${step.border}` }}
                          >
                            <Icon className="h-8 w-8" style={{ color: step.color }} strokeWidth={1.5} />
                          </div>

                          {/* Text */}
                          <div className="space-y-2">
                            <h4 className="font-display font-700 text-white text-base uppercase tracking-wide"
                              style={{ color: step.color }}
                            >
                              {step.label}
                            </h4>
                            <p className="text-white/55 text-sm leading-relaxed font-sans">{step.desc}</p>
                          </div>

                          {/* Tip pill */}
                          <div className="flex items-center gap-2 mt-auto pt-3"
                            style={{ borderTop: `1px solid ${step.border}` }}
                          >
                            <TipIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: step.color }} />
                            <span className="text-[11px] font-mono" style={{ color: step.color }}>{step.tip}</span>
                          </div>

                          {/* Bottom glow */}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${step.color}, transparent)` }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Auction cards */}
            {auctions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {auctions.map((auc, idx) => {
                  const isEnded = auc.status === 'ended';
                  return (
                    <motion.div
                      key={auc.id}
                      id={`auction-card-${auc.id}`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.5, delay: idx * 0.12, type: 'spring', stiffness: 90 }}
                      whileHover={!isEnded ? { y: -10, scale: 1.02 } : {}}
                      className="relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
                      style={{
                        background: 'rgba(17,17,40,0.9)',
                        border: isEnded ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(236,72,153,0.25)',
                        boxShadow: isEnded ? 'none' : '0 4px 25px rgba(236,72,153,0.12)',
                        opacity: isEnded ? 0.65 : 1,
                      }}
                    >
                      {/* Image container */}
                      <div className="relative h-52 w-full overflow-hidden bg-black/40">
                        <img
                          src={auc.imageUrl}
                          alt={auc.title}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          {auc.status === 'active' && (
                            <span className="badge-flame flex items-center gap-1 text-[11px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-ping inline-block" />
                              <Flame className="h-3 w-3" /> Ao Vivo
                            </span>
                          )}
                          {auc.status === 'upcoming' && (
                            <span className="badge-purple flex items-center gap-1 text-[11px]">
                              <Clock className="h-3 w-3" /> Em Breve
                            </span>
                          )}
                          {auc.status === 'ended' && (
                            <span className="badge-gray flex items-center gap-1 text-[11px]">
                              Encerrado
                            </span>
                          )}
                        </div>

                        {/* End time pill */}
                        <div className="absolute bottom-3 right-3 glass px-2.5 py-1 rounded-lg text-[11px] font-mono text-white/80 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-pink-400" />
                          {auc.endsAt}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex flex-col flex-1 gap-4">
                        <div>
                          <h4 className="font-display font-700 text-white text-base line-clamp-2 leading-snug">
                            {auc.title}
                          </h4>
                          <p className="text-white/45 text-xs line-clamp-2 mt-1 font-sans">
                            {auc.description}
                          </p>
                        </div>

                        {/* Bid details */}
                        <div className="flex items-center justify-between py-3 px-4 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div>
                            <div className="text-[9px] text-white/25 uppercase tracking-widest font-mono mb-1">Lance Atual</div>
                            <div className="price-tag text-lg font-black" style={{ color: isEnded ? '#6B7280' : '#F59E0B', textShadow: isEnded ? 'none' : '0 0 15px rgba(245,158,11,0.4)' }}>
                              R$ {auc.currentBid.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] text-white/25 uppercase tracking-widest font-mono mb-1">Lances</div>
                            <div className="text-sm font-bold text-white">{auc.bidsCount}</div>
                          </div>
                        </div>

                        {!isEnded ? (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=Olá!%20Quero%20dar%20lance%20em%20${encodeURIComponent(auc.title)}`}
                            target="_blank" rel="noreferrer"
                            className="btn-primary flex items-center justify-center gap-2 py-3 text-xs rounded-xl"
                            style={{ fontSize: '11px', padding: '12px 16px', borderRadius: '10px' }}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Dar Lance no WhatsApp
                          </a>
                        ) : (
                          <div className="text-center text-xs text-white/25 font-mono italic py-2">
                            Leilão encerrado · Peça arrematada!
                          </div>
                        )}

                        {!isEnded && (
                          <div className="text-[10px] text-white/25 font-mono text-center">
                            * Incremento mínimo: R$ {auc.minIncrement.toFixed(2)}
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
      </div>
    </section>
  );
}
