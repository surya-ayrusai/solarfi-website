const fs = require('fs');

const footerHtml = `  <!-- FOOTER -->
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
  </footer>`;

// Replace in index.html
let html = fs.readFileSync('index.html', 'utf-8');
const indexFooterRegex = /<!-- FOOTER -->\s*<style>[\s\S]*?<\/footer>/;
let replacedHtml = html.replace(indexFooterRegex, footerHtml);
if (replacedHtml === html) {
  // Try without style tag due to previous iterations
  const altRegex = /<!-- FOOTER -->\s*<footer.*?>[\s\S]*?<\/footer>/;
  replacedHtml = html.replace(altRegex, footerHtml);
}
fs.writeFileSync('index.html', replacedHtml, 'utf-8');

// Replace in build_pages.js
let bp = fs.readFileSync('build_pages.js', 'utf-8');
const bpFooterRegex = /<!-- FOOTER -->\s*<style>[\s\S]*?<\/footer>/;
let replacedBp = bp.replace(bpFooterRegex, footerHtml);
if (replacedBp === bp) {
  const altRegex = /<!-- FOOTER -->\s*<footer.*?>[\s\S]*?<\/footer>/;
  replacedBp = bp.replace(altRegex, footerHtml);
}
fs.writeFileSync('build_pages.js', replacedBp, 'utf-8');

console.log("Footer fixed recursively to restore true colors!");
