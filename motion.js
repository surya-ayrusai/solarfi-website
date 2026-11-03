/**
 * motion.js - Motion Choreography for Solarfi
 * Powered by vanilla Motion ES Module from jsDelivr CDN
 */
import { animate, inView, scroll, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm";

document.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── 1. Progressive Enhancement: If reduced motion, leave everything static ──
  if (prefersReduced) {
    document.documentElement.classList.add("reduced-motion");
    // Ensure all curve animations trigger immediately
    document.querySelectorAll(".curve-path-draw").forEach(el => el.classList.add("in-view"));
    return;
  }

  // ── 2. Magnetic Buttons (Pointer/Desktop Only) ──────────────────────────
  if (window.matchMedia("(pointer: fine)").matches) {
    const magneticBtns = document.querySelectorAll(".btn-primary, .btn-white, .btn-outline, .nav-cta, .calc-btn, .pill-btn");
    magneticBtns.forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.28;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.28;
        btn.style.transform = `translate(${x}px, ${y}px)`;
        btn.style.transition = "transform 0.15s ease-out";
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0px, 0px)";
        btn.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
      });

      btn.addEventListener("pointerdown", () => {
        btn.style.transform = "scale(0.96)";
      });
      btn.addEventListener("pointerup", () => {
        btn.style.transform = "scale(1)";
      });
    });
  }

  // ── 3. Section Reveal: Masked Headlines & Clip-Path Images ───────────────
  const revealHeadlines = document.querySelectorAll(".motion-mask-title");
  revealHeadlines.forEach(heading => {
    // Wrap text into masked lines if not already split
    if (!heading.dataset.motionSplit) {
      heading.dataset.motionSplit = "true";
      const words = heading.innerHTML.trim();
      heading.innerHTML = `<span class="motion-mask-line" style="display:block;overflow:hidden;"><span class="motion-mask-inner" style="display:inline-block;transform:translateY(100%);">${words}</span></span>`;
    }

    inView(heading, () => {
      const inner = heading.querySelector(".motion-mask-inner");
      if (inner) {
        animate(inner, { transform: ["translateY(100%)", "translateY(0%)"] }, {
          duration: 0.85,
          easing: [0.22, 1, 0.36, 1]
        });
      }
    }, { amount: 0.25 });
  });

  const clipImages = document.querySelectorAll(".motion-clip-wipe");
  clipImages.forEach(img => {
    img.style.clipPath = "inset(100% 0 0 0)";
    inView(img, () => {
      animate(img, { clipPath: ["inset(100% 0 0 0)", "inset(0% 0 0 0)"] }, {
        duration: 0.95,
        easing: [0.22, 1, 0.36, 1]
      });
    }, { amount: 0.2 });
  });

  // Staggered reveals for bento / card grids
  const cardGrids = document.querySelectorAll(".motion-stagger-grid");
  cardGrids.forEach(grid => {
    const cards = grid.querySelectorAll(".motion-card-item");
    if (!cards.length) return;
    cards.forEach(c => {
      c.style.opacity = "0";
      c.style.transform = "translateY(24px)";
    });

    inView(grid, () => {
      animate(cards, {
        opacity: [0, 1],
        transform: ["translateY(24px)", "translateY(0px)"]
      }, {
        delay: stagger(0.12),
        duration: 0.7,
        easing: [0.22, 1, 0.36, 1]
      });
    }, { amount: 0.15 });
  });

  // ── 5. Parallax on Key Visual Media ──────────────────────────────────────
  const parallaxMedia = document.querySelectorAll(".motion-parallax");
  parallaxMedia.forEach(el => {
    scroll(
      progress => {
        const offset = (progress - 0.5) * 45; // ~7% travel
        el.style.transform = `translateY(${offset}px)`;
      },
      {
        target: el.parentElement,
        offset: ["start end", "end start"]
      }
    );
  });

  // ── 6. Savings Cumulative Curve Draw-In ──────────────────────────────────
  const curveContainers = document.querySelectorAll(".savings-curve-container");
  curveContainers.forEach(container => {
    inView(container, () => {
      container.querySelectorAll(".curve-path-draw").forEach(p => p.classList.add("in-view"));
    }, { amount: 0.3 });
  });
});
