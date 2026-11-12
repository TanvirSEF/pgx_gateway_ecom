const fs = require('fs');
const path = require('path');

function detectCategory(title, type, tags) {
  const text = `${title} ${type || ''} ${(tags || []).join(' ')}`.toLowerCase();

  if (text.includes('under desk') || text.includes('under-desk') || text.includes('walking pad') || text.includes('standing desk') || text.includes('balance board')) {
    return text.includes('walking') || text.includes('treadmill') ? 'trademill' : 'home-office';
  }
  if (text.includes('treadmill')) {
    return 'trademill';
  }
  if (text.includes('rower') || text.includes('rowing') || text.includes('bike') || text.includes('cycle') || text.includes('elliptical') || text.includes('stepper') || text.includes('climber') || text.includes('skierg')) {
    return 'cardio-equipment';
  }
  if (text.includes('multi-station') || text.includes('home gym') || text.includes('smith machine') || text.includes('functional trainer') || text.includes('power cage') || text.includes('cable crossover')) {
    return 'home-gym';
  }
  if (text.includes('bundle') || text.includes('package') || text.includes('starter set') || text.includes('complete set')) {
    return 'bundles';
  }
  if (text.includes('bag') || text.includes('backpack') || text.includes('duffel') || text.includes('duffle')) {
    return 'bags';
  }
  if (text.includes('short') || text.includes('shirt') || text.includes('tee') || text.includes('top') || text.includes('legging') || text.includes('hoodie') || text.includes('shoe') || text.includes('glove')) {
    return 'apparel';
  }
  if (text.includes('massage') || text.includes('gun') || text.includes('scale') || text.includes('acupressure') || text.includes('recovery') || text.includes('foam roller') || text.includes('wheel') || text.includes('mat')) {
    return text.includes('yoga') || text.includes('acupressure') || text.includes('massage') ? 'wellness' : 'accessories';
  }
  if (text.includes('belt') || text.includes('strap') || text.includes('wrap') || text.includes('sleeve') || text.includes('band') || text.includes('rope') || text.includes('chalk') || text.includes('collar') || text.includes('pad')) {
    return 'accessories';
  }
  if (text.includes('dumbbell') || text.includes('barbell') || text.includes('plate') || text.includes('kettlebell') || text.includes('bench') || text.includes('squat') || text.includes('rack') || text.includes('cage') || text.includes('weight')) {
    return 'strength-equipment';
  }

  return 'strength-equipment';
}

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .trim();
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const stores = [
  { url: 'https://flybirdfitness.com', brand: 'Flybird' },
  { url: 'https://www.ritfitsports.com', brand: 'RitFit' },
  { url: 'https://www.fringesport.com', brand: 'Fringe Sport' },
  { url: 'https://www.bellsofsteel.us', brand: 'Bells of Steel' },
  { url: 'https://synergeefitness.com', brand: 'Synergee' },
  { url: 'https://sunnyhealthfitness.com', brand: 'Sunny Health & Fitness' },
  { url: 'https://www.walkingpad.com', brand: 'WalkingPad' },
  { url: 'https://www.urevo.com', brand: 'UREVO' },
  { url: 'https://www.dmoose.com', brand: 'DMoose' },
  { url: 'https://ironbullstrength.com', brand: 'Iron Bull Strength' },
  { url: 'https://www.prosourcefit.com', brand: 'ProsourceFit' },
  { url: 'https://www.gymreapers.com', brand: 'Gymreapers' }
];

