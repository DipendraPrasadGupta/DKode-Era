# D-Kode Era - Next.js Project

A complete Next.js conversion of the D-Kode Era landing page with full UI, animations, bilingual support (English/Nepali), dark/light mode, and interactive features.

## Features

✨ **Complete UI & Animations** - All original designs and animations preserved
🌍 **Bilingual Support** - English and Nepali language switching
🌓 **Dark/Light Mode** - Full theme support
🤖 **AI Chat** - Powered by Claude API
💰 **Quote Calculator** - Live pricing calculator
📱 **Responsive Design** - Mobile-optimized
🎨 **Smooth Animations** - Fade-up, marquee, pulse effects
📊 **Interactive Sections** - All original sections included

## Project Structure

```
dkodeera/
├── app/
│   ├── globals.css      # Global styles & animations
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page with state management
├── components/
│   ├── Navigation.tsx    # Header navigation
│   ├── Marquee.tsx       # Scrolling marquee
│   ├── HeroSection.tsx   # Hero section with stats
│   ├── ServicesSection.tsx
│   ├── AboutSection.tsx
│   ├── ProcessSection.tsx
│   ├── PricingSection.tsx
│   ├── PortfolioSection.tsx
│   ├── TechStackSection.tsx
│   ├── TeamSection.tsx
│   ├── TestimonialsSection.tsx
│   ├── FAQSection.tsx
│   ├── ContactSection.tsx
│   ├── Footer.tsx
│   ├── FloatingButtons.tsx
│   ├── AIChat.tsx
│   ├── QuoteCalculator.tsx
│   └── ExitPopup.tsx
├── lib/
│   ├── translations.ts  # Bilingual translations
│   ├── data.ts         # All content data
│   ├── styles.ts       # Theme colors & styles
│   └── types.ts        # TypeScript types
├── package.json
├── tsconfig.json
├── next.config.js
└── .gitignore

```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Steps

1. **Navigate to the project**
   ```bash
   cd dkodeera
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Visit `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Features in Detail

### 1. Bilingual Support (EN/NP)
- Click the language toggle in the navigation
- All content switches between English and Nepali
- Proper Unicode Devanagari support

### 2. Dark/Light Mode
- Click the sun/moon icon in the navigation
- All colors and backgrounds automatically adjust
- Smooth transitions between themes

### 3. Navigation
- Fixed header that becomes sticky on scroll
- Smooth scroll to sections
- Mobile-friendly responsive design

### 4. Hero Section
- Animated stats counter
- Visitor counter with real-time updates
- Multiple call-to-action buttons
- Grid background effect

### 5. Services Section
- 6 service cards with hover effects
- Animated border effect on hover
- Price information and tags

### 6. About Section
- Terminal-style interface
- Founded year card
- Key business points

### 7. Pricing Section
- 3 pricing tiers (Starter, Growth, Enterprise)
- Feature lists
- Responsive grid layout

### 8. Portfolio Section
- 6 project showcases
- Gradient backgrounds
- Project result tags

### 9. Team Section
- Team member cards with roles
- Skills tags
- Avatar icons

### 10. FAQ Section
- Accordion-style FAQ
- Smooth expand/collapse animation
- Click to open/close

### 11. AI Chat
- Floating AI chat button
- Integration with Claude API
- Real-time responses
- Message history

### 12. Quote Calculator
- Interactive pricing calculator
- Select services to see total
- Free support badge

### 13. Exit Intent Popup
- Shows when user moves to leave
- Special offer message
- One-time display

### 14. Floating Buttons
- Fixed WhatsApp button
- Call Now button
- AI Chat toggle

## Customization

### Update Content
Edit files in `lib/`:
- `lib/translations.ts` - Change text/copy
- `lib/data.ts` - Update services, team, portfolio, etc.

### Change Colors
Edit `lib/styles.ts` in the `getThemeColors()` function:
```ts
cyan: "#00d4ff",    // Primary accent
gold: "#f5c842",    // Pricing highlight
green: "#00e5a0",   // Success/positive
```

### Modify Fonts
Edit `app/globals.css` and component files:
- Font imports are in `globals.css`
- Update font-family properties in style objects

## API Integration

### Claude AI Chat
The AI chat uses the Anthropic Claude API. To enable it:

1. Get API key from [Anthropic](https://www.anthropic.com)
2. Update the API endpoint in `components/AIChat.tsx`
3. Add your API key securely

### Contact Form
The contact form is currently static. To enable emails:
1. Choose an email service (SendGrid, EmailJS, etc.)
2. Update the form submission in `components/ContactSection.tsx`

## Performance

- ✅ Next.js Server-Side Rendering (SSR)
- ✅ Optimized CSS and JavaScript
- ✅ Lazy-loaded components
- ✅ Image optimization ready
- ✅ Fast smooth scroll behavior

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## License

This project is created for D-Kode Era Pvt. Ltd.

## Support

For questions or issues, contact: info@dkodeera.com

---

**Made with ❤️ in Butwal, Nepal**
