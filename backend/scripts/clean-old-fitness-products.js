require('dotenv/config');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DIGITAL_CATEGORY_SLUGS = [
  'software-licenses',
  'website-templates',
  'ai-tools-automation',
  'digital-marketing',
  'online-courses-ebooks',
  'business-tools',
  'creative-assets',
  'hosting-cloud',
  'business-templates',
  'memberships',
];

const MORE_DIGITAL_PRODUCTS = [
  // Software & Licenses
  {
    name: 'DevFlow Pro IDE Extension',
    slug: 'devflow-pro-ide-extension',
    sku: 'DEV-FLOW-PRO',
    categorySlug: 'software-licenses',
    price: 29.00,
    comparePrice: 49.00,
    shortDesc: 'Productivity and AI code acceleration suite for VS Code and Cursor. Lifetime single-user license.',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
  },
  {
    name: 'CloudSync SaaS Desktop Client',
    slug: 'cloudsync-saas-client',
    sku: 'CLOUD-SYNC-CLI',
    categorySlug: 'software-licenses',
    price: 59.00,
    comparePrice: 89.00,
    shortDesc: 'End-to-end encrypted backup and distributed file sync desktop utility with unlimited bandwidth.',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
  },
  // Website Templates
  {
    name: 'SaaS Modern Landing Page System',
    slug: 'saas-landing-page-system',
    sku: 'SAAS-LAND-01',
    categorySlug: 'website-templates',
    price: 49.00,
    comparePrice: 79.00,
    shortDesc: 'High-conversion Next.js 16 + Tailwind CSS template engineered for micro-SaaS and software startups.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
  },
  {
    name: 'Portfolio & Creative Agency Template',
    slug: 'portfolio-agency-template',
    sku: 'PORT-AGCY-01',
    categorySlug: 'website-templates',
    price: 39.00,
    comparePrice: 59.00,
    shortDesc: 'Minimalist, fluid-motion agency showcase template with CMS integration and dark mode toggle.',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
  },
  // AI Tools & Automation
  {
    name: 'Autonomous Agent Workflow Engine',
    slug: 'autonomous-agent-workflow-engine',
    sku: 'AI-WORKFLOW-ENG',
    categorySlug: 'ai-tools-automation',
    price: 89.00,
    comparePrice: 129.00,
    shortDesc: 'Self-hosted AI agent orchestrator connecting OpenAI, Anthropic, and Gemini models with webhook triggers.',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    isHot: true,
  },
  {
    name: 'Voice AI Studio & Generator Suite',
    slug: 'voice-ai-studio-suite',
    sku: 'VOICE-AI-STUDIO',
    categorySlug: 'ai-tools-automation',
    price: 39.00,
    comparePrice: 69.00,
    shortDesc: 'Real-time text-to-speech, custom voice design, and multi-language podcast voice synthesizer.',
    imageUrl: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
  },
  // Digital Marketing
  {
    name: 'SEO Growth Blueprint 2026',
    slug: 'seo-growth-blueprint-2026',
    sku: 'SEO-BLUEPRINT-26',
    categorySlug: 'digital-marketing',
    price: 24.00,
    comparePrice: 49.00,
    shortDesc: 'Actionable technical SEO checklists, programmatic content strategies, and backlink outreach playbooks.',
    imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
  },
  {
    name: 'Viral Ad Hooks & TikTok Scripts Pack',
    slug: 'viral-ad-hooks-scripts',
    sku: 'VIRAL-HOOKS-PACK',
    categorySlug: 'digital-marketing',
    price: 19.00,
    comparePrice: 39.00,
    shortDesc: '300+ Tested hook lines, visual cues, and CTA scripts proven across $5M+ in paid social media ad spend.',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
  },
  // Online Courses & E-books
  {
    name: 'Full-Stack Next.js Architecture Bootcamp',
    slug: 'full-stack-nextjs-bootcamp',
    sku: 'NEXTJS-BOOTCAMP',
    categorySlug: 'online-courses-ebooks',
    price: 49.00,
    comparePrice: 99.00,
    shortDesc: 'Master Next.js App Router, Server Actions, Prisma ORM, and high-scale production deployments.',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
  },
  {
    name: 'AI Engineering & Prompt Systems Handbook',
    slug: 'ai-engineering-handbook',
    sku: 'AI-ENG-HANDBOOK',
    categorySlug: 'online-courses-ebooks',
    price: 19.00,
    comparePrice: 39.00,
    shortDesc: '250-Page practitioner guide covering RAG architectures, evaluations, fine-tuning, and LLM tooling.',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
  },
  // Business Tools
  {
    name: 'Financial Modeling & Valuation Suite',
    slug: 'financial-modeling-valuation-suite',
    sku: 'FIN-MODEL-SUITE',
    categorySlug: 'business-tools',
    price: 45.00,
    comparePrice: 75.00,
    shortDesc: 'Investment-grade DCF, SaaS revenue cohort, and cap table spreadsheet models for Excel & Google Sheets.',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
  },
  // Creative Assets
  {
    name: '3D Neon Cyber Icon Pack',
    slug: '3d-neon-cyber-icon-pack',
    sku: '3D-NEON-ICONS',
    categorySlug: 'creative-assets',
    price: 25.00,
    comparePrice: 45.00,
    shortDesc: '150+ High-resolution 3D translucent icons rendered in 4K PNG and GLTF with transparent backgrounds.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
  },
  // Hosting & Cloud
  {
    name: 'Cloud VPS Server Hardening & DevOps Pack',
    slug: 'cloud-vps-devops-pack',
    sku: 'DEVOPS-VPS-PACK',
    categorySlug: 'hosting-cloud',
    price: 35.00,
    comparePrice: 60.00,
    shortDesc: 'Automated Ansible playbooks and bash scripts for zero-trust Linux hardening, UFW, Docker, and SSL.',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
  },
  // Business Templates
  {
    name: 'Standard Legal & NDA Contract Pack',
    slug: 'standard-legal-contract-pack',
    sku: 'LEGAL-CONTRACT-PK',
    categorySlug: 'business-templates',
    price: 39.00,
    comparePrice: 69.00,
    shortDesc: 'Attorney-drafted client service agreements, mutual NDAs, independent contractor terms, and IP assignment.',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    isFeatured: false,
  },
  // Memberships
  {
    name: 'PGX VIP Creator Pass (Annual)',
    slug: 'pgx-vip-creator-pass',
    sku: 'PGX-VIP-PASS',
    categorySlug: 'memberships',
    price: 199.00,
    comparePrice: 299.00,
    shortDesc: 'Unlimited access to all software, templates, courses, and future releases on PGX DIGITAL for 1 year.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    isHot: true,
  },
];

