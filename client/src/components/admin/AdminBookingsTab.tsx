import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchBookings, fetchReservations, updateBookingStatus, updateReservationStatus, deleteBooking, deleteReservation } from '../../lib/api';

export default function AdminBookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [b, r] = await Promise.all([fetchBookings(), fetchReservations()]);
      setBookings(b);
      setReservations(r);
    } catch (error) {
      toast.error('Failed to load bookings data.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingStatus = async (id: number, status: string) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(bookings.map((b: any) => b.id === id ? { ...b, status } : b));
      toast.success('Status updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const handleBookingDelete = async (id: number) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      await deleteBooking(id);
      setBookings(bookings.filter((b: any) => b.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleReservationStatus = async (id: number, status: string) => {
    try {
      await updateReservationStatus(id, status);
      setReservations(reservations.map((r: any) => r.id === id ? { ...r, status } : r));
      toast.success('Status updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const handleReservationDelete = async (id: number) => {
    if (!window.confirm('Delete this reservation permanently?')) return;
    try {
      await deleteReservation(id);
      setReservations(reservations.filter((r: any) => r.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="text-cream/50 py-12 text-center">Loading bookings...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Room Bookings */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="font-display text-2xl text-gold mb-6">Room Bookings</h2>
        <div className="space-y-4">
          {bookings.length === 0 ? <p className="text-cream/40">No bookings yet.</p> : null}
          {bookings.map((b: any) => (
            <div key={b.id} className="glass p-6 rounded-lg relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${b.status === 'confirmed' ? 'bg-green-500' : b.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`} />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-mono text-xs text-gold mb-1">{b.referenceId}</div>
                  <h3 className="text-cream font-bold">{b.name}</h3>
                  <p className="text-cream/60 text-sm">{b.email} • {b.phone}</p>
                </div>
                <span className="px-3 py-1 bg-black/5 rounded-full text-xs text-cream/70 uppercase tracking-wider">
                  {b.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-cream/80 mb-4 bg-black/5 p-3 rounded">
                <div><span className="text-gold/80 block text-xs uppercase mb-1">Room</span> {b.roomType}</div>
                <div><span className="text-gold/80 block text-xs uppercase mb-1">Guests</span> {b.guests}</div>
                <div><span className="text-gold/80 block text-xs uppercase mb-1">In</span> {new Date(b.checkIn).toLocaleDateString()}</div>
                <div><span className="text-gold/80 block text-xs uppercase mb-1">Out</span> {new Date(b.checkOut).toLocaleDateString()}</div>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => handleBookingStatus(b.id, 'confirmed')} disabled={b.status === 'confirmed'} className="flex-1 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-30 rounded transition-colors text-xs uppercase tracking-wider font-bold">Confirm</button>
                <button onClick={() => handleBookingStatus(b.id, 'cancelled')} disabled={b.status === 'cancelled'} className="flex-1 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30 rounded transition-colors text-xs uppercase tracking-wider font-bold">Cancel</button>
                <button onClick={() => handleBookingDelete(b.id)} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-gold rounded transition-colors text-xs uppercase tracking-wider font-bold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Table Reservations */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="font-display text-2xl text-gold mb-6">Table Reservations</h2>
        <div className="space-y-4">
          {reservations.length === 0 ? <p className="text-cream/40">No reservations yet.</p> : null}
          {reservations.map((r: any) => (
            <div key={r.id} className="glass p-6 rounded-lg relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${r.status === 'confirmed' ? 'bg-green-500' : r.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`} />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-mono text-xs text-gold mb-1">{r.referenceId}</div>
                  <h3 className="text-cream font-bold">{r.name}</h3>
                  <p className="text-cream/60 text-sm">{r.email} • {r.phone}</p>
                </div>
                <span className="px-3 py-1 bg-black/5 rounded-full text-xs text-cream/70 uppercase tracking-wider">
                  {r.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-cream/80 mb-4 bg-black/5 p-3 rounded">
                <div><span className="text-gold/80 block text-xs uppercase mb-1">Date</span> {r.date}</div>
                <div><span className="text-gold/80 block text-xs uppercase mb-1">Time</span> {r.time}</div>
                <div><span className="text-gold/80 block text-xs uppercase mb-1">Guests</span> {r.guests}</div>
                <div><span className="text-gold/80 block text-xs uppercase mb-1">Occasion</span> {r.occasion || 'None'}</div>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => handleReservationStatus(r.id, 'confirmed')} disabled={r.status === 'confirmed'} className="flex-1 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-30 rounded transition-colors text-xs uppercase tracking-wider font-bold">Confirm</button>
                <button onClick={() => handleReservationStatus(r.id, 'cancelled')} disabled={r.status === 'cancelled'} className="flex-1 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30 rounded transition-colors text-xs uppercase tracking-wider font-bold">Cancel</button>
                <button onClick={() => handleReservationDelete(r.id)} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-gold rounded transition-colors text-xs uppercase tracking-wider font-bold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
