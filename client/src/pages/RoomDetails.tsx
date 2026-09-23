import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { fetchRoomById } from '../lib/api';

const amenityIcons: Record<string, string> = {
  'King Size Bed': '🛏️',
  '2 King Size Beds': '🛏️',
  'Private Bathroom': '🚿',
  'Air Conditioning': '❄️',
  'Hot Water': '🔥',
  'Wi-Fi': '📶',
  'Mountain View': '⛰️',
  'Panoramic Mountain View': '⛰️',
  'Forest View': '🌲',
  'Valley & Peaks': '🏔️',
  'Private Deck': '🌄',
  'Balcony': '🏠',
  'Private Balcony': '🏠',
  'Bonfire': '🔥',
  'Breakfast Included': '☕',
  'Room Service': '🍽️',
  'Butler Service': '👔',
  'Private Hot Tub': '♨️',
  'Rain Shower': '🚿',
  'Fireplace': '🔥',
};

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchRoomById(id)
        .then((res) => {
          if (res.success) {
            setRoom(res.item);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center">
        <h1 className="font-display text-4xl text-gold mb-4">Room Not Found</h1>
        <button onClick={() => navigate('/')} className="btn-outline-gold px-6 py-2">Return Home</button>
      </div>
    );
  }

  const handleBookNow = () => {
    navigate('/#booking');
    setTimeout(() => {
      const el = document.getElementById('booking');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col pb-20">
      <main className="flex-1">
        
        {/* Full-Width Media Section */}
        <div className="relative w-full h-[40vh] md:h-[60vh] bg-black">

          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 4000, disableOnInteraction: true }}
            className="w-full h-full"
            loop
          >
            {room.videoUrl && (
              <SwiperSlide>
                <video 
                  src={room.videoUrl} 
                  controls
                  className="w-full h-full object-cover object-center"
                  poster={room.image || (room.images && room.images[0])}
                />
              </SwiperSlide>
            )}
            {room.images && room.images.length > 0 ? (
              room.images.map((img: string, i: number) => (
                <SwiperSlide key={i}>
                  <img src={img} alt={`${room.name} view ${i + 1}`} className="w-full h-full object-cover object-center" />
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <img src={room.image} alt={room.name} className="w-full h-full object-cover object-center" />
              </SwiperSlide>
            )}
          </Swiper>
          
          {/* Gradient Overlay removed to prevent blurriness */}
        </div>

        {/* Main Content Area */}
        <div className="container-luxury mx-auto px-4 mt-12">
          
          {/* Back Button */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center gap-3 text-sm text-cream/70 hover:text-gold transition-colors font-body tracking-wider uppercase"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">←</span> 
              Back to Properties
            </button>
          </div>

          {/* Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Content (Details) */}
            <div className="lg:col-span-2 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="font-display text-4xl md:text-5xl text-gold mb-4">{room.name}</h1>
                <div className="flex flex-wrap gap-6 text-cream/50 text-sm border-b border-white/10 pb-6">
                  <span className="flex items-center gap-2">👥 Up to {room.capacity} guests</span>
                  <span className="flex items-center gap-2">📐 {room.size}</span>
                  <span className="flex items-center gap-1"><span className="text-gold">★</span> {room.rating} ({room.reviews} reviews)</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-display text-2xl text-cream mb-6">About the Property</h3>
                <p className="text-cream/70 text-lg leading-relaxed whitespace-pre-wrap font-light">
                  {room.description}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-display text-2xl text-cream mb-6">Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(room.amenities || []).map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-3 text-cream/70 glass px-4 py-3 rounded-xl border border-white/5">
                      <span className="text-xl">{amenityIcons[amenity] || '✓'}</span>
                      <span className="text-sm tracking-wide">{amenity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Content (Sticky Booking Card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-32 bg-dark-100 p-8 rounded-2xl border border-gold/20 shadow-2xl">
                <div className="text-center mb-6 border-b border-white/10 pb-6">
                  <div className="font-display text-2xl text-gold mb-2">{room.name}</div>
                  <div className="font-body text-xs text-cream/50 tracking-widest uppercase mb-2">Starting from</div>
                  <div className="font-display text-4xl text-cream">₹{Number(room.price).toLocaleString()}</div>
                  <div className="font-body text-xs text-cream/50 tracking-widest uppercase mt-2">per night</div>
                </div>

                <div className="bg-dark/50 rounded-lg p-4 mb-6 border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-cream/60">Check-in</span>
                    <span className="text-sm text-gold font-medium">{room.checkInTime || '2:00 PM'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-cream/60">Check-out</span>
                    <span className="text-sm text-gold font-medium">{room.checkOutTime || '11:00 AM'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-sm text-cream/60">Max Guests</span>
                    <span className="text-sm text-gold font-medium">{room.capacity} Adults/Children</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 text-sm text-cream/80 font-medium">
                  {(room.policies || ['Breakfast Included', 'Welcome Drink on Arrival', 'Bonfire Access', 'Free Cancellation (48hrs prior)']).map((policy: string, index: number) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="text-gold">✓</span> {policy}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={handleBookNow}
                  className="w-full btn-gold py-4 rounded text-sm uppercase tracking-widest font-semibold justify-center shadow-lg hover:scale-[1.02] transition-transform"
                >
                  Book This Property
                </button>
                
                <p className="text-center text-xs text-cream/40 mt-4">
                  You won't be charged yet.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
