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
    await Room.sync();
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
