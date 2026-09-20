import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { Reservation } from '../models/Reservation';
import { Room } from '../models/Room';
import { Op } from 'sequelize';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import axios from 'axios';

export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { roomType, checkIn, checkOut, guests } = req.body;
    
    const room = await Room.findOne({ where: { name: roomType } });
    if (!room) {
      return res.status(400).json({ success: false, error: 'Invalid room type selected' });
    }

    if (guests && guests > room.capacity) {
      return res.status(400).json({ success: false, error: `This property can only accommodate up to ${room.capacity} guests.` });
    }

    const overlappingBookingsCount = await Booking.count({
      where: {
        roomType: roomType,
        status: { [Op.ne]: 'cancelled' },
        checkIn: { [Op.lt]: checkOut },
        checkOut: { [Op.gt]: checkIn }
      }
    });

    if (overlappingBookingsCount >= room.totalUnits) {
      return res.status(400).json({ success: false, error: 'This property is fully booked for the selected dates.' });
    }

    res.json({ success: true, available: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { roomType, checkIn, checkOut, guests } = req.body;
    
    const room = await Room.findOne({ where: { name: roomType } });
    if (!room) {
      return res.status(400).json({ success: false, error: 'Invalid room type selected' });
    }

    if (guests && guests > room.capacity) {
      return res.status(400).json({ success: false, error: `This property can only accommodate up to ${room.capacity} guests.` });
    }

    const overlappingBookingsCount = await Booking.count({
      where: {
        roomType: roomType,
        status: { [Op.ne]: 'cancelled' },
        checkIn: { [Op.lt]: checkOut },
        checkOut: { [Op.gt]: checkIn }
      }
    });

    if (overlappingBookingsCount >= room.totalUnits) {
      return res.status(400).json({ success: false, error: 'This property is fully booked for the selected dates.' });
    }
    
    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const cancelBookingCustomer = async (req: Request, res: Response) => {
  try {
    const { email, referenceId } = req.body;
    const booking = await Booking.findOne({ where: { email, referenceId } });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or email mismatch.' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }
    
    await Booking.update({ status: 'cancelled' }, { where: { id: booking.id } });
    res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    await Booking.update({ status }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByPk(Number(req.params.id));
    if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
    await booking.destroy();
    res.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const trackBooking = async (req: Request, res: Response) => {
  try {
    const { email, referenceId } = req.query;
    if (!email || !referenceId) {
      return res.status(400).json({ success: false, message: 'Email and Reference ID are required' });
    }

    const authBooking = await Booking.findOne({ where: { email: String(email), referenceId: String(referenceId) } });
    const authReservation = await Reservation.findOne({ where: { email: String(email), referenceId: String(referenceId) } });

    if (!authBooking && !authReservation) {
      return res.status(404).json({ success: false, message: 'Invalid Email or Reference ID.' });
    }

    const bookings = await Booking.findAll({ where: { email: String(email) }, order: [['createdAt', 'DESC']] });
    const reservations = await Reservation.findAll({ where: { email: String(email) }, order: [['createdAt', 'DESC']] });

    res.json({ success: true, bookings, reservations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const { referenceId } = req.params;
    
    // Check bookings first
    let booking: any = await Booking.findOne({ where: { referenceId } });
    let type = 'booking';
    
    // If not found, check reservations
    if (!booking) {
      booking = await Reservation.findOne({ where: { referenceId } });
      type = 'reservation';
    }
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const { Settings } = await import('../models/Settings');
    const settings = (await Settings.findOne()) as any;
    const addr1 = settings?.propertyAddressLine1 || '123 Mountain View Road';
    const addr2 = settings?.propertyAddressLine2 || 'Hill Station, India 400001';
    const email = settings?.propertyEmail || 'contact@cafebelmirah.com';
    const phone = settings?.propertyPhone || '+91 98765 43210';
    const logoHeight = settings?.propertyLogoHeight || 40;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${referenceId}.pdf`);
    
    doc.pipe(res);
    
    const generateHr = (y: number) => {
      doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
    };

    let yOffset = 95;
    if (settings?.propertyLogo) {
      try {
        const response = await axios.get(settings.propertyLogo, { responseType: 'arraybuffer' });
        doc.image(response.data, 50, 40, { height: logoHeight });
        yOffset = 50 + logoHeight + 10;
      } catch (err) {
        console.error('Failed to load logo for invoice', err);
        doc.fillColor('#C5A880').fontSize(28).font('Times-Bold').text('CAFÉ BELMIRAH', 50, 50);
      }
    } else {
      doc.fillColor('#C5A880').fontSize(28).font('Times-Bold').text('CAFÉ BELMIRAH', 50, 50);
    }
    
    doc.fillColor('#666666').fontSize(10).font('Helvetica').text('Luxury Café & Glamping', 50, yOffset - 15);
    doc.text(addr1, 50, yOffset);
    doc.text(addr2, 50, yOffset + 15);
    doc.text(email, 50, yOffset + 30);
    
    doc.fillColor('#333333').fontSize(20).font('Helvetica-Bold').text('INVOICE', 50, 50, { align: 'right' });
    doc.fontSize(10).font('Helvetica').text(`Invoice #: INV-${referenceId}`, 50, 80, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 95, { align: 'right' });
    doc.text('Status: PAID (Advance)', 50, 110, { align: 'right' });

    const yShift = Math.max(0, yOffset + 50 - 150);

    generateHr(150 + yShift);

    doc.fillColor('#333333').fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 170 + yShift);
    doc.font('Helvetica').fontSize(10);
    doc.text(booking.name, 50, 190 + yShift);
    doc.text(booking.email, 50, 205 + yShift);
    doc.text(booking.phone, 50, 220 + yShift);

    const qrBuffer = await QRCode.toBuffer(`https://belmirah.in/verify/${referenceId}`);
    doc.image(qrBuffer, 450, 160 + yShift, { width: 100 });

    generateHr(260 + yShift);

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('DESCRIPTION', 50, 280 + yShift);
    doc.text('QTY / GUESTS', 280, 280 + yShift, { width: 90, align: 'right' });
    doc.text('UNIT PRICE', 370, 280 + yShift, { width: 90, align: 'right' });
    doc.text('TOTAL', 470, 280 + yShift, { width: 80, align: 'right' });
    
    generateHr(300 + yShift);

    let totalAmount = 0;
    doc.font('Helvetica').fontSize(10);
    
    if (type === 'booking') {
      const room: any = await Room.findOne({ where: { name: booking.roomType } });
      const pricePerNight = room ? room.price : 0;
      
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      totalAmount = pricePerNight * diffDays;
      const advancePaid = totalAmount * 0.3;
      
      doc.text(`Glamping Stay - ${booking.roomType}`, 50, 320 + yShift);
      doc.fillColor('#666666').fontSize(8).text(`Check-In: ${booking.checkIn} | Check-Out: ${booking.checkOut}`, 50, 335 + yShift);
      
      doc.fillColor('#333333').fontSize(10);
      doc.text(`${diffDays} Night(s)`, 280, 320 + yShift, { width: 90, align: 'right' });
      doc.text(`Rs. ${pricePerNight.toLocaleString()}`, 370, 320 + yShift, { width: 90, align: 'right' });
      doc.text(`Rs. ${totalAmount.toLocaleString()}`, 470, 320 + yShift, { width: 80, align: 'right' });
      
      generateHr(360 + yShift);
      
      doc.font('Helvetica-Bold');
      doc.text('Total Amount:', 370, 380 + yShift, { width: 90, align: 'right' });
      doc.text(`Rs. ${totalAmount.toLocaleString()}`, 470, 380 + yShift, { width: 80, align: 'right' });
      
      doc.text('Advance Paid (30%):', 370, 400 + yShift, { width: 90, align: 'right' });
      doc.text(`Rs. ${advancePaid.toLocaleString()}`, 470, 400 + yShift, { width: 80, align: 'right' });
      
      doc.text('Balance Due at Property:', 370, 420 + yShift, { width: 90, align: 'right' });
      doc.text(`Rs. ${(totalAmount - advancePaid).toLocaleString()}`, 470, 420 + yShift, { width: 80, align: 'right' });

    } else {
      const reservationFee = 500;
      totalAmount = reservationFee * booking.guests;
      
      doc.text(`Table Reservation`, 50, 320 + yShift);
      doc.fillColor('#666666').fontSize(8).text(`Date: ${booking.date} | Time: ${booking.time}`, 50, 335 + yShift);
      if (booking.occasion && booking.occasion !== 'None') {
        doc.text(`Occasion: ${booking.occasion}`, 50, 350 + yShift);
      }
      
      doc.fillColor('#333333').fontSize(10);
      doc.text(`${booking.guests} Guest(s)`, 280, 320 + yShift, { width: 90, align: 'right' });
      doc.text(`Rs. ${reservationFee.toLocaleString()}`, 370, 320 + yShift, { width: 90, align: 'right' });
      doc.text(`Rs. ${totalAmount.toLocaleString()}`, 470, 320 + yShift, { width: 80, align: 'right' });
      
      generateHr(380 + yShift);
      
      doc.font('Helvetica-Bold');
      doc.text('Total Reservation Fee Paid:', 270, 400 + yShift, { width: 190, align: 'right' });
      doc.text(`Rs. ${totalAmount.toLocaleString()}`, 470, 400 + yShift, { width: 80, align: 'right' });
      
      doc.fillColor('#666666').fontSize(8).font('Helvetica-Oblique');
      doc.text('* This amount will be deducted from your final food & beverage bill.', 50, 430 + yShift);
    }
    
    if (booking.specialRequests) {
      doc.fillColor('#333333').fontSize(10).font('Helvetica-Bold').text('Special Requests:', 50, 470 + yShift);
      doc.font('Helvetica').text(booking.specialRequests, 50, 485 + yShift, { width: 400 });
    }
    
    const bottomY = doc.page.height - 100;
    generateHr(bottomY - 20);
    doc.fillColor('#C5A880').fontSize(12).font('Times-Bold').text('Thank you for choosing Café Belmirah!', 50, bottomY, { align: 'center' });
    doc.fillColor('#666666').fontSize(8).font('Helvetica').text(`For any queries, please contact us at ${phone} or ${email}`, 50, bottomY + 15, { align: 'center' });
    
    doc.end();
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