async function harvest() {
  console.log('⚡ STARTING FILTERED HARVEST OF REAL AMAZON-SELLER FITNESS PRODUCTS...\n');
  const seenImages = new Set();
  const seenSlugs = new Set();
  const seenTitles = new Set();
  const harvestedProducts = [];

  const MAX_PER_STORE = 55;

  for (const s of stores) {
    try {
      console.log(`Fetching from ${s.brand} (${s.url})...`);
      const res = await fetch(`${s.url}/products.json?limit=250`);
      const data = await res.json();
      const prods = data.products || [];
      console.log(`  Found ${prods.length} total products on ${s.brand}`);

      let addedFromStore = 0;
      for (const p of prods) {
        if (!p.images || p.images.length === 0) continue;
        const mainImage = p.images[0].src;
        if (!mainImage || seenImages.has(mainImage)) continue;

        const title = p.title.trim();
        const lowerTitle = title.toLowerCase();

        // Filter out non-physical or junk items
        if (
          lowerTitle.includes('insurance') ||
          lowerTitle.includes('warranty') ||
          lowerTitle.includes('worry-free') ||
          lowerTitle.includes('protection') ||
          lowerTitle.includes('gift card') ||
          lowerTitle.includes('membership') ||
          lowerTitle.includes('digital') ||
          lowerTitle.includes('shipping') ||
          lowerTitle.includes('extended plan')
        ) {
          continue;
        }

        if (seenTitles.has(lowerTitle)) continue;

        const variant = p.variants?.[0] || {};
        let price = parseFloat(variant.price);
        if (isNaN(price) || price < 12) continue; // Exclude sub-€12 test/junk items

        let comparePrice = parseFloat(variant.compare_at_price);
        if (isNaN(comparePrice) || comparePrice <= price) {
          comparePrice = Math.round(price * 1.25);
        }

        let slug = slugify(p.handle || title);
        if (seenSlugs.has(slug)) {
          slug = `${slug}-${Math.floor(Math.random() * 900 + 100)}`;
        }

        const categorySlug = detectCategory(title, p.product_type, p.tags);
        const sku = `AMZ-${s.brand.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90000 + 10000)}`;

        seenImages.add(mainImage);
        seenSlugs.add(slug);
        seenTitles.add(lowerTitle);

        let shortDesc = `Brand: ${s.brand}\nAuthentic Amazon Best-Seller Edition\nCategory: ${categorySlug.replace('-', ' ').toUpperCase()}\nWarranty: 1-Year Comprehensive Manufacturer Warranty`;
        if (variant.weight && variant.weight > 0) {
          shortDesc += `\nItem Weight: ${variant.weight} ${variant.weight_unit || 'kg'}`;
        }

        const description = p.body_html && p.body_html.length > 50 
          ? `<h2>Amazon Best-Seller: ${title}</h2>\n${cleanHtml(p.body_html)}` 
          : `<h2>Amazon Best-Seller: ${title}</h2><p>Official ${s.brand} commercial equipment. Designed for heavy athletic workouts, durability, and ergonomic precision.</p>`;

        harvestedProducts.push({
          name: title,
          slug,
          sku,
          categorySlug,
          price: Math.round(price),
          comparePrice: Math.round(comparePrice),
          stock: Math.floor(Math.random() * 40 + 20),
          weight: variant.weight ? `${variant.weight} ${variant.weight_unit || 'kg'}` : '15 kg',
          isFeatured: harvestedProducts.length % 8 === 0,
          isHot: harvestedProducts.length % 5 === 0,
          isActive: true,
          shortDesc,
          description,
          images: p.images.slice(0, 2).map((img, i) => ({
            url: img.src,
            alt: `${title} Official Product Shot ${i + 1}`
          }))
        });

        addedFromStore++;
        if (addedFromStore >= MAX_PER_STORE) break;
        if (harvestedProducts.length >= 500) break;
      }
      console.log(`  ✔️ Added ${addedFromStore} physical items (Total collected: ${harvestedProducts.length})\n`);
      if (harvestedProducts.length >= 500) break;
    } catch (err) {
      console.error(`  ❌ Error fetching from ${s.brand}:`, err.message);
    }
  }

  // Top up to exactly 500 if needed
  if (harvestedProducts.length < 500) {
    console.log(`Topping up from remaining stores to reach exactly 500 items...`);
    for (const s of stores) {
      if (harvestedProducts.length >= 500) break;
      try {
        const res = await fetch(`${s.url}/products.json?limit=250`);
        const data = await res.json();
        const prods = data.products || [];
        for (const p of prods) {
          if (!p.images || p.images.length === 0) continue;
          const mainImage = p.images[0].src;
          if (!mainImage || seenImages.has(mainImage)) continue;
          const title = p.title.trim();
          const lowerTitle = title.toLowerCase();

          if (
            lowerTitle.includes('insurance') ||
            lowerTitle.includes('warranty') ||
            lowerTitle.includes('worry-free') ||
            lowerTitle.includes('protection') ||
            lowerTitle.includes('gift card') ||
            lowerTitle.includes('membership')
          ) {
            continue;
          }

          if (seenTitles.has(lowerTitle)) continue;
          const variant = p.variants?.[0] || {};
          let price = parseFloat(variant.price);
          if (isNaN(price) || price < 12) continue;
          let comparePrice = parseFloat(variant.compare_at_price) || Math.round(price * 1.25);

          let slug = slugify(p.handle || title);
          if (seenSlugs.has(slug)) slug = `${slug}-${Math.floor(Math.random() * 900 + 100)}`;
          const categorySlug = detectCategory(title, p.product_type, p.tags);
          const sku = `AMZ-${s.brand.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90000 + 10000)}`;

          seenImages.add(mainImage);
          seenSlugs.add(slug);
          seenTitles.add(lowerTitle);

          harvestedProducts.push({
            name: title,
            slug,
            sku,
            categorySlug,
            price: Math.round(price),
            comparePrice: Math.round(comparePrice),
            stock: Math.floor(Math.random() * 40 + 20),
            weight: variant.weight ? `${variant.weight} ${variant.weight_unit || 'kg'}` : '15 kg',
            isFeatured: harvestedProducts.length % 8 === 0,
            isHot: harvestedProducts.length % 5 === 0,
            isActive: true,
            shortDesc: `Brand: ${s.brand}\nAuthentic Amazon Best-Seller Edition\nCategory: ${categorySlug.replace('-', ' ').toUpperCase()}\nWarranty: 1-Year Comprehensive Manufacturer Warranty`,
            description: p.body_html && p.body_html.length > 50 
              ? `<h2>Amazon Best-Seller: ${title}</h2>\n${cleanHtml(p.body_html)}` 
              : `<h2>Amazon Best-Seller: ${title}</h2><p>Official ${s.brand} commercial equipment.</p>`,
            images: p.images.slice(0, 2).map((img, i) => ({
              url: img.src,
              alt: `${title} Official Product Shot ${i + 1}`
            }))
          });
          if (harvestedProducts.length >= 500) break;
        }
      } catch (err) {}
    }
  }

  console.log(`\n================ FINAL HARVEST SUMMARY ================`);
  console.log(`Total Products Harvested: ${harvestedProducts.length}`);
  console.log(`Unique Image URLs:        ${seenImages.size}`);
  console.log(`Duplicate Images:         0 (Guaranteed Set Unique)`);

  const catBreakdown = {};
  harvestedProducts.forEach(p => {
    catBreakdown[p.categorySlug] = (catBreakdown[p.categorySlug] || 0) + 1;
  });
  console.log('Category Distribution:', JSON.stringify(catBreakdown, null, 2));

  // Save to JSON
  const outPath = path.join(__dirname, 'data', 'amazon-500-products.json');
  fs.writeFileSync(outPath, JSON.stringify(harvestedProducts, null, 2), 'utf8');
  console.log(`\nSaved clean dataset to ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

harvest().catch(console.error);
