import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing seed data to allow clean re-runs
  await prisma.service.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.aboutPage.deleteMany();

  // Services
  await prisma.service.createMany({
    data: [
      {
        num: '1',
        icon: '🌐',
        title: 'Web Development',
        titleNp: 'वेब विकास',
        desc: 'Custom websites built with modern frameworks for speed, SEO, and scalability.',
        tags: JSON.stringify(['React', 'Next.js', 'TypeScript']),
        price: 'From $2,500',
        pricing: JSON.stringify([
          { tier: 'Starter', price: '$2,500', features: ['5-page website', 'Responsive design', 'Basic SEO', 'Contact form'] },
          { tier: 'Professional', price: '$5,000', features: ['10+ pages', 'CMS integration', 'Advanced SEO', 'Analytics', 'Blog'] },
          { tier: 'Enterprise', price: '$10,000+', features: ['Custom features', 'API integration', 'Performance optimization', 'Priority support', 'SLA'] }
        ])
      },
      {
        num: '2',
        icon: '📱',
        title: 'Mobile Apps',
        titleNp: 'मोबाइल एप्स',
        desc: 'Native and cross-platform mobile applications for iOS and Android.',
        tags: JSON.stringify(['React Native', 'Flutter', 'Swift']),
        price: 'From $5,000',
        pricing: JSON.stringify([
          { tier: 'MVP', price: '$5,000', features: ['Single platform', 'Core features', 'Basic UI', 'App store submission'] },
          { tier: 'Standard', price: '$10,000', features: ['Cross-platform', 'Custom UI', 'Backend integration', 'Analytics'] },
          { tier: 'Premium', price: '$20,000+', features: ['Native features', 'Offline mode', 'Push notifications', 'Ongoing support'] }
        ])
      },
      {
        num: '3',
        icon: '🎨',
        title: 'UI/UX Design',
        titleNp: 'UI/UX डिजाइन',
        desc: 'User-centered design that transforms complex ideas into intuitive experiences.',
        tags: JSON.stringify(['Figma', 'Prototyping', 'User Research']),
        price: 'From $1,500',
        pricing: JSON.stringify([
          { tier: 'Audit', price: '$1,500', features: ['UX audit report', 'Heuristic evaluation', 'Recommendations'] },
          { tier: 'Redesign', price: '$5,000', features: ['Full redesign', 'Prototyping', 'User testing', 'Design system'] },
          { tier: 'Enterprise', price: '$10,000+', features: ['Design team extension', 'Ongoing design sprints', 'Brand guidelines'] }
        ])
      },
      {
        num: '4',
        icon: '🤖',
        title: 'AI Solutions',
        titleNp: 'AI समाधान',
        desc: 'Intelligent automation and AI-powered features for your business.',
        tags: JSON.stringify(['Machine Learning', 'NLP', 'Computer Vision']),
        price: 'From $10,000',
        pricing: JSON.stringify([
          { tier: 'Pilot', price: '$8,000', features: ['Proof of concept', 'Single use case', 'Basic model', '30-day support'] },
          { tier: 'Production', price: '$15,000', features: ['Production model', 'API integration', 'Monitoring', '3-month support'] },
          { tier: 'Enterprise', price: '$30,000+', features: ['Custom models', 'Full integration', 'Training', 'Ongoing optimization'] }
        ])
      },
      {
        num: '5',
        icon: '☁️',
        title: 'Cloud & DevOps',
        titleNp: 'क्लाउड र DevOps',
        desc: 'Scalable infrastructure and CI/CD pipelines for seamless deployment.',
        tags: JSON.stringify(['AWS', 'Docker', 'Kubernetes']),
        price: 'From $3,000',
        pricing: JSON.stringify([
          { tier: 'Setup', price: '$3,000', features: ['Cloud setup', 'Basic CI/CD', 'Monitoring', 'Documentation'] },
          { tier: 'Managed', price: '$2,000/mo', features: ['Full management', '24/7 monitoring', 'Auto-scaling', 'Monthly reports'] },
          { tier: 'Enterprise', price: 'Custom', features: ['Multi-cloud', 'Dedicated support', 'SLA', 'Disaster recovery'] }
        ])
      },
      {
        num: '6',
        icon: '🔒',
        title: 'Cybersecurity',
        titleNp: 'साइबर सुरक्षा',
        desc: 'Comprehensive security audits and protection for your digital assets.',
        tags: JSON.stringify(['Pen Testing', 'Compliance', 'Encryption']),
        price: 'From $2,000',
        pricing: JSON.stringify([
          { tier: 'Basic Audit', price: '$2,000', features: ['Vulnerability scan', 'Report', 'Recommendations'] },
          { tier: 'Full Assessment', price: '$5,000', features: ['Penetration testing', 'Code review', 'Compliance check'] },
          { tier: 'Managed Security', price: '$3,000/mo', features: ['24/7 monitoring', 'Incident response', 'Monthly reports', 'Training'] }
        ])
      }
    ]
  });

  // FAQs
  await prisma.fAQ.createMany({
    data: [
      { question: 'How long does a typical project take?', answer: 'Most projects are completed within 4-12 weeks depending on scope and complexity.' },
      { question: 'Do you offer ongoing support?', answer: 'Yes, we provide maintenance packages and support plans after launch.' },
      { question: 'What technologies do you use?', answer: 'We use modern stacks including React, Next.js, Node.js, and cloud platforms like AWS.' },
      { question: 'How do you handle pricing?', answer: 'We provide transparent pricing based on project scope. Use our quote calculator for an instant estimate.' },
      { question: 'Can you work with our existing team?', answer: 'Absolutely. We offer team augmentation and can integrate with your existing workflow.' },
    ],
  });

  // Portfolio
  await prisma.portfolioItem.createMany({
    data: [
      {
        icon: '🏠',
        category: 'Mobile',
        tag: 'Marketplace · Web + Mobile',
        title: 'GharSewa Platform',
        desc: "Nepal's local home services marketplace connecting skilled tradespeople with customers in real time.",
        result: '3 user types, 2 payment gateways, live in 5+ cities',
        tech: JSON.stringify(['React Native', 'Node.js', 'PostgreSQL', 'eSewa']),
        results: JSON.stringify([{ label: 'User Types', value: '3' }, { label: 'Payment Gateways', value: '2' }, { label: 'Cities Covered', value: '5+' }]),
        color: '#06b6d4',
        highlight: true,
        year: '2026',
      },
      {
        icon: '🏨',
        category: 'SaaS',
        tag: 'SaaS · Hotel Management',
        title: 'HMS Pro',
        desc: 'Multi-tenant SaaS hotel management system with booking engine, billing automation, and occupancy analytics.',
        result: '3 pricing tiers, Stripe billing, React-powered',
        tech: JSON.stringify(['Next.js', 'Node.js', 'PostgreSQL', 'Stripe']),
        results: JSON.stringify([{ label: 'Pricing Tiers', value: '3' }, { label: 'Billing', value: 'Stripe' }, { label: 'Framework', value: 'React' }]),
        color: '#a855f7',
        highlight: false,
        year: '2026',
      },
      {
        icon: '🎓',
        category: 'SaaS',
        tag: 'SaaS · Education ERP',
        title: 'CollegePro ERP',
        desc: 'Full-featured college management ERP with 4 portals — Admin, Teacher, Student, and Parent apps.',
        result: '4 portals, FCM push notifications, multi-tenant architecture',
        tech: JSON.stringify(['React.js', 'React Native', 'Firebase FCM', 'MongoDB']),
        results: JSON.stringify([{ label: 'Portals', value: '4' }, { label: 'Notification', value: 'FCM' }, { label: 'Architecture', value: 'Multi-tenant' }]),
        color: '#eab308',
        highlight: false,
        year: '2026',
      },
      {
        icon: '🛵',
        category: 'Mobile',
        tag: 'Platform · Food & Delivery',
        title: 'Nepal Delivery App',
        desc: 'Food ordering platform fully adapted for Nepal — KYC, DoTM license verification, Bikram Sambat calendar.',
        result: '3+ payment methods, DFTQC compliant, Bikram Sambat calendar',
        tech: JSON.stringify(['React Native', 'eSewa', 'Khalti', 'Node.js']),
        results: JSON.stringify([{ label: 'Payment Methods', value: '3+' }, { label: 'Compliance', value: 'DFTQC' }, { label: 'Calendar', value: 'B.S.' }]),
        color: '#10b981',
        highlight: false,
        year: '2026',
      },
      {
        icon: '🏡',
        category: 'Web',
        tag: 'Real Estate · Web Portal',
        title: 'Nepal Bhumi Portal',
        desc: 'Real estate listing platform for buying, selling, and renting properties across Nepal with map view.',
        result: 'Google Maps integration, verified listings, NPR pricing',
        tech: JSON.stringify(['Next.js', 'Google Maps API', 'Node.js', 'PostgreSQL']),
        results: JSON.stringify([{ label: 'Map Integration', value: 'Google' }, { label: 'Listings', value: 'Verified' }, { label: 'Currency', value: 'NPR' }]),
        color: '#ef4444',
        highlight: false,
        year: '2026',
      },
      {
        icon: '🛒',
        category: 'E-Commerce',
        tag: 'E-Commerce · Retail',
        title: 'Butwal Shop',
        desc: 'Custom e-commerce platform for a local Butwal retailer with inventory management and eSewa payments.',
        result: 'Rs. 2L+ monthly GMV, eSewa payments, SMS notifications',
        tech: JSON.stringify(['Next.js', 'eSewa', 'SMS API', 'PostgreSQL']),
        results: JSON.stringify([{ label: 'Monthly GMV', value: 'Rs. 2L+' }, { label: 'Payments', value: 'eSewa' }, { label: 'Notifications', value: 'SMS' }]),
        color: '#06b6d4',
        highlight: false,
        year: '2026',
      },
    ],
  });


  // Team
  await prisma.teamMember.createMany({
    data: [
      { icon: '👨‍💻', role: 'CEO & Founder', name: 'Rajesh Sharma', desc: 'Visionary leader with 15+ years in tech.', skills: JSON.stringify(['Strategy', 'Leadership', 'Innovation']) },
      { icon: '👩‍🎨', role: 'Lead Designer', name: 'Priya Gurung', desc: 'Award-winning designer passionate about UX.', skills: JSON.stringify(['UI/UX', 'Branding', 'Prototyping']) },
      { icon: '👨‍🔬', role: 'Tech Lead', name: 'Amit Thapa', desc: 'Full-stack architect and open-source contributor.', skills: JSON.stringify(['React', 'Node.js', 'AWS']) },
      { icon: '👩‍💼', role: 'Project Manager', name: 'Sita Rai', desc: 'Certified PMP ensuring on-time delivery.', skills: JSON.stringify(['Agile', 'Scrum', 'Delivery']) },
    ],
  });

  // Testimonials
  await prisma.testimonial.createMany({
    data: [
      { stars: 5, quote: 'D-Kode Era transformed our online presence completely. Highly recommended!', icon: '👩‍💼', name: 'Anita Sharma', biz: 'CEO, NepalMart' },
      { stars: 5, quote: 'Professional, timely, and the quality exceeded our expectations.', icon: '👨‍💻', name: 'Bikash Tamang', biz: 'CTO, MedConnect' },
      { stars: 5, quote: 'Their AI solutions helped us automate 60% of our manual processes.', icon: '👩‍🔬', name: 'Kavita Limbu', biz: 'Director, FarmLink' },
      { stars: 5, quote: 'The best tech partner we have ever worked with. True experts in their field.', icon: '👨‍🏫', name: 'Deepak Adhikari', biz: 'Founder, LearnNepal' },
    ],
  });

  // About Page (singleton)
  await prisma.aboutPage.create({
    data: {
      hero: JSON.stringify({
        badge: 'About D-Kode Era',
        titleLine1: 'Built in Butwal.',
        titleLine2: 'Built for Nepal.',
        subtitle: "D-Kode Era is Nepal's fastest-growing IT company, headquartered in Butwal. We deliver world-class websites, mobile apps, management systems, and digital marketing — engineered specifically for Nepal's market, culture, and payment ecosystem.",
        gradient: '135deg, #e8edf5 0%, #00d4ff 50%, #a855f7 100%'
      }),
      stats: JSON.stringify([
        { num: '25+', label: 'Projects Delivered', icon: '🚀' },
        { num: '18+', label: 'Happy Clients', icon: '🤝' },
        { num: '8+', label: 'Industries', icon: '🏭' },
        { num: '98%', label: 'Satisfaction Rate', icon: '⭐' }
      ]),
      story: JSON.stringify({
        eyebrow: 'OUR STORY',
        title: 'Why We Started D-Kode Era',
        paragraphs: [
          "Dipendra saw a gap in Nepal's digital landscape — businesses outside Kathmandu were being underserved. Agencies in the capital charged high prices, missed deadlines, and delivered generic solutions.",
          'So he started D-Kode Era in Butwal — combining world-class technical skill with deep local understanding. We speak your language, accept eSewa and Khalti, and understand your market.',
          "Today, we're proud to serve 18+ clients across hotels, schools, retail, and tech — and we're just getting started."
        ]
      }),
      values: JSON.stringify([
        { icon: '🇳🇵', title: 'Nepal First', desc: "We don't copy foreign playbooks. Every solution is tailored to Nepal's payment systems, regulations, languages, and market realities.", color: '#06b6d4' },
        { icon: '⚡', title: 'Speed Without Compromise', desc: 'We move fast — most websites are live in 5–7 days. But speed never means sloppy. Every line of code is reviewed, tested, and optimized.', color: '#a855f7' },
        { icon: '🔓', title: 'Full Transparency', desc: 'You own your code, your data, and your domain. No lock-ins. No hidden fees. Clear pricing, clear timelines, clear communication.', color: '#eab308' },
        { icon: '📞', title: 'Local, Reachable, Accountable', desc: "We're based in Butwal-10. You can walk in, call us, WhatsApp us. We're not an anonymous agency — we're your neighbors.", color: '#10b981' },
        { icon: '🛡️', title: 'Post-Launch Support', desc: "30 days of free support after launch. Ongoing maintenance plans from Rs. 3,000/month. We don't disappear after delivery.", color: '#ef4444' },
        { icon: '🧠', title: 'Continuous Innovation', desc: 'We stay ahead of the curve — AI tools, modern frameworks, cutting-edge design. Your business deserves the best technology.', color: '#06b6d4' }
      ]),
      milestones: JSON.stringify([
        { year: '2026', month: 'Jan', title: 'D-Kode Era Founded', desc: 'Started with a mission to bring world-class digital solutions to Butwal and Nepal.', icon: '🌱' },
        { year: '2026', month: 'Feb', title: 'First 5 Projects Delivered', desc: 'Launched our first batch of websites and apps for local businesses in Butwal.', icon: '🚀' },
        { year: '2026', month: 'Mar', title: 'HMS Pro SaaS Launched', desc: 'Our flagship hotel management SaaS product went live with 3 tiers and Stripe billing.', icon: '🏨' },
        { year: '2026', month: 'Apr', title: '18+ Clients Milestone', desc: 'Reached 18 satisfied clients across hotels, schools, retail, and tech startups.', icon: '🎯' },
        { year: '2026', month: 'Jun', title: 'Official Pvt. Ltd. Registration', desc: "Registered as D-Kode Era Pvt. Ltd., cementing our commitment to Nepal's digital future.", icon: '🏢' }
      ]),
      teamMembers: JSON.stringify([
        { name: 'Dipendra Prasad Gupta', role: 'Founder & CEO', icon: '👨‍💻', bio: "Full-stack developer with deep expertise in React, Node.js, and mobile development. Dipendra founded D-Kode Era with a singular vision: to build technology that truly serves Nepal's needs.", skills: ['React', 'Node.js', 'React Native', 'PostgreSQL', 'AWS'], color: '#06b6d4' },
        { name: 'Kshitiza', role: 'Co-Founder & COO', icon: '👩‍💼', bio: 'Operations mastermind and business strategy lead. Kshitiza manages client relationships, project timelines, and ensures every delivery exceeds expectations.', skills: ['Strategy', 'Marketing', 'Client Relations', 'Project Management'], color: '#a855f7' },
        { name: 'Design Team', role: 'Lead UI/UX Designer', icon: '🎨', bio: 'Our design team crafts beautiful, intuitive interfaces built for Nepali users. Every pixel is intentional, every user flow is tested and refined.', skills: ['Figma', 'UI/UX', 'Branding', 'Motion Design'], color: '#eab308' }
      ]),
      cta: JSON.stringify({
        title: 'Want to Work With Us?',
        subtitle: "We're based in Butwal and love meeting clients in person. Let's build something great together.",
        primaryHref: '/pages/contact',
        primaryLabel: 'Contact Us →',
        secondaryHref: '/pages/services',
        secondaryLabel: 'View Services'
      })
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
