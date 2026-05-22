import type { Category } from '@/lib/supabase/database.types';
import type { AppLocale } from '@/i18n/routing';

export function categoryName(category: Pick<Category, 'name_ar' | 'name_fr' | 'name_en'>, locale: AppLocale): string {
  switch (locale) {
    case 'fr':
      return category.name_fr ?? category.name_ar;
    case 'en':
      return category.name_en ?? category.name_ar;
    case 'ar':
    default:
      return category.name_ar;
  }
}
