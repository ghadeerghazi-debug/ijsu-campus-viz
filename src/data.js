// ============ THEME — Mobile-app blue/white ============
// Clean white surfaces, navy hero cards, vivid brand blue, neutral
// slate text. Designed to feel like a polished iOS app.
export const T = {
  // Surfaces
  bg:        '#FFFFFF',
  bgPanel:   '#F8FAFC',  // very pale slate
  bgCard:    '#FFFFFF',
  bgHover:   '#F1F5F9',
  bgLight:   '#FFFFFF',
  bgDark:    '#0F172A',  // deep navy hero
  bgMid:     '#1E293B',  // slate hero variant

  // Brand blues
  blue:      '#2563EB',
  blueLt:    '#3B82F6',
  blueDk:    '#1D4ED8',
  cyan:      '#06B6D4',
  sky:       '#0EA5E9',

  // Accents
  amber:     '#F59E0B',
  amberLt:   '#FCD34D',
  amberDk:   '#B45309',
  teal:      '#14B8A6',
  green:     '#10B981',
  coral:     '#F43F5E',
  red:       '#EF4444',
  purple:    '#A855F7',

  // Text
  text:      '#0F172A',  // deep navy
  textMuted: '#475569',  // slate
  textDim:   '#94A3B8',  // light slate
  textOnDark:'#F8FAFC',

  // Borders
  border:    '#E2E8F0',
  borderLt:  '#CBD5E1',

  // Shadows (cool blue-tinted)
  shadow:     '0 4px 16px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
  shadowDeep: '0 16px 40px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(15, 23, 42, 0.06)',
  shadowBlue: '0 8px 24px rgba(37, 99, 235, 0.18)',
};

// ============ SKY GRADIENT STOPS for FlowDiagram SVG ============
// Keeps the in-diagram sky colorful; root page stays white.
export const skySvgStops = (hour, weather) => {
  if (weather === 'cloudy')  return ['#94A3B8', '#CBD5E1'];
  if (weather === 'night' || hour < 5 || hour >= 22) return ['#0F172A', '#334155'];
  if (hour < 7)   return ['#7C3AED', '#FCD34D']; // sunrise
  if (hour < 10)  return ['#3B82F6', '#DBEAFE']; // morning
  if (hour < 15)  return ['#0EA5E9', '#F0F9FF']; // noon
  if (hour < 17)  return ['#F59E0B', '#FED7AA']; // golden
  if (hour < 19)  return ['#DC2626', '#FCD34D']; // sunset
  return ['#1E293B', '#7C3AED']; // dusk
};

// Sun position arc across SVG viewbox 0..1200 by 0..500.
// Returns null if the sun is below the horizon (night).
export const sunArc = (hour, viewW = 1200, viewH = 500) => {
  if (hour < 6 || hour > 18) return null;
  const t = (hour - 6) / 12;
  const x = 100 + t * (viewW - 200);
  const arc = Math.sin(t * Math.PI);
  const y = viewH * 0.6 - arc * (viewH * 0.45);
  return { x, y };
};

// Aerial-photo positions (% from left/top), placed by Ghadeer in
// the in-app drag editor. These are the canonical defaults; the
// editor still lets a user drag and override locally.
export const AERIAL_DEFAULTS = {
  pres1:    { x: 55.84, y: 71.77 },
  pres2:    { x: 52.39, y: 81.08 },
  admin1:   { x: 12.26, y: 84.77 },
  admin2:   { x: 16.27, y: 87.06 },
  admin3a:  { x: 18.47, y: 94.45 },
  admin3b:  { x: 23.98, y: 93.97 },
  admin4:   { x: 11.76, y: 95.77 },
  tech:     { x: 20.39, y: 76.06 },
  garage:   { x: 33.72, y: 50.57 },
  cafe:     { x: 40.69, y: 23.16 },
  sadr:     { x: 50.35, y:  9.90 },
  library:  { x: 65.05, y: 14.64 },
  pharm:    { x: 74.70, y: 18.53 },
  arts:     { x: 72.69, y: 28.12 },
};
export const aerialPos = (b) => {
  return AERIAL_DEFAULTS[b.id] || { x: 50, y: 50 };
};

