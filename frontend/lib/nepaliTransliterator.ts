// ─── Nepali Romanized Phonetic Transliteration Engine & Unicode Cleaner ──────

// ─── High-Frequency Romanized Nepali Word Dictionary ────────────────────────
export const NEPALI_DICTIONARY: Record<string, string> = {
  // Greetings & Courtesies
  'namaste': 'नमस्ते',
  'namaskar': 'नमस्कार',
  'dhanyabad': 'धन्यवाद',
  'dhanybaad': 'धन्यवाद',
  'dhanybada': 'धन्यवाद',
  'kripaya': 'कृपया',
  'swagatam': 'स्वागतम्',
  'alvida': 'अलविदा',
  'maaf': 'माफ',
  'maafi': 'माफी',

  // Pronouns
  'ma': 'म',
  'mero': 'मेरो',
  'malai': 'मलाई',
  'hami': 'हामी',
  'hamro': 'हाम्रो',
  'hamilai': 'हामीलाई',
  'ta': 'तँ',
  'tero': 'तेरो',
  'timi': 'तिमी',
  'timro': 'तिम्रो',
  'timilai': 'तिमीलाई',
  'tapai': 'तपाईं',
  'tapaiko': 'तपाईंको',
  'tapailai': 'तपाईंलाई',
  'u': 'ऊ',
  'usko': 'उसको',
  'uslai': 'उसलाई',
  'unko': 'उनको',
  'unlai': 'उनलाई',
  'yo': 'यो',
  'tyo': 'त्यो',
  'yaha': 'यहाँ',
  'tyaha': 'त्यहाँ',
  'kaha': 'कहाँ',
  'sabai': 'सबै',
  'sabaiko': 'सबैको',

  // Common Verbs & Auxiliaries
  'chha': 'छ',
  'chhu': 'छु',
  'chhan': 'छन्',
  'chhau': 'छौ',
  'chhes': 'छेस्',
  'ho': 'हो',
  'hoin': 'होइन',
  'haina': 'हैन',
  'hun': 'हुन्',
  'hunchha': 'हुन्छ',
  'hudaina': 'हुँदैन',
  'thiyo': 'थियो',
  'thiye': 'थिए',
  'thiyin': 'थिइन्',
  'bhayeko': 'भएको',
  'bhaneko': 'भनेको',
  'garne': 'गर्ने',
  'garchha': 'गर्छ',
  'garchhu': 'गर्छु',
  'gareko': 'गरेको',
  'aauchha': 'आउँछ',
  'jaanchha': 'जान्छ',
  'khanchha': 'खान्‍छ',
  'baschha': 'बस्छ',

  // Questions
  'ke': 'के',
  'kina': 'किन',
  'kasari': 'कसरी',
  'kahile': 'कहिल्यै',
  'ko': 'को',
  'kasle': 'कसले',
  'kasko': 'कसको',
  'kasto': 'कस्तो',
  'kati': 'कति',

  // Common Nouns & Adjectives
  'nepal': 'नेपाल',
  'nepali': 'नेपाली',
  'desh': 'देश',
  'shanti': 'शान्ति',
  'bikas': 'विकास',
  'samvidhan': 'संविधान',
  'sarkar': 'सरकार',
  'janata': 'जनता',
  'samaj': 'समाज',
  'itihas': 'इतिहास',
  'sanskriti': 'संस्कृति',
  'sahitya': 'साहित्य',
  'prakriti': 'प्रकृति',
  'himal': 'हिमाल',
  'pahad': 'पहाड',
  'tarai': 'तराई',
  'nadi': 'नदी',
  'kathmandu': 'काठमाडौँ',
  'pokhara': 'पोखरा',
  'lalitpur': 'ललितपुर',
  'bhaktapur': 'भक्तपुर',

  // Food & Living
  'pani': 'पानी',
  'bhat': 'भात',
  'khana': 'खाना',
  'mitho': 'मीठो',
  'ramro': 'राम्रो',
  'naramro': 'नराम्रो',
  'thulo': 'ठूलो',
  'sano': 'सानो',
  'aaja': 'आज',
  'bholi': 'भोलि',
  'hijo': 'हिजो',
  'din': 'दिन',
  'raat': 'रात',
  'bihana': 'बिहान',
  'beluka': 'बेलुका',
  'samaya': 'समय',
  'ghar': 'घर',
  'kam': 'काम',
  'kaam': 'काम',
  'naam': 'नाम',

  // Family Relations
  'aama': 'आमा',
  'buba': 'बुबा',
  'buwa': 'बुवा',
  'dai': 'दाजु',
  'didi': 'दिदी',
  'bhai': 'भाइ',
  'bahini': 'बहिनी',
  'chhora': 'छोरा',
  'chhori': 'छोरी',
  'sathi': 'साथी',
  'mitra': 'मित्र',
  'manchhe': 'मान्छे',
  'manis': 'मानिस',

  // Tech & Modern
  'pravidhi': 'प्रविधि',
  'suchana': 'सूचना',
  'ganak': 'कम्प्युटर',
  'sankhya': 'संख्या',
  'vigyan': 'विज्ञान',
  'shiksha': 'शिक्षा',
  'swasthya': 'स्वास्थ्य',
  'jeevan': 'जीवन',
  'sapana': 'सपना',
  'prem': 'प्रेम',
  'gyan': 'ज्ञान',
};

