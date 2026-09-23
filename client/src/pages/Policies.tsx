import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Policies() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-dark pt-32 pb-20">
      <div className="container-luxury max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-sm text-cream/70 hover:text-gold transition-colors font-body tracking-wider uppercase mb-12"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span> 
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 md:p-12"
        >
          <h1 className="font-display text-4xl text-gold mb-8 text-center">Refund & Cancellation Policy</h1>
          <div className="gold-divider mx-auto mb-12" />

          <div className="space-y-8 text-cream/80 font-body leading-relaxed">
            <section>
              <h2 className="text-2xl text-cream font-display mb-4">1. Room Bookings (Stays)</h2>
              <p className="mb-4">We understand that plans can change. For all Glamping Room stays, we offer an automated refund system based on the time of your cancellation relative to your check-in date (12:00 PM local time).</p>
              
              <div className="bg-black/10 p-6 rounded border border-gold/10 space-y-4">
                <div className="flex gap-4">
                  <div className="font-bold text-gold min-w-[120px]">100% Refund</div>
                  <div>If cancelled more than <strong>48 hours</strong> before check-in time.</div>
                </div>
                <div className="h-px bg-gold/10" />
                <div className="flex gap-4">
                  <div className="font-bold text-gold min-w-[120px]">50% Refund</div>
                  <div>If cancelled between <strong>24 and 48 hours</strong> before check-in time.</div>
                </div>
                <div className="h-px bg-gold/10" />
                <div className="flex gap-4">
                  <div className="font-bold text-gold min-w-[120px]">No Refund</div>
                  <div>If cancelled less than <strong>24 hours</strong> before check-in time or in case of a no-show.</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl text-cream font-display mb-4">2. Café Reservations (Dining)</h2>
              <p>Since café table reservations do not require an upfront payment, there are no refund policies applicable. However, as a courtesy to our staff and other guests, we request that you cancel your reservation at least 2 hours in advance if your plans change.</p>
            </section>

            <section>
              <h2 className="text-2xl text-cream font-display mb-4">3. Refund Processing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Eligible refunds are processed instantly via Razorpay when you cancel your booking through the "Find Booking" page on our website.</li>
                <li>Please allow 5-7 business days for the refunded amount to reflect in your original payment method (Bank Account, Credit Card, or UPI).</li>
                <li>Refunds are calculated based on the total amount paid at the time of booking.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl text-cream font-display mb-4">4. Force Majeure</h2>
              <p>In the event of natural disasters, government travel restrictions, or other unforeseen circumstances completely out of our control, Café Belmirah reserves the right to issue a full refund or provide credit for a future stay, evaluated on a case-by-case basis.</p>
            </section>

            <div className="mt-12 pt-8 border-t border-gold/20 text-center">
              <p className="text-sm text-cream/50">If you have any questions about this policy, please <button onClick={() => navigate('/#contact')} className="text-gold hover:underline">contact us</button>.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
