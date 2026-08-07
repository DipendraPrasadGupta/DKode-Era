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

const router = Router();

// ─── CV / Resume Upload (public) ─────────────────────────────────────────────
const cvUploadsDir = path.join(__dirname, '../../uploads/cv');
if (!fs.existsSync(cvUploadsDir)) fs.mkdirSync(cvUploadsDir, { recursive: true });

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, cvUploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const cvUpload = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  },
});

router.post('/cv-upload', cvUpload.single('cv'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const url = `http://localhost:5000/uploads/cv/${req.file.filename}`;
  return res.json({ url, filename: req.file.filename });
});

// GET endpoints for client landing page
router.get('/services/:slug', getServiceBySlug);
router.get('/services', getServices);
router.get('/faqs', getFAQs);

router.get('/team', getTeam);
router.get('/testimonials', getTestimonials);
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

export default router;

