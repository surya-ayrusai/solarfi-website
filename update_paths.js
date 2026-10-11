const fs = require('fs');

// Fix index.html
let html = fs.readFileSync('index.html', 'utf-8');
html = html.replace(/src="([^"]+\.png)"/g, 'src="images/$1"');
html = html.replace(/href="([^"]+\.png)"/g, 'href="images/$1"');
fs.writeFileSync('index.html', html, 'utf-8');

// Fix inner.css
let css = fs.readFileSync('inner.css', 'utf-8');
css = css.replace(/nav \{[^}]+background:\s*#fff;([^}]+)\}/, `nav { position: sticky; top: 0; z-index: 999; background: #145f2a; box-shadow: 0 2px 16px rgba(0,0,0,.2); padding: 10px 0; }`);
// Make nav links white
css = css.replace(/\.nav-links a \{.*?\}/s, `.nav-links a { color: rgba(255, 255, 255, .8); transition: color .2s; } \n.nav-links a:hover { color: #fff; }`);
// Fix logo text color if there is one in inner.css
css = css.replace(/\.mobile-menu \{[^}]+background:\s*#fff;/, `.mobile-menu { background: #145f2a; border-top: 1px solid rgba(255, 255, 255, .1);`);
css = css.replace(/\.mobile-menu a \{[^}]+color:\s*var\(--dark\)/, `.mobile-menu a { color: rgba(255, 255, 255, .8)`);
// Update CTA banner background to match index.html nav
css = css.replace(/\.cta-banner \{ background: #[0-9a-fA-F]+;/, `.cta-banner { background: #145f2a;`);
// Right image height
css = css.replace(/\.info-right-img img \{/, `.info-right-img img { min-height: 500px; max-height: 550px;`);

fs.writeFileSync('inner.css', css, 'utf-8');
