/* ===== FlowState — Productivity & Pomodoro Dashboard ===== */
'use strict';

/* ============================================================
   HEADER — date & greeting
============================================================ */
(function initHeader() {
  const now = new Date();
  document.getElementById('dateLabel').textContent = now.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  const h = now.getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = greet + ' — make it count.';
})();

/* ============================================================
   POMODORO TIMER
============================================================ */
const DURATIONS = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
const CIRC = 552.9; // 2π × 88

const timerDisplay = document.getElementById('timerDisplay');
const timerStatus = document.getElementById('timerStatus');
const sessionDots = document.getElementById('sessionDots');
const progressRing = document.getElementById('progressRing');
const startBtn = document.getElementById('startBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const modeBtns = document.querySelectorAll('.mode-btn');

let mode = 'work';
let totalSeconds = DURATIONS.work;
let remaining = totalSeconds;
let running = false;
let timerId = null;
let lastTick = 0;
let completedSessions = 0; // work sessions since last long break

/* ---------- Ring ---------- */
function renderRing() {
  const frac = remaining / totalSeconds;
  progressRing.style.strokeDashoffset = CIRC * (1 - frac);
  const m = Math.floor(remaining / 60);
  const s = Math.floor(remaining % 60);
  timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  timerDisplay.classList.toggle('low-time', remaining <= 10 && running);
}

function renderDots() {
  // 4 focus sessions = 1 cycle; filled dots = completed
  sessionDots.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const dot = document.createElement('span');
    dot.className = 'w-2 h-2 rounded-full transition-colors duration-500 ' +
      (i < completedSessions % 4 ? 'bg-indigo-400' : 'bg-slate-600/50');
    sessionDots.appendChild(dot);
  }
}

function setMode(newMode) {
  mode = newMode;
  totalSeconds = DURATIONS[mode];
  remaining = totalSeconds;
  stopTimer();
  modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  timerStatus.textContent =
    mode === 'work' ? 'Time to focus' : mode === 'short' ? 'Short break' : 'Long break';
  renderRing();
  renderDots();
}

/* ---------- Tick (smooth ~4fps ring updates) ---------- */
function tick() {
  const now = performance.now();
  const elapsed = (now - lastTick) / 1000;
  lastTick = now;
  remaining = Math.max(0, remaining - elapsed);
  renderRing();
  if (remaining <= 0) {
    completePhase();
  }
}

function startTimer() {
  if (running) return;
  running = true;
  document.body.classList.add('timer-running');
  playIcon.classList.add('hidden');
  pauseIcon.classList.remove('hidden');
  timerStatus.textContent = 'In progress…';
  lastTick = performance.now();
  timerId = setInterval(tick, 250);
  requestNotifyPermission();
}

function pauseTimer() {
  running = false;
  document.body.classList.remove('timer-running');
  playIcon.classList.remove('hidden');
  pauseIcon.classList.add('hidden');
  timerStatus.textContent = 'Paused';
  clearInterval(timerId);
  timerId = null;
}

function stopTimer() {
  pauseTimer();
}

function resetTimer() {
  stopTimer();
  remaining = totalSeconds;
  timerStatus.textContent = mode === 'work' ? 'Ready to focus' : 'Break time';
  renderRing();
}

function skipPhase() {
  stopTimer();
  if (mode === 'work') {
    completedSessions++;
    const next = completedSessions % 4 === 0 ? 'long' : 'short';
    setMode(next);
  } else {
    setMode('work');
  }
  renderDots();
}

function completePhase() {
  stopTimer();
  playChime(mode === 'work');
  sendNotification(mode);

  if (mode === 'work') {
    completedSessions++;
    const next = completedSessions % 4 === 0 ? 'long' : 'short';
    setMode(next);
  } else {
    setMode('work');
  }
  renderDots();
}

/* ---------- Controls ---------- */
startBtn.addEventListener('click', () => (running ? pauseTimer() : startTimer()));
resetBtn.addEventListener('click', resetTimer);
skipBtn.addEventListener('click', skipPhase);
modeBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

/* ============================================================
   NOTIFICATION SOUND + BROWSER NOTIFICATION
============================================================ */
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playChime(isWorkEnd) {
  try {
    const ctx = getCtx();
    const notes = isWorkEnd ? [523.25, 659.25, 783.99, 1046.5] : [392.0, 523.25, 659.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1);
    });
  } catch (e) { /* audio unavailable */ }
}

function requestNotifyPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendNotification(modeName) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const labels = {
    work:  { title: 'Focus session complete', body: 'Great work — time for a break.' },
    short: { title: 'Short break over',       body: 'Ready for another focus session?' },
    long:  { title: 'Long break over',        body: 'Back to it — you\'ve earned it.' },
  };
  const n = labels[modeName] || labels.work;
  try { new Notification(n.title, { body: n.body }); } catch (e) { /* noop */ }
  // Also flash the title
  const orig = document.title;
  document.title = n.title + ' — FlowState';
  setTimeout(() => { document.title = orig; }, 6000);
}

renderRing();
renderDots();

