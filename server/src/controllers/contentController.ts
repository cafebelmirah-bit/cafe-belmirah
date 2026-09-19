import { Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { Booking } from '../models/Booking';
import { Reservation } from '../models/Reservation';
import { Testimonial } from '../models/Testimonial';
import { GalleryImage } from '../models/GalleryImage';
import { Experience } from '../models/Experience';
import { HeroMedia } from '../models/HeroMedia';
import { Story } from '../models/Story';
import { Room } from '../models/Room';
import { MenuItem } from '../models/MenuItem';
import { Op } from 'sequelize';
// --- Settings ---
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await Settings.findOne();
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settings = await Settings.findOne();
    if (settings) {
      await settings.update(req.body);
    }
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// --- Availability ---
export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ success: false, message: 'Month and year required' });
    
    const settings = await Settings.findOne();
    if (!settings) return res.status(500).json({ success: false, message: 'Settings not found' });
    
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    
    const bookings = await Booking.findAll({
      where: {
        checkIn: { [Op.between]: [startDate, endDate] },
        status: { [Op.ne]: 'cancelled' }
      }
    });
    
    const reservations = await Reservation.findAll({
      where: {
        date: { [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]] },
        status: { [Op.ne]: 'cancelled' }
      }
    });
    
    res.json({ success: true, data: { bookings, reservations, settings } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Testimonials ---
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const items = await Testimonial.findAll({ where: { isApproved: true } });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createPublicTestimonial = async (req: Request, res: Response) => {
  try {
    const item = await Testimonial.create({ ...req.body, isApproved: false });
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAdminTestimonials = async (req: Request, res: Response) => {
  try {
    const items = await Testimonial.findAll();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const item = await Testimonial.create({ ...req.body, isApproved: true });
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const item = await Testimonial.findByPk(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    await item.update(req.body);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const item = await Testimonial.findByPk(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    await item.destroy();
    res.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Gallery ---
export const getGallery = async (req: Request, res: Response) => {
  try {
    const items = await GalleryImage.findAll();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createGalleryImage = async (req: Request, res: Response) => {
  try {
    const item = await GalleryImage.create(req.body);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteGalleryImage = async (req: Request, res: Response) => {
  try {
    const item = await GalleryImage.findByPk(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    await item.destroy();
    res.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Hero Media ---
export const getHeroMedia = async (req: Request, res: Response) => {
  try {
    const items = await HeroMedia.findAll();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createHeroMedia = async (req: Request, res: Response) => {
  try {
    const item = await HeroMedia.create(req.body);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteHeroMedia = async (req: Request, res: Response) => {
  try {
    const item = await HeroMedia.findByPk(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    await item.destroy();
    res.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Experiences ---
export const getExperiences = async (req: Request, res: Response) => {
  try {
    const items = await Experience.findAll();
    const parsedItems = items.map(item => {
      const data = item.toJSON();
      if (data.images) {
        try {
          data.images = JSON.parse(data.images);
        } catch (e) {
          data.images = [];
        }
      } else {
        data.images = [];
      }
      return data;
    });
    res.json(parsedItems);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createExperience = async (req: Request, res: Response) => {
  try {
    let payload = { ...req.body };
    if (Array.isArray(payload.images)) {
      payload.images = JSON.stringify(payload.images);
    }
    const item = await Experience.create(payload);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteExperience = async (req: Request, res: Response) => {
  try {
    const item = await Experience.findByPk(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    await item.destroy();
    res.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateExperience = async (req: Request, res: Response) => {
  try {
    const item = await Experience.findByPk(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    
    let payload = { ...req.body };
    if (Array.isArray(payload.images)) {
      payload.images = JSON.stringify(payload.images);
    }
    
    await item.update(payload);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Story Content ---
export const getStory = async (req: Request, res: Response) => {
  try {
    let story = await Story.findOne();
    if (!story) {
      story = await Story.create({
        title: 'Where the Mountains',
        subtitle: 'Whisper Luxury',
        paragraph1: "Nestled at an altitude where clouds graze the treetops, Café Belmirah was born from a dream — to create a space where nature's grandeur and human refinement exist in perfect harmony. What began as a small mountain café in 2019 has evolved into one of the region's most celebrated luxury glamping destinations.",
        paragraph2: "Every detail at Belmirah is intentional — from the hand-picked artisan furnishings to the locally sourced ingredients that define our continental menu. We believe that true luxury is not about excess, but about depth of experience and the freedom to breathe in nature's extraordinary gifts.",
        imageUrl: "https://images.unsplash.com/photo-1464146072230-91cabc968266?w=900&q=80"
      });
    }

    // Calculate dynamic stats
    const totalGuests = await Booking.sum('guests', { where: { status: 'confirmed' } });
    const happyGuests = totalGuests || 0;
    const roomTypes = await Room.count();
    const yearsOfExcellence = new Date().getFullYear() - 2019;
    const menuItems = await MenuItem.count();

    const stats = {
      happyGuests,
      roomTypes: roomTypes > 0 ? roomTypes : 4,
      yearsOfExcellence,
      menuItems: menuItems > 0 ? menuItems : 35
    };

    res.json({ success: true, data: { ...story.toJSON(), stats } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateStory = async (req: Request, res: Response) => {
  try {
    const { title, subtitle, paragraph1, paragraph2, imageUrl, imagePosition } = req.body;
    let story = await Story.findOne();
    if (!story) {
      story = await Story.create({ title, subtitle, paragraph1, paragraph2, imageUrl, imagePosition });
    } else {
      await story.update({ title, subtitle, paragraph1, paragraph2, imageUrl, imagePosition });
    }
    res.json({ success: true, data: story });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
