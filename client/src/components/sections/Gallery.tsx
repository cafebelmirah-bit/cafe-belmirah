import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchGallery, getCachedData, setCachedData } from '../../lib/api';
import { galleryImages as initialGalleryImages } from '../../data/experiences';

function Lightbox({ image, onClose }: { image: any; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative max-w-5xl w-full max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={(image.url || image.src)?.replace('w=800', 'w=1400')}
          alt={image.title || image.alt}
          className="w-full h-full object-contain max-h-[85vh]"
        />
        <div className="absolute bottom-0 left-0 right-0 glass-dark p-4">
          <p className="text-cream/70 text-sm">{image.title || image.alt}</p>
        </div>
        <button
          className="absolute top-4 right-4 glass w-10 h-10 flex items-center justify-center text-cream hover:text-gold transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<any | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>(() => getCachedData('gallery_images', initialGalleryImages));

  useEffect(() => {
    fetchGallery().then((data) => {
      if (data && data.length > 0) {
        setGalleryImages(data);
        setCachedData('gallery_images', data);
      }
    }).catch(console.error);
  }, []);

  const filtered = activeCategory === 'all'
    ? (galleryImages || [])
    : (galleryImages || []).filter(img => img.category.toLowerCase() === activeCategory);

  const dynamicCategories = [
    { id: 'all', label: 'All' },
    ...Array.from(new Set((galleryImages || []).map(img => img.category?.trim()))).filter(cat => cat && cat.toLowerCase() !== 'all').map(cat => ({
      id: cat.toLowerCase(),
      label: cat
    }))
  ];

  return (
    <>
      <section id="gallery" className="section-padding bg-dark-100 relative">
        <div className="container-luxury">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-label justify-center mb-4"
            >
              Gallery
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="section-title mb-4"
            >
              A Visual
              <span className="block italic text-gradient-gold">Reverie</span>
            </motion.h2>
            <div className="gold-divider" />
          </div>

          {/* Category Filters */}
          <div className="flex gap-3 justify-center flex-wrap mb-10">
            {dynamicCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 border ${
                  activeCategory === cat.id
                    ? 'bg-gold text-dark border-gold'
                    : 'glass border-black/10 text-cream/50 hover:border-gold/30 hover:text-cream'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Masonry Gallery */}
          <motion.div layout className="masonry-grid">
            <AnimatePresence>
              {filtered.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="masonry-item group cursor-pointer relative overflow-hidden"
                  onClick={() => setLightboxImage(img)}
                >
                  <img
                    src={img.url || img.src}
                    alt={img.title || img.alt}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    style={{ display: 'block' }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gold text-3xl mb-2">⊕</div>
                      <p className="text-cream text-xs tracking-wider">{img.title || img.alt}</p>
                    </div>
                  </div>
                  {/* Gold border */}
                  <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/40 transition-all duration-300 pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
