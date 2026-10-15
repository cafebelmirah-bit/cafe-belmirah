import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import type { BookingForm, ReservationForm } from '../../types';
import { fetchRooms, checkAvailability, submitBooking, submitReservation, formatWhatsAppNumber, getCachedData, setCachedData } from '../../lib/api';
import { rooms as initialRooms } from '../../data/rooms';
import toast from 'react-hot-toast';
import { useSiteContent } from '../../context/SiteContentContext';
import { FaWhatsapp } from 'react-icons/fa';
import { Plus, Minus } from 'lucide-react';

const timeSlots = ['12:00 PM', '1:00 PM', '2:00 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];
const occasions = ['None', 'Anniversary', 'Birthday', 'Honeymoon', 'Business Dinner', 'Proposal', 'Other'];

// Child pricing: age 12+ pays full (counted as adults), 5-11 pays this fraction of the adult rate, under 5 stays free.
const CHILD_HALF_RATE = 0.5;

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
  const [kidsHalf, setKidsHalf] = useState(0); // 5-11 yrs, half price
  const [kidsFree, setKidsFree] = useState(0); // under 5 yrs, free
  const totalChildren = kidsHalf + kidsFree;
  // Only children aged 5-11 take up one of the room's guest places; under-5s are free and not counted.
  const children = kidsHalf;
  const [dynamicRooms, setDynamicRooms] = useState<any[]>(() => getCachedData('rooms', initialRooms));
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const { content } = useSiteContent();

  useEffect(() => {
    fetchRooms().then(data => {
      if (data && data.length > 0) {
        setDynamicRooms(data);
        setCachedData('rooms', data);
      }
    }).catch(console.error);
  }, []);
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<BookingForm>();
  
  const watchRoomType = watch('roomType');
  const watchCheckIn = watch('checkIn');
  const watchCheckOut = watch('checkOut');

  const selectedRoom = dynamicRooms.find(r => r.name === watchRoomType);
  const isScenic = selectedRoom ? selectedRoom.name.toLowerCase().includes('scenic') : false;
  // Scenic Room: 1 King bed, allows up to 3 adults OR up to 4 total guests with extra foam mattress
  const maxAdultsAllowed = isScenic ? 3 : (selectedRoom ? selectedRoom.capacity : 6);
  const maxCombinedOccupants = isScenic ? 4 : (selectedRoom ? selectedRoom.capacity : 6);

  useEffect(() => {
    if (selectedRoom) {
      if (adults > maxAdultsAllowed) {
        setAdults(maxAdultsAllowed);
      }
      if ((adults + kidsHalf + kidsFree) > maxCombinedOccupants) {
        const remaining = Math.max(0, maxCombinedOccupants - adults);
        const half = Math.min(kidsHalf, remaining);
        setKidsHalf(half);
        setKidsFree(Math.min(kidsFree, remaining - half));
      }
    }
  }, [watchRoomType, selectedRoom, adults, kidsHalf, kidsFree, maxAdultsAllowed, maxCombinedOccupants]);

  const calculateTotal = () => {
    if (!watchRoomType || !watchCheckIn || !watchCheckOut) return 0;
    const room = dynamicRooms.find(r => r.name === watchRoomType);
    if (!room) return 0;
    
    const pricePerPerson = room.price || 0;
    // Adults (12+) pay full, children 5-11 pay half, under 5 are free
    const chargeableGuests = Math.max(1, adults) + kidsHalf * CHILD_HALF_RATE;
    
    const start = new Date(watchCheckIn);
    const end = new Date(watchCheckOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    return Math.round(pricePerPerson * chargeableGuests * diffDays);
  };

  const getBeddingSetup = () => {
    if (!selectedRoom) return '';
    if (isScenic) {
      if (adults === 3) {
        return '1 King Bed (2 adults) + 1 Extra Foam Mattress (3rd guest/teen)';
      }
      if (totalChildren >= 2) {
        return '1 King Bed (parents) + 1 Extra Foam Mattress (children)';
      }
      if (kidsHalf === 1) {
        return '1 King Bed (shares with parents) + Extra Foam Mattress available';
      }
      if (kidsFree > 0) {
        return '1 King Bed (shares with parents)';
      }
      return '1 King Size Bed';
    } else {
      return 'Multiple Beds (suitable for up to 6 guests)';
    }
  };

  const describeGuests = () => [
    `${adults} Adult${adults > 1 ? 's' : ''}`,
    kidsHalf > 0 ? `${kidsHalf} Child${kidsHalf > 1 ? 'ren' : ''} (5-11 yrs, half price)` : null,
    kidsFree > 0 ? `${kidsFree} Child${kidsFree > 1 ? 'ren' : ''} (under 5 yrs, free)` : null,
  ].filter(Boolean).join(', ');

  const onBookingSubmit = async (data: BookingForm) => {
    const totalGuests = adults + children;
    if (totalGuests <= 0) {
      toast.error('Please specify at least 1 guest.');
      return;
    }
    if (selectedRoom && (adults + totalChildren) > maxCombinedOccupants) {
      toast.error(`"${selectedRoom.name}" accommodates up to ${maxCombinedOccupants} guests (with extra foam mattress for children / 3rd guest).`);
      return;
    }

    setCheckingAvailability(true);
    try {
      // 1. Verify availability
      await checkAvailability(data.roomType, data.checkIn, data.checkOut, totalGuests);

      // 2. Submit booking to backend database (with graceful fallback so guest is never blocked)
      const specialReq = [
        data.specialRequests,
        `Party: ${describeGuests()}`,
        `Bedding: ${getBeddingSetup()}`
      ].filter(Boolean).join(' | ');

      let refId = `BEL-${Date.now().toString(36).toUpperCase()}`;
      try {
        const res = await submitBooking({
          ...data,
          guests: totalGuests,
          specialRequests: specialReq
        });
        if (res?.data?.referenceId) {
          refId = res.data.referenceId;
        }
      } catch (saveError) {
        console.warn('Backend booking save warning (continuing to WhatsApp):', saveError);
      }
      setSubmittedId(refId);

      // 3. Format owner phone number
      const rawPhone = formatWhatsAppNumber(content.contact_phone);

      const start = new Date(data.checkIn);
      const end = new Date(data.checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      const total = calculateTotal();
      const guestDetails = describeGuests();
      const roomPrice = selectedRoom?.price || 0;
      const rateBreakdown = `(₹${roomPrice.toLocaleString()} × ${adults} adult${adults > 1 ? 's' : ''}`
        + (kidsHalf > 0 ? ` + ₹${Math.round(roomPrice * CHILD_HALF_RATE).toLocaleString()} × ${kidsHalf} child${kidsHalf > 1 ? 'ren' : ''} (5-11 yrs)` : '')
        + (kidsFree > 0 ? `, ${kidsFree} under 5 free` : '')
        + (diffDays > 1 ? ` × ${diffDays} nights` : '')
        + ')';

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
👥 *Guests:* ${guestDetails} (Total: ${adults + totalChildren})
🛏️ *Bedding Setup:* ${getBeddingSetup()}
💰 *Estimated Total:* ₹${total.toLocaleString()} ${rateBreakdown}
📝 *Special Requests:* ${data.specialRequests || 'None'}`;

      const waLink = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
      setWhatsappUrl(waLink);

      toast.success('Opening WhatsApp with your booking details...');

      // Direct WhatsApp dispatch (prevents popup blockers on iOS/Android & desktop)
      const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = waLink;
      } else {
        const opened = window.open(waLink, '_blank');
        if (!opened || opened.closed || typeof opened.closed === 'undefined') {
          window.location.href = waLink;
        }
      }
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

      <div>
        <label className="block font-body text-xs text-cream/70 tracking-wider uppercase mb-2">
          Guests & Occupancy
        </label>
        <div className="rounded-xl border border-black/10 bg-white/80 shadow-sm divide-y divide-black/[0.08] overflow-hidden">
          {/* Adults (12+ yrs) */}
          <div className="p-4 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors">
            <div>
              <div className="font-body text-sm font-semibold text-neutral-900">Adults</div>
              <div className="font-body text-xs text-neutral-500">Age 12+ · Full price</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdults(a => Math.max(1, a - 1))}
                disabled={adults <= 1}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  adults <= 1
                    ? 'border border-neutral-300 text-neutral-300 cursor-not-allowed'
                    : 'border border-neutral-500 text-neutral-800 hover:border-gold hover:text-gold-dark hover:bg-gold/10 active:scale-95'
                }`}
                aria-label="Decrease adults"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>
              <span className="w-8 text-center font-body text-base font-bold text-neutral-900">
                {adults}
              </span>
              <button
                type="button"
                onClick={() => setAdults(a => Math.min(Math.min(maxAdultsAllowed, maxCombinedOccupants - kidsHalf - kidsFree), a + 1))}
                disabled={adults >= maxAdultsAllowed || (adults + kidsHalf + kidsFree) >= maxCombinedOccupants}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  adults >= maxAdultsAllowed || (adults + kidsHalf + kidsFree) >= maxCombinedOccupants
                    ? 'border border-neutral-300 text-neutral-300 cursor-not-allowed'
                    : 'border border-neutral-500 text-neutral-800 hover:border-gold hover:text-gold-dark hover:bg-gold/10 active:scale-95'
                }`}
                aria-label="Increase adults"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Children (5-11 yrs) */}
          <div className="p-4 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors">
            <div>
              <div className="font-body text-sm font-semibold text-neutral-900">Children</div>
              <div className="font-body text-xs text-neutral-500">Age 5–11 yrs · Half price (50%)</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setKidsHalf(c => Math.max(0, c - 1))}
                disabled={kidsHalf <= 0}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  kidsHalf <= 0
                    ? 'border border-neutral-300 text-neutral-300 cursor-not-allowed'
                    : 'border border-neutral-500 text-neutral-800 hover:border-gold hover:text-gold-dark hover:bg-gold/10 active:scale-95'
                }`}
                aria-label="Decrease children"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>
              <span className="w-8 text-center font-body text-base font-bold text-neutral-900">
                {kidsHalf}
              </span>
              <button
                type="button"
                onClick={() => setKidsHalf(c => Math.min(Math.max(0, maxCombinedOccupants - adults - kidsFree), c + 1))}
                disabled={(adults + kidsHalf + kidsFree) >= maxCombinedOccupants}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  (adults + kidsHalf + kidsFree) >= maxCombinedOccupants
                    ? 'border border-neutral-300 text-neutral-300 cursor-not-allowed'
                    : 'border border-neutral-500 text-neutral-800 hover:border-gold hover:text-gold-dark hover:bg-gold/10 active:scale-95'
                }`}
                aria-label="Increase children"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Infants (Under 5 yrs) */}
          <div className="p-4 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors">
            <div>
              <div className="font-body text-sm font-semibold text-neutral-900">Infants / Toddlers</div>
              <div className="font-body text-xs text-neutral-500">Under 5 yrs · Free</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setKidsFree(c => Math.max(0, c - 1))}
                disabled={kidsFree <= 0}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  kidsFree <= 0
                    ? 'border border-neutral-300 text-neutral-300 cursor-not-allowed'
                    : 'border border-neutral-500 text-neutral-800 hover:border-gold hover:text-gold-dark hover:bg-gold/10 active:scale-95'
                }`}
                aria-label="Decrease infants"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>
              <span className="w-8 text-center font-body text-base font-bold text-neutral-900">
                {kidsFree}
              </span>
              <button
                type="button"
                onClick={() => setKidsFree(c => Math.min(Math.max(0, maxCombinedOccupants - adults - kidsHalf), c + 1))}
                disabled={(adults + kidsHalf + kidsFree) >= maxCombinedOccupants}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  (adults + kidsHalf + kidsFree) >= maxCombinedOccupants
                    ? 'border border-neutral-300 text-neutral-300 cursor-not-allowed'
                    : 'border border-neutral-500 text-neutral-800 hover:border-gold hover:text-gold-dark hover:bg-gold/10 active:scale-95'
                }`}
                aria-label="Increase infants"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
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
              {watchRoomType} ({adults + totalChildren} {adults + totalChildren > 1 ? 'guests' : 'guest'}
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

      toast.success('Opening WhatsApp with your reservation details...');

      const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = waLink;
      } else {
        const opened = window.open(waLink, '_blank');
        if (!opened || opened.closed || typeof opened.closed === 'undefined') {
          window.location.href = waLink;
        }
      }
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
