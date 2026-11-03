/**
 * build_pages.js - Generator for Solarfi Service Pages (ES Module)
 * Upgraded with distinct SVG header graphics, tailored processes, FAQs, and unified design system.
 */
import fs from 'fs';

const pages_data = [
  {
    filename: "design-engineering.html",
    title: "Solar Design & Engineering",
    meta_title: "Solar Design & Engineering Services | Solarfi Pulivendula",
    meta_desc: "Get award-winning solar design and engineering in Andhra Pradesh. LiDAR drone mapping, PVsyst yield simulations, and APSPDCL-compliant blueprints.",
    subtitle: "Precision CAD & LiDAR Planning for Maximum Generation Yield",
    breadcrumb: "Design & Engineering",
    service_pill: "01 · Engineering Precision",
    header_svg: `<svg viewBox="0 0 540 280" fill="none" class="solar-flow-svg">
      <defs>
        <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/></pattern>
      </defs>
      <rect width="540" height="280" fill="#0d141e" rx="20"/>
      <rect width="540" height="280" fill="url(#cadGrid)" rx="20"/>
      <!-- Rooftop 3D isometric layout -->
      <polygon points="120,180 270,100 420,180 270,240" fill="rgba(26,140,62,0.25)" stroke="#1a8c3e" stroke-width="2"/>
      <polygon points="150,165 270,110 390,165 270,215" fill="rgba(34,197,94,0.18)" stroke="#22c55e" stroke-width="1.5"/>
      <!-- Solar arrays -->
      <line x1="180" y1="150" x2="300" y2="200" stroke="#f97316" stroke-width="2" stroke-dasharray="4 4"/>
      <line x1="240" y1="125" x2="360" y2="175" stroke="#f97316" stroke-width="2" stroke-dasharray="4 4"/>
      <!-- Sun ray angle -->
      <line x1="70" y1="40" x2="230" y2="130" stroke="#fde047" stroke-width="2" stroke-dasharray="6 4"/>
      <circle cx="70" cy="40" r="16" fill="#f59e0b"/>
      <text x="270" y="260" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">Azimuth 180° South · Tilt 15° · Zero Shadow Loss</text>
    </svg>`,
    info_title: "Precision Engineering for Maximum Lifetime Yield",
    left_image: "images/engineering-design-hero.jpg",
    features: [
      { title: "LiDAR & Drone 3D Mapping", desc: "Millimeter-accurate rooftop dimensioning and obstacle shade modeling." },
      { title: "PVsyst Generation Modeling", desc: "Rigorous generation forecasting accounting for Pulivendula weather data." },
      { title: "DISCOM Approval CAD", desc: "Single-line electrical schematics prepared to APSPDCL standards." },
      { title: "Structural Load Safety", desc: "Wind speed resistance analysis up to 150 km/h for cyclone stability." }
    ],
    right_text: "At Solarfi, we use best-in-class software for rooftop solar plant engineering. Our team evaluates your roof orientation, executes shadow simulations across all 365 days of the sun's path, and optimizes string inverters for peak generation. We deliver complete MNRE & APSPDCL compliant CAD drawings ready for rapid DISCOM approvals.",
    checklist: [
      "365-Day 3D Shadow Simulation & Azimuth Optimization",
      "Single-Line Electrical Diagrams (SLD) & Earthing Plans",
      "Structural Stability & Roof Load Clearance",
      "Guaranteed Generation Forecasts via PVsyst & AutoCAD"
    ],
    right_img: "images/hero_family_solar.png",
    process_steps: [
      { step: "01", name: "Drone Survey", desc: "High-resolution roof photography and 3D terrain point cloud mapping." },
      { step: "02", name: "Shadow Analysis", desc: "Identifying parapet walls, trees, and future building obstructions." },
      { step: "03", name: "Electrical Sizing", desc: "Optimizing string layouts, MPPT voltage matching, and AC/DC losses." },
      { step: "04", name: "Sanction Blueprint", desc: "Submitting formal CAD filings to APSPDCL for net-metering sanctions." }
    ],
    cards: [
      {
        title: "Rooftop Layout & Shadow Analysis",
        desc: "Custom CAD layouts engineered to capture peak morning and afternoon solar irradiance.",
        img: "images/feat_installation.png",
        checklist: ["15° seasonal tilt optimization", "Obstacle shade-free setback buffers", "Uniform roof weight distribution"]
      },
      {
        title: "Single-Line Diagram (SLD)",
        desc: "Complete electrical schematics with surge protection, DC isolators, and earthing pits.",
        img: "images/feat_warranty.png",
        checklist: ["Dual earthing protection design", "AC/DC junction box schematics", "DISCOM safety compliance checks"]
      },
      {
        title: "Load Estimation & Sizing",
        desc: "Granular energy demand analysis to match your sanctioned load and PM Surya Ghar subsidy.",
        img: "images/feat_roi.png",
        checklist: ["Historical 12-month bill audit", "Sanctioned load enhancement filings", "3kW to 100kW system configurations"]
      }
    ],
    faqs: [
      { q: "Why is 3D shadow analysis necessary before installation?", a: "Even partial shade on a single solar cell can reduce string output by up to 40%. Our 3D simulation ensures panels are placed exclusively in shade-free zones for maximum generation." },
      { q: "Will installing solar panels damage my roof waterproofing?", a: "No. We utilize non-penetrative ballasted clamps or chemically sealed stainless steel anchor bolts with neoprene gaskets that maintain 100% waterproof integrity." },
      { q: "Are your engineering drawings accepted by APSPDCL?", a: "Yes, 100%. Solarfi's blueprints strictly adhere to Central Electricity Authority (CEA) and APSPDCL technical guidelines for seamless net-metering approval." }
    ]
  },
  {
    filename: "procurement.html",
    title: "Procurement & Supply Services",
    meta_title: "Solar Procurement & Supply Services | Solarfi Pulivendula",
    meta_desc: "Tier-1 solar panels, inverters, and mounting hardware procured directly from verified manufacturers with 30-year warranty support.",
    subtitle: "Direct-from-Manufacturer Tier-1 Components for Lifetime Reliability",
    breadcrumb: "Procurement & Supply",
    service_pill: "02 · Tier-1 Hardware",
    header_svg: `<svg viewBox="0 0 540 280" fill="none" class="solar-flow-svg">
      <rect width="540" height="280" fill="#0d141e" rx="20"/>
      <!-- Tier 1 badge -->
      <circle cx="270" cy="120" r="64" fill="rgba(249,115,22,0.15)" stroke="#f97316" stroke-width="2"/>
      <path d="M250 120 L265 135 L295 105" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="270" y="210" fill="#ffffff" font-size="15" font-weight="800" text-anchor="middle">BloombergNEF Tier-1 Certified</text>
      <text x="270" y="230" fill="#9ca3af" font-size="12" text-anchor="middle">Waaree · Vikram Solar · Growatt · BIS &amp; ALMM Approved</text>
    </svg>`,
    info_title: "Reliable Procurement for 30+ Years of Solar Performance",
    left_image: "images/feat_installation.png",
    features: [
      { title: "Direct Factory Sourcing", desc: "Procured straight from Tier-1 manufacturers eliminating middlemen markups." },
      { title: "ALMM & BIS Verified", desc: "All modules certified on the MNRE Approved List of Module Manufacturers." },
      { title: "Galvanized Structure", desc: "Hot-dip galvanized steel engineered to resist coastal and dryland rust." },
      { title: "Full Warranty Documentation", desc: "Direct manufacturer warranty cards and factory flash test data." }
    ],
    right_text: "Solarfi procures only Tier-1 high-efficiency solar panels, hybrid inverters, and galvanized mounting hardware from industry leaders such as Vikram Solar, Waaree, and Growatt. Every component meets strict Bureau of Indian Standards (BIS) and MNRE specifications, ensuring maximum energy yields and total peace of mind.",
    checklist: [
      "Tier-1 BloombergNEF Rated Mono PERC & Bifacial Modules",
      "High-Efficiency Inverters with 98.6% Conversion Rates",
      "Hot-Dip Galvanized Mounting Structures (80-Micron Coating)",
      "UV-Resistant Dual-Insulated DC Copper Cabling"
    ],
    right_img: "images/soalr-pannel-fixing-team.jpg",
    process_steps: [
      { step: "01", name: "Component Selection", desc: "Matching solar module ratings to site temperature and DISCOM voltage." },
      { step: "02", name: "Factory Flash Test", desc: "Auditing factory test reports for peak wattage and cell luminescence." },
      { step: "03", name: "Protected Transport", desc: "Direct delivery to your rooftop in Pulivendula with zero transit damage." },
      { step: "04", name: "Warranty Registry", desc: "Registering official 25-30 year performance warranties directly with makers." }
    ],
    cards: [
      {
        title: "Tier-1 Mono & Bifacial Panels",
        desc: "550W+ high-density panels capturing sunlight from both top and reflected ground surfaces.",
        img: "images/feat_subsidy.png",
        checklist: ["ALMM listed for PM Surya Ghar", "Low-light degradation resistance", "30-year linear power warranty"]
      },
      {
        title: "Grid-Tie & Hybrid Inverters",
        desc: "Advanced MPPT inverters delivering stable sinusoidal AC with instant mobile tracking.",
        img: "images/feat_warranty.png",
        checklist: ["Dual MPPT string trackers", "Built-in Wi-Fi and 4G data logging", "IP65 weatherproof enclosures"]
      },
      {
        title: "Mounting & Safety Hardware",
        desc: "Heavy-gauge galvanized steel and class-A earthing rods to safeguard your home against lightning.",
        img: "images/feat_app.png",
        checklist: ["80+ micron hot-dip galvanization", "Class-1 lightning arrestors", "Chemical earthing compound kits"]
      }
    ],
    faqs: [
      { q: "Which solar panel brands do you install?", a: "We install only Tier-1 manufacturers like Waaree, Vikram Solar, and Tata Power Solar, all of which are on the MNRE Approved List of Models and Manufacturers (ALMM)." },
      { q: "How long is the warranty on panels and inverters?", a: "Panels come with a 25 to 30-year linear performance warranty. Inverters carry a 5 to 10-year manufacturer replacement warranty with local service support." },
      { q: "Are all components eligible for PM Surya Ghar subsidy?", a: "Yes. Every single panel, inverter, and meter we procure is 100% compliant with Central Government PM Surya Ghar technical specifications." }
    ]
  },
  {
    filename: "installation-commissioning.html",
    title: "Installation & Commissioning",
    meta_title: "Solar Installation & Commissioning | Solarfi Pulivendula",
    meta_desc: "Professional 48-hour solar installation in Andhra Pradesh by MNRE-certified electricians. APSPDCL net-metering and grid-tie commissioning.",
    subtitle: "Fast-Track 48-Hour Installation with Certified Electrical Safety",
    breadcrumb: "Installation & Commissioning",
    service_pill: "03 · Precision Build",
    header_svg: `<svg viewBox="0 0 540 280" fill="none" class="solar-flow-svg">
      <rect width="540" height="280" fill="#0d141e" rx="20"/>
      <!-- Grid line -->
      <line x1="80" y1="200" x2="460" y2="200" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
      <!-- Solar Array on Roof -->
      <polygon points="140,160 260,110 380,160 260,200" fill="rgba(26,140,62,0.3)" stroke="#1a8c3e" stroke-width="2"/>
      <circle cx="260" cy="155" r="8" fill="#f97316"/>
      <text x="270" y="240" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">48-Hour Guaranteed Installation</text>
      <text x="270" y="258" fill="#22c55e" font-size="12" font-weight="600" text-anchor="middle">Certified MNRE Technicians · Zero Leakage Mounting</text>
    </svg>`,
    info_title: "Flawless Execution from Rooftop to the Grid",
    left_image: "images/soalr-pannel-fixing-team2.jpg",
    features: [
      { title: "48-Hour Execution", desc: "Physical mounting completed in just 2 days with zero disruption to your daily life." },
      { title: "Certified Electricians", desc: "MNRE-trained technicians with 16+ years of specialized solar experience." },
      { title: "Dual Earth Pits", desc: "Dedicated copper earthing for lightning protection and equipment safety." },
      { title: "Commissioning Certificate", desc: "Full DISCOM inspection report and official net-meter synchronization." }
    ],
    right_text: "At Solarfi, our installation teams are certified by the National Institute of Solar Energy (NISE) and MNRE. We treat your rooftop with utmost care: using non-destructive clamps, industrial torque wrenches on all bolts, and weatherproof conduit piping. Once mounted, we synchronize your bi-directional meter with the APSPDCL grid.",
    checklist: [
      "Rigid Structural Anchoring Tailored to RCC & Sheet Roofs",
      "Dedicated AC/DC Segregated Conduits with Fire-Retardant Sleeving",
      "Chemical Earthing Pit Installation (< 2 Ohms Resistance)",
      "DISCOM Net-Meter Synchronization & Official Handover"
    ],
    right_img: "images/hero_family_solar.png",
    process_steps: [
      { step: "01", name: "Structure Assembly", desc: "Setting galvanized pillars, purlins, and rafter beams to precision tilt." },
      { step: "02", name: "Panel Clamping", desc: "Mounting Tier-1 panels with stainless mid-clamps and end-clamps." },
      { step: "03", name: "Wiring & Earthing", desc: "Connecting DC strings, junction boxes, and separate chemical earth pits." },
      { step: "04", name: "Grid Sync", desc: "Joint inspection with DISCOM assistant engineers and bi-directional test." }
    ],
    cards: [
      {
        title: "Residential Rooftop Mounting",
        desc: "Tailored to Indian concrete RCC terraces, preserving walking space and drying areas.",
        img: "images/feat_installation.png",
        checklist: ["Elevated structures available", "Zero roof water leakage", "Clean concealed wiring conduits"]
      },
      {
        title: "Commercial & Industrial Setups",
        desc: "Large-scale solar installations for factories, warehouses, schools, and hospitals.",
        img: "images/feat_amc.png",
        checklist: ["Trapezoidal sheet clamps", "Walkway & safety lifeline setup", "LT/HT breaker synchronization"]
      },
      {
        title: "Net Metering Commissioning",
        desc: "End-to-end liaison with APSPDCL from initial sanction to bi-directional meter installation.",
        img: "images/feat_app.png",
        checklist: ["DISCOM test certificate", "Export/import meter programming", "Portal subsidy claim submission"]
      }
    ],
    faqs: [
      { q: "How long does physical rooftop installation take?", a: "For residential systems up to 10kW, physical mounting and wiring is completed within 48 hours. Net-meter inspection by DISCOM takes another 5-10 working days." },
      { q: "Will installation disrupt my household power supply?", a: "No. Your normal power remains on throughout the structural mounting. Only a brief 20-minute shutdown is needed during final inverter connection to your main distribution board." },
      { q: "Do you handle the APSPDCL net meter replacement?", a: "Yes. Solarfi handles the entire process — from testing the bi-directional meter at the departmental testing lab to on-site sealing and energization." }
    ]
  },
  {
    filename: "operations-maintenance.html",
    title: "Operations & Maintenance (O&M)",
    meta_title: "Solar O&M & Annual Maintenance Contracts | Solarfi",
    meta_desc: "Keep your solar system generating at peak capacity with Solarfi AMC services. Real-time generation alerts, panel cleaning, and electrical health checkups.",
    subtitle: "Protect Your Solar Investment with Proactive AMC & Live Monitoring",
    breadcrumb: "Operations & Maintenance",
    service_pill: "04 · Long-Term Care",
    header_svg: `<svg viewBox="0 0 540 280" fill="none" class="solar-flow-svg">
      <rect width="540" height="280" fill="#0d141e" rx="20"/>
      <!-- Pulse radar -->
      <circle cx="270" cy="130" r="70" stroke="rgba(34,197,94,0.3)" stroke-width="2"/>
      <circle cx="270" cy="130" r="45" stroke="rgba(34,197,94,0.5)" stroke-width="2"/>
      <circle cx="270" cy="130" r="20" fill="#22c55e"/>
      <text x="270" y="235" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">24/7 Smart Telemetry &amp; Field AMC</text>
      <text x="270" y="255" fill="#9ca3af" font-size="12" text-anchor="middle">Free 1st Year AMC · Immediate Local AP Dispatch</text>
    </svg>`,
    info_title: "Protect Your Generation Yield for Decades to Come",
    left_image: "images/savings_solar_home.png",
    features: [
      { title: "Free 1st Year AMC", desc: "Complimentary comprehensive maintenance included with every Solarfi system." },
      { title: "De-ionized Cleaning", desc: "Regular de-soiling visits restoring up to 15% generation lost to dry dust." },
      { title: "Infrared Thermal Scan", desc: "Drone thermal imaging to detect hot spots, diode failures, and micro-cracks." },
      { title: "Local AP Service Fleet", desc: "Pulivendula based response team resolving inverter issues within 24 hours." }
    ],
    right_text: "Solar panels are built to generate for 30+ years, but local dust, heat, and grid fluctuations require routine maintenance to ensure peak efficiency. Solarfi offers end-to-end Operations & Maintenance (O&M) contracts. We monitor your system via smart cloud telemetry, notify you of anomalies, and dispatch field technicians for preventive care.",
    checklist: [
      "24/7 Remote Generation Monitoring with Instant WhatsApp Alerts",
      "Scheduled High-Pressure Panel Cleaning & Soil Removal",
      "Thermographic Hotspot Scanning & Inverter Diagnostics",
      "Earthing Resistance Audits & Lightning Protection Checks"
    ],
    right_img: "images/100-projets-completion.jpeg",
    process_steps: [
      { step: "01", name: "Telemetry Monitoring", desc: "Inverter sends 5-minute generation metrics to our local monitoring station." },
      { step: "02", name: "Automated Alerts", desc: "System flags any grid drop, under-voltage, or panel string mismatch." },
      { step: "03", name: "Scheduled Visits", desc: "Technicians clean panels and check connection torques every quarter." },
      { step: "04", name: "Performance Report", desc: "Monthly summary sent to you documenting kWh generated and ₹ saved." }
    ],
    cards: [
      {
        title: "Comprehensive AMC Package",
        desc: "Complete peace of mind covering all electrical components, quarterly cleaning, and emergency repairs.",
        img: "images/feat_amc.png",
        checklist: ["Quarterly deep cleaning visits", "Priority on-site technician dispatch", "Free fuse, SPD, and cable replacements"]
      },
      {
        title: "Remote Monitoring Support",
        desc: "Live generation tracking on your smartphone with instant fault diagnosis from our command hub.",
        img: "images/feat_app.png",
        checklist: ["Daily generation vs target graphs", "Inverter error code decoding", "Export credit tracking on bill"]
      },
      {
        title: "System Retrofits & Upgrades",
        desc: "Expand your existing rooftop plant, add battery storage, or integrate EV charging points.",
        img: "images/feat_warranty.png",
        checklist: ["Hybrid inverter conversions", "Lithium battery retrofits", "Panel capacity expansion"]
      }
    ],
    faqs: [
      { q: "How often should solar panels be cleaned in Andhra Pradesh?", a: "Due to dry weather and agricultural dust in Rayalaseema, panels should be cleaned every 15-20 days. Clean panels yield up to 15% more power than dusty panels." },
      { q: "What is included in the free 1st year AMC?", a: "Our free 1st year AMC includes quarterly on-site panel washing, electrical connection checkups, inverter firmware updates, and unlimited emergency diagnostic visits." },
      { q: "How do I renew my AMC after the first year?", a: "We offer affordable annual AMC renewals starting at low annual rates, ensuring your system remains under certified engineer protection indefinitely." }
    ]
  },
  {
    filename: "ev-charging-battery-storage.html",
    title: "EV Charging & Battery Storage",
    meta_title: "EV Charging & Battery Storage Solutions | Solarfi",
    meta_desc: "Future-proof your home with hybrid solar systems, lithium battery storage, and smart EV charging in Andhra Pradesh. Power day and night.",
    subtitle: "Complete Energy Independence: Clean Solar Power Day and Night",
    breadcrumb: "EV Charging & Storage",
    service_pill: "05 · Future Mobility",
    header_svg: `<svg viewBox="0 0 540 280" fill="none" class="solar-flow-svg">
      <rect width="540" height="280" fill="#0d141e" rx="20"/>
      <!-- Battery icon -->
      <rect x="140" y="80" width="100" height="120" rx="16" fill="#1e293b" stroke="#22c55e" stroke-width="2"/>
      <rect x="165" y="65" width="50" height="15" rx="6" fill="#22c55e"/>
      <rect x="155" y="110" width="70" height="70" rx="8" fill="rgba(34,197,94,0.3)"/>
      <text x="190" y="152" fill="#22c55e" font-size="18" font-weight="800" text-anchor="middle">LiFePO4</text>
      <!-- EV Charging connector -->
      <circle cx="380" cy="140" r="50" fill="#1e293b" stroke="#f97316" stroke-width="2"/>
      <path d="M375 115 L365 145 L385 145 L375 170" stroke="#f97316" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="270" y="240" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle">Hybrid Solar · Lithium Storage · Type-2 EV Fast Charge</text>
    </svg>`,
    info_title: "Power Your Home Today, Charge Your Vehicle for Free Tomorrow",
    left_image: "images/hero_family_solar.png",
    features: [
      { title: "Hybrid-Ready Architecture", desc: "Seamless transition between solar, battery, and DISCOM grid in under 10ms." },
      { title: "LiFePO4 Battery Safety", desc: "Safe, non-combustible lithium iron phosphate chemistry with 6,000+ cycles." },
      { title: "Type-2 Fast EV Charging", desc: "7.4kW and 11kW AC chargers compatible with all Indian 2-wheeler and 4-wheeler EVs." },
      { title: "10-Year Battery Warranty", desc: "Long-lasting battery packs with intelligent Battery Management Systems (BMS)." }
    ],
    right_text: "At Solarfi, we design and install hybrid solar energy systems that combine rooftop solar generation with advanced lithium battery storage and electric vehicle (EV) charging. Whether you want 100% backup during summer outages or free fuel for your electric car, our integrated solutions ensure complete power security.",
    checklist: [
      "Hybrid Inverter with Zero-Flicker Backup (< 10ms UPS Transfer)",
      "High-Cycle LiFePO4 Lithium Batteries with 10-Year Service Life",
      "Smart EV Wallbox Integration (Type-1 & Type-2 Sockets)",
      "Automated Time-of-Use Peak Shaving Configuration"
    ],
    right_img: "images/savings_solar_home.png",
    process_steps: [
      { step: "01", name: "Backup Load Audit", desc: "Calculating critical appliances (refrigerator, lights, fans, AC, EV)." },
      { step: "02", name: "Hybrid Sizing", desc: "Matching panel wattage to daytime loads and battery storage capacity." },
      { step: "03", name: "BMS & Charger Wiring", desc: "Installing intelligent battery cabinets and dedicated EV charging breakers." },
      { step: "04", name: "Smart App Setup", desc: "Configuring auto-switch thresholds and EV charging schedules." }
    ],
    cards: [
      {
        title: "Lithium Battery Energy Storage",
        desc: "Modular lithium battery packs that charge from excess solar during the day and power your home through the night.",
        img: "images/feat_app.png",
        checklist: ["6,000+ deep discharge cycles", "Compact wall-mount design", "Zero maintenance required"]
      },
      {
        title: "Home & Commercial EV Charging",
        desc: "Dedicated Level-2 AC wallbox chargers powering electric cars directly from daytime rooftop sunshine.",
        img: "images/feat_installation.png",
        checklist: ["Type-2 universal socket", "RFID authentication & auto-cutoff", "Weatherproof IP65 outdoor casing"]
      },
      {
        title: "Smart Hybrid Inverter System",
        desc: "Bi-directional intelligent inverters managing dynamic power flow between solar, battery, and DISCOM net-metering.",
        img: "images/feat_amc.png",
        checklist: ["Seamless UPS backup function", "Excess power export to grid", "Customizable peak-hour priority"]
      }
    ],
    faqs: [
      { q: "Can I charge my EV directly with rooftop solar?", a: "Yes! A 3kW to 5kW Solarfi rooftop system generates plenty of excess daytime energy to charge electric two-wheelers and four-wheelers completely free of grid tariffs." },
      { q: "How long does a lithium battery bank provide backup?", a: "A standard 5kWh lithium battery powers typical residential essential loads (fans, LED lights, Wi-Fi, and refrigerator) for 8 to 12 hours during an outage." },
      { q: "Can battery storage be added to my existing on-grid solar plant?", a: "Yes. Solarfi installs AC-coupled battery retrofit systems that connect seamlessly to existing on-grid installations without replacing your current panels or inverter." }
    ]
  }
];

