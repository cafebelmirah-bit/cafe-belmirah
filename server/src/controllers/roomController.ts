import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { Op } from 'sequelize';

export const getRooms = async (req: Request, res: Response) => {
  try {
    const items = await Room.findAll({
      where: {
        name: {
          [Op.notIn]: [
            'Scenic Room',
            'Group Room (6 Person)',
            'Group Room (4 Person)',
            'Royal Glamping Tent',
            'Forest Hideaway Cabin',
            'Summit Mountain Villa',
            'Belmirah Luxury Suite'
          ]
        }
      }
    });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const item = await Room.findByPk(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const item = await Room.create(req.body);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const item = await Room.findByPk(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    await item.update(req.body);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const item = await Room.findByPk(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    await item.destroy();
    res.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
