const fs = require('fs');

const pages_data = [
  {
    "filename": "design-engineering.html",
    "title": "Design & Engineering",
    "meta_title": "Solar Design & Engineering Services | Solarfi",
    "meta_desc": "Get award-winning solar design and engineering services with accurate yield predictions and MNRE-compliant blueprints.",
    "subtitle": "Precision Planning for Maximum Performance",
    "breadcrumb": "Design & Engineering",
    "info_subtitle": "PROJECTS SUPPLIED AND INSTALLED",
    "info_title": "Smart, Accurate Design",
    "left_image": "images/hero_family_solar.png",
    "features": [
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'/></svg>",
        "title": "Award-Winning Team",
        "desc": "Led by certified solar engineers with 10+ years of EPC experience across India."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>",
        "title": "Smart, Accurate Design",
        "desc": "We use LiDAR, drone mapping, and solar simulation tools for precise output predictions."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/></svg>",
        "title": "Customized Solutions",
        "desc": "Tailored solar layouts adapted perfectly for maximum efficiency and site limits."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/></svg>",
        "title": "Quick Turnaround",
        "desc": "Rapid delivery of engineering blueprints to fast-track your complete installation."
      }
    ],
    "right_text": "At Solarfi, we use best-in-class software for solar plant design. Our team evaluates your site, performs shadow analysis, and creates optimal layouts using AutoCAD & PVsyst. We deliver MNRE-compliant CAD designs ready for installation, approvals, and long-term performance.",
    "checklist": [
      "Shadow-Free Layout Planning",
      "High Yield System Design",
      "Engineering Drawings & Reports",
      "Scalable for Rooftop and Utility Projects"
    ],
    "right_img": "images/feat_installation.png",
    "cards": [
      {
        "title": "Solar Panel Design",
        "desc": "Custom design for optimal solar power performance tailored to your location and load.",
        "img": "images/feat_installation.png",
        "checklist": [
          "Site-specific tilt & azimuth planning",
          "Panel placement optimization",
          "Roof load distribution planning"
        ]
      },
      {
        "title": "Battery Integration Blueprint",
        "desc": "Ensure seamless battery performance with precise inverter compatibility and backup plans.",
        "img": "images/feat_amc.png",
        "checklist": [
          "Hybrid-ready wiring diagrams",
          "Inverter-battery compatibility",
          "Backup load priority design"
        ]
      },
      {
        "title": "Load Estimation & System Sizing",
        "desc": "Analyze energy demand and calculate required system size effectively.",
        "img": "images/feat_app.png",
        "checklist": [
          "Energy demand analysis",
          "Monthly generation simulation",
          "System sizing for residential, commercial & industrial"
        ]
      }
    ]
  },
  {
    "filename": "procurement.html",
    "title": "Procurement & Supply Services",
    "meta_title": "Solar Procurement & Supply Services | Solarfi",
    "meta_desc": "Top-quality solar components sourced directly from verified Tier-1 manufacturers with full warranty support.",
    "subtitle": "Top-Quality Solar Components Sourced & Delivered",
    "breadcrumb": "Procurement & Supply Services",
    "info_subtitle": "PROJECTS SUPPLIED AND INSTALLED",
    "info_title": "Reliable Procurement for Long-Lasting Solar Performance",
    "left_image": "images/feat_installation.png",
    "features": [
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'/></svg>",
        "title": "Verified Partners",
        "desc": "We source our products directly from certified brands to ensure authenticity and optimal performance."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>",
        "title": "Efficient Logistics",
        "desc": "Our supply chain ensures timely delivery to site, reducing project delays."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/></svg>",
        "title": "Full Warranty Support",
        "desc": "All procured items come with manufacturer warranties and documentation."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/></svg>",
        "title": "Cost-Effective Pricing",
        "desc": "Competitive pricing for high-quality components without ever compromising on standard."
      }
    ],
    "right_text": "At Solarfi, we procure only Tier-1 solar panels, inverters, and mounting systems from trusted manufacturers like Vikram Solar, Waaree, and Growatt. All materials meet MNRE and BIS standards for quality, warranty, and reliability. We handle the entire supply chain — so you don't have to.",
    "checklist": [
      "Tier-1 Certified Equipment",
      "Verified Vendor Network",
      "Fast On-Site Delivery",
      "MNRE/BIS Compliant Materials"
    ],
    "right_img": "images/hero_family_solar.png",
    "cards": [
      {
        "title": "Solar Panel Supply",
        "desc": "High-efficiency mono & bifacial panels with long-term performance warranties from Tier-1 manufacturers.",
        "img": "images/feat_subsidy.png",
        "checklist": [
          "High-efficiency mono & bifacial panels",
          "Tier-1 rated by BloombergNEF",
          "Long-term performance warranties"
        ]
      },
      {
        "title": "Inverter & Mounting Hardware",
        "desc": "Compliant inverter solutions and galvanized mounting structures to handle monitoring capabilities.",
        "img": "images/feat_warranty.png",
        "checklist": [
          "On-grid, off-grid & hybrid inverters",
          "Galvanized mounting structures",
          "Remote monitoring hardware"
        ]
      },
      {
        "title": "Batteries & Accessories",
        "desc": "Complete range of energy storage solutions and essential accessories for optimal system performance.",
        "img": "images/feat_app.png",
        "checklist": [
          "Lithium & lead-acid batteries",
          "Surge protectors, DC cabling and connectors",
          "Electrical junction boxes"
        ]
      }
    ]
  },
  {
    "filename": "installation-commissioning.html",
    "title": "Installation & Commissioning Services",
    "meta_title": "Solar Installation & Commissioning | Solarfi",
    "meta_desc": "Professional, fast, and compliant solar installation services across India by MNRE-certified technicians.",
    "subtitle": "Seamless Solar Setups – Certified, Compliant, and Efficient",
    "breadcrumb": "Installation & Commissioning Services",
    "info_subtitle": "PROJECTS SUPPLIED AND INSTALLER",
    "info_title": "Flawless Execution from Panel to Power",
    "left_image": "images/feat_installation.png",
    "features": [
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'/></svg>",
        "title": "Certified Crew",
        "desc": "Our team consists of trained professionals with hands-on experience in urban and rural solar installations."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>",
        "title": "On-Time Execution",
        "desc": "We commit to fast-track installations with project timelines ranging from 3 to 14 days based on system size."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/></svg>",
        "title": "Complete Documentation",
        "desc": "We provide installation reports, test sheets and commissioning certificates for all projects."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/></svg>",
        "title": "Safety First Approach",
        "desc": "Strict adherence to electrical and structural safety standards without compromise."
      }
    ],
    "right_text": "At Solarfi, we ensure fail-proof installation and commissioning for rooftop, ground-mounted, and hybrid solar systems. Our MNRE-certified technicians ensure error-free execution from mounting to grid synchronization. We adhere strictly to local load limits, electrical codes, and site-specific standards for maximum system performance.",
    "checklist": [
      "Certified Installation Teams",
      "MNRE & DISCOM Compliance",
      "Fast Turnaround",
      "Grid-Ready Commissioning"
    ],
    "right_img": "images/hero_family_solar.png",
    "cards": [
      {
        "title": "Residential & Rooftop Setup",
        "desc": "Professional rooftop installations with net-metering-ready sizing for residential properties.",
        "img": "images/feat_subsidy.png",
        "checklist": [
          "MNRE/BIS compliant mounting",
          "Net-metering ready setup",
          "Earth, SPD & grounding installations"
        ]
      },
      {
        "title": "Commercial & Industrial Installations",
        "desc": "Large-scale installations for commercial and industrial applications with complete safety systems.",
        "img": "images/feat_amc.png",
        "checklist": [
          "Large-scale mounting & grid-compliant systems",
          "Internal AC/DC wiring & junction boxes",
          "Transformer set up with cabling & safety"
        ]
      },
      {
        "title": "Hybrid & EV Integration",
        "desc": "Advanced hybrid systems with EV charging integration and intelligent backup configurations.",
        "img": "images/feat_app.png",
        "checklist": [
          "EV charging point integrations",
          "Battery-inverter wiring",
          "Auto-switch backup configurations"
        ]
      }
    ]
  },
  {
    "filename": "operations-maintenance.html",
    "title": "Operations & Maintenance (O&M)",
    "meta_title": "Solar Operations & Maintenance (O&M) | Solarfi",
    "meta_desc": "Maximize your solar investment with our proactive O&M services, real-time monitoring, and detailed reporting.",
    "subtitle": "Ensure Peak Performance with Smart Solar Care",
    "breadcrumb": "Operations & Maintenance (O&M)",
    "info_subtitle": "PROJECTS SUPPLIED AND INSTALLER",
    "info_title": "Protect Your Solar Investment for Years to Come",
    "left_image": "images/hero_family_solar.png",
    "features": [
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'/></svg>",
        "title": "Real-Time Monitoring",
        "desc": "We track system health constantly and detect faults before they affect performance."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>",
        "title": "Trained Maintenance Crew",
        "desc": "Our technicians conduct regular inspections, panel cleaning, inverter checks, and electrical testing."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/></svg>",
        "title": "Detailed Reporting",
        "desc": "You'll receive monthly performance reports, fault summaries, and maintenance records."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/></svg>",
        "title": "Maximized Uptime",
        "desc": "Proactive checks to ensure your system never stops generating and downtime is eliminated."
      }
    ],
    "right_text": "At Solarfi, our Operations & Maintenance (O&M) services are built to keep your solar system running at optimal capacity. We offer real-time monitoring, preventive maintenance, and remote fault detection to ensure high uptime and maximum ROI. Our support doesn't stop at installation — we stay with you for the long run.",
    "checklist": [
      "Live Monitoring & Alerts",
      "Preventive Site Visits",
      "Remote Diagnostics",
      "Annual Maintenance Contracts (AMC)"
    ],
    "right_img": "images/feat_app.png",
    "cards": [
      {
        "title": "Remote Performance Tracking",
        "desc": "Comprehensive monitoring systems with real-time alerts and performance tracking capabilities.",
        "img": "images/feat_app.png",
        "checklist": [
          "Live generation status on mobile/web portal",
          "Alert system for inverter failures",
          "Load mismatch notifications"
        ]
      },
      {
        "title": "Scheduled Maintenance",
        "desc": "Regular preventive maintenance services to ensure optimal system performance and longevity.",
        "img": "images/feat_amc.png",
        "checklist": [
          "Periodic panel cleaning",
          "Thermal scanning for hotspots",
          "Cable and junction box inspections"
        ]
      },
      {
        "title": "AMC Packages & Upgrades",
        "desc": "Comprehensive maintenance contracts and upgrade services tailored to your system needs.",
        "img": "images/feat_warranty.png",
        "checklist": [
          "Custom AMC contracts",
          "Battery health checkups",
          "System expansions & retrofits support"
        ]
      }
    ]
  },
  {
    "filename": "ev-charging-battery-storage.html",
    "title": "EV Charging & Battery Storage",
    "meta_title": "EV Charging & Battery Storage Solutions | Solarfi",
    "meta_desc": "Future-proof your energy with hybrid solar systems, reliable battery storage, and smart EV charging integration.",
    "subtitle": "Future-Ready Energy For Homes, Businesses & Mobility",
    "breadcrumb": "EV Charging & Battery Storage",
    "info_subtitle": "PROJECTS SUPPLIED AND INSTALLED",
    "info_title": "Power Today, Store for Tomorrow",
    "left_image": "images/feat_installation.png",
    "features": [
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'/></svg>",
        "title": "Battery-Ready Systems",
        "desc": "All new installations are upgradeable to hybrid mode when inverters become inoperable."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>",
        "title": "EV Charging Integration",
        "desc": "Install EV compatible solar setups with standard Type 2 or fast DC charging options."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/></svg>",
        "title": "Smart Energy Usage",
        "desc": "Our systems automatically store excess solar and manage power flow during peak hours."
      },
      {
        "icon": "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/></svg>",
        "title": "Future-Proof Design",
        "desc": "Easily scalable systems engineered to accommodate your future extra loads and storages."
      }
    ],
    "right_text": "At Solarfi, we design and install hybrid solar systems that support both battery storage and EV charging. Whether you're powering a home, office, or electric vehicle, our solutions ensure energy independence and uninterrupted power day or night. We integrate lithium batteries, smart charge controllers, and EV-ready wiring right at the power source.",
    "checklist": [
      "Hybrid Solar System Design",
      "EV Charging Point Installation",
      "Lithium & Lead-Acid Battery Supply",
      "Backup Power During Outages"
    ],
    "right_img": "images/savings_solar_home.png",
    "cards": [
      {
        "title": "Battery Storage Setup",
        "desc": "Complete battery backup solutions with smart inverter integration for reliable backup power.",
        "img": "images/feat_app.png",
        "checklist": [
          "Lithium-Ion & lead-acid options",
          "Inverter battery sizing & wiring",
          "Night-time backup configuration"
        ]
      },
      {
        "title": "EV Charging Station Installation",
        "desc": "Professional EV charging station installation with various charging options for all vehicle types.",
        "img": "images/hero_family_solar.png",
        "checklist": [
          "Type 1/Type 2 sockets for 2-wheelers & 4-wheelers",
          "DC fast charging for commercial spaces",
          "Wall-mounted and outdoor installations"
        ]
      },
      {
        "title": "Hybrid System Management",
        "desc": "Intelligent energy management systems that optimize power flow between solar, battery, and grid.",
        "img": "images/feat_amc.png",
        "checklist": [
          "Load prioritization settings",
          "Auto-switch between solar, battery & grid",
          "Monitoring via mobile apps"
        ]
      }
    ]
  }
];

