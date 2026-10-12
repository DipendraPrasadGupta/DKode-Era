import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SiteSetting" (
      "key" VARCHAR(255) PRIMARY KEY,
      "value" TEXT NOT NULL DEFAULT '',
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const settings: Record<string, string> = {
    agency_name: 'D-Kode Era',
    agency_tagline: "Nepal's Premier Software & IT Company",
    agency_email: 'dkodeera2026@gmail.com',
    support_email: 'dkodeera2026@gmail.com',
    agency_phone: '+977 9807544395',
    whatsapp_number: '+977 9807544395',
    agency_address: 'Manigram, Butwal, Nepal',
    agency_country: 'Nepal',
    business_hours: 'Sun-Fri 9:00 AM - 6:00 PM NST',
    social_linkedin: 'https://linkedin.com/company/d-kode-era',
    social_instagram: 'https://instagram.com/d_kode_era',
    social_facebook: 'https://facebook.com/dkodeera',
    social_github: 'https://github.com/d-kode-era',
    agency_website: 'https://dkodeera.com',
    seo_title: "D-Kode Era - Nepal's Premier Software & IT Company",
    seo_description: 'Transforming businesses with custom software, mobile apps, enterprise SaaS, and AI automation in Nepal.'
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "SiteSetting" ("key", "value", "updatedAt")
      VALUES ($1, $2, NOW())
      ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW();
    `, key, value);
  }

  const rows = await prisma.$queryRaw`SELECT key, value FROM "SiteSetting"`;
  console.log('SiteSetting rows inserted successfully:', rows);
}

run()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('Error seeding settings:', err);
    prisma.$disconnect();
  });
