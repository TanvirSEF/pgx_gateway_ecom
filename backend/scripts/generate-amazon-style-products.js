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

const svgDir = path.join(__dirname, '../../frontend/public/products');
if (!fs.existsSync(svgDir)) {
  fs.mkdirSync(svgDir, { recursive: true });
}

// 10 Categories (5 Gadgets + 5 Digital)
const CATEGORIES = [
  { name: 'Smart Gadgets & Wearables', slug: 'smart-gadgets-wearables', description: 'Next-gen smartwatches, smart rings, and connected biometric wearables.' },
  { name: 'Desk Tech & Peripherals', slug: 'desk-tech-peripherals', description: 'Custom mechanical keyboards, vertical ergonomic mice, and 4K portable displays.' },
  { name: 'Audio & Streaming Gear', slug: 'audio-streaming-gear', description: 'Active noise-canceling earbuds, studio podcast microphones, and audio DACs.' },
  { name: 'Power & Fast Storage', slug: 'power-storage-accessories', description: 'High-speed NVMe portable SSDs, GaN multi-port chargers, and Thunderbolt 4 docks.' },
  { name: 'Cameras, Drones & Optics', slug: 'cameras-drones-creator', description: '4K AI tracking webcams, foldable gimbal drones, and action cameras.' },
  { name: 'AI Tools & Automation', slug: 'ai-tools-automation', description: 'Autonomous agents, custom chatbots, and neural voice synthesis suites.' },
  { name: 'Software & Licenses', slug: 'software-licenses', description: 'Developer productivity extensions, CLI gateways, and SaaS desktop clients.' },
  { name: 'Website Templates', slug: 'website-templates', description: 'High-performance Next.js 15 starter kits, SaaS landing pages, and web apps.' },
  { name: 'Digital Marketing', slug: 'digital-marketing', description: 'Viral video script packs, SEO growth blueprints, and ad campaign frameworks.' },
  { name: 'Online Courses & E-books', slug: 'online-courses-ebooks', description: 'Full-stack software architecture bootcamps and AI engineering handbooks.' },
];

