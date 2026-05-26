/**
 * Content moderation — NSFW / offensive content filter for Arabic, French & Hassaniya.
 * Used server-side before saving products and on report reviews.
 */

// ── Arabic offensive words ────────────────────────────────────────────
const AR_BAD_WORDS = [
  'كس', 'طيز', 'زب', 'منيوك', 'شرموط', 'قحبة', 'عاهرة', 'ديوث',
  'خول', 'لوطي', 'فحل', 'نياك', 'متناك', 'بعبص', 'كلب', 'حمار',
  'خنزير', 'وسخ', 'زبالة', 'حقير', 'سافل', 'فاجر', 'زانية',
  'سكس', 'sex', 'porn', 'إباحي', 'إباحية', 'عري', 'nude',
  'naked', 'fuck', 'shit', 'dick', 'pussy', 'ass', 'whore',
  'slut', 'bastard', 'bitch', 'cunt', 'cock',
];

// ── French offensive words ────────────────────────────────────────────
const FR_BAD_WORDS = [
  'putain', 'merde', 'salope', 'connard', 'enculé', 'encule', 'pute',
  'bâtard', 'batard', 'pédé', 'pede', 'bite', 'couille', 'branler',
  'niquer', 'fils de pute', 'fdp', 'ta gueule', 'tg', 'salaud',
  'poufiasse', 'trainée', 'trainee', 'pétasse', 'petasse', 'gouine',
  'tapette', 'tarlouze', 'nègre', 'negre', 'bicot', 'bougnoule',
  'pd', 'ntm', 'enfoiré', 'enfoire', 'abruti', 'débile', 'debile',
];

// ── Hassaniya Arabic (Mauritanian dialect) ───────────────────────────
const HASSANIYA_BAD_WORDS = [
  'زامل', 'گحبة', 'كحبة', 'گحاب', 'كحاب', 'منيوكة', 'منيوك',
  'مصاص', 'لحاس', 'طابون', 'بغل', 'خنفوس',
  'بوگلاب', 'بوكلاب', 'ولد الكلب', 'ولد القحبة',
  'ولد الزامل', 'بنت القحبة', 'انت بغل', 'يا زامل',
  'شرموطة', 'قحبة', 'عاهرة', 'فاجرة', 'زانية',
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
const SUBSTITUTION_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '2': 'z', '3': 'e', '4': 'a',
  '5': 's', '6': 'g', '7': 't', '8': 'b', '9': 'g',
  '@': 'a', '$': 's', '!': 'i', '+': 't', '(': 'c',
  '|': 'i',
};

function normalizeSubstitutions(text: string): string {
  let result = '';
  for (const ch of text) {
    result += SUBSTITUTION_MAP[ch] ?? ch;
  }
  return result;
}

// ── Spaced-out word detection ─────────────────────────────────────────
function buildSpacedRegex(word: string): RegExp {
  const chars = word.split('').map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(chars.join(`[\\s.\\-_,;:*+~]+`), 'i');
}

// ── Main detection function ───────────────────────────────────────────
function detectBadWord(text: string, badWords: string[]): string | null {
  const normalizedText = normalizeArabic(text);

  for (const word of badWords) {
    const norm = normalizeArabic(word.toLowerCase());

    // 1. Direct match
    if (normalizedText.includes(norm)) return word;

    // 2. Substitution-normalized match
    const subbedText = normalizeSubstitutions(normalizedText);
    const subbedWord = normalizeSubstitutions(norm);
    if (subbedText.includes(subbedWord)) return word;

    // 3. Spaced-out regex match (only for words ≥ 3 chars)
    if (norm.length >= 3) {
      const regex = buildSpacedRegex(norm);
      if (regex.test(normalizedText)) return word;
    }
  }

  return null;
}

// ── Main filter ────────────────────────────────────────────────────────
export interface ModerationResult {
  ok: boolean;
  reason?: string;
  flaggedWords?: string[];
}

const ALL_BAD_WORDS = [...AR_BAD_WORDS, ...FR_BAD_WORDS, ...HASSANIYA_BAD_WORDS];

