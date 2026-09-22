import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useSiteContent } from '../../context/SiteContentContext';

const navLinks = [
  { href: '#stay', label: 'Stay' },
  { href: '#cafe', label: 'Café' },
  { href: '#experiences', label: 'Experiences' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#booking', label: 'Book' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { content } = useSiteContent();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname !== '/') return null;

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-600 ${
          scrolled
            ? 'glass-dark border-b border-black/5 py-3'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="w-full px-6 md:px-12 flex items-center justify-between relative">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-start group relative z-10"
          >
            {content.site_logo ? (
              <img
                src={content.site_logo}
                alt="Café Belmirah"
                style={{ height: content.site_logo_px ? `${content.site_logo_px}px` : '56px' }}
                className="w-auto object-contain"
              />
            ) : (
              <>
                <span className={`font-display text-2xl font-light tracking-widest leading-none group-hover:text-gradient-gold transition-all duration-300 ${scrolled ? 'text-cream' : 'text-white'}`}>
                  CAFÉ
                </span>
                <span className="font-display text-xl font-light text-gradient-gold tracking-[0.3em] leading-none -mt-1">
                  BELMIRAH
                </span>
                <div className="w-full h-px bg-gradient-to-r from-gold/60 to-transparent mt-1" />
              </>
            )}
          </button>
          
          {/* Desktop Navigation */}
          <nav className={`hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 ${scrolled ? 'text-cream/70' : 'text-white/80'}`}>
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="nav-link"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-6 relative z-10">
            <Link to="/track" className={`font-body text-xs hover:text-gold uppercase tracking-wider transition-colors ${scrolled ? 'text-cream/70' : 'text-white/80'}`}>
              Find Booking
            </Link>
            <button
              onClick={() => handleNavClick('#booking')}
              className="btn-gold text-xs px-6 py-3 relative z-10"
            >
              <span className="relative z-10">Book Now</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 relative z-50"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className={`block w-6 h-px transition-all ${menuOpen ? 'bg-cream' : (scrolled ? 'bg-cream' : 'bg-white')}`}
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className={`block w-6 h-px transition-all ${menuOpen ? 'bg-cream' : (scrolled ? 'bg-cream' : 'bg-white')}`}
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className={`block w-6 h-px transition-all ${menuOpen ? 'bg-cream' : (scrolled ? 'bg-cream' : 'bg-white')}`}
            />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40 glass-dark flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                onClick={() => handleNavClick(link.href)}
                className="font-display text-4xl font-light text-cream hover:text-gradient-gold transition-all duration-300"
              >
                {link.label}
              </motion.button>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.1 + 0.2 }}
              className="flex flex-col items-center gap-6"
            >
              <Link 
                to="/track" 
                className="text-2xl font-display text-cream hover:text-gold transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Track Booking
              </Link>
              <button 
                onClick={() => handleNavClick('#booking')} 
                className="btn-gold text-lg py-4 px-8 mt-4"
              >
                BOOK NOW
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
