const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{};:,.<>?/~'
};

const passwordOutput = document.getElementById('password-output');
const strengthFill = document.getElementById('strength-fill');
const strengthLabel = document.getElementById('strength-label');
const lengthSlider = document.getElementById('length-slider');
const lengthValue = document.getElementById('length-value');
const optUppercase = document.getElementById('opt-uppercase');
const optLowercase = document.getElementById('opt-lowercase');
const optNumbers = document.getElementById('opt-numbers');
const optSymbols = document.getElementById('opt-symbols');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');

let currentPassword = '';

function secureRandomIndex(max) {
  const array = new Uint32Array(1);
  // Rejection sampling to avoid modulo bias
  const limit = Math.floor(0x100000000 / max) * max;
  let value;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
}

function getSelectedCharset() {
  let charset = '';
  if (optUppercase.checked) charset += CHARSETS.uppercase;
  if (optLowercase.checked) charset += CHARSETS.lowercase;
  if (optNumbers.checked) charset += CHARSETS.numbers;
  if (optSymbols.checked) charset += CHARSETS.symbols;
  return charset;
}

function generatePassword() {
  const length = parseInt(lengthSlider.value, 10);
  const charset = getSelectedCharset();

  if (!charset) {
    passwordOutput.textContent = 'Select at least one character type';
    updateStrength(0);
    currentPassword = '';
    return;
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[secureRandomIndex(charset.length)];
  }

  // Guarantee at least one character from each selected category when possible
  const categories = [
    optUppercase.checked ? CHARSETS.uppercase : '',
    optLowercase.checked ? CHARSETS.lowercase : '',
    optNumbers.checked ? CHARSETS.numbers : '',
    optSymbols.checked ? CHARSETS.symbols : ''
  ].filter(Boolean);

  if (length >= categories.length) {
    const chars = password.split('');
    categories.forEach((cat, i) => {
      chars[i] = cat[secureRandomIndex(cat.length)];
    });
    // Shuffle the guaranteed characters into random positions
    for (let i = chars.length - 1; i > 0; i--) {
      const j = secureRandomIndex(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    password = chars.join('');
  }

  currentPassword = password;
  passwordOutput.textContent = password;
  updateStrength(calculateEntropy(length, charset.length));
}

function calculateEntropy(length, charsetSize) {
  // log2(charsetSize) * length bits of entropy
  return length * Math.log2(charsetSize);
}

function updateStrength(entropy) {
  let width, label, level;
  if (entropy <= 0) {
    width = 0; label = '—'; level = '';
  } else if (entropy < 50) {
    width = 25; label = 'Weak'; level = 'weak';
  } else if (entropy < 75) {
    width = 50; label = 'Fair'; level = 'fair';
  } else if (entropy < 100) {
    width = 75; label = 'Good'; level = 'good';
  } else {
    width = 100; label = 'Strong'; level = 'strong';
  }
  strengthFill.style.width = `${width}%`;
  strengthLabel.textContent = label;
  strengthLabel.className = `strength-label${level ? ' ' + level : ''}`;
}

function syncControls() {
  lengthValue.textContent = lengthSlider.value;
}

generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', async () => {
  if (!currentPassword) return;
  try {
    await navigator.clipboard.writeText(currentPassword);
    copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Copied';
    setTimeout(() => {
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
    }, 1500);
  } catch (err) {
    copyBtn.textContent = 'Copy failed';
  }
});

[lengthSlider, optUppercase, optLowercase, optNumbers, optSymbols].forEach(el => {
  el.addEventListener('input', () => {
    syncControls();
    generatePassword();
  });
  el.addEventListener('change', generatePassword);
});

syncControls();
generatePassword();
