/* ============================================================
   core-wallet.js — loaded on ALL pages
   ONLY handles: casino_wallet balance + casino_spins counter
   in LocalStorage, and rendering them into the page.
   ============================================================ */

const WALLET_KEY = 'casino_wallet';
const SPINS_KEY = 'casino_spins';

window.CasinoWallet = (function () {
    const START_BALANCE = 1000;

  function getBalance() {
    const raw = localStorage.getItem(WALLET_KEY);
    if (raw === null) {
      localStorage.setItem(WALLET_KEY, String(START_BALANCE));
      return START_BALANCE;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : START_BALANCE;
  }

  function setBalance(v) {
    localStorage.setItem(WALLET_KEY, String(Math.max(0, Math.round(v))));
  }

  function changeBalance(delta) {
    setBalance(getBalance() + delta);
    renderBalance();
  }

  function getSpins() {
    const raw = localStorage.getItem(SPINS_KEY);
    const n = raw === null ? 0 : Number(raw);
    return Number.isFinite(n) ? n : 0;
  }

  function bumpSpins() {
    const n = getSpins() + 1;
    localStorage.setItem(SPINS_KEY, String(n));
    return n;
  }

  function fmt(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function renderBalance() {
    const balance = getBalance(); // always fresh from LocalStorage
    const el = document.getElementById("balance");
    if (el) {
      el.textContent = fmt(balance);
      el.classList.remove("balance-flash");
      void el.offsetWidth;
      el.classList.add("balance-flash");
    }
    const stat = document.getElementById("stat-balance");
    if (stat) stat.textContent = fmt(balance);
    const spins = getSpins();
    ["stat-opens", "stat-spins"].forEach(id => {
      const el2 = document.getElementById(id);
      if (el2) el2.textContent = spins;
    });
    const invCount = document.getElementById("stat-items");
    if (invCount) invCount.textContent = getInventoryCount();
  }

  function getInventoryCount() {
    try {
      const raw = localStorage.getItem("casino_inventory");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.length : 0;
    } catch (e) { return 0; }
  }

  document.addEventListener("DOMContentLoaded", () => {
    try {
      getBalance(); // ensures casino_wallet exists (defaults to 1000 once)
      if (localStorage.getItem(SPINS_KEY) === null) {
        localStorage.setItem(SPINS_KEY, "0");
      }
      renderBalance();
    } catch (e) {
      console.error("core-wallet init error:", e);
    }
  });

  return { getBalance, setBalance, changeBalance, getSpins, bumpSpins, fmt, renderBalance };
})();