// ─── Phonetic Rule Tables ───────────────────────────────────────────────────

const CONSONANTS: [string, string][] = [
  ['ksh', 'क्ष'], ['shh', 'ष'], ['chh', 'छ'], ['shr', 'श्र'],
  ['kh', 'ख'], ['gh', 'घ'], ['ng', 'ङ'], ['ch', 'च'], ['jh', 'झ'],
  ['Th', 'ठ'], ['Dh', 'ढ'], ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'],
  ['bh', 'भ'], ['sh', 'श'], ['tr', 'त्र'], ['gy', 'ज्ञ'], ['pr', 'प्र'],
  ['k', 'क'], ['g', 'ग'], ['j', 'ज'], ['T', 'ट'], ['D', 'ड'],
  ['N', 'ण'], ['t', 'त'], ['d', 'द'], ['n', 'न'], ['p', 'प'],
  ['f', 'फ'], ['b', 'ब'], ['m', 'म'], ['y', 'य'], ['r', 'र'],
  ['l', 'ल'], ['v', 'व'], ['w', 'व'], ['s', 'स'], ['h', 'ह'],
  ['x', 'क्ष'], ['q', 'क'], ['z', 'ज'], ['C', 'छ'], ['S', 'श'],
  ['R', 'ऋ']
];

const VOWEL_MATRAS: [string, string][] = [
  ['aai', 'ाई'], ['aau', 'ाउ'], ['aee', 'ाई'],
  ['aa', 'ा'], ['ee', 'ी'], ['oo', 'ू'], ['ai', 'ै'], ['au', 'ौ'],
  ['ri', 'ृ'],
  ['a', ''], ['i', 'ि'], ['u', 'ु'], ['e', 'े'], ['o', 'ो'],
  ['A', 'ा'], ['I', 'ी'], ['U', 'ू']
];

const VOWELS_INIT: [string, string][] = [
  ['aai', 'आई'], ['aau', 'आउ'], ['aee', 'आई'],
  ['aa', 'आ'], ['ee', 'ई'], ['oo', 'ऊ'], ['ai', 'ऐ'], ['au', 'औ'],
  ['ri', 'ऋ'],
  ['a', 'अ'], ['i', 'इ'], ['u', 'उ'], ['e', 'ए'], ['o', 'ओ'],
  ['A', 'आ'], ['I', 'ई'], ['U', 'ऊ'], ['R', 'ऋ']
];

const NUMBERS: Record<string, string> = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
};

// ─── Transliterate A Single Token / Word ────────────────────────────────────

export function transliterateWord(word: string, convertNumbers = true): string {
  if (!word) return '';

  const lower = word.toLowerCase();
  if (NEPALI_DICTIONARY[lower]) {
    return NEPALI_DICTIONARY[lower];
  }

  let res = '';
  let i = 0;
  const n = word.length;

  while (i < n) {
    const ch = word[i];

    // Numbers
    if (convertNumbers && NUMBERS[ch]) {
      res += NUMBERS[ch];
      i++;
      continue;
    }

    // Punctuation
    if (ch === '|' || (ch === '.' && (i + 1 === n || word[i + 1] === ' '))) {
      res += '।';
      i++;
      continue;
    }

    // Anusvara, Chandrabindu, Visarga
    if (ch === 'M' || ch === '*') {
      res += 'ं';
      i++;
      continue;
    }
    if (ch === '~') {
      res += 'ँ';
      i++;
      continue;
    }
    if (ch === ':') {
      res += 'ः';
      i++;
      continue;
    }

    // Check for Consonants
    let matchedC: string | null = null;
    let matchedCLen = 0;
    for (const [rom, nep] of CONSONANTS) {
      if (word.startsWith(rom, i)) {
        matchedC = nep;
        matchedCLen = rom.length;
        break;
      }
    }

    if (matchedC) {
      i += matchedCLen;

      // Check if followed by a vowel matra
      let matchedV: string | null = null;
      let matchedVLen = 0;
      for (const [rom, matra] of VOWEL_MATRAS) {
        if (word.startsWith(rom, i)) {
          matchedV = matra;
          matchedVLen = rom.length;
          break;
        }
      }

      if (matchedV !== null) {
        res += matchedC + matchedV;
        i += matchedVLen;
      } else {
        // Consonant followed by another consonant or end of word
        if (i < n && /[a-zA-Z]/.test(word[i])) {
          res += matchedC + '्';
        } else {
          res += matchedC;
        }
      }
    } else {
      // Independent Vowel
      let matchedV: string | null = null;
      let matchedVLen = 0;
      for (const [rom, nep] of VOWELS_INIT) {
        if (word.startsWith(rom, i)) {
          matchedV = nep;
          matchedVLen = rom.length;
          break;
        }
      }

      if (matchedV) {
        res += matchedV;
        i += matchedVLen;
      } else {
        res += ch;
        i++;
      }
    }
  }

  return res;
}

