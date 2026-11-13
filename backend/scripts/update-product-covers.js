const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment config
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://pgxgateway_ecom:o3TIffVaSP05bbFYueiT@72.62.81.204:5438/pgxgateway_ecom?schema=public';

async function main() {
  console.log('🔄 Connecting to PostgreSQL to update product primary covers...');
  const pool = new Pool({ connectionString: DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const products = await prisma.product.findMany({
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    console.log(`Found ${products.length} products in DB.`);

    let updated = 0;
    for (const p of products) {
      const primaryUrl = `/products/${p.slug}.svg`;
      const primaryImage = p.images[0];

      if (primaryImage) {
        await prisma.productImage.update({
          where: { id: primaryImage.id },
          data: {
            url: primaryUrl,
            alt: `${p.name} Official Product Card Cover`,
          },
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: p.id,
            url: primaryUrl,
            alt: `${p.name} Official Product Card Cover`,
            sortOrder: 0,
          },
        });
      }
      updated++;
    }

    console.log(`✅ Successfully updated ${updated} products with custom unique SVG covers!`);
  } catch (err) {
    console.error('❌ Error updating product covers:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
