/* ============================================================
   core-wallet.js — persistent streak / collection storage
   Loaded FIRST on every page. Zero state loss across pages & F5.
   ============================================================ */

const CORE_WALLET_KEY = "celebrityArenaWallet_v1";

const CoreWallet = (() => {
  function freshWallet() {
    return {
      currentStreak: 0,
      maxStreak: 0,
      totalWins: 0,
      totalGames: 0,
      playerName: "You",
      discovered: [],   // celebrity names successfully guessed
      failed: []        // celebrity names that beat the player
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(CORE_WALLET_KEY);
      if (!raw) return freshWallet();
      const parsed = JSON.parse(raw);
      const w = { ...freshWallet(), ...parsed };
      if (!Array.isArray(w.discovered)) w.discovered = [];
      if (!Array.isArray(w.failed)) w.failed = [];
      return w;
    } catch (e) {
      return freshWallet();
    }
  }

  function save(wallet) {
    try {
      localStorage.setItem(CORE_WALLET_KEY, JSON.stringify(wallet));
    } catch (e) {
      // storage unavailable — fail silently, game still playable
    }
  }

  function get() { return load(); }

  function update(mutator) {
    const w = load();
    mutator(w);
    save(w);
    return w;
  }

  function registerWin(celebrityName) {
    return update(w => {
      w.totalGames += 1;
      w.totalWins += 1;
      w.currentStreak += 1;
      if (w.currentStreak > w.maxStreak) w.maxStreak = w.currentStreak;
      if (celebrityName && !w.discovered.includes(celebrityName)) {
        w.discovered.push(celebrityName);
      }
      if (celebrityName) {
        w.failed = w.failed.filter(n => n !== celebrityName);
      }
    });
  }

  function registerLoss(celebrityName) {
    return update(w => {
      w.totalGames += 1;
      w.currentStreak = 0;
      if (celebrityName && !w.discovered.includes(celebrityName) && !w.failed.includes(celebrityName)) {
        w.failed.push(celebrityName);
      }
    });
  }

  function renderStreakBadge(elId) {
    const w = load();
    const el = document.getElementById(elId);
    if (el) el.textContent = `🔥 Streak: ${w.currentStreak}  ·  Best: ${w.maxStreak}`;
    return w;
  }

  return { get, save, update, registerWin, registerLoss, renderStreakBadge };
})();

// Expose globally for all pages
window.CoreWallet = CoreWallet;
