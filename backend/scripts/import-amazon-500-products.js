const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment config
const env = dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env'), 'utf8'));

// Target databases (Dual DB parity matching previous import architecture)
const PRIMARY_URL = 'postgresql://postgres:zmBjwrBiwYgdF30sodkI@72.62.81.204:5432/postgres?schema=public';
const BACKUP_URL = env.DATABASE_URL || 'postgresql://pgxshop:XxkJ9rWMHlgAusrCUzKs@2.25.150.87:5434/pgxshop?schema=public';

// Load the 500 Amazon products dataset
const productsDataPath = path.join(__dirname, 'data', 'amazon-500-products.json');
const amazonProducts = JSON.parse(fs.readFileSync(productsDataPath, 'utf8'));

async function seedDatabase(connectionString, dbName) {
  console.log(`\n============================================================`);
  console.log(`🔄 CONNECTING & SYNCING: ${dbName}`);
  console.log(`============================================================`);

  const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const initialCount = await prisma.product.count();
    console.log(`Current products in ${dbName}: ${initialCount}`);

    // Map categories
    const categories = await prisma.category.findMany();
    const catMap = new Map(categories.map(c => [c.slug, c.id]));
    const fallbackCatId = catMap.get('strength-equipment') || categories[0].id;

    console.log(`Loaded ${categories.length} categories from DB. Beginning batch import...\n`);

    let count = 0;
    const t0 = Date.now();

    for (const item of amazonProducts) {
      const categoryId = catMap.get(item.categorySlug) || fallbackCatId;

      // Upsert product by unique slug
      const product = await prisma.product.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          sku: item.sku,
          price: item.price,
          comparePrice: item.comparePrice,
          stock: item.stock,
          weight: item.weight,
          shortDesc: item.shortDesc,
          description: item.description,
          isFeatured: item.isFeatured,
          isHot: item.isHot,
          categoryId: categoryId,
          isActive: true
        },
        create: {
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          price: item.price,
          comparePrice: item.comparePrice,
          stock: item.stock,
          weight: item.weight,
          shortDesc: item.shortDesc,
          description: item.description,
          isFeatured: item.isFeatured,
          isHot: item.isHot,
          categoryId: categoryId,
          isActive: true
        }
      });

      // Clear existing images and insert new ones
      await prisma.productImage.deleteMany({
        where: { productId: product.id }
      });

      if (item.images && item.images.length > 0) {
        for (let i = 0; i < item.images.length; i++) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: item.images[i].url,
              alt: item.images[i].alt || item.name,
              sortOrder: i + 1
            }
          });
        }
      }

      count++;
      if (count % 50 === 0 || count === amazonProducts.length) {
        const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
        console.log(`  [${String(count).padStart(3)}/${amazonProducts.length}] (${elapsed}s) Processed: "${item.name.substring(0, 45)}"`);
      }
    }

    const finalProducts = await prisma.product.count();
    const finalImages = await prisma.productImage.count();
    console.log(`\n🎉 Success on [${dbName}]: Initial = ${initialCount} ➔ Final Products = ${finalProducts}, Total Images = ${finalImages}`);
    return { dbName, initialCount, finalProducts, finalImages };
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

async function run() {
  console.log('⚡ STARTING 500 AMAZON BEST-SELLER FITNESS PRODUCTS IMPORT...\n');
  const t0 = Date.now();

  // 1. BACKUP / ACTIVE DB (from .env)
  const backupResult = await seedDatabase(BACKUP_URL, 'ACTIVE/BACKUP DB (2.25.150.87:5434)');

  // 2. PRIMARY DB (72.62.81.204:5432)
  const primaryResult = await seedDatabase(PRIMARY_URL, 'PRIMARY DB (72.62.81.204:5432)');

  const durationSec = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('\n============================================================');
  console.log('              FINAL IMPORT & PARITY SUMMARY                 ');
  console.log('============================================================');
  console.log(`Active DB (2.25.150.87:5434):  ${backupResult.finalProducts} products | ${backupResult.finalImages} images`);
  console.log(`Primary DB (72.62.81.204:5432): ${primaryResult.finalProducts} products | ${primaryResult.finalImages} images`);
  console.log(`Execution Time:                ${durationSec}s`);
  const isParity = backupResult.finalProducts === primaryResult.finalProducts;
  console.log(`Dual-DB Parity:                ${isParity ? '100% EXACT PARITY ✔️' : 'MISMATCH ❌'}`);
  console.log('============================================================\n');
}

run().catch(err => {
  console.error('❌ 500 Products Import failed:', err);
  process.exit(1);
});
