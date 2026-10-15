import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fetchStory, getCachedData, setCachedData } from '../../lib/api';

gsap.registerPlugin(ScrollTrigger);



function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const el = ref.current;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = Math.round(obj.val) + suffix;
      },
    });
  }, [isInView, value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function About() {
  const [story, setStory] = useState<any>(() => getCachedData('story_data', null));

  useEffect(() => {
    fetchStory().then((res) => {
      if (res && res.data) {
        setStory(res.data);
        setCachedData('story_data', res.data);
      }
    }).catch(console.error);
  }, []);

  const imageUrl = story ? story.imageUrl : "https://images.unsplash.com/photo-1464146072230-91cabc968266?w=900&q=80";
  const title = story ? story.title : "Where the Mountains";
  const subtitle = story ? story.subtitle : "Whisper Luxury";
  const p1 = story ? story.paragraph1 : "Nestled at an altitude where clouds graze the treetops, Café Belmirah was born from a dream — to create a space where nature's grandeur and human refinement exist in perfect harmony. What began as a small mountain café in 2019 has evolved into one of the region's most celebrated luxury glamping destinations.";
  const p2 = story ? story.paragraph2 : "Every detail at Belmirah is intentional — from the hand-picked artisan furnishings to the locally sourced ingredients that define our continental menu. We believe that true luxury is not about excess, but about depth of experience and the freedom to breathe in nature's extraordinary gifts.";

  // Dynamic stats from backend or fallback to defaults
  const stats = [
    { value: story?.stats?.happyGuests || 500, suffix: '+', label: 'Happy Guests' },
    { value: story?.stats?.roomTypes || 4, suffix: '', label: 'Room Types' },
    { value: story?.stats?.yearsOfExcellence || 6, suffix: '', label: 'Years of Excellence' },
    { value: story?.stats?.menuItems || 35, suffix: '+', label: 'Menu Items' },
  ];

  return (
    <section id="about" className="section-padding bg-dark-100 relative overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container-luxury relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={imageUrl}
                alt="Café Belmirah story"
                className="w-full h-auto max-h-[600px] object-cover"
                style={{ objectPosition: story?.imagePosition || 'center' }}
                loading="lazy"
              />
              {/* Gold frame accent */}
              <div className="absolute top-4 left-4 right-4 bottom-4 border border-gold/20 pointer-events-none" />
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -bottom-8 -right-8 glass-gold p-6 text-center w-36 h-36 flex flex-col items-center justify-center"
            >
              <span className="font-display text-4xl text-gold font-light">4.9</span>
              <div className="flex gap-0.5 my-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-gold text-xs">★</span>
                ))}
              </div>
              <span className="font-body text-xs text-cream/60 tracking-wider uppercase">Rating</span>
            </motion.div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="section-label mb-4">Our Story</div>
            <h2 className="section-title mb-6">
              {title}
              <span className="block italic text-gradient-gold">{subtitle}</span>
            </h2>
            <div className="gold-divider-left" />

            <p className="text-cream/60 leading-relaxed mb-6 whitespace-pre-wrap">
              {p1}
            </p>
            <p className="text-cream/60 leading-relaxed mb-10 whitespace-pre-wrap">
              {p2}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-black/10">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="font-display text-3xl text-gold font-light mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="font-body text-xs text-cream/70 tracking-wider uppercase font-semibold">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