// Stylized map positions — every block gets equal space on the
// dashboard SVG, so labels are readable. Centers are spaced
// ≥16 units horizontally and ≥18 vertically (uniform blocks
// render at 11% × 13%, so this leaves clear gaps). Aerial photo
// view still uses the real b.x/b.y geography.
export const MAP_POSITIONS = {
  pharm:    { cx: 12, cy: 22 },
  pres1:    { cx: 28, cy: 18 },
  pres2:    { cx: 44, cy: 18 },
  library:  { cx: 62, cy: 22 },
  arts:     { cx: 82, cy: 22 },
  tech:     { cx: 16, cy: 42 },
  admin1:   { cx: 40, cy: 36 },
  admin3a:  { cx: 58, cy: 42 },
  sadr:     { cx: 80, cy: 44 },
  garage:   { cx: 12, cy: 65 },
  admin4:   { cx: 28, cy: 60 },
  admin3b:  { cx: 44, cy: 60 },
  admin2:   { cx: 60, cy: 60 },
  cafe:     { cx: 78, cy: 67 },
};

// ============ BUILDINGS DATA ============
export const BUILDINGS = [
  {
    id: 'pres1',
    name_ar: 'رئاسة الجامعة 1',
    name_en: 'University Presidency 1',
    area: 755,
    photo: 'p000.jpg',
    aerial: null,
    x: 35, y: 22, w: 11, h: 14,
    demand_kw: 60,
    suitability: 'good',
    notes_ar: 'سطح مستوٍ كبير مع وجود برج اتصالات وخزانات مياه - يحتاج إعادة ترتيب',
  },
  {
    id: 'pres2',
    name_ar: 'رئاسة الجامعة 2',
    name_en: 'University Presidency 2',
    area: 260,
    photo: 'p002.jpg',
    aerial: 'p003.jpg',
    x: 50, y: 24, w: 7, h: 8,
    demand_kw: 25,
    suitability: 'medium',
    notes_ar: 'سطح متوسط مع قبة - يحتاج هيكل مرتفع لتفادي الظل',
  },
  {
    id: 'admin1',
    name_ar: 'إدارية ومالية 1',
    name_en: 'Administrative & Financial 1',
    area: 400,
    photo: 'p004.jpg',
    aerial: 'p005.jpg',
    x: 60, y: 35, w: 14, h: 7,
    demand_kw: 50,
    suitability: 'excellent',
    notes_ar: 'سطح مستطيل مثالي بدون عوائق - أفضل المباني للتركيب',
  },
  {
    id: 'admin2',
    name_ar: 'إدارية ومالية 2',
    name_en: 'Administrative & Financial 2',
    area: 150,
    photo: 'p006.jpg',
    aerial: 'p007.jpg',
    x: 65, y: 48, w: 6, h: 6,
    demand_kw: 20,
    suitability: 'good',
    notes_ar: 'سطح صغير لكن مفتوح بالكامل - مناسب لعدد محدود من الألواح',
  },
  {
    id: 'admin3a',
    name_ar: 'إدارية ومالية 3 (الكبير)',
    name_en: 'Administrative & Financial 3 (large)',
    area: 220,
    photo: 'p008.jpg',
    aerial: 'p009.jpg',
    x: 56, y: 47, w: 7, h: 6,
    demand_kw: 30,
    suitability: 'good',
    notes_ar: 'سطحان متجاوران مع بعض الوحدات الفنية - جودة جيدة',
  },
  {
    id: 'admin3b',
    name_ar: 'إدارية ومالية 3 (الصغير)',
    name_en: 'Administrative & Financial 3 (small)',
    area: 130,
    photo: 'p008.jpg',
    aerial: 'p010.jpg',
    x: 53, y: 50, w: 5, h: 5,
    demand_kw: 18,
    suitability: 'medium',
    notes_ar: 'سطح صغير عليه وحدات تكييف - يحتاج تخطيط دقيق',
  },
  {
    id: 'admin4',
    name_ar: 'إدارية ومالية 4',
    name_en: 'Administrative & Financial 4',
    area: 84,
    photo: 'p011.jpg',
    aerial: 'p012.jpg',
    x: 47, y: 53, w: 4, h: 4,
    demand_kw: 12,
    suitability: 'medium',
    notes_ar: 'سطح صغير محاط بنخيل - ظل محتمل في بعض الأوقات',
  },
  {
    id: 'tech',
    name_ar: 'التقنية الهندسية',
    name_en: 'Engineering Technology',
    area: 1400,
    photo: 'p013.jpg',
    aerial: 'p014.jpg',
    x: 28, y: 42, w: 18, h: 13,
    demand_kw: 110,
    suitability: 'excellent',
    notes_ar: '⭐ أكبر سطح في الحرم - يستوعب أكبر عدد من الألواح ومناسب جداً للنظام الرئيسي',
  },
  {
    id: 'garage',
    name_ar: 'الكراج',
    name_en: 'Garage',
    area: 800,
    photo: 'p015.jpg',
    aerial: 'p016.jpg',
    x: 18, y: 60, w: 14, h: 11,
    demand_kw: 30,
    suitability: 'good',
    notes_ar: 'كراج مفتوح - يمكن إضافة هيكل علوي للألواح فوق المظلة الحالية',
  },
  {
    id: 'cafe',
    name_ar: 'كافتريا',
    name_en: 'Cafeteria',
    area: 460,
    photo: 'p017.jpg',
    aerial: 'p018.jpg',
    x: 70, y: 60, w: 11, h: 8,
    demand_kw: 45,
    suitability: 'good',
    notes_ar: 'سطح مع وحدات تبريد كثيرة - يحتاج توزيع ذكي للألواح',
  },
  {
    id: 'sadr',
    name_ar: 'قاعة الشهيد الصدر',
    name_en: 'Alsader Martyr Hall',
    area: 800,
    photo: 'p019.jpg',
    aerial: 'p020.jpg',
    x: 78, y: 48, w: 14, h: 10,
    demand_kw: 50,
    suitability: 'excellent',
    notes_ar: 'سطح مستوٍ ونظيف - أفضل خيار لمشاريع التظاهرة (واضح للزوار)',
  },
  {
    id: 'library',
    name_ar: 'المكتبة المركزية',
    name_en: 'Central Library',
    area: 400,
    photo: 'p021.jpg',
    aerial: 'p022.jpg',
    x: 70, y: 25, w: 10, h: 8,
    demand_kw: 35,
    suitability: 'good',
    notes_ar: 'سطح مع غرف خدمات - يحتاج تخطيط حول الوحدات الفنية',
  },
  {
    id: 'pharm',
    name_ar: 'كلية الصيدلة',
    name_en: 'College of Pharmacy',
    area: 1300,
    photo: 'p023.jpg',
    aerial: 'p024.jpg',
    x: 13, y: 27, w: 16, h: 13,
    demand_kw: 95,
    suitability: 'excellent',
    notes_ar: '⭐ سطح كبير مغطى بالعزل الأبيض - مثالي للتركيب وتعكس الحرارة',
  },
  {
    id: 'arts',
    name_ar: 'عمادة الآداب',
    name_en: 'Faculty of Arts',
    area: 620,
    photo: 'p025.jpg',
    aerial: 'p026.jpg',
    x: 82, y: 30, w: 12, h: 9,
    demand_kw: 40,
    suitability: 'good',
    notes_ar: 'سطح واسع نسبياً مع سور حماية - مناسب للتركيب الآمن',
  },
];

