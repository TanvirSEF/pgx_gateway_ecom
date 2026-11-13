const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const slugs = ['business-tools', 'creative-assets', 'hosting-cloud', 'business-templates', 'memberships'];
  const res = await pool.query(
    'UPDATE categories SET "isActive" = false WHERE slug = ANY($1::text[])',
    [slugs]
  );
  console.log('Deactivated empty categories count:', res.rowCount);
  await pool.end();
}

main().catch(console.error);
