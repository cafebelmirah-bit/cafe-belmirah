import type { Room } from '../types';

export const rooms: Room[] = [
  {
    id: 'scenic-lake-view',
    name: 'Scenic Lake-View Rooms',
    type: 'scenic-room',
    description: 'Wake up to beautiful views of Pawna Lake and the surrounding hills. Perfect for couples and guests seeking a scenic, relaxing escape.',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1620221028695-7f26ad849b4f?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1620221028695-7f26ad849b4f?w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
    ],
    capacity: 2,
    amenities: ['King Size Bed', 'Private Bathroom', 'Air Conditioning', 'Hot Water', 'Wi-Fi', 'Mountain View', 'Private Deck', 'Breakfast Included'],
    size: '100 sq.ft.',
    view: 'Pawna Lake & Mountains',
    rating: 5.0,
    reviews: 0,
  },
  {
    id: 'ac-garden-view',
    name: 'AC Garden-View Rooms — Ideal for Families & Groups.',
    type: 'group-room',
    description: 'Enjoy a comfortable and relaxing stay in our air-conditioned garden-view rooms, surrounded by peaceful greenery. Designed for families and larger groups.',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80'
    ],
    capacity: 6,
    amenities: ['Multiple Beds', 'Private Bathroom', 'Air Conditioning', 'Hot Water', 'Wi-Fi', 'Garden View', 'Breakfast Included'],
    size: '300 sq.ft.',
    view: 'Garden & Greenery',
    rating: 5.0,
    reviews: 0,
  }
];