// ============ POTENTIAL CALCULATIONS ============
export const calculatePotential = (area) => {
  const usableArea = area * 0.55;
  const watts_per_m2 = 180;
  return Math.round((usableArea * watts_per_m2) / 1000); // kW
};

// ============ DAILY ENERGY GENERATION CURVE ============
export const generateDayData = (totalCapacity_kw, weather = 'sunny') => {
  const data = [];
  const cloudFactor = weather === 'cloudy' ? 0.4 : weather === 'night' ? 0 : 1;

  for (let hour = 0; hour < 24; hour++) {
    let production = 0;
    if (hour >= 6 && hour <= 18) {
      const t = (hour - 12) / 6;
      production = totalCapacity_kw * Math.max(0, 1 - t * t) * cloudFactor;
    }

    let consumption = 50;
    if (hour >= 7 && hour <= 17) {
      consumption = 280 + 60 * Math.sin((hour - 7) / 10 * Math.PI);
    } else if (hour >= 18 && hour <= 22) {
      consumption = 150;
    }

    data.push({
      hour,
      production: Math.round(production),
      consumption: Math.round(consumption),
      net: Math.round(production - consumption),
    });
  }
  return data;
};

export const TOTALS = {
  totalArea: BUILDINGS.reduce((s, b) => s + b.area, 0),
  totalPotential: BUILDINGS.reduce((s, b) => s + calculatePotential(b.area), 0),
  totalDemand: BUILDINGS.reduce((s, b) => s + b.demand_kw, 0),
  buildingCount: BUILDINGS.length,
};

export const ACTUAL_DEMAND = 440;
