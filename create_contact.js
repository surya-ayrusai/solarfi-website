const fs = require('fs');

// 1. Read existing inner page to extract fresh Navbar and Footer
const sourcePage = fs.readFileSync('design-engineering.html', 'utf-8');

// Extract Header (up to </nav>)
const navRegex = /([\s\S]*?<\/nav>)/;
const navMatch = sourcePage.match(navRegex);
let headerHtml = navMatch ? navMatch[1] : '';

// Replace the active state or meta title in header
headerHtml = headerHtml.replace(/<title>.*?<\/title>/, '<title>Contact Us - Solarfi</title>');
headerHtml = headerHtml.replace(/<meta name="description" content=".*?">/, '<meta name="description" content="Get in touch with Solarfi for a free solar site survey, quotes, and consultation.">');

// Extract Footer (from <!-- FOOTER --> to the end)
const footerRegex = /(<!-- FOOTER -->[\s\S]*?<\/html>)/;
const footerMatch = sourcePage.match(footerRegex);
const footerHtml = footerMatch ? footerMatch[1] : '';

// Define Contact Section HTML
const contactBody = `
  <!-- BANNER -->
  <div class="inner-banner">
    <div class="inner-banner-content animate-up">
      <h1>Contact Us</h1>
      <p>Get Your Free Solar Quote & Site Survey Today</p>
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
      Contact Us
    </div>
  </div>

  <!-- CONTACT SECTION -->
  <section class="info-section" style="background:#f8fafc; padding: 80px 24px;">
    <div class="sec-heading-centered animate-up">
      <div class="yellow-bolt">⚡</div>
      <span class="sec-tagline">WE'RE HERE TO HELP</span>
      <h2 class="main-title">Start Your Solar Journey</h2>
    </div>

    <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start;">
      
      <!-- Contact Info Left -->
      <div class="contact-info animate-up" style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
        <h3 style="font-size: 1.8rem; color: #1e1b4b; margin-bottom: 24px;">Reach Out Directly</h3>
        <p style="color: #64748b; font-size: 1.05rem; line-height: 1.6; margin-bottom: 40px;">Our dedicated solar experts are ready to assist you regarding system sizes, MNRE subsidies, and commercial EPC proposals.</p>
        
        <div style="display: flex; flex-direction: column; gap: 30px;">
          
          <div style="display: flex; gap: 20px;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: #fffbeb; color: #fbbf24; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" /></svg>
            </div>
            <div>
              <h5 style="font-size: 1.1rem; color: #1e1b4b; margin-bottom: 8px;">Phone Number</h5>
              <a href="tel:+917358258385" style="color: #1a8c3e; text-decoration: none; font-weight: 600; display: block; margin-bottom: 4px;">INDIA: +91 7358258385</a>
              <a href="tel:+15073581319" style="color: #1a8c3e; text-decoration: none; font-weight: 600;">USA: +1 507-358-1319</a>
            </div>
          </div>

          <div style="display: flex; gap: 20px;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: #fffbeb; color: #fbbf24; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
            </div>
            <div>
              <h5 style="font-size: 1.1rem; color: #1e1b4b; margin-bottom: 8px;">Email Address</h5>
              <a href="mailto:info@solarfi.in" style="color: #1a8c3e; text-decoration: none; font-weight: 600;">info@solarfi.in</a>
            </div>
          </div>

          <div style="display: flex; gap: 20px;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: #fffbeb; color: #fbbf24; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" /></svg>
            </div>
            <div>
              <h5 style="font-size: 1.1rem; color: #1e1b4b; margin-bottom: 8px;">Main Office</h5>
              <p style="color: #64748b; font-size: 0.95rem; line-height: 1.5; margin: 0;">D.no: 3-6, Dr.Somireddy Towers, Guntha Bazar Rd, Pulivendula, Andhra Pradesh 516390, India.</p>
            </div>
          </div>

        </div>
      </div>

      <!-- Contact Form Right -->
      <div class="contact-form-wrap animate-up delay-100" style="background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border-top: 5px solid #1a8c3e;">
        <h3 style="font-size: 1.8rem; color: #1e1b4b; margin-bottom: 12px;">Request A Free Quote</h3>
        <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 30px;">Fill out the details below, and we will get back to you within 24 hours.</p>
        
        <form id="contactForm" style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Hidden Anti-Spam protection & subject for formsubmit if needed -->
          <input type="hidden" name="_subject" value="New Solar Inquiry from Website">
          <input type="hidden" name="_captcha" value="false">
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <input type="text" name="name" placeholder="Full Name *" required style="width: 100%; padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; font-family: inherit; outline: none; transition: border 0.3s; box-sizing: border-box;" onfocus="this.style.borderColor='#1a8c3e'" onblur="this.style.borderColor='#e2e8f0'">
            <input type="tel" name="phone" placeholder="Phone Number *" required style="width: 100%; padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; font-family: inherit; outline: none; transition: border 0.3s; box-sizing: border-box;" onfocus="this.style.borderColor='#1a8c3e'" onblur="this.style.borderColor='#e2e8f0'">
          </div>
          
          <input type="email" name="email" placeholder="Email Address *" required style="width: 100%; padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; font-family: inherit; outline: none; transition: border 0.3s; box-sizing: border-box;" onfocus="this.style.borderColor='#1a8c3e'" onblur="this.style.borderColor='#e2e8f0'">
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <select name="property_type" required style="width: 100%; padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; font-family: inherit; outline: none; transition: border 0.3s; box-sizing: border-box; background: #fff; cursor: pointer;">
              <option value="" disabled selected>Property Type *</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
            </select>
            <input type="text" name="city" placeholder="City / State *" required style="width: 100%; padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; font-family: inherit; outline: none; transition: border 0.3s; box-sizing: border-box;" onfocus="this.style.borderColor='#1a8c3e'" onblur="this.style.borderColor='#e2e8f0'">
          </div>

          <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
            <select name="monthly_bill" required style="width: 100%; padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; font-family: inherit; outline: none; transition: border 0.3s; box-sizing: border-box; background: #fff; cursor: pointer;">
              <option value="" disabled selected>Average Electricity Bill *</option>
              <option value="Below ₹1,500">Below ₹1,500</option>
              <option value="₹1,500 - ₹3,000">₹1,500 - ₹3,000</option>
              <option value="₹3,000 - ₹5,000">₹3,000 - ₹5,000</option>
              <option value="₹5,000 - ₹10,000">₹5,000 - ₹10,000</option>
              <option value="Above ₹10,000">Above ₹10,000</option>
            </select>
          </div>

          <textarea name="message" placeholder="Additional Details or Requirements (Optional)" rows="4" style="width: 100%; padding: 14px 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; font-family: inherit; outline: none; transition: border 0.3s; box-sizing: border-box; resize: vertical;" onfocus="this.style.borderColor='#1a8c3e'" onblur="this.style.borderColor='#e2e8f0'"></textarea>

          <button id="submitBtn" type="submit" style="background: #1a8c3e; margin-top: 10px; color: #fff; padding: 16px 20px; border: none; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(26,140,62,0.2);" onmouseover="this.style.background='#136b2f'" onmouseout="this.style.background='#1a8c3e'">Submit Request ➔</button>
        </form>
      </div>
    </div>
  </section>

  <style>
    @media(max-width: 900px) {
      .info-section > div { grid-template-columns: 1fr !important; }
    }
  </style>

  <script>
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', function(e) {
      e.preventDefault(); 
      submitBtn.innerText = 'Sending Request...';
      submitBtn.style.opacity = '0.7';
      submitBtn.style.pointerEvents = 'none';
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      const waText = "*New Solar Inquiry*%0a" +
                     "*Name:* " + data.name + "%0a" +
                     "*Phone:* " + data.phone + "%0a" +
                     "*Email:* " + data.email + "%0a" +
                     "*Property:* " + data.property_type + "%0a" +
                     "*City/State:* " + data.city + "%0a" +
                     "*Monthly Bill:* " + data.monthly_bill + "%0a" +
                     "*Message:* " + (data.message || 'N/A');
                     
      const waUrl = "https://wa.me/917358258385?text=" + waText;
      
      fetch("https://formsubmit.co/ajax/info@solarfi.in", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
          window.open(waUrl, '_blank');
          alert('Request submitted successfully! Redirecting you to WhatsApp.');
          form.reset();
          submitBtn.innerText = 'Submit Request ➔';
          submitBtn.style.opacity = '1';
          submitBtn.style.pointerEvents = 'auto';
      })
      .catch(error => {
          window.open(waUrl, '_blank');
          alert('Redirecting you to WhatsApp to complete your request.');
          submitBtn.innerText = 'Submit Request ➔';
          submitBtn.style.opacity = '1';
          submitBtn.style.pointerEvents = 'auto';
      });
    });
  </script>
`;

const finalHtml = headerHtml + contactBody + footerHtml;

fs.writeFileSync('contact-us.html', finalHtml, 'utf-8');
console.log('contact-us.html created successfully!');
