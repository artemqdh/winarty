/* ============================================================
   Brainrot Grid — Leaderboard page logic (leaderboard.html only)
   Reads the player's real all-time best streak from localStorage
   and merges it into a sorted mock leaderboard.
   ============================================================ */

(function () {
  "use strict";

  /* ---- storage keys (must match game page writer) ---- */
  var LS_STREAK = "high_score_streak";
  var LS_GAMES = "brainrot_grid_games_played";
  var LS_ROUNDS = "brainrot_grid_rounds_played";

  /* ---- DOM refs — all exist on leaderboard.html ---- */
  var tbody = document.getElementById("lb-body");
  var youNote = document.getElementById("you-row");
  var youStreakEl = document.getElementById("you-streak");
  var gamesEl = document.getElementById("games-played");
  var roundsEl = document.getElementById("rounds-played");

  if (!tbody) return; // not the leaderboard page — do nothing

  /* ---- pull real player stats ---- */
  var best = parseInt(localStorage.getItem(LS_STREAK) || "0", 10) || 0;

  if (youStreakEl) youStreakEl.textContent = best;
  if (gamesEl) gamesEl.textContent = localStorage.getItem(LS_GAMES) || "0";
  if (roundsEl) roundsEl.textContent = localStorage.getItem(LS_ROUNDS) || "0";

  /* ---- 5 funny mock Gen-Z players with fixed high streaks ---- */
  var mockPlayers = [
    { name: "GyattGoblin",    avatar: "👹", streak: 31, you: false },
    { name: "SigmaMewing99",  avatar: "🧠", streak: 24, you: false },
    { name: "SkibidiFan",     avatar: "🚽", streak: 18, you: false },
    { name: "KaiCenatTwin",   avatar: "👑", streak: 12, you: false },
    { name: "OhioFinalBoss",  avatar: "💅", streak: 7,  you: false }
  ];

  /* ---- inject the real player row, then sort desc by streak ---- */
  var board = mockPlayers.concat([
    { name: "YOU (Browser Hero)", avatar: "🧙", streak: best, you: true }
  ]);

  board.sort(function (a, b) { return b.streak - a.streak; });

  board.forEach(function (p, idx) {
    var tr = document.createElement("tr");
    if (p.you) tr.className = "you";
    tr.innerHTML =
      '<td class="rank">#' + (idx + 1) + "</td>" +
      '<td><span class="player"><span class="avatar">' + p.avatar + "</span>" + p.name + "</span></td>" +
      '<td class="streak">' + p.streak + " 🔥</td>";
    tbody.appendChild(tr);
  });

  if (youNote) youNote.style.display = "";
})();