// ─── Transliterate Full Multi-line Paragraph or Sentence (English -> Nepali) ───

export function transliterateRomanToNepali(text: string, convertNumbers = true): string {
  if (!text) return '';

  // Tokenize preserving whitespaces, newlines, and punctuation
  return text.replace(/([a-zA-Z0-9*~:.]+)|([^\sa-zA-Z0-9*~:.]+)/g, (match, word) => {
    if (word) {
      return transliterateWord(word, convertNumbers);
    }
    return match;
  });
}

// ─── Reverse Transliteration Engine (Nepali Devanagari -> English / Roman) ────

const DEV_TO_ROM_CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'yn',
  'ट': 'T', 'ठ': 'Th', 'ड': 'D', 'ढ': 'Dh', 'ण': 'N',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'w',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy', 'श्र': 'shr'
};

const DEV_TO_ROM_MATRAS: Record<string, string> = {
  'ा': 'a',
  'ि': 'i',
  'ी': 'ee',
  'ु': 'u',
  'ू': 'oo',
  'ृ': 'ri',
  'े': 'e',
  'ै': 'ai',
  'ो': 'o',
  'ौ': 'au',
};

const DEV_TO_ROM_VOWELS: Record<string, string> = {
  'अ': 'a',
  'आ': 'aa',
  'इ': 'i',
  'ई': 'ee',
  'उ': 'u',
  'ऊ': 'oo',
  'ऋ': 'ri',
  'ए': 'e',
  'ऐ': 'ai',
  'ओ': 'o',
  'औ': 'au',
  'अं': 'am',
  'अः': 'ah',
};

const DEV_TO_ROM_NUMBERS: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

// Build high-accuracy reverse dictionary
const REVERSE_NEPALI_DICTIONARY: Record<string, string> = {};
for (const [rom, nep] of Object.entries(NEPALI_DICTIONARY)) {
  if (!REVERSE_NEPALI_DICTIONARY[nep]) {
    REVERSE_NEPALI_DICTIONARY[nep] = rom;
  }
}
REVERSE_NEPALI_DICTIONARY['नमस्ते'] = 'namaste';
REVERSE_NEPALI_DICTIONARY['नमस्कार'] = 'namaskar';
REVERSE_NEPALI_DICTIONARY['नेपाल'] = 'nepal';
REVERSE_NEPALI_DICTIONARY['नेपाली'] = 'nepali';
REVERSE_NEPALI_DICTIONARY['तपाईं'] = 'tapai';
REVERSE_NEPALI_DICTIONARY['तपाईंको'] = 'tapaiko';
REVERSE_NEPALI_DICTIONARY['तपाईंलाई'] = 'tapailai';
REVERSE_NEPALI_DICTIONARY['धन्यवाद'] = 'dhanyabad';
REVERSE_NEPALI_DICTIONARY['स्वागतम'] = 'swagatam';
REVERSE_NEPALI_DICTIONARY['खबर'] = 'khabar';
REVERSE_NEPALI_DICTIONARY['शुभ'] = 'shubha';
REVERSE_NEPALI_DICTIONARY['प्रभात'] = 'prabhat';
REVERSE_NEPALI_DICTIONARY['सन्ध्या'] = 'sandhya';
REVERSE_NEPALI_DICTIONARY['रात्रि'] = 'ratri';
REVERSE_NEPALI_DICTIONARY['घर'] = 'ghar';
REVERSE_NEPALI_DICTIONARY['कमल'] = 'kamal';
REVERSE_NEPALI_DICTIONARY['राम्रो'] = 'ramro';
REVERSE_NEPALI_DICTIONARY['मीठो'] = 'mitho';
REVERSE_NEPALI_DICTIONARY['साथी'] = 'sathi';
REVERSE_NEPALI_DICTIONARY['भाइ'] = 'bhai';
REVERSE_NEPALI_DICTIONARY['बहिनी'] = 'bahini';
REVERSE_NEPALI_DICTIONARY['दाजु'] = 'daju';
REVERSE_NEPALI_DICTIONARY['दिदी'] = 'didi';
REVERSE_NEPALI_DICTIONARY['बुबा'] = 'buba';
REVERSE_NEPALI_DICTIONARY['आमा'] = 'aama';
REVERSE_NEPALI_DICTIONARY['किताब'] = 'kitab';

