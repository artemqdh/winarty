/* ============================================================
   game.js — Celebrity Arena guessing engine
   Depends on core-wallet.js (loaded first).
   Exposes window.starDatabase / window.formatFollowers so
   archive.js can reuse the deck; boot() no-ops off the game page.
   ============================================================ */

/* Expanded data deck — celebrity & streamer milestones */
const starDatabase = [
  { name: "MrBeast", platform: "YouTube", gender: "Male", followers: 525000000, era: "2020s", emoji: "🍫" },
  { name: "Taylor Swift", platform: "Music", gender: "Female", followers: 272000000, era: "2010s", emoji: "🎤" },
  { name: "Kai Cenat", platform: "Twitch", gender: "Male", followers: 12000000, era: "2020s", emoji: "👑" },
  { name: "Wednesday Addams", platform: "Movies", gender: "Female", followers: 50000000, era: "2020s", emoji: "🖤" },
  { name: "IShowSpeed", platform: "YouTube", gender: "Male", followers: 33000000, era: "2020s", emoji: "⚽" },
  { name: "Ariana Grande", platform: "Music", gender: "Female", followers: 372000000, era: "2010s", emoji: "💅" },
  { name: "xQc", platform: "Kick", gender: "Male", followers: 11000000, era: "2020s", emoji: "🦍" },
  { name: "Billie Eilish", platform: "Music", gender: "Female", followers: 110000000, era: "2020s", emoji: "💚" },
  { name: "Pokimane", platform: "Twitch", gender: "Female", followers: 9000000, era: "2010s", emoji: "🐱" },
  { name: "Drake", platform: "Music", gender: "Male", followers: 144000000, era: "2010s", emoji: "🦉" },
  { name: "Cristiano Ronaldo", platform: "Sports", gender: "Male", followers: 640000000, era: "2000s", emoji: "🐐" },
  { name: "Lionel Messi", platform: "Sports", gender: "Male", followers: 500000000, era: "2000s", emoji: "⚽" },
  { name: "Selena Gomez", platform: "Music", gender: "Female", followers: 420000000, era: "2010s", emoji: "💄" },
  { name: "Kylie Jenner", platform: "Model", gender: "Female", followers: 390000000, era: "2010s", emoji: "💋" },
  { name: "Dwayne Johnson", platform: "Movies", gender: "Male", followers: 390000000, era: "2000s", emoji: "🤨" },
  { name: "Justin Bieber", platform: "Music", gender: "Male", followers: 290000000, era: "2010s", emoji: "🎸" },
  { name: "Kim Kardashian", platform: "Model", gender: "Female", followers: 360000000, era: "2010s", emoji: "📸" },
  { name: "Beyonce", platform: "Music", gender: "Female", followers: 310000000, era: "2000s", emoji: "🐝" },
  { name: "Khaby Lame", platform: "TikTok", gender: "Male", followers: 160000000, era: "2020s", emoji: "🤲" },
  { name: "Ninja", platform: "Twitch", gender: "Male", followers: 19000000, era: "2010s", emoji: "🎮" },
  { name: "Eminem", platform: "Music", gender: "Male", followers: 43000000, era: "1990s", emoji: "🎤" },
  { name: "Rihanna", platform: "Music", gender: "Female", followers: 150000000, era: "2000s", emoji: "👑" },
  { name: "Zendaya", platform: "Movies", gender: "Female", followers: 180000000, era: "2010s", emoji: "🎬" },
  { name: "Tom Holland", platform: "Movies", gender: "Male", followers: 65000000, era: "2010s", emoji: "🕷️" },
  { name: "LeBron James", platform: "Sports", gender: "Male", followers: 159000000, era: "2000s", emoji: "👑" },
  { name: "Katy Perry", platform: "Music", gender: "Female", followers: 200000000, era: "2010s", emoji: "👁️" },
  { name: "Kevin Hart", platform: "Comedy", gender: "Male", followers: 178000000, era: "2010s", emoji: "🎭" },
  { name: "Shakira", platform: "Music", gender: "Female", followers: 90000000, era: "2000s", emoji: "💃" },
  { name: "MrBeast Gaming", platform: "YouTube", gender: "Male", followers: 44000000, era: "2020s", emoji: "🎮" },
  { name: "PewDiePie", platform: "YouTube", gender: "Male", followers: 111000000, era: "2010s", emoji: "👊" },
  { name: "Neymar Jr", platform: "Sports", gender: "Male", followers: 226000000, era: "2000s", emoji: "🇧🇷" },
  { name: "Kendall Jenner", platform: "Model", gender: "Female", followers: 290000000, era: "2010s", emoji: "👠" },
  { name: "Nicki Minaj", platform: "Music", gender: "Female", followers: 220000000, era: "2010s", emoji: "🦄" },
  { name: "Shraddha Kapoor", platform: "Movies", gender: "Female", followers: 94000000, era: "2010s", emoji: "🌸" },
  { name: "Alia Bhatt", platform: "Movies", gender: "Female", followers: 85000000, era: "2010s", emoji: "✨" },
  { name: "Shroud", platform: "Twitch", gender: "Male", followers: 11000000, era: "2010s", emoji: "🎯" },
  { name: "Rubius", platform: "YouTube", gender: "Male", followers: 40000000, era: "2010s", emoji: "🕹️" },
  { name: "Auronplay", platform: "Twitch", gender: "Male", followers: 16000000, era: "2010s", emoji: "🎭" },
  { name: "Ibai", platform: "Twitch", gender: "Male", followers: 17000000, era: "2020s", emoji: "🇪🇸" },
  { name: "TheGrefg", platform: "Twitch", gender: "Male", followers: 12000000, era: "2010s", emoji: "⚡" },
  { name: "Squeezie", platform: "YouTube", gender: "Male", followers: 19000000, era: "2010s", emoji: "🇫🇷" },
  { name: "Dude Perfect", platform: "YouTube", gender: "Male", followers: 60000000, era: "2000s", emoji: "🎯" },
  { name: "Marshmello", platform: "Music", gender: "Male", followers: 57000000, era: "2010s", emoji: "✖️" },
  { name: "Markiplier", platform: "YouTube", gender: "Male", followers: 37000000, era: "2010s", emoji: "👓" },
  { name: "Jacksepticeye", platform: "YouTube", gender: "Male", followers: 30000000, era: "2010s", emoji: "🇮🇪" },
  { name: "Dream", platform: "YouTube", gender: "Male", followers: 31000000, era: "2020s", emoji: "🟢" },
  { name: "DanTDM", platform: "YouTube", gender: "Male", followers: 29000000, era: "2010s", emoji: "💎" },
  { name: "TommyInnit", platform: "YouTube", gender: "Male", followers: 14000000, era: "2020s", emoji: "🟥" },
  { name: "Amouranth", platform: "Twitch", gender: "Female", followers: 6000000, era: "2020s", emoji: "🦄" },
  { name: "Valkyrae", platform: "YouTube", gender: "Female", followers: 4000000, era: "2020s", emoji: "☀️" },
  { name: "Bella Poarch", platform: "TikTok", gender: "Female", followers: 94000000, era: "2020s", emoji: "🦙" },
  { name: "Addison Rae", platform: "TikTok", gender: "Female", followers: 88000000, era: "2020s", emoji: "💃" },
  { name: "Zach King", platform: "TikTok", gender: "Male", followers: 93000000, era: "2010s", emoji: "🪄" },
  { name: "Will Smith", platform: "Movies", gender: "Male", followers: 70000000, era: "1990s", emoji: "😎" },
  { name: "Snoop Dogg", platform: "Music", gender: "Male", followers: 89000000, era: "1990s", emoji: "🌿" },
  { name: "Lady Gaga", platform: "Music", gender: "Female", followers: 57000000, era: "2000s", emoji: "⚔️" },
  { name: "Bruno Mars", platform: "Music", gender: "Male", followers: 34000000, era: "2010s", emoji: "🎩" },
  { name: "Ed Sheeran", platform: "Music", gender: "Male", followers: 47000000, era: "2010s", emoji: "➕" },
  { name: "Adele", platform: "Music", gender: "Female", followers: 57000000, era: "2010s", emoji: "🪐" },
  { name: "David Beckham", platform: "Sports", gender: "Male", followers: 88000000, era: "1990s", emoji: "🕶️" },
  { name: "Stephen Curry", platform: "Sports", gender: "Male", followers: 57000000, era: "2010s", emoji: "🏀" },
  { name: "Post Malone", platform: "Music", gender: "Male", followers: 26000000, era: "2010s", emoji: "🍺" },
  { name: "Bad Bunny", platform: "Music", gender: "Male", followers: 47000000, era: "2010s", emoji: "🐰" },
  { name: "The Weeknd", platform: "Music", gender: "Male", followers: 77000000, era: "2010s", emoji: "❌" },
  { name: "Travis Scott", platform: "Music", gender: "Male", followers: 57000000, era: "2010s", emoji: "🌵" },
  { name: "Cardi B", platform: "Music", gender: "Female", followers: 165000000, era: "2010s", emoji: "💎" },
  { name: "Chris Brown", platform: "Music", gender: "Male", followers: 145000000, era: "2000s", emoji: "🎨" },
  { name: "Timati", platform: "Music", gender: "Male", followers: 17000000, era: "2000s", emoji: "🍔" },
  { name: "Basta", platform: "Music", gender: "Male", followers: 6000000, era: "2000s", emoji: "🎙️" },
  { name: "Morgenshtern", platform: "Music", gender: "Male", followers: 8000000, era: "2010s", emoji: "💎" },
  { name: "Egor Kreed", platform: "Music", gender: "Male", followers: 15000000, era: "2010s", emoji: "🎭" },
  { name: "Khabib Nurmagomedov", platform: "Sports", gender: "Male", followers: 37000000, era: "2010s", emoji: "🦅" },
  { name: "Hasbulla", platform: "TikTok", gender: "Male", followers: 8000000, era: "2020s", emoji: "🍓" },
  { name: "Dzhigan", platform: "Music", gender: "Male", followers: 5000000, era: "2010s", emoji: "🍍" },
  { name: "Anastasia Kvitko", platform: "Model", gender: "Female", followers: 12000000, era: "2010s", emoji: "📸" },
  { name: "Danya Milokhin", platform: "TikTok", gender: "Male", followers: 4000000, era: "2020s", emoji: "🛹" },
  { name: "Karina Cross", platform: "TikTok", gender: "Female", followers: 10000000, era: "2010s", emoji: "🎬" },
  { name: "Wylsacom", platform: "YouTube", gender: "Male", followers: 10000000, era: "2010s", emoji: "🍏" },
  { name: "Kuplinov", platform: "YouTube", gender: "Male", followers: 16000000, era: "2010s", emoji: "🐻" },
  { name: "Buster", platform: "Twitch", gender: "Male", followers: 4000000, era: "2020s", emoji: "⌨️" },
  { name: "Evelone", platform: "Twitch", gender: "Male", followers: 2000000, era: "2010s", emoji: "👓" },
  { name: "Deepins", platform: "TikTok", gender: "Male", followers: 17000000, era: "2020s", emoji: "💫" }
];

