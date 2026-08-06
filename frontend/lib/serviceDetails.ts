export interface ServiceDetail {
  slug: string;
  icon: string;
  title: string;
  shortDesc: string;
  longDescription: string;
  features: string[];
  benefits: string[];
  process: { step: number; title: string; description: string }[];
  technologies: string[];
  caseStudies: {
    icon: string;
    title: string;
    client: string;
    industry: string;
    challenge: string;
    solution: string;
    result: string;
  }[];
  pricing: { tier: string; price: string; features: string[] }[];
  faqs: { question: string; answer: string }[];
}

export const serviceDetails: Record<string, ServiceDetail> = {
  'web-development': {
    slug: 'web-development',
    icon: '🌐',
    title: 'Web Development',
    shortDesc: 'Custom websites built with modern frameworks for speed, SEO, and scalability.',
    longDescription:
      'We build performant, scalable web applications using cutting-edge technologies like React, Next.js, and TypeScript. From corporate sites to complex SaaS platforms, we deliver solutions that drive results.',
    features: [
      'Custom Web Applications',
      'E-Commerce Solutions',
      'Progressive Web Apps (PWA)',
      'Headless CMS Integration',
      'API Development & Integration',
      'Real-time Features',
    ],
    benefits: [
      'Lightning-fast performance',
      'SEO-optimized architecture',
      'Mobile-first responsive design',
      'Scalable and maintainable code',
    ],
    process: [
      { step: 1, title: 'Discovery', description: 'Understanding your business goals and technical requirements.' },
      { step: 2, title: 'Design', description: 'Creating wireframes and visual designs for your approval.' },
      { step: 3, title: 'Development', description: 'Building your application with clean, testable code.' },
      { step: 4, title: 'Deployment', description: 'Launching your project with monitoring and support.' },
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    caseStudies: [
      {
        icon: '🛒',
        title: 'NepalMart E-Commerce Platform',
        client: 'NepalMart',
        industry: 'Retail',
        challenge: 'Needed a scalable platform to handle thousands of concurrent users during sales events.',
        solution: 'Built a microservices architecture with Next.js frontend and Node.js backend.',
        result: '300% increase in online sales with 99.9% uptime.',
      },
    ],
    pricing: [
      { tier: 'Starter', price: '$2,500', features: ['5-page website', 'Responsive design', 'Basic SEO', 'Contact form'] },
      { tier: 'Professional', price: '$5,000', features: ['10+ pages', 'CMS integration', 'Advanced SEO', 'Analytics', 'Blog'] },
      { tier: 'Enterprise', price: '$10,000+', features: ['Custom features', 'API integration', 'Performance optimization', 'Priority support', 'SLA'] },
    ],
    faqs: [
      { question: 'How long does a web project take?', answer: 'Typically 4-8 weeks depending on complexity.' },
      { question: 'Do you use templates?', answer: 'No, all our solutions are custom-built from scratch.' },
    ],
  },
  'mobile-apps': {
    slug: 'mobile-apps',
    icon: '📱',
    title: 'Mobile Apps',
    shortDesc: 'Native and cross-platform mobile applications for iOS and Android.',
    longDescription:
      'We develop high-quality mobile applications for iOS and Android using React Native and Flutter. Our apps are designed for performance, usability, and seamless user experiences.',
    features: [
      'iOS & Android Development',
      'Cross-platform Apps',
      'App Store Optimization',
      'Push Notifications',
      'Offline Support',
      'In-App Purchases',
    ],
    benefits: [
      'Reach customers on any device',
      'Native performance and feel',
      'Reduced development time with cross-platform',
      'Continuous delivery pipeline',
    ],
    process: [
      { step: 1, title: 'Strategy', description: 'Defining the app concept and target audience.' },
      { step: 2, title: 'Design', description: 'Creating intuitive mobile UI/UX designs.' },
      { step: 3, title: 'Development', description: 'Building with React Native or Flutter.' },
      { step: 4, title: 'Launch', description: 'App store submission and post-launch support.' },
    ],
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Redux'],
    caseStudies: [
      {
        icon: '🏥',
        title: 'MedConnect Telemedicine App',
        client: 'MedConnect',
        industry: 'Healthcare',
        challenge: 'Connecting patients in rural Nepal with doctors via video consultations.',
        solution: 'Built a cross-platform app with real-time video, scheduling, and medical records.',
        result: '10,000+ monthly consultations with 4.8-star app rating.',
      },
    ],
    pricing: [
      { tier: 'MVP', price: '$5,000', features: ['Single platform', 'Core features', 'Basic UI', 'App store submission'] },
      { tier: 'Standard', price: '$10,000', features: ['Cross-platform', 'Custom UI', 'Backend integration', 'Analytics'] },
      { tier: 'Premium', price: '$20,000+', features: ['Native features', 'Offline mode', 'Push notifications', 'Ongoing support'] },
    ],
    faqs: [
      { question: 'Native or cross-platform?', answer: 'We recommend cross-platform for most use cases to save time and cost.' },
      { question: 'Do you handle app store submission?', answer: 'Yes, we handle the entire submission process.' },
    ],
  },
  'ui-ux-design': {
    slug: 'ui-ux-design',
    icon: '🎨',
    title: 'UI/UX Design',
    shortDesc: 'User-centered design that transforms complex ideas into intuitive experiences.',
    longDescription:
      'Our design team creates beautiful, intuitive interfaces that users love. We combine research-driven insights with stunning visual design to deliver exceptional digital experiences.',
    features: [
      'User Research & Testing',
      'Wireframing & Prototyping',
      'Visual Design Systems',
      'Interaction Design',
      'Accessibility (WCAG)',
      'Design Handoff',
    ],
    benefits: [
      'Higher user satisfaction',
      'Reduced development costs',
      'Faster time to market',
      'Consistent brand experience',
    ],
    process: [
      { step: 1, title: 'Research', description: 'Understanding users and business goals through interviews and analysis.' },
      { step: 2, title: 'Wireframe', description: 'Creating low-fidelity layouts and user flows.' },
      { step: 3, title: 'Design', description: 'Building high-fidelity mockups and interactive prototypes.' },
      { step: 4, title: 'Test', description: 'Validating designs with real users before development.' },
    ],
    technologies: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Maze', 'Hotjar'],
    caseStudies: [
      {
        icon: '📚',
        title: 'LearnNepal Education Platform',
        client: 'LearnNepal',
        industry: 'Education',
        challenge: 'Complex course management system needed intuitive navigation.',
        solution: 'Redesigned the entire UX with user testing at every stage.',
        result: '50% reduction in support tickets, 40% increase in course completion.',
      },
    ],
    pricing: [
      { tier: 'Audit', price: '$1,500', features: ['UX audit report', 'Heuristic evaluation', 'Recommendations'] },
      { tier: 'Redesign', price: '$5,000', features: ['Full redesign', 'Prototyping', 'User testing', 'Design system'] },
      { tier: 'Enterprise', price: '$10,000+', features: ['Design team extension', 'Ongoing design sprints', 'Brand guidelines'] },
    ],
    faqs: [
      { question: 'Do you do just design or also development?', answer: 'Both! We can design and develop your entire project.' },
      { question: 'How many revision rounds are included?', answer: 'Typically 2-3 rounds of revisions are included.' },
    ],
  },
  'ai-solutions': {
    slug: 'ai-solutions',
    icon: '🤖',
    title: 'AI Solutions',
    shortDesc: 'Intelligent automation and AI-powered features for your business.',
    longDescription:
      'We integrate artificial intelligence and machine learning into your products and workflows. From chatbots to predictive analytics, we help you leverage AI for competitive advantage.',
    features: [
      'Custom AI Models',
      'Natural Language Processing',
      'Computer Vision',
      'Predictive Analytics',
      'AI Chatbots',
      'Process Automation',
    ],
    benefits: [
      'Automate repetitive tasks',
      'Gain insights from data',
      'Improve decision making',
      'Enhance customer experience',
    ],
    process: [
      { step: 1, title: 'Assessment', description: 'Identifying AI opportunities in your business.' },
      { step: 2, title: 'Data Prep', description: 'Collecting and preparing data for model training.' },
      { step: 3, title: 'Model Development', description: 'Building and training custom AI models.' },
      { step: 4, title: 'Integration', description: 'Deploying AI into your existing systems.' },
    ],
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI', 'Hugging Face', 'FastAPI'],
    caseStudies: [
      {
        icon: '🌾',
        title: 'FarmLink Crop Monitoring',
        client: 'FarmLink',
        industry: 'Agriculture',
        challenge: 'Farmers needed early detection of crop diseases.',
        solution: 'Built a computer vision model that analyzes crop images from smartphones.',
        result: '40% reduction in crop waste, 25% increase in yield.',
      },
    ],
    pricing: [
      { tier: 'Pilot', price: '$8,000', features: ['Proof of concept', 'Single use case', 'Basic model', '30-day support'] },
      { tier: 'Production', price: '$15,000', features: ['Production model', 'API integration', 'Monitoring', '3-month support'] },
      { tier: 'Enterprise', price: '$30,000+', features: ['Custom models', 'Full integration', 'Training', 'Ongoing optimization'] },
    ],
    faqs: [
      { question: 'Do we need lots of data?', answer: 'Not necessarily. We can work with small datasets and use transfer learning.' },
      { question: 'Can you integrate with our existing tools?', answer: 'Yes, we specialize in integrating AI into existing workflows.' },
    ],
  },
  'cloud-devops': {
    slug: 'cloud-devops',
    icon: '☁️',
    title: 'Cloud & DevOps',
    shortDesc: 'Scalable infrastructure and CI/CD pipelines for seamless deployment.',
    longDescription:
      'We design and manage cloud infrastructure on AWS, GCP, and Azure. Our DevOps practices ensure your applications are reliable, scalable, and continuously delivered.',
    features: [
      'Cloud Migration',
      'Infrastructure as Code',
      'CI/CD Pipelines',
      'Container Orchestration',
      'Monitoring & Alerting',
      'Cost Optimization',
    ],
    benefits: [
      '99.99% uptime reliability',
      'Auto-scaling for traffic spikes',
      'Reduced infrastructure costs',
      'Faster deployment cycles',
    ],
    process: [
      { step: 1, title: 'Audit', description: 'Assessing your current infrastructure and processes.' },
      { step: 2, title: 'Plan', description: 'Designing the target architecture and migration strategy.' },
      { step: 3, title: 'Implement', description: 'Building infrastructure and setting up pipelines.' },
      { step: 4, title: 'Optimize', description: 'Continuous monitoring and cost optimization.' },
    ],
    technologies: ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    caseStudies: [
      {
        icon: '🛒',
        title: 'NepalMart Cloud Migration',
        client: 'NepalMart',
        industry: 'Retail',
        challenge: "On-premise servers couldn't handle traffic spikes during sales.",
        solution: 'Migrated to AWS with auto-scaling and CDN optimization.',
        result: '99.99% uptime, 60% reduction in infrastructure costs.',
      },
    ],
    pricing: [
      { tier: 'Setup', price: '$3,000', features: ['Cloud setup', 'Basic CI/CD', 'Monitoring', 'Documentation'] },
      { tier: 'Managed', price: '$2,000/mo', features: ['Full management', '24/7 monitoring', 'Auto-scaling', 'Monthly reports'] },
      { tier: 'Enterprise', price: 'Custom', features: ['Multi-cloud', 'Dedicated support', 'SLA', 'Disaster recovery'] },
    ],
    faqs: [
      { question: 'Which cloud provider do you recommend?', answer: 'We work with all major providers and recommend based on your specific needs.' },
      { question: 'Can you reduce our current cloud costs?', answer: 'Yes, most clients see 30-60% cost reduction through optimization.' },
    ],
  },
  cybersecurity: {
    slug: 'cybersecurity',
    icon: '🔒',
    title: 'Cybersecurity',
    shortDesc: 'Comprehensive security audits and protection for your digital assets.',
    longDescription:
      'We protect your business from cyber threats with thorough security assessments, penetration testing, and ongoing monitoring. Our security-first approach keeps your data and customers safe.',
    features: [
      'Security Audits',
      'Penetration Testing',
      'Vulnerability Assessment',
      'Compliance (GDPR, SOC2)',
      'Security Training',
      'Incident Response',
    ],
    benefits: [
      'Prevent costly data breaches',
      'Meet compliance requirements',
      'Build customer trust',
      '24/7 threat monitoring',
    ],
    process: [
      { step: 1, title: 'Assess', description: 'Comprehensive security audit of your systems.' },
      { step: 2, title: 'Identify', description: 'Discovering vulnerabilities and threat vectors.' },
      { step: 3, title: 'Remediate', description: 'Fixing issues and implementing security controls.' },
      { step: 4, title: 'Monitor', description: 'Ongoing monitoring and incident response.' },
    ],
    technologies: ['OWASP', 'Burp Suite', 'Nessus', 'Wireshark', 'Snort', 'Splunk'],
    caseStudies: [
      {
        icon: '🏦',
        title: 'Financial Services Security Overhaul',
        client: 'Himalayan Finance',
        industry: 'Finance',
        challenge: 'Needed to meet new regulatory compliance requirements.',
        solution: 'Full security audit, penetration testing, and implemented zero-trust architecture.',
        result: 'Passed compliance audit with zero critical findings.',
      },
    ],
    pricing: [
      { tier: 'Basic Audit', price: '$2,000', features: ['Vulnerability scan', 'Report', 'Recommendations'] },
      { tier: 'Full Assessment', price: '$5,000', features: ['Penetration testing', 'Code review', 'Compliance check'] },
      { tier: 'Managed Security', price: '$3,000/mo', features: ['24/7 monitoring', 'Incident response', 'Monthly reports', 'Training'] },
    ],
    faqs: [
      { question: 'How often should we do a security audit?', answer: 'We recommend at least annually, and after any major changes.' },
      { question: 'Do you offer ongoing protection?', answer: 'Yes, our managed security service provides continuous monitoring.' },
    ],
  },
};
