/* ============================================================
   vault.js — loaded ONLY on inventory.html (The Vault)
   Reads 'casino_inventory' from LocalStorage, renders every
   item with its .quantity, and sells loot back into
   'casino_wallet'. Depends on: core-wallet.js.
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

  function sellOne(uid) {
    const inventory = getInventory();
    const entry = inventory.find(e => e.uid === uid && !e.sold);
    if (!entry) return null;
    const item = ITEMS.find(i => i.id === entry.itemId);
    if (!item) return null;
    entry.quantity = (entry.quantity || 1) - 1;
    if (entry.quantity <= 0) {
      inventory.splice(inventory.indexOf(entry), 1);
    }
    setInventory(inventory);
    return item;
  }

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

  function render() {
    const grid = document.getElementById("inventory-grid");
    if (!grid) return;
    grid.innerHTML = "";

    // Pull straight from the persisted casino_inventory array.
    const active = getInventory().filter(e => !e.sold);
    const countEl = document.getElementById("inv-count");
    if (countEl) {
      countEl.textContent = `${active.length} item type${active.length === 1 ? "" : "s"} in vault`;
    }

    if (active.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="big">🏦</div>
          <h3>Your vault is empty!</h3>
          <p>Spin the wheel or open crates to collect luxury loot.</p>
          <a href="index.html" class="btn" style="margin-top:1rem">🎰 Open Crates</a>
        </div>`;
      return;
    }

    active.slice().reverse().forEach(entry => {
      const item = ITEMS.find(i => i.id === entry.itemId);
      if (!item) return;
      const qty = entry.quantity || 1;
      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <div class="icon">${item.icon}</div>
        <div class="name">${item.name}${qty > 1 ? ` <span style="color:var(--gold)">×${qty}</span>` : ""}</div>
        <div class="rarity-tag rarity-${item.rarity}">${item.rarity}</div>
        <div class="value">${W.fmt(item.value)}${qty > 1 ? ` ea · ${W.fmt(item.value * qty)} total` : ""}</div>
        <button class="sell-btn" data-uid="${entry.uid}">Sell 1 for ${W.fmt(item.value)}</button>`;
      grid.appendChild(card);
    });

    grid.querySelectorAll(".sell-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const sold = sellOne(Number(btn.dataset.uid));
        if (!sold) return;
        W.changeBalance(sold.value); // cash lands in casino_wallet instantly
        render();
        toast(`Sold ${sold.name} for ${W.fmt(sold.value)}!`);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    try {
      W.renderBalance(); // sync the top balance panel first
      render();
      W.renderBalance(); // and again after grid render, per spec
    } catch (e) {
      console.error("vault.js init error:", e);
    }
  });
})();
