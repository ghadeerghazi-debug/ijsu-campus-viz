import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun, Map, Activity, Building2, Zap, Battery, Cloud, Moon,
  X, Play, Pause, Info,
  Sparkles, Eye, Maximize2, Satellite, Tag, LayoutGrid
} from 'lucide-react';
import { T, BUILDINGS, calculatePotential, generateDayData, TOTALS, ACTUAL_DEMAND, skySvgStops, sunArc, aerialPos } from './data';

// =================================================================
// MAIN APP
// =================================================================
export default function App() {
  const [view, setView] = useState('map'); // 'map' | 'flow'
  const [hour, setHour] = useState(12);
  const [weather, setWeather] = useState('sunny');

  return (
    <div dir="rtl" lang="ar" className="app-shell">
      <Sidebar view={view} setView={setView} />
      <main className="app-main">
        {view === 'map' && <CampusMap />}
        {view === 'aerial' && <AerialView />}
        {view === 'flow' && <EnergyFlow hour={hour} setHour={setHour} weather={weather} setWeather={setWeather} />}
      </main>
    </div>
  );
}

// =================================================================
// SIDEBAR
// =================================================================
function Sidebar({ view, setView }) {
  const items = [
    { id: 'map',    label: 'خريطة الحرم',  sub: 'Campus Map',   icon: Map },
    { id: 'aerial', label: 'العرض الجوي',  sub: 'Aerial View',   icon: Satellite },
    { id: 'flow',   label: 'تدفق الطاقة',  sub: 'Energy Flow',   icon: Activity },
  ];
  return (
    <aside className="app-sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Sun size={22} color={T.amberLt} strokeWidth={2.5} />
        </div>
        <div className="brand-text">
          <div className="brand-title">منظومة الطاقة الشمسية</div>
          <div className="brand-sub">جامعة الإمام الصادق</div>
        </div>
      </div>

      <div className="sidebar-section-label">القوائم</div>
      <nav className="sidebar-nav">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`nav-item ${active ? 'is-active' : ''}`}
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <Icon size={20} strokeWidth={2} />
              <div className="nav-label">
                <span>{item.label}</span>
                <span className="nav-sub">{item.sub}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-stat">
          <div className="footer-stat-value">14</div>
          <div className="footer-stat-label">مبنى</div>
        </div>
        <div className="footer-stat">
          <div className="footer-stat-value">1.7</div>
          <div className="footer-stat-label">ميجاواط</div>
        </div>
      </div>
    </aside>
  );
}

