(function () {
  "use strict";
  /* ==========================================================================
     TATU TRAVEL — main.js
     Vanilla JS, patrón IIFE (sin import/export, sin frameworks).
     El contenido crítico vive en el HTML; este script solo enriquece.
     Cada init va envuelto en safe() para que un fallo no rompa el resto.
     ======================================================================== */

  var BRAND = window.__BRAND__ || {};
  var C = BRAND.contact || {};

  function safe(fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn("[tatu] init falló:", name, e); }
  }
  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------------------------------------------------------------- WhatsApp */
  function waLink(msg) {
    var num = (C.whatsapp || "").replace(/[^0-9]/g, "");
    var text = encodeURIComponent(msg || BRAND.waGreeting || "Hola");
    return "https://wa.me/" + num + "?text=" + text;
  }

  /* --------------------------------------------------------- Contacto (hydrate) */
  function initContact() {
    // Enlaces WhatsApp (solo href): [data-wa], mensaje opcional en data-wa-msg
    $all("[data-wa]").forEach(function (a) {
      var custom = a.getAttribute("data-wa-msg");
      a.setAttribute("href", waLink(custom));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
    // Enlaces email / instagram (solo href)
    $all("[data-email-link]").forEach(function (a) { if (C.email) a.setAttribute("href", "mailto:" + C.email); });
    $all("[data-ig-link]").forEach(function (a) { if (C.instagram) a.setAttribute("href", "https://instagram.com/" + C.instagram); });
    // Textos (cada uno en su propio elemento, sin pisar íconos)
    $all("[data-wa-text]").forEach(function (el) { if (C.whatsappDisplay) el.textContent = C.whatsappDisplay; });
    $all("[data-email-text]").forEach(function (el) { if (C.email) el.textContent = C.email; });
    $all("[data-ig-text]").forEach(function (el) { if (C.instagram) el.textContent = "@" + C.instagram; });
    $all("[data-city]").forEach(function (el) { if (C.city) el.textContent = C.city; });
    // Selector de destinos en el formulario
    var sel = $("#f-destino");
    if (sel && sel.children.length <= 1 && BRAND.destinations) {
      BRAND.destinations.forEach(function (d) {
        var o = document.createElement("option");
        o.value = d.name; o.textContent = d.name;
        sel.appendChild(o);
      });
    }
  }

  /* ------------------------------------------------------------------- Splash */
  function initSplash() {
    var s = $("#splash");
    if (!s) return;
    function hide() { s.classList.add("hide"); }
    if (document.readyState === "complete") { setTimeout(hide, 350); }
    else { window.addEventListener("load", function () { setTimeout(hide, 350); }); }
    // Red de seguridad JS (además de la CSS): nunca dejar el splash pegado.
    setTimeout(hide, 3600);
  }

  /* ---------------------------------------------------------------------- Nav */
  function initNav() {
    var nav = $("#nav");
    if (!nav) return;
    function onScroll() {
      if (window.scrollY > 40) nav.classList.add("solid");
      else nav.classList.remove("solid");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var burger = $("#burger");
    var links = $("#nav-links");
    if (burger && links) {
      burger.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });
      $all("a", links).forEach(function (a) {
        a.addEventListener("click", function () {
          links.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
    // Scroll suave para anclas
    $all('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        var y = t.getBoundingClientRect().top + window.scrollY - 68;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
  }

  /* ------------------------------------------------------------------ Reveal */
  function initReveal() {
    var els = $all(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.02, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
    // Red de seguridad: si algo quedó oculto a los 6s, revelarlo.
    setTimeout(function () { els.forEach(function (el) { el.classList.add("in"); }); }, 6000);
  }

  /* ----------------------------------------------------------------- Marquee */
  function initMarquee() {
    $all(".marquee-track").forEach(function (track) {
      if (track.getAttribute("data-dup") === "1") return; // idempotente
      track.innerHTML += track.innerHTML;
      track.setAttribute("data-dup", "1");
    });
  }

  /* ------------------------------------------------------------- Testimonios */
  function initTestimonials() {
    var slides = $all(".testi-slide");
    var dots = $all(".testi-dots button");
    if (slides.length < 2) return;
    var i = 0, timer;
    function go(n) {
      slides[i].classList.remove("active");
      if (dots[i]) dots[i].classList.remove("on");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("active");
      if (dots[i]) dots[i].classList.add("on");
    }
    function next() { go(i + 1); }
    function start() { timer = setInterval(next, 6000); }
    function reset() { clearInterval(timer); start(); }
    dots.forEach(function (d, n) { d.addEventListener("click", function () { go(n); reset(); }); });
    start();
  }

  /* --------------------------------------------------------------- Formulario */
  function initForm() {
    var form = $("#cotizar");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = (form.querySelector("#f-nombre") || {}).value || "";
      var destino = (form.querySelector("#f-destino") || {}).value || "un destino";
      var fecha = (form.querySelector("#f-fecha") || {}).value || "a definir";
      var personas = (form.querySelector("#f-personas") || {}).value || "";
      var extra = (form.querySelector("#f-mensaje") || {}).value || "";

      var msg = "¡Hola Tatu Travel! Soy " + (nombre || "un viajero") +
        ". Quiero cotizar un viaje a " + destino +
        (personas ? " para " + personas + " persona(s)" : "") +
        ", fecha aproximada: " + fecha + "." +
        (extra ? " " + extra : "");

      // Abrir WhatsApp con el mensaje armado
      window.open(waLink(msg), "_blank", "noopener");

      // Guardar mailto de respaldo por si prefiere email
      var back = document.getElementById("f-mailback");
      if (back && C.email) {
        back.setAttribute("href", "mailto:" + C.email +
          "?subject=" + encodeURIComponent("Cotización — " + destino) +
          "&body=" + encodeURIComponent(msg));
      }

      // Mostrar confirmación
      var ok = $("#form-ok");
      var body = $("#form-body");
      if (ok && body) { body.style.display = "none"; ok.classList.add("show"); }
    });
  }

  /* ------------------------------------------------------------- Custom cursor */
  function initCursor() {
    if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;
    var ring = document.createElement("div"); ring.className = "cursor";
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.body.classList.add("cursor-on");
    var rx = 0, ry = 0, dx = 0, dy = 0;
    window.addEventListener("mousemove", function (e) {
      dx = e.clientX; dy = e.clientY;
      dot.style.left = dx + "px"; dot.style.top = dy + "px";
      ring.style.opacity = "1"; dot.style.opacity = "1";
    });
    (function loop() {
      rx += (dx - rx) * 0.18; ry += (dy - ry) * 0.18;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    })();
    $all("a, button, .exp-card, .dest-figure").forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("big"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("big"); });
    });
    window.addEventListener("mouseleave", function () { ring.style.opacity = "0"; dot.style.opacity = "0"; });
  }

  /* --------------------------------------------------- Realce opcional con GSAP */
  function initGsap() {
    if (!window.gsap) return;
    var g = window.gsap;
    if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);

    // Parallax suave del fondo del hero
    var heroBg = $(".hero-bg");
    if (heroBg && window.ScrollTrigger) {
      g.to(heroBg, {
        yPercent: 16, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
    // Parallax leve del fondo del CTA
    var ctaBg = $(".cta-bg");
    if (ctaBg && window.ScrollTrigger) {
      g.fromTo(ctaBg, { yPercent: -8 }, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true }
      });
    }
  }

  /* -------------------------------------------------------------------- Year */
  function initYear() {
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  }

  /* -------------------------------------------------------------------- Boot */
  function boot() {
    safe(initContact, "contact");
    safe(initSplash, "splash");
    safe(initNav, "nav");
    safe(initReveal, "reveal");
    safe(initMarquee, "marquee");
    safe(initTestimonials, "testimonials");
    safe(initForm, "form");
    safe(initCursor, "cursor");
    safe(initGsap, "gsap");
    safe(initYear, "year");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
