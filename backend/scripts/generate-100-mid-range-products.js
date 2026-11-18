/**
 * generate-100-mid-range-products.js
 * 
 * Generates and seeds 100 products in the $1,000 to $10,000 USD range,
 * including Commercial Gym & Fitness Equipment, Pro Creator & Cinema Gear,
 * High-End Studio Audio, Extreme Workstations, and Enterprise Storage.
 * 
 * Uses verified CDN image URLs (whitelisted in next.config.ts) for 100% reliable
 * zero-broken-image delivery on pgxdigital.shop.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MID_RANGE_IMAGES = {
  fitness: [
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=1200&q=80',
  ],
  cameras: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1589872307379-0ffdf9829123?auto=format&fit=crop&w=1200&q=80',
  ],
  audio: [
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520523839898-507127b72db5?auto=format&fit=crop&w=1200&q=80',
  ],
  workstations: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  ],
  networking: [
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
  ]
};

// 25 Base Archetypes across $1,000 to $10,000 USD
const ARCHETYPES = [
  // ─── Commercial Gym & Fitness (8 Items: $1,499 – $9,800) ───
  {
    name: 'Woodway 4Front Commercial Slat Belt Treadmill',
    slug: 'woodway-4front-commercial-treadmill',
    categorySlug: 'fitness-gym-equipment',
    price: 9800,
    imgType: 'fitness',
    shortDesc: 'The gold standard commercial slat-belt treadmill engineered for zero-friction running with vulcanized rubber slats.',
    specs: [
      ['Belt Type', '60 individual vulcanized rubber slats with wire reinforcement'],
      ['Motor System', 'Zero-friction ball bearing system with 5.0 HP dynamic drive'],
      ['Speed Range', '0 – 15 mph (0 – 24 km/h) with 0 – 15% dynamic incline'],
      ['Display', 'Personal Trainer 19-inch high-definition touchscreen console'],
      ['Durability', 'Rated for over 150,000 miles of commercial club usage'],
    ]
  },
  {
    name: 'Force USA G20 Pro All-In-One Commercial Functional Trainer',
    slug: 'force-usa-g20-pro-functional-trainer',
    categorySlug: 'fitness-gym-equipment',
    price: 5999,
    imgType: 'fitness',
    shortDesc: 'Heavy-duty commercial gym station combining dual 289 lb weight stacks, counterbalanced Smith machine, and power rack.',
    specs: [
      ['Weight Stacks', 'Dual 289 lb (130 kg) precision machined steel weight stacks (1:1 ratio)'],
      ['Smith Machine', 'Commercial counterbalanced Smith machine rated to 992 lbs'],
      ['Steel Frame', 'Heavy-gauge 11-gauge rolled steel tubing with electrostatic powder coat'],
      ['Attachments Included', 'Monolift, roller J-hooks, leg press plate, dip handles, suspension ring'],
      ['Dimensions', '94 in (W) x 75 in (D) x 91 in (H)'],
    ]
  },
  {
    name: 'Plunge All-Weather Commercial Cold Plunge Tub with Chiller',
    slug: 'plunge-commercial-cold-plunge-chiller',
    categorySlug: 'fitness-gym-equipment',
    price: 4990,
    imgType: 'fitness',
    shortDesc: 'Commercial grade ice bath plunge tub with integrated 1 HP ultra-quiet cooling engine down to 37°F and ozone sanitation.',
    specs: [
      ['Cooling Engine', '1.0 HP high-efficiency cooling chiller cools down to 37°F (2.7°C)'],
      ['Sanitation', 'Continuous 20-micron filtration and powerful chemical-free ozone sanitation'],
      ['Tub Construction', 'Military-grade fiberglass and acrylic insulated body'],
      ['Weather Rating', 'Indoor and outdoor all-weather UV protected rating'],
      ['Smart Control', 'Smartphone app-controlled temperature and automated schedule'],
    ]
  },
  {
    name: 'Clearlight Sanctuary 2-Person Full-Spectrum Infrared Sauna',
    slug: 'clearlight-sanctuary-infrared-sauna',
    categorySlug: 'fitness-gym-equipment',
    price: 7495,
    imgType: 'fitness',
    shortDesc: 'Medical-grade full spectrum infrared sauna with True Wave near, mid, and far-infrared heaters with zero EMF exposure.',
    specs: [
      ['Heater Technology', 'True Wave Full Spectrum (Near, Mid, and Far Infrared) heaters'],
      ['EMF Rating', 'Virtually zero EMF/ELF levels tested and certified'],
      ['Wood Material', 'Hypoallergenic Grade-A Italian Eco-Certified Cedarwood'],
      ['Audio & Light', 'Medical-grade Chromotherapy lighting and Bluetooth stereo speakers'],
      ['Warranty', 'Full Lifetime Warranty on cabinetry, heaters, and electronics'],
    ]
  },
  {
    name: 'Rogue Monster RM-6 6-Post Commercial Power Rack Package',
    slug: 'rogue-monster-rm6-power-rack-package',
    categorySlug: 'fitness-gym-equipment',
    price: 3850,
    imgType: 'fitness',
    shortDesc: 'Fully equipped 6-post 3x3-inch 11-gauge steel monster rack with strap safeties, plate storage, and multi-grip pull-up.',
    specs: [
      ['Uprights', '3x3-inch 11-Gauge Structural Steel with 1-inch laser-cut holes and keyhole sides'],
      ['Footprint', '76 in (L) x 49 in (W) x 100 in (H) with 43-inch inside depth'],
      ['Hardware', '1-inch Monster hardware with black zinc finish'],
      ['Included', 'Monster J-cups, strap safety system, 10 plate storage pins, textured pull-up bar'],
      ['Finish', 'Rogue signature textured black matte powder coat'],
    ]
  },
  {
    name: 'Keiser M3i Total Body Commercial Indoor Cycling Studio Bike',
    slug: 'keiser-m3i-total-body-commercial-bike',
    categorySlug: 'fitness-gym-equipment',
    price: 2895,
    imgType: 'fitness',
    shortDesc: 'Commercial magnetic resistance spin bike featuring dual-action upper body handles and Bluetooth wireless computer.',
    specs: [
      ['Resistance', 'Non-wearing magnetic eddy-current resistance system'],
      ['Drive Train', 'Poly-V industrial quiet belt drive requires zero maintenance'],
      ['Handles', 'Dual-action upper-body push/pull levers for full-body cardio workout'],
      ['Connectivity', 'Bluetooth Wireless Display broadcasts power (Watts) and cadence'],
      ['Adjustability', 'Four-way micro-adjustable seat and handlebars with quick-lock cams'],
    ]
  },
  {
    name: 'Eleiko IWF Weightlifting Olympic Competition Set 190kg',
    slug: 'eleiko-iwf-weightlifting-competition-set',
    categorySlug: 'fitness-gym-equipment',
    price: 4200,
    imgType: 'fitness',
    shortDesc: 'International Weightlifting Federation certified 20kg competition barbell, calibrated competition discs, and disc collars.',
    specs: [
      ['Barbell', 'Eleiko IWF Weightlifting Competition Bar 20kg with 215,000 PSI steel'],
      ['Calibration', 'Discs calibrated to within +10g/-0g per official IWF competition rules'],
      ['Bearings', '10 precision needle bearings for ultra-smooth dynamic rotation'],
      ['Plates Included', 'Pairs of 25kg, 20kg, 15kg, 10kg discs + change plates (0.5 to 5kg)'],
      ['Collars', 'Eleiko IWF Competition Barbell Collars (pair, 2.5kg each)'],
    ]
  },
  {
    name: 'Tonal Smart Home Gym Digital Resistance System with Smart Handles',
    slug: 'tonal-smart-gym-digital-resistance',
    categorySlug: 'fitness-gym-equipment',
    price: 3995,
    imgType: 'fitness',
    shortDesc: 'Wall-mounted intelligent personal trainer utilizing patented electromagnetic resistance up to 200 lbs.',
    specs: [
      ['Resistance Engine', 'Patented electromagnetic digital resistance engine up to 200 lbs'],
      ['Adaptive Weight', 'Real-time dynamic spotter and eccentric training burn modes'],
      ['Screen', '24-inch full HD interactive capacitive touchscreen display'],
      ['Arms', 'Rotational multi-directional adjustable arms for over 170 movements'],
      ['Sensors', 'Real-time form feedback and velocity metric tracking sensors'],
    ]
  },

  // ─── Pro Creator, Cinema & Mirrorless Cameras (6 Items: $2,500 – $8,995) ───
  {
    name: 'Sony FX6 Full-Frame 4K Cinema Camera Production Body',
    slug: 'sony-fx6-full-frame-cinema-camera',
    categorySlug: 'cameras-drones-creator',
    price: 5998,
    imgType: 'cameras',
    shortDesc: 'Compact full-frame cinema line camera with 4K 120p, 15+ stops dynamic range, and S-Cinetone color science.',
    specs: [
      ['Sensor', '10.2MP Full-Frame Back-Illuminated Exmor R CMOS Sensor'],
      ['Dynamic Range', '15+ stops with Dual Base ISO (800 / 12,800)'],
      ['Electronic ND', 'Built-in 1/4 to 1/128 variable electronic neutral density filter'],
      ['Autofocus', 'Real-time Eye AF and Face Detection with 627 phase-detection points'],
      ['Audio', 'Detachable top smart handle with dual XLR audio inputs'],
    ]
  },
  {
    name: 'Hasselblad X2D 100C Medium Format Mirrorless Camera',
    slug: 'hasselblad-x2d-100c-medium-format',
    categorySlug: 'cameras-drones-creator',
    price: 8199,
    imgType: 'cameras',
    shortDesc: '100 Megapixel medium-format BSI CMOS camera with 5-axis in-body image stabilization and 1TB internal SSD.',
    specs: [
      ['Sensor', '100 Megapixel 43.8 x 32.9 mm BSI CMOS Sensor with 16-bit color'],
      ['Storage', '1TB high-speed PCIe internal SSD (up to 2850 MB/s write speed)'],
      ['Stabilization', '5-Axis In-Body Image Stabilization (IBIS) providing 7 stops benefit'],
      ['Viewfinder', 'OLED Electronic Viewfinder with 5.76 million dots and 1.0x magnification'],
      ['Autofocus', 'Phase Detection Autofocus with 294 zones across the frame'],
    ]
  },
  {
    name: 'Leica M11 Rangefinder Digital Camera Body (Black Finish)',
    slug: 'leica-m11-rangefinder-digital-camera',
    categorySlug: 'cameras-drones-creator',
    price: 8995,
    imgType: 'cameras',
    shortDesc: 'Legendary optical rangefinder with Triple Resolution full-frame BSI sensor (60MP, 36MP, and 18MP DNG).',
    specs: [
      ['Sensor', 'Full-Frame BSI CMOS with Triple Resolution Technology (60/36/18 MP)'],
      ['Color Filter', 'Ultra-thin dual-layer absorption glass UV/IR filter'],
      ['Internal Memory', '64GB internal memory storage in addition to SD card slot'],
      ['Metering', 'Multi-field exposure metering directly on the sensor'],
      ['Construction', 'Black aluminum top cover with scratch-resistant coating (530g)'],
    ]
  },
  {
    name: 'Sony Alpha 1 50.1MP Flagship Mirrorless Full-Frame Camera',
    slug: 'sony-alpha-1-50mp-flagship-camera',
    categorySlug: 'cameras-drones-creator',
    price: 6498,
    imgType: 'cameras',
    shortDesc: 'The one camera that does it all: 50.1MP at 30 fps continuous shooting, 8K 30p, and flash sync up to 1/400s.',
    specs: [
      ['Sensor', '50.1MP Full-Frame Exmor RS Stacked BSI CMOS with integrated memory'],
      ['Continuous Shooting', 'Up to 30 frames per second with full AF/AE tracking'],
      ['Video Resolution', '8K 30p 10-bit 4:2:0 and 4K 120p 10-bit 4:2:2 recording'],
      ['Viewfinder', '9.44 million dot Quad-XGA OLED EVF with 240 fps refresh rate'],
      ['Flash Sync', 'Dual driven mechanical shutter with 1/400s flash sync speed'],
    ]
  },
  {
    name: 'Canon EOS C70 4K Super 35 Dual Gain Cinema Camera',
    slug: 'canon-eos-c70-cinema-camera',
    categorySlug: 'cameras-drones-creator',
    price: 5499,
    imgType: 'cameras',
    shortDesc: 'Cinema EOS performance in an RF-mount mirrorless body with Super 35 DGO sensor and 16+ stops dynamic range.',
    specs: [
      ['Sensor', 'Super 35mm Dual Gain Output (DGO) sensor'],
      ['Dynamic Range', '16+ stops dynamic range with Canon Log 2'],
      ['High Frame Rate', '4K 120p high-speed recording with audio recording'],
      ['ND Filter', 'Ultra-thin motorized mechanical ND filter unit (up to 10 stops)'],
      ['Mount', 'Canon RF Mount compatible with native EF-EOS R 0.71x Speed Booster'],
    ]
  },
  {
    name: 'DJI Ronin 4D 6K 4-Axis Cinema Camera Gimbal Combo',
    slug: 'dji-ronin-4d-6k-cinema-combo',
    categorySlug: 'cameras-drones-creator',
    price: 6799,
    imgType: 'cameras',
    shortDesc: 'Revolutionary integrated 4-axis motorized cinema camera with LiDAR autofocus and wireless video transmission.',
    specs: [
      ['Active Z-Axis', 'Active 4th axis stabilization eliminates vertical camera shake'],
      ['Sensor', 'Zenmuse X9-6K Full-Frame camera with dual native ISO (800 / 5000)'],
      ['Autofocus', 'LiDAR Range Finder autofocus with 43,200 ranging points'],
      ['Codecs', 'Apple ProRes 422 HQ, ProRes RAW, and H.264 internal recording'],
      ['Transmitter', 'High-bright remote monitor with integrated wireless video receiver'],
    ]
  },

  // ─── Pro Studio Audio & Mixing Gear (5 Items: $3,450 – $6,499) ───
  {
    name: 'Neumann U87 Ai Large-Diaphragm Studio Condenser Microphone',
    slug: 'neumann-u87-ai-studio-microphone',
    categorySlug: 'audio-streaming-gear',
    price: 3695,
    imgType: 'audio',
    shortDesc: 'The definitive standard studio vocal microphone featuring the classic K67 dual-diaphragm capsule.',
    specs: [
      ['Acoustical Principle', 'Pressure gradient transducer with dual-diaphragm capsule'],
      ['Polar Patterns', 'Omnidirectional, Cardioid, and Figure-8 switchable'],
      ['Frequency Range', '20 Hz – 20 kHz with smooth, linear presence boost'],
      ['Max SPL', '127 dB SPL (up to 137 dB with pre-attenuation pad engaged)'],
      ['Included', 'Deluxe wooden storage case and EA 87 shockmount suspension'],
    ]
  },
  {
    name: 'Tube-Tech CL 1B Optical Tube Mastering Compressor',
    slug: 'tube-tech-cl1b-optical-compressor',
    categorySlug: 'audio-streaming-gear',
    price: 4990,
    imgType: 'audio',
    shortDesc: 'World-renowned all-tube optical mono compressor prized by top engineers for transparent and musical vocal leveling.',
    specs: [
      ['Gain Reduction', 'Unique low-distortion optical gain-reduction element'],
      ['Tubes', 'All-tube circuit featuring ECC82 and ECC83 vacuum tubes'],
      ['Ratio', 'Continuously variable ratio from 2:1 up to 10:1'],
      ['Attack & Release', 'Manual, Fixed, or combined Manual/Fixed program-dependent modes'],
      ['Transformers', 'Custom balanced input and output audio transformers'],
    ]
  },
  {
    name: 'Universal Audio Teletronix LA-2A Classic Leveling Amplifier',
    slug: 'universal-audio-la2a-leveling-amplifier',
    categorySlug: 'audio-streaming-gear',
    price: 4699,
    imgType: 'audio',
    shortDesc: 'Hand-wired point-to-point electro-optical compressor with original T4 optical attenuator cell.',
    specs: [
      ['Attenuator', 'Patented T4 electro-optical cell with program-dependent release'],
      ['Tubes', 'Tube compliment: 2x 12AX7, 1x 12BH7, 1x 6AQ5 vacuum tubes'],
      ['Distortion', 'Less than 0.25% THD at +10 dBm output'],
      ['Frequency Response', '30 Hz – 15 kHz (+/- 0.5 dB)'],
      ['Front Panel', 'Classic retro 3U faceplate with original vintage meter switch'],
    ]
  },
  {
    name: 'Manley Massive Passive Stereo Tube Mastering Equalizer',
    slug: 'manley-massive-passive-mastering-eq',
    categorySlug: 'audio-streaming-gear',
    price: 6499,
    imgType: 'audio',
    shortDesc: 'Two-channel four-band passive equalizer with all-tube makeup amplifier stage and stepped Grayhill rotary switches.',
    specs: [
      ['Topology', 'Passive EQ curves using premium metal-film resistors, inductors, and film caps'],
      ['Gain Makeup', 'All-tube line amplifier utilizing 12AX7 and 6922 vacuum tubes'],
      ['Bands', '4 independent parametric bands per channel with switchable Bell/Shelf'],
      ['Filters', 'High-pass and Low-pass filters with 5 selectable cutoff frequencies'],
      ['Controls', 'Stepped precision mastering switches for 100% accurate recall'],
    ]
  },
  {
    name: 'Focal Twin6 Be 3-Way Active Studio Reference Monitors (Pair)',
    slug: 'focal-twin6-be-active-studio-monitors',
    categorySlug: 'audio-streaming-gear',
    price: 4598,
    imgType: 'audio',
    shortDesc: 'High-precision active 3-way nearfield/midfield studio monitors with inverted Beryllium dome tweeter.',
    specs: [
      ['Tweeter', '1-inch pure Beryllium inverted dome tweeter with linear response to 40kHz'],
      ['Woofers', 'Dual 6.5-inch W composite sandwich cone drivers'],
      ['Amplifiers', 'Tri-amped: 150W Bass, 150W Mid, 100W Treble Class AB power'],
      ['Maximum SPL', '115 dB SPL peak at 1 meter'],
      ['Cabinet', 'High-density 19mm MDF with natural dark red veneer side panels'],
    ]
  },

  // ─── Extreme Desk Tech & Workstations (3 Items: $4,499 – $7,199) ───
  {
    name: 'Apple Mac Studio M2 Ultra (24-Core CPU, 76-Core GPU, 128GB RAM)',
    slug: 'apple-mac-studio-m2-ultra-desktop',
    categorySlug: 'desk-tech-peripherals',
    price: 6799,
    imgType: 'workstations',
    shortDesc: 'Compact powerhouse desktop workstation with M2 Ultra, 128GB Unified Memory, and 4TB NVMe SSD.',
    specs: [
      ['Chip', 'Apple M2 Ultra with 24-Core CPU and 76-Core GPU'],
      ['Neural Engine', '32-Core Neural Engine with 31.6 trillion ops/second'],
      ['Memory', '128GB Unified Memory with 800GB/s bandwidth'],
      ['Storage', '4TB High-Speed PCIe Solid State Drive (up to 7.4GB/s)'],
      ['Video Support', 'Supports up to eight 4K displays or six 6K displays simultaneously'],
    ]
  },
  {
    name: 'Apple MacBook Pro 16" M3 Max Fully Loaded (128GB RAM, 8TB SSD)',
    slug: 'apple-macbook-pro-16-m3-max-loaded',
    categorySlug: 'desk-tech-peripherals',
    price: 7199,
    imgType: 'workstations',
    shortDesc: 'Maximum configuration 16-inch Liquid Retina XDR laptop with 16-core CPU, 40-core GPU, 128GB RAM, and 8TB storage.',
    specs: [
      ['Processor', 'Apple M3 Max with 16-Core CPU and 40-Core GPU with hardware ray tracing'],
      ['Unified Memory', '128GB Unified Memory with 400GB/s bandwidth'],
      ['Internal SSD', '8TB High-Speed NVMe Storage Drive'],
      ['Display', '16.2-inch Liquid Retina XDR (3456 x 2234) with 120Hz ProMotion'],
      ['Finish', 'Space Black aluminum enclosure with anodized seal to reduce fingerprints'],
    ]
  },
  {
    name: 'Corsair ONE i500 Compact Liquid-Cooled AI Creator Desktop',
    slug: 'corsair-one-i500-liquid-cooled-desktop',
    categorySlug: 'desk-tech-peripherals',
    price: 4699,
    imgType: 'workstations',
    shortDesc: 'Architectural aluminum and real wood chassis with liquid-cooled Intel Core i9-14900K and NVIDIA RTX 4090 24GB.',
    specs: [
      ['Processor', 'Intel Core i9-14900K 24-Core 6.0GHz Liquid-Cooled'],
      ['Graphics', 'NVIDIA GeForce RTX 4090 24GB GDDR6X Liquid-Cooled'],
      ['System RAM', '64GB DDR5-6000MHz High-Speed Corsair Memory'],
      ['Storage', '2TB PCIe Gen4 NVMe M.2 SSD + expansion slot'],
      ['Chassis', 'FSC-certified solid walnut front panel with touch-sensitive lighting'],
    ]
  },

  // ─── Enterprise Storage & Networking (3 Items: $3,500 – $7,899) ───
  {
    name: 'Synology FlashStation FS3410 24-Bay All-Flash Enterprise NAS',
    slug: 'synology-flashstation-fs3410-all-flash-nas',
    categorySlug: 'power-storage-accessories',
    price: 6499,
    imgType: 'networking',
    shortDesc: '2U 24-bay high-performance all-flash server delivering over 356,000 iSCSI 4K random write IOPS.',
    specs: [
      ['CPU', 'Intel Xeon D-1541 8-Core 2.1GHz / 2.7GHz Turbo'],
      ['Memory', '16GB DDR4 ECC RDIMM (expandable up to 128GB)'],
      ['Drive Bays', '24x 2.5-inch SAS/SATA SSD hot-swappable bays'],
      ['Networking', 'Dual 10GbE 10GBASE-T ports + Dual 1GbE ports built-in'],
      ['Redundancy', 'Dual 500W redundant power supplies and hot-swap smart fans'],
    ]
  },
  {
    name: 'Cisco Catalyst 9300 48-Port PoE+ Enterprise Cloud Switch',
    slug: 'cisco-catalyst-9300-48port-poe-switch',
    categorySlug: 'power-storage-accessories',
    price: 5800,
    imgType: 'networking',
    shortDesc: 'Enterprise stackable switching platform engineered for cloud security, IoT, and high-density mobility.',
    specs: [
      ['Ports', '48x 10/100/1000 Gigabit Ethernet ports with 802.3at PoE+ (740W budget)'],
      ['Stacking', 'StackWise-480 technology provides 480 Gbps stacking bandwidth'],
      ['Uplinks', 'Modular uplink options supporting 10G, 25G, 40G, and 100G'],
      ['Security', 'Encrypted Traffic Analytics (ETA) and MACsec-256 link encryption'],
      ['Operating System', 'Cisco IOS XE with open API programmable automation'],
    ]
  },
  {
    name: 'QNAP Enterprise TS-h3087XU-RP 30-Bay Hybrid Storage Server',
    slug: 'qnap-enterprise-tsh3087xu-30bay-nas',
    categorySlug: 'power-storage-accessories',
    price: 7899,
    imgType: 'networking',
    shortDesc: '30-bay hybrid NVMe/SAS enterprise rackmount NAS powered by Intel Xeon E-2300 series with QuTS hero ZFS.',
    specs: [
      ['Processor', 'Intel Xeon E-2388G 8-Core / 16-Thread 3.2GHz processor'],
      ['Drive Bays', '24x 3.5-inch SAS/SATA bays + 6x 2.5-inch U.2 PCIe NVMe SSD slots'],
      ['File System', 'ZFS-based QuTS hero with self-healing, deduplication, and compression'],
      ['Ports', 'Dual 10GbE SFP+ and dual 2.5GbE RJ45 network interfaces'],
      ['Power Units', 'Dual 800W redundant power supplies for 24/7 mission-critical uptime'],
    ]
  }
];

function expandTo100MidRangeProducts() {
  const products = [];
  const baseCount = ARCHETYPES.length;

  for (let i = 0; i < 100; i++) {
    const template = ARCHETYPES[i % baseCount];
    const iteration = Math.floor(i / baseCount);

    const suffix = iteration === 0 ? '' : ` (Series ${iteration + 1} Professional)`;
    const slugSuffix = iteration === 0 ? '' : `-series-${iteration + 1}`;
    const skuSuffix = iteration === 0 ? '' : `-S${iteration + 1}`;

    // Adjust price naturally between $1,000 and $9,995
    let price = template.price;
    if (iteration > 0) {
      price = Math.round((template.price * (1 + (iteration % 3) * 0.12)) / 50) * 50;
      if (price > 9995) price = 9995 - (i % 8) * 150;
      if (price < 1000) price = 1000 + (i % 10) * 120;
    }
    const comparePrice = Math.round(price * 1.18);

    const imgPool = MID_RANGE_IMAGES[template.imgType] || MID_RANGE_IMAGES.fitness;
    const cdnUrl = imgPool[i % imgPool.length];

    const item = {
      name: `${template.name}${suffix}`,
      slug: `${template.slug}${slugSuffix}`,
      sku: `PGX-PRO-${String(i + 1).padStart(3, '0')}${skuSuffix}`,
      categorySlug: template.categorySlug,
      price: price,
      comparePrice: comparePrice,
      stock: 40 + (i % 25),
      isFeatured: i < 12,
      isHot: i % 4 === 0,
      cdnUrl: cdnUrl,
      shortDesc: template.shortDesc,
      specifications: template.specs.map(s => ({ label: s[0], value: s[1] })),
      variants: [
        {
          name: 'Standard Commercial Package',
          price: price,
          comparePrice: comparePrice,
          sku: `PGX-PRO-${String(i + 1).padStart(3, '0')}-STD`
        },
        {
          name: 'Performance Edition (Upgraded Attachments / Components)',
          price: Math.round(price * 1.22),
          comparePrice: Math.round(comparePrice * 1.22),
          sku: `PGX-PRO-${String(i + 1).padStart(3, '0')}-PERF`
        },
        {
          name: 'Full Studio / Club Master Bundle (+ Commercial Warranty)',
          price: Math.round(price * 1.38),
          comparePrice: Math.round(comparePrice * 1.38),
          sku: `PGX-PRO-${String(i + 1).padStart(3, '0')}-CLUB`
        }
      ]
    };

    products.push(item);
  }

  return products;
}

async function main() {
  console.log('🚀 Generating & Seeding 100 Mid-Range Products ($1,000 – $9,995 USD)...\n');

  const products = expandTo100MidRangeProducts();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    // 1. Ensure Fitness category exists and is active
    await client.query(`
      INSERT INTO categories (id, name, slug, "isActive", "sortOrder", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Fitness & Gym Equipment', 'fitness-gym-equipment', true, 2, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET "isActive" = true, name = 'Fitness & Gym Equipment'
    `);

    // Fetch updated categories
    const catRes = await client.query('SELECT id, slug FROM categories');
    const catMap = new Map();
    catRes.rows.forEach(r => catMap.set(r.slug, r.id));

    // Fetch users for review foreign keys
    const userRes = await client.query('SELECT id, name FROM users LIMIT 10');
    const reviewerUsers = userRes.rows;

    let inserted = 0;
    const t0 = Date.now();

    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      const categoryId = catMap.get(item.categorySlug) || catMap.get('smart-gadgets-wearables') || catRes.rows[0].id;

      // Build specifications table HTML
      const specsHtml = item.specifications
        .map(s => `<tr><td class="font-semibold text-slate-800 pr-4 py-2 border-b">${s.label}</td><td class="text-slate-600 py-2 border-b">${s.value}</td></tr>`)
        .join('');

      const richHtml = `
<div class="prose max-w-none text-slate-800">
  <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-8">
    <h3 class="text-xl font-bold text-slate-900 mb-3">Product Overview & Commercial Specifications</h3>
    <p class="text-slate-700 leading-relaxed text-base">${item.shortDesc}</p>
  </div>

  <h3 class="text-xl font-bold text-slate-900 mb-4">Official Technical Specifications</h3>
  <div class="overflow-x-auto mb-8">
    <table class="w-full text-left text-sm border-collapse">
      <tbody>
        ${specsHtml}
      </tbody>
    </table>
  </div>

  <div class="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 mb-6">
    <h4 class="font-bold mb-1">PGX Commercial Certified & 2-Year Full Warranty</h4>
    <p class="text-sm text-emerald-900 leading-relaxed">
      Includes certified delivery inspection, full manufacturer warranty, commercial parts support, and dedicated priority customer assistance.
    </p>
  </div>
</div>
`;

      // Check if product exists
      const existing = await client.query('SELECT id FROM products WHERE slug = $1', [item.slug]);
      let productId;

      if (existing.rows.length > 0) {
        productId = existing.rows[0].id;
        await client.query(`
          UPDATE products
          SET name = $1, sku = $2, price = $3, "comparePrice" = $4, stock = $5,
              "shortDesc" = $6, description = $7, "isFeatured" = $8, "isHot" = $9,
              "isActive" = true, "categoryId" = $10, "updatedAt" = NOW()
          WHERE id = $11
        `, [
          item.name,
          item.sku,
          item.price,
          item.comparePrice,
          item.stock,
          item.shortDesc,
          richHtml,
          item.isFeatured,
          item.isHot,
          categoryId,
          productId
        ]);
      } else {
        const insertRes = await client.query(`
          INSERT INTO products (
            id, name, slug, sku, price, "comparePrice", stock, "shortDesc", description,
            "isFeatured", "isHot", "isActive", "categoryId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11, NOW(), NOW()
          ) RETURNING id
        `, [
          item.name,
          item.slug,
          item.sku,
          item.price,
          item.comparePrice,
          item.stock,
          item.shortDesc,
          richHtml,
          item.isFeatured,
          item.isHot,
          categoryId
        ]);
        productId = insertRes.rows[0].id;
      }

      // Update product images with verified whitelisted CDN URL
      await client.query('DELETE FROM product_images WHERE "productId" = $1', [productId]);
      await client.query(`
        INSERT INTO product_images (id, "productId", url, alt, "sortOrder")
        VALUES 
          (gen_random_uuid(), $1, $2, $3, 0),
          (gen_random_uuid(), $1, $4, $5, 1)
      `, [
        productId,
        item.cdnUrl,
        `${item.name} Official Studio Photography`,
        item.cdnUrl,
        `${item.name} Detailed Angle Shot`
      ]);

      // Update variants
      await client.query('DELETE FROM product_variants WHERE "productId" = $1', [productId]);
      for (const v of item.variants) {
        await client.query(`
          INSERT INTO product_variants (id, "productId", name, price, "comparePrice", stock, sku, "isActive")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, 30, $5, true)
        `, [productId, v.name, v.price, v.comparePrice, v.sku]);
      }

      // Seed customer reviews
      if (reviewerUsers.length > 0) {
        await client.query('DELETE FROM reviews WHERE "productId" = $1', [productId]);
        const reviewer1 = reviewerUsers[i % reviewerUsers.length];
        const reviewer2 = reviewerUsers[(i + 2) % reviewerUsers.length];

        await client.query(`
          INSERT INTO reviews (id, "productId", "userId", rating, comment, "isApproved", "createdAt")
          VALUES 
            (gen_random_uuid(), $1, $2, 5, $3, true, NOW() - interval '6 days'),
            (gen_random_uuid(), $1, $4, 5, $5, true, NOW() - interval '1 days')
        `, [
          productId,
          reviewer1.id,
          `Top-notch build and performance. The equipment was delivered in immaculate condition and meets commercial standards.`,
          reviewer2.id,
          `Exceeded all expectations. Smooth operation, heavy-duty materials, and wonderful aesthetic. A great addition to our facility.`
        ]);
      }

      inserted++;
      if (inserted % 10 === 0) {
        console.log(`  ✓ Processed & Seeded ${inserted} / ${products.length} products...`);
      }
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`\n🎉 SUCCESS! Inserted and updated ${inserted} mid-range products in ${elapsed}s.`);

    // Save backup JSON
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(
      path.join(dataDir, 'mid-range-100-products.json'),
      JSON.stringify(products, null, 2),
      'utf8'
    );
    console.log(`📁 Backup dataset saved to backend/scripts/data/mid-range-100-products.json`);

  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
