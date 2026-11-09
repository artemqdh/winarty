/* ============================================================
   leaderboard.js — loaded ONLY on leaderboard.html
   Net worth = casino_wallet + cumulative vault valuation.
   Inserts "You (Current Run)" sorted among the whales and
   renders your highest-value unboxed item as Best Pull.
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

  function getInventory() {
    try {
      const raw = localStorage.getItem(INVENTORY_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  // Cumulative valuation of every item stack in the vault
  // (sold items already converted to cash inside casino_wallet).
  function vaultValue() {
    return getInventory().reduce((sum, e) => {
      const it = ITEMS.find(i => i.id === e.itemId);
      return sum + (it ? it.value * (e.quantity || 1) : 0);
    }, 0);
  }

  // Highest individual item price ever unboxed (still in vault).
  function bestPull() {
    let best = null;
    getInventory().forEach(e => {
      const it = ITEMS.find(i => i.id === e.itemId);
      if (it && (!best || it.value > best.value)) best = it;
    });
    return best;
  }

  function init() {
    const tbody = document.querySelector(".lb-table tbody");
    if (!tbody) return;

    const old = document.getElementById("lb-you-row");
    if (old) old.remove();

    const balance = W.getBalance();
    const netWorth = balance + vaultValue();
    const best = bestPull();

    const youRow = document.createElement("tr");
    youRow.id = "lb-you-row";
    youRow.innerHTML = `
      <td><span class="rank-badge" style="background:linear-gradient(135deg,var(--purple),var(--purple-neon));color:#fff">YOU</span></td>
      <td><strong style="color:var(--emerald-neon)">You (Current Run)</strong></td>
      <td>🌍 Everywhere</td>
      <td class="worth" id="lb-you-worth">${W.fmt(netWorth)}</td>
      <td id="lb-you-pull">${best ? `${best.icon} ${best.name}` : "—"}</td>`;

    // Sort into the whales array: above the first row poorer than you,
    // or at the bottom if you're below everyone.
    const whaleRows = Array.from(tbody.querySelectorAll("tr[data-worth]"));
    const insertBefore = whaleRows.find(r => netWorth > Number(r.dataset.worth));
    if (insertBefore) {
      tbody.insertBefore(youRow, insertBefore);
    } else {
      tbody.appendChild(youRow);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    try {
      W.renderBalance(); // sync top balance panel first
      init();
      W.renderBalance(); // final sync per spec
    } catch (e) {
      console.error("leaderboard.js init error:", e);
    }
  });
})();
