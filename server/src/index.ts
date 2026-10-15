import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { sequelize } from './config/database';
import apiRoutes from './routes/api';
import { Booking } from './models/Booking';
import { Reservation } from './models/Reservation';
import { MenuItem } from './models/MenuItem';
import { Room } from './models/Room';
import { Testimonial } from './models/Testimonial';
import { GalleryImage } from './models/GalleryImage';
import { Experience } from './models/Experience';
import { Admin } from './models/Admin';
import { HeroMedia } from './models/HeroMedia';
import { Story } from './models/Story';
import { Settings } from './models/Settings';
import { SiteContent } from './models/SiteContent';
import { Inquiry } from './models/Inquiry';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('API is running.');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Sync database and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models (in production, use migrations)
    await Booking.sync();
    await Reservation.sync();
    await MenuItem.sync();
    try {
      await sequelize.query('ALTER TABLE menu_items MODIFY COLUMN price FLOAT NULL DEFAULT 0');
    } catch {
      // Column already updated or non-fatal
    }
    await Room.sync();
    
    // Seed or ensure real resort rooms (5 physical rooms across 3 categories)
    const defaultRooms = [
      {
        name: 'Scenic Room',
        description: 'Our signature Scenic Room offers sweeping vistas of Pawna Lake and the Sahyadri mountains. Crafted for couples and intimate escapes with luxury linens, private deck, and sunset views. (3 units available)',
        price: 3500,
        capacity: 2,
        totalUnits: 3,
        size: '45 sq.m.',
        amenities: ['King Size Bed', 'Private Bathroom', 'Air Conditioning', 'Hot Water', 'Wi-Fi', 'Mountain View', 'Private Deck', 'Bonfire', 'Breakfast Included', 'Room Service'],
        policies: ['Breakfast Included', 'Welcome Drink on Arrival', 'Bonfire Access', 'Free Cancellation (48hrs prior)'],
        image: 'https://images.unsplash.com/photo-1620221028695-7f26ad849b4f?w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1620221028695-7f26ad849b4f?w=1200&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
          'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&q=80'
        ],
        rating: 4.9,
        reviews: 142
      },
      {
        name: 'Group Room (6 Person)',
        description: 'Designed specifically for larger families, corporate retreats, and friend circles. Features expansive living spaces, multiple beds, and a sprawling private balcony overlooking the lake. (Accommodates up to 6 guests)',
        price: 3000,
        capacity: 6,
        totalUnits: 1,
        size: '110 sq.m.',
        amenities: ['Multiple Beds', 'Private Bathroom', 'Air Conditioning', 'Hot Water', 'Wi-Fi', 'Mountain View', 'Private Deck', 'Bonfire', 'Breakfast Included', 'Room Service'],
        policies: ['Breakfast Included', 'Welcome Drink on Arrival', 'Bonfire Access', 'Free Cancellation (48hrs prior)'],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80'
        ],
        rating: 5.0,
        reviews: 89
      },
      {
        name: 'Group Room (4 Person)',
        description: 'The ideal family retreat. Spacious suite comfortably accommodating up to 4 guests with cozy bedding, panoramic windows, and private outdoor seating. (Accommodates up to 4 guests)',
        price: 3200,
        capacity: 4,
        totalUnits: 1,
        size: '75 sq.m.',
        amenities: ['2 King Size Beds', 'Private Bathroom', 'Air Conditioning', 'Hot Water', 'Wi-Fi', 'Forest View', 'Balcony', 'Bonfire', 'Breakfast Included', 'Room Service'],
        policies: ['Breakfast Included', 'Welcome Drink on Arrival', 'Bonfire Access', 'Free Cancellation (48hrs prior)'],
        image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80',
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'
        ],
        rating: 4.8,
        reviews: 67
      }
    ];

    for (const r of defaultRooms) {
      const existing = await Room.findOne({ where: { name: r.name } });
      if (!existing) {
        await Room.create(r as any);
      } else if (existing.totalUnits !== r.totalUnits || existing.capacity !== r.capacity) {
        await existing.update({ totalUnits: r.totalUnits, capacity: r.capacity });
      }
    }
    await Testimonial.sync();
    await GalleryImage.sync();
    await Experience.sync();
    await Admin.sync();
    await HeroMedia.sync();
    await Story.sync();
    await Inquiry.sync();
    
    // Fix empty story
    const story = await Story.findOne();
    if (story && !story.title) {
      await story.update({
        title: 'Where the Mountains',
        subtitle: 'Whisper Luxury',
        paragraph1: "Nestled at an altitude where clouds graze the treetops, Café Belmirah was born from a dream — to create a space where nature's grandeur and human refinement exist in perfect harmony. What began as a small mountain café in 2019 has evolved into one of the region's most celebrated luxury glamping destinations.",
        paragraph2: "Every detail at Belmirah is intentional — from the hand-picked artisan furnishings to the locally sourced ingredients that define our continental menu. We believe that true luxury is not about excess, but about depth of experience and the freedom to breathe in nature's extraordinary gifts.",
        imageUrl: "https://images.unsplash.com/photo-1464146072230-91cabc968266?w=900&q=80"
      });
      console.log('Fixed empty story!');
    }

    await Settings.sync({ alter: true });
    await SiteContent.sync();
    
    // Seed default settings if none exists
    const settingsCount = await Settings.count();
    if (settingsCount === 0) {
      await Settings.create({
        maxGlampingBookingsPerDay: 5,
        maxTableReservationsPerDay: 20
      });
      console.log('Default settings created.');
    }
    
    // Seed default admin or reset password if exists
    const admin = await Admin.findOne({ where: { email: 'admin@cafebelmirah.com' } });
    if (!admin) {
      await Admin.create({
        email: 'admin@cafebelmirah.com',
        password: 'adminpassword123',
      });
      console.log('Default admin created.');
    } else {
      admin.password = 'adminpassword123';
      await admin.save();
      console.log('Default admin password forcefully reset.');
    }
    
    // Seed default hero media if none exists
    const heroMediaCount = await HeroMedia.count();
    if (heroMediaCount === 0) {
      await HeroMedia.bulkCreate([
        { type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90' },
        { type: 'video', url: 'https://cdn.coverr.co/videos/coverr-pouring-coffee-into-a-cup-9372/1080p.mp4' },
        { type: 'image', url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1920&q=90' }
      ]);
      console.log('Default hero media created.');
    }
    
    // Seed default site content if none exists
    const siteContentCount = await SiteContent.count();
    if (siteContentCount === 0) {
      await SiteContent.bulkCreate([
        { key: 'hero_headline', value: 'Luxury\nBeyond\nImagination' },
        { key: 'hero_subheadline', value: 'Luxury Glamping  ·  Continental Café  ·  Nature  ·  Unforgettable Experiences' },
        { key: 'cafe_intro_title', value: 'A Culinary Journey' },
        { key: 'cafe_intro_text', value: 'Our continental menu is thoughtfully curated to complement the breathtaking surroundings. We source the finest local ingredients to create dishes that are both comforting and sophisticated, offering a dining experience that elevates your stay.' },
        { key: 'rooms_intro_title', value: 'Sanctuaries of Comfort' },
        { key: 'rooms_intro_text', value: 'Each of our glamping units is designed to blur the lines between indoors and out, offering panoramic views without compromising on the luxurious amenities you expect from a world-class resort.' },
        { key: 'contact_address', value: '123 Cloud Point Road, Mountain Peak' },
        { key: 'contact_phone', value: '+1 (555) 123-4567' },
        { key: 'contact_email', value: 'reservations@cafebelmirah.com' }
      ]);
      console.log('Default site content created.');
    }
    
    console.log('Database synced.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  startServer();
});
