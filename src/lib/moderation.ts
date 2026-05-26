/**
 * Content moderation — NSFW / offensive content filter for Arabic, Hassaniya,
 * French & English. Used server-side before saving products and on report reviews.
 *
 * Also includes placeholder NSFW image detection.
 */

// ── Arabic (MSA) offensive words ───────────────────────────────────────
const AR_BAD_WORDS = [
  'كس', 'طيز', 'زب', 'منيوك', 'شرموط', 'قحبة', 'عاهرة', 'ديوث',
  'خول', 'لوطي', 'فحل', 'نياك', 'متناك', 'بعبص', 'كلب', 'حمار',
  'خنزير', 'وسخ', 'زبالة', 'حقير', 'سافل', 'فاجر', 'زانية',
  'سكس', 'sex', 'porn', 'إباحي', 'إباحية', 'عري', 'nude',
  'naked', 'fuck', 'shit', 'dick', 'pussy', 'ass', 'whore',
  'slut', 'bastard', 'bitch', 'cunt', 'cock',
];

// ── Hassaniya Arabic (Mauritanian dialect) offensive words ─────────────
const HASSANIYA_BAD_WORDS = [
  'زامل',     // vulgar term equivalent to pimp / immoral person
  'گحبة',     // equivalent to whore (ـگـ = kaf with ring, dialect spelling)
  'كحبة',     // same word with regular kaf
  'قحبة',     // already in AR list, but kept here for dialect overlap
  'زاملين',   // plural of زامل
  'گحاب',     // plural of گحبة
  'كحاب',     // plural variant
  'منيوكة',   // feminine form
  'مصاص',     // vulgar
  'لحاس',     // vulgar
  'طابون',    // insult
  'بغل',      // mule (used as insult)
  'خنفوس',    // derogatory term
  'بوگلاب',   // "father of dogs"
  'ولد الكلب', // "son of a dog"
  'ولد القحبة',// "son of a whore"
  'ولد الزامل',// "son of a pimp"
  'خي',       // brother (vulgar context)
  'منايك',    // plural vulgar
];

// ── French offensive words ─────────────────────────────────────────────
const FR_BAD_WORDS = [
  // Strong profanity
  'putain', 'putain de', 'merde', 'fait chier', 'emmerder',
  'salope', 'salopard', 'saloperie',
  'connard', 'connasse',
  'enculé', 'enculer', 'enculeur',
  'pute', 'putain',
  'bâtard', 'batard',
  'pédé', 'pede', 'pédale', 'pedale',
  'tapette', 'tantouze', 'tarlouze', 'folle', 'gouine',

  // Sexual / vulgar
  'bite', 'bitte', 'queue', 'verge',
  'couille', 'couillon', 'couillonne',
  'cul', 'trou du cul', 'trouduc', 'fion',
  'chatte', 'minou', 'foufoune',
  'branler', 'branleur', 'branlette',
  'baiser', 'baise', 'baiseur', 'baisable',
  'niquer', 'nique', 'nique ta mère', 'ntm',
  'suce', 'sucer', 'suceuse',
  'pipe', 'tailler une pipe',
  'sodomie', 'sodomiser',

  // Racial / discriminatory slurs (flagged for moderation)
  'nègre', 'negre', 'négresse', 'negresse',
  'bougnoule', 'bicot', 'raton',
  'youpin', 'youpine', 'feuj',
  'chinetoque', 'niakoué', 'niakoue',
  'crouille', 'crouillat',
  'rouquin', 'rouquine', 'roux',
  'métèque', 'meteque', 'métèques',

  // General insults
  'poufiasse', 'pouffiasse',
  'grognasse', 'pétasse', 'petasse',
  'morue',
  'ordure', 'pourriture',
  'débile', 'debile', 'crétin', 'cretin', 'abruti', 'abrutie',
  'fils de pute', 'fdp',
  'ta gueule', 'tg',
  'vas te faire foutre', 'va te faire enculer',
  'mange tes morts',
];

// ── Normalize Arabic text ─────────────────────────────────────────────
function normalizeArabic(text: string): string {
  return text
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ىيئ]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ؤو]/g, 'و')
    .replace(/گ/g, 'ك')     // Hassaniya گ → ك for matching
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// ── Character substitution map (bypass detection) ──────────────────────
// Common leetspeak / substitution tricks
const SUBSTITUTION_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '2': 'z',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '6': 'g',
  '7': 't',
  '8': 'b',
  '9': 'g',
  '@': 'a',
  '$': 's',
  '!': 'i',
  '+': 't',
  '(': 'c',
  '|': 'i',
  '°': 'o',
  // Arabic character substitutions
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

function normalizeSubstitutions(text: string): string {
  return text
    .split('')
    .map((ch) => SUBSTITUTION_MAP[ch] ?? ch)
    .join('');
}

