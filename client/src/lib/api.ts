import axios from 'axios';
import type { BookingForm, ReservationForm } from '../types';

let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (rawApiUrl && !rawApiUrl.startsWith('http')) {
  if (rawApiUrl.startsWith('/')) {
    rawApiUrl = window.location.origin + rawApiUrl;
  } else {
    rawApiUrl = 'https://' + rawApiUrl;
  }
}
export const API_URL = rawApiUrl;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const submitBooking = async (data: BookingForm) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const checkAvailability = async (roomType: string, checkIn: string, checkOut: string, guests: number) => {
  const response = await api.post('/bookings/check-availability', { roomType, checkIn, checkOut, guests });
  return response.data;
};

export const submitReservation = async (data: ReservationForm) => {
  const response = await api.post('/reservations', data);
  return response.data;
};

// Admin Methods
export const loginAdmin = async (credentials: any) => {
  const response = await api.post('/admin/login', credentials);
  return response.data;
};

export const fetchBookings = async () => {
  const response = await api.get('/bookings');
  return response.data.data;
};

export const fetchReservations = async () => {
  const response = await api.get('/reservations');
  return response.data.data;
};

export const updateBookingStatus = async (id: number, status: string) => {
  const response = await api.patch(`/bookings/${id}/status`, { status });
  return response.data;
};

export const deleteBooking = async (id: number) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};

export const updateReservationStatus = async (id: number, status: string) => {
  const response = await api.patch(`/reservations/${id}/status`, { status });
  return response.data;
};

export const deleteReservation = async (id: number) => {
  const response = await api.delete(`/reservations/${id}`);
  return response.data;
};

// Tracking
export const trackBooking = async (email: string, referenceId: string) => {
  const response = await api.post('/track', { email, referenceId });
  return response.data;
};

export const cancelBookingCustomer = async (email: string, referenceId: string) => {
  const response = await api.post('/bookings/cancel', { email, referenceId });
  return response.data;
};

// Menu / Listings
export const fetchMenu = async () => {
  const response = await api.get('/menu');
  return response.data;
};

export const createMenuItem = async (data: any) => {
  const response = await api.post('/menu', data);
  return response.data;
};

export const deleteMenuItem = async (id: number) => {
  const response = await api.delete(`/menu/${id}`);
  return response.data;
};

// Rooms
export const fetchRooms = async () => {
  const response = await api.get('/rooms');
  return response.data;
};

export const fetchRoomById = async (id: string | number) => {
  const response = await api.get(`/rooms/${id}`);
  return response.data;
};

export const createRoom = async (data: any) => {
  const response = await api.post('/rooms', data);
  return response.data;
};

export const updateRoom = async (id: number, data: any) => {
  const response = await api.put(`/rooms/${id}`, data);
  return response.data;
};

export const deleteRoom = async (id: number) => {
  const response = await api.delete(`/rooms/${id}`);
  return response.data;
};

// Photo Upload
export const uploadPhoto = async (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Testimonials
export const fetchTestimonials = async () => {
  const response = await api.get('/testimonials');
  return response.data;
};
export const fetchAdminTestimonials = async () => {
  const response = await api.get('/admin/testimonials');
  return response.data;
};
export const submitPublicTestimonial = async (data: any) => {
  const response = await api.post('/testimonials/public', data);
  return response.data;
};
export const createTestimonial = async (data: any) => {
  const response = await api.post('/testimonials', data);
  return response.data;
};
export const updateTestimonial = async (id: number, data: any) => {
  const response = await api.put(`/admin/testimonials/${id}`, data);
  return response.data;
};
export const deleteTestimonial = async (id: number) => {
  const response = await api.delete(`/testimonials/${id}`);
  return response.data;
};

// Gallery
export const fetchGallery = async () => {
  const response = await api.get('/gallery');
  return response.data;
};
export const createGalleryImage = async (data: any) => {
  const response = await api.post('/gallery', data);
  return response.data;
};
export const deleteGalleryImage = async (id: number) => {
  const response = await api.delete(`/gallery/${id}`);
  return response.data;
};

// Experiences
export const fetchExperiences = async () => {
  const response = await api.get('/experiences');
  return response.data;
};
export const createExperience = async (data: any) => {
  const response = await api.post('/experiences', data);
  return response.data;
};
export const deleteExperience = async (id: number) => {
  const response = await api.delete(`/experiences/${id}`);
  return response.data;
};

// Hero Media
export const fetchHeroMedia = async () => {
  const response = await api.get('/hero-media');
  return response.data;
};
export const updateHeroMedia = async (data: any) => {
  const response = await api.put('/hero', data);
  return response.data;
};

// Story Content
export const fetchStory = async () => {
  const response = await api.get('/story');
  return response.data;
};

export const updateStory = async (data: any) => {
  const response = await api.put('/story', data);
  return response.data;
};
export const createHeroMedia = async (data: any) => {
  const response = await api.post('/hero-media', data);
  return response.data;
};
export const deleteHeroMedia = async (id: number) => {
  const response = await api.delete(`/hero-media/${id}`);
  return response.data;
};

// Settings
export const fetchSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};
export const updateSettings = async (data: any) => {
  const response = await api.patch('/settings', data);
  return response.data;
};

// Availability
export const fetchAvailability = async (month: number, year: number) => {
  const response = await api.get(`/availability?month=${month}&year=${year}`);
  return response.data;
};

// Site Content (Global Text)
export const fetchSiteContent = async () => (await api.get('/site-content')).data;
export const updateSiteContent = async (data: any) => (await api.put('/site-content', data)).data;

// Inquiries
export const fetchInquiries = async () => (await api.get('/inquiries')).data.data;
export const submitInquiry = async (data: any) => (await api.post('/inquiries', data)).data;
export const updateInquiryStatus = async (id: number, status: string) => (await api.patch(`/inquiries/${id}/status`, { status })).data;
export const deleteInquiry = async (id: number) => (await api.delete(`/inquiries/${id}`)).data;

export default api;
