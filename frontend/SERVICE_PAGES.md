# Service Pages Documentation

## Overview
The D-Kode Era website now includes comprehensive individual service pages with professional UI/UX design. Each service has its own detailed page with case studies, pricing, features, and more.

## Service Pages Included

1. **Web Development** (`/services/web-development`)
   - Custom websites and web applications
   - Features: Responsive design, PWA, SEO, Performance optimization
   - Case Studies: GharSewa, Nepal Bhumi
   - Pricing: Starter (Rs. 1.5L) to Enterprise

2. **Mobile Apps** (`/services/mobile-apps`)
   - iOS & Android development
   - Features: Native/Cross-platform, Offline, Push notifications, Analytics
   - Case Studies: CollegePro, Nepal Delivery
   - Pricing: MVP (Rs. 5L) to Enterprise

3. **Hotel Management** (`/services/hotel-management`)
   - Complete HMS Pro system
   - Features: Reservations, Guest management, Billing, Housekeeping
   - Case Studies: Hotel Excellence
   - Pricing: Starter (Rs. 50K/month) to Enterprise

4. **Digital Marketing** (`/services/digital-marketing`)
   - SEO, Ads, Social Media, Content Marketing
   - Features: Analytics, Brand strategy, Conversion optimization
   - Case Studies: Butwal Shop
   - Pricing: Starter (Rs. 30K/month) to Premium

5. **UI/UX Design** (`/services/ui-ux-design`)
   - User-centered design solutions
   - Features: Wireframing, Visual design, Prototyping, Usability testing
   - Case Studies: GharSewa redesign
   - Pricing: Web (Rs. 1.5L) to Full Project

6. **SaaS Products** (`/services/saas-products`)
   - Cloud-based software solutions
   - Features: Multi-tenant, Billing, APIs, Real-time collaboration
   - Case Studies: HMS Pro
   - Pricing: MVP (Rs. 15L) to Enterprise

## File Structure

```
app/
├── services/
│   ├── page.tsx                    # Services landing page
│   └── [slug]/
│       └── page.tsx               # Dynamic service detail pages
├── components/
│   └── ServiceDetailPage.tsx       # Service detail page component
└── lib/
    └── serviceDetails.ts          # Service data structure
```

## Key Features

### 1. **Dynamic Service Pages**
- Each service has a dedicated page with detailed information
- URL structure: `/services/[service-slug]`
- Fully responsive design

### 2. **Professional UI/UX**
- Glassmorphism card effects
- Smooth animations and transitions
- Gradient text and backgrounds
- Interactive hover effects

### 3. **Comprehensive Content**
Each service page includes:
- **Hero Section**: Service overview and CTA
- **Features**: 8+ key features listed
- **Benefits**: Real business benefits
- **Process**: 5-step development process with timeline
- **Technologies**: Tech stack used
- **Case Studies**: Real project examples
- **Pricing**: Multiple tier options
- **FAQs**: Common questions answered

### 4. **Service Links**
- Main services grid on home page links to service pages
- Services landing page at `/services`
- Easy navigation between pages

### 5. **Animations**
- Hover effects on cards
- Smooth transitions (0.4s cubic-bezier)
- Parallax and scroll effects
- Icon animations

## Service Data Structure

```typescript
interface ServiceDetail {
  id: string;
  slug: string;
  icon: string;
  title: string;
  description: string;
  shortDesc: string;
  longDescription: string;
  features: string[];
  benefits: string[];
  process: ProcessStep[];
  technologies: string[];
  caseStudies: CaseStudy[];
  pricing: PricingTier[];
  faqs: FAQ[];
}
```

## How to Add a New Service

1. Add new service object to `lib/serviceDetails.ts`:

```typescript
'new-service-slug': {
  id: '7',
  slug: 'new-service-slug',
  icon: '🎯',
  title: 'New Service',
  // ... complete all fields
}
```

2. The service will automatically appear in:
   - `/services` landing page
   - `/services/new-service-slug` detail page

3. Update `serviceSlugMap` in `components/ServicesSection.tsx` if needed

## Customization

### Colors
Service pages use the theme colors from `getThemeColors()`:
- `colors.cyan` - Accent color (#00d4ff)
- `colors.text` - Main text
- `colors.muted` - Secondary text
- `colors.border` - Borders
- `colors.surface` - Card backgrounds

### Animations
All animations use `cubic-bezier(0.34, 1.56, 0.64, 1)` for smooth, springy feel. Modify in:
- `app/globals.css`
- Component inline styles
- `ServiceDetailPage.tsx`

### Pricing Tiers
Update pricing in `serviceDetails.ts`:
- Modify `price` field for cost
- Add/remove `features` array items
- Update tier names in `tier` field

## SEO Optimization

Service pages are optimized for:
- Keyword-rich titles and descriptions
- Structured data-friendly content hierarchy
- Meta descriptions in each service
- Open Graph data (via layout.tsx)

Add service-specific metadata:
```typescript
export const metadata = {
  title: 'Web Development Services - D-Kode Era',
  description: 'Custom web development and web apps built with React, Next.js, Node.js...'
}
```

## Performance Considerations

1. **Code Splitting**: Each service page is code-split automatically
2. **Image Optimization**: Use Next.js Image component for any service images
3. **CSS-in-JS**: Minimal inline styles for performance
4. **Animations**: GPU-accelerated transforms only

## Testing

Test all service pages:
```bash
npm run dev
# Visit http://localhost:3000/services
# Click on each service card to view detail page
# Test responsive design at different breakpoints
```

## Future Enhancements

- [ ] Service booking/inquiry forms
- [ ] Live chat integration for service pages
- [ ] Service comparison tool
- [ ] Client testimonials per service
- [ ] Service package customization calculator
- [ ] Video demos for each service
- [ ] Blog articles related to services
- [ ] Service team member profiles

---

**Created:** June 5, 2026  
**Last Updated:** June 5, 2026  
**Made with ❤️ in Butwal, Nepal**
