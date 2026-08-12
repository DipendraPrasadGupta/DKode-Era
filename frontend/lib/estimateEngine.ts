export type ProjectTypeId = 'landing' | 'business' | 'ecommerce' | 'webapp' | 'mobile' | 'ai';
export type ComplexityId = 'basic' | 'standard' | 'advanced' | 'enterprise';
export type UrgencyId = 'flexible' | 'standard' | 'rush' | 'express';

export interface ProjectType {
  id: ProjectTypeId;
  label: string;
  icon: string;
  basePrice: number;
  weeksMin: number;
  weeksMax: number;
  desc: string;
}

export interface ComplexityLevel {
  id: ComplexityId;
  label: string;
  multiplier: number;
  desc: string;
}

export interface FeatureOption {
  id: string;
  label: string;
  price: number;
  desc: string;
}

export interface UrgencyOption {
  id: UrgencyId;
  label: string;
  multiplier: number;
  desc: string;
}

export interface EstimateInput {
  projectType: ProjectTypeId;
  complexity: ComplexityId;
  features: string[];
  urgency: UrgencyId;
  pageCount: number;
}

export interface CostBreakdownItem {
  label: string;
  amount: number;
}

export interface EstimateResult {
  subtotal: number;
  urgencyFee: number;
  total: number;
  weeksMin: number;
  weeksMax: number;
  breakdown: CostBreakdownItem[];
  summary: string;
}

export const projectTypes: ProjectType[] = [
  { id: 'landing', label: 'Landing Page', icon: '🎯', basePrice: 25000, weeksMin: 1, weeksMax: 2, desc: 'High-converting single-page site with lead capture' },
  { id: 'business', label: 'Business Website', icon: '🌐', basePrice: 50000, weeksMin: 2, weeksMax: 4, desc: 'Multi-page corporate site with CMS & blog' },
  { id: 'ecommerce', label: 'E-Commerce Store', icon: '🛒', basePrice: 150000, weeksMin: 4, weeksMax: 8, desc: 'Online store with payments, cart & inventory' },
  { id: 'webapp', label: 'Web App / SaaS', icon: '⚙️', basePrice: 250000, weeksMin: 8, weeksMax: 16, desc: 'Custom dashboards, auth & business logic' },
  { id: 'mobile', label: 'Mobile App', icon: '📱', basePrice: 80000, weeksMin: 6, weeksMax: 12, desc: 'Cross-platform iOS & Android application' },
  { id: 'ai', label: 'AI-Powered Product', icon: '🤖', basePrice: 120000, weeksMin: 4, weeksMax: 10, desc: 'Chatbots, ML features & intelligent automation' },
];

export const complexityLevels: ComplexityLevel[] = [
  { id: 'basic', label: 'Basic', multiplier: 1, desc: 'Core features, proven patterns, fast delivery' },
  { id: 'standard', label: 'Standard', multiplier: 1.35, desc: 'Custom design, moderate integrations' },
  { id: 'advanced', label: 'Advanced', multiplier: 1.85, desc: 'Complex workflows & multiple third-party APIs' },
  { id: 'enterprise', label: 'Enterprise', multiplier: 2.5, desc: 'Scalable architecture, SLA & dedicated support' },
];

export const featureOptions: FeatureOption[] = [
  { id: 'design', label: 'UI/UX Design Package', price: 12000, desc: 'Wireframes, mockups & design system' },
  { id: 'seo', label: 'SEO Optimization', price: 8000, desc: 'On-page SEO, meta tags & sitemap' },
  { id: 'ai-chat', label: 'AI Chatbot Integration', price: 15000, desc: 'Custom-trained assistant for your business' },
  { id: 'payment', label: 'Payment Gateway', price: 5000, desc: 'eSewa, Khalti, Stripe or PayPal setup' },
  { id: 'admin', label: 'Admin Dashboard', price: 20000, desc: 'Content & user management panel' },
  { id: 'api', label: 'API Integrations', price: 15000, desc: 'CRM, ERP, shipping & third-party services' },
  { id: 'security', label: 'Security Hardening', price: 5000, desc: 'SSL, firewall rules & vulnerability scan' },
  { id: 'maintenance', label: '3-Month Maintenance', price: 9000, desc: 'Updates, backups & priority bug fixes' },
  { id: 'multilang', label: 'Multi-language Support', price: 10000, desc: 'English, Nepali & additional locales' },
  { id: 'analytics', label: 'Analytics & Reporting', price: 8000, desc: 'Dashboards, events & conversion tracking' },
];

