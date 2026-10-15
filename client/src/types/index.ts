// =====================================================
// Café Belmirah — Type Definitions
// =====================================================

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price?: number | null;
  category: MenuCategory;
  isVeg: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  image: string;
  tags?: string[];
}

export type MenuCategory =
  | 'breakfast'
  | 'appetizers'
  | 'pizza'
  | 'pasta'
  | 'burgers'
  | 'sandwiches'
  | 'salads'
  | 'soups'
  | 'desserts'
  | 'coffee'
  | 'tea'
  | 'mocktails'
  | 'fresh-juices';

export interface Room {
  id: string;
  name: string;
  type: 'glamping-tent' | 'luxury-suite' | 'forest-cabin' | 'mountain-villa';
  description: string;
  price: number;
  image: string;
  gallery: string[];
  capacity: number;
  amenities: string[];
  size: string;
  view: string;
  rating: number;
  reviews: number;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  duration: string;
  category: string;
  price?: number;
  isFeatured?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  avatar: string;
  date: string;
  stayType: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: 'stay' | 'dining' | 'nature' | 'experiences' | 'interior';
  width: number;
  height: number;
}

export interface BookingForm {
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  specialRequests: string;
  name: string;
  email: string;
  phone: string;
}

export interface ReservationForm {
  date: string;
  time: string;
  guests: number;
  occasion: string;
  specialRequests: string;
  name: string;
  email: string;
  phone: string;
}
