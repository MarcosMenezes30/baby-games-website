import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { Testimonial } from '../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  // Duplicate for seamless infinite scroll
  const doubled = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

  return (
    <section id="testimonials-section" className="py-20 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'rgba(5,5,16,0.6)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), rgba(236,72,153,0.3), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), rgba(236,72,153,0.3), transparent)' }} />
      </div>

      <div className="relative z-10 space-y-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 px-4"
        >
          <div className="section-label mx-auto justify-center">
            <Star className="h-3 w-3 fill-current" />
            Feedback dos Colecionadores
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-700 tracking-tight uppercase">
            <span className="text-white">Quem Compra, </span>
            <span className="text-gradient-fire">Recomenda!</span>
          </h2>
          <p className="text-sm text-white/40 max-w-md mx-auto font-sans">
            +500 depoimentos reais de membros do grupo de leilões e Instagram
          </p>
        </motion.div>

        {/* Track 1 — scroll left */}
        <div className="relative">
          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, #050510 0%, transparent 100%)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(-90deg, #050510 0%, transparent 100%)' }} />

          <div className="overflow-hidden">
            <div className="marquee-track gap-4 px-2">
              {doubled.map((test, i) => (
                <TestimonialCard key={`t1-${test.id}-${i}`} test={test} />
              ))}
            </div>
          </div>
        </div>

        {/* Track 2 — scroll right (reverse) */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, #050510 0%, transparent 100%)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(-90deg, #050510 0%, transparent 100%)' }} />

          <div className="overflow-hidden">
            <div className="marquee-track-reverse gap-4 px-2">
              {[...doubled].reverse().map((test, i) => (
                <TestimonialCard key={`t2-${test.id}-${i}`} test={test} compact />
              ))}
            </div>
          </div>
        </div>

        {/* Shipping highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-4 sm:mx-6 lg:mx-auto max-w-7xl"
        >
          <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-display font-700 text-white uppercase">
                O famoso <span className="text-gradient-violet">Padrão Baby Games</span> de envio
              </h3>
              <p className="text-white/45 text-sm font-sans leading-relaxed">
                Sabemos o quanto a caixa do seu Funko Pop é importante. Todos os produtos saem em{' '}
                <strong className="text-white/80">duas camadas de plástico bolha de alta densidade</strong>,
                preenchimento de isopor e caixas reforçadas personalizadas.
                <span className="text-pink-400 font-semibold"> Caixa MINT na chegada ou devolução integral.</span>
              </p>
            </div>

            <div className="flex-shrink-0 text-center px-6 py-4 rounded-2xl"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <div className="text-3xl mb-1">🛡️</div>
              <div className="font-orbitron text-[11px] font-bold uppercase tracking-widest" style={{ color: '#A78BFA' }}>
                Safe Delivery
              </div>
              <div className="text-[10px] text-white/30 mt-0.5">Caixa Blindada</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialCard({ test, compact }: { key?: React.Key; test: Testimonial; compact?: boolean }) {
  return (
    <div
      className="flex-shrink-0 w-[280px] sm:w-[320px] p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'rgba(17,17,40,0.9)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        marginRight: '16px',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <Quote className="h-6 w-6 text-white/05 flex-shrink-0 scale-x-[-1]" />
      </div>

      <p className="text-white/55 text-[13px] font-sans leading-relaxed italic line-clamp-3">
        "{test.comment}"
      </p>

      <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <img
          src={test.avatarUrl}
          alt={test.name}
          className="h-9 w-9 rounded-xl flex-shrink-0"
          style={{ border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(17,17,40,0.8)' }}
          referrerPolicy="no-referrer"
        />
        <div>
          <div className="font-display font-600 text-white text-[13px]">{test.name}</div>
          <div className="text-[11px] font-mono" style={{ color: '#7C3AED' }}>{test.role}</div>
        </div>
      </div>
    </div>
  );
}
