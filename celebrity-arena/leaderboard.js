/* ============================================================
   leaderboard.js — sorted high-score table
   Depends on core-wallet.js (loaded first in leaderboard.html)
   ============================================================ */

const MOCK_PROFILES = [
  { name: "PixelPredator", bestStreak: 18, wins: 42, games: 50, emoji: "🦊" },
  { name: "StreamSage",     bestStreak: 12, wins: 30, games: 38, emoji: "🦉" },
  { name: "CloutChaser",    bestStreak: 9,  wins: 21, games: 33, emoji: "👑" },
  { name: "VibeChecker",    bestStreak: 6,  wins: 15, games: 27, emoji: "✨" },
  { name: "GlitchGoblin",   bestStreak: 3,  wins: 8,  games: 19, emoji: "👾" }
];

(function init() {
  const wallet = CoreWallet.get();
  CoreWallet.renderStreakBadge("streakBadge");

  // Build rows: 5 mock high-rollers + the real player row
  const rows = MOCK_PROFILES.map(p => ({ ...p, isUser: false }));
  rows.push({
    name: wallet.playerName || "You",
    bestStreak: wallet.bestStreak || 0,
    wins: wallet.totalWins || 0,
    games: wallet.totalGames || 0,
    emoji: "🫵",
    isUser: true
  });

  // Sort descending by bestStreak (tie-break: wins)
  rows.sort((a, b) => (b.bestStreak - a.bestStreak) || (b.wins - a.wins));

  const tbody = document.getElementById("lbBody");
  const medals = ["🥇", "🥈", "🥉", "4", "5", "6"];

  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    if (r.isUser) tr.className = "user-row";
    tr.innerHTML = `
      <td class="rank">${medals[i] || i + 1}</td>
      <td><span class="lb-emoji">${r.emoji}</span> ${r.name}${r.isUser ? " (You)" : ""}</td>
      <td>${r.bestStreak} 🔥</td>
      <td>${r.wins}</td>
      <td>${r.games}</td>
    `;
    tbody.appendChild(tr);
  });
})();
