import { Router } from 'express';
import { 
  getServices,
  getServiceBySlug,
  getFAQs,
  getTeam, 
  getTestimonials,
  getAboutPage,
  getProductEcosystem,
  submitContactForm,
  submitOrder
} from '../controllers/clientController';

const router = Router();

// GET endpoints for client landing page
router.get('/services/:slug', getServiceBySlug);
router.get('/services', getServices);
router.get('/faqs', getFAQs);

router.get('/team', getTeam);
router.get('/testimonials', getTestimonials);
router.get('/about', getAboutPage);
router.get('/products', getProductEcosystem);

// POST endpoints for contact form and dynamic purchase orders
router.post('/contact', submitContactForm);
router.post('/messages', submitContactForm); // Alias for contact form
router.post('/orders', submitOrder);

export default router;