export function moderateText(title: string, description?: string | null): ModerationResult {
  const text = `${title} ${description ?? ''}`;
  const found: string[] = [];

  // Check combined word list
  const flagged = detectBadWord(text, ALL_BAD_WORDS);
  if (flagged) found.push(flagged);

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

// ── NSFW image check ───────────────────────────────────────────────────
/**
 * Checks a public image URL for NSFW content.
 *
 * Layer 1: URL pattern matching (keywords in URL)
 * Layer 2: File extension validation
 * Layer 3: Image content analysis via sharp
 *   - Verifies image is a real image (not a disguised file)
 *   - Checks for suspicious dimensions
 *
 * Real NSFW content detection (porn/hentai) requires ML models:
 * For production use, integrate:
 *   - TensorFlow.js + nsfwjs for browser-side
 *   - OR a serverless function with sharp + external NSFW API
 *   - OR Cloudflare Workers with a pre-trained model
 *
 * @param imageUrl - Public URL of the uploaded image
 */
export interface NSFWCheckResult {
  ok: boolean;
  reason?: string;
}

export async function checkImageNSFW(imageUrl: string): Promise<NSFWCheckResult> {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { ok: false, reason: 'رابط الصورة غير صالح.' };
  }

  // ── Layer 1: URL pattern checks ─────────────────────────────────────
  const nsfwUrlPattern =
    /(porn|nsfw|xxx|sex|nude|naked|adult|erotic|hentai|gore|explicit|sexy|fuck| dick|pussy|boobs|tits|إباح|عري|سكس|جنس)/i;
  if (nsfwUrlPattern.test(imageUrl)) {
    return {
      ok: false,
      reason: 'يحتوي رابط الصورة على محتوى غير لائق.',
    };
  }

  // ── Layer 2: File extension validation ──────────────────────────────
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  const urlLower = imageUrl.toLowerCase();
  const lastDot = urlLower.lastIndexOf('.');
  if (lastDot === -1) {
    return { ok: false, reason: 'رابط الصورة لا يحتوي على امتداد صالح.' };
  }
  const ext = urlLower.slice(lastDot);
  const cleanExt = ext.split('?')[0];

  if (cleanExt && !allowedExts.includes(cleanExt)) {
    return {
      ok: false,
      reason: 'صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP.',
    };
  }

  // ── Layer 3: Image content validation via fetch + sharp ─────────────
  try {
    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      return { ok: false, reason: 'تعذر الوصول إلى الصورة للتحقق منها.' };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return {
        ok: false,
        reason: 'الملف ليس صورة حقيقية. تم رفضه.',
      };
    }

    // Get file size from headers
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > 10 * 1024 * 1024) {
        return { ok: false, reason: 'حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت.' };
      }
    }

    // Use sharp to validate image content (sharp is already installed)
    try {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { default: sharp } = await import('sharp');
      const metadata = await sharp(buffer).metadata();

      if (!metadata.width || !metadata.height) {
        return { ok: false, reason: 'تعذر قراءة أبعاد الصورة.' };
      }

      // Reject suspiciously small images (likely spam/placeholder)
      if (metadata.width < 50 || metadata.height < 50) {
        return { ok: false, reason: 'أبعاد الصورة صغيرة جداً.' };
      }

      // Reject extremely large images (likely raw/stolen content)
      if (metadata.width > 8000 || metadata.height > 8000) {
        return { ok: false, reason: 'أبعاد الصورة كبيرة جداً.' };
      }

    } catch {
      // sharp failed to decode — likely a corrupted or disguised file
      return {
        ok: false,
        reason: 'الملف ليس صورة صالحة. تم رفضه.',
      };
    }
  } catch {
    // Network error or timeout — allow through (don't block legitimate uploads
    // due to transient network issues)
    console.warn('[checkImageNSFW] Network error fetching image for validation, allowing through');
  }

  return { ok: true };
}

// ── Product status flow ────────────────────────────────────────────────
export const PRODUCT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SOLD: 'sold',
  HIDDEN: 'hidden',
} as const;
