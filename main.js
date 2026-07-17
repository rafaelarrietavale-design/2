(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const $  = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const escHTML = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }
  // Resolves an asset path; in the single-file build, window.__IMG__ maps paths to inlined data URIs.
  const IMG = (p) => (window.__IMG__ && window.__IMG__[p]) || p;

  /* ---------- Mounts (idempotent) ---------- */

  function mountMenu() {
    const t = $("[data-menu]");
    if (!t || t.children.length > 0 || !data.dishes) return;
    t.innerHTML = data.dishes.map((d, i) => `
      <article class="dish" data-tilt data-reveal data-delay="${(i % 4) + 1}">
        <div class="dish-photo">
          <img src="${escHTML(IMG("assets/img/dish-" + d.id + ".webp"))}" alt="${escHTML(d.name)} — plato tailandés servido en Sabai" loading="lazy" decoding="async" />
          <span class="dish-medallion" aria-hidden="true"><svg viewBox="0 0 100 100"><use href="#${escHTML(d.glyph)}"></use></svg></span>
          <span class="dish-cat">${escHTML(d.cat)}</span>
        </div>
        <div class="dish-body">
          <span class="dish-th">${escHTML(d.th)}</span>
          <h3 class="dish-name">${escHTML(d.name)}</h3>
          <p class="dish-desc">${escHTML(d.desc)}</p>
          <div class="dish-foot">
            <span class="dish-price">${escHTML(d.price)}</span>
            <span class="dish-dot" aria-hidden="true"></span>
          </div>
        </div>
      </article>`).join("");
  }

  function mountTestimonials() {
    const t = $("[data-testimonials]");
    if (!t || t.children.length > 0 || !data.testimonials) return;
    t.innerHTML = data.testimonials.map((q, i) => `
      <figure class="quote-card" data-reveal data-delay="${i + 1}">
        <p>“${escHTML(q.q)}”</p>
        <span>${escHTML(q.a)}</span>
      </figure>`).join("");
  }

  function mountStats() {
    const t = $("[data-stats]");
    if (!t || t.children.length > 0 || !data.stats) return;
    t.innerHTML = data.stats.map((s, i) => `
      <div class="stat" data-reveal data-delay="${i + 1}">
        <div class="n"><span data-count-to="${escHTML(s.n)}">${escHTML(s.n)}</span>${escHTML(s.suf || "")}</div>
        <div class="l">${escHTML(s.l)}</div>
      </div>`).join("");
  }

  function mountHours() {
    const t = $("[data-hours]");
    if (!t || t.children.length > 0 || !data.hours) return;
    t.innerHTML = data.hours.map(h => `
      <div class="hours-row ${/cerrado/i.test(h.h) ? "closed" : ""}">
        <span class="d">${escHTML(h.d)}</span><span class="h">${escHTML(h.h)}</span>
      </div>`).join("");
  }

  function mountTicker() {
    const t = $("[data-marquee]");
    if (!t || t.children.length > 0 || !data.ticker) return;
    t.innerHTML = data.ticker.map(x =>
      `<span>${escHTML(x)}</span><span class="sep" aria-hidden="true">✦</span>`).join("");
  }

  function mountYear() {
    const y = $("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Splash ---------- */
  function initSplash() {
    const splash = $("[data-splash]");
    if (!splash) return;
    const hide = () => splash.classList.add("is-out");
    if (document.readyState === "complete") setTimeout(hide, 700);
    else window.addEventListener("load", () => setTimeout(hide, 500));
    setTimeout(hide, 4000);
  }

  /* ---------- Cursor ---------- */
  function initCursor() {
    const root = $("[data-cursor-root]");
    if (!root || !fineHover) return;
    document.documentElement.classList.add("has-cursor");
    const ring = $(".cursor-ring", root), dot = $(".cursor-dot", root);
    let tx = 0, ty = 0, rx = 0, ry = 0, firstMove = false;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      if (!firstMove) { firstMove = true; rx = tx; ry = ty; root.classList.add("is-ready"); }
    }, { passive: true });
    (function tick() {
      rx += (tx - rx) * 0.2; ry += (ty - ry) * 0.2;
      if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(tick);
    })();
    const H = "[data-magnetic], .dish, .btn, a[href], button, input, select";
    document.addEventListener("mouseover", e => { if (e.target.closest(H)) root.classList.add("is-interactive"); });
    document.addEventListener("mouseout", e => {
      if (e.target.closest(H) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(H)))
        root.classList.remove("is-interactive");
    });
  }

  /* ---------- Nav ---------- */
  function initNav() {
    const nav = $("[data-nav]");
    if (nav) {
      const on = () => nav.classList.toggle("is-scrolled", scrollY > 60);
      on(); window.addEventListener("scroll", on, { passive: true });
    }
    const mob = $("[data-nav-mobile]");
    const open = $("[data-nav-open]"), close = $("[data-nav-close]");
    if (mob && open) {
      const set = (v) => { mob.setAttribute("aria-hidden", String(!v)); document.body.style.overflow = v ? "hidden" : ""; };
      open.addEventListener("click", () => set(true));
      if (close) close.addEventListener("click", () => set(false));
      $$("[data-nav-go]", mob).forEach(a => a.addEventListener("click", () => set(false)));
    }
  }

  /* ---------- Smooth anchors ---------- */
  function initSmoothAnchors() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#" || id === "#top") {
        if (id === "#top") { e.preventDefault(); window.scrollTo({ top: 0, behavior: reducedNow() ? "auto" : "smooth" }); }
        return;
      }
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 74, behavior: reducedNow() ? "auto" : "smooth" });
    });
  }
  function reducedNow() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -3% 0px" });
    $$("[data-reveal]").forEach(el => io.observe(el));
    setTimeout(() => {
      $$("[data-reveal]:not(.is-revealed)").forEach(el => {
        if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ---------- Marquee ---------- */
  function initMarquee() {
    if (!window.gsap) return;
    $$("[data-marquee]").forEach(track => {
      if (track.dataset.marqueeBound) return;
      track.dataset.marqueeBound = "1";
      const clone = track.cloneNode(true);
      clone.removeAttribute("data-marquee");
      clone.removeAttribute("data-marquee-bound");
      clone.setAttribute("aria-hidden", "true");
      track.parentNode.appendChild(clone);
      const distance = track.scrollWidth;
      gsap.to([track, clone], {
        x: -distance, duration: distance / 55, ease: "none", repeat: -1,
        modifiers: { x: gsap.utils.unitize(x => parseFloat(x) % distance) },
      });
    });
  }

  /* ---------- Tilt + halo ---------- */
  function initTilt() {
    if (matchMedia("(hover: none)").matches) return;
    $$("[data-tilt]").forEach(card => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";
      const MAX = 6;
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------- Magnetic buttons (they move toward the cursor) ---------- */
  function initMagnetic() {
    if (!fineHover) return;
    $$("[data-magnetic]").forEach(el => {
      if (el.dataset.magneticBound) return;
      el.dataset.magneticBound = "1";
      const strength = parseFloat(el.dataset.magneticStrength || "0.3");
      const inner = document.createElement("span");
      inner.className = "magnetic-inner";
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
      el.classList.add("has-magnetic");
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) - r.width / 2) * strength;
        ty = ((e.clientY - r.top) - r.height / 2) * strength;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        inner.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------- Count up ---------- */
  function initCountUp() {
    $$("[data-count-to]").forEach(el => {
      const raw = el.dataset.countTo;
      const target = parseFloat(raw);
      if (isNaN(target)) return;
      const decimals = (raw.split(".")[1] || "").length;
      const obj = { v: 0 };
      const trigger = () => {
        if (window.gsap) gsap.to(obj, { v: target, duration: 1.5, ease: "power2.out", onUpdate: () => el.textContent = obj.v.toFixed(decimals) });
        else el.textContent = target.toFixed(decimals);
      };
      const io = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting) { trigger(); io.unobserve(e.target); } });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ---------- Hero parallax ---------- */
  function initHeroParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const bg = $(".hero-bg"), inner = $(".hero-inner");
    if (bg) gsap.to(bg, { yPercent: 22, scale: 1.12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    if (inner) gsap.to(inner, { yPercent: -22, opacity: 0.15, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  /* ---------- Scroll progress ---------- */
  function initScrollProgress() {
    const bar = $("[data-scroll-progress]");
    if (!bar) return;
    let raf = null;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      raf = null;
    };
    window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ---------- Reservation form ---------- */
  function setupContactForm() {
    const form = $("[data-contact-form]");
    const success = $("[data-contact-success]");
    if (!form || !success) return;
    const msg = $("[data-contact-success-msg]");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      if (!form.reportValidity()) return;
      form.classList.add("is-sending");
      const btn = $("[type=submit]", form);
      if (btn) btn.disabled = true;
      await new Promise(r => setTimeout(r, 850 + Math.random() * 500));
      form.classList.remove("is-sending");
      form.classList.add("is-done");
      await new Promise(r => setTimeout(r, 500));
      const name = (form.elements.name.value || "").trim().split(/\s+/)[0] || "";
      const people = form.elements.people ? form.elements.people.value : "";
      const date = form.elements.date ? form.elements.date.value : "";
      if (msg) msg.textContent = `${name ? name + ", g" : "G"}racias. Mesa para ${people} ${date ? "el " + date : ""}. Te llega un SMS de confirmación en breve.`;
      form.classList.add("is-sent");
      success.setAttribute("aria-hidden", "false");
      success.classList.add("is-visible");
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    safe(mountMenu, "mountMenu");
    safe(mountTestimonials, "mountTestimonials");
    safe(mountStats, "mountStats");
    safe(mountHours, "mountHours");
    safe(mountTicker, "mountTicker");
    safe(mountYear, "mountYear");

    safe(initSplash, "initSplash");
    safe(initCursor, "initCursor");
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initMagnetic, "initMagnetic");
    safe(initCountUp, "initCountUp");
    safe(initScrollProgress, "initScrollProgress");
    safe(setupContactForm, "setupContactForm");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initMarquee, "initMarquee");
      safe(initHeroParallax, "initHeroParallax");
    } else {
      safe(initMarquee, "initMarquee");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
