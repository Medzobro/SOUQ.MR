-- Seed categories (idempotent)
INSERT INTO public.categories (slug, name_ar, name_fr, name_en, icon, sort_order) VALUES
  ('electronics', 'إلكترونيات',  'Électronique',  'Electronics',  '📱', 1),
  ('cars',        'سيارات',      'Voitures',      'Vehicles',     '🚗', 2),
  ('clothing',    'ملابس',       'Vêtements',     'Clothing',     '👕', 3),
  ('real-estate', 'عقارات',      'Immobilier',    'Real Estate',  '🏠', 4),
  ('services',    'خدمات',       'Services',      'Services',     '🔧', 5),
  ('furniture',   'أثاث',        'Meubles',       'Furniture',    '🛋️', 6),
  ('jobs',        'وظائف',       'Emplois',       'Jobs',         '💼', 7),
  ('mobile',      'هواتف',       'Téléphones',    'Phones',       '📞', 8)
ON CONFLICT (slug) DO NOTHING;
