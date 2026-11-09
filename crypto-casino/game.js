/* ============================================================
   game.js — loaded ONLY on index.html (Casino Floor)
   Crate opener, lucky wheel, casino_inventory pushes (deduped
   with quantities), smartlink refill button.
   Depends on: core-wallet.js (window.CasinoWallet)
   ============================================================ */

(function () {
  const W = window.CasinoWallet;
  const INVENTORY_KEY = 'casino_inventory';

  const ITEMS = [
    { id: "doge",     name: "Dogecoin",                  icon: "🐕", rarity: "common",    value: 5 },
    { id: "shib",     name: "Shiba Inu Coin",            icon: "🐩", rarity: "common",    value: 8 },
    { id: "ltc",      name: "Litecoin",                  icon: "⚡", rarity: "uncommon",  value: 15 },
    { id: "xrp",      name: "Ripple (XRP)",              icon: "🌊", rarity: "uncommon",  value: 25 },
    { id: "ada",      name: "Cardano (ADA)",             icon: "🔷", rarity: "rare",      value: 40 },
    { id: "sol",      name: "Solana (SOL)",              icon: "☀️", rarity: "rare",      value: 75 },
    { id: "eth",      name: "Ethereum (1 ETH)",          icon: "💎", rarity: "epic",      value: 250 },
    { id: "bnb",      name: "Binance Coin (BNB)",        icon: "🟡", rarity: "epic",      value: 400 },
    { id: "pepe",     name: "Rare Pepe NFT",             icon: "🐸", rarity: "epic",      value: 650 },
    { id: "btc-frac", name: "0.01 Bitcoin",              icon: "🪙", rarity: "legendary", value: 800 },
    { id: "btc",      name: "1 FULL BITCOIN",            icon: "₿", rarity: "mythic",     value: 50000 },
    { id: "yacht",    name: "Luxury Yacht 'Neon Reign'", icon: "🛥️", rarity: "legendary", value: 25000 },
    { id: "mansion",  name: "Cyberpunk Mega-Mansion",   icon: "🏙️", rarity: "mythic",     value: 75000 },
  ];

  const ITEM_WEIGHTS = {
    doge: 22, shib: 18, ltc: 14, xrp: 12, ada: 10, sol: 8,
    eth: 6, bnb: 4, pepe: 3, "btc-frac": 1.5, btc: 0.8, yacht: 0.4, mansion: 0.3
  };

  const WHEEL_SLICES = [
    ["0x", 0, 18], ["0.5x", 0.5, 14], ["1x", 1, 16], ["1.5x", 1.5, 12],
    ["2x", 2, 10], ["3x", 3, 8], ["5x", 5, 7], ["10x", 10, 6],
    ["25x", 25, 4], ["50x", 50, 3], ["100x", 100, 1.5], ["JACKPOT 500x", 500, 0.5],
  ];

  const CRATE_COST = 50;
  const WHEEL_COST = 25;

  /* ---------- casino_inventory helpers ---------- */

  function getInventory() {
    try {
      const raw = localStorage.getItem(INVENTORY_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function setInventory(arr) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(arr));
  }

  // Deduped push: repeat pulls increment .quantity on the existing entry.
  function addItemToVault(item) {
    const inventory = getInventory();
    const existing = inventory.find(e => e.itemId === item.id && !e.sold);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      inventory.push({ uid: Date.now() + Math.random(), itemId: item.id, quantity: 1, sold: false });
    }
    setInventory(inventory);
    // Refresh on-screen stats (incl. vault item count) immediately.
    W.renderBalance();
  }

  /* ---------- UI helpers ---------- */

  function toast(msg) {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 2900);
  }

  function showModal({ icon, title, sub, gain, gainLabel }) {
    const ov = document.getElementById("result-modal");
    if (!ov) return;
    document.getElementById("modal-icon").textContent = icon;
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-sub").textContent = sub || "";
    const gainEl = document.getElementById("modal-gain");
    if (gain !== undefined && gain !== null) {
      gainEl.style.display = "block";
      gainEl.textContent = (gain >= 0 ? "+" : "") + W.fmt(gain);
      if (gainLabel) document.getElementById("modal-gain-label").textContent = gainLabel;
    } else {
      gainEl.style.display = "none";
    }
    ov.classList.add("show");
  }

  function hideModal() {
    const ov = document.getElementById("result-modal");
    if (ov) ov.classList.remove("show");
  }

  function weightedPick(entries) {
    const total = entries.reduce((s, e) => s + e[1], 0);
    let r = Math.random() * total;
    for (const [key, w] of entries) {
      r -= w;
      if (r <= 0) return key;
    }
    return entries[entries.length - 1][0];
  }

  function rollItem() {
    return ITEMS.find(i => i.id === weightedPick(Object.entries(ITEM_WEIGHTS)));
  }

  function pickWeightedIndex(slices) {
    const total = slices.reduce((s, x) => s + x[2], 0);
    let r = Math.random() * total;
    for (let i = 0; i < slices.length; i++) {
      r -= slices[i][2];
      if (r <= 0) return i;
    }
    return 0;
  }

  /* ---------- bankrupt smartlink button ---------- */

  function initSmartlink() {
    const btn = document.querySelector(".smartlink-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      toast("Good luck out there — go claim that bonus!");
    });
  }

  /* ---------- crate opener ---------- */

  function initCrate() {
    const btn = document.getElementById("crate-btn");
    const crate = document.getElementById("crate-visual");
    const track = document.getElementById("ticker-track");
    const costEl = document.getElementById("crate-cost");
    if (!btn || !track) return;
    if (costEl) costEl.textContent = W.fmt(CRATE_COST);

    const ITEM_W = 240, GAP = 40;
    const STEP = ITEM_W + GAP;

    for (let i = 0; i < 24; i++) {
      track.appendChild(makeTickerTile(ITEMS[Math.floor(Math.random() * ITEMS.length)]));
    }

    window.openCrate = function () {
      if (W.getBalance() < CRATE_COST) {
        toast("Not enough funds! Try the free bonus link above.");
        return;
      }

      // Persist spend + spin instantly — F5 can never refund it.
      W.changeBalance(-CRATE_COST);
      W.bumpSpins();
      W.renderBalance();

      const winner = rollItem();
      addItemToVault(winner); // writes casino_inventory + refreshes stats

      track.innerHTML = "";
      const fillerCount = 55;
      for (let i = 0; i < fillerCount; i++) {
        track.appendChild(makeTickerTile(ITEMS[Math.floor(Math.random() * ITEMS.length)]));
      }
      track.appendChild(makeTickerTile(winner, true));

      const winIndex = fillerCount;
      const targetX = -(winIndex * STEP + ITEM_W / 2) + track.parentElement.clientWidth / 2;

      if (crate) crate.classList.add("opening");
      btn.disabled = true;

      track.style.transition = "none";
      track.style.transform = "translateX(0px)";
      void track.offsetWidth;

      const duration = 4200 + Math.random() * 800;
      track.style.transition = `transform ${duration}ms cubic-bezier(0.15, 0.9, 0.25, 1)`;
      track.style.transform = `translateX(${targetX}px)`;

      setTimeout(() => {
        if (crate) crate.classList.remove("opening");
        btn.disabled = false;
        W.renderBalance();
        showModal({
          icon: winner.icon,
          title: winner.name,
          sub: `Rarity: ${winner.rarity.toUpperCase()} — Vault value ${W.fmt(winner.value)}`,
          gainLabel: "VAULT VALUE"
        });
        toast(`Unboxed: ${winner.name}!`);
      }, duration + 150);
    };

    function makeTickerTile(item, isWinner) {
      const el = document.createElement("div");
      el.className = "ticker-item" + (isWinner ? " ticker-winner" : "");
      el.innerHTML = `${item.icon} ${item.name} <span class="rarity rarity-${item.rarity}">${item.rarity}</span>`;
      return el;
    }
  }

  /* ---------- lucky wheel ---------- */

  function initWheel() {
    const btn = document.getElementById("wheel-btn");
    const wheel = document.getElementById("wheel");
    const costEl = document.getElementById("wheel-cost");
    const resultEl = document.getElementById("wheel-result");
    if (!btn || !wheel) return;
    if (costEl) costEl.textContent = W.fmt(WHEEL_COST);

    const N = WHEEL_SLICES.length;
    const degPer = 360 / N;
    WHEEL_SLICES.forEach((slice, i) => {
      const label = document.createElement("div");
      label.className = "wheel-label";
      label.textContent = slice[0];
      const angle = i * degPer;
      label.style.left = "50%";
      label.style.top = "50%";
      label.style.transformOrigin = "0 0";
      label.style.transform = `rotate(${angle}deg) translateY(-120px)`;
      wheel.appendChild(label);
    });

    let spinning = false;
    let rotation = 0;

    window.spinWheel = function () {
      if (spinning) return;
      if (W.getBalance() < WHEEL_COST) {
        toast("Not enough funds! Try the free bonus link above.");
        return;
      }

      const sliceIndex = pickWeightedIndex(WHEEL_SLICES);
      const slice = WHEEL_SLICES[sliceIndex];

      W.changeBalance(-WHEEL_COST);
      W.bumpSpins();
      W.renderBalance();

      spinning = true;
      btn.disabled = true;
      if (resultEl) resultEl.textContent = "Spinning...";

      const targetAngle = 360 - (sliceIndex * degPer + degPer / 2);
      const extraSpins = 5 + Math.floor(Math.random() * 3);
      const finalRot = rotation + extraSpins * 360 + ((targetAngle - (rotation % 360)) + 360) % 360;
      rotation = finalRot;

      wheel.style.transition = "transform 4.5s cubic-bezier(0.12, 0.8, 0.08, 1)";
      wheel.style.transform = `rotate(${finalRot}deg)`;

      setTimeout(() => {
        spinning = false;
        btn.disabled = false;

        const payout = Math.round(WHEEL_COST * slice[1]);
        const jackpot = slice[1] >= 50;

        if (payout > 0) W.changeBalance(payout);
        else W.renderBalance();

        if (resultEl) {
          resultEl.textContent = slice[1] === 0
            ? "Better luck next spin!"
            : `You won ${slice[0]} → +${W.fmt(payout)}!`;
        }

        showModal({
          icon: jackpot ? "🎰" : slice[1] === 0 ? "💨" : "✨",
          title: slice[1] === 0 ? "No Win" : `Multiplier ${slice[0]}!`,
          sub: slice[1] === 0 ? "The wheel shows mercy to no one." : `Bet ${W.fmt(WHEEL_COST)} → payout ${W.fmt(payout)}`,
          gain: payout > 0 ? payout : null,
          gainLabel: "CASH WIN"
        });
      }, 4600);
    };
  }

  /* ---------- modal wiring ---------- */

  function initModal() {
    const closeBtn = document.getElementById("modal-close");
    if (closeBtn) closeBtn.addEventListener("click", hideModal);
    const ov = document.getElementById("result-modal");
    if (ov) ov.addEventListener("click", e => { if (e.target === ov) hideModal(); });
  }

  /* ---------- boot ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    try {
      initSmartlink();
      initCrate();
      initWheel();
      initModal();
      W.renderBalance();
    } catch (e) {
      console.error("game.js init error:", e);
    }
  });
})();
