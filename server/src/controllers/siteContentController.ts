import { Request, Response } from 'express';
import { SiteContent } from '../models/SiteContent';
import { Settings } from '../models/Settings';

export const getAllSiteContent = async (req: Request, res: Response) => {
  try {
    const contents = await SiteContent.findAll();
    
    // Convert array to key-value object for easy frontend consumption
    const contentMap: Record<string, string> = {};
    contents.forEach(item => {
      contentMap[item.key] = item.value;
    });

    if (!contentMap.contact_phone || contentMap.contact_phone.includes('123-4567') || contentMap.contact_phone.includes('98765 43210')) {
      const settings = await Settings.findOne();
      if (settings?.propertyPhone && !settings.propertyPhone.includes('98765 43210')) {
        contentMap.contact_phone = settings.propertyPhone;
      } else {
        contentMap.contact_phone = '+91 95118 96490';
      }
    }

    res.json({ success: true, data: contentMap });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSiteContent = async (req: Request, res: Response) => {
  try {
    const updates = req.body; // Expects an object like { hero_headline: "new text", ... }
    
    // Update each provided key
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') {
        const item = await SiteContent.findOne({ where: { key } });
        if (item) {
          await item.update({ value });
        } else {
          await SiteContent.create({ key, value });
        }
      }
    }

    res.json({ success: true, message: 'Site content updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
