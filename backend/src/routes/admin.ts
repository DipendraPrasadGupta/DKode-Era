import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { authMiddleware } from '../middleware/auth';
import {
  login,
  getMe,
  changePassword,
  createService,
  updateService,
  deleteService,
  createFAQ,
  updateFAQ,
  deleteFAQ,

  getTeamAdmin,
  createTeam,
  updateTeam,
  updateTeamOrder,
  deleteTeam,
  getTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  updateTestimonialStatus,
  deleteTestimonial,
  getMessages,
  deleteMessage,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getStats,
  updateAboutPage,
  createProductEcosystem,
  updateProductEcosystem,
  deleteProductEcosystem,
  getBlogsAdmin,
  createBlogAdmin,
  updateBlogAdmin,
  deleteBlogAdmin,
  getCareersAdmin,
  createCareerAdmin,
  updateCareerAdmin,
  deleteCareerAdmin,
  getApplications,
  updateApplicationStatus,
  deleteApplication,
  getSiteSettings,
  updateSiteSettings
} from '../controllers/adminController';

import {
  getNotifications,
  sendNotification,
  deleteNotification,
  getSubscribers,
  addSubscriber,
  updateSubscriber,
  deleteSubscriber,
} from '../controllers/notificationController';

import {
  getServices,
  getFAQs,

  getTeam,
  getTestimonials,
  getAboutPage,
  getProductEcosystem
} from '../controllers/clientController';


const router = Router();

// ─── BLOGS CRUD ─────────────────────────────────────────────────────────────
router.get('/api/blogs', authMiddleware, getBlogsAdmin);
router.post('/api/blogs', authMiddleware, createBlogAdmin);
router.put('/api/blogs/:id', authMiddleware, updateBlogAdmin);
router.delete('/api/blogs/:id', authMiddleware, deleteBlogAdmin);

// Helper to seed/update default admin on boot
async function ensureDefaultAdmin() {
  try {
    const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
    await prisma.admin.upsert({
      where: { username: 'admin' },
      update: { password: hashedPassword },
      create: {
        username: 'admin',
        password: hashedPassword,
      },
    });
    console.log(`✅ Admin credentials synchronized for username: admin`);
  } catch (err) {
    console.error('❌ Error ensuring default admin user:', err);
  }
}
ensureDefaultAdmin();

// ─── FILE UPLOAD (Multer) ─────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed.'));
  },
});

router.post('/api/upload', authMiddleware, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided.' }) as any;
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});


// Redirect root /admin requests to the Next.js frontend admin URL
router.get('/', (_req: Request, res: Response) => {
  res.redirect('http://localhost:3000/admin');
});

// ─── AUTH ENDPOINTS ───────────────────────────────────────────────────────────
router.post('/api/auth/login', login);
router.get('/api/auth/me', authMiddleware, getMe);
router.post('/api/auth/change-password', authMiddleware, changePassword);

// ─── SERVICES CRUD ───────────────────────────────────────────────────────────
router.get('/api/services', authMiddleware, getServices);
router.post('/api/services', authMiddleware, createService);
router.put('/api/services/:id', authMiddleware, updateService);
router.delete('/api/services/:id', authMiddleware, deleteService);

// ─── FAQS CRUD ────────────────────────────────────────────────────────────────
router.get('/api/faqs', authMiddleware, getFAQs);
router.post('/api/faqs', authMiddleware, createFAQ);
router.put('/api/faqs/:id', authMiddleware, updateFAQ);
router.delete('/api/faqs/:id', authMiddleware, deleteFAQ);



// ─── TEAM CRUD ────────────────────────────────────────────────────────────────
router.get('/api/team', authMiddleware, getTeamAdmin);
router.post('/api/team', authMiddleware, createTeam);
router.put('/api/team/:id', authMiddleware, updateTeam);
router.patch('/api/team/:id/order', authMiddleware, updateTeamOrder);
router.delete('/api/team/:id', authMiddleware, deleteTeam);

// ─── TESTIMONIALS CRUD ────────────────────────────────────────────────────────
router.get('/api/testimonials', authMiddleware, getTestimonialsAdmin);
router.post('/api/testimonials', authMiddleware, createTestimonial);
router.put('/api/testimonials/:id', authMiddleware, updateTestimonial);
router.patch('/api/testimonials/:id/status', authMiddleware, updateTestimonialStatus);
router.delete('/api/testimonials/:id', authMiddleware, deleteTestimonial);

// ─── CONTACT MESSAGES (read-only) ─────────────────────────────────────────────
router.get('/api/messages', authMiddleware, getMessages);
router.delete('/api/messages/:id', authMiddleware, deleteMessage);

// ─── SERVICE ORDERS CRUD ──────────────────────────────────────────────────────
router.get('/api/orders', authMiddleware, getOrders);
router.put('/api/orders/:id', authMiddleware, updateOrderStatus);
router.delete('/api/orders/:id', authMiddleware, deleteOrder);

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
router.get('/api/stats', authMiddleware, getStats);

// ─── ABOUT PAGE ──────────────────────────────────────────────────────────────
router.get('/api/about', authMiddleware, getAboutPage);
router.put('/api/about', authMiddleware, updateAboutPage);

// ─── PRODUCT ECOSYSTEM CRUD ──────────────────────────────────────────────────
router.get('/api/products', authMiddleware, getProductEcosystem);
router.post('/api/products', authMiddleware, createProductEcosystem);
router.put('/api/products/:id', authMiddleware, updateProductEcosystem);
router.delete('/api/products/:id', authMiddleware, deleteProductEcosystem);

// ─── CAREERS CRUD ────────────────────────────────────────────────────────────
router.get('/api/careers', authMiddleware, getCareersAdmin);
router.post('/api/careers', authMiddleware, createCareerAdmin);
router.put('/api/careers/:id', authMiddleware, updateCareerAdmin);
router.delete('/api/careers/:id', authMiddleware, deleteCareerAdmin);

// ─── JOB APPLICATIONS ────────────────────────────────────────────────────────
router.get('/api/applications', authMiddleware, getApplications);
router.patch('/api/applications/:id/status', authMiddleware, updateApplicationStatus);
router.delete('/api/applications/:id', authMiddleware, deleteApplication);

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
router.get('/api/notifications', authMiddleware, getNotifications);
router.post('/api/notifications/send', authMiddleware, sendNotification);
router.delete('/api/notifications/:id', authMiddleware, deleteNotification);

// ─── SUBSCRIBERS ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
router.get('/api/subscribers', authMiddleware, getSubscribers);
router.post('/api/subscribers', authMiddleware, addSubscriber);
router.patch('/api/subscribers/:id', authMiddleware, updateSubscriber);
router.delete('/api/subscribers/:id', authMiddleware, deleteSubscriber);

// ─── SITE SETTINGS ───────────────────────────────────────────────────────────
router.get('/api/settings', authMiddleware, getSiteSettings);
router.put('/api/settings', authMiddleware, updateSiteSettings);

export default router;
