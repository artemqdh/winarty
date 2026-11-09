/* ============================================================
   archive.js — Collector Notebook poster grid + status filter
   Depends on core-wallet.js (loaded first) and game.js
   (window.starDatabase + window.formatFollowers).
   READ-ONLY: never writes to localStorage, so F5 / re-entry
   can never reset or overwrite the guessed_stars / failed_stars
   arrays written by game.js.
   ============================================================ */

(function initArchive() {
  const grid = document.getElementById("posterGrid");
  const statsEl = document.getElementById("collectionStats");
  const filterBar = document.getElementById("archiveFilters");
  if (!grid || !window.starDatabase) return;

  /* Fetch BOTH unified arrays written by game.js */
  function readArray(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  const guessedStars = new Set(readArray("guessed_stars"));
  const failedStars = new Set(readArray("failed_stars"));

  /* Legacy fallback: merge pre-unified CoreWallet data so older
     progress still shows (display only — nothing is re-saved). */
  const wallet = CoreWallet.get();
  (wallet.discovered || []).forEach(n => guessedStars.add(n));
  (wallet.failed || []).forEach(n => failedStars.add(n));
  guessedStars.forEach(n => failedStars.delete(n)); // a win overrides a past fail

  /* Build card descriptors once — filtering only toggles visibility */
  let winCount = 0, failCount = 0, unknownCount = 0;

  const cards = window.starDatabase.map(c => {
    const isWin = guessedStars.has(c.name);
    const isFail = !isWin && failedStars.has(c.name);
    const status = isWin ? "win" : isFail ? "fail" : "unknown";

    if (isWin) winCount++;
    else if (isFail) failCount++;
    else unknownCount++;

    let cardClass, badge, emoji, footer;
    if (isWin) {
      cardClass = "poster-card poster-win";
      badge = '<span class="badge badge-win">✓ Decoded</span>';
      emoji = c.emoji;
      footer = `${c.platform} · ${c.gender} · ${window.formatFollowers(c.followers)} · ${c.era}`;
    } else if (isFail) {
      cardClass = "poster-card poster-fail";
      badge = '<span class="badge badge-fail">✗ Failed</span>';
      emoji = c.emoji;
      footer = `${c.platform} · ${c.gender} · ${window.formatFollowers(c.followers)} · ${c.era}`;
    } else {
      cardClass = "poster-card poster-unknown";
      badge = '<span class="badge badge-unknown">?</span>';
      emoji = "❔";
      footer = "Undiscovered — still in the dark";
    }

    return { status, html: `
      <div class="${cardClass}" title="${isWin || isFail ? c.name : "Undiscovered"}">
        <div class="poster-emoji">${emoji}</div>
        <div class="poster-name">${isWin || isFail ? c.name : "???"}</div>
        <div class="poster-meta">${footer}</div>
        ${badge}
      </div>` };
  });

  let currentFilter = "all";

  function render() {
    grid.innerHTML = cards
      .filter(card => currentFilter === "all" || card.status === currentFilter)
      .map(card => card.html)
      .join("");
  }

  if (filterBar) {
    filterBar.addEventListener("click", e => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      currentFilter = btn.dataset.filter || "all";
      filterBar.querySelectorAll(".filter-btn").forEach(b =>
        b.classList.toggle("active", b === btn));
      render();
    });
  }

  render();

  if (statsEl) {
    statsEl.textContent =
      `${winCount} decoded · ${failCount} failed · ${unknownCount} undiscovered — ` +
      `Streak: ${wallet.currentStreak} · Best: ${wallet.maxStreak}`;
  }
})();
