/* =============================================================
   Nicolás con K Electricidad — main.js (IIFE, classic script)
   ============================================================= */
(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const c = (data.contact) || {};
  const $  = (s, sc) => (sc || document).querySelector(s);
  const $$ = (s, sc) => Array.from((sc || document).querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* ---- Contacto: completa links desde manifest.js ---- */
  function initContact() {
    const raw = (c.phoneRaw || "").replace(/\D/g, "");
    const msg = encodeURIComponent(c.whatsappMsg || "Hola, quiero un presupuesto.");
    const wa = raw ? ("https://wa.me/" + raw + "?text=" + msg) : "#";
    const tel = raw ? ("tel:+" + raw) : "#";

    $$("[data-wa]").forEach(a => { a.href = wa; if (raw) { a.target = "_blank"; a.rel = "noopener"; } });
    $$("[data-tel]").forEach(a => { a.href = tel; });
    $$("[data-mail]").forEach(a => { if (c.email) a.href = "mailto:" + c.email; });
    $$("[data-ig]").forEach(a => { if (c.instagram) a.href = c.instagram; });

    if (c.phoneDisplay) $$("[data-phone]").forEach(e => e.textContent = c.phoneDisplay);
    if (c.email) $$("[data-email]").forEach(e => e.textContent = c.email);
    if (c.instagramHandle) $$("[data-ighandle]").forEach(e => e.textContent = c.instagramHandle);
  }

  /* ---- Splash ---- */
  function initSplash() {
    const s = $("#splash");
    if (!s) return;
    const hide = () => s.classList.add("hide");
    window.addEventListener("load", () => setTimeout(hide, 350));
    setTimeout(hide, 2600); // safety net
  }

  /* ---- Nav scroll + mobile menu ---- */
  function initNav() {
    const nav = $("#nav");
    const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = $("#navToggle");
    const menu = $("#mobileMenu");
    if (toggle && menu) {
      const setOpen = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        menu.hidden = !open;
        toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      };
      toggle.addEventListener("click", () => setOpen(menu.hidden));
      menu.addEventListener("click", e => { if (e.target.closest("a")) setOpen(false); });
    }
  }

  /* ---- Smooth anchor scroll ---- */
  function initAnchors() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---- Reveals ---- */
  function initReveals() {
    const items = $$(".reveal");
    if (!items.length) return;
    document.documentElement.classList.add("is-ready");
    // index for stagger
    $$(".service-grid .reveal").forEach((el, i) => el.style.setProperty("--i", i % 4));

    if (!("IntersectionObserver" in window)) { items.forEach(el => el.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.04, rootMargin: "0px 0px -8% 0px" });
    items.forEach(el => io.observe(el));

    // safety: reveal everything after 6s no matter what
    setTimeout(() => items.forEach(el => el.classList.add("in")), 6000);
  }

  /* ---- Count-up stats ---- */
  function initCounters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;
    const run = (el) => {
      const end = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || "";
      if (reduced) { el.textContent = end + suffix; return; }
      const dur = 1400, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    nums.forEach(n => io.observe(n));
  }

  /* ---- Marquee duplicate width fix handled by CSS (-50%) ---- */

  /* ---- Formulario → arma mensaje de WhatsApp ---- */
  function initForm() {
    const form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = (c.phoneRaw || "").replace(/\D/g, "");
      const get = (n) => (form.querySelector('[name="' + n + '"]') || {}).value || "";
      const name = get("name").trim();
      const phone = get("phone").trim();
      const type = get("type").trim();
      const msg = get("msg").trim();

      const hint = form.querySelector(".form-hint");
      if (!name || !phone) {
        if (hint) { hint.textContent = "Completá al menos tu nombre y teléfono."; hint.classList.remove("ok"); }
        return;
      }
      let text = `Hola Nicolás, soy ${name}.`;
      if (type) text += ` Necesito: ${type}.`;
      if (msg) text += ` ${msg}`;
      text += phone ? ` Mi teléfono: ${phone}.` : "";

      const url = raw
        ? "https://wa.me/" + raw + "?text=" + encodeURIComponent(text)
        : "mailto:" + (c.email || "") + "?subject=" + encodeURIComponent("Consulta web") + "&body=" + encodeURIComponent(text);

      if (hint) { hint.textContent = "Abriendo WhatsApp con tu mensaje…"; hint.classList.add("ok"); }
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---- Año dinámico ---- */
  function initYear() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---- GSAP: parallax sutil de la foto del hero ---- */
  function initHeroParallax() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    if (!document.querySelector(".hero-photo img")) return;
    gsap.to(".hero-photo img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }

  function boot() {
    safe(initContact, "initContact");
    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initAnchors, "initAnchors");
    safe(initReveals, "initReveals");
    safe(initCounters, "initCounters");
    safe(initForm, "initForm");
    safe(initYear, "initYear");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initHeroParallax, "initHeroParallax");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
