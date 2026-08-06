import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth';

// ─── AUTH CONTROLLERS ─────────────────────────────────────────────────────────

export const login = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      user: { id: admin.id, username: admin.username } 
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.admin });
};

// ─── SERVICES CRUD ───────────────────────────────────────────────────────────


export const createService = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { num, icon, title, titleNp, desc, tags, price, pricing } = req.body;
    const item = await prisma.service.create({ 
      data: { 
        num, 
        icon, 
        title, 
        titleNp, 
        desc, 
        tags: JSON.stringify(tags || []), 
        price,
        pricing: JSON.stringify(pricing || [])
      } 
    });
    res.json({ ...item, tags: JSON.parse(item.tags), pricing: JSON.parse(item.pricing || '[]') });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { num, icon, title, titleNp, desc, tags, price, pricing } = req.body;
    const item = await prisma.service.update({ 
      where: { id: Number(req.params.id) }, 
      data: { 
        num, 
        icon, 
        title, 
        titleNp, 
        desc, 
        tags: JSON.stringify(tags || []), 
        price,
        pricing: JSON.stringify(pricing || [])
      } 
    });
    res.json({ ...item, tags: JSON.parse(item.tags), pricing: JSON.parse(item.pricing || '[]') });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.service.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── FAQS CRUD ────────────────────────────────────────────────────────────────


export const createFAQ = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { question, answer } = req.body;
    res.json(await prisma.fAQ.create({ data: { question, answer } }));
  } catch (error) {
    next(error);
  }
};

export const updateFAQ = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { question, answer } = req.body;
    res.json(await prisma.fAQ.update({ where: { id: Number(req.params.id) }, data: { question, answer } }));
  } catch (error) {
    next(error);
  }
};

export const deleteFAQ = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.fAQ.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};



// ─── TEAM CRUD ────────────────────────────────────────────────────────────────


export const createTeam = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { icon, role, name, desc, skills } = req.body;
    const item = await prisma.teamMember.create({ data: { icon, role, name, desc, skills: JSON.stringify(skills || []) } });
    res.json({ ...item, skills: JSON.parse(item.skills) });
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { icon, role, name, desc, skills } = req.body;
    const item = await prisma.teamMember.update({ where: { id: Number(req.params.id) }, data: { icon, role, name, desc, skills: JSON.stringify(skills || []) } });
    res.json({ ...item, skills: JSON.parse(item.skills) });
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.teamMember.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── TESTIMONIALS CRUD ────────────────────────────────────────────────────────


export const createTestimonial = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { stars, quote, icon, name, biz } = req.body;
    res.json(await prisma.testimonial.create({ data: { stars: Number(stars), quote, icon, name, biz } }));
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { stars, quote, icon, name, biz } = req.body;
    res.json(await prisma.testimonial.update({ where: { id: Number(req.params.id) }, data: { stars: Number(stars), quote, icon, name, biz } }));
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.testimonial.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── CONTACT MESSAGES ─────────────────────────────────────────────────────────

export const getMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }));
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.contactMessage.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── SERVICE ORDERS CRUD ──────────────────────────────────────────────────────

export const getOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.serviceOrder.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const order = await prisma.serviceOrder.update({
      where: { id: Number(req.params.id) },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.serviceOrder.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── ABOUT PAGE ──────────────────────────────────────────────────────────────


export const updateAboutPage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let about = await prisma.aboutPage.findFirst();
    if (!about) {
      about = await prisma.aboutPage.create({ data: {} });
    }

    const { hero, stats, story, values, milestones, teamMembers, cta } = req.body;

    const updated = await prisma.aboutPage.update({
      where: { id: about.id },
      data: {
        hero: hero !== undefined ? JSON.stringify(hero) : about.hero,
        stats: stats !== undefined ? JSON.stringify(stats) : about.stats,
        story: story !== undefined ? JSON.stringify(story) : about.story,
        values: values !== undefined ? JSON.stringify(values) : about.values,
        milestones: milestones !== undefined ? JSON.stringify(milestones) : about.milestones,
        teamMembers: teamMembers !== undefined ? JSON.stringify(teamMembers) : about.teamMembers,
        cta: cta !== undefined ? JSON.stringify(cta) : about.cta,
      },
    });

    res.json({
      ...updated,
      hero: JSON.parse(updated.hero),
      stats: JSON.parse(updated.stats),
      story: JSON.parse(updated.story),
      values: JSON.parse(updated.values),
      milestones: JSON.parse(updated.milestones),
      teamMembers: JSON.parse(updated.teamMembers),
      cta: JSON.parse(updated.cta),
    });
  } catch (error) {
    next(error);
  }
};

// ─── PRODUCT ECOSYSTEM CRUD ───────────────────────────────────────────────────

export const createProductEcosystem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { pillName, badge, title, description, image, demoUrl, category, tech, order, highlight } = req.body;
    const item = await (prisma as any).productEcosystem.create({
      data: {
        pillName,
        badge,
        title,
        description,
        image: image || '',
        demoUrl: demoUrl || '',
        category: category || 'Product',
        tech: tech ? JSON.stringify(tech) : '[]',
        order: Number(order) || 0,
        highlight: highlight !== undefined ? !!highlight : true,
      },
    });
    res.json({ ...item, tech: JSON.parse(item.tech || '[]') });
  } catch (error) {
    next(error);
  }
};

export const updateProductEcosystem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { pillName, badge, title, description, image, demoUrl, category, tech, order, highlight } = req.body;
    const item = await (prisma as any).productEcosystem.update({
      where: { id: Number(req.params.id) },
      data: {
        pillName,
        badge,
        title,
        description,
        image: image || '',
        demoUrl: demoUrl || '',
        category: category || 'Product',
        tech: tech ? JSON.stringify(tech) : '[]',
        order: Number(order) || 0,
        highlight: highlight !== undefined ? !!highlight : true,
      },
    });
    res.json({ ...item, tech: JSON.parse(item.tech || '[]') });
  } catch (error) {
    next(error);
  }
};

export const deleteProductEcosystem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await (prisma as any).productEcosystem.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

export const getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const [services, faqs, team, testimonials, messages, orders, products] = await Promise.all([
      prisma.service.count(),
      prisma.fAQ.count(),
      prisma.teamMember.count(),
      prisma.testimonial.count(),
      prisma.contactMessage.count(),
      prisma.serviceOrder.count(),
      (prisma as any).productEcosystem.count(),
    ]);
    res.json({ services, faqs, team, testimonials, messages, orders, products });
  } catch (error) {
    next(error);
  }
};

