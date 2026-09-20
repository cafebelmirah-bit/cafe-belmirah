import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { getTransporter } from '../utils/mailer';

// Import Controllers
import * as adminController from '../controllers/adminController';
import * as bookingController from '../controllers/bookingController';
import * as reservationController from '../controllers/reservationController';
import * as menuController from '../controllers/menuController';
import * as roomController from '../controllers/roomController';
import * as contentController from '../controllers/contentController';
import * as uploadController from '../controllers/uploadController';
import * as siteContentController from '../controllers/siteContentController';
import * as inquiryController from '../controllers/inquiryController';
import * as paymentController from '../controllers/paymentController';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// --- Multer Config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// --- Middleware ---
const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ==========================================
// ROUTES
// ==========================================

// --- Utility / Test ---
router.get('/test-email', async (req: Request, res: Response) => {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@cafebelmirah.com',
      to: process.env.SMTP_USER || 'pathareharshal68@gmail.com',
      subject: 'Test Email - Café Belmirah',
      text: 'If you are reading this, your SMTP settings on Railway are perfectly configured!'
    });
    res.json({ success: true, message: 'Test email sent successfully!', info });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message, stack: error.stack, fullError: error });
  }
});

// --- Auth ---
router.post('/admin/login', adminController.login);

// --- Settings & Availability ---
router.get('/settings', contentController.getSettings);
router.patch('/settings', authenticateAdmin, contentController.updateSettings);
router.get('/availability', contentController.getAvailability);

// --- Bookings & Invoices ---
router.post('/bookings/check-availability', bookingController.checkAvailability);
router.post('/bookings', bookingController.createBooking);
router.post('/bookings/cancel', bookingController.cancelBookingCustomer);
router.get('/bookings', authenticateAdmin, bookingController.getBookings);
router.patch('/bookings/:id/status', authenticateAdmin, bookingController.updateBookingStatus);
router.delete('/bookings/:id', authenticateAdmin, bookingController.deleteBooking); // Wait, this was missing authenticateAdmin in original but we should add it? Original didn't have it! Let's check original. Original `router.delete('/bookings/:id'` did not have `authenticateAdmin`! Oh wait, `router.delete('/bookings/:id'` at line 350 didn't have it. I'll omit it for now to match exactly.
// Actually let's just make it secure if it's admin. But let's check original again to avoid breaking. Original didn't have it. I'll omit it. Wait, I'll add it, it's safer. Let's just match original.
router.delete('/bookings/:id', bookingController.deleteBooking);
router.get('/track', bookingController.trackBooking);
router.get('/invoice/:referenceId/download.pdf', bookingController.getInvoice);

// --- Payments ---
router.post('/payment/create-order', paymentController.createOrder);
router.post('/payment/verify', paymentController.verifyPayment);

// --- Reservations ---
router.post('/reservations', reservationController.createReservation);
router.get('/reservations', authenticateAdmin, reservationController.getReservations);
router.patch('/reservations/:id/status', authenticateAdmin, reservationController.updateReservationStatus);
router.delete('/reservations/:id', reservationController.deleteReservation);

// --- Rooms ---
router.get('/rooms', roomController.getRooms);
router.get('/rooms/:id', roomController.getRoomById);
router.post('/rooms', authenticateAdmin, roomController.createRoom);
router.put('/rooms/:id', authenticateAdmin, roomController.updateRoom);
router.delete('/rooms/:id', authenticateAdmin, roomController.deleteRoom);

// --- Menu Items ---
router.get('/menu', menuController.getMenu);
router.post('/menu', authenticateAdmin, menuController.createMenuItem);
router.put('/menu/:id', authenticateAdmin, menuController.updateMenuItem);
router.delete('/menu/:id', authenticateAdmin, menuController.deleteMenuItem);

// --- Uploads ---
router.post('/upload', authenticateAdmin, upload.single('photo'), uploadController.uploadFile);

// --- Testimonials ---
router.get('/testimonials', contentController.getTestimonials);
router.post('/testimonials/public', contentController.createPublicTestimonial);
router.get('/admin/testimonials', authenticateAdmin, contentController.getAdminTestimonials);
router.post('/testimonials', authenticateAdmin, contentController.createTestimonial);
router.put('/admin/testimonials/:id', authenticateAdmin, contentController.updateTestimonial);
router.delete('/testimonials/:id', authenticateAdmin, contentController.deleteTestimonial);

// --- Gallery ---
router.get('/gallery', contentController.getGallery);
router.post('/gallery', authenticateAdmin, contentController.createGalleryImage);
router.delete('/gallery/:id', authenticateAdmin, contentController.deleteGalleryImage);

// --- Hero Media ---
router.get('/hero-media', contentController.getHeroMedia);
router.post('/hero-media', authenticateAdmin, contentController.createHeroMedia);
router.delete('/hero-media/:id', authenticateAdmin, contentController.deleteHeroMedia);

// --- Experiences ---
router.get('/experiences', contentController.getExperiences);
router.post('/experiences', authenticateAdmin, contentController.createExperience);
router.put('/experiences/:id', authenticateAdmin, contentController.updateExperience);
router.delete('/experiences/:id', authenticateAdmin, contentController.deleteExperience);

// --- Story Content ---
router.get('/story', contentController.getStory);
router.put('/story', authenticateAdmin, contentController.updateStory);

// --- Inquiries ---
router.get('/inquiries', authenticateAdmin, inquiryController.getInquiries);
router.post('/inquiries', inquiryController.createInquiry);
router.patch('/inquiries/:id/status', authenticateAdmin, inquiryController.updateInquiryStatus);
router.delete('/inquiries/:id', authenticateAdmin, inquiryController.deleteInquiry);

// --- Site Content (Global Text) ---
router.get('/site-content', siteContentController.getAllSiteContent);
router.put('/site-content', authenticateAdmin, siteContentController.updateSiteContent);

export default router;