export function transliterateNepaliWordToRoman(word: string): string {
  if (!word) return '';
  if (REVERSE_NEPALI_DICTIONARY[word]) {
    return REVERSE_NEPALI_DICTIONARY[word];
  }

  let res = '';
  const n = word.length;
  let i = 0;

  while (i < n) {
    const ch = word[i];

    if (DEV_TO_ROM_NUMBERS[ch]) {
      res += DEV_TO_ROM_NUMBERS[ch];
      i++;
      continue;
    }

    if (ch === '।') {
      res += '.';
      i++;
      continue;
    }

    if (ch === 'ं' || ch === 'ँ') {
      res += 'n';
      i++;
      continue;
    }

    if (ch === 'ः') {
      res += 'h';
      i++;
      continue;
    }

    if (DEV_TO_ROM_VOWELS[ch]) {
      res += DEV_TO_ROM_VOWELS[ch];
      i++;
      continue;
    }

    if (DEV_TO_ROM_CONSONANTS[ch]) {
      const romC = DEV_TO_ROM_CONSONANTS[ch];
      i++;

      const after = i < n ? word[i] : '';
      if (after === '्') {
        // Halanta cancels inherent vowel
        res += romC;
        i++;
      } else if (DEV_TO_ROM_MATRAS[after]) {
        res += romC + DEV_TO_ROM_MATRAS[after];
        i++;
      } else if (DEV_TO_ROM_CONSONANTS[after]) {
        // Followed by another consonant without halanta -> inherent 'a'
        res += romC + 'a';
      } else if (after === 'ं' || after === 'ँ') {
        res += romC + 'a';
      } else if (i === n) {
        // End of word: Nepali schwa deletion rule
        if (n <= 1) {
          res += romC + 'a';
        } else {
          res += romC;
        }
      } else {
        res += romC;
      }
      continue;
    }

    res += ch;
    i++;
  }

  return res;
}

export function transliterateNepaliToRoman(text: string): string {
  if (!text) return '';

  return text.replace(/([\u0900-\u097F0-9]+)|([^\u0900-\u097F0-9]+)/g, (match, word) => {
    if (word) {
      return transliterateNepaliWordToRoman(word);
    }
    return match;
  });
}

// ─── Unicode Cleanup & Normalization ────────────────────────────────────────

