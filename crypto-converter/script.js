/* ============================================================
   Winarty — Crypto, Metals & Fiat Currency Converter
   Crypto : CoinGecko public API (USD prices)
   Metals : gold-api.com (USD per troy ounce)
   Fiat   : open.er-api.com (units per 1 USD)
   All conversions are routed through USD.
   ============================================================ */

'use strict';

/* ---------- Currency registry ---------- */
const CRYPTO = {
  btc:  { code: 'BTC',  name: 'Bitcoin',   geckoId: 'bitcoin',     icon: '₿', color: '#f7931a' },
  eth:  { code: 'ETH',  name: 'Ethereum',  geckoId: 'ethereum',    icon: 'Ξ', color: '#8a9cff' },
  sol:  { code: 'SOL',  name: 'Solana',    geckoId: 'solana',      icon: '◎', color: '#14f195' },
  bnb:  { code: 'BNB',  name: 'BNB',       geckoId: 'binancecoin', icon: '◆', color: '#f0b90b' },
  xrp:  { code: 'XRP',  name: 'Ripple',    geckoId: 'ripple',      icon: '✕', color: '#25a4e8' },
  doge: { code: 'DOGE', name: 'Dogecoin',  geckoId: 'dogecoin',    icon: 'Ð', color: '#c2a633' },
  ada:  { code: 'ADA',  name: 'Cardano',   geckoId: 'cardano',     icon: '₳', color: '#3468d1' },
  trx:  { code: 'TRX',  name: 'Tron',      geckoId: 'tron',        icon: 'T', color: '#eb0029' },
  ton:  { code: 'TON',  name: 'Toncoin',   geckoId: 'the-open-network', icon: '◈', color: '#0098ea' },
  ltc:  { code: 'LTC',  name: 'Litecoin',  geckoId: 'litecoin',    icon: 'Ł', color: '#345d9d' },
};

const METALS = {
  xau: { code: 'XAU', name: 'Gold',     color: '#f5c542' },
  xag: { code: 'XAG', name: 'Silver',   color: '#cbd5e1' },
  xpt: { code: 'XPT', name: 'Platinum', color: '#a5b4fc' },
  xpd: { code: 'XPD', name: 'Palladium',color: '#94a3b8' },
};

const FIAT = {
  usd: { code: 'USD', name: 'US Dollar' },
  eur: { code: 'EUR', name: 'Euro' },
  gbp: { code: 'GBP', name: 'British Pound' },
  rub: { code: 'RUB', name: 'Russian Ruble' },
  jpy: { code: 'JPY', name: 'Japanese Yen' },
  cny: { code: 'CNY', name: 'Chinese Yuan' },
  inr: { code: 'INR', name: 'Indian Rupee' },
  try: { code: 'TRY', name: 'Turkish Lira' },
  uah: { code: 'UAH', name: 'Ukrainian Hryvnia' },
  kzt: { code: 'KZT', name: 'Kazakhstani Tenge' },
  aed: { code: 'AED', name: 'UAE Dirham' },
  chf: { code: 'CHF', name: 'Swiss Franc' },
};

const ALL = { ...CRYPTO, ...METALS, ...FIAT };

/* ---------- State ---------- */
const state = {
  cryptoUsd: {},   // crypto key -> USD price of 1 coin
  metalUsd:  {},   // metal key  -> USD price per troy ounce
  fiatRate:  {},   // fiat code  -> units of fiat per 1 USD
  series:    {},   // geckoId   -> 7-day price array (btc/eth/sol only)
};

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const amountInput = $('amount-input');
const fromSelect  = $('from-select');
const toSelect    = $('to-select');
const resultEl    = $('result-output');
const rateValueEl = $('rate-value');
const rateFromEl  = $('rate-from-code');
const rateToEl    = $('rate-to-code');
const rateTimeEl  = $('rate-timestamp');

/* ---------- Formatting ---------- */
const fmtUSD = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD',
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});

function formatAmount(value, key) {
  if (!isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (CRYPTO[key] || METALS[key]) {
    if (abs !== 0 && abs < 0.0001) return value.toExponential(4);
    if (abs < 1) return value.toLocaleString('en-US', { maximumFractionDigits: 8 });
    return value.toLocaleString('en-US', { maximumFractionDigits: 4 });
  }
  const digits = abs >= 1 ? 2 : 4;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  });
}

