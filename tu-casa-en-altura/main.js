(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* Splash: CSS + JS double safety */
  function initSplash() {
    var s = $("#splash");
    if (!s) return;
    var hide = function () { s.classList.add("hide"); };
    window.addEventListener("load", function () { setTimeout(hide, 350); });
    setTimeout(hide, 2200); // safety net
  }

  /* Nav: scrolled state + mobile drawer */
  function initNav() {
    var nav = $("#nav"), toggle = $("#navToggle"), drawer = $("#navDrawer");
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 40); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    if (toggle && drawer) {
      toggle.addEventListener("click", function () {
        var open = drawer.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      });
      $$("a", drawer).forEach(function (a) {
        a.addEventListener("click", function () {
          drawer.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* Smooth anchor scroll with nav offset */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 66;
      window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* Reveal on scroll */
  function initReveals() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
    // Safety: reveal everything after 6s no matter what
    setTimeout(function () { els.forEach(function (el) { el.classList.add("in"); }); }, 6000);
  }

  /* Count-up numbers */
  function initCounters() {
    var nums = $$("[data-count]");
    if (!nums.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseInt(el.getAttribute("data-count"), 10);
        io.unobserve(el);
        if (reduced) { el.textContent = target; return; }
        var start = 0, dur = 1200, t0 = performance.now();
        (function tick(now) {
          var p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* Lightbox for gallery */
  function initLightbox() {
    var grid = $("[data-gallery]");
    var imgs = data.gallery && data.gallery.length ? data.gallery
             : $$("[data-gallery] img").map(function (im) { return { src: im.getAttribute("src"), cap: im.getAttribute("alt") }; });
    if (!grid || !imgs.length) return;
    var i = 0;
    var lb = document.createElement("div");
    lb.className = "lb";
    lb.innerHTML =
      '<button class="lb-close" aria-label="Cerrar">&times;</button>' +
      '<button class="lb-nav lb-prev" aria-label="Anterior">&#8249;</button>' +
      '<img class="lb-img" alt="">' +
      '<button class="lb-nav lb-next" aria-label="Siguiente">&#8250;</button>' +
      '<p class="lb-cap"></p>';
    document.body.appendChild(lb);
    var img = $(".lb-img", lb), cap = $(".lb-cap", lb);
    function show(n) {
      i = (n + imgs.length) % imgs.length;
      img.src = imgs[i].src; img.alt = imgs[i].cap || ""; cap.textContent = imgs[i].cap || "";
    }
    function open(n) { show(n); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    $$("[data-gallery] .gal-item").forEach(function (fig, idx) {
      fig.addEventListener("click", function () { open(idx); });
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(i - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(i + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(i - 1);
      else if (e.key === "ArrowRight") show(i + 1);
    });
  }

  /* Form (simulated submit) */
  function initForm() {
    var form = $("#leadForm"), ok = $("#formOk");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = $(".form-submit", form);
      btn.textContent = "Enviando…"; btn.disabled = true;
      setTimeout(function () {
        // Build a WhatsApp handoff so the lead actually reaches the sales team
        var d = new FormData(form);
        var msg = "Hola, soy " + (d.get("nombre") || "") + " (" + (d.get("pais") || "") + "). " +
                  "Me interesa Tu Casa en Altura en Sajonia. Email: " + (d.get("email") || "") +
                  (d.get("telefono") ? " · Tel: " + d.get("telefono") : "") +
                  (d.get("mensaje") ? ". " + d.get("mensaje") : "");
        if (ok) ok.hidden = false;
        form.reset();
        btn.textContent = "Abrir WhatsApp con mis datos"; btn.disabled = false;
        btn.type = "button";
        btn.onclick = function () {
          window.open("https://wa.me/" + (data.whatsapp || "595991368222") + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
        };
      }, 700);
    });
  }

  /* Footer year */
  function initYear() { var y = $("#year"); if (y) y.textContent = new Date().getFullYear(); }

  /* GSAP hero parallax (progressive enhancement) */
  function initHeroParallax() {
    if (reduced) return;
    var bg = $(".hero-bg img");
    if (!bg) return;
    gsap.to(bg, {
      yPercent: 14, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
  }

  function boot() {
    safe(initSplash, "splash");
    safe(initNav, "nav");
    safe(initAnchors, "anchors");
    safe(initReveals, "reveals");
    safe(initCounters, "counters");
    safe(initLightbox, "lightbox");
    safe(initForm, "form");
    safe(initYear, "year");
    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initHeroParallax, "heroParallax");
    }
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
