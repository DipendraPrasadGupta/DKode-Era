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

// ─── JOB APPLICATIONS ─────────────────────────────────────────────────────────

export const getApplications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const apps = await (prisma as any).jobApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(apps);
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const app = await (prisma as any).jobApplication.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });
    res.json(app);
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await (prisma as any).jobApplication.delete({ where: { id: Number(req.params.id) } });
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

// ─── BLOGS CRUD ─────────────────────────────────────────────────────────────

export const getBlogsAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const blogs = await (prisma as any).blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

export const createBlogAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, slug, excerpt, content, coverImage, category, tags, author, authorRole, readTime, published, featured, allowModal } = req.body;
    
    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Article title is required.' });
      return;
    }

    const cleanTitle = String(title).trim();
    let finalSlug = slug && String(slug).trim() !== '' 
      ? String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (!finalSlug) {
      finalSlug = `blog-${Date.now()}`;
    } else {
      // Check if slug already exists to prevent unique constraint error
      const existing = await (prisma as any).blog.findUnique({ where: { slug: finalSlug } });
      if (existing) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    }

    const blogData: any = {
      title: cleanTitle,
      slug: finalSlug,
      excerpt: excerpt ? String(excerpt).trim() : '',
      content: content ? String(content).trim() : '',
      coverImage: coverImage ? String(coverImage).trim() : '',
      category: category ? String(category).trim() : 'Engineering',
      tags: tags ? String(tags).trim() : '',
      author: author ? String(author).trim() : 'D-Kode Era Team',
      authorRole: authorRole ? String(authorRole).trim() : 'Software Engineering',
      readTime: readTime ? String(readTime).trim() : '5 min read',
      published: published !== undefined ? Boolean(published) : true,
      featured: featured !== undefined ? Boolean(featured) : false,
      allowModal: allowModal !== undefined ? Boolean(allowModal) : true,
    };

    const blog = await (prisma as any).blog.create({
      data: blogData,
    });
    res.status(201).json(blog);
  } catch (error: any) {
    console.error('❌ Error creating blog post:', error);
    res.status(400).json({ error: error.message || 'Failed to create blog post.' });
  }
};

export const updateBlogAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const blogId = Number(req.params.id);
    if (!blogId || isNaN(blogId)) {
      res.status(400).json({ error: 'Invalid blog ID.' });
      return;
    }

    const existingBlog = await (prisma as any).blog.findUnique({ where: { id: blogId } });
    if (!existingBlog) {
      res.status(404).json({ error: 'Blog post not found.' });
      return;
    }

    const { title, slug, excerpt, content, coverImage, category, tags, author, authorRole, readTime, published, featured, allowModal } = req.body;

    let finalSlug = existingBlog.slug;
    if (slug && String(slug).trim() !== '' && String(slug).trim() !== existingBlog.slug) {
      const candidateSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (candidateSlug) {
        const slugOwner = await (prisma as any).blog.findUnique({ where: { slug: candidateSlug } });
        if (!slugOwner || slugOwner.id === blogId) {
          finalSlug = candidateSlug;
        } else {
          finalSlug = `${candidateSlug}-${Date.now()}`;
        }
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (finalSlug) updateData.slug = finalSlug;
    if (excerpt !== undefined) updateData.excerpt = String(excerpt).trim();
    if (content !== undefined) updateData.content = String(content).trim();
    if (coverImage !== undefined) updateData.coverImage = String(coverImage).trim();
    if (category !== undefined) updateData.category = String(category).trim();
    if (tags !== undefined) updateData.tags = String(tags).trim();
    if (author !== undefined) updateData.author = String(author).trim();
    if (authorRole !== undefined) updateData.authorRole = String(authorRole).trim();
    if (readTime !== undefined) updateData.readTime = String(readTime).trim();
    if (published !== undefined) updateData.published = Boolean(published);
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (allowModal !== undefined) updateData.allowModal = Boolean(allowModal);

    const updatedBlog = await (prisma as any).blog.update({
      where: { id: blogId },
      data: updateData,
    });
    res.json(updatedBlog);
  } catch (error: any) {
    console.error('❌ Error updating blog post:', error);
    res.status(400).json({ error: error.message || 'Failed to update blog post.' });
  }
};



export const deleteBlogAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await (prisma as any).blog.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── CAREERS CRUD ─────────────────────────────────────────────────────────────

