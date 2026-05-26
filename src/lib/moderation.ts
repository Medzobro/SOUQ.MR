/**
 * Content moderation — NSFW / offensive content filter for Arabic & English.
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

// ── Normalize Arabic text ─────────────────────────────────────────────
function normalizeArabic(text: string): string {
  return text
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ىيئ]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ؤو]/g, 'و')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// ── Main filter ────────────────────────────────────────────────────────
export interface ModerationResult {
  ok: boolean;
  reason?: string;
  flaggedWords?: string[];
}

export function moderateText(title: string, description?: string | null): ModerationResult {
  const text = normalizeArabic(`${title} ${description ?? ''}`.toLowerCase());
  const found: string[] = [];

  for (const word of AR_BAD_WORDS) {
    const norm = normalizeArabic(word.toLowerCase());
    if (text.includes(norm)) {
      found.push(word);
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

// ── Product status flow ────────────────────────────────────────────────
export const PRODUCT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SOLD: 'sold',
  HIDDEN: 'hidden',
} as const;