async function main() {
  console.log('🧹 Beginning cleanup of old fitness catalog...');

  // 1. Delete test orders referencing old products so foreign key constraints are not violated
  console.log('🗑️ Removing old test orders...');
  await prisma.orderItem.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.order.deleteMany({});
  console.log('✅ Cleared test orders.');

  // 2. Find digital category IDs
  const digitalCategories = await prisma.category.findMany({
    where: { slug: { in: DIGITAL_CATEGORY_SLUGS } },
    select: { id: true, slug: true },
  });

  const digitalCategoryIds = digitalCategories.map((c) => c.id);
  const catMap = new Map(digitalCategories.map((c) => [c.slug, c.id]));

  console.log(`Found ${digitalCategoryIds.length} digital categories.`);

  // 3. Find old products (products NOT in digital categories)
  const oldProducts = await prisma.product.findMany({
    where: {
      categoryId: { notIn: digitalCategoryIds },
    },
    select: { id: true },
  });

  console.log(`Found ${oldProducts.length} old fitness products to remove.`);

  if (oldProducts.length > 0) {
    const oldProductIds = oldProducts.map((p) => p.id);

    // Delete related child tables
    await prisma.productImage.deleteMany({
      where: { productId: { in: oldProductIds } },
    });
    await prisma.productVariant.deleteMany({
      where: { productId: { in: oldProductIds } },
    });
    await prisma.review.deleteMany({
      where: { productId: { in: oldProductIds } },
    });
    await prisma.wishlist.deleteMany({
      where: { productId: { in: oldProductIds } },
    });

    // Delete products
    const delResult = await prisma.product.deleteMany({
      where: { id: { in: oldProductIds } },
    });
    console.log(`✅ Successfully deleted ${delResult.count} old fitness products.`);
  }

  // 4. Delete old fitness categories
  const delCats = await prisma.category.deleteMany({
    where: {
      slug: { notIn: DIGITAL_CATEGORY_SLUGS },
    },
  });
  console.log(`✅ Deleted ${delCats.count} old fitness categories.`);

  // 5. Seed additional digital products across the 10 categories
  console.log('🌱 Seeding digital products across all 10 digital categories...');
  for (const prod of MORE_DIGITAL_PRODUCTS) {
    const categoryId = catMap.get(prod.categorySlug);
    if (!categoryId) continue;

    const record = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        price: prod.price,
        comparePrice: prod.comparePrice,
        sku: prod.sku,
        categoryId: categoryId,
        stock: 9999,
        isFeatured: Boolean(prod.isFeatured),
        isHot: Boolean(prod.isHot),
        shortDesc: prod.shortDesc,
        description: `<h2>${prod.name}</h2><p>${prod.shortDesc}</p><p>Instant digital download. Compatible with all modern development and production environments. Commercial license included.</p>`,
        isActive: true,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        price: prod.price,
        comparePrice: prod.comparePrice,
        categoryId: categoryId,
        stock: 9999,
        isFeatured: Boolean(prod.isFeatured),
        isHot: Boolean(prod.isHot),
        shortDesc: prod.shortDesc,
        description: `<h2>${prod.name}</h2><p>${prod.shortDesc}</p><p>Instant digital download. Compatible with all modern development and production environments. Commercial license included.</p>`,
        isActive: true,
      },
    });

    // Image
    const existingImg = await prisma.productImage.findFirst({
      where: { productId: record.id },
    });
    if (!existingImg) {
      await prisma.productImage.create({
        data: {
          productId: record.id,
          url: prod.imageUrl,
          alt: prod.name,
          sortOrder: 0,
        },
      });
    } else {
      await prisma.productImage.update({
        where: { id: existingImg.id },
        data: { url: prod.imageUrl, alt: prod.name },
      });
    }

    console.log(`✨ Seeded: ${prod.name} ($${prod.price})`);
  }

  // 6. Verify final counts
  const finalProductCount = await prisma.product.count();
  const finalCategoryCount = await prisma.category.count();
  console.log(`\n🎉 Cleanup complete!`);
  console.log(`📦 Total Digital Products: ${finalProductCount}`);
  console.log(`📂 Total Digital Categories: ${finalCategoryCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