// Helper to escape XML
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Generate Amazon-style clean white-background SVG
function renderAmazonWhiteSvg(product) {
  const name = escapeXml(product.name);
  const type = product.visualType || 'gadget';

  let productIllustration = '';

  if (type === 'smartwatch') {
    productIllustration = `
      <!-- Smartwatch (Apple Watch Ultra Style) -->
      <g transform="translate(400, 360)">
        <!-- Band Top -->
        <rect x="-42" y="-280" width="84" height="150" rx="20" fill="#f97316" />
        <line x1="-30" y1="-260" x2="-30" y2="-150" stroke="#ea580c" stroke-width="3" stroke-dasharray="6,4" />
        <line x1="30" y1="-260" x2="30" y2="-150" stroke="#ea580c" stroke-width="3" stroke-dasharray="6,4" />

        <!-- Band Bottom -->
        <rect x="-42" y="130" width="84" height="150" rx="20" fill="#f97316" />
        <line x1="-30" y1="150" x2="-30" y2="260" stroke="#ea580c" stroke-width="3" stroke-dasharray="6,4" />
        <line x1="30" y1="150" x2="30" y2="260" stroke="#ea580c" stroke-width="3" stroke-dasharray="6,4" />

        <!-- Titanium Case -->
        <rect x="-95" y="-120" width="190" height="240" rx="46" fill="#cbd5e1" stroke="#94a3b8" stroke-width="4" />
        <rect x="-88" y="-113" width="176" height="226" rx="42" fill="#0f172a" />

        <!-- Digital Crown (Right) -->
        <rect x="94" y="-60" width="16" height="48" rx="7" fill="#f97316" stroke="#94a3b8" stroke-width="2" />
        <rect x="94" y="10" width="10" height="34" rx="4" fill="#94a3b8" />

        <!-- Action Button (Left) -->
        <rect x="-106" y="-40" width="12" height="50" rx="5" fill="#f97316" />

        <!-- Screen Content (OLED) -->
        <!-- Activity Rings -->
        <circle cx="0" cy="-10" r="64" fill="none" stroke="#334155" stroke-width="10" />
        <circle cx="0" cy="-10" r="64" fill="none" stroke="#ef4444" stroke-width="10" stroke-dasharray="320, 400" stroke-linecap="round" />
        <circle cx="0" cy="-10" r="50" fill="none" stroke="#22c55e" stroke-width="10" stroke-dasharray="240, 314" stroke-linecap="round" />
        <circle cx="0" cy="-10" r="36" fill="none" stroke="#06b6d4" stroke-width="10" stroke-dasharray="160, 226" stroke-linecap="round" />

        <!-- Digital Time -->
        <text x="0" y="-4" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">10:09</text>
        <text x="0" y="68" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#38bdf8" text-anchor="middle">♥ 74 BPM • 84°</text>
        <rect x="-30" y="80" width="60" height="6" rx="3" fill="#22c55e" />
      </g>
    `;
  } else if (type === 'keyboard') {
    productIllustration = `
      <!-- Mechanical Keyboard (75% Aluminum) -->
      <g transform="translate(400, 370)">
        <!-- Chassis -->
        <rect x="-260" y="-110" width="520" height="220" rx="22" fill="#1e293b" stroke="#334155" stroke-width="5" />
        <rect x="-248" y="-98" width="496" height="196" rx="14" fill="#0f172a" />

        <!-- Key Matrix Grid -->
        ${Array.from({ length: 5 }).map((_, r) => {
          return Array.from({ length: 14 }).map((_, c) => {
            const isAccent = (r === 0 && c === 13) || (r === 4 && (c === 0 || c === 13));
            const isSpace = (r === 4 && c >= 4 && c <= 8);
            if (r === 4 && c > 4 && c <= 8) return ''; // skip extra space keys
            const kw = isSpace ? 160 : 30;
            const kx = -240 + c * 35;
            const ky = -90 + r * 38;
            const fill = isAccent ? '#7c3aed' : (r === 0 ? '#334155' : '#1e293b');
            return `<rect x="${kx}" y="${ky}" width="${kw}" height="32" rx="6" fill="${fill}" stroke="#475569" stroke-width="1.5" />`;
          }).join('');
        }).join('')}

        <!-- Rotary Knob -->
        <circle cx="225" cy="-75" r="14" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
        <circle cx="225" cy="-75" r="6" fill="#7c3aed" />

        <!-- Subtle RGB Underglow Glow -->
        <rect x="-240" y="98" width="480" height="4" rx="2" fill="#7c3aed" opacity="0.8" filter="blur(3px)" />
      </g>
    `;
  } else if (type === 'earbuds') {
    productIllustration = `
      <!-- Wireless Earbuds & Case -->
      <g transform="translate(400, 360)">
        <!-- Charging Case -->
        <rect x="-110" y="-60" width="220" height="160" rx="55" fill="#f8fafc" stroke="#e2e8f0" stroke-width="4" />
        <line x1="-110" y1="-5" x2="110" y2="-5" stroke="#cbd5e1" stroke-width="2" />
        <!-- LED Light -->
        <circle cx="0" cy="25" r="4.5" fill="#22c55e" />

        <!-- Earbud Left -->
        <g transform="translate(-140, -50) rotate(-20)">
          <path d="M-20,-30 C-20,-50 20,-50 20,-30 C20,-10 10,10 6,40 C5,50 -5,50 -6,40 C-10,10 -20,-10 -20,-30 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" />
          <circle cx="0" cy="-30" r="14" fill="#1e293b" />
          <rect x="-4" y="32" width="8" height="6" rx="2" fill="#e2e8f0" stroke="#94a3b8" />
        </g>

        <!-- Earbud Right -->
        <g transform="translate(140, -50) rotate(20)">
          <path d="M-20,-30 C-20,-50 20,-50 20,-30 C20,-10 10,10 6,40 C5,50 -5,50 -6,40 C-10,10 -20,-10 -20,-30 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" />
          <circle cx="0" cy="-30" r="14" fill="#1e293b" />
          <rect x="-4" y="32" width="8" height="6" rx="2" fill="#e2e8f0" stroke="#94a3b8" />
        </g>
      </g>
    `;
  } else if (type === 'ssd') {
    productIllustration = `
      <!-- Rugged NVMe Portable SSD -->
      <g transform="translate(400, 370)">
        <rect x="-100" y="-150" width="200" height="300" rx="36" fill="#1e293b" stroke="#334155" stroke-width="6" />
        <rect x="-85" y="-135" width="170" height="270" rx="26" fill="#0f172a" />
        
        <!-- Silicone Grip Texture Lines -->
        <rect x="-70" y="-110" width="140" height="4" rx="2" fill="#334155" />
        <rect x="-70" y="-95" width="140" height="4" rx="2" fill="#334155" />
        <rect x="-70" y="-80" width="140" height="4" rx="2" fill="#334155" />

        <!-- Orange Corner Loop -->
        <path d="M60 -150 C80 -150 100 -130 100 -110 L100 -70 L60 -110 Z" fill="#f97316" />
        <circle cx="78" cy="-122" r="10" fill="#ffffff" />

        <!-- Capacity Branding -->
        <text x="0" y="30" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">2TB</text>
        <text x="0" y="55" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#94a3b8" text-anchor="middle">2,800 MB/s READ</text>
        <rect x="-35" y="75" width="70" height="22" rx="6" fill="#f97316" fill-opacity="0.2" stroke="#f97316" />
        <text x="0" y="90" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#f97316" text-anchor="middle">IP68 WATERPROOF</text>

        <!-- USB-C Port -->
        <rect x="-24" y="130" width="48" height="14" rx="6" fill="#f97316" />
        <rect x="-18" y="134" width="36" height="6" rx="3" fill="#020617" />
      </g>
    `;
  } else if (type === 'drone') {
    productIllustration = `
      <!-- 4K Foldable Drone -->
      <g transform="translate(400, 360)">
        <!-- Drone Arms -->
        <line x1="-160" y1="-100" x2="160" y2="100" stroke="#334155" stroke-width="16" stroke-linecap="round" />
        <line x1="-160" y1="100" x2="160" y2="-100" stroke="#334155" stroke-width="16" stroke-linecap="round" />

        <!-- Propellers -->
        <ellipse cx="-160" cy="-100" rx="60" ry="14" fill="#94a3b8" opacity="0.4" />
        <ellipse cx="160" cy="-100" rx="60" ry="14" fill="#94a3b8" opacity="0.4" />
        <ellipse cx="-160" cy="100" rx="60" ry="14" fill="#94a3b8" opacity="0.4" />
        <ellipse cx="160" cy="100" rx="60" ry="14" fill="#94a3b8" opacity="0.4" />

        <!-- Motors -->
        <circle cx="-160" cy="-100" r="14" fill="#0f172a" stroke="#f97316" stroke-width="3" />
        <circle cx="160" cy="-100" r="14" fill="#0f172a" stroke="#f97316" stroke-width="3" />
        <circle cx="-160" cy="100" r="14" fill="#0f172a" stroke="#f97316" stroke-width="3" />
        <circle cx="160" cy="100" r="14" fill="#0f172a" stroke="#f97316" stroke-width="3" />

        <!-- Drone Body -->
        <rect x="-70" y="-80" width="140" height="160" rx="36" fill="#1e293b" stroke="#475569" stroke-width="4" />
        
        <!-- Status LEDs -->
        <circle cx="-35" cy="-55" r="5" fill="#22c55e" />
        <circle cx="35" cy="-55" r="5" fill="#22c55e" />

        <!-- 4K Gimbal Camera Eye -->
        <circle cx="0" cy="50" r="28" fill="#020617" stroke="#cbd5e1" stroke-width="3" />
        <circle cx="0" cy="50" r="18" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2" />
        <circle cx="-4" cy="46" r="6" fill="#ffffff" opacity="0.7" />
        <text x="0" y="8" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">4K 60FPS</text>
      </g>
    `;
  } else if (type === 'microphone') {
    productIllustration = `
      <!-- Studio Podcast Microphone -->
      <g transform="translate(400, 370)">
        <!-- Base Stand -->
        <ellipse cx="0" cy="140" rx="90" ry="24" fill="#334155" stroke="#1e293b" stroke-width="3" />
        <rect x="-14" y="40" width="28" height="100" fill="#475569" />

        <!-- Shockmount Ring -->
        <circle cx="0" cy="10" r="75" fill="none" stroke="#64748b" stroke-width="6" />
        <line x1="-75" y1="10" x2="-35" y2="10" stroke="#f97316" stroke-width="2" />
        <line x1="75" y1="10" x2="35" y2="10" stroke="#f97316" stroke-width="2" />

        <!-- Mic Capsule Body -->
        <rect x="-35" y="-120" width="70" height="150" rx="35" fill="#0f172a" stroke="#1e293b" stroke-width="3" />
        
        <!-- Metal Mesh Grille Top -->
        <rect x="-33" y="-118" width="66" height="75" rx="33" fill="#1e293b" />
        ${Array.from({ length: 6 }).map((_, i) => `<line x1="-28" y1="${-110 + i * 12}" x2="28" y2="${-110 + i * 12}" stroke="#64748b" stroke-width="1.5" />`).join('')}

        <!-- Gain Knob & Mute Button -->
        <circle cx="0" cy="-10" r="10" fill="#f97316" />
        <rect x="-15" y="10" width="30" height="8" rx="4" fill="#22c55e" />
      </g>
    `;
  } else if (type === 'monitor') {
    productIllustration = `
      <!-- 4K Portable USB-C Monitor -->
      <g transform="translate(400, 360)">
        <!-- Display Frame -->
        <rect x="-240" y="-140" width="480" height="280" rx="16" fill="#090d16" stroke="#475569" stroke-width="4" />
        
        <!-- Screen Content (High-res Dashboard) -->
        <rect x="-225" y="-125" width="450" height="250" rx="8" fill="#0f172a" />
        
        <!-- Chart on Screen -->
        <rect x="-205" y="-105" width="200" height="100" rx="10" fill="#1e293b" />
        <path d="M-195 -30 Q -150 -80 -100 -50 T -20 -90" fill="none" stroke="#38bdf8" stroke-width="3" />
        <rect x="-205" y="10" width="200" height="95" rx="10" fill="#1e293b" />
        
        <rect x="15" y="-105" width="200" height="210" rx="10" fill="#1e293b" />
        <circle cx="115" cy="-10" r="45" fill="none" stroke="#7c3aed" stroke-width="12" />
        <circle cx="115" cy="-10" r="45" fill="none" stroke="#06b6d4" stroke-width="12" stroke-dasharray="160, 280" />
        <text x="115" y="-4" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">4K IPS</text>

        <!-- Kickstand -->
        <polygon points="-240,140 -200,165 200,165 240,140" fill="#334155" opacity="0.6" />
      </g>
    `;
  } else if (type === 'streamdeck') {
    productIllustration = `
      <!-- Stream Deck Controller Console -->
      <g transform="translate(400, 360)">
        <!-- Angled Console Body -->
        <rect x="-180" y="-120" width="360" height="240" rx="26" fill="#1e293b" stroke="#334155" stroke-width="5" />
        
        <!-- 15 LCD Keys Grid (3 rows x 5 cols) -->
        ${Array.from({ length: 3 }).map((_, r) => {
          return Array.from({ length: 5 }).map((_, c) => {
            const kx = -150 + c * 62;
            const ky = -90 + r * 65;
            const colors = ['#38bdf8', '#7c3aed', '#f43f5e', '#10b981', '#f59e0b'];
            const col = colors[(r * 5 + c) % colors.length];
            return `
              <rect x="${kx}" y="${ky}" width="52" height="52" rx="12" fill="#0f172a" stroke="${col}" stroke-width="2" />
              <circle cx="${kx + 26}" cy="${ky + 26}" r="12" fill="${col}" fill-opacity="0.25" />
            `;
          }).join('');
        }).join('')}
      </g>
    `;
  } else if (type === 'softwarebox') {
    productIllustration = `
      <!-- 3D Software Retail Box Packaging -->
      <g transform="translate(400, 350)">
        <!-- Box Front -->
        <polygon points="-80,-150 80,-120 80,120 -80,90" fill="#7c3aed" stroke="#6d28d9" stroke-width="2" />
        <!-- Box Spine (Left) -->
        <polygon points="-140,-120 -80,-150 -80,90 -140,120" fill="#4c1d95" stroke="#3b0764" stroke-width="2" />
        <!-- Box Top -->
        <polygon points="-140,-120 -80,-150 80,-120 20,-90" fill="#9333ea" />

        <!-- Front Artwork -->
        <circle cx="0" cy="-20" r="38" fill="#ffffff" fill-opacity="0.2" />
        <text x="0" y="-12" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">PGX</text>
        <text x="0" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">PRO SUITE</text>
        
        <!-- Tech Badges on Box -->
        <rect x="-60" y="50" width="120" height="20" rx="4" fill="#0f172a" />
        <text x="0" y="64" font-family="monospace" font-size="9" font-weight="700" fill="#38bdf8" text-anchor="middle">NEXT.JS 15 • STRIPE</text>
      </g>
    `;
  } else if (type === 'laptop') {
    productIllustration = `
      <!-- Sleek MacBook Laptop Display -->
      <g transform="translate(400, 360)">
        <!-- Display Lid -->
        <rect x="-220" y="-140" width="440" height="270" rx="18" fill="#1e293b" stroke="#cbd5e1" stroke-width="3" />
        <!-- Screen Bezel & Content -->
        <rect x="-205" y="-125" width="410" height="240" rx="8" fill="#0f172a" />
        <rect x="-205" y="-125" width="410" height="30" fill="#1e293b" />
        <circle cx="-190" cy="-110" r="4.5" fill="#ef4444" />
        <circle cx="-176" cy="-110" r="4.5" fill="#eab308" />
        <circle cx="-162" cy="-110" r="4.5" fill="#22c55e" />

        <!-- Web Content Layout Inside Screen -->
        <rect x="-190" y="-80" width="160" height="24" rx="6" fill="#3b82f6" />
        <rect x="-190" y="-45" width="220" height="10" rx="4" fill="#475569" />
        <rect x="-190" y="-25" width="180" height="10" rx="4" fill="#334155" />
        <rect x="-190" y="5" width="80" height="28" rx="8" fill="#7c3aed" />

        <rect x="50" y="-80" width="140" height="120" rx="12" fill="#1e293b" stroke="#334155" />

        <!-- Laptop Base -->
        <polygon points="-250,140 250,140 230,155 -230,155" fill="#cbd5e1" stroke="#94a3b8" />
        <!-- Trackpad Notch -->
        <rect x="-35" y="140" width="70" height="6" rx="3" fill="#94a3b8" />
      </g>
    `;
  } else {
    // Default Digital Hardcover Book / Binder
    productIllustration = `
      <!-- Digital Masterclass Book / Curriculum Binder -->
      <g transform="translate(400, 350)">
        <!-- Spine -->
        <polygon points="-120,-140 -80,-160 -80,120 -120,140" fill="#1e1b4b" stroke="#312e81" />
        <!-- Front Cover -->
        <polygon points="-80,-160 100,-130 100,150 -80,120" fill="#1e293b" stroke="#475569" stroke-width="2" />
        
        <!-- Gold Seal Badge on Book -->
        <circle cx="10" cy="-20" r="42" fill="#fef08a" stroke="#ca8a04" stroke-width="3" />
        <circle cx="10" cy="-20" r="34" fill="#eab308" />
        <polygon points="10,-35 15,-25 26,-25 18,-18 21,-7 10,-13 -1,-7 2,-18 -6,-25 5,-25" fill="#ffffff" />
        
        <text x="10" y="30" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">OFFICIAL</text>
        <text x="10" y="48" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="middle">GUIDE 2026</text>
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <!-- Amazon-Style Soft Ground Shadow -->
    <radialGradient id="contactShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.18" />
      <stop offset="50%" stop-color="#000000" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Pure White Amazon Background -->
  <rect width="800" height="600" fill="#ffffff" />

  <!-- Soft Studio Ground Shadow -->
  <ellipse cx="400" cy="510" rx="260" ry="28" fill="url(#contactShadow)" />
  <ellipse cx="400" cy="500" rx="160" ry="14" fill="url(#contactShadow)" opacity="0.6" />

  <!-- Clean Top Amazon Tags -->
  <g transform="translate(40, 40)">
    <rect x="0" y="0" width="105" height="26" rx="6" fill="#f1f5f9" stroke="#e2e8f0" />
    <text x="52" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#475569" text-anchor="middle">PRIME ELIGIBLE</text>
  </g>

  <g transform="translate(640, 40)">
    <rect x="0" y="0" width="120" height="26" rx="6" fill="#ecfdf5" stroke="#a7f3d0" />
    <text x="60" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#059669" text-anchor="middle">★ VERIFIED GENUINE</text>
  </g>

  <!-- Product Illustration -->
  ${productIllustration}

  <!-- Bottom Brand Watermark -->
  <g transform="translate(400, 565)">
    <text x="0" y="0" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#94a3b8" letter-spacing="1" text-anchor="middle">
      PGX DIGITAL • OFFICIAL SPECIFICATION
    </text>
  </g>
</svg>`;
}

// 100 Products Definition (50 Smart Gadgets + 50 Digital Software & Tools)
const PRODUCTS = [
  // ─── 1. Smart Gadgets & Wearables (10) ──────────────────────────────
  {
    name: 'PGX Ultra Titanium Smartwatch',
    slug: 'pgx-ultra-titanium-smartwatch',
    sku: 'PGX-GDG-001',
    categorySlug: 'smart-gadgets-wearables',
    price: 249.00,
    comparePrice: 349.00,
    visualType: 'smartwatch',
    shortDesc: 'Rugged titanium 49mm smartwatch with dual-frequency GPS, depth gauge, and 72-hour battery life.',
    features: ['Titanium Grade 5 aerospace chassis', 'Precision dual-frequency GPS', 'ECG, SpO2, and skin temperature sensors', '100m water resistance with dive computer mode', 'Ultra-bright 2000 nit sapphire crystal OLED'],
  },
  {
    name: 'PGX Halo Biometric Smart Ring',
    slug: 'pgx-halo-biometric-smart-ring',
    sku: 'PGX-GDG-002',
    categorySlug: 'smart-gadgets-wearables',
    price: 199.00,
    comparePrice: 279.00,
    visualType: 'smartwatch',
    shortDesc: 'Titanium health tracking ring monitoring sleep stages, HRV recovery, and daily readiness score.',
    features: ['Featherlight 4-gram titanium shell', '7-day continuous battery life', 'Medical-grade infrared temperature sensors', 'Zero subscription app fee', 'Waterproof up to 100 meters'],
  },
  {
    name: 'PGX AirSense AI Voice Pin',
    slug: 'pgx-airsense-ai-voice-pin',
    sku: 'PGX-GDG-003',
    categorySlug: 'smart-gadgets-wearables',
    price: 149.00,
    comparePrice: 219.00,
    visualType: 'smartwatch',
    shortDesc: 'Magnetic wearable AI assistant with real-time translation, voice transcription, and contextual memory.',
    features: ['Dual beamforming noise-filtering microphones', 'Magnetic clip for shirts and collars', 'Offline voice transcription engine', 'All-day 18-hour continuous battery', 'USB-C charging dock included'],
  },
  {
    name: 'PGX Apex Fitness & Recovery Band',
    slug: 'pgx-apex-fitness-recovery-band',
    sku: 'PGX-GDG-004',
    categorySlug: 'smart-gadgets-wearables',
    price: 129.00,
    comparePrice: 179.00,
    visualType: 'smartwatch',
    shortDesc: 'Screen-free recovery wristband tracking strain, continuous pulse, sleep quality, and stress levels.',
    features: ['Screenless distraction-free design', 'Any-wear compatible (wrist, bicep, sleeve)', 'Continuous 24/7 biometric recording', 'Wireless slip-on battery pack', 'Detailed iOS & Android coaching app'],
  },
  {
    name: 'PGX Vision AR Smart Glasses',
    slug: 'pgx-vision-ar-smart-glasses',
    sku: 'PGX-GDG-005',
    categorySlug: 'smart-gadgets-wearables',
    price: 299.00,
    comparePrice: 399.00,
    visualType: 'smartwatch',
    shortDesc: 'Lightweight augmented reality eyewear with micro-OLED heads-up navigation and directional audio speakers.',
    features: ['FHD Micro-OLED dual projection display', 'Open-ear directional acoustic speakers', 'Voice command navigation & notification HUD', 'Blue-light filtering Zeiss prescription ready', 'USB-C displayport connectivity'],
  },
  {
    name: 'PGX Somna Deep Sleep Headband',
    slug: 'pgx-somna-deep-sleep-headband',
    sku: 'PGX-GDG-006',
    categorySlug: 'smart-gadgets-wearables',
    price: 119.00,
    comparePrice: 169.00,
    visualType: 'smartwatch',
    shortDesc: 'Breathable EEG sleep headband tracking brainwaves and delivering acoustic pink-noise deep sleep stimulation.',
    features: ['Clinical EEG brainwave sensor electrodes', 'Adaptive acoustic pink-noise stimulator', 'Breathable ultra-soft fabric wash band', 'Smart silent vibration morning alarm', 'Zero radiation Bluetooth low energy'],
  },
  {
    name: 'PGX HydroSmart UV Self-Cleaning Bottle',
    slug: 'pgx-hydrosmart-uv-bottle',
    sku: 'PGX-GDG-007',
    categorySlug: 'smart-gadgets-wearables',
    price: 69.00,
    comparePrice: 99.00,
    visualType: 'smartwatch',
    shortDesc: 'Insulated stainless steel bottle with UV-C purification cap and hydration tracking reminder LED.',
    features: ['UV-C LED sanitizes water in 60 seconds', '24-hour cold / 12-hour hot double wall vacuum', 'Smart LED glow reminder to drink hourly', 'Magnetic waterproof USB recharge port', 'BPA-free pro-grade stainless steel'],
  },
  {
    name: 'PGX BioScale Pro Smart Body Composition',
    slug: 'pgx-bioscale-pro-smart-scale',
    sku: 'PGX-GDG-008',
    categorySlug: 'smart-gadgets-wearables',
    price: 79.00,
    comparePrice: 119.00,
    visualType: 'smartwatch',
    shortDesc: 'Full body composition analyzer measuring 16 biometric metrics via dual-frequency BIA sensors.',
    features: ['16 metrics (Fat, Muscle, Bone, Water, Visceral)', 'Retractable hand-held 8-electrode sensor bar', 'High-contrast color LCD display', 'Multi-user automatic profile recognition', 'Direct Wi-Fi & Bluetooth auto-sync'],
  },
  {
    name: 'PGX TagPro Anti-Lost GPS Tracker (4-Pack)',
    slug: 'pgx-tagpro-gps-tracker-4pack',
    sku: 'PGX-GDG-009',
    categorySlug: 'smart-gadgets-wearables',
    price: 49.00,
    comparePrice: 79.00,
    visualType: 'smartwatch',
    shortDesc: 'Ultra-slim Bluetooth item finder compatible with Apple Find My and Android nearby networks.',
    features: ['Apple Find My certified precision tracking', 'Replaceable CR2032 1-year coin battery', 'IP67 water and dust resistance', 'Built-in 90dB loud speaker chime', 'Pack of 4 with adhesive mounts included'],
  },
  {
    name: 'PGX Lumina Ambient Smart Light Bar',
    slug: 'pgx-lumina-smart-light-bar',
    sku: 'PGX-GDG-010',
    categorySlug: 'smart-gadgets-wearables',
    price: 59.00,
    comparePrice: 89.00,
    visualType: 'smartwatch',
    shortDesc: 'Asymmetrical monitor screen light bar with auto-dimming sensor and wireless rotary desktop dial.',
    features: ['Zero screen glare asymmetrical optic angle', 'Wireless 2.4GHz desktop rotary control puck', 'Auto-dimming ambient lux sensor', 'Adjustable color temp (2700K - 6500K)', 'USB-C powered from monitor or hub'],
  },

  // ─── 2. Desk Tech & Peripherals (10) ────────────────────────────────
  {
    name: 'PGX CyberDeck 75% Mechanical Keyboard',
    slug: 'pgx-cyberdeck-mechanical-keyboard',
    sku: 'PGX-DSK-001',
    categorySlug: 'desk-tech-peripherals',
    price: 139.00,
    comparePrice: 189.00,
    visualType: 'keyboard',
    shortDesc: 'Hot-swappable gasket-mounted mechanical keyboard with CNC aluminum body and PBT dye-sub keycaps.',
    features: ['CNC aluminum anodized chassis', 'Gasket-mounted sound-dampening foam', 'Factory-lubed linear mechanical switches', 'Tri-mode connectivity (2.4GHz, BT 5.2, USB-C)', 'Multi-function programmable rotary knob'],
  },
  {
    name: 'PGX ErgoVertical Precision Mouse',
    slug: 'pgx-ergovertical-precision-mouse',
    sku: 'PGX-DSK-002',
    categorySlug: 'desk-tech-peripherals',
    price: 69.00,
    comparePrice: 99.00,
    visualType: 'keyboard',
    shortDesc: 'Ergonomic 57-degree natural vertical mouse designed to eliminate wrist fatigue and carpal tunnel.',
    features: ['57-degree ergonomic neutral handshake angle', 'Hyper-accurate 4000 DPI optical sensor', 'Ultra-quiet silent click microswitches', 'Rechargeable 70-day battery via USB-C', 'Pair and switch between 3 devices'],
  },
  {
    name: 'PGX StreamPad 15 LCD Console',
    slug: 'pgx-streampad-15-lcd-console',
    sku: 'PGX-DSK-003',
    categorySlug: 'desk-tech-peripherals',
    price: 149.00,
    comparePrice: 199.00,
    visualType: 'streamdeck',
    shortDesc: '15 customizable tactile LCD keys for triggering shortcuts, OBS scenes, audio toggles, and macros.',
    features: ['15 programmable high-res color LCD keys', 'Direct OBS, Twitch, Spotify & Discord plugins', 'One-touch multi-action macro chains', 'Detachable magnetic angled desk stand', 'Drag-and-drop icon software for Mac & PC'],
  },
  {
    name: 'PGX Horizon 16" 4K Portable Monitor',
    slug: 'pgx-horizon-16-portable-monitor',
    sku: 'PGX-DSK-004',
    categorySlug: 'desk-tech-peripherals',
    price: 219.00,
    comparePrice: 299.00,
    visualType: 'monitor',
    shortDesc: 'Ultra-thin 16-inch 4K UHD IPS portable external display with 100% DCI-P3 and single-cable USB-C.',
    features: ['3840x2160 4K UHD IPS panel at 500 nits', '100% DCI-P3 cinema color gamut', 'Dual USB-C and Mini-HDMI ports', 'Integrated kickstand with portrait rotation', 'Featherlight 780g aluminum frame'],
  },
  {
    name: 'PGX ProArt Digital Drawing Tablet 10"',
    slug: 'pgx-proart-drawing-tablet',
    sku: 'PGX-DSK-005',
    categorySlug: 'desk-tech-peripherals',
    price: 89.00,
    comparePrice: 129.00,
    visualType: 'monitor',
    shortDesc: 'Professional graphics pen tablet with 8192 levels of pressure, battery-free stylus, and 8 hotkeys.',
    features: ['8192 levels of pressure sensitivity', 'Battery-free electromagnetic resonance stylus', '60-degree natural tilt recognition', '8 programmable express hotkeys', 'Compatible with Photoshop, Figma, Blender'],
  },
  {
    name: 'PGX SolidMetal Heavy Duty Monitor Arm',
    slug: 'pgx-solidmetal-monitor-arm',
    sku: 'PGX-DSK-006',
    categorySlug: 'desk-tech-peripherals',
    price: 69.00,
    comparePrice: 99.00,
    visualType: 'keyboard',
    shortDesc: 'Gas-spring single monitor desk mount supporting ultrawide screens up to 49" and 20kg.',
    features: ['Gas-spring counterbalanced elevation', 'Supports curved screens up to 49 inches', 'Integrated internal cable management channel', 'Desk clamp and grommet mounting included', '360-degree rotation (portrait / landscape)'],
  },
  {
    name: 'PGX MagDesk Felt & Leather Desk Mat',
    slug: 'pgx-magdesk-felt-leather-mat',
    sku: 'PGX-DSK-007',
    categorySlug: 'desk-tech-peripherals',
    price: 39.00,
    comparePrice: 59.00,
    visualType: 'keyboard',
    shortDesc: 'Premium merino wool felt and vegan leather desk pad with magnetic cable organizing clips.',
    features: ['Dual-sided premium vegan leather & wool felt', 'Integrated magnetic cable organizer bar', 'Hidden toolbar paper document organizer layer', 'Waterproof and easy to wipe clean', 'Generous 90cm x 40cm coverage'],
  },
  {
    name: 'PGX GlideTrack Wireless Touchpad Pro',
    slug: 'pgx-glidetrack-touchpad-pro',
    sku: 'PGX-DSK-008',
    categorySlug: 'desk-tech-peripherals',
    price: 79.00,
    comparePrice: 109.00,
    visualType: 'keyboard',
    shortDesc: 'Expansive edge-to-edge glass multi-touch trackpad supporting smooth macOS and Windows gestures.',
    features: ['Smooth frosted tempered glass surface', 'Full multi-touch gesture support (pinch, swipe)', 'Haptic click feedback engines', 'Bluetooth and USB-C wired connection', 'Rechargeable 30-day battery'],
  },
  {
    name: 'PGX SilentDock Laptop Stand with Hub',
    slug: 'pgx-silentdock-laptop-stand-hub',
    sku: 'PGX-DSK-009',
    categorySlug: 'desk-tech-peripherals',
    price: 89.00,
    comparePrice: 129.00,
    visualType: 'keyboard',
    shortDesc: 'Ergonomic aluminum laptop riser with integrated 7-in-1 4K HDMI, USB-C 100W PD, and SD reader.',
    features: ['Integrated 7-in-1 USB-C docking station', '100W Power Delivery pass-through charging', '4K 60Hz HDMI video output port', 'Precision CNC aluminum cooling cutout', 'Collapsible flat design for travel'],
  },
  {
    name: 'PGX Keymaster Custom PBT Keycaps Set',
    slug: 'pgx-keymaster-pbt-keycaps',
    sku: 'PGX-DSK-010',
    categorySlug: 'desk-tech-peripherals',
    price: 45.00,
    comparePrice: 69.00,
    visualType: 'keyboard',
    shortDesc: '142-key cherry profile thick PBT dye-sublimated keycap set with cyber purple and dark slate scheme.',
    features: ['1.5mm thick durable PBT construction', 'Dye-sublimation legends that never fade', 'Cherry ergonomic typing profile', 'Includes novelty keys and ISO enter layout', 'Fits ANSI, ISO, 60%, 75%, TKL, and Full keyboards'],
  },

  // ─── 3. Audio & Streaming Gear (10) ─────────────────────────────────
  {
    name: 'PGX StudioOne Podcast USB Microphone',
    slug: 'pgx-studioone-usb-microphone',
    sku: 'PGX-AUD-001',
    categorySlug: 'audio-streaming-gear',
    price: 119.00,
    comparePrice: 169.00,
    visualType: 'microphone',
    shortDesc: 'Cardioid studio condenser microphone with built-in pop filter, zero-latency monitoring, and gain knob.',
    features: ['24-bit / 96kHz studio-grade resolution', 'Cardioid pickup pattern rejecting background noise', 'Built-in DSP noise gate and compressor', 'Tap-to-mute sensor with LED status indicator', 'Heavy metal desktop base with shockmount'],
  },
  {
    name: 'PGX ANC Pro Wireless Studio Earbuds',
    slug: 'pgx-anc-pro-wireless-earbuds',
    sku: 'PGX-AUD-002',
    categorySlug: 'audio-streaming-gear',
    price: 139.00,
    comparePrice: 189.00,
    visualType: 'earbuds',
    shortDesc: '48dB Hybrid Active Noise Canceling earbuds with spatial audio, transparency mode, and 36h battery.',
    features: ['48dB hybrid active noise cancellation', 'Custom 11mm titanium dynamic drivers', 'Spatial 3D audio with head tracking', 'IPX5 sweat and water resistance', 'Wireless Qi fast charging case'],
  },
  {
    name: 'PGX HiFi Monitor Over-Ear Headphones',
    slug: 'pgx-hifi-monitor-headphones',
    sku: 'PGX-AUD-003',
    categorySlug: 'audio-streaming-gear',
    price: 179.00,
    comparePrice: 249.00,
    visualType: 'earbuds',
    shortDesc: 'Reference open-back studio headphones engineered for music production, audio mixing, and gaming.',
    features: ['50mm neodymium acoustic drivers', 'Open-back design for expansive natural soundstage', 'Memory foam velour replaceable earpads', 'Detachable oxygen-free copper cable', 'Gold-plated 3.5mm to 6.35mm adapter included'],
  },
  {
    name: 'PGX SoundStage 2-Channel USB DAC',
    slug: 'pgx-soundstage-usb-dac',
    sku: 'PGX-AUD-004',
    categorySlug: 'audio-streaming-gear',
    price: 89.00,
    comparePrice: 129.00,
    visualType: 'microphone',
    shortDesc: 'High-resolution desktop headphone amplifier and DAC with ESS Sabre chipset supporting 32-bit/384kHz.',
    features: ['ESS Sabre ES9038Q2M audiophile DAC', 'Powers headphones up to 600 Ohms effortlessly', 'Balanced 4.4mm and standard 3.5mm outputs', 'CNC aluminum housing with analog volume pot', 'Direct bit-perfect ASIO drivers'],
  },
  {
    name: 'PGX AirVoice Wireless Lavalier Mic (2TX+1RX)',
    slug: 'pgx-airvoice-wireless-lav-mic',
    sku: 'PGX-AUD-005',
    categorySlug: 'audio-streaming-gear',
    price: 129.00,
    comparePrice: 179.00,
    visualType: 'microphone',
    shortDesc: 'Dual-channel wireless lapel mic kit with 200m range, on-board backup recording, and charging case.',
    features: ['2 transmitters + 1 receiver with OLED screens', '32-bit float internal backup recording', '200m stable line-of-sight range', 'Lightning, USB-C, and 3.5mm adapters included', 'Charging case providing 18 hours total run time'],
  },
  {
    name: 'PGX AcousticPro Sound Foam Panels (12-Pack)',
    slug: 'pgx-acousticpro-sound-panels',
    sku: 'PGX-AUD-006',
    categorySlug: 'audio-streaming-gear',
    price: 49.00,
    comparePrice: 79.00,
    visualType: 'microphone',
    shortDesc: 'High-density bevelled acoustic wall tiles reducing flutter echoes and reverb for studio recording.',
    features: ['High-density 230kg/m3 flame-retardant polyester', 'Beveled edges for sleek geometric mosaic patterns', 'Self-adhesive backing for damage-free walls', 'Odorless, non-toxic, and formaldehyde free', 'Pack of 12 panels (30cm x 30cm each)'],
  },
  {
    name: 'PGX Desktop Near-Field Studio Monitors (Pair)',
    slug: 'pgx-desktop-studio-monitors',
    sku: 'PGX-AUD-007',
    categorySlug: 'audio-streaming-gear',
    price: 169.00,
    comparePrice: 229.00,
    visualType: 'microphone',
    shortDesc: 'Active 3.5" reference studio desktop speakers with woven composite woofers and Bluetooth 5.0.',
    features: ['3.5-inch woven composite low-frequency woofers', '1-inch silk dome high-frequency tweeters', 'Integrated 50W Class D amplification', 'RCA, 3.5mm AUX, and Bluetooth 5.0 inputs', 'Front-panel headphone jack and volume knob'],
  },
  {
    name: 'PGX BoomMaster Low-Profile Mic Arm',
    slug: 'pgx-boommaster-low-profile-arm',
    sku: 'PGX-AUD-008',
    categorySlug: 'audio-streaming-gear',
    price: 59.00,
    comparePrice: 89.00,
    visualType: 'microphone',
    shortDesc: 'All-metal low-profile microphone boom arm that glides under your monitor to keep your camera frame clear.',
    features: ['Low-profile design clearing monitor bottoms', '360-degree smooth horizontal rotation', 'Magnetic cable management routing covers', 'Supports mics up to 2kg without sagging', 'Desk clamp fitting desks up to 60mm thick'],
  },
  {
    name: 'PGX BoneWave Sport Open-Ear Headphones',
    slug: 'pgx-bonewave-openear-headphones',
    sku: 'PGX-AUD-009',
    categorySlug: 'audio-streaming-gear',
    price: 99.00,
    comparePrice: 139.00,
    visualType: 'earbuds',
    shortDesc: 'Bone conduction headphones delivering open-ear situational awareness, IP68 water resistance, and 10h battery.',
    features: ['Bone conduction technology keeping ears open', 'IP68 fully submersible waterproof rating', 'Built-in 32GB MP3 storage for phone-free workouts', 'Titanium wraparound flexible headband', 'Magnetic rapid charging port'],
  },
  {
    name: 'PGX SoundShield Pro Studio Pop Filter',
    slug: 'pgx-soundshield-pop-filter',
    sku: 'PGX-AUD-010',
    categorySlug: 'audio-streaming-gear',
    price: 29.00,
    comparePrice: 45.00,
    visualType: 'microphone',
    shortDesc: 'Dual-layer stainless steel mesh pop filter eliminating plosives and breath blasts during voice recording.',
    features: ['Dual-layer curved stainless steel mesh', 'Flexible 360-degree all-angle gooseneck', 'Reinforced metal screw clamp with rubber pad', 'Clean acoustic transparency without treble loss', 'Universal fit for all standard shockmounts'],
  },

  // ─── 4. Power & Fast Storage (10) ───────────────────────────────────
  {
    name: 'PGX TurboDrive 2TB Rugged NVMe SSD',
    slug: 'pgx-turbodrive-2tb-nvme-ssd',
    sku: 'PGX-PWR-001',
    categorySlug: 'power-storage-accessories',
    price: 189.00,
    comparePrice: 259.00,
    visualType: 'ssd',
    shortDesc: 'High-speed 2TB external NVMe SSD delivering up to 2,800 MB/s over USB4 and Thunderbolt 4.',
    features: ['Blistering 2,800 MB/s read/write speeds', 'Heavy duty anodized aluminum heat dissipating body', 'IP68 water, dust, and 3-meter drop resistance', 'Hardware 256-bit AES encryption support', 'USB-C to USB-C 40Gbps cable included'],
  },
  {
    name: 'PGX GaNPro 140W 4-Port Fast Charger',
    slug: 'pgx-ganpro-140w-fast-charger',
    sku: 'PGX-PWR-002',
    categorySlug: 'power-storage-accessories',
    price: 69.00,
    comparePrice: 99.00,
    visualType: 'ssd',
    shortDesc: 'Gallium Nitride wall charger with 3x USB-C PD 3.1 and 1x USB-A charging 2 MacBook Pros simultaneously.',
    features: ['140W single-port PD 3.1 output for 16" MacBooks', 'GaN III technology reducing heat and size by 40%', 'Smart power distribution across 4 connected devices', 'Foldable prongs with UK/EU travel adapters', 'UL certified comprehensive surge protection'],
  },
  {
    name: 'PGX MagStand 3-in-1 Wireless Charging Dock',
    slug: 'pgx-magstand-wireless-charging-dock',
    sku: 'PGX-PWR-003',
    categorySlug: 'power-storage-accessories',
    price: 79.00,
    comparePrice: 119.00,
    visualType: 'ssd',
    shortDesc: 'Floating magnetic wireless charging tree for iPhone (15W), Apple Watch (Fast Charge), and AirPods.',
    features: ['Official 15W Qi2 / MagSafe certified charging', 'Weighted zinc-alloy anti-slip heavy base', 'Fast charging puck for Apple Watch Ultra', 'Adjustable 30-degree magnetic tilt viewing angle', '36W power adapter and braided cable included'],
  },
  {
    name: 'PGX PowerVault 25,000mAh Laptop Power Bank',
    slug: 'pgx-powervault-laptop-power-bank',
    sku: 'PGX-PWR-004',
    categorySlug: 'power-storage-accessories',
    price: 99.00,
    comparePrice: 149.00,
    visualType: 'ssd',
    shortDesc: '145W high-output portable battery pack with real-time digital smart display for laptops and phones.',
    features: ['Airline-approved 25,000mAh / 99.9Wh capacity', '100W USB-C output charges laptops from 0 to 50% in 30min', 'Color TFT smart screen showing watts and time remaining', 'Dual USB-C and single USB-A multi-charging', 'Fast 65W recharge in under 2 hours'],
  },
  {
    name: 'PGX ThunderDock 12-in-1 Thunderbolt 4 Hub',
    slug: 'pgx-thunderdock-thunderbolt4-hub',
    sku: 'PGX-PWR-005',
    categorySlug: 'power-storage-accessories',
    price: 199.00,
    comparePrice: 279.00,
    visualType: 'ssd',
    shortDesc: 'Enterprise docking station supporting dual 4K 60Hz displays, 2.5Gbps Ethernet, 98W host charging.',
    features: ['Thunderbolt 4 / 40Gbps Intel certified chipset', 'Dual 4K 60Hz or single 8K external display output', '98W Power Delivery to host laptop', '2.5 Gigabit high-speed Ethernet RJ45 port', 'UHS-II SD & microSD card readers + 4x USB-A'],
  },
  {
    name: 'PGX UltraSpeed 512GB V90 SDXC Card',
    slug: 'pgx-ultraspeed-512gb-sd-card',
    sku: 'PGX-PWR-006',
    categorySlug: 'power-storage-accessories',
    price: 119.00,
    comparePrice: 169.00,
    visualType: 'ssd',
    shortDesc: 'UHS-II V90 memory card with 300 MB/s sustained write speeds for 8K RAW cinema camera recording.',
    features: ['V90 rating guaranteeing 90 MB/s minimum write', 'Up to 300 MB/s read and 280 MB/s write speeds', 'Optimized for 8K, 6K, and 4K 120fps video capture', 'Shockproof, X-ray proof, and temperature proof', 'Includes dedicated USB-C UHS-II card reader'],
  },
  {
    name: 'PGX ArmorLink USB4 Braided Cable (2-Pack)',
    slug: 'pgx-armorlink-usb4-cable-2pack',
    sku: 'PGX-PWR-007',
    categorySlug: 'power-storage-accessories',
    price: 29.00,
    comparePrice: 45.00,
    visualType: 'ssd',
    shortDesc: '40Gbps USB4 braided cables supporting 240W EPR charging and 8K 60Hz video pass-through.',
    features: ['40Gbps ultra-high bandwidth data transfer', '240W (48V/5A) Power Delivery EPR support', 'Supports single 8K or dual 4K external displays', 'Kevlar-reinforced double braided nylon jacket', 'Pack of 2 cables (1 meter and 2 meters)'],
  },
  {
    name: 'PGX MagCord Magnetic Cable Management System',
    slug: 'pgx-magcord-cable-organizer',
    sku: 'PGX-PWR-008',
    categorySlug: 'power-storage-accessories',
    price: 24.00,
    comparePrice: 39.00,
    visualType: 'ssd',
    shortDesc: 'Heavy zinc desk base with 5 magnetic cable collars preventing cords from falling behind desks.',
    features: ['Weighted zinc alloy desktop magnetic dock', '5 magnetic collars fitting all cable diameters', 'Reusable micro-suction adhesive bottom pad', 'Clean matte black minimalist finish', 'Organizes power, monitor, and audio cables'],
  },
  {
    name: 'PGX SmartStrip 6-Outlet Surge Protector Hub',
    slug: 'pgx-smartstrip-surge-protector',
    sku: 'PGX-PWR-009',
    categorySlug: 'power-storage-accessories',
    price: 45.00,
    comparePrice: 69.00,
    visualType: 'ssd',
    shortDesc: 'Wi-Fi smart power strip with 6 individually controlled AC outlets, 3x USB-C PD, and energy monitor.',
    features: ['6 independently controllable smart AC sockets', '3x USB-C 45W fast charging ports built-in', 'Real-time power consumption energy monitoring', 'Apple HomeKit, Alexa, and Google Assistant sync', '4000 Joules heavy-duty surge suppression'],
  },
  {
    name: 'PGX SolarFold 30W Portable Solar Charger',
    slug: 'pgx-solarfold-30w-solar-charger',
    sku: 'PGX-PWR-010',
    categorySlug: 'power-storage-accessories',
    price: 69.00,
    comparePrice: 99.00,
    visualType: 'ssd',
    shortDesc: 'Foldable SunPower solar panel with dual USB-C outputs for charging power banks and devices off-grid.',
    features: ['SunPower monocrystalline cells with 24% efficiency', 'Dual USB-C outputs (PD 20W + QC 18W)', 'Water-resistant rugged Cordura fabric fold', 'Stainless steel hanging carabiners included', 'Folds down to tablet size for backpack storage'],
  },

  // ─── 5. Cameras, Drones & Optics (10) ───────────────────────────────
  {
    name: 'PGX AeroX 4K Gimbal Drone',
    slug: 'pgx-aerox-4k-gimbal-drone',
    sku: 'PGX-CAM-001',
    categorySlug: 'cameras-drones-creator',
    price: 299.00,
    comparePrice: 429.00,
    visualType: 'drone',
    shortDesc: 'Sub-249g foldable GPS drone with 3-axis mechanical gimbal, 4K HDR video, and 38-minute flight time.',
    features: ['Sub-249g regulation-friendly weight (No FAA reg)', 'True 3-axis mechanical stabilization gimbal', '4K 60fps HDR video with 4x digital zoom', '10km HD video transmission range', '360-degree obstacle sensing & auto-return to home'],
  },
  {
    name: 'PGX StreamCam 4K 60FPS AI Tracking Webcam',
    slug: 'pgx-streamcam-4k-ai-webcam',
    sku: 'PGX-CAM-002',
    categorySlug: 'cameras-drones-creator',
    price: 139.00,
    comparePrice: 199.00,
    visualType: 'drone',
    shortDesc: 'Sony STARVIS 4K sensor webcam with AI auto-framing, HDR lighting, and dual noise-canceling mics.',
    features: ['Sony STARVIS 1/2" 4K CMOS sensor', 'AI subject tracking and automatic face framing', 'HDR compensation for backlit and low-light rooms', 'Magnetic physical privacy shutter', 'Detachable USB-C cable and tripod mount thread'],
  },
  {
    name: 'PGX ActionPro 5.3K Waterproof Camera',
    slug: 'pgx-actionpro-5k-action-camera',
    sku: 'PGX-CAM-003',
    categorySlug: 'cameras-drones-creator',
    price: 229.00,
    comparePrice: 329.00,
    visualType: 'drone',
    shortDesc: 'Rugged action camera capturing 5.3K 60fps with horizon lock, dual screens, and 10m bare waterproofing.',
    features: ['5.3K 60fps & 4K 120fps slow-motion capture', '360-degree horizon steady stabilization', 'Dual front & rear touchscreens', 'Waterproof to 10 meters without a case', 'Enduro cold-resistant battery included'],
  },
  {
    name: 'PGX SmoothGimbal 3-Axis Phone Stabilizer',
    slug: 'pgx-smoothgimbal-phone-stabilizer',
    sku: 'PGX-CAM-004',
    categorySlug: 'cameras-drones-creator',
    price: 99.00,
    comparePrice: 149.00,
    visualType: 'drone',
    shortDesc: 'Foldable motorized 3-axis gimbal for smartphones with magnetic clamp, AI tracking, and tripod.',
    features: ['Motorized 3-axis cinema stabilization', 'Magnetic quick-release smartphone clamp', 'Integrated extension selfie rod (215mm)', 'Gesture control & AI face/object tracking', 'ShotGuides automated camera movement templates'],
  },
  {
    name: 'PGX StudioGlow Bi-Color LED Ring Light 18"',
    slug: 'pgx-studioglow-led-ring-light',
    sku: 'PGX-CAM-005',
    categorySlug: 'cameras-drones-creator',
    price: 79.00,
    comparePrice: 119.00,
    visualType: 'drone',
    shortDesc: '18-inch dimmable LED ring light with CRI 97+, color temperature adjustment, and 2m heavy tripod.',
    features: ['18-inch diameter with 480 high-CRI LEDs (CRI 97+)', 'Adjustable color temperature from 3200K to 5600K', 'Wireless remote control & smartphone mount bracket', 'USB charging output port on light ring', 'Heavy-duty 2-meter reverse-folding light stand'],
  },
  {
    name: 'PGX CinemaOptic Smartphone Anamorphic Lens',
    slug: 'pgx-cinemaoptic-anamorphic-lens',
    sku: 'PGX-CAM-006',
    categorySlug: 'cameras-drones-creator',
    price: 69.00,
    comparePrice: 99.00,
    visualType: 'drone',
    shortDesc: '1.33x anamorphic mobile lens creating widescreen 2.4:1 cinematic aspect ratio and organic blue flares.',
    features: ['1.33x horizontal squeeze for 2.4:1 widescreen', 'Cinematic horizontal blue streak lens flares', 'Multi-coated Schott optical glass elements', 'Universal aluminum spring clamp fitting any phone', '17mm threaded lens mount compatible'],
  },
  {
    name: 'PGX PromptView iPad Teleprompter Kit',
    slug: 'pgx-promptview-teleprompter',
    sku: 'PGX-CAM-007',
    categorySlug: 'cameras-drones-creator',
    price: 89.00,
    comparePrice: 129.00,
    visualType: 'drone',
    shortDesc: '70/30 beam splitter glass teleprompter fitting tablets and smartphones for studio video recording.',
    features: ['Premium 70/30 beam splitter optical glass', 'Fits iPads and tablets up to 11 inches', 'Works with DSLR, mirrorless cameras & smartphones', 'Bluetooth remote control for scrolling speed', 'Custom hard-shell EVA travel carry case'],
  },
  {
    name: 'PGX ChromaPop Pull-Up Green Screen 2m',
    slug: 'pgx-chromapop-green-screen',
    sku: 'PGX-CAM-008',
    categorySlug: 'cameras-drones-creator',
    price: 119.00,
    comparePrice: 169.00,
    visualType: 'drone',
    shortDesc: 'Pneumatic collapsible green screen backdrop with wrinkle-resistant Chroma key fabric in aluminum case.',
    features: ['Pneumatic X-frame pops up in 3 seconds', 'Wrinkle-resistant 100% Chroma key green polyester', 'Sturdy aluminum base case with rotating feet', 'Collapses flat for under-bed or closet storage', 'Generous 1.5m width x 2.0m height coverage'],
  },
  {
    name: 'PGX LightPanel RGB Creator Key Light',
    slug: 'pgx-lightpanel-rgb-key-light',
    sku: 'PGX-CAM-009',
    categorySlug: 'cameras-drones-creator',
    price: 69.00,
    comparePrice: 99.00,
    visualType: 'drone',
    shortDesc: 'Desktop edge-lit studio LED key light with 2500K-9000K, full RGB hues, and desk clamp pole.',
    features: ['Edge-lit soft diffusion panel preventing eye strain', 'Full RGB spectrum + 2500K to 9000K bi-color', 'C-clamp telescopic desk mount pole (35-90cm)', 'Wi-Fi app and physical tactile dials control', 'AC adapter with international plug set'],
  },
  {
    name: 'PGX LensArmor Complete Camera Cleaning Kit',
    slug: 'pgx-lensarmor-camera-cleaning-kit',
    sku: 'PGX-CAM-010',
    categorySlug: 'cameras-drones-creator',
    price: 24.00,
    comparePrice: 39.00,
    visualType: 'drone',
    shortDesc: 'Professional sensor and optic cleaning kit: rocket air blower, carbon lens pen, and microfiber cloths.',
    features: ['Silicone filtered rocket air dust blower', 'Dual-ended carbon tip & soft brush lens pen', 'Non-streak alcohol-free lens cleaning spray', '10x individually sealed vacuum microfiber cloths', 'Full-frame camera sensor cleaning swabs (6-pack)'],
  },

  // ─── 6. AI Tools & Automation (10) ──────────────────────────────────
  {
    name: 'AI Business Chatbot Pro',
    slug: 'ai-business-chatbot-pro',
    sku: 'PGX-AI-001',
    categorySlug: 'ai-tools-automation',
    price: 49.00,
    comparePrice: 79.00,
    visualType: 'softwarebox',
    shortDesc: 'Automate customer support, lead capture, and interactive workflows with zero-latency LLM integration.',
    features: ['Multi-turn conversation memory', 'Custom knowledge base ingestion (PDF, Web, Docs)', 'One-click widget embed for Next.js & React', 'OpenAI, Anthropic & local Ollama support', 'Full conversation analytics dashboard'],
  },
  {
    name: 'Autonomous Agent Workflow Engine',
    slug: 'autonomous-agent-workflow-engine',
    sku: 'PGX-AI-002',
    categorySlug: 'ai-tools-automation',
    price: 89.00,
    comparePrice: 129.00,
    visualType: 'softwarebox',
    shortDesc: 'Multi-agent orchestration framework for asynchronous background research, scraping, and report generation.',
    features: ['Hierarchical agent swarm coordination', 'Integrated web scraping and file synthesis', 'Self-correcting error handling loops', 'TypeScript and Python SDK included', 'Production Docker deployment recipes'],
  },
  {
    name: 'Voice AI Studio & Generator Suite',
    slug: 'voice-ai-studio-suite',
    sku: 'PGX-AI-003',
    categorySlug: 'ai-tools-automation',
    price: 39.00,
    comparePrice: 69.00,
    visualType: 'softwarebox',
    shortDesc: 'Ultra-realistic neural voice synthesis, real-time voice changer, and automated podcast studio pipeline.',
    features: ['100+ expressive studio voices', 'Emotion and pitch modulation controls', 'Real-time WebSocket audio streaming', 'Multi-language translation dubbing', 'Commercial royalty-free audio export'],
  },
  {
    name: 'LangChain RAG Knowledge Base Builder',
    slug: 'langchain-rag-knowledge-builder',
    sku: 'PGX-AI-004',
    categorySlug: 'ai-tools-automation',
    price: 59.00,
    comparePrice: 99.00,
    visualType: 'softwarebox',
    shortDesc: 'Enterprise Retrieval-Augmented Generation pipeline with hybrid vector & keyword search.',
    features: ['pgvector & Pinecone integration', 'Semantic chunking & metadata enrichment', 'Reranking model support (Cohere)', 'Sub-50ms query response time', 'Complete REST API & Next.js admin portal'],
  },
  {
    name: 'Midjourney Master Prompt System',
    slug: 'midjourney-master-prompt-system',
    sku: 'PGX-AI-005',
    categorySlug: 'ai-tools-automation',
    price: 29.00,
    comparePrice: 49.00,
    visualType: 'softwarebox',
    shortDesc: 'Comprehensive prompt engineering architecture for photorealistic UI mockups, 3D icons, and brand graphics.',
    features: ['2,500+ tested production prompts', 'Camera lens and lighting modifier matrix', 'Style consistency seed parameters', 'Negative prompt filter presets', 'Notion database & Figma file included'],
  },
  {
    name: 'Whisper Real-Time Audio Transcriber API',
    slug: 'whisper-realtime-transcriber-api',
    sku: 'PGX-AI-006',
    categorySlug: 'ai-tools-automation',
    price: 45.00,
    comparePrice: 75.00,
    visualType: 'softwarebox',
    shortDesc: 'Self-hosted audio-to-text API microservice optimized for low-latency live meetings and voice notes.',
    features: ['GPU-accelerated Faster-Whisper backend', 'Automatic speaker diarization', 'Punctuation and casing correction', 'WebSocket streaming and chunked upload', 'Pre-built React audio recorder hook'],
  },
  {
    name: 'AI Copywriting & Landing Page Engine',
    slug: 'ai-seo-copywriting-engine',
    sku: 'PGX-AI-007',
    categorySlug: 'ai-tools-automation',
    price: 35.00,
    comparePrice: 59.00,
    visualType: 'softwarebox',
    shortDesc: 'Automated conversion-focused copy generator trained on top-converting SaaS homepages and ads.',
    features: ['PAS, AIDA, and FAB copywriting frameworks', 'SEO keyword density validator', 'Direct Webflow & WordPress export', 'Multi-variant A/B headline generator', '1-click tone-of-voice switcher'],
  },
  {
    name: 'Vision Object Detection API Kit',
    slug: 'vision-ai-object-detection-kit',
    sku: 'PGX-AI-008',
    categorySlug: 'ai-tools-automation',
    price: 69.00,
    comparePrice: 119.00,
    visualType: 'softwarebox',
    shortDesc: 'Fast computer vision inference microservice for document OCR, bounding boxes, and image segmentation.',
    features: ['YOLOv10 and Florence-2 pre-trained weights', 'Webcam and CCTV RTSP stream support', 'Dockerized REST & gRPC endpoints', 'Under 30ms latency on modern GPUs', 'Full Swagger documentation'],
  },
  {
    name: 'AI Support Ticket Auto-Responder',
    slug: 'ai-support-ticket-automator',
    sku: 'PGX-AI-009',
    categorySlug: 'ai-tools-automation',
    price: 55.00,
    comparePrice: 89.00,
    visualType: 'softwarebox',
    shortDesc: 'Smart Zendesk & Crisp webhook daemon that drafts, categorizes, and answers customer tickets with 95% accuracy.',
    features: ['Sentiment and urgency triage', 'Human-in-the-loop review workflow', 'Automated refund and license verification', 'Multi-language auto-translation', 'Full audit logging and analytics'],
  },
  {
    name: 'Local LLM Desktop Assistant (Electron)',
    slug: 'local-llm-desktop-assistant',
    sku: 'PGX-AI-010',
    categorySlug: 'ai-tools-automation',
    price: 49.00,
    comparePrice: 79.00,
    visualType: 'softwarebox',
    shortDesc: 'Private desktop application for running Llama 3, Mistral, and DeepSeek locally without internet or subscriptions.',
    features: ['100% offline private processing', 'GPU acceleration (Metal, CUDA, ROCm)', 'Local file context & code review mode', 'Global keyboard shortcut trigger', 'Cross-platform macOS, Windows & Linux'],
  },

  // ─── 7. Website Templates (10) ──────────────────────────────────────
  {
    name: 'E-commerce Website Kit',
    slug: 'e-commerce-website-kit',
    sku: 'PGX-TMP-001',
    categorySlug: 'website-templates',
    price: 149.00,
    comparePrice: 199.00,
    visualType: 'laptop',
    shortDesc: 'Production-ready Next.js 15 e-commerce storefront with Stripe, Tailwind CSS, and headless API architecture.',
    features: ['Next.js 15 App Router & React 19', 'Stripe checkout & Universal Wallet bridge', 'Filterable catalog with full-text search', 'Mobile-first responsive drawer cart', 'Complete Admin dashboard included'],
  },
  {
    name: 'SaaS Modern Landing Page System',
    slug: 'saas-landing-page-system',
    sku: 'PGX-TMP-002',
    categorySlug: 'website-templates',
    price: 49.00,
    comparePrice: 89.00,
    visualType: 'laptop',
    shortDesc: 'High-converting dark-mode SaaS landing page template with Framer Motion 3D animations and pricing grids.',
    features: ['3D glassmorphic interactive cards', 'Framer Motion scroll reveal effects', 'Tiered pricing calculator toggle', 'Customer testimonial carousel', 'Lighthouse 100/100 performance score'],
  },
  {
    name: 'Portfolio & Creative Agency Template',
    slug: 'portfolio-agency-template',
    sku: 'PGX-TMP-003',
    categorySlug: 'website-templates',
    price: 39.00,
    comparePrice: 69.00,
    visualType: 'laptop',
    shortDesc: 'Editorial showcase template for senior developers, designers, creative studios, and product architects.',
    features: ['Dynamic case study layouts', 'Interactive cursor and magnetic buttons', 'Smooth Lenis inertial scrolling', 'MDX project blogging engine', 'Automated contact inquiry form'],
  },
  {
    name: 'Fintech & Crypto Dashboard Theme',
    slug: 'fintech-crypto-dashboard-theme',
    sku: 'PGX-TMP-004',
    categorySlug: 'website-templates',
    price: 59.00,
    comparePrice: 99.00,
    visualType: 'laptop',
    shortDesc: 'Sophisticated financial technology web dashboard with real-time charts, transaction logs, and wallet cards.',
    features: ['TradingView & Recharts candlestick charts', 'Currency converter & transfer modal', 'Dark & cyber neon color themes', 'Role-based access view templates', 'WCAG AA accessible components'],
  },
  {
    name: 'Directory & Job Board Platform Kit',
    slug: 'directory-job-board-platform',
    sku: 'PGX-TMP-005',
    categorySlug: 'website-templates',
    price: 79.00,
    comparePrice: 129.00,
    visualType: 'laptop',
    shortDesc: 'Monetized niche job board and listing directory template with paid posting, search filters, and company profiles.',
    features: ['Stripe payment for featured posts', 'Custom filter attributes & geo-location', 'Candidate resume submission portal', 'Automated email alerts for subscribers', 'SEO schema for Google Jobs'],
  },
  {
    name: 'Minimalist Blog & Newsletter Starter',
    slug: 'minimalist-blog-newsletter-starter',
    sku: 'PGX-TMP-006',
    categorySlug: 'website-templates',
    price: 29.00,
    comparePrice: 49.00,
    visualType: 'laptop',
    shortDesc: 'Blazing fast technical blogging template with syntax highlighting, reading time, and Substack-style newsletter.',
    features: ['Next.js 15 Contentlayer & MDX', 'Prism syntax highlighting with copy button', 'Automatic table of contents generator', 'Mailchimp & Beehiiv integration', 'OpenGraph image dynamic generation'],
  },
  {
    name: 'Real Estate & Property Showcase Theme',
    slug: 'real-estate-property-portal',
    sku: 'PGX-TMP-007',
    categorySlug: 'website-templates',
    price: 69.00,
    comparePrice: 109.00,
    visualType: 'laptop',
    shortDesc: 'Luxury property listing template with interactive map views, floor plans, and virtual tour scheduling.',
    features: ['Mapbox GL interactive property map', 'High-res image gallery with lightbox', 'Mortgage payment calculator widget', 'Agent inquiry contact modal', 'Mobile-optimized touch sliders'],
  },
  {
    name: 'Developer Docs & Knowledgebase Theme',
    slug: 'developer-docs-knowledgebase-theme',
    sku: 'PGX-TMP-008',
    categorySlug: 'website-templates',
    price: 35.00,
    comparePrice: 59.00,
    visualType: 'laptop',
    shortDesc: 'Stripe-grade documentation site system with hierarchical navigation, Algolia search, and code tabs.',
    features: ['Multi-language code tabs (cURL, JS, Python)', 'Algolia DocSearch configuration', 'API endpoint reference layouts', 'Dark / light theme sync with system', 'Zero-config Markdown authoring'],
  },
  {
    name: 'Event, Summit & Conference Landing',
    slug: 'event-summit-conference-landing',
    sku: 'PGX-TMP-009',
    categorySlug: 'website-templates',
    price: 29.00,
    comparePrice: 49.00,
    visualType: 'laptop',
    shortDesc: 'Vibrant event landing page with speaker grids, agenda timeline schedule, and ticket checkout tiers.',
    features: ['Interactive multi-track schedule tab', 'Keynote speaker card modals', 'Tiered ticket selection pricing table', 'Sponsor logo banner matrix', 'Countdown timer with timezone detection'],
  },
  {
    name: 'Multipurpose Tailwind Admin Panel',
    slug: 'multipurpose-tailwind-admin-panel',
    sku: 'PGX-TMP-010',
    categorySlug: 'website-templates',
    price: 49.00,
    comparePrice: 79.00,
    visualType: 'laptop',
    shortDesc: 'Clean, production-tested admin dashboard with 50+ pre-built pages, data tables, and form wizards.',
    features: ['Data tables with sorting & pagination', 'Multi-step form wizard components', 'Authentication screens (Login, 2FA, Reset)', 'ApexCharts analytics dashboard', 'Tailwind CSS v4 & Lucide icons'],
  },

  // ─── 8. Software & Licenses (10) ────────────────────────────────────
  {
    name: 'CloudSync SaaS Desktop Client',
    slug: 'cloudsync-saas-client',
    sku: 'PGX-SFT-001',
    categorySlug: 'software-licenses',
    price: 59.00,
    comparePrice: 99.00,
    visualType: 'softwarebox',
    shortDesc: 'Native desktop application for continuous encrypted file synchronization to S3, Backblaze, and custom clouds.',
    features: ['End-to-end AES-256 GCM encryption', 'Differential binary sync engine', 'Selective folder exclusion filters', 'Minimal RAM footprint (<40MB)', 'Lifetime license with 1-year updates'],
  },
  {
    name: 'DevFlow Pro IDE Extension',
    slug: 'devflow-pro-ide-extension',
    sku: 'PGX-SFT-002',
    categorySlug: 'software-licenses',
    price: 29.00,
    comparePrice: 49.00,
    visualType: 'softwarebox',
    shortDesc: 'VS Code and Cursor productivity extension for visual git conflicts, automated docstrings, and scratchpads.',
    features: ['Visual 3-way Git merge conflict resolver', 'Instant JSDoc / TSDoc AI generator', 'Persistent ephemeral scratchpad notes', 'Custom snippet manager with cloud sync', 'Keyboard-first command palette'],
  },
  {
    name: 'API Gateway & Traffic Shaper Engine',
    slug: 'api-traffic-shaper-gateway',
    sku: 'PGX-SFT-003',
    categorySlug: 'software-licenses',
    price: 79.00,
    comparePrice: 129.00,
    visualType: 'softwarebox',
    shortDesc: 'High-performance reverse proxy daemon with sliding-window rate limiting, JWT validation, and circuit breakers.',
    features: ['Written in Rust for sub-millisecond overhead', 'Redis cluster token bucket rate limiting', 'Automated SSL termination with Let\'s Encrypt', 'OpenTelemetry metrics & Jaeger tracing', 'Single binary zero-dependency install'],
  },
  {
    name: 'GitCommit AI Terminal Assistant',
    slug: 'gitcommit-ai-terminal-assistant',
    sku: 'PGX-SFT-004',
    categorySlug: 'software-licenses',
    price: 25.00,
    comparePrice: 45.00,
    visualType: 'softwarebox',
    shortDesc: 'CLI utility that inspects staged diffs and generates Conventional Commits messages with one keypress.',
    features: ['Conventional commits standard (feat, fix, refactor)', 'Ticket number auto-detection from branch name', 'Interactive staging and hunk selection', 'Works with OpenAI, Claude or local LLM', 'Cross-platform zsh, bash, fish, and powershell'],
  },
  {
    name: 'ScreenCapture & Video Studio Desktop',
    slug: 'screencapture-video-annotation-studio',
    sku: 'PGX-SFT-005',
    categorySlug: 'software-licenses',
    price: 39.00,
    comparePrice: 69.00,
    visualType: 'softwarebox',
    shortDesc: 'Screen recording and screenshot utility with auto-zooming camera tracking, audio cleanup, and instant share links.',
    features: ['Automatic cursor follow & smooth zoom', 'Studio sound mic noise suppression', 'Instant MP4, WebM & GIF export', 'Cloud upload with custom domain URL', 'Annotation arrows, blur tools & magnifier'],
  },
  {
    name: 'Markdown Vault Knowledge Desktop',
    slug: 'markdown-vault-knowledge-desktop',
    sku: 'PGX-SFT-006',
    categorySlug: 'software-licenses',
    price: 35.00,
    comparePrice: 59.00,
    visualType: 'softwarebox',
    shortDesc: 'Supercharged local-first note-taking and knowledge graph application with bi-directional wikilinks.',
    features: ['Instant local text search across 100k notes', 'Interactive 3D knowledge graph visualizer', 'Full LaTeX math & KaTeX rendering', 'Git automatic backup integration', 'Vim keybinding mode support'],
  },
  {
    name: 'Database Schema Visualizer Pro',
    slug: 'database-schema-visualizer-pro',
    sku: 'PGX-SFT-007',
    categorySlug: 'software-licenses',
    price: 49.00,
    comparePrice: 79.00,
    visualType: 'softwarebox',
    shortDesc: 'Reverse-engineer PostgreSQL, MySQL, and SQLite databases into interactive ER diagrams and SQL migrations.',
    features: ['Live database introspection', 'Interactive drag-and-drop table canvas', 'Prisma & Drizzle schema export', 'Foreign key dependency tree analyzer', 'PDF and SVG high-res schema export'],
  },
  {
    name: 'Docker Container Monitor GUI',
    slug: 'docker-container-monitor-gui',
    sku: 'PGX-SFT-008',
    categorySlug: 'software-licenses',
    price: 39.00,
    comparePrice: 69.00,
    visualType: 'softwarebox',
    shortDesc: 'Lightweight desktop management GUI for Docker containers, images, volumes, and multi-container logs.',
    features: ['Real-time CPU and memory graphs per container', 'Combined multi-service terminal logs', 'One-click image cleanup & volume pruning', 'Docker Compose file visual editor', 'Native Apple Silicon and Windows x64 build'],
  },
  {
    name: 'REST & GraphQL API Client CLI',
    slug: 'rest-graphql-api-client-cli',
    sku: 'PGX-SFT-009',
    categorySlug: 'software-licenses',
    price: 29.00,
    comparePrice: 49.00,
    visualType: 'softwarebox',
    shortDesc: 'Modern terminal-based HTTP client with syntax colored response viewers, history replay, and environment variables.',
    features: ['TUI interface with interactive fuzzy search', 'OAuth2 and Bearer token auto-refresh', 'GraphQL schema autocomplete & docs', 'cURL command import and export', 'Scriptable assertion test runner'],
  },
  {
    name: 'Network Packet Security Inspector',
    slug: 'network-packet-security-inspector',
    sku: 'PGX-SFT-010',
    categorySlug: 'software-licenses',
    price: 89.00,
    comparePrice: 149.00,
    visualType: 'softwarebox',
    shortDesc: 'Enterprise packet capture and protocol analyzer for security engineers, network admins, and penetration testers.',
    features: ['PCAP file deep packet inspection', 'TLS handshake anomaly detection', 'DNS query tunneling detection engine', 'Real-time bandwidth usage by IP', 'Automated security report generation'],
  },

  // ─── 9. Digital Marketing (10) ──────────────────────────────────────
  {
    name: 'Marketing Template Bundle',
    slug: 'marketing-template-bundle',
    sku: 'PGX-MKT-001',
    categorySlug: 'digital-marketing',
    price: 39.00,
    comparePrice: 59.00,
    visualType: 'softwarebox',
    shortDesc: 'All-in-one social media templates, ad copy matrices, and viral launch playbooks for creators and startups.',
    features: ['300+ Figma social post templates', 'Story and Reel animated video templates', 'Proven ad copy frameworks for Meta & Google', 'Launch week day-by-day checklist', 'Canva and Figma editable source files'],
  },
  {
    name: 'SEO Growth Blueprint 2026',
    slug: 'seo-growth-blueprint-2026',
    sku: 'PGX-MKT-002',
    categorySlug: 'digital-marketing',
    price: 24.00,
    comparePrice: 49.00,
    visualType: 'softwarebox',
    shortDesc: 'Actionable step-by-step roadmap to scale organic traffic in the age of AI search and Google SGE.',
    features: ['Programmatic SEO architecture guide', 'Topical authority topic cluster templates', 'Core Web Vitals technical checklist', 'Backlink outreach email swipe files', 'SGE optimization ranking factors breakdown'],
  },
  {
    name: 'Viral Ad Hooks & TikTok Scripts Pack',
    slug: 'viral-ad-hooks-scripts',
    sku: 'PGX-MKT-003',
    categorySlug: 'digital-marketing',
    price: 19.00,
    comparePrice: 39.00,
    visualType: 'softwarebox',
    shortDesc: '500+ battle-tested short-form video hooks designed to stop the scroll and double your watch time.',
    features: ['Categorized by niche (SaaS, E-com, Coaching)', 'First 3-second visual cues & sound suggestions', 'Call-to-action closing templates', 'Storyboarding grid worksheet', 'Spreadsheet and Notion workspace included'],
  },
  {
    name: 'Email Newsletter Launch Kit',
    slug: 'email-newsletter-launch-kit',
    sku: 'PGX-MKT-004',
    categorySlug: 'digital-marketing',
    price: 29.00,
    comparePrice: 49.00,
    visualType: 'softwarebox',
    shortDesc: 'Proven email welcome sequences, re-engagement campaigns, and promotional broadcast templates with 48% open rates.',
    features: ['7-part automated welcome onboarding series', 'Black Friday & flash sale sequences', 'Subject line formulas with high CTR', 'Klaviyo, Mailchimp & ConvertKit formats', 'Deliverability & SPF/DKIM setup guide'],
  },
  {
    name: 'Sales Funnel High-Converting Pack',
    slug: 'sales-funnel-high-converting-pack',
    sku: 'PGX-MKT-005',
    categorySlug: 'digital-marketing',
    price: 49.00,
    comparePrice: 89.00,
    visualType: 'softwarebox',
    shortDesc: 'Complete high-ticket sales funnel architecture: VSL page, application form, booking calendar, and thank you flow.',
    features: ['Video Sales Letter (VSL) slide deck', 'Two-step order bump checkout page', 'One-click post-purchase upsell layout', 'Automated SMS & email booking reminders', 'Figma wireframes & React code components'],
  },
  {
    name: 'Google Ads ROI Campaign Matrix',
    slug: 'google-ads-roi-campaign-matrix',
    sku: 'PGX-MKT-006',
    categorySlug: 'digital-marketing',
    price: 39.00,
    comparePrice: 69.00,
    visualType: 'softwarebox',
    shortDesc: 'Performance Max and search ad structure sheet that eliminated wasted ad spend across $2M+ in client ad campaigns.',
    features: ['Negative keyword master list (5,000+ words)', 'Single-keyword ad group (SKAG) templates', 'Ad copy asset variations matrix', 'Target ROAS bidding strategy calculator', 'Looker Studio live reporting dashboard'],
  },
  {
    name: 'B2B Cold Outreach Email Master File',
    slug: 'b2b-cold-outreach-email-vault',
    sku: 'PGX-MKT-007',
    categorySlug: 'digital-marketing',
    price: 29.00,
    comparePrice: 49.00,
    visualType: 'softwarebox',
    shortDesc: 'Field-tested cold email templates that booked calls with Fortune 500 decision makers and series-A founders.',
    features: ['40+ industry personalized intro hooks', 'Objection handling response scripts', 'Multi-step follow-up sequences', 'Inbox warm-up and spam-filter checklist', 'CSV import template for Instantly & Smartlead'],
  },
  {
    name: 'Content Repurposing Playbook',
    slug: 'content-repurposing-playbook',
    sku: 'PGX-MKT-008',
    categorySlug: 'digital-marketing',
    price: 25.00,
    comparePrice: 45.00,
    visualType: 'softwarebox',
    shortDesc: 'Turn 1 podcast or long video into 20 social posts, 5 Twitter threads, 3 LinkedIn carousels, and 1 newsletter.',
    features: ['Automated transcription to thread workflow', 'LinkedIn PDF carousel Figma templates', 'Video clip timestamp cutter checklist', 'Editorial content calendar spreadsheet', 'Notion Kanban content pipeline system'],
  },
  {
    name: 'Influencer Partnership CRM System',
    slug: 'influencer-partnership-crm-system',
    sku: 'PGX-MKT-009',
    categorySlug: 'digital-marketing',
    price: 35.00,
    comparePrice: 59.00,
    visualType: 'softwarebox',
    shortDesc: 'Manage hundreds of creator partnerships, affiliate links, contract stages, and ROI tracking in one unified tool.',
    features: ['Influencer tier & rate card tracker', 'DM and email outreach pitch templates', 'Affiliate coupon code attribution table', 'Sample product seeding tracker', 'Automated payout calculation sheet'],
  },
  {
    name: 'Omnichannel Social Automation Scripts',
    slug: 'omnichannel-social-automation-scripts',
    sku: 'PGX-MKT-010',
    categorySlug: 'digital-marketing',
    price: 45.00,
    comparePrice: 79.00,
    visualType: 'softwarebox',
    shortDesc: 'Python & Node.js automation scripts that schedule, format, and post content to X, LinkedIn, and Threads simultaneously.',
    features: ['Direct API posting without third-party fees', 'Automatic thread splitting with emojis', 'Media upload with aspect ratio formatting', 'Webhook listener for scheduled triggers', 'Docker container for easy 24/7 cloud running'],
  },

  // ─── 10. Online Courses & E-books (10) ──────────────────────────────
  {
    name: 'Digital Marketing Masterclass',
    slug: 'digital-marketing-masterclass',
    sku: 'PGX-CRS-001',
    categorySlug: 'online-courses-ebooks',
    price: 29.00,
    comparePrice: 49.00,
    visualType: 'book',
    shortDesc: 'Comprehensive video course covering performance marketing, growth hacking, and conversion optimization.',
    features: ['12 hours of high-definition video lessons', 'Real-world campaign budget case studies', 'Downloadable spreadsheets & swipe files', 'Certificate of completion with digital badge', 'Private Discord community access'],
  },
  {
    name: 'Full-Stack Next.js Architecture Bootcamp',
    slug: 'full-stack-nextjs-bootcamp',
    sku: 'PGX-CRS-002',
    categorySlug: 'online-courses-ebooks',
    price: 49.00,
    comparePrice: 89.00,
    visualType: 'book',
    shortDesc: 'Build and deploy production SaaS with Next.js 15, Prisma ORM, Server Actions, Stripe, and PostgreSQL.',
    features: ['18 modular project-based chapters', 'Full GitHub repository source code with commit history', 'Authentication, multi-tenancy & billing patterns', 'Zero to production on Vercel and Railway', 'Lifetime updates as Next.js evolves'],
  },
  {
    name: 'AI Engineering & Prompt Systems Handbook',
    slug: 'ai-engineering-handbook',
    sku: 'PGX-CRS-003',
    categorySlug: 'online-courses-ebooks',
    price: 19.00,
    comparePrice: 39.00,
    visualType: 'book',
    shortDesc: 'The definitive 280-page engineer\'s guide to LLM evaluations, RAG architectures, and fine-tuning models.',
    features: ['PDF, ePub and interactive web format', 'Token budgeting and latency optimization', 'System prompt engineering best practices', 'Vector similarity math simplified', 'Practical Python code examples on GitHub'],
  },
  {
    name: 'Microservices with Go & Docker Mastery',
    slug: 'microservices-go-docker-mastery',
    sku: 'PGX-CRS-004',
    categorySlug: 'online-courses-ebooks',
    price: 59.00,
    comparePrice: 99.00,
    visualType: 'book',
    shortDesc: 'Build resilient distributed systems in Golang with gRPC, RabbitMQ, Docker, and Kubernetes deployment.',
    features: ['High-throughput concurrent Go patterns', 'Event-driven architecture with message queues', 'Distributed tracing and OpenTelemetry', 'Kubernetes Helm chart packaging', 'Production stress testing with k6'],
  },
  {
    name: 'Advanced CSS & Tailwind Animations',
    slug: 'advanced-css-tailwind-animations',
    sku: 'PGX-CRS-005',
    categorySlug: 'online-courses-ebooks',
    price: 25.00,
    comparePrice: 45.00,
    visualType: 'book',
    shortDesc: 'Master fluid typography, complex CSS grid layouts, and buttery 60fps micro-interactions with Tailwind.',
    features: ['Interactive sandbox component playground', 'Custom Tailwind v4 plugin authoring', 'SVG path animations & morphing', 'GPU-accelerated transform tricks', 'Full source code of 40+ UI components'],
  },
  {
    name: 'Modern TypeScript Patterns & Practices',
    slug: 'modern-typescript-patterns-handbook',
    sku: 'PGX-CRS-006',
    categorySlug: 'online-courses-ebooks',
    price: 29.00,
    comparePrice: 49.00,
    visualType: 'book',
    shortDesc: 'Eliminate `any` forever with advanced generics, template literal types, discriminated unions, and Zod.',
    features: ['Type-level programming challenges with solutions', 'Zod schema inference and type narrowing', 'Clean architecture and domain modeling', 'TypeScript 5.x decorators & const type parameters', 'Downloadable PDF cheat sheet bundle'],
  },
  {
    name: 'The $100k Solopreneur Playbook',
    slug: 'the-100k-solopreneur-playbook',
    sku: 'PGX-CRS-007',
    categorySlug: 'online-courses-ebooks',
    price: 35.00,
    comparePrice: 65.00,
    visualType: 'book',
    shortDesc: 'How to build, launch, and monetize micro-SaaS and digital info-products as a one-person business.',
    features: ['Idea validation matrix & customer interviews', 'Tech stack selection for extreme speed', 'Stripe pricing models & packaging', 'Zero-budget organic launch strategies', 'Real revenue screenshots and timeline teardown'],
  },
  {
    name: 'System Design Interview Bible',
    slug: 'system-design-interview-bible',
    sku: 'PGX-CRS-008',
    categorySlug: 'online-courses-ebooks',
    price: 39.00,
    comparePrice: 69.00,
    visualType: 'book',
    shortDesc: 'Crush the FAANG system design interview with detailed architectures for Twitter, Uber, Netflix, and WhatsApp.',
    features: ['25 full system architecture case studies', 'Capacity estimation calculators', 'Database sharding and caching strategies', 'High-res scalable system diagrams', 'Mock interview recording video analyses'],
  },
  {
    name: 'React Native & Expo Mobile Mastery',
    slug: 'react-native-mobile-architecture',
    sku: 'PGX-CRS-009',
    categorySlug: 'online-courses-ebooks',
    price: 49.00,
    comparePrice: 89.00,
    visualType: 'book',
    shortDesc: 'Build cross-platform iOS and Android apps with Expo Router, NativeWind, SQLite, and in-app purchases.',
    features: ['Expo Router v3 file-based routing', 'RevenueCat in-app subscriptions integration', 'Offline-first database sync with WatermelonDB', 'Smooth 120fps gesture animations', 'App Store and Google Play publishing walkthrough'],
  },
  {
    name: 'Cyber Security & Defensive Operations',
    slug: 'cyber-security-defensive-ops-course',
    sku: 'PGX-CRS-010',
    categorySlug: 'online-courses-ebooks',
    price: 59.00,
    comparePrice: 99.00,
    visualType: 'book',
    shortDesc: 'Hands-on training in threat modeling, OWASP Top 10 web vulnerabilities, penetration testing, and cloud hardening.',
    features: ['Interactive vulnerable lab environments', 'Burp Suite & Wireshark practical tutorials', 'SQL injection and XSS mitigation', 'IAM policies and secret management', 'Defensive security certification prep'],
  },
];

async function main() {
  console.log('🚀 Generating 100 Amazon-style white background SVG product images...');
  for (const p of PRODUCTS) {
    const svgContent = renderAmazonWhiteSvg(p);
    const filePath = path.join(svgDir, `${p.slug}.svg`);
    fs.writeFileSync(filePath, svgContent, 'utf8');
  }
  console.log(`✅ Saved 100 Amazon-style clean white SVGs to frontend/public/products/`);

  console.log('🔄 Connecting to PostgreSQL database...');
  const pool = new Pool({ connectionString: DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Upsert Categories
    console.log('Syncing categories in database...');
    const catMap = new Map();
    for (const cat of CATEGORIES) {
      const c = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description, isActive: true },
        create: { name: cat.name, slug: cat.slug, description: cat.description, isActive: true },
      });
      catMap.set(cat.slug, c.id);
    }
    console.log(`Synced ${catMap.size} categories.`);

    // 2. Clear old product relations and products
    console.log('Purging previous products...');
    await prisma.productImage.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.product.deleteMany({});

    // 3. Insert 100 products
    console.log(`Inserting 100 products (50 Gadgets + 50 Digital)...`);
    let inserted = 0;

    for (const item of PRODUCTS) {
      const categoryId = catMap.get(item.categorySlug);
      if (!categoryId) {
        console.warn(`Category slug not found: ${item.categorySlug}`);
        continue;
      }

      const isFeatured = [
        'pgx-ultra-titanium-smartwatch',
        'pgx-cyberdeck-mechanical-keyboard',
        'pgx-studioone-usb-microphone',
        'ai-business-chatbot-pro',
        'e-commerce-website-kit',
      ].includes(item.slug);

      const isHot = [
        'pgx-ultra-titanium-smartwatch',
        'pgx-anc-pro-wireless-earbuds',
        'pgx-turbodrive-2tb-nvme-ssd',
        'ai-business-chatbot-pro',
      ].includes(item.slug);

      // Rich Amazon-style HTML description
      const richHtml = `
<div class="product-editorial-overview space-y-6">
  <div class="rounded-2xl bg-slate-50 p-6 text-slate-800 border border-slate-200">
    <h3 class="text-xl font-bold font-sans tracking-tight text-slate-900 mb-2">${item.name}</h3>
    <p class="text-slate-600 text-sm leading-relaxed">${item.shortDesc}</p>
  </div>

  <div>
    <h3 class="text-lg font-bold text-slate-900 mb-3">Key Features &amp; Technical Highlights</h3>
    <ul class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
      ${item.features.map(f => `<li class="flex items-start gap-2 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200"><span class="text-[#7c3aed] font-bold shrink-0">✓</span><span>${f}</span></li>`).join('')}
    </ul>
  </div>

  <div class="border-t border-slate-200 pt-5">
    <h3 class="text-lg font-bold text-slate-900 mb-2">Package Contents &amp; Genuine Guarantee</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600">
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <strong class="block text-slate-900 font-bold mb-0.5">📦 Sealed Retail Box</strong>
        <span>Official factory packaging</span>
      </div>
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <strong class="block text-slate-900 font-bold mb-0.5">🛡️ 2-Year Warranty</strong>
        <span>Full replacement coverage</span>
      </div>
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <strong class="block text-slate-900 font-bold mb-0.5">⚡ Fast Tracked Dispatch</strong>
        <span>Worldwide express delivery</span>
      </div>
    </div>
  </div>
</div>
`;

      const product = await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          price: item.price,
          comparePrice: item.comparePrice,
          stock: 999,
          shortDesc: item.shortDesc,
          description: richHtml,
          isFeatured,
          isHot,
          isActive: true,
          categoryId,
        },
      });

      // 100% White Background Image (Local zero-broken SVG)
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `/products/${item.slug}.svg`,
          alt: `${item.name} Amazon White Background Studio Shot`,
          sortOrder: 0,
        },
      });

      // Standard and Pro Variants
      const basePrice = Number(item.price);
      await prisma.productVariant.createMany({
        data: [
          {
            productId: product.id,
            name: 'Standard Edition',
            price: basePrice,
            comparePrice: Number(item.comparePrice),
            stock: 999,
            sku: `${item.sku}-STD`,
            isActive: true,
          },
          {
            productId: product.id,
            name: 'Pro / Extended Bundle (+ Accessories)',
            price: Math.round(basePrice * 1.35),
            comparePrice: Math.round(Number(item.comparePrice) * 1.35),
            stock: 999,
            sku: `${item.sku}-PRO`,
            isActive: true,
          },
        ],
      });

      inserted++;
    }

    console.log(`🎉 SUCCESS! Seeded ${inserted} products with Amazon-style white background images!`);
  } catch (err) {
    console.error('❌ Error seeding products:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { CATEGORIES, PRODUCTS };
