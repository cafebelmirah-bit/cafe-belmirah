import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchExperiences } from '../../lib/api';

const categoryColors: Record<string, string> = {
  Evening: 'text-gold border-gold/30 bg-gold/10',
  Night: 'text-purple-300 border-purple-300/30 bg-purple-300/10',
  Morning: 'text-orange-300 border-orange-300/30 bg-orange-300/10',
  Adventure: 'text-green-300 border-green-300/30 bg-green-300/10',
  Dining: 'text-red-300 border-red-300/30 bg-red-300/10',
  Activity: 'text-blue-300 border-blue-300/30 bg-blue-300/10',
};

function ExperienceCard({ exp, index }: { exp: any; index: number }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = exp.images && exp.images.length > 0 ? exp.images : (exp.image ? [exp.image] : []);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="luxury-card group overflow-hidden relative flex-shrink-0"
      style={{ width: 320 }}
    >
      {/* Background image */}
      <div className="relative h-64 overflow-hidden">
        {images.length > 0 && (
          <img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={exp.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        )}
        
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              &#10094;
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              &#10095;
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_: any, i: number) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}

        {/* Icon */}
        <div className="absolute top-4 left-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="glass-gold w-14 h-14 flex items-center justify-center text-2xl"
          >
            {exp.icon}
          </motion.div>
        </div>

        {/* Category badge */}
        <div className="absolute top-4 right-4">
          <span className={`text-xs font-semibold px-2 py-1 border tracking-wider uppercase ${categoryColors[exp.category] || 'text-cream/60 border-black/10 bg-black/5'}`}>
            {exp.category}
          </span>
        </div>

        {/* Duration */}
        {exp.duration && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1 text-cream/60 text-xs">
            <span>⏱</span> {exp.duration}
          </div>
        )}

        {exp.price && (
          <div className="absolute bottom-4 right-4 glass-gold px-2 py-1">
            <span className="font-body text-xs text-gold">from ₹{exp.price.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-xl text-cream mb-2 group-hover:text-gradient-gold transition-all duration-300">
          {exp.title}
        </h3>
        <p className="text-cream/50 text-sm leading-relaxed line-clamp-3">
          {exp.description}
        </p>
        <button
          className="mt-4 btn-gold text-xs py-2.5 w-full justify-center"
          onClick={() => document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Book Now
        </button>
      </div>
    </motion.div>
  );
}

export default function Experiences() {
  const [experiences, setExperiences] = useState<any[]>([]);

  useEffect(() => {
    fetchExperiences().then(setExperiences).catch(console.error);
  }, []);

  const safeExps = experiences || [];
  const featured = safeExps.slice(0, 3);
  const others = safeExps.slice(3);

  return (
    <section id="experiences" className="section-padding bg-dark relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 30% 60%, rgba(201,168,76,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="container-luxury relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label justify-center mb-4"
          >
            Experiences
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-title mb-4"
          >
            Moments That
            <span className="block italic text-gradient-gold">Live Forever</span>
          </motion.h2>
          <div className="gold-divider" />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-cream/50 max-w-lg mx-auto mt-4 text-sm"
          >
            Beyond the extraordinary stay and food, Café Belmirah offers a curated portfolio 
            of experiences designed to connect you with nature and your true self.
          </motion.p>
        </div>

        {/* Featured experiences — Large grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {featured.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className="luxury-card group overflow-hidden flex flex-col h-full"
            >
              <div className="relative h-72 overflow-hidden shrink-0 bg-[#f8f5f0] flex items-center justify-center">
                {/* Blurred background layer for tall images */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-xl opacity-30 scale-125 transition-transform duration-700 group-hover:scale-150"
                  style={{ backgroundImage: `url(${exp.image})` }}
                />
                
                {/* Crisp uncropped foreground image */}
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-xl"
                  loading="lazy"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  {exp.icon && <span className="text-2xl">{exp.icon}</span>}
                  {exp.category && (
                    <span className={`text-xs font-semibold px-2 py-0.5 border tracking-wider uppercase ${categoryColors[exp.category] || 'text-cream/60 border-black/10 bg-black/5'}`}>
                      {exp.category}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-2xl text-cream mb-2">{exp.title}</h3>
                <p className="text-cream/50 text-sm line-clamp-3 mb-6 flex-1">{exp.description}</p>
                
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gold/10">
                  <button
                    className="btn-gold text-xs px-6 py-2.5 uppercase tracking-wider font-bold shadow-lg"
                    onClick={() => document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Book Now
                  </button>
                  {exp.duration && (
                    <div className="text-cream/60 text-xs font-medium ml-auto">
                      ⏱ {exp.duration}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scrollable horizontal strip for other experiences */}
        <div className="overflow-x-auto pb-4 -mx-6 px-6">
          <div className="flex gap-6" style={{ width: 'max-content' }}>
            {others.map((exp, i) => (
              <ExperienceCard key={exp.id} exp={exp} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
