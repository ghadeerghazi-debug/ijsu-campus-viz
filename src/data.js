// ============ THEME — Sunlit Daytime ============
// Warm cream paper, sky blue, golden amber. Designed to feel like
// sunlight on architectural drawings; the page background mood-shifts
// with the simulation clock (see skyGradient below).
export const T = {
  // Surfaces (warm light)
  bg:        '#FFF8EE',  // warm cream paper
  bgPanel:   '#FFFFFF',  // pure white card (lifts on cream)
  bgCard:    '#FBF3DF',  // tinted cream for nested cards
  bgHover:   '#F4E5C2',  // peachy hover
  bgLight:   '#FFFCF3',  // pale cream surface

  // Sun energy (warm)
  amber:     '#E8893E',  // warm amber/orange — primary accent
  amberLt:   '#F5BB52',  // golden hour
  amberDk:   '#B8651E',  // deep amber

  // Sky / cool accents
  teal:      '#5C9893',  // muted teal
  cyan:      '#5DA5C2',  // muted sky cyan
  sky:       '#7AC0E8',  // bright sky blue
  green:     '#7C9F58',  // sage green

  // Warm status
  coral:     '#E07B5A',
  red:       '#C44A36',
  purple:    '#8B6BB8',

  // Text (dark warm on light)
  text:      '#2A1F14',  // warm dark brown
  textMuted: '#6F5D49',  // medium warm gray
  textDim:   '#9A8770',  // light warm gray

  // Borders
  border:    '#E5D4B0',  // warm tan border
  borderLt:  '#D2BC93',  // darker warm border

  // Shadows for cards (warm-tinted, not gray)
  shadow:    '0 4px 16px rgba(184, 101, 30, 0.10), 0 1px 3px rgba(120, 90, 50, 0.08)',
  shadowDeep:'0 12px 32px rgba(184, 101, 30, 0.18), 0 4px 8px rgba(120, 90, 50, 0.10)',
};

// ============ MOOD-SHIFTING SKY ============
// Returns a CSS background gradient for the App root, based on
// simulation hour and weather. The page literally shifts color as
// the user scrubs through the 24-hour simulation.
export const skyGradient = (hour, weather) => {
  if (weather === 'cloudy') {
    return 'linear-gradient(180deg, #BCC8D5 0%, #D8D2C4 55%, #F0E8D8 100%)';
  }
  if (weather === 'night' || hour < 5 || hour >= 22) {
    return 'linear-gradient(180deg, #1A2549 0%, #3A3863 50%, #5C4E78 90%, #826FA0 100%)';
  }
  if (hour >= 5 && hour < 7) {
    // Sunrise — purple → orange → cream
    return 'linear-gradient(180deg, #826FA0 0%, #E8893E 30%, #F5BB52 60%, #FFF1D9 100%)';
  }
  if (hour >= 7 && hour < 10) {
    // Morning
    return 'linear-gradient(180deg, #B5DBED 0%, #DDEEF7 50%, #FFF8EE 100%)';
  }
  if (hour >= 10 && hour < 15) {
    // Noon
    return 'linear-gradient(180deg, #7AC0E8 0%, #B5DBED 40%, #FFF8EE 100%)';
  }
  if (hour >= 15 && hour < 17) {
    // Golden hour
    return 'linear-gradient(180deg, #F5BB52 0%, #F8D484 50%, #FFFCF3 100%)';
  }
  if (hour >= 17 && hour < 19) {
    // Sunset
    return 'linear-gradient(180deg, #C04A38 0%, #E8893E 30%, #F5BB52 60%, #FFD9A8 100%)';
  }
  // 19-22 — Dusk
  return 'linear-gradient(180deg, #5C4E78 0%, #8E6BAA 30%, #D85C4C 70%, #F5BB52 95%, #FFD9A8 100%)';
};

// Sky gradient stops for SVG <linearGradient> use (FlowDiagram).
// Returns [topColor, bottomColor] approximations.
export const skySvgStops = (hour, weather) => {
  if (weather === 'cloudy')  return ['#BCC8D5', '#F0E8D8'];
  if (weather === 'night' || hour < 5 || hour >= 22) return ['#1A2549', '#5C4E78'];
  if (hour < 7)   return ['#826FA0', '#FFF1D9'];
  if (hour < 10)  return ['#B5DBED', '#FFF8EE'];
  if (hour < 15)  return ['#7AC0E8', '#FFF8EE'];
  if (hour < 17)  return ['#F5BB52', '#FFFCF3'];
  if (hour < 19)  return ['#C04A38', '#FFD9A8'];
  return ['#5C4E78', '#FFD9A8'];
};

// Sun position arc across SVG viewbox 0..1200 by 0..500.
// Returns null if the sun is below the horizon (night).
export const sunArc = (hour, viewW = 1200, viewH = 500) => {
  if (hour < 6 || hour > 18) return null;
  // 6am at left horizon, 12pm at top center, 6pm at right horizon
  const t = (hour - 6) / 12; // 0..1
  const x = 100 + t * (viewW - 200);
  const arc = Math.sin(t * Math.PI); // 0 at edges, 1 at noon
  const y = viewH * 0.6 - arc * (viewH * 0.45);
  return { x, y };
};

// ============ BUILDINGS DATA ============
// 13 buildings with rooftop area, position on campus map (x,y % of 1000x600 viewbox),
// estimated electrical demand, and photo references
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
// Standard: 1 m² × 0.55 (usable factor for solar) × 180 W/m² avg
// → roughly 99 W per m² (or 99 kW per 1000 m²)
export const calculatePotential = (area) => {
  const usableArea = area * 0.55;
  const watts_per_m2 = 180;
  return Math.round((usableArea * watts_per_m2) / 1000); // kW
};

// ============ DAILY ENERGY GENERATION CURVE ============
// Simulates a typical sunny day in Baghdad (24 hours)
export const generateDayData = (totalCapacity_kw, weather = 'sunny') => {
  const data = [];
  const cloudFactor = weather === 'cloudy' ? 0.4 : weather === 'night' ? 0 : 1;

  for (let hour = 0; hour < 24; hour++) {
    let production = 0;
    if (hour >= 6 && hour <= 18) {
      // Sun curve: bell-shaped peak at 12pm
      const t = (hour - 12) / 6; // -1 to +1
      production = totalCapacity_kw * Math.max(0, 1 - t * t) * cloudFactor;
    }

    // Consumption pattern (university pattern: peak during work hours)
    let consumption = 50; // base load (lights, fridges, etc.)
    if (hour >= 7 && hour <= 17) {
      consumption = 280 + 60 * Math.sin((hour - 7) / 10 * Math.PI); // peak ~12pm
    } else if (hour >= 18 && hour <= 22) {
      consumption = 150; // evening
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

// Total potential across all buildings
export const TOTALS = {
  totalArea: BUILDINGS.reduce((s, b) => s + b.area, 0),
  totalPotential: BUILDINGS.reduce((s, b) => s + calculatePotential(b.area), 0),
  totalDemand: BUILDINGS.reduce((s, b) => s + b.demand_kw, 0),
  buildingCount: BUILDINGS.length,
};

export const ACTUAL_DEMAND = 440; // university's actual peak demand per technical specs
