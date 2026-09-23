import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import type { BookingForm, ReservationForm } from '../../types';
import { fetchRooms, checkAvailability, api, API_URL } from '../../lib/api';
import toast from 'react-hot-toast';

// Utility to load Razorpay script dynamically
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


const timeSlots = ['12:00 PM', '1:00 PM', '2:00 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];
const occasions = ['None', 'Anniversary', 'Birthday', 'Honeymoon', 'Business Dinner', 'Proposal', 'Other'];

function SuccessMessage({ type, referenceId }: { type: 'booking' | 'reservation', referenceId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="text-6xl mb-4">{type === 'booking' ? '🏕️' : '🍽️'}</div>
      <h3 className="font-display text-3xl text-cream mb-2">
        {type === 'booking' ? 'Booking Confirmed!' : 'Table Reserved!'}
      </h3>
      <p className="text-cream/50 mb-6">
        Your {type === 'booking' ? 'stay' : 'table reservation'} has been instantly confirmed! We have sent the details to your email.
      </p>
      <div className="bg-black/5 p-4 rounded-lg inline-block text-left mb-6">
        <span className="block text-xs uppercase tracking-wider text-gold mb-1">Your Reference ID</span>
        <span className="font-mono text-xl text-cream tracking-widest">{referenceId}</span>
      </div>
      <p className="text-sm text-cream/40">You can use this Reference ID to track your booking status.</p>
      <div className="glass-gold inline-block px-6 py-3 mb-6">
        <p className="text-gold text-sm">A confirmation email has been sent to your inbox.</p>
      </div>
      <div>
        <a 
          href={`${API_URL}/invoice/${referenceId}/download.pdf`} 
          target="_blank" 
          rel="noreferrer"
          className="btn-gold inline-flex items-center gap-2"
        >
          Download PDF Invoice
        </a>
      </div>
    </motion.div>
  );
}

function BookingTab() {
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [step, setStep] = useState<1 | 2>(1);
  const [bookingData, setBookingData] = useState<BookingForm | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'advance'>('full');
  const [dynamicRooms, setDynamicRooms] = useState<any[]>([]);

  useEffect(() => {
    fetchRooms().then(data => setDynamicRooms(data)).catch(console.error);
  }, []);
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<BookingForm>();
  
  const watchRoomType = watch('roomType');
  const watchCheckIn = watch('checkIn');
  const watchCheckOut = watch('checkOut');

  const selectedRoom = dynamicRooms.find(r => r.name === watchRoomType);
  const maxGuests = selectedRoom ? selectedRoom.capacity : 8;

  useEffect(() => {
    if (selectedRoom && guests > selectedRoom.capacity) {
      setGuests(selectedRoom.capacity);
    }
  }, [watchRoomType, selectedRoom, guests]);

  const calculateTotal = () => {
    if (!watchRoomType || !watchCheckIn || !watchCheckOut) return 0;
    const room = dynamicRooms.find(r => r.name === watchRoomType);
    if (!room) return 0;
    
    const pricePerNight = room.price || 0;
    
    const start = new Date(watchCheckIn);
    const end = new Date(watchCheckOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return pricePerNight * (diffDays || 1); // at least 1 night
  };

  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const onStep1Submit = async (data: BookingForm) => {
    setCheckingAvailability(true);
    try {
      await checkAvailability(data.roomType, data.checkIn, data.checkOut, guests);
      setBookingData(data);
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'This property is fully booked for the selected dates.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const onPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData) return;
    
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const total = calculateTotal();
      const amountToPay = paymentMethod === 'full' ? total : total * 0.3;
      
      const { data: { order } } = await api.post('/payment/create-order', {
        amount: amountToPay,
        receipt: `receipt_booking_${Date.now()}`
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
        amount: order.amount,
        currency: order.currency,
        name: 'Café Belmirah',
        description: 'Stay Booking',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/payment/verify', {
              ...response,
              bookingData: { ...bookingData, guests },
              type: 'booking'
            });
            if (verifyRes.data.success) {
              setSubmittedId(verifyRes.data.referenceId);
              toast.success('Booking requested successfully! Check your email.');
            }
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: bookingData.name,
          email: bookingData.email,
          contact: bookingData.phone,
        },
        theme: {
          color: '#C9A84C'
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp1.open();

    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to initiate payment.');
    }
  };

  if (submittedId) return <SuccessMessage type="booking" referenceId={submittedId} />;

  if (step === 2) {
    const total = calculateTotal();
    const amountToPay = paymentMethod === 'full' ? total : total * 0.3; // 30% advance
    
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <button onClick={() => setStep(1)} className="text-gold text-sm uppercase tracking-wider mb-4 hover:text-cream transition-colors">← Back to Details</button>
        <h3 className="font-display text-2xl text-cream mb-6">Complete Payment</h3>
        
        <div className="bg-black/20 p-6 rounded-lg border border-black/10 mb-6">
          <h4 className="text-gold font-body uppercase tracking-wider text-xs mb-4">Booking Summary</h4>
          <div className="space-y-2 text-sm text-cream/80">
            <div className="flex justify-between"><span>Room:</span> <span>{watchRoomType}</span></div>
            <div className="flex justify-between"><span>Dates:</span> <span>{watchCheckIn} to {watchCheckOut}</span></div>
            <div className="flex justify-between font-bold pt-2 border-t border-black/10 mt-2"><span>Total Amount:</span> <span>₹{total.toLocaleString()}</span></div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <label className="flex items-center gap-3 cursor-pointer p-4 border border-black/10 rounded-lg hover:bg-black/10 transition-colors">
            <input type="radio" name="payment" checked={paymentMethod === 'full'} onChange={() => setPaymentMethod('full')} className="accent-gold" />
            <div>
              <p className="text-cream font-bold">Pay Full Amount</p>
              <p className="text-cream/50 text-xs">₹{total.toLocaleString()}</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-4 border border-black/10 rounded-lg hover:bg-black/10 transition-colors">
            <input type="radio" name="payment" checked={paymentMethod === 'advance'} onChange={() => setPaymentMethod('advance')} className="accent-gold" />
            <div>
              <p className="text-cream font-bold">Pay 30% Advance</p>
              <p className="text-cream/50 text-xs">₹{(total * 0.3).toLocaleString()} (Pay remaining at property)</p>
            </div>
          </label>
        </div>

        <form onSubmit={onPaymentSubmit} className="space-y-6">
          <div className="bg-black/20 p-6 rounded-lg border border-black/10">
            <h4 className="text-gold font-body uppercase tracking-wider text-xs mb-4">Secure Payment Info</h4>
            <p className="text-sm text-cream/70 mb-4">You will be redirected to Razorpay's secure checkout window to complete your transaction via UPI, Cards, or NetBanking.</p>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-gold w-full py-4">
            {isSubmitting ? 'Processing...' : `Pay ₹${amountToPay.toLocaleString()} & Confirm`}
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Full Name</label>
          <input {...register('name', { required: true })} className="luxury-input" placeholder="Your full name" />
          {errors.name && <p className="text-red-400 text-xs mt-1">Name is required</p>}
        </div>
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Email</label>
          <input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} className="luxury-input" placeholder="your@email.com" type="email" />
          {errors.email && <p className="text-red-400 text-xs mt-1">Valid email required</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Phone</label>
          <input {...register('phone', { required: true })} className="luxury-input" placeholder="+91 98765 43210" type="tel" />
        </div>
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Room Type</label>
          <select {...register('roomType', { required: true })} className="luxury-input">
            <option value="">Select a room...</option>
            {dynamicRooms.map(r => (
              <option key={r.id} value={r.name}>{r.name} — ₹{r.price}/night</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Check-In</label>
          <input {...register('checkIn', { required: true })} className="luxury-input" type="date" min={new Date().toISOString().split('T')[0]} />
        </div>
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Check-Out</label>
          <input {...register('checkOut', { required: true })} className="luxury-input" type="date" min={new Date().toISOString().split('T')[0]} />
        </div>
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Guests</label>
          <div className="flex items-center gap-3 luxury-input">
            <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))} className="text-gold text-lg w-6 text-center">−</button>
            <span className="flex-1 text-center text-cream">{guests} Guest{guests > 1 ? 's' : ''}</span>
            <button type="button" onClick={() => setGuests(g => Math.min(maxGuests, g + 1))} className="text-gold text-lg w-6 text-center">+</button>
          </div>
        </div>
      </div>

      <div>
        <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Special Requests</label>
        <textarea
          {...register('specialRequests')}
          className="luxury-input resize-none"
          rows={3}
          placeholder="Anniversary setup, dietary requirements, early check-in..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || checkingAvailability}
        className="btn-gold w-full justify-center py-4"
      >
        {checkingAvailability ? (
          <span className="flex items-center gap-2">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>◌</motion.span>
            Checking Availability...
          </span>
        ) : isSubmitting ? (
          <span className="flex items-center gap-2">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>◌</motion.span>
            Processing...
          </span>
        ) : 'Proceed to Payment →'}
      </button>
    </form>
  );
}

function ReservationTab() {
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [step, setStep] = useState<1 | 2>(1);
  const [reservationData, setReservationData] = useState<ReservationForm | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ReservationForm>();

  const onStep1Submit = (data: ReservationForm) => {
    setReservationData(data);
    setStep(2);
  };

  const onPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationData) return;
    
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const reservationFee = 500 * guests;
      
      const { data: { order } } = await api.post('/payment/create-order', {
        amount: reservationFee,
        receipt: `receipt_res_${Date.now()}`
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
        amount: order.amount,
        currency: order.currency,
        name: 'Café Belmirah',
        description: 'Table Reservation',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/payment/verify', {
              ...response,
              bookingData: { ...reservationData, guests },
              type: 'reservation'
            });
            if (verifyRes.data.success) {
              setSubmittedId(verifyRes.data.referenceId);
              toast.success('Table reserved successfully! Check your email.');
            }
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: reservationData.name,
          email: reservationData.email,
          contact: reservationData.phone,
        },
        theme: {
          color: '#C9A84C'
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp1.open();

    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to initiate payment.');
    }
  };

  if (submittedId) return <SuccessMessage type="reservation" referenceId={submittedId} />;

  if (step === 2) {
    const reservationFee = 500 * guests; // Fake reservation fee calculation
    
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <button onClick={() => setStep(1)} className="text-gold text-sm uppercase tracking-wider mb-4 hover:text-cream transition-colors">← Back to Details</button>
        <h3 className="font-display text-2xl text-cream mb-6">Complete Reservation Payment</h3>
        
        <div className="bg-black/20 p-6 rounded-lg border border-black/10 mb-6">
          <h4 className="text-gold font-body uppercase tracking-wider text-xs mb-4">Reservation Summary</h4>
          <div className="space-y-2 text-sm text-cream/80">
            <div className="flex justify-between"><span>Date & Time:</span> <span>{watch('date')} at {watch('time')}</span></div>
            <div className="flex justify-between"><span>Guests:</span> <span>{guests}</span></div>
            <div className="flex justify-between font-bold pt-2 border-t border-black/10 mt-2"><span>Reservation Fee (₹500/guest):</span> <span>₹{reservationFee.toLocaleString()}</span></div>
          </div>
          <p className="text-xs text-cream/50 mt-4 italic">This amount will be deducted from your final bill.</p>
        </div>

        <form onSubmit={onPaymentSubmit} className="space-y-6">
          <div className="bg-black/20 p-6 rounded-lg border border-black/10">
            <h4 className="text-gold font-body uppercase tracking-wider text-xs mb-4">Secure Payment Info</h4>
            <p className="text-sm text-cream/70 mb-4">You will be redirected to Razorpay's secure checkout window to complete your transaction via UPI, Cards, or NetBanking.</p>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-gold w-full py-4">
            {isSubmitting ? 'Processing...' : `Pay ₹${reservationFee.toLocaleString()} & Confirm`}
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Full Name</label>
          <input {...register('name', { required: true })} className="luxury-input" placeholder="Your full name" />
          {errors.name && <p className="text-red-400 text-xs mt-1">Name is required</p>}
        </div>
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Email</label>
          <input {...register('email', { required: true })} className="luxury-input" placeholder="your@email.com" type="email" />
        </div>
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Phone</label>
          <input {...register('phone', { required: true })} className="luxury-input" placeholder="+91 98765 43210" type="tel" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Date</label>
          <input {...register('date', { required: true })} className="luxury-input" type="date" min={new Date().toISOString().split('T')[0]} />
        </div>
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Time</label>
          <select {...register('time', { required: true })} className="luxury-input">
            <option value="">Select time...</option>
            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Guests</label>
          <div className="flex items-center gap-3 luxury-input">
            <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))} className="text-gold text-lg w-6 text-center">−</button>
            <span className="flex-1 text-center text-cream">{guests} Guest{guests > 1 ? 's' : ''}</span>
            <button type="button" onClick={() => setGuests(g => Math.min(20, g + 1))} className="text-gold text-lg w-6 text-center">+</button>
          </div>
        </div>
      </div>

      <div>
        <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Occasion</label>
        <select {...register('occasion')} className="luxury-input">
          {occasions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Special Requests</label>
        <textarea {...register('specialRequests')} className="luxury-input resize-none" rows={3} placeholder="Dietary requirements, decoration, seating preference..." />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-gold w-full justify-center py-4">
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>◌</motion.span>
            Processing...
          </span>
        ) : 'Reserve My Table'}
      </button>
    </form>
  );
}

export default function Booking() {
  const [activeTab, setActiveTab] = useState<'booking' | 'reservation'>('booking');
  const [resetKey, setResetKey] = useState(0);

  return (
    <section id="booking" className="section-padding bg-dark-100 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=30)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.04,
        }}
      />

      <div className="container-luxury relative">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-label justify-center mb-4"
            >
              Reservations
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="section-title mb-4"
            >
              Begin Your
              <span className="block italic text-gradient-gold">Belmirah Journey</span>
            </motion.h2>
            <div className="gold-divider" />
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-8 border border-black/10">
            {[
              { id: 'booking' as const, label: 'Book Your Stay' },
              // { id: 'reservation' as const, label: 'Reserve a Table' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (activeTab === tab.id) {
                    setResetKey(prev => prev + 1);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex-1 py-4 text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gold text-dark'
                    : 'text-cream/50 hover:text-cream/80 hover:bg-black/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <motion.div
            key={`${activeTab}-${resetKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass p-8 md:p-10"
          >
            {activeTab === 'booking' ? <BookingTab /> : <ReservationTab />}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
