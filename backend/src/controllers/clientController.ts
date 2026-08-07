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

// POST /api/apply — Submit a Job Application
export const submitJobApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { careerId, careerTitle, department, name, email, phone, portfolio, cvUrl, resumeLink, coverNote } = req.body;

    if (!careerId || !name || !email || !coverNote) {
      res.status(400).json({ error: 'careerId, name, email, and coverNote are required.' });
      return;
    }

    const application = await (prisma as any).jobApplication.create({
      data: {
        careerId: Number(careerId),
        careerTitle: careerTitle || '',
        department: department || '',
        name,
        email,
        phone: phone || '',
        portfolio: portfolio || '',
        cvUrl: cvUrl || '',
        resumeLink: resumeLink || '',
        coverNote,
        status: 'New',
      },
    });

    res.status(201).json({ success: true, message: 'Application submitted successfully!', data: application });
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

// GET Blogs (Public, seeds defaults if empty)
export const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let blogs = await (prisma as any).blog.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });

    if (blogs.length === 0) {
      const DEFAULT_BLOGS = [
        {
          title: 'Building Scalable Next.js 15 Applications in 2026: Best Practices',
          slug: 'building-scalable-nextjs-15-applications-in-2026',
          excerpt: 'Explore modern server components, streaming SSR, performance optimizations, and zero-bundle size state management for enterprise Web apps.',
          content: `## Modern Next.js 15 Development\n\nNext.js 15 represents a massive leap forward in React framework performance, server component architecture, and developer productivity.\n\n### Key Pillars of Modern App Development:\n1. **Server Components First**: Render heavy computations on the server to keep your bundle ultra-lean.\n2. **Streaming & Suspense**: Deliver instant UI skeletons while async data streams smoothly into place.\n3. **Advanced Caching Control**: Explicit cache tags and revalidation primitives ensure high data freshness.\n\nBuilding scalable applications requires careful architecture from day one. At **D-Kode Era**, we combine cutting-edge frontend patterns with robust Node.js and PostgreSQL backends to deliver lightning-fast digital experiences.`,
          coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
          category: 'Engineering',
          author: 'Dipendra Prasad Gupta',
          authorRole: 'Founder & CEO',
          readTime: '6 min read',
          published: true,
          featured: true,
        },
        {
          title: 'Why Custom SaaS Outperforms Off-The-Shelf Software for Hotels & Retail in Nepal',
          slug: 'why-custom-saas-outperforms-off-the-shelf-software-in-nepal',
          excerpt: 'A deep dive into localized payment gateway integrations (eSewa, Khalti, Fonepay) and offline sync capabilities for Nepalese businesses.',
          content: `## Local Solutions for Local Realities\n\nOff-the-shelf foreign software often fails to meet the specific operational demands of businesses in Nepal. From tax compliance to local payment gateway integrations (eSewa, Khalti, Fonepay), custom-built SaaS products like **Restro MS** and **Atithya** offer unmatched flexibility.\n\n### Why Custom SaaS Wins:\n- **Direct eSewa & Khalti Payments**: Instant checkout without currency conversion hurdles.\n- **Offline First Operations**: Local network resilience during internet disruptions.\n- **Dedicated Local Support**: Direct assistance from developers based right here in Butwal.`,
          coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
          category: 'Business',
          author: 'D-Kode Era Tech Team',
          authorRole: 'Product Engineering',
          readTime: '5 min read',
          published: true,
          featured: false,
        },
        {
          title: 'AI Micro-Agents & LLM Workflows: How Small Businesses Automate Customer Support',
          slug: 'ai-micro-agents-and-llm-workflows-for-small-businesses',
          excerpt: 'Learn how customized AI chatbots and multi-turn agents reduce response time by 80% and drive sales 24/7.',
          content: `## The AI Revolution for Business Automation\n\nArtificial Intelligence is no longer just for tech giants. Small and medium enterprises in Nepal are leveraging custom LLM chatbots to automate customer inquiries, process orders, and handle multi-lingual support in English and Nepali.\n\n### Impact of AI Micro-Agents:\n- **Instant 24/7 Customer Engagement**: Respond within milliseconds on WhatsApp, web chat, and social channels.\n- **Lead Qualification**: Capture customer preferences and routing qualified leads to sales reps automatically.\n- **Cost Reduction**: Reduce operational overhead while scaling support volume effortlessly.`,
          coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
          category: 'AI & Tech',
          author: 'AI Solutions Team',
          authorRole: 'AI Research',
          readTime: '8 min read',
          published: true,
          featured: false,
        },
      ];

      for (const blog of DEFAULT_BLOGS) {
        await (prisma as any).blog.create({ data: blog });
      }

      blogs = await (prisma as any).blog.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

// GET Single Blog by Slug
export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slugParam = req.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : String(slugParam);
    const blog = await (prisma as any).blog.findUnique({
      where: { slug },
    });
    if (!blog || !blog.published) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }
    res.json(blog);
  } catch (error) {
    next(error);
  }
};


// POST /blogs/:slug/view — increment view count
export const incrementBlogView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slugParam = req.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : String(slugParam);
    const updated = await (prisma as any).blog.update({
      where: { slug },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    res.json({ views: updated.views });
  } catch (error) {
    next(error);
  }
};