function formatRate(value) {
  if (!isFinite(value) || value == null) return '—';
  if (value >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (value >= 1)    return value.toLocaleString('en-US', { maximumFractionDigits: 4 });
  if (value >= 0.01) return value.toLocaleString('en-US', { maximumFractionDigits: 6 });
  return value.toExponential(4);
}

/* ---------- Conversion engine (everything via USD) ---------- */
function toUsd(amount, key) {
  if (CRYPTO[key]) return amount * state.cryptoUsd[key];
  if (METALS[key]) return amount * state.metalUsd[key];
  if (FIAT[key])   return amount / state.fiatRate[key];
  return NaN;
}

function fromUsd(usdAmount, key) {
  if (CRYPTO[key]) return usdAmount / state.cryptoUsd[key];
  if (METALS[key]) return usdAmount / state.metalUsd[key];
  if (FIAT[key])   return usdAmount * state.fiatRate[key];
  return NaN;
}

function exchangeRate(from, to) {
  if (from === to) return 1;
  return fromUsd(toUsd(1, from), to);
}

/* ---------- Dropdowns ---------- */
function buildSelects() {
  const cryptoOpts = Object.values(CRYPTO)
    .map(c => `<option value="${c.code.toLowerCase()}">${c.icon} ${c.code} — ${c.name}</option>`).join('');
  const metalOpts = Object.values(METALS)
    .map(m => `<option value="${m.code.toLowerCase()}">${m.code} — ${m.name} (oz)</option>`).join('');
  const fiatOpts = Object.values(FIAT)
    .map(f => `<option value="${f.code.toLowerCase()}">${f.code} — ${f.name}</option>`).join('');

  for (const sel of [fromSelect, toSelect]) {
    sel.innerHTML = `
      <optgroup label="Crypto">${cryptoOpts}</optgroup>
      <optgroup label="Metals">${metalOpts}</optgroup>
      <optgroup label="Fiat">${fiatOpts}</optgroup>`;
  }

  fromSelect.value = 'usd';
  toSelect.value   = 'btc';
}

/* ---------- UI update ---------- */
function updateConversion() {
  const amount = parseFloat(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  rateFromEl.textContent = ALL[from].code;
  rateToEl.textContent   = ALL[to].code;

  if (!isFinite(amount) || amount < 0) {
    resultEl.textContent = '—';
    rateValueEl.textContent = '—';
    return;
  }

  const result = fromUsd(toUsd(amount, from), to);
  resultEl.textContent = `${formatAmount(result, to)} ${ALL[to].code}`;
  rateValueEl.textContent = formatRate(exchangeRate(from, to));
}

/* ---------- Market overview ---------- */
function renderTicker() {
  const grid = $('ticker-grid');
  const items = [];

  for (const key of ['btc', 'eth', 'sol', 'bnb', 'xrp']) {
    const c = CRYPTO[key];
    const series = state.series[c.geckoId];
    const change = series && series.length > 1
      ? ((series[series.length - 1] - series[0]) / series[0]) * 100
      : null;
    items.push({
      label: c.code, name: c.name, color: c.color,
      price: state.cryptoUsd[key] != null ? fmtUSD.format(state.cryptoUsd[key]) : '—',
      change,
    });
  }

  for (const key of ['xau', 'xag']) {
    const m = METALS[key];
    items.push({
      label: m.code, name: m.name + ' / oz', color: m.color,
      price: state.metalUsd[key] != null ? fmtUSD.format(state.metalUsd[key]) : '—',
      change: null,
    });
  }

  for (const key of ['eur', 'gbp', 'jpy']) {
    const f = FIAT[key];
    items.push({
      label: 'USD→' + f.code, name: '1 USD in ' + f.name, color: '#34d399',
      price: state.fiatRate[key] ? formatRate(state.fiatRate[key]) : '—',
      change: null,
    });
  }

  grid.innerHTML = items.map(it => `
    <div class="ticker-item">
      <div class="ticker-top">
        <span class="ticker-dot" style="background:${it.color}"></span>
        <span class="ticker-code">${it.label}</span>
        <span class="ticker-name">${it.name}</span>
      </div>
      <div class="ticker-price">${it.price}</div>
      ${it.change != null ? `
        <div class="ticker-change ${it.change >= 0 ? 'up' : 'down'}">
          ${it.change >= 0 ? '▲' : '▼'} ${Math.abs(it.change).toFixed(2)}% · 7d
        </div>` : '<div class="ticker-change flat">spot</div>'}
    </div>`).join('');
}

/* ---------- Data fetching ---------- */
async function fetchCrypto() {
  const ids = Object.values(CRYPTO).map(c => c.geckoId).join(',');

  const priceRes = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
  );
  const priceData = await priceRes.json();
  for (const key of Object.keys(CRYPTO)) {
    state.cryptoUsd[key] = priceData[CRYPTO[key].geckoId]?.usd ?? null;
  }

  // 7-day series only for the top coins (keeps us under CoinGecko rate limits)
  await Promise.all(['bitcoin', 'ethereum', 'solana'].map(async (id) => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7&interval=daily`
      );
      const data = await res.json();
      state.series[id] = (data.prices || []).map(p => p[1]);
    } catch {
      state.series[id] = [];
    }
  }));
}

async function fetchMetals() {
  await Promise.all(Object.keys(METALS).map(async (key) => {
    try {
      const res = await fetch(`https://api.gold-api.com/price/${METALS[key].code}`);
      const data = await res.json();
      state.metalUsd[key] = typeof data.price === 'number' ? data.price : null;
    } catch {
      state.metalUsd[key] = null;
    }
  }));
}

async function fetchFiat() {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  const data = await res.json();
  if (data.result === 'success' && data.rates) {
    for (const key of Object.keys(FIAT)) {
      state.fiatRate[key] = data.rates[FIAT[key].code] ?? null;
    }
  }
}

/* ---------- Init ---------- */
function init() {
  buildSelects();

  amountInput.addEventListener('input', updateConversion);
  fromSelect.addEventListener('change', updateConversion);
  toSelect.addEventListener('change', updateConversion);

  $('swap-btn').addEventListener('click', () => {
    const tmp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tmp;
    updateConversion();
  });

  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      fromSelect.value = chip.dataset.from;
      toSelect.value = chip.dataset.to;
      updateConversion();
    });
  });

  updateConversion();
  renderTicker();

  Promise.allSettled([fetchCrypto(), fetchMetals(), fetchFiat()]).then(() => {
    rateTimeEl.textContent =
      'Updated ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    updateConversion();
    renderTicker();
  });
}

document.addEventListener('DOMContentLoaded', init);