export const urgencyOptions: UrgencyOption[] = [
  { id: 'flexible', label: 'Flexible', multiplier: 0.95, desc: 'No rush — best value pricing' },
  { id: 'standard', label: 'Standard', multiplier: 1, desc: 'Normal delivery timeline' },
  { id: 'rush', label: 'Rush Delivery', multiplier: 1.2, desc: 'Priority scheduling (+20%)' },
  { id: 'express', label: 'Express Delivery', multiplier: 1.35, desc: 'Fast-track with dedicated team (+35%)' },
];

const PAGE_PRICE = 3500;
const PAGE_FREE_THRESHOLD = 5;

export function formatNPR(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString('en-NP')}`;
}

export function calculateEstimate(input: EstimateInput): EstimateResult {
  const project = projectTypes.find(p => p.id === input.projectType)!;
  const complexity = complexityLevels.find(c => c.id === input.complexity)!;
  const urgency = urgencyOptions.find(u => u.id === input.urgency)!;

  const baseWithComplexity = Math.round(project.basePrice * complexity.multiplier);
  const extraPages = Math.max(0, input.pageCount - PAGE_FREE_THRESHOLD);
  const pageCost = extraPages * PAGE_PRICE;

  const selectedFeatures = featureOptions.filter(f => input.features.includes(f.id));
  const featuresTotal = selectedFeatures.reduce((sum, f) => sum + f.price, 0);

  const subtotal = baseWithComplexity + pageCost + featuresTotal;
  const urgencyFee = Math.round(subtotal * (urgency.multiplier - 1));
  const total = Math.round(subtotal * urgency.multiplier);

  const breakdown: CostBreakdownItem[] = [
    { label: `${project.label} (${complexity.label})`, amount: baseWithComplexity },
  ];
  if (pageCost > 0) {
    breakdown.push({ label: `Additional pages (${extraPages})`, amount: pageCost });
  }
  selectedFeatures.forEach(f => {
    breakdown.push({ label: f.label, amount: f.price });
  });
  if (urgencyFee !== 0) {
    breakdown.push({
      label: urgencyFee > 0 ? `${urgency.label} fee` : 'Flexible timeline discount',
      amount: urgencyFee,
    });
  }

  const complexityWeekFactor = complexity.multiplier;
  const urgencyWeekFactor = urgency.id === 'rush' ? 0.85 : urgency.id === 'express' ? 0.7 : 1;
  const weeksMin = Math.max(1, Math.round(project.weeksMin * complexityWeekFactor * urgencyWeekFactor));
  const weeksMax = Math.max(weeksMin + 1, Math.round(project.weeksMax * complexityWeekFactor * urgencyWeekFactor));

  const featureList = selectedFeatures.length
    ? selectedFeatures.map(f => f.label).join(', ')
    : 'None selected';

  const summary = [
    'D-Kode Era — Project Cost Estimate',
    '─────────────────────────────',
    `Project: ${project.label}`,
    `Complexity: ${complexity.label}`,
    `Pages/Screens: ${input.pageCount}`,
    `Timeline: ${urgency.label} (${weeksMin}–${weeksMax} weeks)`,
    `Add-ons: ${featureList}`,
    '',
    ...breakdown.map(b => `${b.label}: ${formatNPR(b.amount)}`),
    '─────────────────────────────',
    `Estimated Total: ${formatNPR(total)}`,
    '',
    'Note: This is an indicative estimate. Final pricing depends on detailed requirements.',
    'Contact: dkodeera2026@gmail.com | +977-9807544395',
  ].join('\n');

  return { subtotal, urgencyFee, total, weeksMin, weeksMax, breakdown, summary };
}
