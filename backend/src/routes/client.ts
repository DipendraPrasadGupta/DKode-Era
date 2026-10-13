import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getServices,
  getServiceBySlug,
  getFAQs,
  getTeam, 
  getTestimonials,
  submitTestimonial,
  getAboutPage,
  getProductEcosystem,
  getBlogs,
  getBlogBySlug,
  incrementBlogView,
  toggleBlogLike,
  getComments,
  postComment,
  getCareers,
  getCareerById,
  submitContactForm,
  submitJobApplication,
  submitOrder
} from '../controllers/clientController';
import { getSiteSettings } from '../controllers/adminController';
import { pingVisitor, getVisitorStats } from '../controllers/visitorController';
import { getIotProjects, getIotProjectById } from '../controllers/iotController';

import rateLimit from 'express-rate-limit';

const router = Router();
const testimonialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many testimonials submitted. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── CV / Resume Upload (public) ─────────────────────────────────────────────
const cvUploadsDir = path.join(__dirname, '../../uploads/cv');
if (!fs.existsSync(cvUploadsDir)) fs.mkdirSync(cvUploadsDir, { recursive: true });

const MIME_TO_CV_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
};

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, cvUploadsDir),
  filename: (_req, file, cb) => {
    const ext = MIME_TO_CV_EXT[file.mimetype] || '.pdf';
    cb(null, `cv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
  },
});

const cvUpload = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = MIME_TO_CV_EXT[file.mimetype];
    if (safeExt && ['.pdf', '.doc', '.docx'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents (.pdf, .doc, .docx) are allowed.'));
    }
  },
});

router.post('/cv-upload', cvUpload.single('cv'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const url = `/uploads/cv/${req.file.filename}`;
  return res.json({ url, filename: req.file.filename });
});

// ─── AVATAR / IMAGE UPLOAD (public for reviews) ─────────────────────────────
const avatarUploadsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarUploadsDir)) fs.mkdirSync(avatarUploadsDir, { recursive: true });

const MIME_TO_IMG_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarUploadsDir),
  filename: (_req, file, cb) => {
    const ext = MIME_TO_IMG_EXT[file.mimetype] || '.jpg';
    cb(null, `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = MIME_TO_IMG_EXT[file.mimetype];
    if (allowed && ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, or GIF image files are allowed.'));
    }
  },
});

router.post('/avatar-upload', avatarUpload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const url = `/uploads/avatars/${req.file.filename}`;
  return res.json({ url, filename: req.file.filename });
});

// GET endpoints for client landing page
router.get('/services/:slug', getServiceBySlug);
router.get('/services', getServices);
router.get('/faqs', getFAQs);

router.get('/team', getTeam);
router.get('/testimonials', getTestimonials);
router.post('/testimonials', testimonialLimiter, submitTestimonial);

router.get('/about', getAboutPage);
router.get('/products', getProductEcosystem);
router.get('/careers/:id', getCareerById);
router.get('/careers', getCareers);
router.get('/blogs/:slug', getBlogBySlug);
router.get('/blogs', getBlogs);
router.post('/blogs/:slug/view', incrementBlogView);
router.post('/blogs/:slug/like', toggleBlogLike);
router.get('/blogs/:slug/comments', getComments);
router.post('/blogs/:slug/comments', postComment);

// POST endpoints for contact form and dynamic purchase orders
router.post('/contact', submitContactForm);
router.post('/messages', submitContactForm); // Alias for contact form
router.post('/orders', submitOrder);
router.post('/apply', submitJobApplication); // Job application submission

// Public site settings (no auth required — used by frontend pages)
router.get('/settings', getSiteSettings);

// ─── REAL VISITOR TRACKING ───────────────────────────────────────────────────
// POST: called on page load to register/refresh a visit (IP+UA fingerprinted)
router.post('/visitors/ping', pingVisitor);
// GET: read-only stats for fetching current counts without registering a visit
router.get('/visitors', getVisitorStats);

// ─── IOT PROJECTS (public) ───────────────────────────────────────────────────
router.get('/iot-projects', getIotProjects);
router.get('/iot-projects/:id', getIotProjectById);

export default router;