// =================================================================
// HERO CARD — dark navy feature panel
// =================================================================
function HeroCard({ eyebrow, title, subtitle, statValue, statLabel }) {
  return (
    <div className="hero-card">
      <div className="hero-content">
        <div className="hero-text">
          {eyebrow && <div className="hero-eyebrow">{eyebrow}</div>}
          <h1 className="hero-title">{title}</h1>
          {subtitle && <p className="hero-sub">{subtitle}</p>}
        </div>
        {statValue !== undefined && (
          <div className="hero-stat">
            <div className="hero-stat-value">{statValue}</div>
            {statLabel && <div className="hero-stat-label">{statLabel}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// =================================================================
// AERIAL VIEW — interactive markers on real Google Earth photo
// =================================================================
function AerialView() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [showLabels, setShowLabels] = useState(false);
  const [showPanels, setShowPanels] = useState(true);
  const [filter, setFilter] = useState('all');

  const colorMap = { excellent: T.green, good: T.amber, medium: T.coral };
  const filtered = useMemo(() => {
    if (filter === 'all') return BUILDINGS;
    return BUILDINGS.filter(b => b.suitability === filter);
  }, [filter]);

  return (
    <div className="fade-in">
      <HeroCard
        eyebrow="عرض جوي تفاعلي"
        title="الصورة الفعلية للحرم"
        subtitle="اضغط على أي علامة لعرض تفاصيل المبنى وصورة سطحه. كل دائرة تمثل مبنى من المباني الـ14، ولونها يعكس مدى ملاءمته للتركيب."
        statValue={TOTALS.buildingCount}
        statLabel="مبنى محدد"
      />

      <div className="aerial-controls">
        <button onClick={() => setShowLabels(s => !s)} className={`aerial-toggle ${showLabels ? 'is-on' : ''}`}>
          <Tag size={14} strokeWidth={2.2} />
          {showLabels ? 'إخفاء الأسماء' : 'عرض الأسماء'}
        </button>
        <button onClick={() => setShowPanels(s => !s)} className={`aerial-toggle ${showPanels ? 'is-on' : ''}`}>
          <LayoutGrid size={14} strokeWidth={2.2} />
          {showPanels ? 'إخفاء الألواح المقترحة' : 'عرض الألواح المقترحة'}
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: T.textDim, fontWeight: 600, letterSpacing: '0.05em' }}>تصفية:</span>
          {[
            { id: 'all', label: 'الكل', color: T.textMuted },
            { id: 'excellent', label: 'ممتاز', color: T.green },
            { id: 'good', label: 'جيد', color: T.amber },
            { id: 'medium', label: 'متوسط', color: T.coral },
          ].map(f => {
            const active = filter === f.id;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding: '7px 12px', fontSize: '11px',
                background: active ? f.color : 'transparent',
                color: active ? '#FFFFFF' : f.color,
                border: `1px solid ${f.color}`,
                borderRadius: '8px', cursor: 'pointer', fontWeight: 700,
                fontFamily: '"Reem Kufi", sans-serif',
                transition: 'all 0.15s ease',
              }}>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="aerial-canvas">
        <img src="./photos/campus-aerial.jpg" alt="Aerial view of IJSU campus" />
        <div className="aerial-watermark">IJSU · Google Earth</div>

        {BUILDINGS.map((b, idx) => {
          const pos = aerialPos(b);
          const isVisible = filtered.includes(b);
          const isSelected = selected?.id === b.id;
          const isHovered = hovered?.id === b.id;
          const color = colorMap[b.suitability];
          const rank = idx + 1;

          return (
            <div
              key={b.id}
              className={`pin ${isSelected ? 'is-selected' : ''}`}
              style={{
                top: `${pos.y}%`,
                insetInlineStart: `${pos.x}%`,
                opacity: isVisible ? 1 : 0.18,
                animationDelay: `${idx * 35}ms`,
                '--c': color,
                pointerEvents: isVisible ? 'auto' : 'none',
              }}
              onClick={() => setSelected(b)}
              onMouseEnter={() => setHovered(b)}
              onMouseLeave={() => setHovered(null)}
            >
              {showPanels && isVisible && <div className="pin-panel-ring" />}
              <div className="pin-dot" style={{ background: color }}>
                {rank}
              </div>
              {(showLabels || isHovered) && (
                <div className="pin-label">
                  {b.name_ar} · {calculatePotential(b.area)} ك.و
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{
        textAlign: 'center', fontSize: '12px', color: T.textDim,
        marginTop: '14px', fontStyle: 'italic'
      }}>
        مواقع العلامات تقريبية — يمكن تعديلها لتطابق المباني تماماً
      </p>

      {selected && <BuildingDetail building={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// =================================================================
// CAMPUS MAP VIEW
// =================================================================
function CampusMap() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [showPanels, setShowPanels] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'excellent' | 'good' | 'medium'

  const filteredBuildings = useMemo(() => {
    if (filter === 'all') return BUILDINGS;
    return BUILDINGS.filter(b => b.suitability === filter);
  }, [filter]);

  return (
    <div className="fade-in">
      <HeroCard
        eyebrow="خريطة الحرم"
        title="14 مبنى · 9,659 م²"
        subtitle="استعراض جميع مباني الجامعة مع تفاصيل كل سطح، الإمكانية الكهربائية، والملاحظات الهندسية للتركيب."
        statValue={`~${TOTALS.totalPotential}`}
        statLabel="ك.و إمكانية"
      />

      {/* Quick stats band */}
      <div className="stagger" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px', marginBottom: '24px',
      }}>
        <StatTile icon={Building2} label="عدد المباني" value={TOTALS.buildingCount} unit="مبنى" color={T.cyan} />
        <StatTile icon={Maximize2} label="إجمالي مساحة الأسطح" value={TOTALS.totalArea.toLocaleString('ar')} unit="م²" color={T.teal} />
        <StatTile icon={Zap} label="الإمكانية الكهربائية" value={`~${TOTALS.totalPotential.toLocaleString('ar')}`} unit="ك.و" color={T.amber} highlight />
        <StatTile icon={Activity} label="الطلب الفعلي" value={ACTUAL_DEMAND} unit="ك.و فقط" color={T.coral} />
      </div>

      {/* Insight callout */}
      <div style={{
        background: `linear-gradient(135deg, ${T.blue}10, ${T.cyan}08)`,
        border: `1px solid ${T.blue}33`,
        borderRadius: '16px',
        padding: '18px 22px',
        marginBottom: '24px',
        display: 'flex', gap: '14px', alignItems: 'flex-start',
        boxShadow: T.shadow,
      }}>
        <div style={{
          width: '38px', height: '38px',
          borderRadius: '10px',
          background: `linear-gradient(135deg, ${T.blue}, ${T.blueLt})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
        }}>
          <Sparkles size={18} color="#FFFFFF" strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontFamily: '"Reem Kufi", sans-serif', fontWeight: 700, fontSize: '14px', color: T.blueDk, marginBottom: '4px' }}>
            ملاحظة استراتيجية
          </div>
          <p style={{ fontSize: '13px', color: T.text, lineHeight: 1.7 }}>
            الإمكانية النظرية للأسطح ({TOTALS.totalPotential.toLocaleString('ar')} ك.و) تفوق احتياج الجامعة الفعلي ({ACTUAL_DEMAND} ك.و) بنسبة <span style={{ color: T.blue, fontWeight: 700 }}>{Math.round((TOTALS.totalPotential / ACTUAL_DEMAND - 1) * 100)}%</span>.
            <br />هذا يعني أنه بالإمكان تغطية الحاجة باستخدام <span style={{ color: T.blue, fontWeight: 700 }}>أكبر 4-5 مباني فقط</span>، مع توفير الباقي للتوسعات المستقبلية أو بيع الفائض للشبكة الوطنية.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px',
        background: T.bgPanel, padding: '16px', borderRadius: '12px',
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
      }}>
        <Toggle on={showPanels} setOn={setShowPanels} label="عرض الألواح الشمسية" icon={Sun} />
        <Toggle on={showLabels} setOn={setShowLabels} label="عرض التسميات" icon={Eye} />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: T.textMuted }}>تصفية:</span>
          {[
            { id: 'all', label: 'الكل', color: T.textMuted },
            { id: 'excellent', label: 'ممتاز ⭐', color: T.green },
            { id: 'good', label: 'جيد', color: T.amber },
            { id: 'medium', label: 'متوسط', color: T.coral },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '6px 12px', fontSize: '12px',
              background: filter === f.id ? f.color : 'transparent',
              color: filter === f.id ? T.bg : f.color,
              border: `1px solid ${f.color}`,
              borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main map area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Map */}
        <div style={{
          background: T.bgPanel, borderRadius: '16px',
          border: `1px solid ${T.border}`,
          padding: '20px', position: 'relative',
          boxShadow: T.shadow,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontFamily: '"Amiri", serif', fontSize: '20px', fontWeight: 700, color: T.text }}>
                خريطة الحرم الجامعي
              </h2>
              <p style={{ fontSize: '12px', color: T.textMuted, marginTop: '2px' }}>
                اضغط على أي مبنى لعرض تفاصيله الكاملة والصور
              </p>
            </div>
            <LegendItem />
          </div>

          <CampusSVG
            buildings={filteredBuildings}
            allBuildings={BUILDINGS}
            selected={selected}
            setSelected={setSelected}
            hovered={hovered}
            setHovered={setHovered}
            showPanels={showPanels}
            showLabels={showLabels}
          />
        </div>

        {/* Side panel: ranked list */}
        <BuildingRankings buildings={BUILDINGS} setSelected={setSelected} />
      </div>

      {/* Detail modal */}
      {selected && <BuildingDetail building={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// =================================================================
// STAT TILE
// =================================================================
function StatTile({ icon: Icon, label, value, unit, color, highlight }) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${color}22, ${color}08), ${T.bgPanel}` : T.bgPanel,
      border: `1px solid ${highlight ? color + '66' : T.border}`,
      borderRadius: '12px', padding: '16px',
      boxShadow: T.shadow,
      position: 'relative', overflow: 'hidden',
    }}>
      {highlight && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '60px', height: '60px',
          background: `radial-gradient(circle, ${color}33, transparent)`,
          opacity: 0.6,
        }} />
      )}
      <div style={{
        width: '36px', height: '36px',
        background: color + '22',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '10px',
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: '11px', color: T.textMuted, fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
        <span style={{
          fontFamily: '"Amiri", serif', fontSize: '24px', fontWeight: 700, color: T.text
        }}>{value}</span>
        <span style={{ fontSize: '11px', color: T.textMuted }}>{unit}</span>
      </div>
    </div>
  );
}

function Toggle({ on, setOn, label, icon: Icon }) {
  return (
    <button onClick={() => setOn(!on)} style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 12px',
      background: on ? T.amber + '22' : 'transparent',
      color: on ? T.amber : T.textMuted,
      border: `1px solid ${on ? T.amber : T.border}`,
      borderRadius: '8px', cursor: 'pointer',
      fontSize: '12px', fontWeight: 600,
    }}>
      <Icon size={14} />
      {label}
    </button>
  );
}

function LegendItem() {
  return (
    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: T.textMuted }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ width: '10px', height: '10px', background: T.green, borderRadius: '2px' }} />
        <span>ممتاز</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ width: '10px', height: '10px', background: T.amber, borderRadius: '2px' }} />
        <span>جيد</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <div style={{ width: '10px', height: '10px', background: T.coral, borderRadius: '2px' }} />
        <span>متوسط</span>
      </div>
    </div>
  );
}

// =================================================================
// CAMPUS SVG MAP (top-down stylized)
// =================================================================
function CampusSVG({ buildings, allBuildings, selected, setSelected, hovered, setHovered, showPanels, showLabels }) {
  const W = 1200, H = 750;

  return (
    <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', background: '#EFF6FF' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Ground gradient — campus terrain (cool slate) */}
        <defs>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#BFDBFE" />
          </linearGradient>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={T.amber} stopOpacity="1" />
            <stop offset="50%" stopColor={T.amberLt} stopOpacity="0.5" />
            <stop offset="100%" stopColor={T.amberLt} stopOpacity="0" />
          </radialGradient>
          <pattern id="solar-pattern" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#3F7CAD" fillOpacity="0.85" />
            <line x1="0" y1="0" x2="6" y2="0" stroke="#FFF8EE" strokeWidth="0.5" />
            <line x1="3" y1="0" x2="3" y2="6" stroke="#FFF8EE" strokeWidth="0.3" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="url(#ground)" />

        {/* Decorative compass/sun (top-left) */}
        <g transform="translate(80, 80)" opacity="0.5">
          <circle r="50" fill="url(#sun-glow)" className="pulse-anim" />
          <circle r="20" fill={T.amber} opacity="0.8" />
          <g className="spin-slow">
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <line key={angle} x1="0" y1="-30" x2="0" y2="-44"
                stroke={T.amberLt} strokeWidth="2"
                transform={`rotate(${angle})`} strokeLinecap="round" />
            ))}
          </g>
        </g>

        {/* Roads/paths (decorative) */}
        <g opacity="0.3" stroke={T.borderLt} strokeWidth="1.5" strokeDasharray="4 4" fill="none">
          <path d={`M 50 ${H * 0.4} L ${W - 50} ${H * 0.4}`} />
          <path d={`M ${W * 0.4} 50 L ${W * 0.4} ${H - 50}`} />
          <path d={`M ${W * 0.7} 50 L ${W * 0.7} ${H - 50}`} />
        </g>

        {/* Trees (decorative, scattered) */}
        {[
          [W * 0.05, H * 0.15], [W * 0.04, H * 0.5], [W * 0.06, H * 0.85],
          [W * 0.95, H * 0.18], [W * 0.96, H * 0.55], [W * 0.94, H * 0.82],
          [W * 0.5, H * 0.9], [W * 0.25, H * 0.92],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx}, ${cy})`} opacity="0.4">
            <circle r="14" fill={T.green} />
            <circle r="8" cx="-4" cy="-3" fill={T.green} />
            <circle r="6" cx="5" cy="2" fill={T.green} />
          </g>
        ))}

        {/* Buildings */}
        {allBuildings.map(b => {
          const isVisible = buildings.includes(b);
          const isSelected = selected?.id === b.id;
          const isHovered = hovered?.id === b.id;
          return (
            <BuildingShape
              key={b.id} b={b} W={W} H={H}
              isVisible={isVisible}
              isSelected={isSelected}
              isHovered={isHovered}
              onClick={() => setSelected(b)}
              onMouseEnter={() => setHovered(b)}
              onMouseLeave={() => setHovered(null)}
              showPanels={showPanels}
              showLabels={showLabels}
            />
          );
        })}

        {/* Hover info */}
        {hovered && (
          <g style={{ pointerEvents: 'none' }}>
            <rect
              x={W * (hovered.x / 100) + W * (hovered.w / 100) / 2 - 90}
              y={H * (hovered.y / 100) - 50}
              width="180" height="40" rx="6"
              fill="#FFFFFF" stroke={T.amber} strokeWidth="1.5"
              opacity="0.97"
            />
            <text
              x={W * (hovered.x / 100) + W * (hovered.w / 100) / 2}
              y={H * (hovered.y / 100) - 30}
              textAnchor="middle" fontSize="14" fontWeight="700" fill={T.text}
              fontFamily='"Tajawal", sans-serif'
            >
              {hovered.name_ar}
            </text>
            <text
              x={W * (hovered.x / 100) + W * (hovered.w / 100) / 2}
              y={H * (hovered.y / 100) - 16}
              textAnchor="middle" fontSize="11" fill={T.amberDk}
              fontFamily='"Tajawal", sans-serif'
            >
              {hovered.area} م² · {calculatePotential(hovered.area)} ك.و إمكانية
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// =================================================================
// BUILDING SHAPE
// =================================================================
function BuildingShape({ b, W, H, isVisible, isSelected, isHovered, onClick, onMouseEnter, onMouseLeave, showPanels, showLabels }) {
  const x = W * (b.x / 100);
  const y = H * (b.y / 100);
  const w = W * (b.w / 100);
  const h = H * (b.h / 100);

  const colorMap = { excellent: T.green, good: T.amber, medium: T.coral };
  const color = colorMap[b.suitability];

  const opacity = !isVisible ? 0.15 : 1;
  const scale = isHovered || isSelected ? 1.04 : 1;
  const transformOrigin = `${x + w/2}px ${y + h/2}px`;

  return (
    <g
      style={{
        cursor: 'pointer',
        transform: `scale(${scale})`,
        transformOrigin,
        transition: 'transform 0.2s',
        opacity,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Building shadow — warm-tinted */}
      <rect x={x + 5} y={y + 6} width={w} height={h} rx="3" fill="#5C3A1A" opacity="0.18" />

      {/* Building roof */}
      <rect
        x={x} y={y} width={w} height={h} rx="3"
        fill={isSelected ? '#FFFCF3' : '#FFFFFF'}
        stroke={isSelected ? color : T.borderLt}
        strokeWidth={isSelected ? 3 : 1.5}
      />

      {/* Solar panels overlay */}
      {showPanels && isVisible && (
        <g>
          <rect
            x={x + 4} y={y + 4} width={w - 8} height={h - 8} rx="2"
            fill="url(#solar-pattern)"
            opacity={0.7}
          />
          {/* Highlight glow */}
          <rect
            x={x} y={y} width={w} height={h} rx="3"
            fill="none" stroke={color} strokeWidth="0.5" opacity="0.4"
          />
        </g>
      )}

      {/* Suitability indicator dot */}
      <circle
        cx={x + w - 8} cy={y + 8} r="4"
        fill={color}
        className={isVisible ? 'pulse-anim' : ''}
      />

      {/* Label */}
      {showLabels && (
        <g style={{ pointerEvents: 'none' }}>
          <text
            x={x + w/2} y={y + h/2 - 2}
            textAnchor="middle" fontSize="11" fontWeight="700"
            fill={T.text} fontFamily='"Tajawal", sans-serif'
          >
            {b.name_ar.length > 15 ? b.name_ar.substring(0, 14) + '…' : b.name_ar}
          </text>
          <text
            x={x + w/2} y={y + h/2 + 11}
            textAnchor="middle" fontSize="9"
            fill={color} fontFamily='"Tajawal", sans-serif' fontWeight="600"
          >
            {b.area} م² · {calculatePotential(b.area)} ك.و
          </text>
        </g>
      )}
    </g>
  );
}

// =================================================================
// BUILDING RANKINGS SIDEBAR
// =================================================================
function BuildingRankings({ buildings, setSelected }) {
  const sorted = useMemo(() => [...buildings].sort((a, b) => calculatePotential(b.area) - calculatePotential(a.area)), [buildings]);

  return (
    <div style={{
      background: T.bgPanel,
      border: `1px solid ${T.border}`,
      borderRadius: '16px',
      padding: '16px',
      maxHeight: '850px',
      overflow: 'auto',
      boxShadow: T.shadow,
    }}>
      <h3 style={{ fontFamily: '"Reem Kufi", sans-serif', fontWeight: 600, fontSize: '15px', color: T.text, marginBottom: '4px' }}>
        ترتيب المباني حسب الإمكانية
      </h3>
      <p style={{ fontSize: '11px', color: T.textMuted, marginBottom: '16px' }}>
        من الأكبر إلى الأصغر · بالكيلوواط
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sorted.map((b, i) => {
          const potential = calculatePotential(b.area);
          const colorMap = { excellent: T.green, good: T.amber, medium: T.coral };
          const color = colorMap[b.suitability];
          const cumulative = sorted.slice(0, i + 1).reduce((s, x) => s + calculatePotential(x.area), 0);
          const reachedTarget = cumulative >= ACTUAL_DEMAND;
          const prevReached = i > 0 && sorted.slice(0, i).reduce((s, x) => s + calculatePotential(x.area), 0) >= ACTUAL_DEMAND;
          const isCriticalRow = reachedTarget && !prevReached;

          return (
            <button key={b.id} onClick={() => setSelected(b)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px',
              background: isCriticalRow ? T.amber + '15' : T.bgCard,
              border: `1px solid ${isCriticalRow ? T.amber + '66' : T.border}`,
              borderRadius: '8px', cursor: 'pointer',
              textAlign: 'right', fontFamily: 'inherit', color: T.text,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
            onMouseLeave={e => e.currentTarget.style.background = isCriticalRow ? T.amber + '15' : T.bgCard}
            >
              <span style={{
                width: '24px', height: '24px',
                background: color + '33', color: color,
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.name_ar}
                </div>
                <div style={{ fontSize: '10px', color: T.textMuted, marginTop: '2px' }}>
                  {b.area} م² · تراكمي: {cumulative} ك.و
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: color }}>
                  {potential}
                </div>
                <div style={{ fontSize: '9px', color: T.textDim }}>ك.و</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{
        marginTop: '16px', padding: '12px',
        background: T.amber + '15',
        border: `1px solid ${T.amber}44`,
        borderRadius: '8px',
      }}>
        <div style={{ fontSize: '11px', color: T.amberLt, fontWeight: 600, marginBottom: '4px' }}>
          🎯 لتغطية الحاجة الفعلية ({ACTUAL_DEMAND} ك.و)
        </div>
        <div style={{ fontSize: '11px', color: T.textMuted, lineHeight: 1.6 }}>
          يكفي تركيب الألواح على أكبر <span style={{ color: T.amber, fontWeight: 700 }}>5-6 مباني</span> فقط من أصل 13.
        </div>
      </div>
    </div>
  );
}

// =================================================================
// BUILDING DETAIL MODAL
// =================================================================
function BuildingDetail({ building, onClose }) {
  const colorMap = { excellent: T.green, good: T.amber, medium: T.coral };
  const color = colorMap[building.suitability];
  const labelMap = { excellent: 'ممتاز للتركيب ⭐', good: 'جيد للتركيب', medium: 'مناسب مع تخطيط' };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      className="fade-in"
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: '#FFFFFF', borderRadius: '24px',
        maxWidth: '900px', width: '100%', maxHeight: '90vh',
        overflow: 'auto',
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowDeep,
        position: 'relative',
      }}>
        {/* Header strip */}
        <div style={{
          background: `linear-gradient(135deg, ${color}, ${color}88)`,
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.8)',
              letterSpacing: '0.15em', fontWeight: 600, marginBottom: '4px',
            }}>
              {labelMap[building.suitability]}
            </div>
            <h2 style={{
              fontFamily: '"Amiri", serif', fontWeight: 700, fontSize: '28px',
              color: T.bg, lineHeight: 1.1,
            }}>
              {building.name_ar}
            </h2>
            <p style={{ fontSize: '13px', color: T.bg, opacity: 0.85, marginTop: '4px', fontStyle: 'italic' }}>
              {building.name_en}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: '36px', height: '36px',
            background: 'rgba(0,0,0,0.3)', color: T.bg,
            border: 'none', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Photos grid */}
          <div style={{ display: 'grid', gridTemplateColumns: building.aerial ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: T.textMuted, marginBottom: '6px', fontWeight: 600 }}>صورة السطح الفعلية</div>
              <img
                src={`./photos/${building.photo}`}
                alt={building.name_ar}
                style={{
                  width: '100%', borderRadius: '10px',
                  border: `1px solid ${T.border}`,
                  aspectRatio: '4/3', objectFit: 'cover',
                  background: T.bg,
                }}
              />
            </div>
            {building.aerial && (
              <div>
                <div style={{ fontSize: '11px', color: T.textMuted, marginBottom: '6px', fontWeight: 600 }}>لقطة جوية (Google Earth)</div>
                <img
                  src={`./photos/${building.aerial}`}
                  alt={`${building.name_ar} aerial`}
                  style={{
                    width: '100%', borderRadius: '10px',
                    border: `1px solid ${T.border}`,
                    aspectRatio: '4/3', objectFit: 'cover',
                    background: T.bg,
                  }}
                />
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <DetailStat label="مساحة السطح" value={building.area.toLocaleString('ar')} unit="م²" color={T.cyan} />
            <DetailStat label="الإمكانية" value={calculatePotential(building.area)} unit="ك.و" color={T.amber} highlight />
            <DetailStat label="الطلب التقديري" value={building.demand_kw} unit="ك.و" color={T.teal} />
            <DetailStat label="عدد الألواح المقترحة" value={Math.floor(building.area * 0.55 / 2)} unit="لوح" color={T.purple} />
          </div>

          {/* Notes */}
          <div style={{
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRight: `4px solid ${color}`,
            borderRadius: '10px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Info size={18} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '12px', color: color, fontWeight: 600, marginBottom: '4px' }}>
                  ملاحظات تركيب
                </div>
                <p style={{ fontSize: '13px', color: T.text, lineHeight: 1.7 }}>
                  {building.notes_ar}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailStat({ label, value, unit, color, highlight }) {
  return (
    <div style={{
      background: highlight ? color + '15' : T.bgCard,
      border: `1px solid ${highlight ? color + '44' : T.border}`,
      borderRadius: '10px',
      padding: '12px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '10px', color: T.textMuted, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: '"Amiri", serif', fontSize: '22px', fontWeight: 700, color: highlight ? color : T.text, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '10px', color: T.textDim, marginTop: '2px' }}>{unit}</div>
    </div>
  );
}

// =================================================================
// ENERGY FLOW VIEW
// =================================================================
function EnergyFlow({ hour, setHour, weather, setWeather }) {
  const [autoplay, setAutoplay] = useState(false);

  const totalCapacity = 500; // kW (using Qalaat best-fit)
  const dayData = useMemo(() => generateDayData(totalCapacity, weather), [weather]);
  const current = dayData[hour];

  // Autoplay
  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setHour(h => (h + 1) % 24);
    }, 600);
    return () => clearInterval(interval);
  }, [autoplay, setHour]);

  const isDaytime = current.production > 0;
  const isProducing = current.production > 0;
  const isExcess = current.production > current.consumption;
  const batteryFlow = isExcess ? 'charging' : isProducing ? 'partial' : 'discharging';

  return (
    <div className="fade-in">
      <HeroCard
        eyebrow="تدفق الطاقة"
        title="محاكاة على مدار 24 ساعة"
        subtitle="استخدم شريط الوقت لمشاهدة كيف تتدفق الطاقة من الألواح إلى البطاريات والمباني — مع تغير حالة الجو والشمس."
        statValue={`${String(hour).padStart(2, '0')}:00`}
        statLabel={weather === 'cloudy' ? 'غائم' : weather === 'night' ? 'ليل' : 'مشمس'}
      />

      {/* Time controls */}
      <div style={{
        background: T.bgPanel, borderRadius: '16px', padding: '20px',
        border: `1px solid ${T.border}`, marginBottom: '20px',
        boxShadow: T.shadow,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => setAutoplay(!autoplay)} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px',
            background: autoplay ? `linear-gradient(135deg, ${T.blue}, ${T.blueLt})` : T.bgPanel,
            color: autoplay ? '#FFFFFF' : T.text,
            border: `1px solid ${autoplay ? T.blue : T.border}`,
            borderRadius: '12px', cursor: 'pointer',
            fontWeight: 700, fontSize: '13px',
            fontFamily: '"Reem Kufi", sans-serif',
            boxShadow: autoplay ? '0 6px 14px rgba(37, 99, 235, 0.30)' : 'none',
            transition: 'all 0.18s ease',
          }}>
            {autoplay ? <Pause size={16} /> : <Play size={16} />}
            {autoplay ? 'إيقاف' : 'تشغيل تلقائي'}
          </button>

          <div style={{
            fontFamily: '"Reem Kufi", sans-serif', fontSize: '32px', fontWeight: 700,
            color: T.text,
            letterSpacing: '0.05em',
          }}>
            {String(hour).padStart(2, '0')}<span style={{ color: T.textDim }}>:</span>00
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'sunny', label: 'مشمس', icon: Sun, color: T.amber },
              { id: 'cloudy', label: 'غائم', icon: Cloud, color: T.cyan },
              { id: 'night', label: 'ليل', icon: Moon, color: T.purple },
            ].map(w => {
              const Icon = w.icon;
              const active = weather === w.id;
              return (
                <button key={w.id} onClick={() => setWeather(w.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px',
                  background: active ? w.color + '22' : 'transparent',
                  color: active ? w.color : T.textMuted,
                  border: `1px solid ${active ? w.color : T.border}`,
                  borderRadius: '8px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600,
                }}>
                  <Icon size={14} />
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>

        <input
          type="range" min="0" max="23" step="1"
          value={hour}
          onChange={e => setHour(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: T.textDim, marginTop: '6px', direction: 'ltr' }}>
          {['00', '06', '12', '18', '23'].map(h => (
            <span key={h}>{h}:00</span>
          ))}
        </div>
      </div>

      {/* Live metrics */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px', marginBottom: '24px',
      }}>
        <MetricCard
          icon={Sun} label="الإنتاج الحالي" value={current.production} unit="ك.و" color={T.amber}
          subtitle={isDaytime ? 'الألواح تعمل' : 'لا يوجد إشعاع'}
        />
        <MetricCard
          icon={Zap} label="الاستهلاك" value={current.consumption} unit="ك.و" color={T.cyan}
          subtitle={current.consumption > 200 ? 'حمل ذروة' : current.consumption > 100 ? 'حمل متوسط' : 'حمل قاعدي'}
        />
        <MetricCard
          icon={Battery} label="حالة البطاريات"
          value={batteryFlow === 'charging' ? '🔼 شحن' : batteryFlow === 'discharging' ? '🔽 تفريغ' : '⏸️ توازن'}
          unit="" color={batteryFlow === 'charging' ? T.green : batteryFlow === 'discharging' ? T.coral : T.cyan}
          subtitle={isExcess ? `+${current.production - current.consumption} فائض` : `${Math.abs(current.production - current.consumption)} عجز`}
        />
        <MetricCard
          icon={Activity} label="الصافي" value={current.net >= 0 ? `+${current.net}` : current.net}
          unit="ك.و" color={current.net >= 0 ? T.green : T.coral}
          subtitle={current.net >= 0 ? 'إنتاج زائد' : 'استيراد من الشبكة'}
        />
      </div>

      {/* Flow diagram */}
      <FlowDiagram current={current} weather={weather} hour={hour} />

      {/* Daily curve */}
      <DailyChart dayData={dayData} currentHour={hour} weather={weather} />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, unit, color, subtitle }) {
  return (
    <div style={{
      background: T.bgPanel,
      border: `1px solid ${T.border}`,
      borderRadius: '12px',
      padding: '14px',
      borderTop: `3px solid ${color}`,
      boxShadow: T.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Icon size={16} color={color} />
        <span style={{ fontSize: '11px', color: T.textMuted }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{
          fontFamily: '"Amiri", serif', fontSize: '26px', fontWeight: 700, color: color, lineHeight: 1,
        }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: '12px', color: T.textMuted }}>{unit}</span>}
      </div>
      {subtitle && <div style={{ fontSize: '10px', color: T.textDim, marginTop: '4px' }}>{subtitle}</div>}
    </div>
  );
}

// =================================================================
// FLOW DIAGRAM (animated SVG)
// =================================================================
function FlowDiagram({ current, weather, hour }) {
  const isDaytime = current.production > 0;
  const isExcess = current.production > current.consumption;
  const [skyTop, skyBot] = skySvgStops(hour, weather);
  const sun = sunArc(hour);  // null at night
  const isMoonOut = weather === 'night' || hour < 6 || hour > 19;

  return (
    <div style={{
      background: T.bgPanel, borderRadius: '16px', padding: '24px',
      border: `1px solid ${T.border}`,
      boxShadow: T.shadow,
      marginBottom: '24px',
    }}>
      <h3 style={{
        fontFamily: '"Reem Kufi", sans-serif', fontWeight: 600, fontSize: '16px',
        color: T.text, marginBottom: '20px',
      }}>
        مخطط تدفق الطاقة الحي
      </h3>

      <svg viewBox="0 0 1200 500" style={{ width: '100%', height: 'auto', borderRadius: '12px' }}>
        <defs>
          <linearGradient id="sky-dynamic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} />
            <stop offset="100%" stopColor={skyBot} />
          </linearGradient>
          <radialGradient id="sun-rays">
            <stop offset="0%" stopColor={T.amber} />
            <stop offset="50%" stopColor={T.amberLt} stopOpacity="0.6" />
            <stop offset="100%" stopColor={T.amberLt} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ground-strip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8D5A0" />
            <stop offset="100%" stopColor="#C9B879" />
          </linearGradient>
        </defs>

        {/* Sky background — shifts with hour */}
        <rect width="1200" height="460" fill="url(#sky-dynamic)" />
        {/* Thin ground strip at the very bottom */}
        <rect y="460" width="1200" height="40" fill="url(#ground-strip)" />

        {/* Stars (only at night) */}
        {isMoonOut && (
          <g opacity="0.85">
            {[
              [120, 60], [220, 110], [340, 50], [480, 90], [620, 40],
              [780, 80], [880, 120], [1020, 60], [1120, 100], [550, 140],
              [80, 180], [380, 200], [710, 170], [1050, 200],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="1.2" fill="#FFF1D9"
                className={i % 3 === 0 ? "pulse-anim" : ""} />
            ))}
          </g>
        )}

        {/* Sun arcs across the sky from 6am→6pm */}
        {sun && weather !== 'night' && (
          <g transform={`translate(${sun.x}, ${sun.y})`}>
            <circle r="90" fill="url(#sun-rays)" className="pulse-anim" />
            <circle r="36" fill={T.amberLt} className="glow-anim" style={{ color: T.amber }} />
            <circle r="36" fill={T.amber} opacity="0.55" />
            {weather !== 'cloudy' && [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => (
              <line key={a} x1="0" y1="-46" x2="0" y2="-60"
                stroke={T.amberLt} strokeWidth="2.5" strokeLinecap="round"
                transform={`rotate(${a})`} opacity="0.85"
              />
            ))}
          </g>
        )}

        {/* Moon at night */}
        {isMoonOut && (
          <g transform="translate(950, 90)" className="float-anim">
            <circle r="42" fill="#FFF1D9" opacity="0.95" />
            <circle r="38" cx="-10" fill={skyTop} />
            <circle r="3" cx="22" cy="-8" fill="#D2BC93" opacity="0.5" />
            <circle r="2" cx="16" cy="14" fill="#D2BC93" opacity="0.5" />
            <circle r="4" cx="-2" cy="20" fill="#D2BC93" opacity="0.5" />
          </g>
        )}

        {/* Clouds for cloudy weather */}
        {weather === 'cloudy' && (
          <g opacity="0.92">
            <ellipse cx="200" cy="120" rx="90" ry="22" fill="#FFFFFF" />
            <ellipse cx="240" cy="100" rx="60" ry="18" fill="#FFFFFF" />
            <ellipse cx="600" cy="80" rx="80" ry="22" fill="#FFFFFF" />
            <ellipse cx="650" cy="100" rx="55" ry="16" fill="#FFFFFF" />
            <ellipse cx="900" cy="110" rx="90" ry="22" fill="#FFFFFF" />
            <ellipse cx="950" cy="92" rx="60" ry="18" fill="#FFFFFF" />
            <ellipse cx="1010" cy="115" rx="70" ry="22" fill="#FFFFFF" />
          </g>
        )}

        {/* Solar panels (top-left) */}
        <g transform="translate(80, 180)">
          <text x="60" y="-20" textAnchor="middle" fontSize="13" fill={T.text} fontFamily='"Tajawal", sans-serif' fontWeight="700">
            الألواح الشمسية
          </text>
          <text x="60" y="-5" textAnchor="middle" fontSize="11" fill={T.amber} fontFamily='"Tajawal", sans-serif'>
            {current.production} ك.و
          </text>
          <g>
            {[0, 1, 2].map(row => (
              [0, 1, 2].map(col => (
                <rect key={`${row}-${col}`}
                  x={col * 40} y={row * 25} width="36" height="22" rx="2"
                  fill={isDaytime ? '#3F7CAD' : '#9A8770'}
                  stroke={T.amber} strokeWidth={isDaytime ? 1 : 0.3}
                  opacity={isDaytime ? 0.92 : 0.5}
                />
              ))
            ))}
            {/* Energy beams from sun to panels */}
            {isDaytime && [0, 1, 2].map(i => (
              <line key={i}
                x1={20 + i * 40} y1="0" x2={300} y2="-90"
                stroke={T.amberLt} strokeWidth="1" strokeDasharray="3 6"
                opacity="0.4" className="glow-anim"
              />
            ))}
          </g>
        </g>

        {/* Inverter (center-left) */}
        <g transform="translate(330, 200)">
          <rect width="80" height="60" rx="6" fill={T.bgLight} stroke={T.amber} strokeWidth="1.5" />
          <text x="40" y="25" textAnchor="middle" fontSize="11" fill={T.text} fontFamily='"Tajawal", sans-serif' fontWeight="700">عاكس</text>
          <text x="40" y="42" textAnchor="middle" fontSize="9" fill={T.amber}>Inverter</text>
          <circle cx="40" cy="55" r="3" fill={isDaytime ? T.green : T.textDim} className={isDaytime ? "pulse-anim" : ""} />
        </g>

        {/* Flow line: panels → inverter */}
        {isDaytime && (
          <g>
            <path d="M 220 230 Q 280 230 330 230" stroke={T.amber} strokeWidth="3" fill="none"
              strokeDasharray="6 4" style={{ animation: 'flow-down 0.6s linear infinite' }} />
            <text x="275" y="223" textAnchor="middle" fontSize="9" fill={T.amber}>DC</text>
          </g>
        )}

        {/* Battery (center) */}
        <g transform="translate(550, 180)">
          <rect width="120" height="100" rx="8" fill={T.bgLight} stroke={T.cyan} strokeWidth="1.5" />
          <text x="60" y="20" textAnchor="middle" fontSize="11" fill={T.text} fontFamily='"Tajawal", sans-serif' fontWeight="700">البطاريات</text>
          <text x="60" y="35" textAnchor="middle" fontSize="9" fill={T.cyan}>430 kWh</text>

          {/* Battery level */}
          <rect x="20" y="50" width="80" height="30" rx="3" fill={T.bg} stroke={T.cyan} strokeWidth="1" />
          {[0, 1, 2, 3].map(i => (
            <rect key={i}
              x={24 + i * 19} y="54" width="15" height="22" rx="1"
              fill={isExcess || !isDaytime ? T.green : T.textDim}
              opacity={isDaytime ? (i < 3 ? 0.9 : 0.5) : 0.6}
              className={isExcess && i === 3 ? "pulse-anim" : ""}
            />
          ))}
          <text x="60" y="93" textAnchor="middle" fontSize="9" fill={T.cyan}>
            {isExcess ? '⚡ شحن' : isDaytime ? 'مستقر' : '🔋 تفريغ'}
          </text>
        </g>

        {/* Flow: inverter → battery */}
        {isDaytime && (
          <g>
            <path d="M 410 230 Q 480 230 550 230" stroke={isExcess ? T.green : T.amber} strokeWidth="3" fill="none"
              strokeDasharray="6 4" style={{ animation: 'flow-down 0.6s linear infinite' }} />
          </g>
        )}

        {/* Buildings (right) */}
        <g transform="translate(820, 130)">
          <text x="100" y="-10" textAnchor="middle" fontSize="13" fill={T.text} fontFamily='"Tajawal", sans-serif' fontWeight="700">
            مباني الجامعة
          </text>
          {/* University buildings cluster */}
          <g transform="translate(0, 10)">
            {[
              { x: 0, y: 60, w: 50, h: 60 },
              { x: 60, y: 30, w: 60, h: 90 },
              { x: 130, y: 50, w: 40, h: 70 },
              { x: 180, y: 65, w: 30, h: 55 },
              { x: 0, y: 130, w: 80, h: 50 },
              { x: 90, y: 130, w: 50, h: 50 },
              { x: 150, y: 130, w: 60, h: 50 },
            ].map((b, i) => (
              <g key={i}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill={T.bgLight} stroke={T.borderLt} />
                {/* Windows lit during day */}
                {[...Array(Math.floor(b.w / 12))].map((_, j) => (
                  [...Array(Math.floor(b.h / 15))].map((_, k) => (
                    <rect key={`${j}-${k}`}
                      x={b.x + 4 + j * 12} y={b.y + 6 + k * 15}
                      width="6" height="8"
                      fill={current.consumption > 100 ? T.amber : T.bgPanel}
                      opacity={current.consumption > 100 ? 0.7 + (Math.sin(i + j + k) * 0.2) : 0.2}
                    />
                  ))
                ))}
              </g>
            ))}
          </g>
        </g>

        {/* Flow: battery → buildings */}
        <g>
          <path d="M 670 230 Q 750 230 820 200" stroke={T.green} strokeWidth="3" fill="none"
            strokeDasharray="6 4" style={{ animation: 'flow-down 0.6s linear infinite' }} />
          <text x="745" y="220" textAnchor="middle" fontSize="9" fill={T.green}>{current.consumption} ك.و</text>
        </g>

        {/* Grid backup (if needed) */}
        {!isDaytime && current.consumption > 0 && (
          <g transform="translate(550, 380)">
            <rect width="120" height="50" rx="6" fill={T.coral + '22'} stroke={T.coral} strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="60" y="20" textAnchor="middle" fontSize="11" fill={T.text} fontFamily='"Tajawal", sans-serif' fontWeight="700">الشبكة الوطنية</text>
            <text x="60" y="38" textAnchor="middle" fontSize="9" fill={T.coral}>احتياطي عند الحاجة</text>
            <path d="M 610 405 L 720 230" stroke={T.coral} strokeWidth="2" fill="none"
              strokeDasharray="4 6" opacity="0.6" />
          </g>
        )}
      </svg>
    </div>
  );
}

// =================================================================
// DAILY CHART
// =================================================================
function DailyChart({ dayData, currentHour, weather }) {
  const W = 1100, H = 280;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;
  const maxVal = Math.max(...dayData.map(d => Math.max(d.production, d.consumption))) * 1.1;

  const xScale = h => padding.left + (h / 23) * innerW;
  const yScale = v => padding.top + innerH - (v / maxVal) * innerH;

  const productionPath = dayData.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(d.hour)} ${yScale(d.production)}`
  ).join(' ');

  const consumptionPath = dayData.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(d.hour)} ${yScale(d.consumption)}`
  ).join(' ');

  return (
    <div style={{
      background: T.bgPanel, borderRadius: '16px', padding: '24px',
      border: `1px solid ${T.border}`,
      boxShadow: T.shadow,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: '"Reem Kufi", sans-serif', fontSize: '16px', fontWeight: 600, color: T.text }}>
            منحنى الإنتاج والاستهلاك اليومي
          </h3>
          <p style={{ fontSize: '11px', color: T.textMuted, marginTop: '4px' }}>
            مقارنة بين توليد الألواح الشمسية واستهلاك الجامعة عبر 24 ساعة
          </p>
        </div>
        <div style={{ display: 'flex', gap: '14px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '3px', background: T.amber }} />
            <span style={{ color: T.textMuted }}>الإنتاج</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '3px', background: T.cyan }} />
            <span style={{ color: T.textMuted }}>الاستهلاك</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <line key={p}
            x1={padding.left} y1={padding.top + innerH * p}
            x2={W - padding.right} y2={padding.top + innerH * p}
            stroke={T.borderLt} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <text key={p}
            x={padding.left - 8} y={padding.top + innerH * (1 - p) + 4}
            fontSize="10" fill={T.textMuted} textAnchor="end"
          >
            {Math.round(maxVal * p)}
          </text>
        ))}

        {/* X-axis labels */}
        {[0, 6, 12, 18, 23].map(h => (
          <text key={h}
            x={xScale(h)} y={H - padding.bottom + 16}
            fontSize="10" fill={T.textMuted} textAnchor="middle"
          >
            {String(h).padStart(2, '0')}:00
          </text>
        ))}

        {/* Production area */}
        <path
          d={`${productionPath} L ${xScale(23)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`}
          fill={T.amber} fillOpacity="0.15"
        />
        <path d={productionPath} stroke={T.amber} strokeWidth="2.5" fill="none" />

        {/* Consumption */}
        <path d={consumptionPath} stroke={T.cyan} strokeWidth="2.5" fill="none" strokeDasharray="6 4" />

        {/* Current hour marker */}
        <line
          x1={xScale(currentHour)} y1={padding.top}
          x2={xScale(currentHour)} y2={H - padding.bottom}
          stroke={T.amberLt} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8"
        />
        <circle cx={xScale(currentHour)} cy={yScale(dayData[currentHour].production)} r="6" fill={T.amber} stroke={T.bg} strokeWidth="2" className="pulse-anim" />
        <circle cx={xScale(currentHour)} cy={yScale(dayData[currentHour].consumption)} r="6" fill={T.cyan} stroke={T.bg} strokeWidth="2" />

        {/* Y-axis title */}
        <text
          x={15} y={padding.top + innerH / 2}
          fontSize="11" fill={T.textMuted} textAnchor="middle"
          transform={`rotate(-90, 15, ${padding.top + innerH / 2})`}
        >
          الكيلوواط
        </text>
      </svg>
    </div>
  );
}