const html_template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>__META_TITLE__</title>
  <meta name="description" content="__META_DESC__">
  <link rel="icon" type="image/png" href="images/favicon.png">
  <link href="inner.css" rel="stylesheet">
</head>
<body>

  <!-- HEADER/NAV -->
  <nav id="navbar">
    <div class="nav-inner">
      <a href="index.html" class="logo">
        <img src="images/logo.png" alt="Solarfi Logo" class="logo-icon">
      </a>
      <div class="nav-links">
        <a href="index.html#features">Why Solarfi</a>
        <div class="nav-dropdown">
          <a href="#services">Services ▾</a>
          <div class="dropdown-content">
            <a href="design-engineering.html">Design & Engineering</a>
            <a href="procurement.html">Procurement Supply</a>    <a href="installation-commissioning.html">Installation & Comm.</a>
            <a href="operations-maintenance.html">Operations & Maintenance</a>
            <a href="ev-charging-battery-storage.html">EV Charging Integration</a>
          </div>
        </div>
        <a href="index.html#savings">Calculator</a>
        <a href="index.html#process">About Us</a>
        <a href="contact-us.html">Contact Us</a>
      </div>
      <a href="contact-us.html" class="nav-cta">Get Free Quote</a>
      <div class="hamburger" id="hamburger" onclick="this.classList.toggle('open'); document.getElementById('mobileMenu').classList.toggle('open')">
        <span></span><span></span><span></span>
      </div>
    </div>
    <div class="mobile-menu" id="mobileMenu">
      <a href="index.html#features">Why Solarfi</a>
      <div class="mobile-dropdown">
        <a href="javascript:void(0)" onclick="this.parentElement.classList.toggle('open')">Services ▾</a>
        <div class="mobile-dropdown-content">
          <a href="design-engineering.html">Design & Eng.</a>
          <a href="procurement.html">Procurement Supply</a>
          <a href="installation-commissioning.html">Installation Setups</a>
          <a href="operations-maintenance.html">Operations & Maintenance</a>
          <a href="ev-charging-battery-storage.html">EV Charging</a>
        </div>
      </div>
      <a href="index.html#savings">Calculator</a>
      <a href="index.html#process">About Us</a>
      <a href="contact-us.html">Contact Us</a>
      <a href="contact-us.html" style="color:#fbbf24;font-weight:700">Get Free Quote →</a>
    </div>
  </nav>

  <!-- BANNER -->
  <div class="inner-banner">
    <div class="inner-banner-content animate-up">
      <h1>__TITLE__</h1>
      <p>__SUBTITLE__</p>
    </div>
  </div>

  <!-- BREADCRUMB -->
  <div class="breadcrumb">
    <div class="breadcrumb-inner">
      <a href="index.html">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> 
        Home
      </a> 
      <span>/</span> 
      __BREADCRUMB__
    </div>
  </div>

  <!-- MAIN INFO SECTION -->
  <section class="info-section">
    <div class="sec-heading-centered animate-up">
      <div class="yellow-bolt">⚡</div>
      <span class="sec-tagline">__INFO_SUBTITLE__</span>
      <h2 class="main-title">__INFO_TITLE__</h2>
    </div>

    <div class="info-grid">
      <!-- Left -->
      <div class="info-left">
        <div class="info-left-img animate-up">
          <img src="__LEFT_IMAGE__" alt="__TITLE__ Image">
        </div>
        <div class="features-row">
          __FEATURES_HTML__
        </div>
      </div>
      <!-- Right -->
      <div class="info-right animate-up delay-100">
        <p>__RIGHT_TEXT__</p>
        <ul class="green-checklist">
          __CHECKLIST_HTML__
        </ul>
        <div class="info-right-img">
          <img src="__RIGHT_IMG__" alt="Solar Installation">
        </div>
      </div>
    </div>
  </section>

  <!-- WHAT WE OFFER -->
  <section class="offer-section">
    <div class="sec-heading-centered animate-up">
      <div class="yellow-bolt">⚡</div>
      <span class="sec-tagline">WHAT WE OFFER</span>
      <h2 class="main-title">Best Offer For Renewable<br><span>Solar Solutions</span></h2>
    </div>

    <div class="cards-grid">
      __CARDS_HTML__
    </div>
    
  </section>
  
  <!-- FREQUENTLY ASKED QUESTIONS -->
  <section class="faq-section" id="faq">
    <div class="faq-layout animate-up">
      <div class="faq-left">
        <div class="faq-left-heading">The Answers You Need For A Solar Rooftop System</div>
        <div class="faq-img-wrap">
          <img src="images/faq_couple.png" alt="Indian couple consulting about solar" />
          <div class="faq-img-overlay">
            <h4>Still Have A Question?</h4>
            <p>Don't worry, we're here for free consultation. Just click the button below.</p>
            <a href="tel:+91 7358258385" class="faq-cta-btn">📞 Talk to an Expert</a>
          </div>
        </div>
      </div>
      <div class="faq-right">
        <h2>Your Questions, Answered</h2>
        <div class="faq-list">
          <div class="faq-item open" onclick="toggleFaq(this)">
            <button class="faq-q">Who can apply for the rooftop solar subsidy? <span class="arrow">&#8964;</span></button>
            <div class="faq-a">
              <p>Any Indian homeowner with a valid electricity connection and rooftop space can apply under the PM Surya Ghar Yojana. Both urban and rural homeowners across all states are eligible.</p>
            </div>
          </div>
          <div class="faq-item" onclick="toggleFaq(this)">
            <button class="faq-q">How much subsidy do I get for a 3kW system? <span class="arrow">&#8964;</span></button>
            <div class="faq-a">
              <p>For a 3kW system, you can receive up to ₹78,000 under PM Surya Ghar — ₹30,000/kW for the first 2kW and ₹18,000/kW for the 3rd kW.</p>
            </div>
          </div>
          <div class="faq-item" onclick="toggleFaq(this)">
            <button class="faq-q">What documents are needed to apply? <span class="arrow">&#8964;</span></button>
            <div class="faq-a">
              <p>You'll need your Aadhaar card, electricity bill (last 3 months), bank passbook, and a recent passport-size photo. Solarfi handles all the paperwork.</p>
            </div>
          </div>
          <div class="faq-item" onclick="toggleFaq(this)">
            <button class="faq-q">How long does installation take? <span class="arrow">&#8964;</span></button>
            <div class="faq-a">
              <p>Once approvals are in place, our certified team completes installation in just 48 hours. The total process from inquiry to live system is typically 7–14 days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA BANNER -->
  <div class="cta-banner" id="getquote">
    <div style="max-width:850px;margin:auto" class="animate-up">
      <h2><span class="blue-highlight">Your Solar Plan Is Ready</span> 🌞</h2>
      <p>Join 50,000+ happy homeowners who are saving big with Solarfi. Book your free site survey today and get your personalised solar proposal within 24 hours.</p>
      <div class="cta-btns">
        <a href="tel:+91 7358258385" class="btn-white">📞 Call Us Free</a>
        <a href="https://wa.me/917358258385" class="btn-outline-w">💬 WhatsApp Us</a>
      </div>
    </div>
  </div>

        <!-- FOOTER -->
  <style>
    .new-footer { background: var(--dark, #1e1b4b); color: #fff; padding: 60px 0 0; font-family: inherit; position: relative; overflow: hidden; }
    .fc-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 10; }
    .ft-top { display: grid; grid-template-columns: 1.8fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    
    .fc-title { 
      font-size: .78rem; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: .8px; 
      color: rgba(255, 255, 255, .6); 
      margin-bottom: 15px; 
      position: relative; 
      display: inline-block; 
      padding-bottom: 8px; 
    }
    .fc-title::after { content: ''; position: absolute; left: 0; bottom: 0; width: 40px; border-bottom: 1px dotted rgba(255,255,255,0.3); }
    
    .fc-desc { font-size: .92rem; color: rgba(255, 255, 255, .88); line-height: 1.8; margin-bottom: 20px; }
    .fc-social { display: flex; gap: 12px; margin-top: 4px; }
    .fc-social a { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid rgba(255, 255, 255, .4); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; transition: .2s; text-decoration: none; font-size: .85rem; }
    .fc-social a:hover { background: rgba(255, 255, 255, .2); border-color: #fff; }
    
    .fc-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .fc-links li a { color: #fff; text-decoration: none; font-size: 0.92rem; font-weight: 500; transition: 0.2s; }
    .fc-links li a:hover { color: var(--orange, #fbbf24); }
    
    .ft-mid { display: grid; grid-template-columns: 1.5fr 2fr; gap: 40px; padding: 30px 0; border-top: 1px solid rgba(255, 255, 255, .2); border-bottom: 1px solid rgba(255, 255, 255, .2); }
    .fc-address p { font-size: .92rem; color: #fff; font-weight: 500; line-height: 1.6; margin-top: 10px; }
    
    .ft-bottom { padding: 18px 0; text-align: center; color: rgba(255, 255, 255, .7); font-size: .82rem; }
    .new-footer .footer-watermark { font-size: clamp(5rem, 14vw, 11rem); font-weight: 900; color: rgba(255, 255, 255, .07); text-align: center; position: absolute; bottom: -20px; left: 0; right: 0; pointer-events: none; z-index: 0; text-transform: uppercase; margin: 0; line-height: 1; letter-spacing: -2px; }
    
    @media(max-width: 768px) {
      .ft-top { grid-template-columns: 1fr; gap: 30px; }
      .ft-mid { grid-template-columns: 1fr; gap: 30px; }
    }
  </style>
  <footer class="new-footer">
    <div class="fc-container">
      <div class="ft-top">
        <div class="fc">
          <h4 class="fc-title">About Us</h4>
          <p class="fc-desc">Discover smart, reliable solar EPC solutions with Solarfi. From AI-powered consultations to certified installations, we help homes, businesses & farms across India save energy and money. Get a free quote today!</p>
          <div class="fc-social">
            <a href="#">f</a>
            <a href="#">in</a>
          </div>
        </div>
        <div class="fc">
          <h4 class="fc-title">Quick Links</h4>
          <ul class="fc-links">
            <li><a href="index.html#features">Why Solarfi</a></li>
            <li><a href="index.html#process">How It Works</a></li>
            <li><a href="index.html#savings">Calculator</a></li>
            <li><a href="index.html#testimonials">Reviews</a></li>
            <li><a href="index.html#faq">FAQ</a></li>
            <li><a href="contact-us.html">Contact Us</a></li>
          </ul>
        </div>
        <div class="fc">
          <h4 class="fc-title">Services</h4>
          <ul class="fc-links">
            <li><a href="design-engineering.html">Design & Engineering</a></li>
            <li><a href="procurement.html">Procurement Supply</a></li>
            <li><a href="installation-commissioning.html">Installation Setups</a></li>
            <li><a href="operations-maintenance.html">Operations & Maintenance</a></li>
            <li><a href="ev-charging-battery-storage.html">EV Charging Integration</a></li>
          </ul>
        </div>
      </div>
      
      <div class="ft-mid">
        <div class="fc-address">
          <h4 class="fc-title">USA Office</h4>
          <p>3021 Scanlan Ln NE, Rochester, MN 55906, United States.<br>+1 507-358-1319<br>info@solarfi.in</p>
        </div>
        <div class="fc-address">
          <h4 class="fc-title">INDIA Office</h4>
          <p>D.no: 3-6, Dr.Somireddy Towers, Guntha Bazar Rd, Pulivendula, Andhra Pradesh 516390, India.<br>+91 7358258385</p>
        </div>
      </div>
      
      <div class="ft-bottom">
        Copyright © 2026 Solarfi. All Rights Reserved.
      </div>
    </div>
    <div class="footer-watermark">solarfi</div>
  </footer>

  <script>
    // Animate on scroll logic
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
    
    // FAQ accordion
    function toggleFaq(el) {
      const isOpen = el.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) el.classList.add('open');
    }
  </script>
</body>
</html>
`;

function buildFeatures(features) {
  let html = "";
  features.forEach((f, idx) => {
    // Adjust the icon styles for orange SVGs
    let modIcon = f.icon.replace("<svg ", "<svg style='color:#e27a3c;' ");

    html += `
        <div class="feature-item animate-up ${idx > 0 && idx % 2 !== 0 ? 'delay-100' : ''}">
            <div class="icon-circle">
              ${modIcon}
            </div>
            <h4>${f.title}</h4>
            <p>${f.desc}</p>
        </div>`;
  });
  return html;
}

function buildChecklist(checklist) {
  let html = "";
  checklist.forEach(item => {
    html += `<li>${item}</li>\n`;
  });
  return html;
}

function buildCards(cards) {
  let html = "";
  cards.forEach((card, idx) => {
    let delay = idx > 0 ? `delay-${idx + 1}00` : '';
    let clist = "";
    card.checklist.forEach(item => {
      clist += `<li><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>${item}</li>`;
    });
    html += `
      <div class="offer-card animate-up ${delay}">
        <div class="card-header">
          <h3>${card.title}</h3>
        </div>
        <div class="card-middle">
          <div class="card-icon-container">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <img src="${card.img}" alt="${card.title}" class="card-img" style="object-fit:cover;">
        </div>
        <div class="card-body">
          <p>${card.desc}</p>
          <ul class="card-list">
            ${clist}
          </ul>
        </div>
        <div class="dot-pattern"><span></span><span></span><span></span><span></span><span></span></div>
      </div>
        `;
  });
  return html;
}

pages_data.forEach(page => {
  let content = html_template
    .replace(/__META_TITLE__/g, page.meta_title)
    .replace(/__META_DESC__/g, page.meta_desc)
    .replace(/__TITLE__/g, page.title)
    .replace(/__SUBTITLE__/g, page.subtitle)
    .replace(/__BREADCRUMB__/g, page.breadcrumb)
    .replace(/__INFO_SUBTITLE__/g, page.info_subtitle)
    .replace(/__INFO_TITLE__/g, page.info_title)
    .replace(/__LEFT_IMAGE__/g, page.left_image)
    .replace(/__FEATURES_HTML__/g, buildFeatures(page.features))
    .replace(/__RIGHT_TEXT__/g, page.right_text)
    .replace(/__CHECKLIST_HTML__/g, buildChecklist(page.checklist))
    .replace(/__RIGHT_IMG__/g, page.right_img)
    .replace(/__CARDS_HTML__/g, buildCards(page.cards));

  fs.writeFileSync(page.filename, content, 'utf-8');
});
