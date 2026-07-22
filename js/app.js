/* ================================================================
   Rafa Tracker — app.js
   PWA de hábitos, organización del día, puntos/recompensas y coach.
   Datos 100% locales (localStorage). Sin dependencias externas.
   ================================================================ */
(function () {
  "use strict";

  /* ------------------------------------------------------------ */
  /*  Constantes                                                  */
  /* ------------------------------------------------------------ */
  const STORE_KEY = "rafatracker.v1";

  const BLOCKS = [
    { id: "morning",   label: "Mañana",  emoji: "🌅", from: 5,  to: 12 },
    { id: "afternoon", label: "Tarde",   emoji: "☀️", from: 12, to: 18 },
    { id: "night",     label: "Noche",   emoji: "🌙", from: 18, to: 29 }, // 29 => wraps
    { id: "anytime",   label: "Cualquier momento", emoji: "🕐", from: -1, to: -1 },
  ];

  const COLORS = [
    "#e0b64d", "#5b9bd5", "#e0705a", "#6bbf7b", "#a98bd6",
    "#e8935a", "#4bb6c4", "#d96ba0", "#b7c24b", "#7d8ce0",
  ];

  const HABIT_EMOJIS = ["💧","🏋️","🧘","📚","🗒️","🏃","🥗","😴","🦷","🚿","☀️","🎯","💊","✍️","🎸","💻","🙏","📞","🧹","🌱","🚭","💰","🎨","📵"];
  const REWARD_EMOJIS = ["🎮","🎬","🍰","🌴","🛍️","🍕","☕","🎧","📺","⚽","🍫","🧖","🚗","✈️","🎁","🍺","💆","🎟️","🏖️","📱"];

  const DAY_LABELS = ["D","L","M","X","J","V","S"];
  const DAY_LONG = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

  /* ------------------------------------------------------------ */
  /*  Estado / persistencia                                       */
  /* ------------------------------------------------------------ */
  function seed() {
    return {
      version: 1,
      points: 0,
      lifetimePoints: 0,
      habits: [
        h("Planear el día", "🗒️", "#e0b64d", "morning", 10),
        h("Beber agua",     "💧", "#5b9bd5", "anytime", 5),
        h("Ejercicio",      "🏋️", "#e0705a", "morning", 20),
        h("Meditar",        "🧘", "#a98bd6", "morning", 10),
        h("Leer",           "📚", "#4bb6c4", "night",   10),
      ],
      rewards: [
        r("30 min de videojuegos", "🎮", "#5b9bd5", 50),
        r("Capricho dulce",        "🍰", "#d96ba0", 40),
        r("Ver una película",      "🎬", "#a98bd6", 80),
        r("Día de descanso",       "🌴", "#6bbf7b", 300),
      ],
      completions: {},   // { 'YYYY-MM-DD': { habitId: true } }
      redemptions: [],   // [{ id, rewardId, name, cost, date }]
      settings: { name: "Rafa", apiKey: "", model: "claude-haiku-4-5-20251001" },
      coachLog: [],
      seeded: true,
    };
  }
  function h(name, emoji, color, block, points) {
    return { id: uid(), name, emoji, color, block, points, days: "daily", createdAt: Date.now(), order: Date.now() + Math.random() };
  }
  function r(name, emoji, color, cost) {
    return { id: uid(), name, emoji, color, cost, createdAt: Date.now(), order: Date.now() + Math.random() };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return seed();
      const s = JSON.parse(raw);
      // defensivo
      s.habits = s.habits || [];
      s.rewards = s.rewards || [];
      s.completions = s.completions || {};
      s.redemptions = s.redemptions || [];
      s.settings = Object.assign({ name: "Rafa", apiKey: "", model: "claude-haiku-4-5-20251001" }, s.settings || {});
      s.coachLog = s.coachLog || [];
      return s;
    } catch (e) { return seed(); }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ------------------------------------------------------------ */
  /*  Utilidades                                                  */
  /* ------------------------------------------------------------ */
  function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }

  function dateKey(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function todayKey() { return dateKey(new Date()); }

  function longDate(d) {
    d = d || new Date();
    const days = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`;
  }
  function greeting() {
    const hh = new Date().getHours();
    if (hh < 6) return "Buenas noches";
    if (hh < 12) return "Buenos días";
    if (hh < 19) return "Buenas tardes";
    return "Buenas noches";
  }
  function currentBlockId() {
    const hh = new Date().getHours();
    if (hh >= 5 && hh < 12) return "morning";
    if (hh >= 12 && hh < 18) return "afternoon";
    return "night";
  }
  function blockRank(id) { return { morning: 0, afternoon: 1, night: 2, anytime: 3 }[id] ?? 3; }

  function habitDueOn(habit, d) {
    if (habit.days === "daily" || !Array.isArray(habit.days)) return true;
    return habit.days.includes(d.getDay());
  }
  function isDone(habitId, key) {
    return !!(state.completions[key] && state.completions[key][habitId]);
  }
  function streakOf(habit) {
    let count = 0;
    let cursor = new Date();
    const tKey = todayKey();
    // Si hoy corresponde y no está hecho, la racha se mide hasta ayer.
    if (habitDueOn(habit, cursor) && !isDone(habit.id, tKey)) cursor = addDays(cursor, -1);
    for (let i = 0; i < 3660; i++) {
      if (habitDueOn(habit, cursor)) {
        if (isDone(habit.id, dateKey(cursor))) count++;
        else break;
      }
      cursor = addDays(cursor, -1);
    }
    return count;
  }
  function todayHabits() {
    const now = new Date();
    return state.habits
      .filter(x => !x.archived && habitDueOn(x, now))
      .sort((a, b) => blockRank(a.block) - blockRank(b.block) || a.order - b.order);
  }

  /* ------------------------------------------------------------ */
  /*  Acciones                                                    */
  /* ------------------------------------------------------------ */
  function toggleHabit(id) {
    const key = todayKey();
    const habit = state.habits.find(x => x.id === id);
    if (!habit) return;
    state.completions[key] = state.completions[key] || {};
    const wasDone = !!state.completions[key][id];
    if (wasDone) {
      delete state.completions[key][id];
      state.points = Math.max(0, state.points - habit.points);
      state.lifetimePoints = Math.max(0, state.lifetimePoints - habit.points);
    } else {
      state.completions[key][id] = true;
      state.points += habit.points;
      state.lifetimePoints += habit.points;
      const st = streakOf(habit);
      if (st > 0 && st % 7 === 0) toast(`🔥 ¡Racha de ${st} días en ${habit.name}!`, true);
      else toast(`+${habit.points} pts`, true);
    }
    save();
    render();
  }
  function redeem(rewardId) {
    const rw = state.rewards.find(x => x.id === rewardId);
    if (!rw) return;
    if (state.points < rw.cost) { toast("Puntos insuficientes"); return; }
    state.points -= rw.cost;
    state.redemptions.unshift({ id: uid(), rewardId, name: rw.name, emoji: rw.emoji, cost: rw.cost, date: todayKey(), ts: Date.now() });
    save();
    toast(`🎉 ¡Canjeaste ${rw.name}!`, true);
    render();
  }

  /* ------------------------------------------------------------ */
  /*  Router / render principal                                   */
  /* ------------------------------------------------------------ */
  let currentTab = "today";
  const TAB_TITLES = { today: "Hoy", rewards: "Recompensas", stats: "Progreso", coach: "Coach" };

  function render() {
    const view = $("#view");
    $("#headerTitle").textContent = TAB_TITLES[currentTab];
    $("#headerSubtitle").textContent = currentTab === "today" ? longDate() : "";
    // FAB solo en today y rewards
    $("#fab").classList.toggle("hidden", !(currentTab === "today" || currentTab === "rewards"));
    if (currentTab === "today") view.innerHTML = "", view.appendChild(renderToday());
    else if (currentTab === "rewards") view.innerHTML = "", view.appendChild(renderRewards());
    else if (currentTab === "stats") view.innerHTML = "", view.appendChild(renderStats());
    else if (currentTab === "coach") view.innerHTML = "", view.appendChild(renderCoach());
    view.scrollTop = 0;
  }

  /* ---------------- Vista: HOY ---------------- */
  function renderToday() {
    const frag = document.createDocumentFragment();
    const habits = todayHabits();
    const key = todayKey();
    const doneCount = habits.filter(x => isDone(x.id, key)).length;
    const total = habits.length;
    const pct = total ? Math.round((doneCount / total) * 100) : 0;

    // Hero
    const hero = el("div", "hero");
    hero.appendChild(ring(pct));
    const info = el("div", "hero-info");
    info.innerHTML = `
      <div class="hero-greet">${esc(greeting())}, ${esc(state.settings.name || "Rafa")}</div>
      <div class="hero-title">${total ? (doneCount === total ? "¡Día completado! 🏆" : `${doneCount} de ${total} hábitos`) : "Sin hábitos para hoy"}</div>
      <div class="hero-stats">
        <div class="hero-stat"><b class="gold">${state.points}</b><span>PUNTOS</span></div>
        <div class="hero-stat"><b>${bestStreakToday()}🔥</b><span>MEJOR RACHA</span></div>
      </div>`;
    hero.appendChild(info);
    frag.appendChild(hero);

    if (!total) {
      frag.appendChild(emptyState("🗒️", "No tienes hábitos programados para hoy.", "Toca el botón + para crear tu primer hábito."));
      return frag;
    }

    // Agrupar por bloque
    const now = new Date();
    for (const block of BLOCKS) {
      const inBlock = habits.filter(x => x.block === block.id);
      if (!inBlock.length) continue;
      const isCurrent = block.id === currentBlockId() && block.id !== "anytime";
      const label = el("div", "section-label");
      const bd = inBlock.filter(x => isDone(x.id, key)).length;
      label.innerHTML = `${block.emoji} ${block.label} ${isCurrent ? "· ahora" : ""} <span class="count">${bd}/${inBlock.length}</span>`;
      frag.appendChild(label);
      const group = el("div", "block-group");
      inBlock.forEach(x => group.appendChild(habitRow(x, key)));
      frag.appendChild(group);
    }
    return frag;
  }

  function habitRow(hb, key) {
    const done = isDone(hb.id, key);
    const st = streakOf(hb);
    const row = el("div", "habit");
    const accent = el("div", "accent"); accent.style.background = hb.color; row.appendChild(accent);
    const emo = el("div", "habit-emoji", esc(hb.emoji)); emo.style.borderColor = hexA(hb.color, .4); row.appendChild(emo);
    const body = el("div", "habit-body");
    body.innerHTML = `<div class="habit-name ${done ? "done" : ""}">${esc(hb.name)}</div>
      <div class="habit-meta"><span class="pts">+${hb.points} pts</span>${st > 0 ? `<span class="streak-pill">🔥 ${st}</span>` : ""}</div>`;
    row.appendChild(body);
    const chk = el("button", "check" + (done ? " on" : ""));
    chk.style.background = done ? hb.color : "transparent";
    chk.style.borderColor = done ? hb.color : "";
    chk.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    chk.onclick = (e) => { e.stopPropagation(); toggleHabit(hb.id); };
    row.appendChild(chk);
    row.onclick = () => openHabitSheet(hb);
    return row;
  }

  function bestStreakToday() {
    let max = 0;
    state.habits.filter(x => !x.archived).forEach(x => { const s = streakOf(x); if (s > max) max = s; });
    return max;
  }

  /* ---------------- Vista: RECOMPENSAS ---------------- */
  function renderRewards() {
    const frag = document.createDocumentFragment();
    const bal = el("div", "balance-card");
    bal.innerHTML = `<div class="balance-label">Saldo disponible</div>
      <div class="balance-value"><span class="coin">◆</span> ${state.points}</div>
      <div class="balance-sub">${state.lifetimePoints} pts ganados en total</div>`;
    frag.appendChild(bal);

    if (!state.rewards.length) {
      frag.appendChild(emptyState("🎁", "Aún no tienes recompensas.", "Crea premios que puedas canjear con tus puntos."));
    } else {
      const label = el("div", "section-label", "Tienda de recompensas");
      frag.appendChild(label);
      state.rewards.slice().sort((a, b) => a.cost - b.cost).forEach(rw => {
        const can = state.points >= rw.cost;
        const card = el("div", "reward");
        const acc = el("div", "accent"); acc.style.background = rw.color; card.appendChild(acc);
        const emo = el("div", "reward-emoji", esc(rw.emoji)); emo.style.borderColor = hexA(rw.color, .4); card.appendChild(emo);
        const body = el("div", "reward-body");
        body.innerHTML = `<div class="reward-name">${esc(rw.name)}</div><div class="reward-cost">◆ ${rw.cost} pts</div>`;
        card.appendChild(body);
        const btn = el("button", "redeem-btn", can ? "Canjear" : "Faltan " + (rw.cost - state.points));
        btn.disabled = !can;
        btn.onclick = () => redeem(rw.id);
        card.appendChild(btn);
        card.oncontextmenu = (e) => { e.preventDefault(); openRewardSheet(rw); };
        // long-press editar
        attachLongPress(card, () => openRewardSheet(rw));
        frag.appendChild(card);
      });
    }

    if (state.redemptions.length) {
      frag.appendChild(el("div", "section-label", "Historial de canjes"));
      const hist = el("div", "card"); hist.style.padding = "4px 16px";
      state.redemptions.slice(0, 12).forEach(rd => {
        const row = el("div", "manage-row");
        row.innerHTML = `<div class="mr-emoji">${esc(rd.emoji || "🎁")}</div>
          <div class="mr-name">${esc(rd.name)}<div style="font-size:12px;color:var(--muted)">${esc(prettyDay(rd.date))}</div></div>
          <div style="color:var(--gold);font-weight:600;font-size:13px">−${rd.cost}</div>`;
        hist.appendChild(row);
      });
      frag.appendChild(hist);
    }
    return frag;
  }
  function prettyDay(key) {
    const [y, m, d] = key.split("-").map(Number);
    return longDate(new Date(y, m - 1, d));
  }

  /* ---------------- Vista: PROGRESO ---------------- */
  function renderStats() {
    const frag = document.createDocumentFragment();
    // Stat boxes
    const active = state.habits.filter(x => !x.archived);
    const key = todayKey();
    const doneToday = todayHabits().filter(x => isDone(x.id, key)).length;
    const grid = el("div", "stat-grid");
    grid.appendChild(statBox(state.points, "Puntos actuales", true));
    grid.appendChild(statBox(state.lifetimePoints, "Puntos totales", false));
    grid.appendChild(statBox(active.length, "Hábitos activos", false));
    grid.appendChild(statBox(weekRate() + "%", "Constancia 7 días", true));
    frag.appendChild(grid);

    // Heatmap últimos 28 días
    frag.appendChild(el("div", "section-label", "Últimas 4 semanas"));
    const heatCard = el("div", "card"); heatCard.style.padding = "16px";
    const heat = el("div", "heat");
    DAY_LABELS.forEach((_, i) => heat.appendChild(el("div", "dow", DAY_LABELS[(i + 1) % 7]))); // L..D
    // Alinear: empezar hace 27 días ajustando a lunes
    const cells = [];
    for (let i = 27; i >= 0; i--) cells.push(addDays(new Date(), -i));
    // relleno inicial para cuadrar por día de semana (lunes=1)
    const first = cells[0];
    let pad = (first.getDay() + 6) % 7; // 0 = lunes
    for (let p = 0; p < pad; p++) heat.appendChild(el("div", "cell", ""));
    cells.forEach(d => {
      const k = dateKey(d);
      const due = state.habits.filter(x => !x.archived && habitDueOn(x, d));
      const done = due.filter(x => isDone(x.id, k)).length;
      const ratio = due.length ? done / due.length : 0;
      const c = el("div", "cell", done ? String(done) : "");
      if (ratio > 0) {
        c.style.background = hexA("#d4af37", 0.18 + ratio * 0.6);
        c.style.borderColor = hexA("#d4af37", 0.4);
        c.style.color = ratio > 0.6 ? "#0a0a0c" : "var(--gold-2)";
        c.style.fontWeight = "700";
      }
      if (k === key) c.style.outline = "1.5px solid var(--gold-2)";
      heat.appendChild(c);
    });
    heatCard.appendChild(heat);
    frag.appendChild(heatCard);

    // Rachas por hábito
    if (active.length) {
      frag.appendChild(el("div", "section-label", "Rachas actuales"));
      const card = el("div", "card"); card.style.padding = "4px 16px";
      active.map(x => ({ x, s: streakOf(x) })).sort((a, b) => b.s - a.s).forEach(({ x, s }) => {
        const row = el("div", "streak-row");
        const dot = el("div", "streak-dot", esc(x.emoji)); dot.style.background = hexA(x.color, .18); dot.style.border = "1px solid " + hexA(x.color, .4);
        row.appendChild(dot);
        row.appendChild(el("div", "nm", esc(x.name)));
        row.appendChild(el("div", "val", `${s} 🔥`));
        card.appendChild(row);
      });
      frag.appendChild(card);
    }
    return frag;
  }
  function statBox(num, lbl, gold) {
    const b = el("div", "stat-box");
    b.innerHTML = `<div class="num ${gold ? "gold" : ""}">${num}</div><div class="lbl">${lbl}</div>`;
    return b;
  }
  function weekRate() {
    let due = 0, done = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(new Date(), -i); const k = dateKey(d);
      state.habits.filter(x => !x.archived && habitDueOn(x, d)).forEach(x => { due++; if (isDone(x.id, k)) done++; });
    }
    return due ? Math.round((done / due) * 100) : 0;
  }

  /* ---------------- Vista: COACH ---------------- */
  function renderCoach() {
    const frag = document.createDocumentFragment();
    const hasKey = !!(state.settings.apiKey || "").trim();

    frag.appendChild(el("div", "section-label", "Coach de hábitos"));
    const actions = el("div", "coach-actions");
    actions.appendChild(coachBtn("🎯", "Ordena mis hábitos por urgencia", "Prioriza qué hacer ahora mismo", () => coachPrioritize()));
    actions.appendChild(coachBtn("📋", "Resumen de mi día", "Cómo vas hoy y qué falta", () => coachSummary()));
    actions.appendChild(coachBtn("💪", "Dame motivación", "Un empujón para seguir", () => coachMotivate()));
    frag.appendChild(actions);

    // Salida
    const out = el("div", "coach-output"); out.id = "coachOut";
    if (state.coachLog.length) {
      state.coachLog.slice(-14).forEach(m => out.appendChild(coachMsgEl(m)));
    } else {
      out.appendChild(el("div", "coach-msg", `<div class="who"><span class="r">◆</span> Coach</div>Toca un botón de arriba para empezar. ${hasKey ? "Claude está <b>conectado</b> 🟢, así que las respuestas serán más ricas." : "Estoy en modo local (gratis y sin conexión). Puedes conectar Claude en Ajustes para consejos más ricos."}`));
    }
    frag.appendChild(out);

    // Composer (chat libre)
    const comp = el("div", "coach-composer");
    const input = el("input"); input.type = "text"; input.placeholder = hasKey ? "Pregúntale a Claude…" : "Escríbele a tu coach…"; input.id = "coachInput";
    const send = el("button");
    send.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
    send.onclick = () => { const v = input.value.trim(); if (v) { input.value = ""; coachChat(v); } };
    input.onkeydown = (e) => { if (e.key === "Enter") send.onclick(); };
    comp.appendChild(input); comp.appendChild(send);
    frag.appendChild(comp);

    const note = el("div", "pillnote");
    note.innerHTML = hasKey
      ? `🟢 Claude conectado (${esc(state.settings.model)}). Tu API key se guarda solo en este dispositivo.`
      : `💡 Modo local activo — gratis y sin conexión. Para respuestas de Claude real, añade tu API key de Anthropic en <b>Ajustes</b>.`;
    frag.appendChild(note);
    return frag;
  }
  function coachBtn(icon, title, sub, onClick) {
    const b = el("button", "coach-btn");
    b.innerHTML = `<div class="ci">${icon}</div><div class="ct"><b>${esc(title)}</b><span>${esc(sub)}</span></div>`;
    b.onclick = onClick;
    return b;
  }
  function coachMsgEl(m) {
    const e = el("div", "coach-msg" + (m.role === "user" ? " from-user" : ""));
    if (m.role === "user") e.innerHTML = `<div class="who">Tú</div>${esc(m.text)}`;
    else e.innerHTML = `<div class="who"><span class="r">◆</span> Coach</div>${m.html || esc(m.text)}`;
    return e;
  }
  function pushCoach(role, text, html) {
    state.coachLog.push({ role, text, html, ts: Date.now() });
    if (state.coachLog.length > 60) state.coachLog = state.coachLog.slice(-60);
    save();
    if (currentTab === "coach") {
      const out = $("#coachOut");
      if (out) {
        if (state.coachLog.length === 1) out.innerHTML = "";
        out.appendChild(coachMsgEl(state.coachLog[state.coachLog.length - 1]));
        out.scrollIntoView({ block: "end" });
        window.scrollTo(0, document.body.scrollHeight);
        $("#view").scrollTop = $("#view").scrollHeight;
      }
    }
  }

  /* ----- Coach: lógica local (gratis) ----- */
  function contextSnapshot() {
    const key = todayKey();
    const habits = todayHabits();
    const pending = habits.filter(x => !isDone(x.id, key));
    const done = habits.filter(x => isDone(x.id, key));
    return { key, habits, pending, done, points: state.points };
  }
  function urgencyRank() {
    const { key, pending } = contextSnapshot();
    const curBlock = currentBlockId();
    const scored = pending.map(hb => {
      let score = hb.points;
      const reasons = [];
      const st = streakOf(hb);
      if (st > 0) { score += 45 + st * 3; reasons.push(`racha de ${st} 🔥 en riesgo`); }
      if (hb.block === curBlock) { score += 25; reasons.push("es su franja horaria ahora"); }
      else if (hb.block !== "anytime" && blockRank(hb.block) < blockRank(curBlock)) { score += 18; reasons.push("quedó pendiente de antes"); }
      if (hb.points >= 20) { score += 8; reasons.push("alto valor en puntos"); }
      if (!reasons.length) reasons.push("suma a tu día");
      return { hb, score, why: reasons.slice(0, 2).join(" · ") };
    }).sort((a, b) => b.score - a.score);
    return scored;
  }
  function coachPrioritize() {
    if (state.settings.apiKey.trim()) return callClaude("Ordena mis hábitos pendientes por urgencia y dime por dónde empezar, breve.");
    const ranked = urgencyRank();
    pushCoach("user", "🎯 Ordena mis hábitos por urgencia");
    if (!ranked.length) { pushCoach("assistant", "", "¡Todo hecho por ahora! No tienes pendientes. Buen momento para descansar o adelantar algo. 🏆"); return; }
    let html = `Este es tu orden recomendado ahora mismo:<div style="margin-top:10px">`;
    ranked.forEach((it, i) => {
      html += `<div class="rank-item"><div class="rank-num">${i + 1}</div><div><div class="ri-name">${esc(it.hb.emoji)} ${esc(it.hb.name)} <span style="color:var(--gold);font-weight:600;font-size:12px">+${it.hb.points}</span></div><div class="ri-why">${esc(it.why)}</div></div></div>`;
    });
    html += `</div><div style="margin-top:10px;color:var(--muted);font-size:13px">Empieza por <b style="color:var(--gold-2)">${esc(ranked[0].hb.name)}</b> — no rompas esa inercia.</div>`;
    pushCoach("assistant", "", html);
  }
  function coachSummary() {
    if (state.settings.apiKey.trim()) return callClaude("Dame un resumen breve y motivador de cómo voy hoy.");
    const { habits, done, pending, points } = contextSnapshot();
    pushCoach("user", "📋 Resumen de mi día");
    if (!habits.length) { pushCoach("assistant", "", "Hoy no tienes hábitos programados. Puedes crear uno con el botón +."); return; }
    const pct = Math.round((done.length / habits.length) * 100);
    let msg = `Llevas <b style="color:var(--gold-2)">${done.length}/${habits.length}</b> hábitos (${pct}%) y <b style="color:var(--gold-2)">${points} pts</b>. `;
    if (pct === 100) msg += "¡Día perfecto! 🏆 Cierra con orgullo.";
    else if (pending.length) {
      const next = urgencyRank()[0];
      msg += `Te falta poco. Lo siguiente: <b>${esc(next.hb.emoji)} ${esc(next.hb.name)}</b>.`;
    }
    pushCoach("assistant", "", msg);
  }
  function coachMotivate() {
    if (state.settings.apiKey.trim()) return callClaude("Dame una frase de motivación corta y personal para seguir con mis hábitos hoy.");
    pushCoach("user", "💪 Dame motivación");
    const best = bestStreakToday();
    const lines = [
      "La disciplina es elegir entre lo que quieres ahora y lo que quieres más. Sigue. 💪",
      "Un hábito no se rompe hoy ni se construye hoy: se decide hoy. Marca el siguiente.",
      "No necesitas motivación, necesitas empezar el primero. El resto cae solo.",
      best > 0 ? `Tienes una racha de ${best} días viva. No la dejes apagarse hoy. 🔥` : "Empieza una racha hoy. Mañana te lo agradecerás.",
      "Los días buenos no se esperan, se construyen hábito por hábito. Vamos, Rafa.",
    ];
    pushCoach("assistant", "", lines[Math.floor(Math.random() * lines.length)]);
  }
  function coachChat(text) {
    if (state.settings.apiKey.trim()) { pushCoach("user", text); return callClaude(text, true); }
    pushCoach("user", text);
    // Respuesta local sencilla basada en intención
    const t = text.toLowerCase();
    if (/urgen|priorid|empez|primero|orden/.test(t)) return coachPrioritize();
    if (/resumen|voy|c[oó]mo|progreso/.test(t)) return coachSummary();
    if (/motiv|[aá]nimo|ganas|flojera|pereza/.test(t)) return coachMotivate();
    pushCoach("assistant", "", "Estoy en modo local y respondo mejor a: <b>ordena mis hábitos</b>, <b>resumen de mi día</b> o <b>dame motivación</b>. Para conversar libremente con Claude, añade tu API key en Ajustes. ⚙️");
  }

  /* ----- Coach: Claude real (opcional) ----- */
  async function callClaude(userText, alreadyLogged) {
    if (!alreadyLogged) pushCoach("user", userText);
    const out = $("#coachOut");
    const typing = el("div", "coach-msg");
    typing.innerHTML = `<div class="who"><span class="r">◆</span> Claude</div><span class="typing"><i></i><i></i><i></i></span>`;
    if (out) { if (state.coachLog.length === 1) {} out.appendChild(typing); $("#view").scrollTop = $("#view").scrollHeight; }
    const { habits, done, pending, points } = contextSnapshot();
    const sys = `Eres el coach personal de hábitos de ${state.settings.name || "Rafa"} dentro de la app "Rafa Tracker". Responde SIEMPRE en español, breve (máx 4-5 frases), directo, cálido y práctico. Usa los datos para dar consejos concretos y, si te lo piden, prioriza los hábitos por urgencia (ten en cuenta rachas en riesgo, franja horaria y valor en puntos). No inventes hábitos que no estén en la lista.
Contexto de hoy (${longDate()}):
- Puntos: ${points}
- Hábitos de hoy: ${habits.map(x => `${x.name} [${x.block}, +${x.points}pts, racha ${streakOf(x)}, ${isDone(x.id, todayKey()) ? "HECHO" : "pendiente"}]`).join("; ") || "ninguno"}
- Completados: ${done.length}/${habits.length}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": state.settings.apiKey.trim(),
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: state.settings.model || "claude-haiku-4-5-20251001",
          max_tokens: 500,
          system: sys,
          messages: [{ role: "user", content: userText }],
        }),
      });
      typing.remove();
      if (!res.ok) {
        let detail = "";
        try { const j = await res.json(); detail = j.error && j.error.message ? j.error.message : ""; } catch (e) {}
        pushCoach("assistant", "", `⚠️ No pude conectar con Claude (${res.status}). ${esc(detail)}<br><span style="font-size:12px;color:var(--muted)">Revisa tu API key en Ajustes. Mientras tanto uso el modo local.</span>`);
        return;
      }
      const data = await res.json();
      const text = (data.content || []).map(c => c.text || "").join("").trim();
      pushCoach("assistant", text || "…", esc(text || "…").replace(/\n/g, "<br>"));
    } catch (e) {
      typing.remove();
      pushCoach("assistant", "", `⚠️ Error de red al contactar a Claude. Revisa tu conexión.<br><span style="font-size:12px;color:var(--muted)">Uso el modo local mientras tanto.</span>`);
    }
  }

  /* ------------------------------------------------------------ */
  /*  Componentes visuales                                        */
  /* ------------------------------------------------------------ */
  function ring(pct) {
    const wrap = el("div", "hero-ring");
    const size = 78, sw = 7, r = (size - sw) / 2, c = 2 * Math.PI * r;
    const off = c * (1 - pct / 100);
    wrap.innerHTML = `<div class="ring-wrap"><svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="#262630" stroke-width="${sw}" fill="none"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="url(#gg)" stroke-width="${sw}" fill="none"
        stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${size/2} ${size/2})" style="transition:stroke-dashoffset .5s ease"/>
      <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9c96a"/><stop offset="1" stop-color="#d4af37"/></linearGradient></defs>
      </svg><div class="pct">${pct}%</div></div>`;
    return wrap;
  }
  function emptyState(icon, title, hint) {
    const e = el("div", "empty");
    e.innerHTML = `<div class="em-ic">${icon}</div><p>${esc(title)}</p><p class="hint">${esc(hint)}</p>`;
    return e;
  }
  function hexA(hex, a) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map(x => x + x).join("") : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function toast(msg, gold) {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast show" + (gold ? " gold" : "");
    clearTimeout(t._h);
    t._h = setTimeout(() => { t.className = "toast"; }, 1600);
  }
  function attachLongPress(elm, cb) {
    let timer;
    const start = () => { timer = setTimeout(cb, 500); };
    const cancel = () => clearTimeout(timer);
    elm.addEventListener("touchstart", start, { passive: true });
    elm.addEventListener("touchend", cancel);
    elm.addEventListener("touchmove", cancel);
    elm.addEventListener("mousedown", start);
    elm.addEventListener("mouseup", cancel);
    elm.addEventListener("mouseleave", cancel);
  }

  /* ------------------------------------------------------------ */
  /*  Sheets / modales                                            */
  /* ------------------------------------------------------------ */
  function openSheet(build) {
    const host = $("#modalHost");
    const ov = el("div", "sheet-overlay");
    const sheet = el("div", "sheet");
    sheet.appendChild(el("div", "sheet-grip"));
    build(sheet, () => host.innerHTML = "");
    ov.appendChild(sheet);
    ov.onclick = (e) => { if (e.target === ov) host.innerHTML = ""; };
    host.innerHTML = ""; host.appendChild(ov);
  }

  function openHabitSheet(existing) {
    openSheet((sheet, close) => {
      const editing = !!existing;
      const draft = editing
        ? Object.assign({}, existing)
        : { name: "", emoji: HABIT_EMOJIS[0], color: COLORS[0], block: "morning", points: 10, days: "daily" };
      sheet.appendChild(el("h2", null, editing ? "Editar hábito" : "Nuevo hábito"));
      sheet.appendChild(el("p", "sub", editing ? "Modifica los detalles de tu hábito." : "Define un hábito para tu rutina diaria."));

      // Nombre
      const fName = field("Nombre");
      const inName = inputEl("text", draft.name, "Ej. Salir a correr"); fName.appendChild(inName); sheet.appendChild(fName);

      // Emoji
      const fEmo = field("Ícono");
      const emoGrid = el("div", "emoji-grid");
      HABIT_EMOJIS.forEach(em => {
        const b = el("button", em === draft.emoji ? "sel" : "", em);
        b.onclick = () => { draft.emoji = em; [...emoGrid.children].forEach(c => c.classList.remove("sel")); b.classList.add("sel"); };
        emoGrid.appendChild(b);
      });
      fEmo.appendChild(emoGrid); sheet.appendChild(fEmo);

      // Color
      const fCol = field("Color");
      const colGrid = el("div", "color-grid");
      COLORS.forEach(c => {
        const d = el("button", "color-dot" + (c === draft.color ? " sel" : "")); d.style.background = c;
        d.onclick = () => { draft.color = c; [...colGrid.children].forEach(x => x.classList.remove("sel")); d.classList.add("sel"); };
        colGrid.appendChild(d);
      });
      fCol.appendChild(colGrid); sheet.appendChild(fCol);

      // Bloque
      const fBlk = field("Momento del día");
      const blkRow = el("div", "chip-row");
      BLOCKS.forEach(b => {
        const c = el("button", "chip" + (b.id === draft.block ? " sel" : ""), `${b.emoji} ${b.label}`);
        c.onclick = () => { draft.block = b.id; [...blkRow.children].forEach(x => x.classList.remove("sel")); c.classList.add("sel"); };
        blkRow.appendChild(c);
      });
      fBlk.appendChild(blkRow); sheet.appendChild(fBlk);

      // Días
      const fDays = field("Días");
      const dailyRow = el("div", "chip-row"); dailyRow.style.marginBottom = "8px";
      let daysMode = draft.days === "daily" ? "daily" : "custom";
      let customDays = Array.isArray(draft.days) ? draft.days.slice() : [1,2,3,4,5];
      const chAll = el("button", "chip" + (daysMode === "daily" ? " sel" : ""), "Todos los días");
      const chCustom = el("button", "chip" + (daysMode === "custom" ? " sel" : ""), "Días específicos");
      const dayRow = el("div", "day-row"); dayRow.style.marginTop = "8px";
      function renderDays() {
        chAll.classList.toggle("sel", daysMode === "daily");
        chCustom.classList.toggle("sel", daysMode === "custom");
        dayRow.style.display = daysMode === "custom" ? "flex" : "none";
      }
      chAll.onclick = () => { daysMode = "daily"; renderDays(); };
      chCustom.onclick = () => { daysMode = "custom"; renderDays(); };
      [1,2,3,4,5,6,0].forEach(di => {
        const c = el("button", "chip" + (customDays.includes(di) ? " sel" : ""), DAY_LABELS[di]);
        c.onclick = () => { if (customDays.includes(di)) customDays = customDays.filter(x => x !== di); else customDays.push(di); c.classList.toggle("sel"); };
        dayRow.appendChild(c);
      });
      dailyRow.appendChild(chAll); dailyRow.appendChild(chCustom);
      fDays.appendChild(dailyRow); fDays.appendChild(dayRow); sheet.appendChild(fDays); renderDays();

      // Puntos
      const fPts = field("Puntos por completar");
      const ptsRow = el("div", "chip-row");
      [5,10,15,20,30,50].forEach(p => {
        const c = el("button", "chip" + (p === draft.points ? " sel" : ""), "◆ " + p);
        c.onclick = () => { draft.points = p; [...ptsRow.children].forEach(x => x.classList.remove("sel")); c.classList.add("sel"); };
        ptsRow.appendChild(c);
      });
      fPts.appendChild(ptsRow); sheet.appendChild(fPts);

      // Guardar
      const save1 = el("button", "btn-primary", editing ? "Guardar cambios" : "Crear hábito");
      save1.onclick = () => {
        const name = inName.value.trim();
        if (!name) { toast("Ponle un nombre al hábito"); return; }
        const days = daysMode === "daily" ? "daily" : (customDays.length ? customDays.slice().sort() : "daily");
        if (editing) {
          Object.assign(existing, { name, emoji: draft.emoji, color: draft.color, block: draft.block, points: draft.points, days });
        } else {
          state.habits.push({ id: uid(), name, emoji: draft.emoji, color: draft.color, block: draft.block, points: draft.points, days, createdAt: Date.now(), order: Date.now() });
        }
        save(); close(); currentTab = "today"; setActiveTab(); render(); toast(editing ? "Hábito actualizado" : "Hábito creado", true);
      };
      sheet.appendChild(save1);

      if (editing) {
        const del = el("button", "btn-ghost btn-danger", "Eliminar hábito");
        del.onclick = () => {
          state.habits = state.habits.filter(x => x.id !== existing.id);
          save(); close(); render(); toast("Hábito eliminado");
        };
        sheet.appendChild(del);
      }
    });
  }

  function openRewardSheet(existing) {
    openSheet((sheet, close) => {
      const editing = !!existing;
      const draft = editing ? Object.assign({}, existing) : { name: "", emoji: REWARD_EMOJIS[0], color: COLORS[1], cost: 50 };
      sheet.appendChild(el("h2", null, editing ? "Editar recompensa" : "Nueva recompensa"));
      sheet.appendChild(el("p", "sub", "Algo que disfrutes y puedas canjear con tus puntos."));

      const fName = field("Nombre");
      const inName = inputEl("text", draft.name, "Ej. Ver una película"); fName.appendChild(inName); sheet.appendChild(fName);

      const fEmo = field("Ícono");
      const emoGrid = el("div", "emoji-grid");
      REWARD_EMOJIS.forEach(em => {
        const b = el("button", em === draft.emoji ? "sel" : "", em);
        b.onclick = () => { draft.emoji = em; [...emoGrid.children].forEach(c => c.classList.remove("sel")); b.classList.add("sel"); };
        emoGrid.appendChild(b);
      });
      fEmo.appendChild(emoGrid); sheet.appendChild(fEmo);

      const fCol = field("Color");
      const colGrid = el("div", "color-grid");
      COLORS.forEach(c => {
        const d = el("button", "color-dot" + (c === draft.color ? " sel" : "")); d.style.background = c;
        d.onclick = () => { draft.color = c; [...colGrid.children].forEach(x => x.classList.remove("sel")); d.classList.add("sel"); };
        colGrid.appendChild(d);
      });
      fCol.appendChild(colGrid); sheet.appendChild(fCol);

      const fCost = field("Costo en puntos");
      const inCost = inputEl("number", draft.cost, "50"); inCost.min = "1"; fCost.appendChild(inCost); sheet.appendChild(fCost);
      const quick = el("div", "chip-row"); quick.style.marginTop = "8px";
      [20,40,80,150,300].forEach(p => { const c = el("button", "chip", "◆ " + p); c.onclick = () => inCost.value = p; quick.appendChild(c); });
      fCost.appendChild(quick);

      const save1 = el("button", "btn-primary", editing ? "Guardar cambios" : "Crear recompensa");
      save1.onclick = () => {
        const name = inName.value.trim();
        const cost = Math.max(1, parseInt(inCost.value) || 0);
        if (!name) { toast("Ponle un nombre a la recompensa"); return; }
        if (editing) Object.assign(existing, { name, emoji: draft.emoji, color: draft.color, cost });
        else state.rewards.push({ id: uid(), name, emoji: draft.emoji, color: draft.color, cost, createdAt: Date.now(), order: Date.now() });
        save(); close(); currentTab = "rewards"; setActiveTab(); render(); toast(editing ? "Recompensa actualizada" : "Recompensa creada", true);
      };
      sheet.appendChild(save1);

      if (editing) {
        const del = el("button", "btn-ghost btn-danger", "Eliminar recompensa");
        del.onclick = () => { state.rewards = state.rewards.filter(x => x.id !== existing.id); save(); close(); render(); toast("Recompensa eliminada"); };
        sheet.appendChild(del);
      }
    });
  }

  function openSettings() {
    openSheet((sheet, close) => {
      sheet.appendChild(el("h2", null, "Ajustes"));
      sheet.appendChild(el("p", "sub", "Personaliza tu app y conecta a Claude (opcional)."));

      // Nombre
      const fName = field("Tu nombre");
      const inName = inputEl("text", state.settings.name, "Rafa"); fName.appendChild(inName); sheet.appendChild(fName);

      // Conexión Claude
      sheet.appendChild(el("div", "section-label", "Conexión con Claude (opcional)"));
      const fKey = field("API key de Anthropic");
      const inKey = inputEl("password", state.settings.apiKey, "sk-ant-…"); inKey.autocomplete = "off"; fKey.appendChild(inKey); sheet.appendChild(fKey);
      const fModel = field("Modelo");
      const sel = el("select");
      [["claude-haiku-4-5-20251001","Haiku 4.5 · rápido y económico (recomendado)"],
       ["claude-sonnet-5","Sonnet 5 · más capaz"],
       ["claude-opus-4-8","Opus 4.8 · máximo nivel"]].forEach(([v, l]) => {
        const o = el("option", null, l); o.value = v; if (v === state.settings.model) o.selected = true; sel.appendChild(o);
      });
      fModel.appendChild(sel); sheet.appendChild(fModel);
      const note = el("div", "pillnote");
      note.innerHTML = `Tu API key se guarda <b>solo en este dispositivo</b> y se usa para hablar directamente con la API de Anthropic. Consíguela gratis creando una cuenta en <span class="linkish">console.anthropic.com</span> (el uso tiene un costo mínimo por consulta). Sin key, el coach funciona en modo local gratis.`;
      sheet.appendChild(note);

      const saveBtn = el("button", "btn-primary", "Guardar ajustes");
      saveBtn.onclick = () => {
        state.settings.name = inName.value.trim() || "Rafa";
        state.settings.apiKey = inKey.value.trim();
        state.settings.model = sel.value;
        save(); close(); render(); toast("Ajustes guardados", true);
      };
      sheet.appendChild(saveBtn);

      // Gestionar hábitos
      sheet.appendChild(el("div", "divider"));
      sheet.appendChild(el("div", "section-label", `Hábitos (${state.habits.filter(x=>!x.archived).length})`));
      const hc = el("div");
      state.habits.filter(x => !x.archived).forEach(x => {
        const row = el("div", "manage-row");
        const em = el("div", "mr-emoji", esc(x.emoji)); em.style.borderColor = hexA(x.color, .4);
        row.appendChild(em);
        row.appendChild(el("div", "mr-name", esc(x.name)));
        const edit = el("button", "mini-btn", "Editar"); edit.onclick = () => { close(); openHabitSheet(x); };
        row.appendChild(edit);
        hc.appendChild(row);
      });
      sheet.appendChild(hc);

      // Datos: exportar / importar / reset
      sheet.appendChild(el("div", "divider"));
      sheet.appendChild(el("div", "section-label", "Datos y respaldo"));
      const exp = el("button", "btn-ghost", "⬇︎ Exportar respaldo (.json)");
      exp.onclick = () => exportData();
      sheet.appendChild(exp);
      const imp = el("button", "btn-ghost", "⬆︎ Importar respaldo");
      imp.onclick = () => importData(close);
      sheet.appendChild(imp);
      const reset = el("button", "btn-ghost btn-danger", "Borrar todos los datos");
      reset.onclick = () => {
        if (confirm("¿Seguro que quieres borrar TODO? Esta acción no se puede deshacer.")) {
          localStorage.removeItem(STORE_KEY); state = seed(); save(); close(); currentTab = "today"; setActiveTab(); render(); toast("Datos reiniciados");
        }
      };
      sheet.appendChild(reset);

      const ver = el("p", "sub"); ver.style.textAlign = "center"; ver.style.marginTop = "18px"; ver.style.marginBottom = "0";
      ver.innerHTML = `Rafa Tracker · v1 · hecho con ◆`;
      sheet.appendChild(ver);
    });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = el("a"); a.href = url; a.download = `rafatracker-backup-${todayKey()}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast("Respaldo exportado", true);
  }
  function importData(close) {
    const inp = el("input"); inp.type = "file"; inp.accept = "application/json,.json";
    inp.onchange = () => {
      const file = inp.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!data || !Array.isArray(data.habits)) throw new Error("formato");
          state = data; state.settings = Object.assign({ name: "Rafa", apiKey: "", model: "claude-haiku-4-5-20251001" }, state.settings || {});
          save(); if (close) close(); currentTab = "today"; setActiveTab(); render(); toast("Respaldo importado", true);
        } catch (e) { toast("Archivo no válido"); }
      };
      reader.readAsText(file);
    };
    inp.click();
  }

  /* helpers de formulario */
  function field(label) { const f = el("div", "field"); f.appendChild(el("label", null, label)); return f; }
  function inputEl(type, value, ph) { const i = el("input"); i.type = type; i.value = value == null ? "" : value; if (ph) i.placeholder = ph; return i; }

  /* ------------------------------------------------------------ */
  /*  Navegación / init                                           */
  /* ------------------------------------------------------------ */
  function setActiveTab() {
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === currentTab));
  }
  function init() {
    document.querySelectorAll(".tab").forEach(t => {
      t.onclick = () => { currentTab = t.dataset.tab; setActiveTab(); render(); };
    });
    $("#settingsBtn").onclick = openSettings;
    $("#fab").onclick = () => { if (currentTab === "rewards") openRewardSheet(); else openHabitSheet(); };
    setActiveTab();
    render();

    // Service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
    // Re-render al volver de background (por si cambió el día)
    document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
