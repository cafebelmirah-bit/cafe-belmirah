import { Request, Response } from 'express';
import { razorpayInstance } from '../utils/razorpay';
import { sendBookingConfirmation } from '../utils/mailer';
import crypto from 'crypto';
import { Booking } from '../models/Booking';
import { Reservation } from '../models/Reservation';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, receipt } = req.body;
    
    // Amount should be in paisa (smallest currency unit)
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt,
    };
    
    const order = await razorpayInstance.orders.create(options);
    if (!order) return res.status(500).send('Error creating order');
    
    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData, type } = req.body;
    
    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET';
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto.createHmac('sha256', secret)
                                    .update(body.toString())
                                    .digest('hex');
                                    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
    
    let referenceId = '';
    let detailsStr = '';
    
    let amountPaid = null;
    if (razorpay_payment_id) {
      try {
        const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);
        amountPaid = payment.amount; // in paisa
      } catch (err) {
        console.error("Error fetching payment details from razorpay", err);
      }
    }

    const enhancedBookingData = {
      ...bookingData,
      paymentId: razorpay_payment_id,
      amountPaid
    };
    
    if (type === 'booking') {
      const booking = await Booking.create(enhancedBookingData);
      referenceId = booking.referenceId;
      detailsStr = `Room: ${booking.roomType}<br>Check-in: ${booking.checkIn}<br>Check-out: ${booking.checkOut}<br>Guests: ${booking.guests}`;
    } else {
      const reservation = await Reservation.create(enhancedBookingData);
      referenceId = reservation.referenceId;
      detailsStr = `Date: ${reservation.date}<br>Time: ${reservation.time}<br>Guests: ${reservation.guests}`;
    }
    
    // Payment verified, send email asynchronously
    sendBookingConfirmation(bookingData.email, bookingData.name, referenceId, detailsStr).catch(console.error);
    
    res.json({ success: true, referenceId, message: 'Payment verified successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
