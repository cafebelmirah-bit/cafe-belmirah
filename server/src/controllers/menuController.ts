import { Request, Response } from 'express';
import { MenuItem } from '../models/MenuItem';

export const getMenu = async (req: Request, res: Response) => {
  try {
    const items = await MenuItem.findAll();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.price === '' || data.price === null || data.price === undefined) {
      data.price = 0;
    } else {
      data.price = Number(data.price) || 0;
    }
    const item = await MenuItem.create(data);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const item = await MenuItem.findByPk(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    const data = { ...req.body };
    if (data.price === '' || data.price === null || data.price === undefined) {
      data.price = 0;
    } else {
      data.price = Number(data.price) || 0;
    }
    await item.update(data);
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const item = await MenuItem.findByPk(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    await item.destroy();
    res.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
