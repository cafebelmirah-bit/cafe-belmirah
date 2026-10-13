import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import type { BookingForm, ReservationForm } from '../../types';
import { fetchRooms, checkAvailability, submitBooking, submitReservation } from '../../lib/api';
import toast from 'react-hot-toast';
import { useSiteContent } from '../../context/SiteContentContext';
import { FaWhatsapp } from 'react-icons/fa';

const timeSlots = ['12:00 PM', '1:00 PM', '2:00 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];
const occasions = ['None', 'Anniversary', 'Birthday', 'Honeymoon', 'Business Dinner', 'Proposal', 'Other'];

function SuccessMessage({ type, referenceId, whatsappUrl }: { type: 'booking' | 'reservation', referenceId: string, whatsappUrl?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="text-6xl mb-4">{type === 'booking' ? '🏕️' : '🍽️'}</div>
      <h3 className="font-display text-3xl text-cream mb-2">
        {type === 'booking' ? 'Booking Request Sent!' : 'Table Reservation Sent!'}
      </h3>
      <p className="text-cream/50 mb-6">
        {type === 'booking' 
          ? 'Your stay booking request has been submitted and forwarded to our team via WhatsApp!'
          : 'Your table reservation request has been received and forwarded to our team via WhatsApp!'}
      </p>
      <div className="bg-black/5 p-4 rounded-lg inline-block text-left mb-6">
        <span className="block text-xs uppercase tracking-wider text-gold mb-1">Your Reference ID</span>
        <span className="font-mono text-xl text-cream tracking-widest">{referenceId}</span>
      </div>
      <p className="text-sm text-cream/40 mb-6">
        Our team will confirm your reservation shortly. You can use this Reference ID to track your status.
      </p>
      <div className="glass-gold inline-block px-6 py-3 mb-6">
        <p className="text-gold text-sm">
          Details sent to Café Belmirah on WhatsApp.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
  );
}

function BookingTab() {
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [dynamicRooms, setDynamicRooms] = useState<any[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const { content } = useSiteContent();

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
    if (selectedRoom && (adults + children) > selectedRoom.capacity) {
      if (adults > selectedRoom.capacity) {
        setAdults(selectedRoom.capacity);
        setChildren(0);
      } else {
        setChildren(selectedRoom.capacity - adults);
      }
    }
  }, [watchRoomType, selectedRoom, adults, children]);

  const calculateTotal = () => {
    if (!watchRoomType || !watchCheckIn || !watchCheckOut) return 0;
    const room = dynamicRooms.find(r => r.name === watchRoomType);
    if (!room) return 0;
    
    const pricePerPerson = room.price || 0;
    const totalGuests = Math.max(1, adults + children);
    
    const start = new Date(watchCheckIn);
    const end = new Date(watchCheckOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    return pricePerPerson * totalGuests * diffDays;
  };

  const onBookingSubmit = async (data: BookingForm) => {
    const totalGuests = adults + children;
    if (totalGuests <= 0) {
      toast.error('Please specify at least 1 guest.');
      return;
    }
    if (selectedRoom && totalGuests > selectedRoom.capacity) {
      toast.error(`This property accommodates up to ${selectedRoom.capacity} guests.`);
      return;
    }

    setCheckingAvailability(true);
    try {
      // 1. Verify availability
      await checkAvailability(data.roomType, data.checkIn, data.checkOut, totalGuests);

      // 2. Submit booking to backend database
      const specialReq = [
        data.specialRequests,
        children > 0 ? `Party: ${adults} Adults, ${children} Children` : null
      ].filter(Boolean).join(' | ');

      const res = await submitBooking({
        ...data,
        guests: totalGuests,
        specialRequests: specialReq
      });

      const refId = res.data?.referenceId || `BEL-${Date.now().toString(36).toUpperCase()}`;
      setSubmittedId(refId);

      // 3. Format owner phone number
      let rawPhone = (content.contact_phone || '9511896490').replace(/[^0-9]/g, '');
      if (rawPhone.length === 10) {
        rawPhone = '91' + rawPhone;
      }

      const start = new Date(data.checkIn);
      const end = new Date(data.checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      const total = calculateTotal();
      const guestDetails = `${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}`;
      const roomPrice = selectedRoom?.price || 0;
      const rateBreakdown = diffDays > 1
        ? `(₹${roomPrice.toLocaleString()}/person × ${totalGuests} guests × ${diffDays} nights)`
        : `(₹${roomPrice.toLocaleString()}/person × ${totalGuests} guests)`;

      // 4. Format WhatsApp message
      const message = 
`🏕️ *New Stay Booking Request — Café Belmirah*

🔖 *Reference ID:* ${refId}
👤 *Name:* ${data.name}
📱 *Phone:* ${data.phone}
✉️ *Email:* ${data.email}
🏡 *Room Type:* ${data.roomType}
📅 *Check-In:* ${data.checkIn}
📅 *Check-Out:* ${data.checkOut}${diffDays > 1 ? ` (${diffDays} nights)` : ''}
👥 *Guests:* ${guestDetails} (Total: ${totalGuests})
💰 *Estimated Total:* ₹${total.toLocaleString()} ${rateBreakdown}
📝 *Special Requests:* ${data.specialRequests || 'None'}`;

      const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
      setWhatsappUrl(waLink);

      toast.success('Booking submitted! Forwarding to WhatsApp...');
      window.open(waLink, '_blank');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit booking. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  if (submittedId) return <SuccessMessage type="booking" referenceId={submittedId} whatsappUrl={whatsappUrl || undefined} />;

  return (
    <form onSubmit={handleSubmit(onBookingSubmit)} className="space-y-6">
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
              <option key={r.id} value={r.name}>{r.name} — ₹{r.price}/person (Max {r.capacity} guests)</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Check-In</label>
          <input {...register('checkIn', { required: true })} className="luxury-input" type="date" min={new Date().toISOString().split('T')[0]} />
        </div>
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Check-Out</label>
          <input {...register('checkOut', { required: true })} className="luxury-input" type="date" min={watchCheckIn || new Date().toISOString().split('T')[0]} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Adults (12+ yrs)</label>
          <div className="flex items-center gap-3 luxury-input">
            <button type="button" onClick={() => setAdults(a => Math.max(1, a - 1))} className="text-gold text-lg w-6 text-center">−</button>
            <span className="flex-1 text-center text-cream">{adults} Adult{adults > 1 ? 's' : ''}</span>
            <button type="button" onClick={() => setAdults(a => Math.min(Math.max(1, maxGuests - children), a + 1))} className="text-gold text-lg w-6 text-center">+</button>
          </div>
        </div>
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Children (under 12 yrs)</label>
          <div className="flex items-center gap-3 luxury-input">
            <button type="button" onClick={() => setChildren(c => Math.max(0, c - 1))} className="text-gold text-lg w-6 text-center">−</button>
            <span className="flex-1 text-center text-cream">{children} Child{children !== 1 ? 'ren' : ''}</span>
            <button type="button" onClick={() => setChildren(c => Math.min(Math.max(0, maxGuests - adults), c + 1))} className="text-gold text-lg w-6 text-center">+</button>
          </div>
        </div>
      </div>

      <div>
        <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Special Requests</label>
        <textarea
          {...register('specialRequests')}
          className="luxury-input resize-none"
          rows={3}
          placeholder="Anniversary setup, dietary requirements, early check-in, extra bed..."
        />
      </div>

      {calculateTotal() > 0 && (
        <div className="bg-black/20 p-4 rounded-lg border border-gold/20 flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-wider text-cream/50 block">Estimated Amount</span>
            <span className="text-sm text-cream/80">
              {watchRoomType} ({adults + children} {adults + children > 1 ? 'guests' : 'guest'}
              {(() => {
                if (!watchCheckIn || !watchCheckOut) return '';
                const start = new Date(watchCheckIn);
                const end = new Date(watchCheckOut);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                return diffDays > 1 ? ` × ${diffDays} nights` : '';
              })()})
            </span>
          </div>
          <span className="font-display text-2xl text-gold">₹{calculateTotal().toLocaleString()}</span>
        </div>
      )}

      <div className="bg-black/20 p-4 rounded-lg border border-black/10 flex items-center gap-3 text-sm text-cream/70">
        <FaWhatsapp size={24} className="text-[#25D366] flex-shrink-0" />
        <span>Your stay booking will be sent directly to our team via WhatsApp for instant confirmation. No upfront payment required.</span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || checkingAvailability}
        className="btn-gold w-full justify-center py-4 inline-flex items-center gap-2"
      >
        {checkingAvailability ? (
          <span className="flex items-center gap-2">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>◌</motion.span>
            Checking Availability...
          </span>
        ) : isSubmitting ? (
          <span className="flex items-center gap-2">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>◌</motion.span>
            Submitting...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <FaWhatsapp size={18} />
            Book Your Stay via WhatsApp
          </span>
        )}
      </button>
    </form>
  );
}

// Table reservation component (dormant, preserved for future reactivation)
export function ReservationTab() {
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const { content } = useSiteContent();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReservationForm>();

  const onReservationSubmit = async (data: ReservationForm) => {
    try {
      const totalGuests = adults + children;
      const res = await submitReservation({ ...data, guests: totalGuests });
      const refId = res.data?.referenceId || `BEL-${Date.now().toString(36).toUpperCase()}`;
      setSubmittedId(refId);

      let rawPhone = (content.contact_phone || '9511896490').replace(/[^0-9]/g, '');
      if (rawPhone.length === 10) rawPhone = '91' + rawPhone;

      const message = 
`🍽️ *New Table Reservation Request — Café Belmirah*

🔖 *Reference ID:* ${refId}
👤 *Name:* ${data.name}
📱 *Phone:* ${data.phone}
✉️ *Email:* ${data.email}
📅 *Date:* ${data.date}
⏰ *Time:* ${data.time}
👥 *Guests:* ${adults} Adults${children > 0 ? `, ${children} Children` : ''} (Total: ${totalGuests})
🎉 *Occasion:* ${data.occasion || 'None'}
📝 *Special Requests:* ${data.specialRequests || 'None'}`;

      const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
      setWhatsappUrl(waLink);

      toast.success('Reservation submitted! Forwarding to WhatsApp...');
      window.open(waLink, '_blank');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit reservation. Please try again.');
    }
  };

  if (submittedId) {
    return <SuccessMessage type="reservation" referenceId={submittedId} whatsappUrl={whatsappUrl || undefined} />;
  }

  return (
    <form onSubmit={handleSubmit(onReservationSubmit)} className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Adults (12+ yrs)</label>
          <div className="flex items-center gap-3 luxury-input">
            <button type="button" onClick={() => setAdults(a => Math.max(1, a - 1))} className="text-gold text-lg w-6 text-center">−</button>
            <span className="flex-1 text-center text-cream">{adults} Adult{adults > 1 ? 's' : ''}</span>
            <button type="button" onClick={() => setAdults(a => Math.min(20, a + 1))} className="text-gold text-lg w-6 text-center">+</button>
          </div>
        </div>
        <div>
          <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Children (under 12 yrs)</label>
          <div className="flex items-center gap-3 luxury-input">
            <button type="button" onClick={() => setChildren(c => Math.max(0, c - 1))} className="text-gold text-lg w-6 text-center">−</button>
            <span className="flex-1 text-center text-cream">{children} Child{children !== 1 ? 'ren' : ''}</span>
            <button type="button" onClick={() => setChildren(c => Math.min(10, c + 1))} className="text-gold text-lg w-6 text-center">+</button>
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

      <div className="bg-black/20 p-4 rounded-lg border border-black/10 flex items-center gap-3 text-sm text-cream/70">
        <FaWhatsapp size={24} className="text-[#25D366] flex-shrink-0" />
        <span>Your table reservation will be sent directly to our team via WhatsApp for instant confirmation. No upfront payment required.</span>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-gold w-full justify-center py-4 inline-flex items-center gap-2">
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>◌</motion.span>
            Submitting...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <FaWhatsapp size={18} />
            Reserve Table via WhatsApp
          </span>
        )}
      </button>
    </form>
  );
}

export default function Booking() {
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
              Book Your Stay
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

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass p-8 md:p-10"
          >
            <BookingTab />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