// ── Regex-based detection for spaced-out words ─────────────────────────
// Matches words where each letter is separated by one or more spaces/symbols
// e.g. "p u t a i n" or "p.u.t.a.i.n" or "p-u-t-a-i-n"
function buildSpacedRegex(word: string): RegExp {
  const chars = word.split('').map((ch) => escapeRegex(ch));
  // Allow spaces, dots, hyphens, underscores between each letter
  const pattern = chars.join('[\\s.\\-_,;:*+~]+');
  return new RegExp(pattern, 'i');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detect if a word (possibly with substitution tricks) matches any bad word.
 * Checks: direct match, substitution-normalized match, and spaced-out pattern.
 */
function detectBadWord(input: string, badWordsList: string[]): string | null {
  for (const bad of badWordsList) {
    const normBad = normalizeArabic(bad.toLowerCase());
    const normBadSub = normalizeSubstitutions(normBad);

    // Direct match (input is already lowered and normalized)
    if (input.includes(normBad)) return bad;

    // Substitution-normalized match
    const inputSub = normalizeSubstitutions(input);
    if (inputSub.includes(normBadSub)) return bad;

    // Spaced-out regex match
    const spacedRe = buildSpacedRegex(normBad);
    if (spacedRe.test(input)) return bad;
  }
  return null;
}

// ── Main filter ────────────────────────────────────────────────────────
export interface ModerationResult {
  ok: boolean;
  reason?: string;
  flaggedWords?: string[];
}

export function moderateText(title: string, description?: string | null): ModerationResult {
  const rawText = `${title} ${description ?? ''}`.toLowerCase();
  const text = normalizeArabic(rawText);
  const found: string[] = [];

  // Check all word lists
  const allLists = [
    { words: AR_BAD_WORDS, label: 'Arabic' },
    { words: HASSANIYA_BAD_WORDS, label: 'Hassaniya' },
    { words: FR_BAD_WORDS, label: 'French' },
  ];

  for (const { words } of allLists) {
    for (const word of words) {
      const detected = detectBadWord(text, [word]);
      if (detected && !found.includes(detected)) {
        found.push(detected);
      }
    }
  }

  if (found.length > 0) {
    return {
      ok: false,
      reason: 'يحتوي النص على كلمات غير لائقة. الرجاء تعديل المحتوى.',
      flaggedWords: found,
    };
  }

  return { ok: true };
}

// ── Image safety check (basic) ─────────────────────────────────────────
export function validateImageFile(
  fileName: string,
  fileSizeBytes: number,
): ModerationResult {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));

  if (!allowedExts.includes(ext)) {
    return { ok: false, reason: 'صيغة الملف غير مدعومة. استخدم JPG أو PNG أو WebP.' };
  }

  if (fileSizeBytes > 10 * 1024 * 1024) {
    return { ok: false, reason: 'حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت.' };
  }

  // Check for suspicious file names
  const suspiciousPatterns = /(porn|nude|sex|xxx|nsfw|إباح|عري|سكس)/i;
  if (suspiciousPatterns.test(fileName)) {
    return { ok: false, reason: 'اسم الملف غير لائق. الرجاء تغيير اسم الملف.' };
  }

  return { ok: true };
}

// ── NSFW image check (placeholder) ─────────────────────────────────────
/**
 * Checks a public image URL for NSFW content.
 *
 * Current implementation: pattern-based checks on the URL and file extension.
 *
 * TODO: Integrate TensorFlow.js + nsfwjs for real image content analysis.
 *   - Load @tensorflow/tfjs and nsfwjs
 *   - Fetch image as blob, decode via createImageBitmap or canvas
 *   - Classify with nsfwjs.classify(img)
 *   - Flag if 'Porn' / 'Hentai' probability > 0.6
 *
 * @param imageUrl - Public URL of the uploaded image
 * @returns ModerationResult with ok: false if suspicious patterns found
 */
export interface NSFWCheckResult {
  ok: boolean;
  reason?: string;
}

export async function checkImageNSFW(imageUrl: string): Promise<NSFWCheckResult> {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { ok: false, reason: 'رابط الصورة غير صالح.' };
  }

  // ── URL pattern checks ──────────────────────────────────────────────
  // Check for NSFW-related keywords in the URL itself
  const nsfwUrlPattern =
    /(porn|nsfw|xxx|sex|nude|naked|adult|erotic|hentai|gore|explicit|إباح|عري|سكس)/i;
  if (nsfwUrlPattern.test(imageUrl)) {
    return {
      ok: false,
      reason: 'يحتوي رابط الصورة على محتوى غير لائق.',
    };
  }

  // ── File extension validation ───────────────────────────────────────
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  const urlLower = imageUrl.toLowerCase();
  const ext = urlLower.slice(Math.max(0, urlLower.lastIndexOf('.')));

  // Strip query params from extension
  const cleanExt = ext.split('?')[0];

  if (cleanExt && !allowedExts.includes(cleanExt)) {
    return {
      ok: false,
      reason: 'صيغة الصورة غير مدعومة في الرابط.',
    };
  }

  // ── Placeholder for image content analysis ──────────────────────────
  // TODO: Integrate TensorFlow.js + nsfwjs here:
  //
  // import * as tf from '@tensorflow/tfjs';
  // import * as nsfwjs from 'nsfwjs';
  //
  // async function checkImageContent(url: string): Promise<boolean> {
  //   const model = await nsfwjs.load();
  //   const img = await loadImage(url);
  //   const predictions = await model.classify(img);
  //   const risky = predictions.find(p =>
  //     (p.className === 'Porn' || p.className === 'Hentai') && p.probability > 0.6
  //   );
  //   return !!risky;
  // }

  return { ok: true };
}

// ── Product status flow ────────────────────────────────────────────────
export const PRODUCT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SOLD: 'sold',
  HIDDEN: 'hidden',
} as const;
