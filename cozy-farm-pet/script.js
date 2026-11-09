/* ===== Cozy Farm Pet — unified game logic ===== */
(function () {
  'use strict';

  /* ---------- Storage keys (globally synchronized) ---------- */
  const STATE_KEY      = 'cozyFarmPet_v1';   // active pet + per-pet archive + items
  const COINS_KEY      = 'farm_coins';       // shared coin balance across pages
  const COLLECTION_KEY = 'pet_collection';   // array of unlocked species ids
  const TICK_MS = 3000;

  /* ---------- Species catalog (5 pets total) ---------- */
  const SPECIES = {
    chick: { name: 'Standard Farm Chick',           rarity: 'Common',     icon: '🐤' },
    cat:   { name: 'Fluffy Barn Cat',               rarity: 'Common',     icon: '🐱' },
    pup:   { name: 'Cottage Pup',                   rarity: 'Common',     icon: '🐶' },
    fox:   { name: 'Mystic Forest Fox',             rarity: 'Rare',       icon: '🦊' },
    sheep: { name: 'Glow-in-the-Dark Cosmic Sheep', rarity: 'Ultra-Rare', icon: '🐑' },
  };
  const COMMON_IDS = ['chick', 'cat', 'pup'];

  // Emoji avatar per species + evolution stage (baby -> elder)
  const STAGE_ICONS = {
    chick: ['🐣', '🐤', '🐔', '🐔'],
    cat:   ['🐱', '🐱', '🐈', '🐈'],
    pup:   ['🐶', '🐶', '🐕', '🐕'],
    fox:   ['🦊', '🦊', '🦊', '🦊'],
    sheep: ['🐑', '🐑', '🐑', '🐑'],
  };

  /* Egg odds: 70% common / 25% fox (rare) / 5% sheep (ultra-rare) */
  function rollEgg() {
    const r = Math.random();
    if (r < 0.05) return 'sheep';
    if (r < 0.30) return 'fox';
    return COMMON_IDS[Math.floor(Math.random() * COMMON_IDS.length)];
  }

  /* ---------- Pet state ---------- */
  const STAGES = [
    { name: 'Baby Chick',    minAge: 0 },
    { name: 'Juvenile Hen',  minAge: 3 },
    { name: 'Proud Rooster', minAge: 7 },
    { name: 'Elder Keeper',  minAge: 14 },
  ];
  const DEFAULT_STATS = { hunger: 80, affection: 80, energy: 80, clean: 80 };

  function freshStats() { return Object.assign({}, DEFAULT_STATS); }

  function defaultState() {
    return {
      species: null,          // active companion species id
      name: 'Sprout',
      bornAt: Date.now(),
      stats: freshStats(),
      sleeping: false,
      stage: 0,
      pets: {},               // archived companions: speciesId -> {name,bornAt,stats,stage}
      items: {},              // inventory: itemId -> true
      equippedHat: null,
      retired: false,
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return defaultState();
      const s = JSON.parse(raw);
      const d = defaultState();
      const merged = Object.assign(d, s, { stats: Object.assign({}, d.stats, s.stats || {}) });
      merged.pets = s.pets && typeof s.pets === 'object' ? s.pets : {};
      merged.items = s.items && typeof s.items === 'object' ? s.items : {};
      return merged;
    } catch (e) { return defaultState(); }
  }
  function save() { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }

  const state = load();

  // One-time migration: old saves kept coins inside the state blob
  if (localStorage.getItem(COINS_KEY) === null && typeof state.coins === 'number') {
    localStorage.setItem(COINS_KEY, String(state.coins));
    delete state.coins;
    save();
  }

  /* ---------- Coins: single source of truth = 'farm_coins' ---------- */
  function getCoins() {
    const v = parseFloat(localStorage.getItem(COINS_KEY));
    return isNaN(v) ? 50 : v; // seed new players with 50
  }
  function setCoins(v) { localStorage.setItem(COINS_KEY, String(Math.max(0, v))); }
  function addCoins(v) { setCoins(getCoins() + v); }
  function spendCoins(v) {
    if (getCoins() < v) return false;
    setCoins(getCoins() - v);
    return true;
  }

  /* ---------- Collection ---------- */
  function getCollection() {
    try { return JSON.parse(localStorage.getItem(COLLECTION_KEY)) || []; }
    catch (e) { return []; }
  }
  function hasSpecies(id) { return getCollection().indexOf(id) !== -1; }
  function unlockSpecies(id) {
    const c = getCollection();
    if (c.indexOf(id) === -1) {
      c.push(id);
      localStorage.setItem(COLLECTION_KEY, JSON.stringify(c));
    }
  }

  /* ---------- Page detection ---------- */
  const page = $('shopGrid') ? 'shop.html'
    : $('adoptBtn') ? 'graveyard.html'
    : 'index.html';

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function clamp(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  function ageDays() { return Math.floor((Date.now() - state.bornAt) / 86400000); }

  function stageFor(age) {
    let idx = 0;
    for (let i = 0; i < STAGES.length; i++) if (age >= STAGES[i].minAge) idx = i;
    return idx;
  }

  function petIcon() {
    const icons = STAGE_ICONS[state.species] || STAGE_ICONS.chick;
    return icons[state.stage] || icons[0];
  }

  /* ---------- Per-pet archive (swap mechanic) ---------- */
  function archiveActivePet() {
    if (!state.species) return;
    state.pets[state.species] = {
      name: state.name,
      bornAt: state.bornAt,
      stats: Object.assign({}, state.stats),
      stage: state.stage,
    };
  }

  function activatePet(id) {
    archiveActivePet();
    const saved = state.pets[id];
    if (saved) {
      state.name = saved.name;
      state.bornAt = saved.bornAt;
      state.stats = Object.assign({}, DEFAULT_STATS, saved.stats);
      state.stage = saved.stage;
    } else {
      // First time playing with this companion: fresh stats
      state.pets[id] = {
        name: SPECIES[id].name,
        bornAt: Date.now(),
        stats: freshStats(),
        stage: 0,
      };
      state.name = SPECIES[id].name;
      state.bornAt = Date.now();
      state.stats = freshStats();
      state.stage = 0;
    }
    state.species = id;
    state.sleeping = false;
    state.retired = false;
    save();
  }

  /* ---------- Pet action animation ---------- */
  function petAnimate(kind) {
    const stage = $('petStage');
    if (!stage) return;
    stage.classList.remove('pet-hop', 'pet-wiggle', 'pet-spin');
    void stage.offsetWidth;
    stage.classList.add(kind === 'sleep' ? 'pet-wiggle' : kind === 'wash' ? 'pet-spin' : 'pet-hop');
    setTimeout(() => stage.classList.remove('pet-hop', 'pet-wiggle', 'pet-spin'), 600);
  }

  function flash(msg) {
    const el = $('statusMsg');
    if (!el) return;
    el.textContent = msg;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.textContent = ''; }, 2200);
  }

  /* ---------- Background stat ticking ---------- */
  let prevStats = null;   // pre-decay snapshot from the previous tick
  let warmedUp = false;   // death checks are skipped on the first tick after load/refresh

  function checkPetStatus() {
    if (!prevStats) return false;
    const s = state.stats, p = prevStats;
    const died =
      (p.hunger > 0 && s.hunger <= 0) ||
      (p.affection > 0 && s.affection <= 0) ||
      (p.energy > 0 && s.energy <= 0) ||
      (p.clean > 0 && s.clean <= 0);
    return died;
  }

  function tick() {
    if (state.retired || !state.species) { prevStats = state.stats ? Object.assign({}, state.stats) : null; return; }
    const s = state.stats;
    prevStats = Object.assign({}, s); // snapshot BEFORE decay

    if (state.sleeping) {
      s.energy    = clamp(s.energy    + 2);
      s.hunger    = clamp(s.hunger    - 0.6);
      s.clean     = clamp(s.clean     - 0.2);
    } else {
      s.hunger    = clamp(s.hunger    - 0.5);
      s.affection = clamp(s.affection - 0.35);
      s.energy    = clamp(s.energy    - 0.3);
      s.clean     = clamp(s.clean     - 0.4);
    }

    // Passive coins while affection stays high (~1 coin / min)
    if (s.affection >= 70) addCoins(0.05);

    state.stage = stageFor(ageDays());
    save();

    // Neglect: only redirect when a stat actually crosses to 0 this tick,
    // and never on the first tick after a page load/refresh
    if (warmedUp && checkPetStatus()) {
      state.retired = true;
      save();
      if (page === 'index.html') window.location.href = 'graveyard.html';
      return;
    }

    warmedUp = true;
    render();
  }

  /* ---------- Rendering ---------- */
  function setBar(id, val) {
    const el = $(id);
    if (el) el.style.width = val + '%';
  }

  function renderStats() {
    const s = state.stats;
    setBar('barHunger', s.hunger);       const nh = $('numHunger');   if (nh) nh.textContent = s.hunger;
    setBar('barAffection', s.affection); const na = $('numAffection'); if (na) na.textContent = s.affection;
    setBar('barEnergy', s.energy);       const ne = $('numEnergy');   if (ne) ne.textContent = s.energy;
    setBar('barClean', s.clean);         const nc = $('numClean');    if (nc) nc.textContent = s.clean;
  }

  function renderCoins() {
    const el = $('coins');
    if (el) el.textContent = Math.floor(getCoins()); // always read live from localStorage
  }

  function renderPet() {
    const sprite = $('petSprite');
    if (sprite) {
      const low = state.stats.hunger <= 25 || state.stats.affection <= 25 || state.stats.clean <= 25;
      sprite.className = 'pixel-pet emoji-pet species-' + (state.species || 'chick') +
        ' evo-' + state.stage +
        (state.sleeping ? ' asleep' : '') + (low ? ' sick' : '');
      sprite.textContent = petIcon();
    }

    const age = ageDays();
    const sp = SPECIES[state.species] || SPECIES.chick;
    const nameEl = $('petName');
    if (nameEl) nameEl.textContent = state.name + ' (' + sp.icon + ' ' + sp.name + ')';
    const ageEl = $('petAge');
    if (ageEl) ageEl.textContent = 'Age: ' + age + ' day' + (age === 1 ? '' : 's') + ' · ' + STAGES[state.stage].name;

    const bubble = $('thoughtBubble');
    if (bubble) {
      const msgs = state.sleeping ? ['zZz…']
        : state.stats.hunger < 30 ? ['*growl*', 'FOOD?']
        : state.stats.affection < 30 ? ['…', 'miss you']
        : state.stats.clean < 30 ? ['*itch*', 'mud!']
        : ['♪', 'cozy!', '♥'];
      bubble.textContent = msgs[Math.floor(Math.random() * msgs.length)];
      bubble.classList.toggle('show', Math.random() < 0.7);
    }

    const hat = $('hatSlot');
    if (hat) {
      if (state.equippedHat && state.items[state.equippedHat]) {
        hat.textContent = HAT_ICONS[state.equippedHat] || '🎩';
        hat.classList.remove('hidden');
      } else {
        hat.classList.add('hidden');
      }
    }

    // Swap button only appears while the pet is asleep
    const swapBtn = $('btnSwap');
    if (swapBtn) swapBtn.classList.toggle('hidden', !state.sleeping);
  }

  function render() {
    renderCoins();
    if (page === 'index.html') { renderStats(); renderPet(); }
  }

  /* ---------- Adoption overlay ---------- */
  let pendingSpecies = 'chick';

  function setupAdoption() {
    const overlay = $('adoptOverlay');
    if (!overlay) return;

    const picker = $('speciesPicker');
    picker.innerHTML = '';
    COMMON_IDS.forEach((id, i) => {
      const sp = SPECIES[id];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'species-opt' + (i === 0 ? ' sel' : '');
      b.innerHTML = '<span>' + sp.icon + '</span>' + sp.name;
      b.addEventListener('click', () => {
        pendingSpecies = id;
        Array.prototype.forEach.call(picker.children, (c) => c.classList.remove('sel'));
        b.classList.add('sel');
      });
      picker.appendChild(b);
    });

    $('adoptConfirm').addEventListener('click', () => {
      const typed = ($('petNameInput').value || '').trim();
      state.species = pendingSpecies;
      state.name = typed || SPECIES[pendingSpecies].name;
      state.stats = freshStats();
      state.bornAt = Date.now();
      state.sleeping = false;
      state.retired = false;
      state.stage = 0;
      state.pets[pendingSpecies] = {
        name: state.name, bornAt: state.bornAt,
        stats: Object.assign({}, state.stats), stage: 0,
      };
      unlockSpecies(pendingSpecies);
      save();
      overlay.classList.add('hidden');
      render();
      flash('Welcome home, ' + state.name + '! 🌱');
    });
  }

  function showAdoptionIfNeeded() {
    // Only show when NO pet was ever chosen — existing saves skip this entirely
    if (state.species) return;
    const overlay = $('adoptOverlay');
    if (overlay) overlay.classList.remove('hidden');
  }

  /* ---------- Index page: action buttons ---------- */
  function bindActions() {
    const s = () => state.stats;

    $('btnFeed') && $('btnFeed').addEventListener('click', () => {
      if (state.sleeping) return flash('Shh… ' + state.name + ' is sleeping.');
      s().hunger = clamp(s().hunger + 30);
      s().affection = clamp(s().affection + 5);
      petAnimate('feed');
      flash('Yum! ' + state.name + ' loved the snack.');
      save(); render();
    });

    $('btnPet') && $('btnPet').addEventListener('click', () => {
      if (state.sleeping) return flash('Shh… ' + state.name + ' is sleeping.');
      s().affection = clamp(s().affection + 20);
      s().energy = clamp(s().energy - 5);
      petAnimate('pet');
      flash('So cozy… ' + state.name + ' purrs happily.');
      save(); render();
    });

    $('btnSleep') && $('btnSleep').addEventListener('click', () => {
      state.sleeping = !state.sleeping;
      if (state.sleeping) s().energy = clamp(s().energy + 25);
      petAnimate('sleep');
      flash(state.sleeping ? state.name + ' is fast asleep. 💤' : state.name + ' wakes up refreshed!');
      save(); render();
    });

    $('btnWash') && $('btnWash').addEventListener('click', () => {
      if (state.sleeping) return flash('Shh… ' + state.name + ' is sleeping.');
      s().clean = clamp(s().clean + 35);
      s().affection = clamp(s().affection + 4);
      petAnimate('wash');
      flash('Sparkly clean! 🫧');
      save(); render();
    });
  }

  /* ---------- Swap Companion panel ---------- */
  function renderSwapList() {
    const list = $('swapList');
    if (!list) return;
    const unlocked = getCollection();
    list.innerHTML = unlocked.length ? '' :
      '<p class="font-body text-sm text-[#96805f]">No companions yet — adopt one first!</p>';

    unlocked.forEach((id) => {
      const sp = SPECIES[id];
      if (!sp) return;
      const isCurrent = id === state.species;
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'nb-row swap-row' + (isCurrent ? ' current' : '');
      row.innerHTML =
        '<span class="nb-icon">' + sp.icon + '</span>' +
        '<div><p class="nb-name">' + sp.name + '</p>' +
        '<p class="nb-rar">' + sp.rarity + (isCurrent ? ' · active' : '') + '</p></div>' +
        '<span class="nb-play">' + (isCurrent ? '✓' : 'Play') + '</span>';
      if (!isCurrent) row.addEventListener('click', () => switchCompanion(id));
      list.appendChild(row);
    });
  }

  function setupSwap() {
    const btn = $('btnSwap'), panel = $('swapPanel'), close = $('swapClose');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => { renderSwapList(); panel.classList.add('open'); });
    if (close) close.addEventListener('click', () => panel.classList.remove('open'));
  }

  function switchCompanion(id) {
    if (id === state.species) return;
    activatePet(id);
    const panel = $('swapPanel');
    if (panel) panel.classList.remove('open');
    render();
    flash('🐾 ' + state.name + ' joins you on the farm!');
  }

  /* ---------- Seed Shop ---------- */
  const ITEMS = [
    { id: 'seed_corn',    name: 'Premium Corn Seed',     icon: '🌽', price: 40,  type: 'seed',  effect: { hunger: 25 } },
    { id: 'treat_straw',  name: 'Cozy Strawberry Treat', icon: '🍓', price: 80,  type: 'treat', effect: { hunger: 20, affection: 15 } },
    { id: 'treat_honey',  name: 'Honey Oat Cake',        icon: '🍯', price: 150, type: 'treat', effect: { hunger: 25, affection: 30, energy: 15 } },
    { id: 'hat_straw',    name: "Farmer's Hat",          icon: '👒', price: 120, type: 'hat' },
    { id: 'hat_flower',   name: 'Flower Crown',          icon: '🌸', price: 250, type: 'hat' },
    { id: 'hat_crown',    name: 'Tiny Crown',            icon: '👑', price: 600, type: 'hat' },
    { id: 'deco_fence',   name: 'Picket Fence',          icon: '🪵', price: 200, type: 'deco' },
    { id: 'deco_lantern', name: 'Garden Lantern',        icon: '🏮', price: 350, type: 'deco' },
    { id: 'deco_wheel',   name: 'Windmill Charm',        icon: '🌬️', price: 500, type: 'deco' },
    { id: 'deco_pond',    name: 'Koi Pond',              icon: '🎏', price: 800, type: 'deco' },
    { id: 'egg_lucky',    name: 'Mystery Lucky Egg',     icon: '🥚', price: 100, type: 'egg' },
  ];

  const HAT_ICONS = {};
  ITEMS.forEach((it) => { if (it.type === 'hat') HAT_ICONS[it.id] = it.icon; });

  function typeLabel(t) {
    return {
      seed:  'Plantable seed — boosts Hunger when used',
      treat: 'Instant stat boost for your pet',
      hat:   'Wearable hat — auto-equips on your pet',
      deco:  'Farm decoration collectible',
      egg:   'Hatch a random companion! 70% Common · 25% Rare · 5% Ultra-Rare',
    }[t] || '';
  }

  function renderShop() {
    const grid = $('shopGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const coins = getCoins(); // live read — always in sync with index.html

    ITEMS.forEach((it) => {
      const isEgg = it.type === 'egg';
      const owned = !isEgg && !!state.items[it.id];
      const afford = coins >= it.price;

      const card = document.createElement('div');
      card.className = 'shop-card' + (owned ? ' owned' : '');

      const btn = document.createElement('button');
      btn.className = 'sign-btn buy-btn';
      btn.type = 'button';
      if (owned) {
        btn.disabled = true; btn.style.opacity = '.5'; btn.style.cursor = 'not-allowed';
        btn.textContent = '✓ In Inventory';
      } else if (!afford) {
        btn.disabled = true; btn.style.opacity = '.5'; btn.style.cursor = 'not-allowed';
        btn.textContent = '🪙 ' + it.price + ' (need more)';
      } else {
        btn.textContent = (isEgg ? '🥚 Hatch — ' : '🪙 Buy — ') + it.price;
        btn.addEventListener('click', () => buy(it));
      }

      const name = document.createElement('h3');
      name.className = 'font-body font-extrabold mt-2 text-[#6b5232]';
      name.textContent = it.name;

      const icon = document.createElement('div');
      icon.className = 'item-icon';
      icon.textContent = it.icon;

      const desc = document.createElement('p');
      desc.className = 'font-body text-xs text-[#96805f] mt-1';
      desc.textContent = typeLabel(it.type);

      card.append(icon, name, desc, btn);
      grid.appendChild(card);
    });

    renderOwned();
  }

  function buy(it) {
    // Eggs are consumables: no inventory slot, instant hatch
    if (it.type === 'egg') {
      if (!spendCoins(it.price)) return flash('Not enough Farm Coins!');
      hatchEgg();
      renderShop();
      render();
      return;
    }

    if (state.items[it.id] || !spendCoins(it.price)) {
      return flash('Not enough Farm Coins!');
    }
    state.items[it.id] = true; // saved to Inventory

    if (it.effect) {
      const s = state.stats;
      Object.keys(it.effect).forEach((k) => { s[k] = clamp(s[k] + it.effect[k]); });
    }
    if (it.type === 'hat') state.equippedHat = it.id;

    save();
    renderShop();
    render();
    flash('🎉 ' + it.name + ' added to your Inventory!');
  }

  function renderOwned() {
    const list = $('ownedList');
    if (!list) return;
    const owned = ITEMS.filter((i) => i.type !== 'egg' && state.items[i.id]);
    list.innerHTML = owned.length
      ? owned.map((i) => '<span class="coin-pill" style="font-size:.75rem;padding:5px 12px">' + i.icon + ' ' + i.name + '</span>').join('')
      : '<p class="font-body text-sm text-[#96805f]">Nothing yet — go buy something cozy!</p>';
  }

  /* ---------- Egg hatching ---------- */
  function hatchEgg() {
    const id = rollEgg();
    const isNew = !hasSpecies(id);
    unlockSpecies(id);
    activatePet(id); // hatched companion becomes active, current pet is archived
    save();

    const modal = $('hatchModal');
    if (modal) {
      $('hatchResult').textContent = SPECIES[id].icon;
      $('hatchName').textContent = SPECIES[id].name.toUpperCase();
      const rar = $('hatchRarity');
      rar.textContent = '★ ' + SPECIES[id].rarity + ' ★';
      rar.className = 'font-body text-sm font-extrabold mt-2 ' +
        (SPECIES[id].rarity === 'Ultra-Rare' ? 'text-[#b0763f]' : SPECIES[id].rarity === 'Rare' ? 'text-[#7a5fb0]' : 'text-[#4a7a3a]');
      $('hatchNew').textContent = isNew ? '🎉 NEW species added to your Notebook!' : 'Already in your Notebook — welcome back!';
      modal.classList.remove('hidden');
      $('hatchClose').onclick = () => modal.classList.add('hidden');
    } else {
      flash('Hatched: ' + SPECIES[id].name + ' (' + SPECIES[id].rarity + ')!');
    }
    renderNotebook();
    renderSwapListSafe();
  }

  function renderSwapListSafe() { if ($('swapList')) renderSwapList(); }

  /* ---------- Collector Notebook ---------- */
  function renderNotebook() {
    const list = $('notebookList');
    if (!list) return;
    list.innerHTML = Object.keys(SPECIES).map((id) => {
      const sp = SPECIES[id];
      const got = hasSpecies(id);
      const rarClass = sp.rarity === 'Ultra-Rare' ? 'ultra' : sp.rarity === 'Rare' ? 'rare' : '';
      return '<div class="nb-row' + (got ? '' : ' locked') + '">' +
        '<span class="nb-icon">' + (got ? sp.icon : '❓') + '</span>' +
        '<div><p class="nb-name">' + (got ? sp.name : '???') + '</p>' +
        '<p class="nb-rar ' + rarClass + '">' + sp.rarity + '</p></div>' +
        '<span class="nb-status">' + (got ? '✅' : '🔒') + '</span></div>';
    }).join('');
  }

  function setupNotebook() {
    const btn = $('notebookBtn'), panel = $('notebookPanel'), close = $('notebookClose');
    if (!btn || !panel) return;
    renderNotebook();
    btn.addEventListener('click', () => panel.classList.toggle('open'));
    if (close) close.addEventListener('click', () => panel.classList.remove('open'));
  }

  /* ---------- Graveyard / Memorial ---------- */
  function renderMemorial() {
    const nameEl = $('memorialName');
    if (!nameEl) return;
    const age = ageDays();
    const sp = SPECIES[state.species] || SPECIES.chick;
    nameEl.textContent = state.name + ' ' + petIconSafe();

    const ms = $('memorialStats');
    if (ms) ms.textContent = 'A ' + sp.name + ' (' + STAGES[state.stage].name + ') who lived ' +
      age + ' day' + (age === 1 ? '' : 's') + ' on your farm and retired peacefully in the greenhouse.';

    const pn = $('plaqueName');
    if (pn) pn.textContent = state.name;
    const pa = $('plaqueAge');
    if (pa) pa.textContent = 'Lived ' + age + ' day' + (age === 1 ? '' : 's') + ' · Final stage: ' + STAGES[state.stage].name;
  }

  function petIconSafe() {
    const icons = STAGE_ICONS[state.species] || STAGE_ICONS.chick;
    return icons[state.stage] || icons[0];
  }

  function adoptNew() {
    state.species = null; // force the adoption overlay on next visit
    state.stats = freshStats();
    state.bornAt = Date.now();
    state.sleeping = false;
    state.stage = 0;
    state.retired = false;
    save();
  }

  /* ---------- Boot ---------- */
  if (/[?&]adopt=1/.test(location.search)) adoptNew();

  render();
  setupAdoption();
  showAdoptionIfNeeded();   // skipped entirely when a pet already exists in LocalStorage
  setupNotebook();
  setupSwap();

  if (page === 'index.html') {
    bindActions();
    setInterval(tick, TICK_MS);
  } else if (page === 'shop.html') {
    renderShop();
    setInterval(tick, TICK_MS);
  } else if (page === 'graveyard.html') {
    renderMemorial();
  }
})();
