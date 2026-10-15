import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTestimonials, submitPublicTestimonial, fetchStory, getCachedData, setCachedData } from '../../lib/api';
import { testimonials as initialTestimonials } from '../../data/experiences';
import toast from 'react-hot-toast';

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [testimonials, setTestimonials] = useState<any[]>(() => getCachedData('testimonials', initialTestimonials));
  const [story, setStory] = useState<any>(null);
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', role: '', content: '', rating: '5' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTestimonials().then((data) => {
      if (data && data.length > 0) {
        setTestimonials(data);
        setCachedData('testimonials', data);
      }
    }).catch(console.error);
    
    fetchStory().then((res) => {
      if (res && res.data) setStory(res.data);
    }).catch(console.error);
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitPublicTestimonial({ ...reviewForm, rating: Number(reviewForm.rating) });
      toast.success('Review submitted! It will appear after approval.');
      setShowReviewModal(false);
      setReviewForm({ name: '', role: '', content: '', rating: '5' });
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prev = () => setCurrent(c => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent(c => (c + 1) % testimonials.length);

  const t = testimonials.length > 0 ? testimonials[current] : null;

  return (
    <section id="testimonials" className="section-padding bg-dark relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Decorative quotes */}
      <div className="absolute top-8 left-8 font-display text-[200px] text-gold/3 leading-none select-none pointer-events-none">"</div>
      <div className="absolute bottom-8 right-8 font-display text-[200px] text-gold/3 leading-none select-none pointer-events-none rotate-180">"</div>

      <div className="container-luxury relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label justify-center mb-4"
          >
            Testimonials
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-title mb-4"
          >
            Stories from Our
            <span className="block italic text-gradient-gold">Beloved Guests</span>
          </motion.h2>
          <div className="gold-divider" />
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={t ? t.id : 'loading'}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="glass-gold p-8 md:p-12 text-center relative"
            >
              {t ? (
                <>
                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(t.rating)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className="text-gold text-xl"
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>

                  {/* Review */}
                  <blockquote className="font-display text-xl md:text-2xl text-cream/90 italic leading-relaxed mb-8">
                    "{t.content || t.review}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-dark flex items-center justify-center text-xl border-2 border-gold/30 uppercase text-gold">
                      {t.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-body font-semibold text-cream">{t.name}</div>
                      <div className="font-body text-xs text-cream/50">{t.role || t.location || t.stayType}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-cream/50">Loading testimonials...</div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 glass flex items-center justify-center text-cream/60 hover:text-gold hover:border-gold/40 transition-all duration-300 border border-black/10"
            >
              ←
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-300 ${
                    i === current ? 'w-8 h-1.5 bg-gold' : 'w-1.5 h-1.5 bg-black/20 hover:bg-black/40 rounded-full'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 glass flex items-center justify-center text-cream/60 hover:text-gold hover:border-gold/40 transition-all duration-300 border border-black/10"
            >
              →
            </button>
          </div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-12 border-t border-black/5"
        >
          {(() => {
            const avgRating = testimonials.length > 0 
              ? (testimonials.reduce((sum, t) => sum + Number(t.rating), 0) / testimonials.length).toFixed(1) 
              : '4.9';
            
            const wouldReturn = testimonials.length > 0
              ? Math.round((testimonials.filter(t => Number(t.rating) >= 4).length / testimonials.length) * 100)
              : 98;
              
            const happyGuests = story?.stats?.happyGuests || 500;

            return [
              { value: `${avgRating}/5`, label: 'Average Rating' },
              { value: `${happyGuests}+`, label: 'Happy Guests' },
              { value: `${wouldReturn}%`, label: 'Would Return' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl text-gold mb-1">{stat.value}</div>
                <div className="font-body text-[10px] uppercase tracking-widest text-cream/40">{stat.label}</div>
              </div>
            ));
          })()}
          <div className="flex justify-center mt-12 col-span-3">
            <button 
              onClick={() => setShowReviewModal(true)} 
              className="btn-outline-gold px-8 py-3 text-sm tracking-wider uppercase"
            >
              Leave a Review
            </button>
          </div>
        </motion.div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark text-cream shadow-2xl rounded p-8 max-w-md w-full relative border border-black/10"
            >
              <button 
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 text-cream/50 hover:text-gold"
              >
                ✕
              </button>
              <h3 className="font-display text-2xl text-gold mb-6 text-center">Share Your Experience</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <input required placeholder="Your Name" value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} className="luxury-input w-full" />
                <input placeholder="Where are you from?" value={reviewForm.role} onChange={e => setReviewForm({...reviewForm, role: e.target.value})} className="luxury-input w-full" />
                <textarea required placeholder="Write your review here..." value={reviewForm.content} onChange={e => setReviewForm({...reviewForm, content: e.target.value})} className="luxury-input w-full min-h-[120px] resize-y" />
                <div className="flex items-center gap-4 py-2">
                  <span className="text-sm text-cream/70">Rating</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({...reviewForm, rating: star.toString()})}
                        className={`text-2xl transition-colors ${Number(reviewForm.rating) >= star ? 'text-gold' : 'text-cream/20 hover:text-gold/50'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gold ml-auto">({reviewForm.rating}) {Number(reviewForm.rating) === 5 ? '⭐⭐⭐⭐⭐' : ''}</span>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-gold w-full py-4 mt-2">
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