export const getCareersAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const careers = await (prisma as any).career.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    const formatted = careers.map((c: any) => ({
      ...c,
      tags: typeof c.tags === 'string' ? JSON.parse(c.tags || '[]') : c.tags,
    }));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const createCareerAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, department, type, location, experience, salary, description, responsibilities, requirements, benefits, tags, color, published, order, heroDesc, whyJoinItems, applySteps, companyTagline, companyFounded, companyLocation, companyFocus, companyCulture } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required.' });
      return;
    }
    const parseArray = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
      return [];
    };

    const tagsArray = Array.isArray(tags) ? tags : String(tags || '').split(',').map(t => t.trim()).filter(Boolean);

    const career = await (prisma as any).career.create({
      data: {
        title: String(title).trim(),
        department: String(department || 'Engineering').trim(),
        type: String(type || 'Full-time').trim(),
        location: String(location || 'Butwal / Remote').trim(),
        experience: String(experience || '2+ Years').trim(),
        salary: String(salary || 'Competitive / Negotiable').trim(),
        description: String(description).trim(),
        responsibilities: JSON.stringify(parseArray(responsibilities)),
        requirements: JSON.stringify(parseArray(requirements)),
        benefits: JSON.stringify(parseArray(benefits)),
        tags: JSON.stringify(tagsArray),
        color: String(color || '#06b6d4').trim(),
        published: published !== undefined ? Boolean(published) : true,
        order: Number(order || 0),
        heroDesc: String(heroDesc || '').trim(),
        whyJoinItems: String(whyJoinItems || '').trim(),
        applySteps: String(applySteps || '').trim(),
        companyTagline: String(companyTagline || '').trim(),
        companyFounded: String(companyFounded || '').trim(),
        companyLocation: String(companyLocation || '').trim(),
        companyFocus: String(companyFocus || '').trim(),
        companyCulture: String(companyCulture || '').trim(),
      },
    });
    res.status(201).json({
      ...career,
      tags: JSON.parse(career.tags || '[]'),
      responsibilities: JSON.parse(career.responsibilities || '[]'),
      requirements: JSON.parse(career.requirements || '[]'),
      benefits: JSON.parse(career.benefits || '[]'),
    });
  } catch (error: any) {
    console.error('❌ Error creating career opening:', error);
    res.status(400).json({ error: error.message || 'Failed to create career opening.' });
  }
};

export const updateCareerAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const careerId = Number(req.params.id);
    if (!careerId || isNaN(careerId)) {
      res.status(400).json({ error: 'Invalid career ID.' });
      return;
    }

    const { title, department, type, location, experience, salary, description, responsibilities, requirements, benefits, tags, color, published, order, heroDesc, whyJoinItems, applySteps, companyTagline, companyFounded, companyLocation, companyFocus, companyCulture } = req.body;
    const parseArray = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
      return [];
    };

    const updateData: any = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (department !== undefined) updateData.department = String(department).trim();
    if (type !== undefined) updateData.type = String(type).trim();
    if (location !== undefined) updateData.location = String(location).trim();
    if (experience !== undefined) updateData.experience = String(experience).trim();
    if (salary !== undefined) updateData.salary = String(salary).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (responsibilities !== undefined) updateData.responsibilities = JSON.stringify(parseArray(responsibilities));
    if (requirements !== undefined) updateData.requirements = JSON.stringify(parseArray(requirements));
    if (benefits !== undefined) updateData.benefits = JSON.stringify(parseArray(benefits));
    if (tags !== undefined) {
      const tagsArray = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean);
      updateData.tags = JSON.stringify(tagsArray);
    }
    if (color !== undefined) updateData.color = String(color).trim();
    if (published !== undefined) updateData.published = Boolean(published);
    if (order !== undefined) updateData.order = Number(order);
    if (heroDesc !== undefined) updateData.heroDesc = String(heroDesc).trim();
    if (whyJoinItems !== undefined) updateData.whyJoinItems = String(whyJoinItems).trim();
    if (applySteps !== undefined) updateData.applySteps = String(applySteps).trim();
    if (companyTagline !== undefined) updateData.companyTagline = String(companyTagline).trim();
    if (companyFounded !== undefined) updateData.companyFounded = String(companyFounded).trim();
    if (companyLocation !== undefined) updateData.companyLocation = String(companyLocation).trim();
    if (companyFocus !== undefined) updateData.companyFocus = String(companyFocus).trim();
    if (companyCulture !== undefined) updateData.companyCulture = String(companyCulture).trim();

    const updated = await (prisma as any).career.update({
      where: { id: careerId },
      data: updateData,
    });
    res.json({
      ...updated,
      tags: JSON.parse(updated.tags || '[]'),
      responsibilities: JSON.parse(updated.responsibilities || '[]'),
      requirements: JSON.parse(updated.requirements || '[]'),
      benefits: JSON.parse(updated.benefits || '[]'),
    });
  } catch (error: any) {
    console.error('❌ Error updating career opening:', error);
    res.status(400).json({ error: error.message || 'Failed to update career opening.' });
  }
};

export const deleteCareerAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await (prisma as any).career.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

export const getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const [services, faqs, team, testimonials, messages, orders, products, blogs, careers, applications] = await Promise.all([
      prisma.service.count(),
      prisma.fAQ.count(),
      prisma.teamMember.count(),
      prisma.testimonial.count(),
      prisma.contactMessage.count(),
      prisma.serviceOrder.count(),
      (prisma as any).productEcosystem.count(),
      (prisma as any).blog.count(),
      (prisma as any).career.count(),
      (prisma as any).jobApplication.count(),
    ]);
    res.json({ services, faqs, team, testimonials, messages, orders, products, blogs, careers, applications });
  } catch (error) {
    next(error);
  }
};



