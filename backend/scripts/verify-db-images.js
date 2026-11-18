const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verify() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const total = await client.query('SELECT count(*) FROM product_images');
  const distinct = await client.query('SELECT count(DISTINCT url) FROM product_images');
  const dups = await client.query('SELECT url, count(*) FROM product_images GROUP BY url HAVING count(*) > 1');

  console.log(`Total images in DB: ${total.rows[0].count}`);
  console.log(`Distinct URLs in DB: ${distinct.rows[0].count}`);
  console.log(`Duplicate URLs count: ${dups.rows.length}`);

  // Fetch top 10 products with images
  const sample = await client.query(`
    SELECT p.name, p.price, pi.url 
    FROM products p 
    JOIN product_images pi ON p.id = pi."productId" 
    ORDER BY p.price DESC 
    LIMIT 10
  `);
  console.log('\nTop 10 Products with Assigned Unique Images:');
  sample.rows.forEach(r => console.log(`- [${r.name}] ($${r.price}) -> ${r.url.slice(0, 85)}...`));

  await client.end();
}

verify().catch(console.error);
