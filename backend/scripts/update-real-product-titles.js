const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const REAL_TITLES_MAP = {
  // 1. Smart Gadgets & Wearables (10)
  "pgx-ultra-titanium-smartwatch": "Apple Watch Ultra 2 [GPS + Cellular 49mm] Smartwatch with Rugged Titanium Case",
  "pgx-halo-biometric-smart-ring": "Oura Ring Gen 3 Horizon - Smart Ring Health, Sleep & Activity Tracker",
  "pgx-airsense-ai-voice-pin": "Humane AI Pin - Wireless Standalone Wearable Voice Assistant",
  "pgx-apex-fitness-recovery-band": "WHOOP 4.0 Activity & Health Tracker with 12 Month Membership",
  "pgx-vision-ar-smart-glasses": "Ray-Ban Meta - Wayfarer Smart Glasses with Audio & Camera",
  "pgx-somna-deep-sleep-headband": "Muse S (Gen 2) Brain Sensing EEG Sleep Tracker Headband",
  "pgx-hydrosmart-uv-bottle": "LARQ Bottle PureVis - Self-Cleaning UV Water Bottle (24 oz)",
  "pgx-bioscale-pro-smart-scale": "Withings Body Smart - Wi-Fi Body Composition Smart Scale",
  "pgx-tagpro-gps-tracker-4pack": "Apple AirTag (4-Pack) Bluetooth Precision Finding Tracker",
  "pgx-lumina-smart-light-bar": "BenQ ScreenBar Halo LED Monitor Light Bar with Wireless Controller",

  // 2. Desk Tech & Peripherals (10)
  "pgx-cyberdeck-mechanical-keyboard": "Keychron Q1 Pro QMK/VIA Wireless Custom Mechanical Keyboard",
  "pgx-ergovertical-precision-mouse": "Logitech MX Master 3S Wireless Performance Mouse",
  "pgx-streampad-15-lcd-console": "Elgato Stream Deck MK.2 - 15 Customizable LCD Macro Keys",
  "pgx-horizon-16-portable-monitor": "ASUS ZenScreen 15.6” 1080P Portable USB-C Monitor (MB16AHG)",
  "pgx-proart-drawing-tablet": "Wacom Intuos Pro Creative Pen Tablet (Medium)",
  "pgx-solidmetal-monitor-arm": "Ergotron LX Heavy Duty Desk Mount LCD Monitor Arm",
  "pgx-magdesk-felt-leather-mat": "Orbitkey Desk Mat with Magnetic Cable Holder (Large, Black)",
  "pgx-glidetrack-touchpad-pro": "Apple Magic Trackpad - Wireless, Rechargeable Multi-Touch",
  "pgx-silentdock-laptop-stand-hub": "Twelve South Curve Stand for MacBooks and Laptops",
  "pgx-keymaster-pbt-keycaps": "SteelSeries PrismCaps - Double Shot PBT Keycaps Set",

  // 3. Audio & Streaming Gear (10)
  "pgx-studioone-usb-microphone": "Shure MV7 USB Podcast Microphone with XLR Hybrid Output",
  "pgx-anc-pro-wireless-earbuds": "Sony WF-1000XM5 Industry Leading Noise Canceling Wireless Earbuds",
  "pgx-hifi-monitor-headphones": "Sennheiser HD 660S2 Open-Back Audiophile Dynamic Headphones",
  "pgx-soundstage-usb-dac": "Fosi Audio K5 Pro Gaming DAC & Headphone Amplifier 24-Bit/96kHz",
  "pgx-airvoice-wireless-lav-mic": "RØDE Wireless PRO Dual-Channel Wireless Microphone System",
  "pgx-acousticpro-sound-panels": "Auralex Acoustics Studiofoam Acoustic Panels (12-Pack, Charcoal)",
  "pgx-desktop-studio-monitors": "Audioengine A2+ Wireless Powered Desktop Studio Speakers (Pair)",
  "pgx-boommaster-low-profile-arm": "Elgato Wave Mic Arm LP - Premium Low Profile Microphone Arm",
  "pgx-bonewave-openear-headphones": "Shokz OpenRun Pro Premium Bone Conduction Open-Ear Headphones",
  "pgx-soundshield-pop-filter": "Stedman Corporation Proscreen XL Professional Studio Pop Filter",

  // 4. Power & Fast Storage (10)
  "pgx-turbodrive-2tb-nvme-ssd": "SanDisk 2TB Extreme PRO Portable SSD - Up to 2000MB/s USB 3.2",
  "pgx-ganpro-140w-fast-charger": "Anker Prime 140W GaN Wall Charger (3-Port Multi-Device Fast Charger)",
  "pgx-magstand-wireless-charging-dock": "Belkin BoostCharge Pro 3-in-1 Wireless Charging Stand with MagSafe 15W",
  "pgx-powervault-laptop-power-bank": "Anker 737 Power Bank (PowerCore 24K) 24,000mAh 140W Portable Charger",
  "pgx-thunderdock-thunderbolt4-hub": "CalDigit TS4 Thunderbolt 4 Dock - 18 Ports 98W Charging 8K Display",
  "pgx-ultraspeed-512gb-sd-card": "SanDisk 512GB Extreme PRO SDXC UHS-II Memory Card (Up to 300MB/s)",
  "pgx-armorlink-usb4-cable-2pack": "Cable Matters Intel Certified 40Gbps Thunderbolt 4 Cable (2-Pack, 2m)",
  "pgx-magcord-cable-organizer": "Anker Magnetic Cable Holder - Desktop Cord Management Organizer",
  "pgx-smartstrip-surge-protector": "APC SurgeArrest Essential 6-Outlet Surge Protector Power Strip",
  "pgx-solarfold-30w-solar-charger": "Anker Solix 30W Portable Solar Charger with Dual USB Power Ports",

  // 5. Cameras, Drones & Optics (10)
  "pgx-aerox-4k-gimbal-drone": "DJI Mini 4 Pro Drone with RC 2 Smart Controller & 4K HDR Video",
  "pgx-streamcam-4k-ai-webcam": "OBSBOT Tiny 2 AI-Powered 4K PTZ Webcam with Auto-Tracking",
  "pgx-actionpro-5k-action-camera": "GoPro HERO12 Black - Waterproof Action Camera with 5.3K60 Video",
  "pgx-smoothgimbal-phone-stabilizer": "DJI Osmo Mobile 6 Smartphone Gimbal Stabilizer (3-Axis Handheld)",
  "pgx-studioglow-led-ring-light": "Neewer 18-inch Bi-Color LED Ring Light Kit with 75\" Light Stand",
  "pgx-cinemaoptic-anamorphic-lens": "Moment Anamorphic 1.33x Mobile Lens for iPhone and Android",
  "pgx-promptview-teleprompter": "Glide Gear TMP 100 Adjustable iPad/Tablet Teleprompter System",
  "pgx-chromapop-green-screen": "Elgato Green Screen - Collapsible Wrinkle-Resistant Chroma Key Panel",
  "pgx-lightpanel-rgb-key-light": "Elgato Key Light Air - 1400 Lumens Professional Studio LED Panel",
  "pgx-lensarmor-camera-cleaning-kit": "Altura Photo Professional Camera Cleaning Kit for DSLR & Mirrorless",

  // 6. AI Tools & Automation (10)
  "ai-business-chatbot-pro": "AI Business Chatbot Pro - Multi-Channel Conversational Agent",
  "autonomous-agent-workflow-engine": "Autonomous Agent Workflow Engine - Multi-LLM Orchestrator",
  "voice-ai-studio-suite": "Voice AI Studio Suite - Ultra-Realistic Neural Speech Synthesis",
  "langchain-rag-knowledge-builder": "LangChain RAG Knowledge Base Builder - Vector Search & Indexing",
  "midjourney-master-prompt-system": "Midjourney Master Prompt System - Commercial Visual Generation Kit",
  "whisper-realtime-transcriber-api": "Whisper Real-Time Audio Transcriber API - Multi-Language Engine",
  "ai-seo-copywriting-engine": "AI Copywriting & Landing Page Engine - High-Converting Sales Copy",
  "vision-ai-object-detection-kit": "Vision Object Detection API Kit - Real-Time YOLOv8 Pipeline",
  "ai-support-ticket-automator": "AI Support Ticket Auto-Responder - Zendesk & Freshdesk Integration",
  "local-llm-desktop-assistant": "Local LLM Desktop Assistant - Offline Private AI Terminal (Electron)",

  // 7. Website Templates (10)
  "e-commerce-website-kit": "Next.js 15 Full-Stack E-Commerce Website Kit (Stripe, Tailwind, PostgreSQL)",
  "saas-landing-page-system": "SaaS Modern Landing Page System - High-Converting Framer Motion Components",
  "portfolio-agency-template": "Creative Agency & Designer Portfolio Template (Dark Mode, 3D Canvas)",
  "fintech-crypto-dashboard-theme": "Fintech & Web3 Analytics Dashboard Theme (Charts, Real-Time WebSockets)",
  "directory-job-board-platform": "Directory & Remote Job Board Platform Kit (Algolia Search, Paid Listings)",
  "minimalist-blog-newsletter-starter": "Minimalist Developer Blog & Substack-Style Newsletter Starter (MDX)",
  "real-estate-property-portal": "Real Estate & Modern Property Showcase Theme (Mapbox Integration)",
  "developer-docs-knowledgebase-theme": "Developer Documentation & API Reference Theme (Mintlify/Nextra Style)",
  "event-summit-conference-landing": "Global Tech Summit & Conference Landing Theme (Schedule, Speaker Bios)",
  "multipurpose-tailwind-admin-panel": "Enterprise Multipurpose Tailwind Admin Panel (50+ Custom Widgets)",

  // 8. Software & Licenses (10)
  "cloudsync-saas-client": "CloudSync Enterprise SaaS Desktop Client (Encrypted Multi-Cloud Vault)",
  "devflow-pro-ide-extension": "DevFlow Pro Developer IDE Extension (AI Code Review, Git Graph)",
  "api-traffic-shaper-gateway": "Ultra-Fast API Gateway & Traffic Shaper Engine (Reverse Proxy, Rate Limiter)",
  "gitcommit-ai-terminal-assistant": "GitCommit AI Terminal Assistant (Automated Conventional Commit Generator)",
  "screencapture-video-annotation-studio": "ScreenCapture & Video Studio Desktop (4K60 Recording, Instant Annotations)",
  "markdown-vault-knowledge-desktop": "Markdown Knowledge Vault Desktop (Bi-Directional Linking, Local-First)",
  "database-schema-visualizer-pro": "Database Schema Visualizer Pro (Interactive ERD Generator for SQL/Prisma)",
  "docker-container-monitor-gui": "Docker & Kubernetes Container Monitor GUI (Lightweight System Metrics)",
  "rest-graphql-api-client-cli": "REST & GraphQL High-Performance API Testing CLI (Automated Test Suites)",
  "network-packet-security-inspector": "Network Packet Security Inspector & Traffic Sniffer (Deep Packet Inspection)",

  // 9. Digital Marketing (10)
  "marketing-template-bundle": "Digital Marketing Growth Bundle (Canva, Figma, Notion & Ads Templates)",
  "seo-growth-blueprint-2026": "SEO Growth Blueprint 2026 - Complete Organic Search Domination Playbook",
  "viral-ad-hooks-scripts": "Viral Ad Hooks & TikTok Scripts Pack (500+ Tested E-Commerce Formats)",
  "email-newsletter-launch-kit": "Email Newsletter Revenue Launch Kit (Klaviyo & Mailchimp Automation Flows)",
  "sales-funnel-high-converting-pack": "High-Converting Sales Funnel Architecture Pack (Lead Magnets, VSL Frameworks)",
  "google-ads-roi-campaign-matrix": "Google Ads Performance Max & Search ROI Campaign Matrix (Spreadsheets)",
  "b2b-cold-outreach-email-vault": "B2B Cold Outreach Email Master Vault (100+ Enterprise Closed Deals)",
  "content-repurposing-playbook": "Omnichannel Content Repurposing Playbook (Turn 1 Long Video into 20 Assets)",
  "influencer-partnership-crm-system": "Influencer & Creator Partnership CRM System (Outreach, Contracts, ROI Tracker)",
  "omnichannel-social-automation-scripts": "Social Media Automation Scripts & Webhook Workflows (Make & Zapier)",

  // 10. Online Courses & E-books (10)
  "digital-marketing-masterclass": "Digital Marketing Masterclass 2026 - Complete Full-Funnel Video Course",
  "full-stack-nextjs-bootcamp": "Full-Stack Next.js 15 & Server Actions Architecture Video Bootcamp",
  "ai-engineering-handbook": "The AI Engineering & Prompt Systems Handbook (E-Book + Code Repository)",
  "microservices-go-docker-mastery": "Microservices with Go & Docker Mastery - Production Distributed Systems",
  "advanced-css-tailwind-animations": "Advanced CSS, Tailwind CSS & Framer Motion Animations Masterclass",
  "modern-typescript-patterns-handbook": "Modern TypeScript Enterprise Patterns & Architecture Handbook",
  "the-100k-solopreneur-playbook": "The $100k Developer Solopreneur Playbook (Idea to Profitable SaaS)",
  "system-design-interview-bible": "System Design Interview Bible - High-Scale Architecture Real-World Case Studies",
  "react-native-mobile-architecture": "React Native & Expo Production Mobile Architecture Complete Guide",
  "cyber-security-defensive-ops-course": "Cyber Security & Defensive Web Application Penetration Testing Course"
};

async function main() {
  console.log('🔄 Connecting to PostgreSQL database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  let updatedCount = 0;
  for (const [slug, realTitle] of Object.entries(REAL_TITLES_MAP)) {
    const res = await client.query(`
      UPDATE products 
      SET name = $1, "metaTitle" = $1 
      WHERE slug = $2
    `, [realTitle, slug]);
    if (res.rowCount > 0) {
      updatedCount++;
    }
  }

  console.log(`✅ Successfully updated ${updatedCount} products with genuine, professional real brand titles!`);

  // Verify any leftover products with PGX
  const checkRes = await client.query(`
    SELECT slug, name FROM products WHERE name ILIKE '%pgx%'
  `);
  console.log(`Remaining products with PGX in title: ${checkRes.rows.length}`);
  if (checkRes.rows.length > 0) {
    checkRes.rows.forEach(r => console.log('Leftover:', r.slug, r.name));
  }

  client.release();
  await pool.end();
}

main().catch(console.error);
