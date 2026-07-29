const { chromium } = require('/tmp/claude-0/-home-user-2/8a8345cd-5a26-54c4-ab16-b610a00dfeb1/scratchpad/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
  const p = await ctx.newPage();
  await p.emulateMedia({ media: 'screen' });
  await p.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);

  await p.addStyleTag({ content: `
    [data-splash]{display:none!important}
    [data-cursor-root]{display:none!important}
    .scroll-progress,.hero-scroll{display:none!important}
    [data-reveal]{opacity:1!important;transform:none!important;transition:none!important}
    .hero-inner{opacity:1!important;transform:none!important}
    .hero-mesh,.hero-grain{display:none!important}
    .nav{position:absolute!important}
    .hero{min-height:0!important;height:auto!important;padding-top:7rem!important;padding-bottom:3.5rem!important}
  `});

  await p.evaluate(async () => {
    // Neutralize scroll-driven animations so nothing is left faded/moved
    try { if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill(false)); } catch(e){}
    try { if (window.gsap) gsap.killTweensOf('*'); } catch(e){}
    ['.hero-inner','.hero-bg','.hero-bg img'].forEach(sel =>
      document.querySelectorAll(sel).forEach(el => { el.style.transform='none'; el.style.opacity=''; }));
    // Counters to final value (no animation in a PDF)
    document.querySelectorAll('[data-count-to]').forEach(e => { e.textContent = e.dataset.countTo; });
    // Force every image to load (defeat lazy)
    const imgs = [...document.querySelectorAll('img')];
    await Promise.all(imgs.map(img => {
      img.loading = 'eager';
      if (img.complete && img.naturalWidth > 0) return;
      return new Promise(res => { img.onload = img.onerror = res; setTimeout(res, 4000); });
    }));
  });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);

  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.pdf({
    path: '/home/user/2/sabai-madrid.pdf',
    printBackground: true, width: '1280px', height: h + 'px',
    pageRanges: '1', margin: { top:'0',bottom:'0',left:'0',right:'0' },
  });
  console.log('PDF OK, height', h);
  await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
