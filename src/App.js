import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun, Map, Activity, Building2, Zap, Battery, Cloud, Moon,
  X, Play, Pause, Info,
  Sparkles, Eye, Maximize2
} from 'lucide-react';
import { T, BUILDINGS, calculatePotential, generateDayData, TOTALS, ACTUAL_DEMAND } from './data';

// =================================================================
// MAIN APP
// =================================================================
export default function App() {
  const [view, setView] = useState('map'); // 'map' | 'flow'

  return (
    <div dir="rtl" lang="ar" style={{ minHeight: '100vh', background: T.bg, color: T.text }}>
      <Header view={view} setView={setView} />
      {view === 'map' && <CampusMap />}
      {view === 'flow' && <EnergyFlow />}
      <Footer />
    </div>
  );
}

// =================================================================
// HEADER
// =================================================================
function Header({ view, setView }) {
  return (
    <header style={{
      borderBottom: `1px solid ${T.border}`,
      background: T.bgPanel,
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '14px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px', height: '46px',
            background: `linear-gradient(135deg, ${T.amber}, ${T.amberLt})`,
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 24px ${T.amber}55`,
          }}>
            <Sun size={26} color={T.bg} strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{
              fontFamily: '"Amiri", serif', fontWeight: 700,
              fontSize: '22px', lineHeight: 1.1, color: T.text
            }}>
              محاكاة الطاقة الشمسية
              <span style={{ color: T.amber, margin: '0 10px' }}>·</span>
              <span style={{ fontStyle: 'italic', color: T.amberLt }}>الحرم الجامعي</span>
            </h1>
            <p style={{ fontSize: '12px', color: T.textMuted, marginTop: '2px' }}>
              جامعة الإمام الصادق · 14 مبنى · إمكانية ~1.7 ميجاواط
            </p>
          </div>
        </div>

        <nav style={{
          display: 'flex', gap: '4px',
          padding: '4px',
          background: T.bgCard,
          borderRadius: '10px',
          border: `1px solid ${T.border}`,
        }}>
          {[
            { id: 'map', label: 'خريطة الحرم', icon: Map },
            { id: 'flow', label: 'تدفق الطاقة', icon: Activity },
          ].map(tab => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <button key={tab.id} onClick={() => setView(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '8px',
                background: active ? T.amber : 'transparent',
                color: active ? T.bg : T.textMuted,
                border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: active ? 700 : 500,
                fontFamily: '"Reem Kufi", sans-serif',
                transition: 'all 0.2s',
              }}>
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }} className="fade-in">

      {/* Quick stats band */}
      <div style={{
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
        background: `linear-gradient(135deg, ${T.amber}15, ${T.cyan}10)`,
        border: `1px solid ${T.amber}44`,
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex', gap: '14px', alignItems: 'flex-start'
      }}>
        <Sparkles size={22} color={T.amber} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontFamily: '"Reem Kufi", sans-serif', fontWeight: 600, fontSize: '14px', color: T.amberLt, marginBottom: '4px' }}>
            ملاحظة استراتيجية
          </div>
          <p style={{ fontSize: '13px', color: T.text, lineHeight: 1.7 }}>
            الإمكانية النظرية للأسطح ({TOTALS.totalPotential.toLocaleString('ar')} ك.و) تفوق احتياج الجامعة الفعلي ({ACTUAL_DEMAND} ك.و) بنسبة <span style={{ color: T.amber, fontWeight: 700 }}>{Math.round((TOTALS.totalPotential / ACTUAL_DEMAND - 1) * 100)}%</span>.
            <br />هذا يعني أنه بالإمكان تغطية الحاجة باستخدام <span style={{ color: T.amber, fontWeight: 700 }}>أكبر 4-5 مباني فقط</span>، مع توفير الباقي للتوسعات المستقبلية أو بيع الفائض للشبكة الوطنية.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px',
        background: T.bgPanel, padding: '16px', borderRadius: '12px',
        border: `1px solid ${T.border}`,
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
      background: highlight ? `linear-gradient(135deg, ${color}22, ${color}08)` : T.bgPanel,
      border: `1px solid ${highlight ? color + '66' : T.border}`,
      borderRadius: '12px', padding: '16px',
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
    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#1A2440' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Ground gradient */}
        <defs>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1F2D4F" />
            <stop offset="100%" stopColor="#0F1A2E" />
          </linearGradient>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={T.amber} stopOpacity="1" />
            <stop offset="50%" stopColor={T.amber} stopOpacity="0.4" />
            <stop offset="100%" stopColor={T.amber} stopOpacity="0" />
          </radialGradient>
          <pattern id="solar-pattern" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill={T.cyan} fillOpacity="0.6" />
            <line x1="0" y1="0" x2="6" y2="0" stroke={T.bg} strokeWidth="0.5" />
            <line x1="3" y1="0" x2="3" y2="6" stroke={T.bg} strokeWidth="0.3" />
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
              fill={T.bg} stroke={T.amber} strokeWidth="1"
              opacity="0.95"
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
              textAnchor="middle" fontSize="11" fill={T.amber}
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
      {/* Building shadow */}
      <rect x={x + 4} y={y + 4} width={w} height={h} rx="3" fill="black" opacity="0.3" />

      {/* Building roof */}
      <rect
        x={x} y={y} width={w} height={h} rx="3"
        fill={isSelected ? T.bgLight : T.bgCard}
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
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      className="fade-in"
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: T.bgPanel, borderRadius: '20px',
        maxWidth: '900px', width: '100%', maxHeight: '90vh',
        overflow: 'auto',
        border: `1px solid ${T.border}`,
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
function EnergyFlow() {
  const [hour, setHour] = useState(12);
  const [autoplay, setAutoplay] = useState(false);
  const [weather, setWeather] = useState('sunny'); // 'sunny' | 'cloudy' | 'night'

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
  }, [autoplay]);

  const isDaytime = current.production > 0;
  const isProducing = current.production > 0;
  const isExcess = current.production > current.consumption;
  const batteryFlow = isExcess ? 'charging' : isProducing ? 'partial' : 'discharging';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }} className="fade-in">

      {/* Header info */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: '"Amiri", serif', fontSize: '26px', fontWeight: 700, color: T.text, marginBottom: '4px' }}>
          محاكاة تدفق الطاقة على مدار اليوم
        </h2>
        <p style={{ fontSize: '13px', color: T.textMuted }}>
          استخدم شريط الوقت لمشاهدة كيف تتدفق الطاقة من الألواح إلى البطاريات والمباني عبر 24 ساعة
        </p>
      </div>

      {/* Time controls */}
      <div style={{
        background: T.bgPanel, borderRadius: '16px', padding: '20px',
        border: `1px solid ${T.border}`, marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => setAutoplay(!autoplay)} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px',
            background: autoplay ? T.amber : T.bgCard,
            color: autoplay ? T.bg : T.text,
            border: `1px solid ${autoplay ? T.amber : T.border}`,
            borderRadius: '10px', cursor: 'pointer',
            fontWeight: 700, fontSize: '13px',
          }}>
            {autoplay ? <Pause size={16} /> : <Play size={16} />}
            {autoplay ? 'إيقاف' : 'تشغيل تلقائي'}
          </button>

          <div style={{
            fontFamily: '"Amiri", serif', fontSize: '36px', fontWeight: 700,
            color: T.amber,
          }}>
            {String(hour).padStart(2, '0')}:00
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
      <FlowDiagram current={current} weather={weather} />

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
function FlowDiagram({ current, weather }) {
  const isDaytime = current.production > 0;
  const isExcess = current.production > current.consumption;

  return (
    <div style={{
      background: T.bgPanel, borderRadius: '16px', padding: '24px',
      border: `1px solid ${T.border}`, marginBottom: '24px',
    }}>
      <h3 style={{
        fontFamily: '"Reem Kufi", sans-serif', fontWeight: 600, fontSize: '16px',
        color: T.text, marginBottom: '20px',
      }}>
        مخطط تدفق الطاقة الحي
      </h3>

      <svg viewBox="0 0 1200 500" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="sky-day" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E3450" />
            <stop offset="100%" stopColor="#0A1628" />
          </linearGradient>
          <linearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A0F1E" />
            <stop offset="100%" stopColor="#050B14" />
          </linearGradient>
          <radialGradient id="sun-rays">
            <stop offset="0%" stopColor={T.amber} />
            <stop offset="50%" stopColor={T.amberLt} stopOpacity="0.5" />
            <stop offset="100%" stopColor={T.amber} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky background */}
        <rect width="1200" height="500" fill={isDaytime ? 'url(#sky-day)' : 'url(#sky-night)'} />

        {/* Sun or moon */}
        {weather === 'night' || !isDaytime ? (
          <g transform="translate(950, 90)">
            <circle r="40" fill="#E8E6F0" opacity="0.95" />
            <circle r="36" cx="-8" fill="#0A1628" />
          </g>
        ) : (
          <g transform="translate(950, 90)">
            <circle r="100" fill="url(#sun-rays)" className="pulse-anim" />
            <circle r="40" fill={T.amber} className="glow-anim" style={{ color: T.amber }} />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => (
              <line key={a} x1="0" y1="-50" x2="0" y2="-65"
                stroke={T.amberLt} strokeWidth="2" strokeLinecap="round"
                transform={`rotate(${a})`}
                opacity={weather === 'cloudy' ? 0.3 : 0.8}
              />
            ))}
          </g>
        )}

        {/* Clouds for cloudy weather */}
        {weather === 'cloudy' && (
          <g opacity="0.7">
            <ellipse cx="900" cy="100" rx="80" ry="20" fill="#94A3B8" />
            <ellipse cx="950" cy="85" rx="60" ry="18" fill="#94A3B8" />
            <ellipse cx="1000" cy="105" rx="70" ry="22" fill="#94A3B8" />
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
                  fill={isDaytime ? T.cyan : '#2A3F5C'}
                  stroke={T.amber} strokeWidth={isDaytime ? 1 : 0.3}
                  opacity={isDaytime ? 0.85 : 0.4}
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

// =================================================================
// FOOTER
// =================================================================
function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${T.border}`, marginTop: '40px', padding: '24px',
      background: T.bgPanel, textAlign: 'center',
    }}>
      <p style={{ fontSize: '12px', color: T.textDim }}>
        محاكاة تفاعلية · مشروع الطاقة الشمسية لجامعة الإمام الصادق · 14 مبنى · ~9,659 م² إجمالي مساحة الأسطح
      </p>
    </footer>
  );
}
