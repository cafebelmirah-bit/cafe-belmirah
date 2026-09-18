import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchRooms } from '../../lib/api';
import { useSiteContent } from '../../context/SiteContentContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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

function RoomCard({ room, index }: { room: any; index: number }) {
  const navigate = useNavigate();
  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8 }}
      className="luxury-card group overflow-hidden relative"
    >
      {/* Image / Carousel */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {room.images && room.images.length > 1 ? (
          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 3000, disableOnInteraction: true }}
            className="w-full h-full"
            loop
          >
            {room.images.map((img: string, i: number) => (
              <SwiperSlide key={i}>
                <motion.img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <motion.img
            src={room.image || (room.images && room.images[0])}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        )}



      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display text-xl text-cream mb-1">{room.name}</h3>
            <div className="flex items-center gap-3 text-cream/40 text-xs">
              <span>👥 Up to {room.capacity} guests</span>
              <span>📐 {room.size}</span>
            </div>
          </div>
        </div>

        <p className="text-cream/50 text-sm leading-relaxed mb-5 line-clamp-3">
          {room.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(room.amenities || []).slice(0, 6).map((amenity: string) => (
            <span
              key={amenity}
              className="flex items-center gap-1 glass px-2 py-1 text-xs text-cream/50"
              title={amenity}
            >
              <span>{amenityIcons[amenity] || '✓'}</span>
              <span className="hidden sm:inline">{amenity}</span>
            </span>
          ))}
          {room.amenities && room.amenities.length > 6 && (
            <span className="glass px-2 py-1 text-xs text-cream/40">
              +{room.amenities.length - 6} more
            </span>
          )}
        </div>

        {/* Price & Book */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-end justify-between border-t border-gold/10 pt-4">
            <div className="flex items-end gap-2">
              <span className="font-body text-[10px] text-cream/50 tracking-wider uppercase pb-0.5">From</span>
              <span className="font-display text-2xl text-gold leading-none">₹{Number(room.price).toLocaleString()}</span>
              <span className="font-body text-xs text-cream/40 pb-0.5">/ night</span>
            </div>
            <div className="flex items-center gap-1 pb-1">
              <span className="text-gold text-[10px]">★</span>
              <span className="font-body text-[11px] text-cream/70">{room.rating} <span className="text-cream/30">({room.reviews})</span></span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="btn-gold flex-1 text-xs py-3 justify-center"
              onClick={() => scrollTo('#booking')}
            >
              Book Now
            </button>
            <button 
              className="btn-outline-gold px-4 py-3 text-xs"
              onClick={() => navigate(`/stay/${room.id}`)}
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Gold border on hover */}
      <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/20 transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
}

export default function LuxuryStay() {
  const [rooms, setRooms] = useState<any[]>([]);
  const { content } = useSiteContent();

  useEffect(() => {
    fetchRooms().then(setRooms).catch(console.error);
  }, []);

  return (
    <section id="stay" className="section-padding bg-dark relative">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-3"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(45,80,22,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="container-luxury relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label justify-center mb-4"
          >
            Accommodations
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-title mb-4"
          >
            {content.rooms_intro_title || "Sanctuaries of Comfort"}
          </motion.h2>
          <div className="gold-divider" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-cream/50 max-w-xl mx-auto mt-4"
          >
            {content.rooms_intro_text || "Each of our accommodations is a masterclass in thoughtful luxury — where design, comfort, and the wild beauty of nature converge."}
          </motion.p>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {(rooms || []).map((room, i) => (
            <RoomCard key={room.id} room={room} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-cream/40 text-sm mb-6">All rooms include breakfast, bonfire access, and complimentary nature walks.</p>
          <button
            className="btn-outline-gold"
            onClick={() => document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Check Availability
          </button>
        </motion.div>
      </div>
    </section>
  );
}