/* ============================================================
   AMBIENT SOUND MIXER
============================================================ */
const SOUNDS = [
  {
    id: 'rain',
    name: 'Rain',
    desc: 'Stormy rain loop',
    url: 'https://orangefreesounds.com/wp-content/uploads/2026/05/Free-stormy-rain-sound-effect-loop.mp3',
    icon: 'M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z',
  },
  {
    id: 'cafe',
    name: 'Cafe Ambience',
    desc: 'Crowd chatter',
    url: 'https://orangefreesounds.com/wp-content/uploads/2026/08/Italian-cafe-ambience-sound-effect-real-crowd-and-italian-voices.mp3',
    icon: 'M17.25 6.75h.008v.008H17.25V6.75Zm-3 0h.008v.008H14.25V6.75ZM5.25 8.25h13.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-7.5a1.5 1.5 0 0 1 1.5-1.5Zm3 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm6.75 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z',
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Beats',
    desc: 'Rhodes piano loop',
    url: 'https://orangefreesounds.com/wp-content/uploads/2023/03/Lo-fi-piano-chords.mp3',
    icon: 'M9 9V4.5a1.5 1.5 0 0 1 3 0V9m0-3.75a1.5 1.5 0 0 1 3 0V9m0-3a1.5 1.5 0 0 1 3 0v10.5a6 6 0 0 1-6 6h-1.5A6 6 0 0 1 6 18.5V9.75a1.5 1.5 0 0 1 3 0',
  },
  {
    id: 'birds',
    name: 'Forest Birds',
    desc: 'Morning chirps',
    url: 'https://www.orangefreesounds.com/wp-content/uploads/2021/03/Forest-birds-chirping-nature-sounds.mp3',
    icon: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z',
  },
];

const soundGrid = document.getElementById('soundGrid');
const masterMuteBtn = document.getElementById('masterMute');
const masterMuteLabel = document.getElementById('masterMuteLabel');
const mixers = {}; // id -> { audio, card, toggle, slider }

SOUNDS.forEach(s => {
  const card = document.createElement('div');
  card.className = 'sound-card';
  card.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center shrink-0">
        <svg class="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="${s.icon}" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate">${s.name}</p>
        <p class="text-[11px] text-slate-500 truncate">${s.desc}</p>
      </div>
      <div class="eq-bars"><span></span><span></span><span></span><span></span></div>
      <button class="sound-toggle" aria-label="Toggle ${s.name}"></button>
    </div>
    <input type="range" min="0" max="100" value="60" class="vol-slider mt-3" aria-label="${s.name} volume" />
  `;
  soundGrid.appendChild(card);

  const audio = new Audio(s.url);
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = 0.6;

  const toggle = card.querySelector('.sound-toggle');
  const slider = card.querySelector('.vol-slider');

  toggle.addEventListener('click', () => {
    if (audio.paused) {
      getCtx(); // unlock audio on user gesture
      audio.play().catch(() => {});
      card.classList.add('is-on');
    } else {
      audio.pause();
      card.classList.remove('is-on');
    }
    updateMasterMuteLabel();
  });

  slider.addEventListener('input', () => {
    audio.volume = slider.value / 100;
  });

  mixers[s.id] = { audio, card };
});

function updateMasterMuteLabel() {
  const anyOn = Object.values(mixers).some(m => !m.audio.paused);
  masterMuteLabel.textContent = anyOn ? 'All On' : 'All Off';
}

masterMuteBtn.addEventListener('click', () => {
  const anyOn = Object.values(mixers).some(m => !m.audio.paused);
  Object.values(mixers).forEach(m => {
    if (anyOn) { m.audio.pause(); m.card.classList.remove('is-on'); }
    else { m.audio.play().catch(() => {}); m.card.classList.add('is-on'); }
  });
  updateMasterMuteLabel();
});

updateMasterMuteLabel();

/* ============================================================
   TODO LIST (localStorage)
============================================================ */
const TODO_KEY = 'flowstate-todos';
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const todoEmpty = document.getElementById('todoEmpty');
const todoProgress = document.getElementById('todoProgress');
const clearDoneBtn = document.getElementById('clearDone');

let todos = loadTodos();

function loadTodos() {
  try { return JSON.parse(localStorage.getItem(TODO_KEY)) || []; }
  catch { return []; }
}
function saveTodos() {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

const CHECK_SVG = '<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>';
const DEL_SVG = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>';

function renderTodos() {
  todoList.innerHTML = '';
  todos.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (t.done ? ' done' : '');
    li.dataset.index = i;
    li.innerHTML = `
      <button class="todo-check" aria-label="Toggle done">${CHECK_SVG}</button>
      <span class="todo-text"></span>
      <button class="todo-del" aria-label="Delete task">${DEL_SVG}</button>
    `;
    li.querySelector('.todo-text').textContent = t.text;
    li.querySelector('.todo-check').addEventListener('click', () => {
      todos[i].done = !todos[i].done;
      saveTodos();
      renderTodos();
    });
    li.querySelector('.todo-del').addEventListener('click', () => {
      todos.splice(i, 1);
      saveTodos();
      renderTodos();
    });
    todoList.appendChild(li);
  });

  const done = todos.filter(t => t.done).length;
  todoEmpty.style.display = todos.length ? 'none' : 'block';
  todoProgress.textContent = `${done} of ${todos.length} done`;
}

todoForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  todos.unshift({ text, done: false, id: Date.now() });
  todoInput.value = '';
  saveTodos();
  renderTodos();
  todoInput.focus();
});

clearDoneBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  saveTodos();
  renderTodos();
});

renderTodos();
