import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const realFaqs = [
  {
    question: 'How does D-Kode Era deliver projects, and what is the typical timeline?',
    answer: 'Our projects follow agile 2-week development sprints. Standard web applications, portals, and MVPs are delivered in 4 to 8 weeks, while comprehensive enterprise SaaS systems, ERPs, and native mobile apps take 10 to 16 weeks. Clients receive bi-weekly live staging demos and weekly progress reports.',
  },
  {
    question: 'Who owns the source code and Intellectual Property (IP) upon completion?',
    answer: 'You own 100% of the intellectual property. Upon project sign-off and final milestone completion, D-Kode Era transfers full repository access (GitHub/GitLab), database credentials, production cloud keys, and architectural documentation directly to your organization with zero vendor lock-in.',
  },
  {
    question: 'What payment methods and milestone structures do you accept?',
    answer: 'For Nepal-based clients, we accept Corporate Bank Transfers (ConnectIPS / NCHL), eSewa, and Khalti with formal VAT/PAN billing. For international clients, we accept SWIFT Bank Transfers, Wise, and Stripe. Payment is structured into 30% kickoff, 40% mid-development review & QA testing, and 30% final deployment handoff.',
  },
  {
    question: 'What modern technologies and frameworks does your engineering team build with?',
    answer: 'We specialize in production-grade modern stacks: Next.js 14+, React, TypeScript, and Tailwind CSS for frontends; Node.js, Express, Python, and PostgreSQL/Prisma for scalable backend APIs; and React Native for cross-platform iOS & Android mobile apps. All infrastructure is containerized with Docker and deployed on AWS or Vercel with automated CI/CD pipelines.',
  },
  {
    question: 'Do you sign a Non-Disclosure Agreement (NDA) before discussing project requirements?',
    answer: 'Yes, absolutely. We treat your project confidentiality and proprietary business ideas with the highest level of security. We sign mutual Non-Disclosure Agreements (NDAs) before discovery discussions and project kickoff.',
  },
  {
    question: 'What post-launch warranty, maintenance, and technical SLAs do you provide?',
    answer: 'Every custom software delivery includes an initial 30-day post-launch warranty with zero-cost bug fixes and performance tuning. Beyond that, we provide flexible monthly SLA support packages covering 24/7 uptime monitoring, database backups, security patches, and ongoing feature development.',
  },
  {
    question: 'Can your engineers collaborate with or augment our existing in-house developer team?',
    answer: 'Yes. We frequently partner with startups and scaling companies under team augmentation models, providing dedicated senior frontend, backend, or DevOps engineers who integrate directly into your Jira, GitHub, and daily standup workflows.',
  },
  {
    question: 'Where is D-Kode Era located, and how can we schedule a consultation?',
    answer: 'Our headquarters and engineering studio is located at Manigram, Butwal, Nepal. You can visit our studio for an in-person discovery session, schedule a Google Meet discovery call, or reach out directly to our engineering desk via WhatsApp (+977 9807544395) or email (dkodeera2026@gmail.com).',
  },
];

async function run() {
  console.log('Seeding real FAQs in database...');
  // Delete existing generic FAQs
  await prisma.fAQ.deleteMany({});

  // Insert real FAQs
  for (const faq of realFaqs) {
    await prisma.fAQ.create({
      data: faq,
    });
  }

  const allFaqs = await prisma.fAQ.findMany();
  console.log(`Successfully seeded ${allFaqs.length} real FAQs:`);
  allFaqs.forEach((f) => console.log(`- [#${f.id}] ${f.question}`));
}

run()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('Error seeding FAQs:', err);
    prisma.$disconnect();
  });