function buildFeatures(features) {
  return features.map(f => `
    <div class="feature-item">
      <div class="icon-circle">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <h4>${f.title}</h4>
      <p>${f.desc}</p>
    </div>
  `).join('');
}

function buildChecklist(checklist) {
  return checklist.map(item => `<li>${item}</li>`).join('\n');
}

function buildProcess(steps) {
  return `
    <div class="timeline-grid" style="grid-template-columns: repeat(4, 1fr); margin-top: 32px;">
      ${steps.map(s => `
        <div class="timeline-node">
          <div class="timeline-circle">${s.step}</div>
          <div>
            <div class="timeline-title">${s.name}</div>
            <div class="timeline-desc">${s.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function buildCards(cards) {
  return cards.map(c => `
    <div class="offer-card">
      <div class="card-header">
        <h3>${c.title}</h3>
      </div>
      <div class="card-middle">
        <img src="${c.img}" alt="${c.title}" class="card-img" loading="lazy" width="380" height="200" />
      </div>
      <div class="card-body">
        <p>${c.desc}</p>
        <ul class="card-list">
          ${c.checklist.map(item => `
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              ${item}
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function buildFaqs(faqs) {
  return faqs.map((f, i) => `
    <div class="faq-item ${i === 0 ? 'open' : ''}" onclick="toggleFaq(this)">
      <button type="button" class="faq-q">${f.q} <span class="arrow">&#8964;</span></button>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>
  `).join('');
}

function renderPage(page) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.meta_title}</title>
  <meta name="description" content="${page.meta_desc}" />
  <link rel="canonical" href="https://solarfi.in/${page.filename}" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="${page.meta_title}" />
  <meta property="og:description" content="${page.meta_desc}" />
  <meta property="og:url" content="https://solarfi.in/${page.filename}" />
  <meta property="og:image" content="images/logo.png" />

  <link rel="icon" type="image/png" href="images/favicon.png" />
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="inner.css" />
  <link rel="stylesheet" href="graphics.css" />

  <!-- Chatbot Integration -->
  <script type="module" src="n8n-chat.js"></script>

  <!-- Motion Choreography ES Module -->
  <script type="module" src="motion.js"></script>
</head>

<body>

  <!-- ── 1. Top Navigation Bar ─────────────────────────────────────────── -->
  <nav id="navbar" aria-label="Main Navigation">
    <div class="nav-inner">
      <a href="index.html" class="logo" aria-label="Solarfi Home">
        <img src="images/logo.png" alt="Solarfi Logo" class="logo-icon" width="200" height="66" />
      </a>

      <div class="nav-links">
        <a href="index.html#features">Why Solarfi</a>
        <div class="nav-dropdown">
          <a href="#services" style="color:#ffffff;">Services ▾</a>
          <div class="dropdown-content">
            <a href="design-engineering.html">Design &amp; Engineering</a>
            <a href="procurement.html">Procurement Supply</a>
            <a href="installation-commissioning.html">Installation &amp; Commissioning</a>
            <a href="operations-maintenance.html">Operations &amp; Maintenance</a>
            <a href="ev-charging-battery-storage.html">EV Charging Integration</a>
          </div>
        </div>
        <a href="index.html#savings">Savings Calculator</a>
        <a href="about-us.html">About Us</a>
        <a href="contact-us.html">Contact Us</a>
      </div>

      <div class="nav-actions">
        <a href="https://wa.me/917358258385?text=Hello%20Solarfi%20Team%2C%20I'm%20interested%20in%20${encodeURIComponent(page.title)}."
          target="_blank" rel="noopener noreferrer" class="nav-wa-btn" aria-label="WhatsApp Us">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp Us
        </a>
        <a href="contact-us.html" class="nav-cta">Get Free Quote</a>
      </div>

      <div class="hamburger" id="hamburger" onclick="toggleMenu()" aria-label="Toggle navigation menu">
        <span></span><span></span><span></span>
      </div>
    </div>

    <div class="mobile-menu" id="mobileMenu">
      <a href="index.html#features">Why Solarfi</a>
      <div class="mobile-dropdown">
        <a href="javascript:void(0)" onclick="this.parentElement.classList.toggle('open')">Services ▾</a>
        <div class="mobile-dropdown-content">
          <a href="design-engineering.html">Design &amp; Engineering</a>
          <a href="procurement.html">Procurement Supply</a>
          <a href="installation-commissioning.html">Installation &amp; Commissioning</a>
          <a href="operations-maintenance.html">Operations &amp; Maintenance</a>
          <a href="ev-charging-battery-storage.html">EV Charging Integration</a>
        </div>
      </div>
      <a href="index.html#savings">Savings Calculator</a>
      <a href="about-us.html">About Us</a>
      <a href="contact-us.html">Contact Us</a>
      <a href="https://wa.me/917358258385" target="_blank" rel="noopener noreferrer" style="color:#25d366;font-weight:700">💬 Chat on WhatsApp</a>
    </div>
  </nav>

  <!-- ── 2. Banner ──────────────────────────────────────────────────────── -->
  <div class="inner-banner">
    <div class="inner-banner-content">
      <div style="margin-bottom: 12px;"><span class="sec-tag">${page.service_pill}</span></div>
      <h1 class="motion-mask-title">${page.title}</h1>
      <p>${page.subtitle}</p>
    </div>
  </div>

  <!-- ── 3. Breadcrumb ──────────────────────────────────────────────────── -->
  <div class="breadcrumb">
    <div class="breadcrumb-inner">
      <a href="index.html">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        Home
      </a>
      <span>/</span>
      Services
      <span>/</span>
      ${page.breadcrumb}
    </div>
  </div>

  <!-- ── 4. Main Service Info Section ───────────────────────────────────── -->
  <section class="info-section">
    <div class="section-inner">
      <div class="section-heading-center">
        <span class="sec-tag">Service Overview</span>
        <h2 class="sec-title">${page.info_title}</h2>
      </div>

      <div class="info-grid">
        <!-- Left Column -->
        <div class="info-left">
          <div class="info-left-img">
            <img src="${page.left_image}" alt="${page.title} Overview" loading="lazy" width="600" height="380" />
          </div>
          <div class="features-row">
            ${buildFeatures(page.features)}
          </div>
        </div>

        <!-- Right Column -->
        <div class="info-right">
          <p>${page.right_text}</p>
          <ul class="green-checklist">
            ${buildChecklist(page.checklist)}
          </ul>
          <div class="info-right-img">
            <img src="${page.right_img}" alt="${page.title} Execution" loading="lazy" width="600" height="360" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── 5. Distinctive Process Steps ──────────────────────────────────── -->
  <section class="section" style="background:#f9fafb; border-top:1px solid var(--hairline-light); border-bottom:1px solid var(--hairline-light);">
    <div class="section-inner">
      <div class="section-heading-center">
        <span class="sec-tag">Execution Workflow</span>
        <h2 class="sec-title">How We Deliver <span>${page.title}</span></h2>
        <p class="sec-sub">Our standardized engineering protocol guaranteeing safety, durability, and maximum generation in Andhra Pradesh.</p>
      </div>

      ${buildProcess(page.process_steps)}
    </div>
  </section>

  <!-- ── 6. What We Offer (Service Breakdown Cards) ────────────────────── -->
  <section class="offer-section" id="services">
    <div class="section-inner">
      <div class="section-heading-center">
        <span class="sec-tag">Specifications &amp; Scope</span>
        <h2 class="sec-title">What's Included in <span>This Service</span></h2>
      </div>

      <div class="cards-grid">
        ${buildCards(page.cards)}
      </div>
    </div>
  </section>

  <!-- ── 7. Service Specific FAQs ──────────────────────────────────────── -->
  <section class="faq-section" id="faq">
    <div class="faq-layout">
      <div class="faq-left">
        <div class="faq-left-heading">Questions Regarding ${page.title}</div>
        <div class="faq-img-wrap">
          <img src="images/faq_couple.png" alt="Consulting about ${page.title}" loading="lazy" width="500" height="420" />
          <div class="faq-img-overlay">
            <h4>Have Specific Site Questions?</h4>
            <p>Our Pulivendula engineering desk is ready to assist with roof measurements and DISCOM rules.</p>
            <a href="tel:+917358258385" class="faq-cta-btn">📞 Talk to an Engineer</a>
          </div>
        </div>
      </div>

      <div class="faq-right">
        <h2>Expert Answers</h2>
        <div class="faq-list">
          ${buildFaqs(page.faqs)}
        </div>
      </div>
    </div>
  </section>

  <!-- ── 8. CTA Banner ────────────────────────────────────────────────── -->
  <div class="cta-banner" id="getquote">
    <div style="max-width: 820px; margin: 0 auto; position: relative; z-index: 2;">
      <h2>Ready to Get Started with ${page.title}? ☀️</h2>
      <p>Book your free technical site survey today. We will assess your load, roof geometry, and subsidy eligibility in Pulivendula within 24 hours.</p>
      <div class="cta-btns">
        <a href="tel:+917358258385" class="btn-white">📞 Call +91 7358258385</a>
        <a href="contact-us.html" class="btn-outline-w">Request Technical Quote →</a>
      </div>
    </div>
  </div>

  <!-- ── 9. Master Footer ──────────────────────────────────────────────── -->
  <footer class="new-footer">
    <div class="grain-overlay" aria-hidden="true"></div>
    <div class="fc-container">
      <div class="ft-top">
        <div class="fc">
          <h4 class="fc-title">About Solarfi</h4>
          <p class="fc-desc">Discover smart, reliable rooftop solar EPC solutions with Solarfi. From precision design to certified installations, we empower homes, businesses, and institutions across Andhra Pradesh to generate clean, low-cost power.</p>
          <div class="fc-social">
            <a href="https://www.instagram.com/solarfi_pvt_ltd" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="https://www.facebook.com/share/1B56Nxq1ak/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://youtube.com/@solarpvsystem?si=Oz05mA4xD6JQelbi" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        <div class="fc">
          <h4 class="fc-title">Quick Links</h4>
          <ul class="fc-links">
            <li><a href="index.html#features">Why Solarfi</a></li>
            <li><a href="index.html#process">How It Works</a></li>
            <li><a href="index.html#savings">Savings Calculator</a></li>
            <li><a href="index.html#testimonials">Customer Reviews</a></li>
            <li><a href="index.html#faq">Frequently Asked Questions</a></li>
            <li><a href="contact-us.html">Request Free Quote</a></li>
          </ul>
        </div>

        <div class="fc">
          <h4 class="fc-title">Our Services</h4>
          <ul class="fc-links">
            <li><a href="design-engineering.html">Design &amp; Engineering</a></li>
            <li><a href="procurement.html">Procurement &amp; Supply</a></li>
            <li><a href="installation-commissioning.html">Installation &amp; Commissioning</a></li>
            <li><a href="operations-maintenance.html">Operations &amp; Maintenance (AMC)</a></li>
            <li><a href="ev-charging-battery-storage.html">EV Charging &amp; Battery Storage</a></li>
          </ul>
        </div>
      </div>

      <div class="ft-mid">
        <div class="fc-address">
          <h4 class="fc-title">INDIA Headquarters</h4>
          <p>D.no: 3-6, Dr.Somireddy Towers, Guntha Bazar Rd, Pulivendula, Andhra Pradesh 516390, India.<br>
            <strong>Phone:</strong> <a href="tel:+917358258385" style="color:#22c55e;">+91 7358258385</a><br>
            <strong>Email:</strong> <a href="mailto:info@solarfi.in" style="color:#ffffff;">info@solarfi.in</a>
          </p>
        </div>

        <div class="fc-address">
          <h4 class="fc-title">USA Liaison Office</h4>
          <p>3021 Scanlan Ln NE, Rochester, MN 55906, United States.<br>
            <strong>Phone:</strong> <a href="tel:+15073581319" style="color:#ffffff;">+1 507-358-1319</a><br>
            <strong>Email:</strong> <a href="mailto:info@solarfi.in" style="color:#ffffff;">info@solarfi.in</a>
          </p>
        </div>
      </div>

      <div class="ft-bottom">
        <div>Copyright &copy; 2026 Solarfi. All Rights Reserved.</div>
        <div style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.45);">PM Surya Ghar Subsidy Partner · MNRE Compliant</div>
      </div>
    </div>
    <div class="footer-watermark">solarfi</div>
  </footer>

  <script>
    function toggleMenu() {
      document.getElementById('mobileMenu').classList.toggle('open');
      document.getElementById('hamburger').classList.toggle('open');
    }
    function toggleFaq(el) {
      const isOpen = el.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) el.classList.add('open');
    }
  </script>
</body>

</html>`;
}

// Generate all service pages
pages_data.forEach(page => {
  const content = renderPage(page);
  fs.writeFileSync(page.filename, content, 'utf-8');
  console.log(`Generated: ${page.filename}`);
});
