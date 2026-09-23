import { useLocation } from 'react-router-dom';
import { useSiteContent } from '../../context/SiteContentContext';
import { FiInstagram, FiFacebook, FiYoutube } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const location = useLocation();
  const { content } = useSiteContent();

  const footerLinks = {
    Stay: (content.footer_links_stay || 'Royal Glamping Tent, Forest Cabin, Mountain Villa, Luxury Suite').split(',').map(s => s.trim()),
    Dining: (content.footer_links_dining || 'Continental Café, Outdoor Dining, BBQ Nights, Private Chef').split(',').map(s => s.trim()),
    Experiences: (content.footer_links_experiences || 'Campfire Nights, Stargazing, Nature Walks, Photography').split(',').map(s => s.trim()),
    Company: (content.footer_links_company || 'About Us, Careers, Track Booking, Policies').split(',').map(s => s.trim()),
  };

  const socialLinks = [
    { name: 'Instagram', href: '#', icon: <FiInstagram size={20} strokeWidth={1.5} /> },
    { name: 'Facebook', href: '#', icon: <FiFacebook size={20} strokeWidth={1.5} /> },
    { name: 'WhatsApp', href: `https://wa.me/${(content.contact_phone || '+91 98765 43210').replace(/[^0-9]/g, '')}`, icon: <FaWhatsapp size={20} /> },
    { name: 'YouTube', href: '#', icon: <FiYoutube size={20} strokeWidth={1.5} /> },
  ];

  if (location.pathname !== '/') return null;

  return (
    <footer className="bg-dark-100 border-t border-black/5">
      {/* Main Footer */}
      <div className="container-luxury py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <div className="font-display text-3xl font-light text-cream tracking-widest">CAFÉ</div>
              <div className="font-display text-2xl font-light text-gradient-gold tracking-[0.3em] -mt-1">BELMIRAH</div>
              <div className="w-16 h-px bg-gradient-to-r from-gold/60 to-transparent mt-2" />
            </div>
            <p className="text-cream/50 text-sm leading-relaxed max-w-xs mb-8 whitespace-pre-wrap">
              {content.footer_brand_text || 'A sanctuary where luxury meets nature. Experience world-class hospitality, continental cuisine, and unforgettable glamping amid the mountains.'}
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 glass flex items-center justify-center text-lg hover:border-gold/40 hover:bg-gold/5 transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links & Contact Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:pt-2">
            {/* Links Columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
              <h3 className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-8">
                {category}
              </h3>
              <ul className="space-y-4">
                {links.map(link => (
                  <li key={link}>
                    {link === 'Track Booking' ? (
                      <a href="/track" className="text-cream/40 text-sm hover:text-cream/80 transition-colors duration-300">
                        {link}
                      </a>
                    ) : link === 'Policies' ? (
                      <a href="/policies" className="text-cream/40 text-sm hover:text-cream/80 transition-colors duration-300">
                        {link}
                      </a>
                    ) : (
                      <a href="#" className="text-cream/40 text-sm hover:text-cream/80 transition-colors duration-300">
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

            {/* Contact Column */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-body text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-8">
                Contact Us
              </h3>
              <ul className="space-y-4">
                <li className="text-cream/40 text-sm">{content.contact_address || '123 Cloud Point Road, Mountain Peak'}</li>
                <li className="text-cream/40 text-sm">
                  <a href={`tel:${content.contact_phone}`} className="hover:text-cream/80 transition-colors duration-300">
                    {content.contact_phone || '+1 (555) 123-4567'}
                  </a>
                </li>
                <li className="text-cream/40 text-sm">
                  <a href={`mailto:${content.contact_email}`} className="hover:text-cream/80 transition-colors duration-300">
                    {content.contact_email || 'reservations@cafebelmirah.com'}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 pt-12 border-t border-black/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-2xl text-cream mb-2">{content.footer_newsletter_title || 'Stay Connected'}</h3>
              <p className="text-cream/50 text-sm">{content.footer_newsletter_text || 'Receive exclusive offers and stories from Café Belmirah.'}</p>
            </div>
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Your email address"
                className="luxury-input flex-1 rounded"
              />
              <button className="btn-gold px-6 py-0 whitespace-nowrap text-xs rounded">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-black/5 py-6">
        <div className="container-luxury flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream/30 text-xs">
            {content.footer_copyright || '© 2025 Café Belmirah. All rights reserved. Crafted with love in the mountains.'}
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" className="text-cream/30 text-xs hover:text-cream/60 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
