import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { fetchHeroMedia } from '../../lib/api';
import { useSiteContent } from '../../context/SiteContentContext';

// Particle system for starfield / fireflies
function Particles({ count = 80, type = 'stars' }: { count?: number; type?: 'stars' | 'fireflies' }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: type === 'stars' ? Math.random() * 2 + 0.5 : Math.random() * 4 + 2,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className={`absolute rounded-full ${type === 'stars' ? 'bg-white animate-star' : 'bg-gold animate-flicker'}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: type === 'stars' ? 0.6 : 0.4,
            filter: type === 'fireflies' ? `drop-shadow(0 0 4px rgba(201,168,76,0.8))` : 'none',
          }}
        />
      ))}
    </div>
  );
}


export default function Hero() {
  const headlineRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const [heroMedia, setHeroMedia] = useState<any[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const { content } = useSiteContent();

  const headlineText = content.hero_headline || "Luxury\nBeyond\nImagination";
  const subheadlineText = content.hero_subheadline || "Luxury Glamping  ·  Continental Café  ·  Nature  ·  Unforgettable Experiences";
  
  // Format headline for animations (split by newline, then space)
  const renderHeadline = () => {
    const lines = headlineText.split('\n');
    return lines.map((line, lineIndex) => (
      <span key={lineIndex}>
        {line.split(' ').map((word, wordIndex) => (
          <span key={wordIndex} className={`word inline-block opacity-0 ${word.toLowerCase() === 'beyond' ? 'italic text-gradient-gold' : ''}`}>
            {word}&nbsp;
          </span>
        ))}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    ));
  };

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const data = await fetchHeroMedia();
        if (data && data.length > 0) {
          setHeroMedia(data);
        } else {
          // Fallback if empty
          setHeroMedia([{ id: 'default', type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90' }]);
        }
      } catch (error) {
        setHeroMedia([{ id: 'default', type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90' }]);
      }
    };
    loadMedia();
  }, []);

  useEffect(() => {
    if (heroMedia.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveMediaIndex((prev) => (prev + 1) % heroMedia.length);
    }, 8000); // Change background every 8 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 });

    if (headlineRef.current) {
      const words = headlineRef.current.querySelectorAll('.word');
      tl.fromTo(words,
        { opacity: 0, y: 60, rotateX: -20 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1.2, stagger: 0.12, ease: 'power3.out' }
      );
    }
    if (subtextRef.current) {
      tl.fromTo(subtextRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
      );
    }
    if (ctaRef.current) {
      const buttons = ctaRef.current.querySelectorAll('button');
      tl.fromTo(buttons,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
        '-=0.4'
      );
    }
    if (scrollIndicatorRef.current) {
      tl.fromTo(scrollIndicatorRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        '-=0.2'
      );
    }
  }, []);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col overflow-hidden bg-dark pb-8">
      {/* Background Image / Video Carousel */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          {heroMedia.map((media, index) => (
            index === activeMediaIndex && (
              <motion.div
                key={media.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
              >
                {media.type === 'image' ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${media.url})`,
                      transform: 'scale(1.05)',
                    }}
                  />
                ) : (
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={media.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ transform: 'scale(1.05)' }}
                  />
                )}
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-hero-overlay" />

      {/* Gold atmospheric glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 80%, rgba(201,168,76,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Particles */}
      <Particles count={60} type="stars" />
      <Particles count={20} type="fireflies" />

      {/* Content */}
      <div className="relative z-10 text-center container-luxury flex-1 flex flex-col justify-start md:justify-center pt-28 md:pt-40 lg:pt-48 pb-12">

        {/* Main Headline */}
        <div ref={headlineRef} className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-light text-white leading-tight md:leading-none mb-6 perspective-1000">
          {renderHeadline()}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-8"
        />

        {/* Subtext */}
        <p
          ref={subtextRef}
          className="opacity-0 font-body text-xs sm:text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] text-white/80 uppercase max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {subheadlineText.split('·').map((part, i, arr) => (
            <span key={i}>
              {part.trim()}
              {i < arr.length - 1 && <>&nbsp;&nbsp;·&nbsp;&nbsp;</>}
            </span>
          ))}
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[280px] sm:max-w-none mx-auto">
          <button
            className="btn-gold opacity-0 w-full sm:w-auto min-w-[180px]"
            onClick={() => scrollTo('#booking')}
          >
            <span className="relative z-10">Book Your Stay</span>
          </button>
          <button
            className="btn-outline-gold opacity-0 w-full sm:w-auto min-w-[180px]"
            onClick={() => scrollTo('#booking')}
          >
            Reserve a Table
          </button>
          <button
            className="btn-outline-gold opacity-0 w-full sm:w-auto min-w-[180px]"
            onClick={() => scrollTo('#cafe')}
          >
            Explore Menu
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="relative z-20 mt-auto flex justify-center w-full">
        <div
          ref={scrollIndicatorRef}
          className="opacity-0 flex flex-col items-center gap-3 cursor-pointer"
          onClick={() => scrollTo('#about')}
        >
          <span className="font-body text-xs tracking-[0.3em] uppercase text-cream/40">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-gold/60 to-transparent animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" />
        </div>
      </div>
    </section>
  );
}