window.starDatabase = starDatabase;

const MAX_ATTEMPTS = 6;
const COLUMNS = ["platform", "gender", "followers", "era"];

function formatFollowers(n) {
  if (n >= 1_000_000_000) return Math.round(n / 1_000_000_000) + "B+";
  if (n >= 1_000_000)     return Math.round(n / 1_000_000) + "M+";
  if (n >= 1_000)         return Math.round(n / 1_000) + "K+";
  return n + "+";
}
window.formatFollowers = formatFollowers;

function pickRandomTarget() {
  return starDatabase[Math.floor(Math.random() * starDatabase.length)];
}

function findCelebrity(name) {
  const q = name.trim().toLowerCase();
  return starDatabase.find(c => c.name.toLowerCase() === q) || null;
}

function boot() {
  const searchInput  = document.getElementById("searchInput");
  if (!searchInput) return; // not on the game page — archive uses the deck only

  const autocomplete = document.getElementById("autocomplete");
  const statusMsg    = document.getElementById("statusMsg");
  const attemptsLabel = document.getElementById("attemptsLabel");
  const historyEl    = document.getElementById("history");
  const overlay      = document.getElementById("endOverlay");
  const playAgainBtn = document.getElementById("playAgainBtn");

  let target = null;
  let guesses = [];   // { celeb, clues: ['green'|'red'|'yellow-up'|'yellow-down'] }
  let gameOver = false;

  /* ---------- clue logic ---------- */

  function computeClues(guessCeleb) {
    return COLUMNS.map(col => {
      if (col === "followers") {
        if (guessCeleb.followers === target.followers) return "green";
        return guessCeleb.followers < target.followers ? "yellow-up" : "yellow-down";
      }
      return guessCeleb[col] === target[col] ? "green" : "red";
    });
  }

  /* ---------- rendering ---------- */

  function renderAttempts() {
    let html = "Attempts: ";
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      html += `<span class="pip ${i < guesses.length ? "used" : ""}"></span>`;
    }
    attemptsLabel.innerHTML = html;
  }

  function renderHistory() {
    historyEl.innerHTML = "";
    guesses.forEach(g => {
      const row = document.createElement("div");
      row.className = "history-row";

      const nameTag = document.createElement("div");
      nameTag.className = "history-who";
      nameTag.innerHTML = `${g.celeb.emoji} ${g.celeb.name}`;

      const tiles = document.createElement("div");
      tiles.className = "history-tiles";

      COLUMNS.forEach((col, i) => {
        const clue = g.clues[i];
        const tile = document.createElement("div");
        const val = col === "followers" ? formatFollowers(g.celeb[col]) : g.celeb[col];

        tile.className = "tile";
        tile.title = col;
        if (clue === "green") tile.classList.add("tile-green");
        else if (clue === "red") tile.classList.add("tile-red");
        else {
          tile.classList.add("tile-yellow");
          tile.innerHTML = `${val}<span class="tile-arrow">${clue === "yellow-up" ? "↑" : "↓"}</span>`;
        }
        if (clue !== "yellow-up" && clue !== "yellow-down") tile.textContent = val;
        tiles.appendChild(tile);
      });

      row.appendChild(nameTag);
      row.appendChild(tiles);
      historyEl.appendChild(row);
    });
  }

  function setStatus(text, cls) {
    statusMsg.textContent = text;
    statusMsg.className = "status-msg text-center font-bold text-sm sm:text-base min-h-[24px] mt-2" + (cls ? " " + cls : "");
  }

  /* ---------- win / loss overlay ---------- */

  function showOverlay(won) {
    const celeb = target;
    document.getElementById("overlayKicker").textContent = won ? "Congratulations! You found" : "The star was";
    document.getElementById("overlayName").textContent = celeb.name;
    document.getElementById("overlayEmoji").textContent = celeb.emoji;
    document.getElementById("overlayTitle").textContent = won ? "🎉 You cracked the code!" : "💀 Out of guesses!";
    document.getElementById("overlayTitle").className =
      "text-xl font-black tracking-tight mt-1 " + (won ? "text-green-400" : "text-red-500");
    document.getElementById("overlaySub").textContent =
      `${celeb.platform} · ${celeb.gender} · ${formatFollowers(celeb.followers)} · ${celeb.era}`;

    const w = CoreWallet.get();
    document.getElementById("statAttempts").textContent = `${guesses.length}/${MAX_ATTEMPTS}`;
    document.getElementById("statStreak").textContent = w.currentStreak;
    document.getElementById("statBest").textContent = w.maxStreak;

    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function readArray(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function appendToArray(key, name) {
    try {
      const arr = readArray(key);
      if (name && !arr.includes(name)) arr.push(name);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {
      // storage unavailable — fail silently
    }
  }

  function endGame(won) {
    gameOver = true;
    searchInput.disabled = true;
    autocomplete.classList.remove("open");

    if (won) {
      CoreWallet.registerWin(target.name);
      appendToArray("guessed_stars", target.name);
      setStatus(`🎉 Correct — it was ${target.emoji} ${target.name}!`, "text-green-400");
    } else {
      CoreWallet.registerLoss(target.name);
      appendToArray("failed_stars", target.name);
      setStatus(`💀 The answer was ${target.emoji} ${target.name}. Streak reset.`, "text-red-400");
    }
    CoreWallet.renderStreakBadge("streakBadge");
    renderAttempts();
    showOverlay(won);
  }

  function newGame() {
    target = pickRandomTarget();
    guesses = [];
    gameOver = false;
    searchInput.value = "";
    searchInput.disabled = false;
    hideOverlay();
    historyEl.innerHTML = "";
    setStatus("Type a name and click a result — no submit button needed.");
    renderAttempts();
    searchInput.focus();
  }

  playAgainBtn.addEventListener("click", newGame);

  /* ---------- guess submission ---------- */

  function submitGuess(celeb) {
    if (gameOver) return;
    if (guesses.length >= MAX_ATTEMPTS) return;

    if (guesses.some(g => g.celeb.name === celeb.name)) {
      setStatus("Already guessed — pick a different creator.", "text-yellow-400");
      return;
    }

    const clues = computeClues(celeb);
    guesses.push({ celeb, clues });

    renderHistory();
    renderAttempts();

    if (clues.every(c => c === "green")) {
      setStatus(`🎉 Nailed it — ${celeb.name} matches all 4 attributes!`, "text-green-400");
      setTimeout(() => endGame(true), 700);
      return;
    }
    if (guesses.length >= MAX_ATTEMPTS) {
      setTimeout(() => endGame(false), 700);
      return;
    }
    setStatus(`${MAX_ATTEMPTS - guesses.length} attempt${MAX_ATTEMPTS - guesses.length === 1 ? "" : "s"} left — keep guessing!`);
    searchInput.focus();
  }

  /* ---------- autocomplete: instant submit on click ---------- */

  let activeIndex = -1;
  let currentCelebs = [];

  function renderAutocomplete(query) {
    autocomplete.innerHTML = "";
    currentCelebs = [];
    activeIndex = -1;

    const q = query.trim().toLowerCase();
    if (!q || gameOver) { autocomplete.classList.remove("open"); return; }

    const matches = starDatabase.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8);

    if (matches.length === 0) {
      autocomplete.innerHTML = `<div class="autocomplete-empty">No matches — try another name!</div>`;
      autocomplete.classList.add("open");
      return;
    }

    matches.forEach((c, i) => {
      const item = document.createElement("div");
      item.className = "autocomplete-item";
      item.innerHTML = `<span class="emoji">${c.emoji}</span><span class="name">${c.name}</span><span class="meta">${c.platform} • ${formatFollowers(c.followers)}</span>`;
      item.addEventListener("mousedown", e => {
        e.preventDefault(); // keep input focus behavior stable
        submitGuess(c);
        searchInput.value = "";
        autocomplete.classList.remove("open");
      });
      item.addEventListener("mouseenter", () => setActive(i));
      autocomplete.appendChild(item);
      currentCelebs.push(c);
    });

    autocomplete.classList.add("open");
  }

  function setActive(idx) {
    activeIndex = idx;
    [...autocomplete.children].forEach((el, i) => el.classList.toggle("active", i === idx));
  }

  searchInput.addEventListener("input", () => renderAutocomplete(searchInput.value));

  searchInput.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!autocomplete.classList.contains("open")) renderAutocomplete(searchInput.value);
      setActive(Math.min(activeIndex + 1, currentCelebs.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && currentCelebs[activeIndex]) {
        submitGuess(currentCelebs[activeIndex]);
        searchInput.value = "";
        autocomplete.classList.remove("open");
      } else {
        const exact = findCelebrity(searchInput.value);
        if (exact) {
          submitGuess(exact);
          searchInput.value = "";
          autocomplete.classList.remove("open");
        }
      }
    } else if (e.key === "Escape") {
      autocomplete.classList.remove("open");
    }
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap")) autocomplete.classList.remove("open");
  });

  /* ---------- init ---------- */

  newGame();
  CoreWallet.renderStreakBadge("streakBadge");
}

boot();