// POST /blogs/:slug/like — toggle like (pass { liked: true/false } from client)
export const toggleBlogLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slugParam = req.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : String(slugParam);
    const { liked } = req.body as { liked: boolean };
    const updated = await (prisma as any).blog.update({
      where: { slug },
      data: { likes: liked ? { increment: 1 } : { decrement: 1 } },
      select: { likes: true },
    });
    res.json({ likes: Math.max(0, updated.likes) });
  } catch (error) {
    next(error);
  }
};

// GET /blogs/:slug/comments — list approved comments for a post
export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slugParam = req.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : String(slugParam);

    const blog = await (prisma as any).blog.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!blog) { res.status(404).json({ error: 'Blog not found' }); return; }

    const comments = await (prisma as any).blogComment.findMany({
      where: { blogId: blog.id, approved: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, avatar: true, content: true, createdAt: true },
    });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// POST /blogs/:slug/comments — submit a new comment
export const postComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slugParam = req.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : String(slugParam);
    const { name, email, content } = req.body as { name: string; email?: string; content: string };

    if (!name?.trim() || !content?.trim()) {
      res.status(400).json({ error: 'Name and comment are required.' });
      return;
    }
    if (content.trim().length < 3) {
      res.status(400).json({ error: 'Comment is too short.' });
      return;
    }

    const blog = await (prisma as any).blog.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!blog) { res.status(404).json({ error: 'Blog not found' }); return; }

    const comment = await (prisma as any).blogComment.create({
      data: {
        blogId: blog.id,
        name: name.trim().slice(0, 80),
        email: (email || '').trim().slice(0, 120),
        avatar: name.trim().charAt(0).toUpperCase(),
        content: content.trim().slice(0, 2000),
        approved: true,
      },
      select: { id: true, name: true, avatar: true, content: true, createdAt: true },
    });
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// GET /careers — Fetch active job openings for Careers page
export const getCareers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let careers = await (prisma as any).career.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    // Auto-seed initial openings if table is empty
    if (careers.length === 0) {
      const initialOpenings = [
        {
          title: 'Senior Full-Stack Engineer (Next.js / Node / PostgreSQL)',
          department: 'Engineering',
          type: 'Full-time',
          location: 'Butwal / Remote (Nepal)',
          experience: '3+ Years',
          description: 'Lead the architecture and implementation of scalable web applications, custom SaaS products, and high-throughput APIs.',
          tags: JSON.stringify(['React', 'Next.js', 'TypeScript', 'Prisma', 'PostgreSQL']),
          color: '#06b6d4',
          published: true,
          order: 1,
        },
        {
          title: 'AI / LLM Integration Specialist',
          department: 'AI Research',
          type: 'Full-time',
          location: 'Remote / Office',
          experience: '2+ Years',
          description: 'Develop multi-agent workflows, vector database RAG pipelines, and intelligent chatbots for business automation.',
          tags: JSON.stringify(['Python', 'LangChain', 'OpenAI API', 'Vector DBs']),
          color: '#a855f7',
          published: true,
          order: 2,
        },
        {
          title: 'Product Designer (UI/UX & Glassmorphism Aesthetics)',
          department: 'Design',
          type: 'Full-time / Contract',
          location: 'Butwal / Remote',
          experience: '2+ Years',
          description: 'Craft intuitive web interfaces, mobile app visual languages, design systems, and modern interactive prototypes.',
          tags: JSON.stringify(['Figma', 'Design Systems', 'Prototyping', 'CSS/Web Aesthetics']),
          color: '#00e5a0',
          published: true,
          order: 3,
        },
      ];

      for (const item of initialOpenings) {
        await (prisma as any).career.create({ data: item });
      }

      careers = await (prisma as any).career.findMany({
        where: { published: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      });
    }

    const formatted = careers.map((c: any) => ({
      ...c,
      tags: typeof c.tags === 'string' ? JSON.parse(c.tags || '[]') : c.tags,
      responsibilities: typeof c.responsibilities === 'string' ? JSON.parse(c.responsibilities || '[]') : c.responsibilities,
      requirements: typeof c.requirements === 'string' ? JSON.parse(c.requirements || '[]') : c.requirements,
      benefits: typeof c.benefits === 'string' ? JSON.parse(c.benefits || '[]') : c.benefits,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// GET /careers/:id — Fetch single job role detail for role page
export const getCareerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    const id = Number(idParam);
    if (!id || isNaN(id)) {
      res.status(400).json({ error: 'Invalid career ID' });
      return;
    }

    const career = await (prisma as any).career.findFirst({
      where: { id, published: true },
    });

    if (!career) {
      res.status(404).json({ error: 'Job opening not found or no longer active.' });
      return;
    }

    res.json({
      ...career,
      tags: typeof career.tags === 'string' ? JSON.parse(career.tags || '[]') : career.tags,
      responsibilities: typeof career.responsibilities === 'string' ? JSON.parse(career.responsibilities || '[]') : career.responsibilities,
      requirements: typeof career.requirements === 'string' ? JSON.parse(career.requirements || '[]') : career.requirements,
      benefits: typeof career.benefits === 'string' ? JSON.parse(career.benefits || '[]') : career.benefits,
    });
  } catch (error) {
    next(error);
  }
};


