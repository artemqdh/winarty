const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const copyBtn = document.getElementById('copy-btn');
const sampleBtn = document.getElementById('sample-btn');
const clearBtn = document.getElementById('clear-btn');
const modeButtons = document.querySelectorAll('.mode-btn');

const SAMPLE_TEXT = `hello world! this is a SAMPLE text to show how the case converter works.

title case capitalizes every word. sentence case only capitalizes the first letter of each sentence. toggle case flips the case of every letter — Try It Out!`;

const SMALL_WORDS = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet', 'at', 'by', 'in', 'of', 'on', 'to', 'up', 'as', 'is', 'it', 'be']);

function toTitleCase(text) {
  const tokens = text.split(/(\s+)/);
  const wordIndexes = tokens
    .map((t, i) => (/\S/.test(t) ? i : -1))
    .filter(i => i !== -1);
  const lastWordIndex = wordIndexes[wordIndexes.length - 1];

  return tokens
    .map((token, i) => {
      if (!/\S/.test(token)) return token;
      const lower = token.toLowerCase();
      const isFirst = i === wordIndexes[0];
      const isLast = i === lastWordIndex;
      if (!isFirst && !isLast && SMALL_WORDS.has(lower)) return lower;
      return lower.replace(/(^|[^\p{L}\p{N}])([\p{L}\p{N}])/gu, (m, p, c) => p + c.toUpperCase());
    })
    .join('');
}

function toSentenceCase(text) {
  const lower = text.toLowerCase();
  return lower.replace(/(^\s*[a-zà-öø-ÿ])|([.!?…]+["')\]]*\s+[a-zà-öø-ÿ])/g, match => {
    const idx = match.search(/[a-zà-öø-ÿ]/);
    return match.slice(0, idx) + match[idx].toUpperCase() + match.slice(idx + 1);
  });
}

function toToggleCase(text) {
  return text.replace(/[a-zA-ZÀ-ÖØ-öø-ÿ]/g, ch =>
    ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()
  );
}

const converters = {
  upper: text => text.toUpperCase(),
  lower: text => text.toLowerCase(),
  title: toTitleCase,
  sentence: toSentenceCase,
  toggle: toToggleCase
};

let activeMode = 'upper';

function convert() {
  const converted = converters[activeMode](inputText.value);
  outputText.value = converted;
  copyBtn.disabled = converted.length === 0;
}

function setMode(mode) {
  activeMode = mode;
  modeButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.mode === mode));
  convert();
}

inputText.addEventListener('input', convert);

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

copyBtn.addEventListener('click', async () => {
  if (!outputText.value) return;
  try {
    await navigator.clipboard.writeText(outputText.value);
    copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Copied';
    setTimeout(() => {
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
    }, 1500);
  } catch (err) {
    copyBtn.textContent = 'Copy failed';
  }
});

sampleBtn.addEventListener('click', () => {
  inputText.value = SAMPLE_TEXT;
  inputText.focus();
  convert();
});

clearBtn.addEventListener('click', () => {
  inputText.value = '';
  outputText.value = '';
  copyBtn.disabled = true;
  inputText.focus();
});

convert();
