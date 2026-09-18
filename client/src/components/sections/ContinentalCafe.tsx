import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMenu } from '../../lib/api';
import { useSiteContent } from '../../context/SiteContentContext';

// Steam animation overlay
function SteamEffect() {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 60, height: 80 }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute bottom-0 animate-steam"
          style={{
            left: `${20 + i * 20}%`,
            width: 8,
            height: '100%',
            background: 'linear-gradient(to top, rgba(255,255,255,0.6), transparent)',
            borderRadius: '50%',
            animationDelay: `${i * 0.8}s`,
            animationDuration: `2.5s`,
          }}
        />
      ))}
    </div>
  );
}

// Coffee cup icon with steam
function CoffeeCup() {
  return (
    <div className="relative inline-flex items-end justify-center" style={{ height: 100 }}>
      <SteamEffect />
      <div className="text-6xl animate-float">☕</div>
    </div>
  );
}

function MenuCard({ item, index }: { item: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="luxury-card group flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Badges moved outside image */}
        <div className="flex gap-2 flex-wrap mb-2">
          <span className={item.isVeg ? 'badge-veg' : 'badge-nonveg'}>
            <span>{item.isVeg ? '🟢' : '🔴'}</span>
            {item.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
          {item.isBestseller && (
            <span className="badge-bestseller">⭐ Bestseller</span>
          )}
        </div>

        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-base text-cream leading-tight">{item.name}</h3>
          <span className="font-body text-lg text-gold font-light whitespace-nowrap">₹{item.price}</span>
        </div>
        <p className="text-cream/40 text-xs leading-relaxed flex-1 line-clamp-2">
          {item.description}
        </p>

        {/* Reserve table temporarily disabled
        <button
          className="mt-3 w-full btn-outline-gold text-xs py-2.5 justify-center"
          onClick={() => document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Reserve Table
        </button>
        */}
      </div>
    </motion.div>
  );
}

export default function ContinentalCafe() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const { content } = useSiteContent();

  useEffect(() => {
    fetchMenu().then(setMenuItems).catch(console.error);
  }, []);

  const filtered = activeCategory === 'all'
    ? (menuItems || [])
    : (menuItems || []).filter(item => item.category === activeCategory);

  const dynamicCategories = [
    { id: 'all', label: 'All Items' },
    ...Array.from(new Set((menuItems || []).map(item => item.category?.trim()))).filter(Boolean).map(cat => ({
      id: cat,
      label: cat
    }))
  ];

  return (
    <section id="cafe" className="section-padding bg-dark-100 relative">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 30% at 50% 20%, rgba(139,94,60,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="container-luxury relative">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label justify-center mb-4"
          >
            Continental Café
          </motion.div>

          {/* 3D Coffee Cup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex justify-center mb-6"
          >
            <CoffeeCup />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-title mb-4"
          >
            {content.cafe_intro_title || "A Culinary Journey"}
          </motion.h2>
          <div className="gold-divider" />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-cream/50 max-w-lg mx-auto mt-4 text-sm"
          >
            {content.cafe_intro_text || "From sunrise brunches to midnight desserts, our continental café is an ode to the art of fine dining — crafted with mountain-fresh ingredients."}
          </motion.p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none justify-start lg:justify-center">
          {dynamicCategories.map(cat => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`whitespace-nowrap px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-300 border flex-shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-gold text-dark border-gold'
                  : 'glass border-black/10 text-cream/50 hover:border-gold/30 hover:text-cream/80'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Menu Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <MenuCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-cream/30">
            <div className="text-4xl mb-4">🍽️</div>
            <p>No items in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
