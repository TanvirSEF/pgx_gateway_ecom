require('dotenv/config');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DIGITAL_CATEGORIES = [
  { name: 'Software & Licenses', slug: 'software-licenses', icon: 'laptop', sortOrder: 1 },
  { name: 'Website Templates', slug: 'website-templates', icon: 'credit-card', sortOrder: 2 },
  { name: 'AI Tools & Automation', slug: 'ai-tools-automation', icon: 'bot', sortOrder: 3 },
  { name: 'Digital Marketing', slug: 'digital-marketing', icon: 'megaphone', sortOrder: 4 },
  { name: 'Online Courses & E-books', slug: 'online-courses-ebooks', icon: 'graduation-cap', sortOrder: 5 },
  { name: 'Business Tools', slug: 'business-tools', icon: 'bar-chart', sortOrder: 6 },
  { name: 'Creative Assets', slug: 'creative-assets', icon: 'palette', sortOrder: 7 },
  { name: 'Hosting & Cloud', slug: 'hosting-cloud', icon: 'cloud', sortOrder: 8 },
  { name: 'Business Templates', slug: 'business-templates', icon: 'file-text', sortOrder: 9 },
  { name: 'Memberships', slug: 'memberships', icon: 'users', sortOrder: 10 },
];

const DIGITAL_PRODUCTS = [
  {
    name: 'AI Business Chatbot Pro',
    slug: 'ai-business-chatbot-pro',
    sku: 'AI-BOT-PRO-01',
    categorySlug: 'ai-tools-automation',
    price: 49.00,
    comparePrice: 79.00,
    stock: 9999,
    isFeatured: true,
    isHot: true,
    shortDesc: 'Automate. Engage. Grow. Smart multi-channel AI customer service and sales agent trained on your business data.',
    description: '<h2>AI Business Chatbot Pro</h2><p>Revolutionize your customer support and lead generation with our plug-and-play AI Business Chatbot Pro. Pre-trained on cutting-edge LLMs with native integration for WhatsApp, Messenger, Telegram, and web chat.</p><ul><li>Instant automated responses with 99.4% accuracy</li><li>Multi-language translation in real time</li><li>CRM & Stripe payment link integration</li><li>Zero coding required — embed in 2 minutes</li></ul>',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    metaTitle: 'AI Business Chatbot Pro - Automated Sales & Support',
  },
  {
    name: 'E-commerce Website Kit',
    slug: 'e-commerce-website-kit',
    sku: 'WEB-KIT-ECOM-01',
    categorySlug: 'website-templates',
    price: 149.00,
    comparePrice: 199.00,
    stock: 9999,
    isFeatured: true,
    isHot: false,
    shortDesc: 'Modern e-commerce UI kit and theme compatible with Next.js, WordPress, Shopify, and Elementor.',
    description: '<h2>Complete E-commerce Website Kit</h2><p>Launch your online store in hours instead of months. Includes 45+ ready-made responsive page layouts, checkout funnels, mini-cart drawers, and product filters.</p><ul><li>Full source code in React/Next.js & Tailwind</li><li>Figma UI kit with 200+ reusable components</li><li>SEO optimized with 98+ PageSpeed scores</li><li>Lifetime updates & commercial license</li></ul>',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    metaTitle: 'E-commerce Website Kit - High-Converting Store Templates',
  },
  {
    name: 'Marketing Template Bundle',
    slug: 'marketing-template-bundle',
    sku: 'MKT-BNDL-01',
    categorySlug: 'digital-marketing',
    price: 39.00,
    comparePrice: 59.00,
    stock: 9999,
    isFeatured: true,
    isHot: true,
    shortDesc: '500+ Viral social media templates for Instagram, Facebook, LinkedIn, TikTok, and Twitter.',
    description: '<h2>Viral Marketing Template Bundle</h2><p>Scale your organic brand presence across all major social networks with our battle-tested marketing asset pack.</p><ul><li>Canva & Adobe Illustrator editable source files</li><li>Carousels, reels covers, banners, and infographics</li><li>High-CTR ad creatives proven to lower CPA</li><li>Content calendar & copy prompts included</li></ul>',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    metaTitle: 'Marketing Template Bundle - 500+ Social Media Assets',
  },
  {
    name: 'Business CRM Subscription',
    slug: 'business-crm-subscription',
    sku: 'CRM-SUB-01',
    categorySlug: 'business-tools',
    price: 79.00,
    comparePrice: 99.00,
    stock: 9999,
    isFeatured: true,
    isHot: false,
    shortDesc: 'All-in-one lead tracking, client CRM, automated invoicing, and deal pipeline dashboard. Unlimited users.',
    description: '<h2>Cloud Business CRM Platform</h2><p>Manage your entire client pipeline and financial operations from one intuitive, modern cloud dashboard.</p><ul><li>Kanban visual deal stages and contract generation</li><li>Automated email sequences and client portal</li><li>Stripe, PayPal, and crypto invoice collection</li><li>Real-time revenue forecast analytics</li></ul>',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    metaTitle: 'Business CRM Subscription - Cloud Pipeline Platform',
  },
  {
    name: 'Digital Marketing Masterclass',
    slug: 'digital-marketing-masterclass',
    sku: 'COURSE-MKT-01',
    categorySlug: 'online-courses-ebooks',
    price: 29.00,
    comparePrice: 49.00,
    stock: 9999,
    isFeatured: true,
    isHot: true,
    shortDesc: 'Learn, Grow, Succeed. Comprehensive video masterclass with 40+ HD lessons, worksheets, and certificates.',
    description: '<h2>Digital Marketing Masterclass 2026</h2><p>Master growth marketing, paid acquisition, search engine optimization, and viral storytelling with industry experts.</p><ul><li>40+ on-demand HD video training modules</li><li>Step-by-step case studies and SOPs</li><li>Private Discord community mastermind access</li><li>Verified graduation credential & badge</li></ul>',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    metaTitle: 'Digital Marketing Masterclass - Video Training Program',
  },
];

async function seed() {
  console.log('🚀 Seeding PGX DIGITAL categories & featured products...');

  // 1. Seed categories
  const catMap = new Map();
  for (const cat of DIGITAL_CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder, isActive: true },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, sortOrder: cat.sortOrder, isActive: true },
    });
    catMap.set(cat.slug, record.id);
    console.log(`✅ Category: ${cat.name}`);
  }

  // 2. Seed products
  for (const prod of DIGITAL_PRODUCTS) {
    const categoryId = catMap.get(prod.categorySlug);
    if (!categoryId) continue;

    const product = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        price: prod.price,
        comparePrice: prod.comparePrice,
        sku: prod.sku,
        categoryId: categoryId,
        stock: prod.stock,
        isFeatured: prod.isFeatured,
        isHot: prod.isHot,
        shortDesc: prod.shortDesc,
        description: prod.description,
        metaTitle: prod.metaTitle,
        isActive: true,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        price: prod.price,
        comparePrice: prod.comparePrice,
        categoryId: categoryId,
        stock: prod.stock,
        isFeatured: prod.isFeatured,
        isHot: prod.isHot,
        shortDesc: prod.shortDesc,
        description: prod.description,
        metaTitle: prod.metaTitle,
        isActive: true,
      },
    });

    // Ensure product image
    const existingImg = await prisma.productImage.findFirst({
      where: { productId: product.id },
    });

    if (!existingImg) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
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

    console.log(`⭐ Product: ${prod.name} ($${prod.price})`);
  }

  console.log('🎉 PGX DIGITAL seed complete!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