export function cleanNepaliUnicode(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove invisible zero-width joiners / non-joiners unless needed
  cleaned = cleaned.replace(/[\u200B\uFEFF]/g, '');

  // 2. Normalize full stops to Nepali Purna Viram
  cleaned = cleaned.replace(/\.{2,}/g, '।');
  cleaned = cleaned.replace(/\s*\|\s*/g, '। ');
  cleaned = cleaned.replace(/\s*\.\s+/g, '। ');

  // 3. Normalize duplicate punctuation
  cleaned = cleaned.replace(/।{2,}/g, '।');
  cleaned = cleaned.replace(/\s+([।,?!;])/g, '$1');

  // 4. Remove isolated trailing halantas before spaces
  cleaned = cleaned.replace(/्(\s+)/g, '$1');

  // 5. Clean up redundant spaces & blank lines
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

// ─── Legacy Preeti ⇄ Unicode Converters ─────────────────────────────────────

const PREETI_TO_UNICODE_MAP: Record<string, string> = {
  '~': 'ङ', '`': 'ञ', '!': '१', '@': '२', '#': '३', '$': '४', '%': '५',
  '^': '६', '&': '७', '*': '८', '(': '९', ')': '०', '-': '(', '_': ')',
  '=': '.', '+': '÷', 'q': 'त्र', 'w': 'ध', 'e': 'भ', 'r': 'च', 't': 'त',
  'y': 'थ', 'u': 'ग', 'i': 'क्ष', 'o': 'य', 'p': 'उ', '[': 'ृ', '{': 'ै',
  ']': 'े', '}': 'ै', '\\': '्', '|': '्र', 'a': 'ब', 's': 'क', 'd': 'म',
  'f': 'ा', 'g': 'न', 'h': 'ज', 'j': 'व', 'k': 'ा', 'l': 'ि', ';': 'स',
  ':': 'ः', "'": 'ु', '"': 'ू', 'z': 'श', 'x': 'ह', 'c': 'अ', 'v': 'ख',
  'b': 'द', 'n': 'ल', 'm': 'फ', ',': ',', '<': '?', '.': '।', '>': 'श्र',
  '/': 'र', '?': 'रु', 'Q': 'त्त', 'W': 'ध्', 'E': 'भ्', 'R': 'च्',
  'T': 'त्', 'Y': 'थ्', 'U': 'ग्', 'I': 'क्ष्', 'O': 'इ', 'P': 'ए',
  'A': 'ब्', 'S': 'क्', 'D': 'म्', 'F': 'ा', 'G': 'न्', 'H': 'ज्',
  'J': 'व्', 'K': 'ा', 'L': 'ी', 'Z': 'श्', 'X': 'ह्', 'C': 'ऋ',
  'V': 'ख्', 'B': 'द्', 'N': 'ल्', 'M': 'फ्'
};

const UNICODE_TO_PREETI_MAP: Record<string, string> = {};
for (const [preetiChar, uniChar] of Object.entries(PREETI_TO_UNICODE_MAP)) {
  if (!UNICODE_TO_PREETI_MAP[uniChar]) {
    UNICODE_TO_PREETI_MAP[uniChar] = preetiChar;
  }
}

export function convertPreetiToUnicode(text: string): string {
  if (!text) return '';

  let res = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    res += PREETI_TO_UNICODE_MAP[ch] !== undefined ? PREETI_TO_UNICODE_MAP[ch] : ch;
  }

  // Preeti places short 'i' matra before consonant -> reorder to Unicode
  res = res.replace(/ि([क-ह])/g, '$1ि');

  return res;
}

export function convertUnicodeToPreeti(text: string): string {
  if (!text) return '';

  // In Unicode, short 'i' is after consonant -> in Preeti it comes before as 'l'
  let prepared = text.replace(/([क-ह])ि/g, 'l$1');

  let res = '';
  for (let i = 0; i < prepared.length; i++) {
    const ch = prepared[i];
    res += UNICODE_TO_PREETI_MAP[ch] !== undefined ? UNICODE_TO_PREETI_MAP[ch] : ch;
  }

  return res;
}

// ─── Keymap Cheat Sheet Guide ───────────────────────────────────────────────

export const NEPALI_KEYMAP_GUIDE = [
  { rom: 'ka, kha, ga, gha', dev: 'क, ख, ग, घ', note: 'Velar Consonants' },
  { rom: 'cha, chha, ja, jha', dev: 'च, छ, ज, झ', note: 'Palatal Consonants' },
  { rom: 'Ta, Tha, Da, Dha', dev: 'ट, ठ, ड, ढ', note: 'Capital T & D for Retroflex' },
  { rom: 'ta, tha, da, dha', dev: 'त, थ, द, ध', note: 'Lowercase t & d for Dental' },
  { rom: 'pa, pha/fa, ba, bha, ma', dev: 'प, फ, ब, भ, म', note: 'Labial Consonants' },
  { rom: 'ya, ra, la, wa/va', dev: 'य, र, ल, व', note: 'Semivowels' },
  { rom: 'sh, shh, sa, ha', dev: 'श, ष, स, ह', note: 'Sibilants & Aspirate' },
  { rom: 'ksh/x, tr, gy, shr', dev: 'क्ष, त्र, ज्ञ, श्र', note: 'Special Conjuncts' },
  { rom: 'aa / A', dev: 'ा (आ)', note: 'Long AA matra' },
  { rom: 'i / ee', dev: 'ि / ी', note: 'Short & Long I matras' },
  { rom: 'u / oo', dev: 'ु / ू', note: 'Short & Long U matras' },
  { rom: 'ri / R', dev: 'ृ (ऋ)', note: 'Vocalic R' },
  { rom: 'e / ai', dev: 'े / ै', note: 'E and AI matras' },
  { rom: 'o / au', dev: 'ो / ौ', note: 'O and AU matras' },
  { rom: 'M or *', dev: 'ं (अं)', note: 'Anusvara dot' },
  { rom: '~', dev: 'ँ (आँ)', note: 'Chandrabindu' },
  { rom: '| or .', dev: '।', note: 'Nepali Purna Viram' },
];
