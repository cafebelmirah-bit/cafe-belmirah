import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { submitInquiry } from '../../lib/api';
import toast from 'react-hot-toast';
import { useSiteContent } from '../../context/SiteContentContext';
import { Phone, Mail, MapPin } from 'lucide-react';
import { FiInstagram, FiFacebook, FiYoutube } from 'react-icons/fi';
import { FaTripadvisor, FaWhatsapp } from 'react-icons/fa';

// contactItems moved inside component to use dynamic content

const socialLinks = [
  { name: 'Instagram', icon: <FiInstagram size={20} strokeWidth={1.5} />, href: '#' },
  { name: 'Facebook', icon: <FiFacebook size={20} strokeWidth={1.5} />, href: '#' },
  { name: 'YouTube', icon: <FiYoutube size={20} strokeWidth={1.5} />, href: '#' },
  { name: 'TripAdvisor', icon: <FaTripadvisor size={20} />, href: '#' },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const { content } = useSiteContent();

  const contactItems = [
    {
      icon: <Phone size={24} strokeWidth={1.5} />,
      label: 'Phone',
      value: content.contact_phone || '+91 98765 43210',
      href: `tel:${(content.contact_phone || '+91 98765 43210').replace(/\s/g, '')}`,
    },
    {
      icon: <FaWhatsapp size={24} />,
      label: 'WhatsApp',
      value: content.contact_phone || '+91 98765 43210',
      href: `https://wa.me/${(content.contact_phone || '+91 98765 43210').replace(/[^0-9]/g, '')}`,
    },
    {
      icon: <Mail size={24} strokeWidth={1.5} />,
      label: 'Email',
      value: content.contact_email || 'hello@cafebelmirah.com',
      href: `mailto:${content.contact_email || 'hello@cafebelmirah.com'}`,
    },
    {
      icon: <MapPin size={24} strokeWidth={1.5} />,
      label: 'Location',
      value: content.contact_address || 'Mountain Road, Shimla Hills, Himachal Pradesh 171001',
      href: 'https://maps.google.com',
    },
  ];

  const onSubmit = async (data: any) => {
    let rawPhone = (content.contact_phone || '9511896490').replace(/[^0-9]/g, '');
    if (rawPhone.length === 10) rawPhone = '91' + rawPhone;

    const message = 
`💬 *New Inquiry / Message — Café Belmirah*

👤 *Name:* ${data.name}
✉️ *Email:* ${data.email}
📌 *Subject:* ${data.subject || 'General Inquiry'}

📝 *Message:*
${data.message}`;

    const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
    setWhatsappUrl(waLink);

    try {
      await submitInquiry(data);
    } catch {
      // Non-fatal, still open WhatsApp
    }

    setSubmitted(true);
    toast.success('Forwarding your message to WhatsApp...');
    window.open(waLink, '_blank');
  };

  return (
    <section id="contact" className="section-padding bg-dark relative">
      <div className="container-luxury">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label justify-center mb-4"
          >
            Contact Us
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-title mb-4"
          >
            We'd Love to
            <span className="block italic text-gradient-gold">Hear From You</span>
          </motion.h2>
          <div className="gold-divider" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Map placeholder */}
            <div className="relative h-64 mb-8 overflow-hidden">
              <iframe
                src={content.contact_map_url || "https://www.openstreetmap.org/export/embed.html?bbox=77.1,31.0,77.3,31.2&layer=mapnik"}
                className="w-full h-full border-0"
                title="Café Belmirah Location"
                loading="lazy"
                style={!content.contact_map_url ? { filter: 'invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' } : undefined}
              />
              <div className="absolute inset-0 border border-gold/20 pointer-events-none" />
            </div>

            {/* Contact items */}
            <div className="space-y-4">
              {contactItems.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-4 glass p-4 border border-black/5 hover:border-gold/30 transition-all duration-300 group"
                >
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="font-body text-xs text-cream/40 tracking-wider uppercase mb-1">{item.label}</div>
                    <div className="font-body text-sm text-cream/80 group-hover:text-cream transition-colors">{item.value}</div>
                  </div>
                  <span className="ml-auto text-gold/0 group-hover:text-gold/60 transition-colors">→</span>
                </motion.a>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-8">
              {socialLinks.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  className="w-12 h-12 glass flex items-center justify-center text-xl hover:border-gold/40 hover:bg-gold/5 border border-black/5 transition-all duration-300"
                  aria-label={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex items-center justify-center text-center glass p-12"
              >
                <div>
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="font-display text-3xl text-cream mb-2">Message Forwarded!</h3>
                  <p className="text-cream/50 mb-6">Your message has been forwarded to our team on WhatsApp.</p>
                  {whatsappUrl && (
                    <a 
                      href={whatsappUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-[#25D366] hover:bg-[#20ba59] text-white font-body font-semibold px-6 py-3 rounded text-sm transition-all inline-flex items-center gap-2 shadow-lg hover:shadow-[#25D366]/20"
                    >
                      <FaWhatsapp size={18} />
                      Open WhatsApp Chat
                    </a>
                  )}
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="glass p-8 space-y-6">
                <h3 className="font-display text-2xl text-cream mb-2">Send a Message</h3>
                <div className="gold-divider-left" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Name</label>
                    <input {...register('name', { required: true })} className="luxury-input" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Email</label>
                    <input {...register('email', { required: true })} className="luxury-input" placeholder="your@email.com" type="email" />
                  </div>
                </div>

                <div>
                  <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Subject</label>
                  <input {...register('subject')} className="luxury-input" placeholder="How can we help?" />
                </div>

                <div>
                  <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Message</label>
                  <textarea
                    {...register('message', { required: true })}
                    className="luxury-input resize-none"
                    rows={5}
                    placeholder="Tell us about your dream experience at Café Belmirah..."
                  />
                </div>

                <div className="bg-black/20 p-3 rounded-lg border border-black/10 flex items-center gap-3 text-xs text-cream/70">
                  <FaWhatsapp size={20} className="text-[#25D366] flex-shrink-0" />
                  <span>Your message will be sent directly to our team via WhatsApp for an instant response.</span>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-gold w-full justify-center py-4 inline-flex items-center gap-2">
                  <FaWhatsapp size={18} />
                  {isSubmitting ? 'Forwarding...' : 'Send Message via WhatsApp'}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Opening hours */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass p-8"
        >
          <h3 className="font-display text-2xl text-cream text-center mb-6">Opening Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { label: 'Café & Restaurant', hours: content.hours_cafe_time || '7:00 AM – 10:30 PM', days: content.hours_cafe_days || 'All Days' },
              { label: 'Check-In', hours: content.hours_checkin_time || '12:00 PM – 9:00 PM', days: content.hours_checkin_days || 'All Days' },
              { label: 'Check-Out', hours: content.hours_checkout_time || 'By 11:00 AM', days: content.hours_checkout_days || 'All Days' },
            ].map(item => (
              <div key={item.label} className="border-b md:border-b-0 md:border-r border-black/10 last:border-0 pb-4 md:pb-0 px-4">
                <div className="font-body text-xs text-gold tracking-wider uppercase mb-2">{item.label}</div>
                <div className="font-display text-xl text-cream">{item.hours}</div>
                <div className="font-body text-xs text-cream/40 mt-1">{item.days}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
