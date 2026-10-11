import json

pages_data = [
    {
        "filename": "design-engineering.html",
        "title": "Design & Engineering",
        "subtitle": "Precision Planning for Maximum Performance",
        "breadcrumb": "Design & Engineering",
        "info_subtitle": "PROJECTS SUPPLIED AND INSTALLED",
        "info_title": "Smart, Accurate Design",
        "left_image": "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&q=80&w=800",
        "features": [
            {
                "title": "Award-Winning Team",
                "desc": "Led by certified solar engineers with 10+ years of EPC experience across India."
            },
            {
                "title": "Smart, Accurate Design",
                "desc": "We use LiDAR, drone mapping, and solar simulation tools for precise output predictions."
            }
        ],
        "right_text": "At Solarfi, we use best-in-class software for solar plant design. Our team evaluates your site, performs shadow analysis, and creates optimal layouts using AutoCAD & PVsyst. We deliver MNRE-compliant CAD designs ready for installation, approvals, and long-term performance.",
        "checklist": [
            "Shadow-Free Layout Planning",
            "High Yield System Design",
            "Engineering Drawings & Reports",
            "Scalable for Rooftop and Utility Projects"
        ],
        "right_img": "https://images.unsplash.com/photo-1611365892590-5fa356064f26?auto=format&fit=crop&q=80&w=800",
        "cards": [
            {
                "title": "Solar Panel Design",
                "desc": "Custom design for optimal solar power performance tailored to your location and load.",
                "checklist": [
                    "Site-specific tilt & azimuth planning",
                    "Panel placement optimization",
                    "Roof load distribution planning"
                ]
            },
            {
                "title": "Battery Integration Blueprint",
                "desc": "Ensure seamless battery performance with precise inverter compatibility and backup plans.",
                "checklist": [
                    "Hybrid-ready wiring diagrams",
                    "Inverter-battery compatibility",
                    "Backup load priority design"
                ]
            },
            {
                "title": "Load Estimation & System Sizing",
                "desc": "Analyze energy demand and calculate required system size effectively.",
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
        "subtitle": "Top-Quality Solar Components Sourced & Delivered",
        "breadcrumb": "Procurement & Supply Services",
        "info_subtitle": "PROJECTS SUPPLIED AND INSTALLED",
        "info_title": "Reliable Procurement for Long-Lasting Solar Performance",
        "left_image": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800",
        "features": [
            {
                "title": "Verified Partners",
                "desc": "We source our products directly from certified brands to ensure authenticity and optimal performance."
            },
            {
                "title": "Efficient Logistics",
                "desc": "Our supply chain ensures timely delivery to site, reducing project delays."
            },
             {
                "title": "Full Warranty Support",
                "desc": "All procured items come with manufacturer warranties and documentation."
            }
        ],
        "right_text": "At Solarfi, we procure only Tier-1 solar panels, inverters, and mounting systems from trusted manufacturers like Vikram Solar, Waaree, and Growatt. All materials meet MNRE and BIS standards for quality, warranty, and reliability. We handle the entire supply chain — so you don't have to.",
        "checklist": [
            "Tier-1 Certified Equipment",
            "Verified Vendor Network",
            "Fast On-Site Delivery",
            "MNRE/BIS Compliant Materials"
        ],
        "right_img": "https://images.unsplash.com/photo-1611365892590-5fa356064f26?auto=format&fit=crop&q=80&w=800",
        "cards": [
            {
                "title": "Solar Panel Supply",
                "desc": "High-efficiency mono & bifacial panels with long-term performance warranties from Tier-1 manufacturers.",
                "checklist": [
                    "High-efficiency mono & bifacial panels",
                    "Tier-1 rated by BloombergNEF",
                    "Long-term performance warranties"
                ]
            },
            {
                "title": "Inverter & Mounting Hardware",
                "desc": "Compliant inverter solutions and galvanized mounting structures to handle monitoring capabilities.",
                "checklist": [
                    "On-grid, off-grid & hybrid inverters",
                    "Galvanized mounting structures",
                    "Remote monitoring hardware"
                ]
            },
            {
                "title": "Batteries & Accessories",
                "desc": "Complete range of energy storage solutions and essential accessories for optimal system performance.",
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
        "subtitle": "Seamless Solar Setups – Certified, Compliant, and Efficient",
        "breadcrumb": "Installation & Commissioning Services",
        "info_subtitle": "PROJECTS SUPPLIED AND INSTALLER",
        "info_title": "Flawless Execution from Panel to Power",
        "left_image": "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&q=80&w=800",
        "features": [
            {
                "title": "Certified Crew",
                "desc": "Our team consists of trained professionals with hands-on experience in urban and rural solar installations."
            },
            {
                "title": "On-Time Execution",
                "desc": "We commit to fast-track installations with project timelines ranging from 3 to 14 days based on system size."
            },
             {
                "title": "Complete Documentation",
                "desc": "We provide installation reports, test sheets and commissioning certificates for all projects."
            }
        ],
        "right_text": "At Solarfi, we ensure fail-proof installation and commissioning for rooftop, ground-mounted, and hybrid solar systems. Our MNRE-certified technicians ensure error-free execution from mounting to grid synchronization. We adhere strictly to local load limits, electrical codes, and site-specific standards for maximum system performance.",
        "checklist": [
            "Certified Installation Teams",
            "MNRE & DISCOM Compliance",
            "Fast Turnaround",
            "Grid-Ready Commissioning"
        ],
        "right_img": "https://images.unsplash.com/photo-1611365892590-5fa356064f26?auto=format&fit=crop&q=80&w=800",
        "cards": [
            {
                "title": "Residential & Rooftop Setup",
                "desc": "Professional rooftop installations with net-metering-ready sizing for residential properties.",
                "checklist": [
                    "MNRE/BIS compliant mounting",
                    "Net-metering ready setup",
                    "Earth, SPD & grounding installations"
                ]
            },
            {
                "title": "Commercial & Industrial Installations",
                "desc": "Large-scale installations for commercial and industrial applications with complete safety systems.",
                "checklist": [
                    "Large-scale mounting & grid-compliant systems",
                    "Internal AC/DC wiring & junction boxes",
                    "Transformer set up with cabling & safety"
                ]
            },
            {
                "title": "Hybrid & EV Integration",
                "desc": "Advanced hybrid systems with EV charging integration and intelligent backup configurations.",
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
        "subtitle": "Ensure Peak Performance with Smart Solar Care",
        "breadcrumb": "Operations & Maintenance (O&M)",
        "info_subtitle": "PROJECTS SUPPLIED AND INSTALLER",
        "info_title": "Protect Your Solar Investment for Years to Come",
        "left_image": "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&q=80&w=800",
        "features": [
            {
                "title": "Real-Time Monitoring",
                "desc": "We track system health constantly and detect faults before they affect performance."
            },
            {
                "title": "Trained Maintenance Crew",
                "desc": "Our technicians conduct regular inspections, panel cleaning, inverter checks, and electrical testing."
            },
             {
                "title": "Detailed Reporting",
                "desc": "You'll receive monthly performance reports, fault summaries, and maintenance records."
            }
        ],
        "right_text": "At Solarfi, our Operations & Maintenance (O&M) services are built to keep your solar system running at optimal capacity. We offer real-time monitoring, preventive maintenance, and remote fault detection to ensure high uptime and maximum ROI. Our support doesn't stop at installation — we stay with you for the long run.",
        "checklist": [
            "Live Monitoring & Alerts",
            "Preventive Site Visits",
            "Remote Diagnostics",
            "Annual Maintenance Contracts (AMC)"
        ],
        "right_img": "https://images.unsplash.com/photo-1611365892590-5fa356064f26?auto=format&fit=crop&q=80&w=800",
        "cards": [
            {
                "title": "Remote Performance Tracking",
                "desc": "Comprehensive monitoring systems with real-time alerts and performance tracking capabilities.",
                "checklist": [
                    "Live generation status on mobile/web portal",
                    "Alert system for inverter failures",
                    "Load mismatch notifications"
                ]
            },
            {
                "title": "Scheduled Maintenance",
                "desc": "Regular preventive maintenance services to ensure optimal system performance and longevity.",
                "checklist": [
                    "Periodic panel cleaning",
                    "Thermal scanning for hotspots",
                    "Cable and junction box inspections"
                ]
            },
            {
                "title": "AMC Packages & Upgrades",
                "desc": "Comprehensive maintenance contracts and upgrade services tailored to your system needs.",
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
        "subtitle": "Future-Ready Energy For Homes, Businesses & Mobility",
        "breadcrumb": "EV Charging & Battery Storage",
        "info_subtitle": "PROJECTS SUPPLIED AND INSTALLED",
        "info_title": "Power Today, Store for Tomorrow",
        "left_image": "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&q=80&w=800",
        "features": [
            {
                "title": "Battery-Ready Systems",
                "desc": "All new installations are upgradeable to hybrid mode when inverters become inoperable."
            },
            {
                "title": "EV Charging Integration",
                "desc": "Install EV compatible solar setups with standard Type 2 or fast DC charging options."
            },
             {
                "title": "Smart Energy Usage",
                "desc": "Our systems automatically store excess solar and manage power flow during peak hours."
            }
        ],
        "right_text": "At Solarfi, we design and install hybrid solar systems that support both battery storage and EV charging. Whether you're powering a home, office, or electric vehicle, our solutions ensure energy independence and uninterrupted power day or night. We integrate lithium batteries, smart charge controllers, and EV-ready wiring right at the power source.",
        "checklist": [
            "Hybrid Solar System Design",
            "EV Charging Point Installation",
            "Lithium & Lead-Acid Battery Supply",
            "Backup Power During Outages"
        ],
        "right_img": "https://images.unsplash.com/photo-1611365892590-5fa356064f26?auto=format&fit=crop&q=80&w=800",
        "cards": [
            {
                "title": "Battery Storage Setup",
                "desc": "Complete battery backup solutions with smart inverter integration for reliable backup power.",
                "checklist": [
                    "Lithium-Ion & lead-acid options",
                    "Inverter battery sizing & wiring",
                    "Night-time backup configuration"
                ]
            },
            {
                "title": "EV Charging Station Installation",
                "desc": "Professional EV charging station installation with various charging options for all vehicle types.",
                "checklist": [
                    "Type 1/Type 2 sockets for 2-wheelers & 4-wheelers",
                    "DC fast charging for commercial spaces",
                    "Wall-mounted and outdoor installations"
                ]
            },
            {
                "title": "Hybrid System Management",
                "desc": "Intelligent energy management systems that optimize power flow between solar, battery, and grid.",
                "checklist": [
                    "Load prioritization settings",
                    "Auto-switch between solar, battery & grid",
                    "Monitoring via mobile apps"
                ]
            }
        ]
    }
]

html_template = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} – Solarfi</title>
  <link rel="icon" type="image/png" href="favicon.png">
  <link href="inner.css" rel="stylesheet">
</head>
<body>

  <!-- HEADER/NAV -->
  <nav>
    <div class="nav-inner">
      <a href="index.html" class="logo">
        <img src="logo.png" alt="Solarfi Logo" class="logo-icon">
      </a>
      <div class="nav-links">
        <a href="index.html">Home</a>
        <a href="index.html#features">About Us</a>
        <a href="index.html#process">Services ▾</a>
        <a href="index.html#testimonials">Projects & Testimonials</a>
      </div>
      <a href="index.html#contact" class="nav-cta">Contact</a>
      <div class="hamburger" id="hamburger" onclick="this.classList.toggle('open'); document.getElementById('mobileMenu').classList.toggle('open')">
        <span></span><span></span><span></span>
      </div>
    </div>
    <div class="mobile-menu" id="mobileMenu">
      <a href="index.html">Home</a>
      <a href="index.html#features">About Us</a>
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
      <a href="index.html#testimonials">Projects</a>
      <a href="index.html#contact" style="color:var(--green);font-weight:700">Contact →</a>
    </div>
  </nav>

  <!-- BANNER -->
  <div class="inner-banner">
    <div class="inner-banner-content animate-up">
      <h1>{title}</h1>
      <p>{subtitle}</p>
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
      {breadcrumb}
    </div>
  </div>

  <!-- MAIN INFO SECTION -->
  <section class="info-section">
    <div class="sec-heading-centered animate-up">
      <div class="yellow-bolt">⚡</div>
      <span class="sec-tagline">{info_subtitle}</span>
      <h2 class="main-title">{info_title}</h2>
    </div>

    <div class="info-grid">
      <!-- Left -->
      <div class="info-left">
        <div class="info-left-img animate-up">
          <img src="{left_image}" alt="{title} Image">
        </div>
        <div class="features-row">
          {features_html}
        </div>
      </div>
      <!-- Right -->
      <div class="info-right animate-up delay-100">
        <p>{right_text}</p>
        <ul class="green-checklist">
          {checklist_html}
        </ul>
        <div class="info-right-img">
          <img src="{right_img}" alt="Solar Installation">
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
      {cards_html}
    </div>
    
  </section>

  <!-- FOOTER -->
  <footer>
    <div class="footer-watermark">solarfi</div>
    <div class="footer-inner">
      <div class="footer-col" style="grid-column: span 1;">
        <div class="footer-logo-row">
          <img src="logo.png" alt="Solarfi Logo" style="height:60px;width:auto;object-fit:contain;display:block">
        </div>
        <p class="footer-desc">Discover smart, reliable solar EPC solutions with Solarfi. From AI-powered consultations to certified installations, we help homes, businesses & farms across India save energy and money. Get a free quote today!</p>
      </div>
      
      <div class="footer-col">
        <h5>Quick Contact</h5>
        <ul>
          <li><a href="#">Solarfi Private Limited, Dr.B.Somireddy Towers, 3-6-70, Bakarapuram, Pulivendula, Andhra Pradesh 516390, India</a></li>
          <li><a href="tel:+917358258385">📞 INDIA: +91 7358258385</a></li>
          <li><a href="tel:+15073581319">📞 USA: +1 507-358-1319</a></li>
          <li><a href="mailto:info@solarfi.in">✉️ info@solarfi.in</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h5>Our Services</h5>
        <ul>
          <li><a href="design-engineering.html">Design & Engineering</a></li>
          <li><a href="procurement.html">Procurement</a></li>
          <li><a href="operations-maintenance.html">Operations & Maintenance</a></li>
          <li><a href="ev-charging-battery-storage.html">EV & Battery Integration</a></li>
          <li><a href="installation-commissioning.html">Installation & Commissioning</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <img src="hero_family_solar.png" style="width:100%;height:60px;object-fit:cover;border-radius:4px" alt="G1">
          <img src="hero_family_solar.png" style="width:100%;height:60px;object-fit:cover;border-radius:4px" alt="G2">
          <img src="hero_family_solar.png" style="width:100%;height:60px;object-fit:cover;border-radius:4px" alt="G3">
          <img src="hero_family_solar.png" style="width:100%;height:60px;object-fit:cover;border-radius:4px" alt="G4">
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>Copyright © 2026 Solarfi. Designed by markteer.</p>
      <div class="footer-links">
        <a href="#facebook" style="color:white">F</a>
        <a href="#twitter" style="color:white">T</a>
        <a href="#linkedin" style="color:white">IN</a>
      </div>
    </div>
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
  </script>
</body>
</html>
"""

def build_features(features):
    html = ""
    for idx, f in enumerate(features):
        html += f'''
        <div class="feature-item animate-up { 'delay-100' if idx > 0 else '' }">
            <div class="icon-circle">
              <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <h4>{f['title']}</h4>
            <p>{f['desc']}</p>
        </div>'''
    return html

def build_checklist(checklist):
    html = ""
    for item in checklist:
        html += f'<li>{item}</li>\n'
    return html

def build_cards(cards):
    html = ""
    for idx, card in enumerate(cards):
        delay = f"delay-{idx+1}00" if idx > 0 else ""
        clist = ""
        for item in card['checklist']:
            clist += f'<li><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>{item}</li>'
        html += f'''
      <div class="offer-card animate-up {delay}">
        <div class="card-header">
          <h3>{card['title']}</h3>
        </div>
        <div class="card-middle">
          <div class="card-icon-container">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <img src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=500" alt="Solar Facility" class="card-img">
        </div>
        <div class="card-body">
          <p>{card['desc']}</p>
          <ul class="card-list">
            {clist}
          </ul>
        </div>
        <div class="dot-pattern"><span></span><span></span><span></span><span></span><span></span></div>
      </div>
        '''
    return html

def main():
    for page in pages_data:
        content = html_template.format(
            title=page['title'],
            subtitle=page['subtitle'],
            breadcrumb=page['breadcrumb'],
            info_subtitle=page['info_subtitle'],
            info_title=page['info_title'],
            left_image=page['left_image'],
            features_html=build_features(page['features']),
            right_text=page['right_text'],
            checklist_html=build_checklist(page['checklist']),
            right_img=page['right_img'],
            cards_html=build_cards(page['cards'])
        )
        with open(page['filename'], 'w', encoding='utf-8') as f:
            f.write(content)

if __name__ == "__main__":
    main()
