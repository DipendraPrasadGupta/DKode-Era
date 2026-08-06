# Quick Start Guide for D-Kode Era Next.js Project

## Getting Started in 3 Steps

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Run Development Server
```bash
npm run dev
```

### 3️⃣ Open in Browser
Navigate to `http://localhost:3000`

---

## What's Included

✅ **All Original Sections**
- Hero with animated stats
- Services (6 offerings)
- About section with terminal interface
- Process (5 steps)
- Pricing (3 tiers)
- Portfolio (6 projects)
- Tech Stack
- Team members
- Testimonials
- FAQ (6 questions)
- Contact form
- Footer

✅ **Interactive Features**
- 🌍 Bilingual (English/Nepali)
- 🌓 Dark/Light theme
- 🤖 AI Chat (Claude API)
- 💰 Quote Calculator
- 🎁 Exit Popup
- 📱 Fully Responsive

✅ **Animations & Effects**
- Fade-up animations
- Marquee scrolling
- Hover effects
- Pulse animations
- Smooth scrolling
- Floating elements

---

## Project Structure

```
components/          → All UI components
lib/                → Data, translations, types
app/                → Next.js pages & layouts
public/             → Static assets
```

---

## How to Customize

### Change Text & Copy
Edit `lib/translations.ts` - All bilingual text is here

### Update Services, Portfolio, Team
Edit `lib/data.ts` - All content arrays are defined here

### Modify Colors & Theme
Edit `lib/styles.ts` - Theme color configuration

### Update Team Photos
Replace emoji avatars with actual images in `components/TeamSection.tsx`

---

## Enable AI Chat

1. Get API key from [Anthropic](https://console.anthropic.com)
2. Copy `.env.example` to `.env.local`
3. Add your API key:
   ```
   NEXT_PUBLIC_ANTHROPIC_API_KEY=your_key_here
   ```
4. Restart dev server

---

## Deploy to Production

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Build for Production
```bash
npm run build
npm start
```

---

## Common Issues

**Issue**: Styles not loading
**Fix**: Clear browser cache and restart dev server

**Issue**: Animations not smooth
**Fix**: Use modern browser (Chrome 90+, Firefox 88+)

**Issue**: AI Chat not working
**Fix**: Check API key in `.env.local`

---

## Performance Tips

- Images are optimized with Next.js Image component
- CSS is minified in production
- Components are code-split automatically
- Lazy loading for below-the-fold sections

---

## Browser Support

✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ Mobile browsers

---

## Need Help?

- Check `README.md` for detailed documentation
- Review component files for implementation details
- Visit [Next.js Docs](https://nextjs.org/docs)

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main page component with state |
| `lib/translations.ts` | All text in English & Nepali |
| `lib/data.ts` | Services, portfolio, team, etc. |
| `components/*` | Individual section components |
| `app/globals.css` | Global styles & animations |

---

Happy coding! 🚀

**Made with ❤️ by D-Kode Era Team**
