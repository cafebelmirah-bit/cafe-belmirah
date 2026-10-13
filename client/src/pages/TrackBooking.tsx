import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { trackBooking, cancelBookingCustomer } from '../lib/api';

export default function TrackBooking() {
  const [result, setResult] = useState<{ bookings: any[], reservations: any[] } | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const res = await trackBooking(data.email, data.referenceId);
      if (res.success) {
        setResult({ bookings: res.bookings, reservations: res.reservations });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to track booking.');
      setResult(null);
    }
  };

  const handleCancelBooking = async (email: string, referenceId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    try {
      const res = await cancelBookingCustomer(email, referenceId);
      if (res.success) {
        toast.success('Booking cancelled successfully.');
        // Refresh the results
        const formValues = { email, referenceId };
        onSubmit(formValues);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'confirmed') return 'bg-green-500/20 text-green-400';
    if (status === 'cancelled') return 'bg-red-500/20 text-red-400';
    return 'bg-yellow-500/20 text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-dark pt-24 pb-12 px-6 flex flex-col items-center justify-center">
      <Link to="/" className="absolute top-8 left-8 text-cream/50 hover:text-gold transition-colors text-sm uppercase tracking-wider font-body">
        ← Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 max-w-lg w-full"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cream mb-2">Track Your Bookings</h1>
          <p className="text-cream/60 text-sm mb-6">Enter your email and ANY of your reference IDs to securely view your entire booking history.</p>
          <div className="gold-divider mx-auto" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Email Address</label>
            <input {...register('email', { required: true })} className="luxury-input w-full" type="email" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Any Reference ID</label>
            <input {...register('referenceId', { required: true })} className="luxury-input w-full font-mono uppercase" placeholder="BEL-XXXXXX" />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-gold w-full justify-center py-3 mt-4">
            {isSubmitting ? 'Searching...' : 'Find Bookings'}
          </button>
        </form>

        {result && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-8 pt-8 border-t border-black/10 space-y-8"
          >
            {result.bookings.length > 0 && (
              <div>
                <h3 className="font-display text-2xl text-gold mb-4">Room Stays</h3>
                <div className="space-y-4">
                  {result.bookings.map((booking: any) => (
                    <div key={booking.id} className="bg-black/5 rounded-lg p-5">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-cream font-bold text-lg">{booking.name}</p>
                          <p className="text-cream/50 text-sm font-mono mt-1">{booking.referenceId}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider font-bold ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mb-6">
                        <div><span className="block text-cream/40 text-xs uppercase mb-1">Room</span><span className="text-cream/90">{booking.roomType.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span></div>
                        <div><span className="block text-cream/40 text-xs uppercase mb-1">Guests</span><span className="text-cream/90">{booking.guests}</span></div>
                        <div><span className="block text-cream/40 text-xs uppercase mb-1">Check In</span><span className="text-cream/90">{new Date(booking.checkIn).toLocaleDateString()}</span></div>
                        <div><span className="block text-cream/40 text-xs uppercase mb-1">Check Out</span><span className="text-cream/90">{new Date(booking.checkOut).toLocaleDateString()}</span></div>
                      </div>

                      {booking.status !== 'cancelled' && (
                        <div className="flex gap-4 pt-4 border-t border-white/5">
                          <button 
                            onClick={() => handleCancelBooking(booking.email, booking.referenceId)}
                            className="flex-1 text-center py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded transition-colors"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.reservations.length > 0 && (
              <div>
                <h3 className="font-display text-2xl text-gold mb-4">Table Reservations</h3>
                <div className="space-y-4">
                  {result.reservations.map((reservation: any) => (
                    <div key={reservation.id} className="bg-black/5 rounded-lg p-5">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-cream font-bold text-lg">{reservation.name}</p>
                          <p className="text-cream/50 text-sm font-mono mt-1">{reservation.referenceId}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider font-bold ${getStatusBadge(reservation.status)}`}>
                          {reservation.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mb-6">
                        <div><span className="block text-cream/40 text-xs uppercase mb-1">Date</span><span className="text-cream/90">{new Date(reservation.date).toLocaleDateString()}</span></div>
                        <div><span className="block text-cream/40 text-xs uppercase mb-1">Time</span><span className="text-cream/90">{reservation.time}</span></div>
                        <div><span className="block text-cream/40 text-xs uppercase mb-1">Guests</span><span className="text-cream/90">{reservation.guests}</span></div>
                        <div><span className="block text-cream/40 text-xs uppercase mb-1">Occasion</span><span className="text-cream/90">{reservation.occasion || 'None'}</span></div>
                      </div>


                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {result.bookings.length === 0 && result.reservations.length === 0 && (
               <p className="text-cream/50">No bookings found.</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
