const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PRODUCTS_MAP = [
  // 1. Smart Gadgets & Wearables (10)
  { slug: "pgx-ultra-titanium-smartwatch", search: "Apple Watch Ultra 2 titanium white background amazon" },
  { slug: "pgx-halo-biometric-smart-ring", search: "Oura Ring Gen 3 Horizon smart ring white background amazon" },
  { slug: "pgx-airsense-ai-voice-pin", search: "Humane AI pin voice wearable white background amazon" },
  { slug: "pgx-apex-fitness-recovery-band", search: "WHOOP 4.0 fitness recovery band white background amazon" },
  { slug: "pgx-vision-ar-smart-glasses", search: "Ray-Ban Meta smart glasses white background amazon" },
  { slug: "pgx-somna-deep-sleep-headband", search: "Muse S EEG sleep headband white background amazon" },
  { slug: "pgx-hydrosmart-uv-bottle", search: "LARQ self cleaning water bottle white background amazon" },
  { slug: "pgx-bioscale-pro-smart-scale", search: "Withings Body Smart scale white background amazon" },
  { slug: "pgx-tagpro-gps-tracker-4pack", search: "Apple AirTag 4 pack white background amazon" },
  { slug: "pgx-lumina-smart-light-bar", search: "BenQ ScreenBar Halo monitor light bar white background amazon" },

  // 2. Desk Tech & Peripherals (10)
  { slug: "pgx-cyberdeck-mechanical-keyboard", search: "Keychron Q1 Pro custom mechanical keyboard white background amazon" },
  { slug: "pgx-ergovertical-precision-mouse", search: "Logitech MX Master 3S wireless mouse white background amazon" },
  { slug: "pgx-streampad-15-lcd-console", search: "Elgato Stream Deck MK2 white background amazon" },
  { slug: "pgx-horizon-16-portable-monitor", search: "ASUS ZenScreen 16 inch portable monitor white background amazon" },
  { slug: "pgx-proart-drawing-tablet", search: "Wacom Intuos Pro drawing tablet white background amazon" },
  { slug: "pgx-solidmetal-monitor-arm", search: "Ergotron LX heavy duty monitor arm white background amazon" },
  { slug: "pgx-magdesk-felt-leather-mat", search: "Orbitkey leather desk mat white background amazon" },
  { slug: "pgx-glidetrack-touchpad-pro", search: "Apple Magic Trackpad wireless white background amazon" },
  { slug: "pgx-silentdock-laptop-stand-hub", search: "Twelve South Curve laptop stand white background amazon" },
  { slug: "pgx-keymaster-pbt-keycaps", search: "Custom PBT keycaps set mechanical keyboard white background amazon" },

  // 3. Audio & Streaming Gear (10)
  { slug: "pgx-studioone-usb-microphone", search: "Shure MV7 USB microphone podcast white background amazon" },
  { slug: "pgx-anc-pro-wireless-earbuds", search: "Sony WF-1000XM5 wireless earbuds white background amazon" },
  { slug: "pgx-hifi-monitor-headphones", search: "Sennheiser HD 660S2 over-ear headphones white background amazon" },
  { slug: "pgx-soundstage-usb-dac", search: "Fosi Audio K5 Pro Gaming DAC headphone amplifier white background amazon" },
  { slug: "pgx-airvoice-wireless-lav-mic", search: "Rode Wireless PRO lavalier microphone dual channel white background amazon" },
  { slug: "pgx-acousticpro-sound-panels", search: "Acoustic foam panels 12 pack studio white background amazon" },
  { slug: "pgx-desktop-studio-monitors", search: "Audioengine A2+ wireless desktop speakers white background amazon" },
  { slug: "pgx-boommaster-low-profile-arm", search: "Elgato Wave low profile mic arm white background amazon" },
  { slug: "pgx-bonewave-openear-headphones", search: "Shokz OpenRun Pro bone conduction headphones white background amazon" },
  { slug: "pgx-soundshield-pop-filter", search: "Studio microphone pop filter dual layer white background amazon" },

  // 4. Power & Fast Storage (10)
  { slug: "pgx-turbodrive-2tb-nvme-ssd", search: "SanDisk Extreme PRO 2TB portable SSD white background amazon" },
  { slug: "pgx-ganpro-140w-fast-charger", search: "Anker Prime 140W GaN fast charger white background amazon" },
  { slug: "pgx-magstand-wireless-charging-dock", search: "Belkin 3-in-1 MagSafe wireless charging stand white background amazon" },
  { slug: "pgx-powervault-laptop-power-bank", search: "Anker 737 power bank 24000mAh 140W white background amazon" },
  { slug: "pgx-thunderdock-thunderbolt4-hub", search: "CalDigit TS4 Thunderbolt 4 dock 18 port white background amazon" },
  { slug: "pgx-ultraspeed-512gb-sd-card", search: "SanDisk 512GB Extreme PRO UHS-II SDXC card white background amazon" },
  { slug: "pgx-armorlink-usb4-cable-2pack", search: "Thunderbolt 4 USB4 cable 40Gbps braided 2 pack white background amazon" },
  { slug: "pgx-magcord-cable-organizer", search: "Anker magnetic cable holder organizer desk white background amazon" },
  { slug: "pgx-smartstrip-surge-protector", search: "APC power strip surge protector 6 outlet white background amazon" },
  { slug: "pgx-solarfold-30w-solar-charger", search: "Anker 24W portable solar charger USB white background amazon" },

  // 5. Cameras, Drones & Optics (10)
  { slug: "pgx-aerox-4k-gimbal-drone", search: "DJI Mini 4 Pro drone with RC 2 white background amazon" },
  { slug: "pgx-streamcam-4k-ai-webcam", search: "OBSBOT Tiny 2 4K PTZ webcam AI tracking white background amazon" },
  { slug: "pgx-actionpro-5k-action-camera", search: "GoPro HERO 12 Black action camera waterproof white background amazon" },
  { slug: "pgx-smoothgimbal-phone-stabilizer", search: "DJI Osmo Mobile 6 smartphone gimbal stabilizer white background amazon" },
  { slug: "pgx-studioglow-led-ring-light", search: "Neewer 18 inch LED ring light kit stand white background amazon" },
  { slug: "pgx-cinemaoptic-anamorphic-lens", search: "Moment anamorphic lens smartphone cinema white background amazon" },
  { slug: "pgx-promptview-teleprompter", search: "Glide Gear iPad teleprompter kit video white background amazon" },
  { slug: "pgx-chromapop-green-screen", search: "Elgato green screen collapsible pull-up white background amazon" },
  { slug: "pgx-lightpanel-rgb-key-light", search: "Elgato Key Light Air professional LED panel white background amazon" },
  { slug: "pgx-lensarmor-camera-cleaning-kit", search: "Professional DSLR camera lens cleaning kit white background amazon" },

  // 6. AI Tools & Automation (10)
  { slug: "ai-business-chatbot-pro", search: "AI software developer box product white background amazon" },
  { slug: "autonomous-agent-workflow-engine", search: "software license product key card white background amazon" },
  { slug: "voice-ai-studio-suite", search: "audio editing software box packaging white background amazon" },
  { slug: "langchain-rag-knowledge-builder", search: "LangChain in Action book oreilly white background amazon" },
  { slug: "midjourney-master-prompt-system", search: "Midjourney prompt handbook book white background amazon" },
  { slug: "whisper-realtime-transcriber-api", search: "Dragon NaturallySpeaking speech software box white background amazon" },
  { slug: "ai-seo-copywriting-engine", search: "copywriting marketing book white background amazon" },
  { slug: "vision-ai-object-detection-kit", search: "Learning OpenCV computer vision oreilly book white background amazon" },
  { slug: "ai-support-ticket-automator", search: "helpdesk customer service software box white background amazon" },
  { slug: "local-llm-desktop-assistant", search: "Intel Neural Compute Stick AI usb white background amazon" },

  // 7. Website Templates (10)
  { slug: "e-commerce-website-kit", search: "Shopify e-commerce website development book white background amazon" },
  { slug: "saas-landing-page-system", search: "Responsive Web Design book ethan marcotte white background amazon" },
  { slug: "portfolio-agency-template", search: "Graphic design portfolio manual book white background amazon" },
  { slug: "fintech-crypto-dashboard-theme", search: "Ledger Nano X crypto hardware wallet white background amazon" },
  { slug: "directory-job-board-platform", search: "web database applications book oreilly white background amazon" },
  { slug: "minimalist-blog-newsletter-starter", search: "WordPress for Beginners guidebook white background amazon" },
  { slug: "real-estate-property-portal", search: "Real estate marketing playbook book white background amazon" },
  { slug: "developer-docs-knowledgebase-theme", search: "Technical Writing One Year to a Successful Career book white background amazon" },
  { slug: "event-summit-conference-landing", search: "Event planning business book guide white background amazon" },
  { slug: "multipurpose-tailwind-admin-panel", search: "Tailwind CSS web development book white background amazon" },

  // 8. Software & Licenses (10)
  { slug: "cloudsync-saas-client", search: "Microsoft Windows 11 Pro USB packaging box white background amazon" },
  { slug: "devflow-pro-ide-extension", search: "Visual Studio Code handbook book white background amazon" },
  { slug: "api-traffic-shaper-gateway", search: "Designing Data-Intensive Applications book oreilly white background amazon" },
  { slug: "gitcommit-ai-terminal-assistant", search: "Pro Git version control book oreilly white background amazon" },
  { slug: "screencapture-video-annotation-studio", search: "Snagit Camtasia screen capture software box white background amazon" },
  { slug: "markdown-vault-knowledge-desktop", search: "Building a Second Brain tiago forte book white background amazon" },
  { slug: "database-schema-visualizer-pro", search: "Learning SQL Alan Beaulieu oreilly book white background amazon" },
  { slug: "docker-container-monitor-gui", search: "Docker Deep Dive Nigel Poulton book white background amazon" },
  { slug: "rest-graphql-api-client-cli", search: "Learning GraphQL oreilly book eve porcello white background amazon" },
  { slug: "network-packet-security-inspector", search: "Practical Packet Analysis Chris Sanders book white background amazon" },

  // 9. Digital Marketing (10)
  { slug: "marketing-template-bundle", search: "Marketing Management Philip Kotler book white background amazon" },
  { slug: "seo-growth-blueprint-2026", search: "SEO 2024 search engine optimization book white background amazon" },
  { slug: "viral-ad-hooks-scripts", search: "TikTok marketing secrets business book white background amazon" },
  { slug: "email-newsletter-launch-kit", search: "Email Marketing Rules Chad S. White book white background amazon" },
  { slug: "sales-funnel-high-converting-pack", search: "DotCom Secrets Russell Brunson book white background amazon" },
  { slug: "google-ads-roi-campaign-matrix", search: "Ultimate Guide to Google Ads book Perry Marshall white background amazon" },
  { slug: "b2b-cold-outreach-email-vault", search: "Fanatical Prospecting Jeb Blount book white background amazon" },
  { slug: "content-repurposing-playbook", search: "Content Strategy for the Web Kristina Halvorson book white background amazon" },
  { slug: "influencer-partnership-crm-system", search: "Influencer marketing handbook book white background amazon" },
  { slug: "omnichannel-social-automation-scripts", search: "Digital Marketing Strategy Simon Kingsnorth book white background amazon" },

  // 10. Online Courses & E-books (10)
  { slug: "digital-marketing-masterclass", search: "Digital Marketing All-In-One For Dummies book white background amazon" },
  { slug: "full-stack-nextjs-bootcamp", search: "Learning React Modern Patterns Alex Banks oreilly book white background amazon" },
  { slug: "ai-engineering-handbook", search: "Designing Machine Learning Systems Chip Huyen oreilly book white background amazon" },
  { slug: "microservices-go-docker-mastery", search: "Building Microservices Sam Newman oreilly book white background amazon" },
  { slug: "advanced-css-tailwind-animations", search: "CSS The Definitive Guide Eric Meyer oreilly book white background amazon" },
  { slug: "modern-typescript-patterns-handbook", search: "Effective TypeScript Dan Vanderkam oreilly book white background amazon" },
  { slug: "the-100k-solopreneur-playbook", search: "The Lean Startup Eric Ries book white background amazon" },
  { slug: "system-design-interview-bible", search: "System Design Interview Alex Xu book white background amazon" },
  { slug: "react-native-mobile-architecture", search: "React Native in Action Nader Dabit book white background amazon" },
  { slug: "cyber-security-defensive-ops-course", search: "The Web Application Hacker's Handbook Dafydd Stuttard book white background amazon" },
];

