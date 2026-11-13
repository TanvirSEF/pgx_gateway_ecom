const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../../frontend/public/products');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

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

function generateSvg(product) {
  const name = escapeXml(product.name);
  const price = `$${product.price.toFixed(2)}`;
  const sku = product.sku || 'PGX-PROD';
  const cat = product.categorySlug;

  // Split name into 1 or 2 lines
  const words = name.split(' ');
  let line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
  let line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
  if (words.length <= 3) {
    line1 = name;
    line2 = '';
  }

  // Color schemes by category
  let c1 = '#0c0728', c2 = '#1e1045', accent = '#8b5cf6', badgeBg = '#7c3aed', tag = 'DIGITAL ASSET';
  let graphicSvg = '';

  if (cat === 'ai-tools-automation') {
    c1 = '#070b1e'; c2 = '#1b0e3e'; accent = '#06b6d4'; badgeBg = '#7c3aed'; tag = 'AI & AUTOMATION';
    graphicSvg = `
      <!-- AI Robot / Neural Core -->
      <g transform="translate(480, 160)">
        <circle cx="140" cy="140" r="120" fill="url(#glowGrad)" opacity="0.15" />
        <rect x="20" y="20" width="240" height="240" rx="36" fill="#0d1424" stroke="${accent}" stroke-width="2" stroke-opacity="0.4" />
        
        <!-- Neural Nodes -->
        <circle cx="70" cy="70" r="14" fill="${accent}" opacity="0.9" />
        <circle cx="210" cy="70" r="14" fill="#a855f7" opacity="0.9" />
        <circle cx="140" cy="140" r="22" fill="#3b82f6" />
        <circle cx="70" cy="210" r="14" fill="#a855f7" opacity="0.9" />
        <circle cx="210" cy="210" r="14" fill="${accent}" opacity="0.9" />
        
        <!-- Node Lines -->
        <line x1="70" y1="70" x2="140" y2="140" stroke="${accent}" stroke-width="3" stroke-opacity="0.6" />
        <line x1="210" y1="70" x2="140" y2="140" stroke="#a855f7" stroke-width="3" stroke-opacity="0.6" />
        <line x1="70" y1="210" x2="140" y2="140" stroke="#a855f7" stroke-width="3" stroke-opacity="0.6" />
        <line x1="210" y1="210" x2="140" y2="140" stroke="${accent}" stroke-width="3" stroke-opacity="0.6" />
        <line x1="70" y1="70" x2="210" y2="70" stroke="#ffffff" stroke-width="2" stroke-opacity="0.2" stroke-dasharray="4" />
        <line x1="70" y1="210" x2="210" y2="210" stroke="#ffffff" stroke-width="2" stroke-opacity="0.2" stroke-dasharray="4" />

        <!-- AI Core Symbol -->
        <path d="M130 130 L150 130 L150 150 L130 150 Z" fill="#ffffff" />
        <text x="140" y="145" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#0d1424" text-anchor="middle">AI</text>

        <!-- Prompt Terminal Box -->
        <rect x="-60" y="210" width="240" height="64" rx="16" fill="#060913" stroke="#334155" stroke-width="1.5" />
        <circle cx="-42" cy="226" r="4" fill="#ef4444" />
        <circle cx="-28" cy="226" r="4" fill="#eab308" />
        <circle cx="-14" cy="226" r="4" fill="#22c55e" />
        <text x="-42" y="254" font-family="monospace" font-size="11" fill="#38bdf8">&gt; agent.execute()</text>
        <rect x="74" y="244" width="8" height="12" fill="#38bdf8" />
      </g>
    `;
  } else if (cat === 'website-templates') {
    c1 = '#090d16'; c2 = '#0e1e38'; accent = '#3b82f6'; badgeBg = '#2563eb'; tag = 'WEBSITE TEMPLATE';
    graphicSvg = `
      <!-- Modern Browser Mockup -->
      <g transform="translate(450, 140)">
        <rect x="0" y="0" width="310" height="240" rx="20" fill="#0f172a" stroke="#3b82f6" stroke-width="2" stroke-opacity="0.4" />
        <rect x="0" y="0" width="310" height="34" rx="20" fill="#1e293b" />
        <rect x="0" y="20" width="310" height="14" fill="#1e293b" />
        <circle cx="18" cy="17" r="5" fill="#ef4444" />
        <circle cx="34" cy="17" r="5" fill="#eab308" />
        <circle cx="50" cy="17" r="5" fill="#22c55e" />
        <rect x="74" y="9" width="160" height="16" rx="6" fill="#0f172a" />
        <text x="84" y="21" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8">https://pgxdigital.shop</text>
        
        <!-- Web Content Blocks -->
        <rect x="18" y="52" width="130" height="20" rx="6" fill="#3b82f6" opacity="0.8" />
        <rect x="18" y="80" width="180" height="10" rx="4" fill="#475569" />
        <rect x="18" y="96" width="140" height="10" rx="4" fill="#334155" />
        <rect x="18" y="118" width="80" height="26" rx="8" fill="#7c3aed" />
        
        <!-- Image Card in Browser -->
        <rect x="18" y="156" width="80" height="64" rx="10" fill="#1e293b" stroke="#334155" />
        <rect x="106" y="156" width="80" height="64" rx="10" fill="#1e293b" stroke="#334155" />
        <rect x="194" y="156" width="80" height="64" rx="10" fill="#1e293b" stroke="#334155" />

        <!-- Floating Mobile Frame -->
        <rect x="220" y="70" width="105" height="195" rx="20" fill="#020617" stroke="#60a5fa" stroke-width="2.5" />
        <rect x="230" y="86" width="85" height="16" rx="4" fill="#3b82f6" />
        <rect x="230" y="110" width="85" height="50" rx="8" fill="#1e293b" />
        <rect x="230" y="168" width="85" height="28" rx="6" fill="#7c3aed" />
        <rect x="260" y="254" width="25" height="4" rx="2" fill="#475569" />
      </g>
    `;
  } else if (cat === 'software-licenses') {
    c1 = '#0a0d18'; c2 = '#16132e'; accent = '#10b981'; badgeBg = '#059669'; tag = 'SOFTWARE & CLI';
    graphicSvg = `
      <!-- Code Editor / IDE Window -->
      <g transform="translate(460, 150)">
        <rect x="0" y="0" width="300" height="230" rx="18" fill="#090d16" stroke="#10b981" stroke-width="2" stroke-opacity="0.4" />
        <rect x="0" y="0" width="300" height="32" rx="18" fill="#131b2e" />
        <rect x="0" y="18" width="300" height="14" fill="#131b2e" />
        <circle cx="16" cy="16" r="4.5" fill="#ef4444" />
        <circle cx="30" cy="16" r="4.5" fill="#eab308" />
        <circle cx="44" cy="16" r="4.5" fill="#22c55e" />
        <text x="64" y="20" font-family="monospace" font-size="10" fill="#94a3b8">main.ts - PGX Studio</text>
        
        <!-- Code lines with syntax colors -->
        <text x="16" y="58" font-family="monospace" font-size="11" fill="#f43f5e">import</text>
        <text x="64" y="58" font-family="monospace" font-size="11" fill="#e2e8f0">{ PGXEngine }</text>
        <text x="175" y="58" font-family="monospace" font-size="11" fill="#f43f5e">from</text>
        <text x="210" y="58" font-family="monospace" font-size="11" fill="#38bdf8">&apos;@pgx/core&apos;;</text>

        <text x="16" y="84" font-family="monospace" font-size="11" fill="#a855f7">const</text>
        <text x="60" y="84" font-family="monospace" font-size="11" fill="#38bdf8">app</text>
        <text x="86" y="84" font-family="monospace" font-size="11" fill="#e2e8f0">=</text>
        <text x="100" y="84" font-family="monospace" font-size="11" fill="#f59e0b">new</text>
        <text x="128" y="84" font-family="monospace" font-size="11" fill="#10b981">PGXEngine();</text>

        <text x="16" y="112" font-family="monospace" font-size="11" fill="#64748b">// Initialize fast license runtime</text>
        <text x="16" y="136" font-family="monospace" font-size="11" fill="#a855f7">await</text>
        <text x="56" y="136" font-family="monospace" font-size="11" fill="#38bdf8">app.launch</text>
        <text x="126" y="136" font-family="monospace" font-size="11" fill="#e2e8f0">({ port: 8080 });</text>

        <!-- Terminal Status Pill -->
        <rect x="16" y="170" width="268" height="38" rx="10" fill="#040711" stroke="#334155" />
        <circle cx="34" cy="189" r="4" fill="#22c55e" />
        <text x="48" y="193" font-family="monospace" font-size="11" fill="#22c55e">● BUILD SUCCESSFUL (0.12s)</text>
      </g>
    `;
  } else if (cat === 'digital-marketing') {
    c1 = '#120b29'; c2 = '#290b36'; accent = '#f43f5e'; badgeBg = '#e11d48'; tag = 'DIGITAL MARKETING';
    graphicSvg = `
      <!-- Social Media & Growth Graph -->
      <g transform="translate(460, 150)">
        <!-- Growth Chart Card -->
        <rect x="0" y="0" width="290" height="230" rx="20" fill="#0f172a" stroke="#f43f5e" stroke-width="2" stroke-opacity="0.4" />
        
        <!-- Header -->
        <text x="20" y="34" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">Campaign Analytics</text>
        <rect x="190" y="18" width="80" height="24" rx="8" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1" />
        <text x="230" y="34" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#10b981" text-anchor="middle">+480% ROAS</text>

        <!-- Chart Grid Lines -->
        <line x1="20" y1="70" x2="270" y2="70" stroke="#334155" stroke-dasharray="3" />
        <line x1="20" y1="115" x2="270" y2="115" stroke="#334155" stroke-dasharray="3" />
        <line x1="20" y1="160" x2="270" y2="160" stroke="#334155" stroke-dasharray="3" />

        <!-- Gradient Curve Area -->
        <path d="M20 160 Q 80 140 120 110 T 200 65 T 270 45 L 270 170 L 20 170 Z" fill="url(#chartGrad)" opacity="0.4" />
        <path d="M20 160 Q 80 140 120 110 T 200 65 T 270 45" fill="none" stroke="#f43f5e" stroke-width="3.5" />
        
        <!-- Chart Points -->
        <circle cx="120" cy="110" r="5" fill="#f43f5e" stroke="#ffffff" stroke-width="2" />
        <circle cx="200" cy="65" r="5" fill="#f43f5e" stroke="#ffffff" stroke-width="2" />
        <circle cx="270" cy="45" r="6" fill="#10b981" stroke="#ffffff" stroke-width="2" />

        <!-- Social Badges Row -->
        <g transform="translate(20, 182)">
          <rect x="0" y="0" width="38" height="34" rx="8" fill="#e1306c" />
          <text x="19" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">IG</text>
          
          <rect x="48" y="0" width="38" height="34" rx="8" fill="#000000" stroke="#00f2fe" stroke-width="1.5" />
          <text x="67" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#00f2fe" text-anchor="middle">TT</text>

          <rect x="96" y="0" width="38" height="34" rx="8" fill="#0077b5" />
          <text x="115" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">IN</text>

          <rect x="144" y="0" width="106" height="34" rx="8" fill="#1e293b" />
          <text x="197" y="22" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#94a3b8" text-anchor="middle">Viral Scripts</text>
        </g>
      </g>
    `;
  } else if (cat === 'online-courses-ebooks') {
    c1 = '#090e1a'; c2 = '#1a1236'; accent = '#f59e0b'; badgeBg = '#d97706'; tag = 'COURSE & E-BOOK';
    graphicSvg = `
      <!-- Video Course / Masterclass Tablet -->
      <g transform="translate(460, 145)">
        <rect x="0" y="0" width="300" height="235" rx="20" fill="#0f172a" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.4" />
        
        <!-- Video Screen Player -->
        <rect x="14" y="14" width="272" height="150" rx="14" fill="#020617" />
        
        <!-- Big Play Button -->
        <circle cx="150" cy="89" r="28" fill="#7c3aed" />
        <polygon points="144,76 162,89 144,102" fill="#ffffff" />
        
        <!-- Video Timeline -->
        <rect x="24" y="146" width="252" height="4" rx="2" fill="#334155" />
        <rect x="24" y="146" width="160" height="4" rx="2" fill="#f59e0b" />
        <circle cx="184" cy="148" r="5" fill="#ffffff" />

        <!-- Course Meta Info -->
        <text x="14" y="190" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff">Module 01: Core Architecture</text>
        <text x="14" y="210" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">18 Lessons • Full GitHub Repo • Certificate</text>
        
        <!-- Rating badge -->
        <rect x="220" y="180" width="66" height="26" rx="6" fill="#f59e0b" fill-opacity="0.2" stroke="#f59e0b" stroke-width="1" />
        <text x="253" y="197" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#f59e0b" text-anchor="middle">★ 4.9 / 5.0</text>
      </g>
    `;
  } else if (cat === 'business-tools') {
    c1 = '#09101d'; c2 = '#082032'; accent = '#14b8a6'; badgeBg = '#0d9488'; tag = 'BUSINESS TOOL';
    graphicSvg = `
      <!-- Executive KPI SaaS Dashboard -->
      <g transform="translate(460, 150)">
        <rect x="0" y="0" width="300" height="230" rx="20" fill="#0b1320" stroke="#14b8a6" stroke-width="2" stroke-opacity="0.4" />
        
        <!-- Top Metrics Cards -->
        <rect x="14" y="14" width="128" height="64" rx="12" fill="#132035" />
        <text x="24" y="32" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#94a3b8">ANNUAL RECURRING</text>
        <text x="24" y="56" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#ffffff">$128,450</text>
        <text x="24" y="70" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#10b981">↑ +24.8% vs last mo</text>

        <rect x="156" y="14" width="128" height="64" rx="12" fill="#132035" />
        <text x="166" y="32" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#94a3b8">ACTIVE CLIENTS</text>
        <text x="166" y="56" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#ffffff">2,840</text>
        <text x="166" y="70" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#38bdf8">99.98% retention</text>

        <!-- Multi-Bar Chart -->
        <rect x="14" y="90" width="270" height="125" rx="12" fill="#132035" />
        <text x="24" y="110" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#ffffff">Monthly Revenue Trajectory</text>
        
        <!-- Bars -->
        <rect x="34" y="170" width="20" height="30" rx="4" fill="#334155" />
        <rect x="68" y="155" width="20" height="45" rx="4" fill="#334155" />
        <rect x="102" y="145" width="20" height="55" rx="4" fill="#38bdf8" />
        <rect x="136" y="135" width="20" height="65" rx="4" fill="#38bdf8" />
        <rect x="170" y="125" width="20" height="75" rx="4" fill="#14b8a6" />
        <rect x="204" y="115" width="20" height="85" rx="4" fill="#14b8a6" />
        <rect x="238" y="105" width="20" height="95" rx="4" fill="#7c3aed" />
      </g>
    `;
  } else if (cat === 'creative-assets') {
    c1 = '#120924'; c2 = '#280a3a'; accent = '#d946ef'; badgeBg = '#c026d3'; tag = 'CREATIVE ASSET';
    graphicSvg = `
      <!-- 3D Geometric Shapes & Figma Palette -->
      <g transform="translate(470, 150)">
        <circle cx="140" cy="115" r="110" fill="url(#pinkGlow)" opacity="0.3" />
        
        <!-- Isometric 3D Cube 1 -->
        <g transform="translate(60, 40)">
          <path d="M60 10 L110 35 L60 60 L10 35 Z" fill="#d946ef" />
          <path d="M10 35 L60 60 L60 120 L10 95 Z" fill="#a21caf" />
          <path d="M60 60 L110 35 L110 95 L60 120 Z" fill="#701a75" />
        </g>

        <!-- Isometric 3D Cube 2 -->
        <g transform="translate(150, 90)">
          <path d="M50 8 L90 28 L50 48 L10 28 Z" fill="#06b6d4" />
          <path d="M10 28 L50 48 L50 96 L10 76 Z" fill="#0891b2" />
          <path d="M50 48 L90 28 L90 76 L50 96 Z" fill="#0e7490" />
        </g>

        <!-- Color Swatch Strip -->
        <rect x="20" y="180" width="240" height="42" rx="12" fill="#0f172a" stroke="#475569" />
        <circle cx="45" cy="201" r="12" fill="#d946ef" />
        <circle cx="85" cy="201" r="12" fill="#7c3aed" />
        <circle cx="125" cy="201" r="12" fill="#06b6d4" />
        <circle cx="165" cy="201" r="12" fill="#10b981" />
        <text x="210" y="205" font-family="monospace" font-size="10" font-weight="700" fill="#94a3b8">HEX 4K</text>
      </g>
    `;
  } else if (cat === 'hosting-cloud') {
    c1 = '#070d18'; c2 = '#0b1a30'; accent = '#22c55e'; badgeBg = '#16a34a'; tag = 'CLOUD & DEVOPS';
    graphicSvg = `
      <!-- Server Rack & Docker Terminal -->
      <g transform="translate(460, 145)">
        <rect x="0" y="0" width="300" height="235" rx="20" fill="#090e17" stroke="#22c55e" stroke-width="2" stroke-opacity="0.4" />
        
        <!-- Server Unit 1 -->
        <rect x="14" y="16" width="272" height="45" rx="10" fill="#111c2e" stroke="#1e293b" />
        <circle cx="34" cy="38" r="4.5" fill="#22c55e" />
        <circle cx="48" cy="38" r="4.5" fill="#22c55e" />
        <circle cx="62" cy="38" r="4.5" fill="#eab308" />
        <rect x="85" y="32" width="100" height="12" rx="3" fill="#1e293b" />
        <text x="220" y="42" font-family="monospace" font-size="9" fill="#22c55e">CPU: 8%</text>

        <!-- Server Unit 2 -->
        <rect x="14" y="68" width="272" height="45" rx="10" fill="#111c2e" stroke="#1e293b" />
        <circle cx="34" cy="90" r="4.5" fill="#22c55e" />
        <circle cx="48" cy="90" r="4.5" fill="#22c55e" />
        <circle cx="62" cy="90" r="4.5" fill="#22c55e" />
        <rect x="85" y="84" width="100" height="12" rx="3" fill="#1e293b" />
        <text x="220" y="94" font-family="monospace" font-size="9" fill="#22c55e">RAM: 3.2GB</text>

        <!-- Bash Terminal -->
        <rect x="14" y="122" width="272" height="98" rx="12" fill="#020617" stroke="#334155" />
        <circle cx="28" cy="136" r="3.5" fill="#ef4444" />
        <circle cx="40" cy="136" r="3.5" fill="#eab308" />
        <circle cx="52" cy="136" r="3.5" fill="#22c55e" />
        <text x="24" y="162" font-family="monospace" font-size="10" fill="#38bdf8">$ docker compose up -d --build</text>
        <text x="24" y="180" font-family="monospace" font-size="10" fill="#22c55e">✔ Container pgx-cluster  Healthy</text>
        <text x="24" y="198" font-family="monospace" font-size="10" fill="#94a3b8">✔ Port 443/TCP routed to Traefik</text>
      </g>
    `;
  } else if (cat === 'business-templates') {
    c1 = '#0a0f1d'; c2 = '#131b2e'; accent = '#eab308'; badgeBg = '#ca8a04'; tag = 'LEGAL & BUSINESS';
    graphicSvg = `
      <!-- Verified Contract Document with Gold Seal -->
      <g transform="translate(470, 140)">
        <rect x="20" y="0" width="240" height="250" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />
        
        <!-- Document Content Lines -->
        <rect x="40" y="30" width="120" height="12" rx="4" fill="#0f172a" />
        <rect x="40" y="52" width="200" height="6" rx="3" fill="#94a3b8" />
        <rect x="40" y="66" width="180" height="6" rx="3" fill="#94a3b8" />
        <rect x="40" y="80" width="190" height="6" rx="3" fill="#94a3b8" />
        
        <rect x="40" y="104" width="90" height="10" rx="4" fill="#334155" />
        <rect x="40" y="122" width="200" height="6" rx="3" fill="#94a3b8" />
        <rect x="40" y="136" width="170" height="6" rx="3" fill="#94a3b8" />

        <!-- Signature Flourish -->
        <path d="M40 185 Q 60 160 80 185 T 120 170 T 150 190" fill="none" stroke="#2563eb" stroke-width="2.5" />
        <line x1="40" y1="200" x2="160" y2="200" stroke="#64748b" stroke-width="1.5" />
        <text x="40" y="214" font-family="system-ui, sans-serif" font-size="8" fill="#64748b">AUTHORIZED SIGNATURE</text>

        <!-- Gold Foil Seal -->
        <circle cx="210" cy="195" r="26" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5" />
        <circle cx="210" cy="195" r="21" fill="#eab308" />
        <polygon points="210,183 214,191 223,191 216,197 218,206 210,201 202,206 204,197 197,191 206,191" fill="#ffffff" />
      </g>
    `;
  } else if (cat === 'memberships') {
    c1 = '#06050b'; c2 = '#210b3d'; accent = '#fbbf24'; badgeBg = '#7c3aed'; tag = 'VIP MEMBERSHIP';
    graphicSvg = `
      <!-- Floating VIP Metallic Card -->
      <g transform="translate(450, 150)">
        <!-- Card Glow Shadow -->
        <rect x="10" y="10" width="290" height="180" rx="20" fill="url(#goldGrad)" opacity="0.3" filter="blur(10px)" />
        
        <!-- Metal Card Body -->
        <rect x="0" y="0" width="290" height="180" rx="20" fill="url(#metalGrad)" stroke="#fbbf24" stroke-width="2" />
        
        <!-- EMV Chip -->
        <rect x="28" y="32" width="38" height="30" rx="6" fill="#fef08a" stroke="#b45309" stroke-width="1.5" />
        <line x1="28" y1="47" x2="66" y2="47" stroke="#b45309" stroke-width="1" />
        <line x1="47" y1="32" x2="47" y2="62" stroke="#b45309" stroke-width="1" />

        <!-- Holographic Waves -->
        <path d="M140 20 Q 180 90 270 50" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-opacity="0.4" />
        <path d="M120 40 Q 160 110 250 70" fill="none" stroke="#c084fc" stroke-width="1.5" stroke-opacity="0.3" />

        <!-- Card Brand & Number -->
        <text x="28" y="115" font-family="monospace" font-size="14" font-weight="900" fill="#ffffff" letter-spacing="3">8892 •••• •••• 2026</text>
        <text x="28" y="148" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#fbbf24" letter-spacing="1.5">PGX VIP ALL-ACCESS</text>
        
        <!-- Logo -->
        <text x="260" y="152" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="end">PG<tspan fill="#a855f7">X</tspan></text>
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="100%" stop-color="${c2}" />
    </linearGradient>
    <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#f43f5e" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent}" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <linearGradient id="pinkGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d946ef" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181328" />
      <stop offset="50%" stop-color="#2d1e4e" />
      <stop offset="100%" stop-color="#140b24" />
    </linearGradient>
    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.04" />
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="800" height="600" fill="url(#bgGrad)" />
  <rect width="800" height="600" fill="url(#gridPattern)" />

  <!-- Subtle Ambient Glow -->
  <circle cx="200" cy="150" r="260" fill="${accent}" opacity="0.08" filter="blur(60px)" />
  <circle cx="650" cy="450" r="280" fill="#7c3aed" opacity="0.09" filter="blur(60px)" />

  <!-- Category Pill Badge -->
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="190" height="34" rx="17" fill="${badgeBg}" fill-opacity="0.25" stroke="${accent}" stroke-width="1.5" />
    <circle cx="16" cy="17" r="4.5" fill="${accent}" />
    <text x="32" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#ffffff" letter-spacing="1">${tag}</text>
  </g>

  <!-- SKU Badge -->
  <g transform="translate(265, 64)">
    <text x="0" y="20" font-family="monospace" font-size="12" font-weight="700" fill="#94a3b8">${sku}</text>
  </g>

  <!-- Main Product Title (Left Column) -->
  <g transform="translate(60, 160)">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="-0.5">
      ${line1}
    </text>
    ${line2 ? `<text x="0" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="-0.5">${line2}</text>` : ''}

    <!-- Short Value Subtitle -->
    <text x="0" y="${line2 ? 96 : 56}" font-family="system-ui, sans-serif" font-size="14" fill="#cbd5e1" font-weight="500">
      ${escapeXml(product.shortDesc.slice(0, 52))}...
    </text>

    <!-- Pricing Box -->
    <g transform="translate(0, ${line2 ? 140 : 100})">
      <rect x="0" y="0" width="180" height="60" rx="16" fill="#030712" fill-opacity="0.6" stroke="#334155" stroke-width="1.5" />
      <text x="18" y="38" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="${accent}">${price}</text>
      <text x="120" y="36" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#64748b" text-decoration="line-through">$${product.comparePrice.toFixed(2)}</text>
    </g>

    <!-- Feature Checklist -->
    <g transform="translate(0, ${line2 ? 230 : 190})">
      <circle cx="8" cy="8" r="7" fill="${accent}" fill-opacity="0.2" />
      <text x="8" y="11" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="${accent}" text-anchor="middle">✓</text>
      <text x="24" y="12" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#e2e8f0">Instant Automated Access</text>

      <circle cx="8" cy="36" r="7" fill="${accent}" fill-opacity="0.2" />
      <text x="8" y="39" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="${accent}" text-anchor="middle">✓</text>
      <text x="24" y="40" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#e2e8f0">Commercial Rights Included</text>

      <circle cx="8" cy="64" r="7" fill="${accent}" fill-opacity="0.2" />
      <text x="8" y="67" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="${accent}" text-anchor="middle">✓</text>
      <text x="24" y="68" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#e2e8f0">Free Lifetime Version Updates</text>
    </g>
  </g>

  <!-- Graphic Mockup Area (Right Side) -->
  ${graphicSvg}

  <!-- Bottom Brand Watermark Strip -->
  <g transform="translate(60, 545)">
    <rect x="0" y="0" width="680" height="1" fill="#ffffff" fill-opacity="0.1" />
    <text x="0" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#94a3b8" letter-spacing="1">PGX DIGITAL</text>
    <text x="82" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#64748b">• SMARTER TOOLS. BETTER RESULTS.</text>
    <text x="680" y="24" font-family="monospace" font-size="10" font-weight="700" fill="#64748b" text-anchor="end">VERIFIED PRODUCTION ASSET</text>
  </g>
</svg>`;
}

// Generate all 100 SVGs
const productsPath = path.join(__dirname, 'data', 'digital-100-products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log(`Generating ${products.length} unique SVG product card covers...`);
for (const p of products) {
  const svgContent = generateSvg(p);
  const filePath = path.join(outDir, `${p.slug}.svg`);
  fs.writeFileSync(filePath, svgContent, 'utf8');
}
console.log(`🎉 Done! Saved ${products.length} distinct SVGs to frontend/public/products/`);
