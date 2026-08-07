import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth';
import {
  login,
  getMe,
  createService,
  updateService,
  deleteService,
  createFAQ,
  updateFAQ,
  deleteFAQ,

  createTeam,
  updateTeam,
  deleteTeam,
  createTestimonial,
  updateTestimonial,
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
  deleteApplication
} from '../controllers/adminController';

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

// Helper to seed default admin on boot
async function ensureDefaultAdmin() {
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.admin.create({
        data: {
          username: 'admin',
          password: hashedPassword,
        },
      });
      console.log('✅ Default admin user created (admin / admin123)');
    }
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
  const url = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url });
});


// Redirect root /admin requests to the Next.js frontend admin URL
router.get('/', (_req: Request, res: Response) => {
  res.redirect('http://localhost:3000/admin');
});

// ─── AUTH ENDPOINTS ───────────────────────────────────────────────────────────
router.post('/api/auth/login', login);
router.get('/api/auth/me', authMiddleware, getMe);

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
router.get('/api/team', authMiddleware, getTeam);
router.post('/api/team', authMiddleware, createTeam);
router.put('/api/team/:id', authMiddleware, updateTeam);
router.delete('/api/team/:id', authMiddleware, deleteTeam);

// ─── TESTIMONIALS CRUD ────────────────────────────────────────────────────────
router.get('/api/testimonials', authMiddleware, getTestimonials);
router.post('/api/testimonials', authMiddleware, createTestimonial);
router.put('/api/testimonials/:id', authMiddleware, updateTestimonial);
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

export default router;
