import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// GET Services
export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await prisma.service.findMany();
    const formattedServices = services.map(s => ({
      ...s,
      tags: JSON.parse(s.tags),
      pricing: JSON.parse(s.pricing || '[]')
    }));
    res.json(formattedServices);
  } catch (error) {
    next(error);
  }
};

// GET Single Service by slug
export const getServiceBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slugParam = req.params.slug;
    const slugStr = Array.isArray(slugParam) ? slugParam[0] : String(slugParam);
    const services = await prisma.service.findMany();
    const found = services.find(s =>
      s.title.toLowerCase().replace(/\s+/g, '-') === slugStr.toLowerCase() ||
      s.title.toLowerCase() === slugStr.split('-').join(' ').toLowerCase()
    );
    if (!found) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json({
      ...found,
      tags: JSON.parse(found.tags),
      pricing: JSON.parse(found.pricing || '[]')
    });
  } catch (error) {
    next(error);
  }
};


// GET FAQs
export const getFAQs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faqs = await prisma.fAQ.findMany();
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};



// GET Team
export const getTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const team = await prisma.teamMember.findMany();
    const formattedTeam = team.map(t => ({
      ...t,
      skills: JSON.parse(t.skills)
    }));
    res.json(formattedTeam);
  } catch (error) {
    next(error);
  }
};

// GET Testimonials
export const getTestimonials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const testimonials = await prisma.testimonial.findMany();
    res.json(testimonials);
  } catch (error) {
    next(error);
  }
};

// GET About Page
export const getAboutPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let about = await prisma.aboutPage.findFirst();
    if (!about) {
      about = await prisma.aboutPage.create({ data: {} });
    }
    res.json({
      ...about,
      hero: JSON.parse(about.hero),
      stats: JSON.parse(about.stats),
      story: JSON.parse(about.story),
      values: JSON.parse(about.values),
      milestones: JSON.parse(about.milestones),
      teamMembers: JSON.parse(about.teamMembers),
      cta: JSON.parse(about.cta),
    });
  } catch (error) {
    next(error);
  }
};

// POST Contact Form
export const submitContactForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, email, company, service, budget, timeline, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required.' });
      return;
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        phone: phone || '',
        email,
        company: company || '',
        serviceNeeded: service || '',
        budget: budget || '',
        timeline: timeline || '',
        message
      }
    });

    res.status(201).json({ success: true, message: 'Message sent successfully!', data: newMessage });
  } catch (error) {
    next(error);
  }
};

// POST Submit Order / Purchase request
export const submitOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceName, tierName, price, userName, userEmail, userPhone, message } = req.body;

    if (!serviceName || !tierName || !price || !userName || !userEmail || !userPhone || !message) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    const newOrder = await prisma.serviceOrder.create({
      data: {
        serviceName,
        tierName,
        price,
        userName,
        userEmail,
        userPhone,
        message
      }
    });

    res.status(201).json({ success: true, message: 'Purchase request submitted successfully!', data: newOrder });
  } catch (error) {
    next(error);
  }
};

// GET Product Ecosystem items (auto-seeds defaults if empty)
export const getProductEcosystem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let items = await (prisma as any).productEcosystem.findMany({
      orderBy: { order: 'asc' },
    });

    if (items.length === 0) {
      const DEFAULT_PRODUCTS = [
        {
          pillName: 'RESTRO MS',
          badge: 'HOSPITALITY MANAGEMENT REVOLUTION',
          title: 'Restro Ms',
          description: 'Restro MS helps to manage restaurants in meal ordering, billing and inventory control more efficiently. With POS systems deliver orders directly to kitchen and bill payment in reception. It supports seamless customer experience with easy to use features.',
          image: '',
          demoUrl: '',
          category: 'Product',
          tech: JSON.stringify(['React', 'Node.js', 'PostgreSQL']),
          order: 1,
          highlight: true,
        },
        {
          pillName: 'SMART KAROBAR',
          badge: 'ENTERPRISE BUSINESS MANAGEMENT',
          title: 'Smart Karobar',
          description: 'Comprehensive business ERP for inventory tracking, multi-branch sales management, accounting integration, and daily revenue analytics designed for modern enterprises.',
          image: '',
          demoUrl: '',
          category: 'Product',
          tech: JSON.stringify(['React', 'Node.js', 'Redis']),
          order: 2,
          highlight: false,
        },
        {
          pillName: 'UPASTHITI',
          badge: 'SMART ATTENDANCE & HR ECOSYSTEM',
          title: 'Upasthiti',
          description: 'AI-powered biometric and location-based employee attendance, leave management, automated payroll generation, and HR performance tracking system.',
          image: '',
          demoUrl: '',
          category: 'Product',
          tech: JSON.stringify(['React Native', 'Node.js']),
          order: 3,
          highlight: false,
        },
        {
          pillName: 'MENU MA K CHHA',
          badge: 'DIGITAL QR MENU & ORDERING',
          title: 'Menu Ma K Chha',
          description: 'Contactless digital QR code menu with live order placement, table reservation, instant kitchen notification, and customer feedback collection.',
          image: '',
          demoUrl: '',
          category: 'Product',
          tech: JSON.stringify(['React', 'Next.js']),
          order: 4,
          highlight: false,
        },
        {
          pillName: 'ATITHYA',
          badge: 'HOTEL & RESORT MANAGEMENT',
          title: 'Atithya',
          description: 'All-in-one hospitality management suite for hotel room bookings, guest check-in/out, housekeeping tasks, billing, and channel management.',
          image: '',
          demoUrl: '',
          category: 'Product',
          tech: JSON.stringify(['React', 'Node.js', 'PostgreSQL']),
          order: 5,
          highlight: false,
        },
        {
          pillName: 'SMART TRAINING',
          badge: 'LMS & SKILL DEVELOPMENT',
          title: 'Smart Training',
          description: 'Interactive Learning Management System (LMS) with course hosting, student progress tracking, live assessments, and automated certificate generation.',
          image: '',
          demoUrl: '',
          category: 'Product',
          tech: JSON.stringify(['React', 'Node.js', 'AWS']),
          order: 6,
          highlight: false,
        },
        {
          pillName: 'N-CARD',
          badge: 'DIGITAL NFC & SMART NETWORKING',
          title: 'N-Card',
          description: 'Next-generation digital business card solution using NFC and dynamic QR codes for instant contact sharing, lead capture, and social profile links.',
          image: '',
          demoUrl: '',
          category: 'Product',
          tech: JSON.stringify(['React', 'NFC', 'Next.js']),
          order: 7,
          highlight: false,
        },
      ];

      for (const prod of DEFAULT_PRODUCTS) {
        await (prisma as any).productEcosystem.create({ data: prod });
      }

      items = await (prisma as any).productEcosystem.findMany({
        orderBy: { order: 'asc' },
      });
    }

    res.json(items.map((i: any) => ({ ...i, tech: JSON.parse(i.tech || '[]') })));
  } catch (error) {
    next(error);
  }
};