async function searchBingImage(query) {
  try {
    const res = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();
    const murls = [...html.matchAll(/murl&quot;:&quot;(https?:[^&"]+)&quot;/g)].map(m => m[1]);
    
    // First priority: Amazon CDN image
    const amazonUrl = murls.find(u => u.includes('media-amazon.com'));
    if (amazonUrl) return amazonUrl;

    // Second priority: High-res retail/product photo
    const validUrl = murls.find(u => u.startsWith('http') && (u.includes('.jpg') || u.includes('.jpeg') || u.includes('.png') || u.includes('.webp')));
    return validUrl || murls[0] || null;
  } catch (err) {
    return null;
  }
}

async function downloadImage(url, destPath) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 5000) throw new Error(`Too small (${buf.byteLength} bytes)`);
    fs.writeFileSync(destPath, Buffer.from(buf));
    return buf.byteLength;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function main() {
  console.log(`🚀 Starting real Amazon product photography scraper for 100 products...`);
  const destDir = path.join(__dirname, '../../frontend/public/products');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  let successCount = 0;
  let skippedCount = 0;
  let failCount = 0;

  for (let i = 0; i < PRODUCTS_MAP.length; i++) {
    const item = PRODUCTS_MAP[i];
    const fileName = `${item.slug}.jpg`;
    const destPath = path.join(destDir, fileName);

    process.stdout.write(`[${i + 1}/${PRODUCTS_MAP.length}] ${item.slug}... `);

    // Skip if already downloaded and valid
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 5000) {
      process.stdout.write(`⚡ Already downloaded (${Math.round(fs.statSync(destPath).size / 1024)} KB)\n`);
      successCount++;
      continue;
    }

    let downloaded = false;
    const imgUrl = await searchBingImage(item.search);
    if (imgUrl) {
      try {
        const size = await downloadImage(imgUrl, destPath);
        process.stdout.write(`✅ Downloaded (${Math.round(size / 1024)} KB) from ${imgUrl.includes('amazon') ? 'Amazon CDN' : 'Web'}\n`);
        downloaded = true;
        successCount++;
      } catch (err) {
        process.stdout.write(`⚠️ Download failed: ${err.message}\n`);
      }
    } else {
      process.stdout.write(`❌ No image URL found\n`);
    }

    if (!downloaded) {
      failCount++;
    }

    // Small delay to be polite to the search engine
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\n📦 Scraping complete! ${successCount} verified/downloaded, ${failCount} failed.`);
  console.log(`🔄 Updating PostgreSQL product_images table to use real Amazon .jpg files...`);

  // Update product_images table for all products whose .jpg exists
  let updatedCount = 0;
  for (const item of PRODUCTS_MAP) {
    const fileName = `${item.slug}.jpg`;
    const destPath = path.join(destDir, fileName);
    if (fs.existsSync(destPath)) {
      const imgUrl = `/products/${fileName}`;
      const res = await client.query(`
        UPDATE product_images 
        SET url = $1, alt = $2 
        WHERE "productId" IN (SELECT id FROM products WHERE slug = $3)
      `, [imgUrl, `${item.slug} Amazon White Background Studio Photography`, item.slug]);
      if (res.rowCount > 0) updatedCount++;
    }
  }

  console.log(`🎉 Database product images successfully updated (${updatedCount} products) with real Amazon photography!`);
  client.release();
  await pool.end();
}

main().catch(console.error);
