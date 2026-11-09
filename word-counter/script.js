const textInput = document.getElementById('text-input');
const clearBtn = document.getElementById('clear-btn');
const sampleBtn = document.getElementById('sample-btn');
const copyStatsBtn = document.getElementById('copy-stats-btn');

const statWords = document.getElementById('stat-words');
const statChars = document.getElementById('stat-chars');
const statCharsNoSpace = document.getElementById('stat-chars-no-space');
const statSentences = document.getElementById('stat-sentences');
const statParagraphs = document.getElementById('stat-paragraphs');
const statReadingTime = document.getElementById('stat-reading-time');

const WORDS_PER_MINUTE = 200;
const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs! How vexingly quick daft zebras jump.

Writing clearly matters more than writing quickly. Every sentence you publish carries your voice, your ideas, and a small piece of your credibility. Good writers know that clarity is a craft built through repetition, editing, and honest attention to the reader.

This sample text helps you explore the word counter. Watch the stats update as you type — words, characters, sentences, paragraphs, and an estimated reading time based on an average pace of 200 words per minute.`;

function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countSentences(text) {
  const matches = text.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g);
  if (!matches) return 0;
  return matches.filter(s => s.trim().length > 0).length;
}

function countParagraphs(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
}

function formatReadingTime(words) {
  if (words === 0) return '0 min';
  const minutes = words / WORDS_PER_MINUTE;
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.ceil(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const rem = Math.round(minutes % 60);
  return rem === 0 ? `${hours} hr` : `${hours} hr ${rem} min`;
}

function updateStats() {
  const text = textInput.value;
  const words = countWords(text);

  statWords.textContent = words.toLocaleString();
  statChars.textContent = text.length.toLocaleString();
  statCharsNoSpace.textContent = text.replace(/\s/g, '').length.toLocaleString();
  statSentences.textContent = countSentences(text).toLocaleString();
  statParagraphs.textContent = countParagraphs(text).toLocaleString();
  statReadingTime.textContent = formatReadingTime(words);

  copyStatsBtn.disabled = words === 0;
}

function currentStatsText() {
  return [
    `Words: ${statWords.textContent}`,
    `Characters: ${statChars.textContent}`,
    `Characters (no spaces): ${statCharsNoSpace.textContent}`,
    `Sentences: ${statSentences.textContent}`,
    `Paragraphs: ${statParagraphs.textContent}`,
    `Reading time: ${statReadingTime.textContent}`
  ].join('\n');
}

textInput.addEventListener('input', updateStats);

clearBtn.addEventListener('click', () => {
  textInput.value = '';
  textInput.focus();
  updateStats();
});

sampleBtn.addEventListener('click', () => {
  textInput.value = SAMPLE_TEXT;
  textInput.focus();
  updateStats();
});

copyStatsBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(currentStatsText());
    copyStatsBtn.textContent = 'Copied!';
    setTimeout(() => { copyStatsBtn.textContent = 'Copy stats'; }, 1500);
  } catch (err) {
    copyStatsBtn.textContent = 'Copy failed';
    setTimeout(() => { copyStatsBtn.textContent = 'Copy stats'; }, 1500);
  }
});

updateStats();
