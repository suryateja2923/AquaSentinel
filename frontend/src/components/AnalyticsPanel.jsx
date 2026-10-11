import React, { useState } from 'react';
import { 
  TrendingDown, 
  Layers,
  Sparkles
} from 'lucide-react';
import { getWetlandConditionForYear } from '../data/wetlandsData';

const DEFAULT_TIME_SERIES = [
  { year: 2020, waterArea: 100, builtUpEncroached: 0.0, ndwiMean: 0.48, monsoonPeak: 124, drySeason: 88 },
  { year: 2021, waterArea: 96, builtUpEncroached: 3.2, ndwiMean: 0.45, monsoonPeak: 120, drySeason: 84 },
  { year: 2022, waterArea: 92, builtUpEncroached: 7.1, ndwiMean: 0.42, monsoonPeak: 114, drySeason: 80 },
  { year: 2023, waterArea: 87, builtUpEncroached: 12.4, ndwiMean: 0.38, monsoonPeak: 109, drySeason: 75 },
  { year: 2024, waterArea: 84, builtUpEncroached: 15.8, ndwiMean: 0.35, monsoonPeak: 105, drySeason: 72 },
  { year: 2025, waterArea: 80, builtUpEncroached: 19.2, ndwiMean: 0.32, monsoonPeak: 101, drySeason: 69 },
  { year: 2026, waterArea: 78, builtUpEncroached: 22.0, ndwiMean: 0.30, monsoonPeak: 98, drySeason: 67 }
];

const DEFAULT_TRANSITION_DATA = [
  { category: 'Persistent Open Water', area: 78.0, color: '#0284c7' },
  { category: 'Water Lost to Unregulated Built-up', area: 11.4, color: '#ef4444' },
  { category: 'Water Lost to Siltation & Infill', area: 6.8, color: '#f59e0b' },
  { category: 'Water Lost to Agricultural Polder', area: 3.8, color: '#8b5cf6' }
];

const AnalyticsPanel = ({ wetland, selectedYear, setSelectedYear }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const histCondition = (selectedYear < 2020 && wetland) ? getWetlandConditionForYear(wetland, selectedYear) : null;

  const timeSeries = (wetland && wetland.timeSeries && wetland.timeSeries.length > 0) ? wetland.timeSeries : DEFAULT_TIME_SERIES;
  const transitionData = (wetland && wetland.transitionData && wetland.transitionData.length > 0) ? wetland.transitionData : DEFAULT_TRANSITION_DATA;
  const maxWater = 130;
  const minWater = 50;

  // SVG Chart dimensions
  const chartWidth = 520;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const innerW = chartWidth - paddingX * 2;
  const innerH = chartHeight - paddingY * 2;

  // Coordinate mapper
  const getX = (index) => paddingX + (index / Math.max(1, timeSeries.length - 1)) * innerW;
  const getY = (val) => paddingY + innerH - ((val - minWater) / (maxWater - minWater)) * innerH;

  // Generate SVG path for Water Area
  const waterPoints = timeSeries.map((d, i) => `${getX(i)},${getY(d.waterArea || 80)}`).join(' ');
  const areaPath = `${getX(0)},${paddingY + innerH} ` + waterPoints + ` ${getX(timeSeries.length - 1)},${paddingY + innerH}`;

  // Monsoon peak upper curve
  const monsoonPoints = timeSeries.map((d, i) => `${getX(i)},${getY(d.monsoonPeak || 100)}`).join(' ');

  return (
    <div className="analytics-grid">
      {/* Chart 1: Temporal Water Spread Trend */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title">
            <TrendingDown size={18} color="#0284c7" />
            <span>Water Spread Area Dynamic Trend (ha)</span>
          </div>
          <span style={{ 
            fontSize: '0.75rem', 
            color: histCondition ? (histCondition.hasSatelliteRecord ? '#0284c7' : '#dc2626') : 'var(--text-muted)', 
            fontWeight: histCondition ? 700 : 500,
            fontFamily: 'var(--font-mono)' 
          }}>
            {histCondition ? (histCondition.hasSatelliteRecord ? `Historical ${selectedYear} (${histCondition.waterArea} ha)` : `Year ${selectedYear}: No Satellite Record`) : '2020–2026 Sentinel-2'}
          </span>
        </div>

        {histCondition && (
          <div style={{
            background: histCondition.hasSatelliteRecord ? 'rgba(2, 132, 199, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: histCondition.hasSatelliteRecord ? '1px solid rgba(2, 132, 199, 0.25)' : '1px dashed #ef4444',
            borderRadius: 'var(--radius-sm)',
            padding: '0.4rem 0.65rem',
            marginBottom: '0.55rem',
            fontSize: '0.74rem',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            {histCondition.hasSatelliteRecord ? (
              <Sparkles size={13} color="#0284c7" />
            ) : (
              <span style={{ color: '#dc2626', fontWeight: 800 }}>⚠️</span>
            )}
            <span>
              {histCondition.hasSatelliteRecord ? (
                <><strong>{selectedYear} Satellite Observation:</strong> {histCondition.sensor} mapped {histCondition.waterArea} ha pristine surface area ({histCondition.builtUpEncroached === 0 ? '0.0 ha encroachment' : `${histCondition.builtUpEncroached} ha`}).</>
              ) : (
                <><strong style={{ color: '#dc2626' }}>No Satellite Record for {selectedYear}:</strong> {histCondition.recordNotice}</>
              )}
            </span>
          </div>
        )}

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Annual dry-season baseline vs monsoon peak inundation surface area in hectares.
        </p>

        {/* Interactive SVG Chart */}
        <div className="chart-container">
          <svg className="chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Grid horizontal guidelines */}
            {[60, 80, 100, 120].map((v) => (
              <g key={v}>
                <line 
                  x1={paddingX} 
                  y1={getY(v)} 
                  x2={chartWidth - paddingX} 
                  y2={getY(v)} 
                  stroke="var(--border-light)" 
                  strokeDasharray="3 3"
                />
                <text 
                  x={paddingX - 8} 
                  y={getY(v) + 3} 
                  fontSize="9" 
                  fill="var(--text-subtle)" 
                  textAnchor="end"
                  fontFamily="var(--font-mono)"
                >
                  {v}
                </text>
              </g>
            ))}

            {/* Area fill for water */}
            <polygon 
              points={areaPath} 
              fill="rgba(2, 132, 199, 0.12)"
            />

            {/* Monsoon Envelope Line */}
            <polyline 
              points={monsoonPoints} 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth="1.5" 
              strokeDasharray="4 3"
              opacity="0.6"
            />

            {/* Baseline Water Line */}
            <polyline 
              points={waterPoints} 
              fill="none" 
              stroke="#0284c7" 
              strokeWidth="2.5" 
            />

            {/* Interactive data points */}
            {timeSeries.map((d, i) => {
              const cx = getX(i);
              const cy = getY(d.waterArea);
              const isSelected = d.year === selectedYear;

              return (
                <g 
                  key={d.year} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedYear(d.year)}
                  onMouseEnter={() => setHoveredPoint(d)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={isSelected ? 6 : 4} 
                    fill={isSelected ? '#0284c7' : '#ffffff'} 
                    stroke="#0284c7" 
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  {/* Year labels at bottom */}
                  <text 
                    x={cx} 
                    y={chartHeight - 6} 
                    fontSize="10" 
                    fill={isSelected ? '#0284c7' : 'var(--text-muted)'} 
                    fontWeight={isSelected ? '700' : '500'}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                  >
                    '{String(d.year).slice(2)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip on hover */}
          {hoveredPoint && (
            <div 
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                fontSize: '11px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <strong>{hoveredPoint.year}:</strong> {hoveredPoint.waterArea} ha (Monsoon: {hoveredPoint.monsoonPeak} ha)
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 12, height: 2, background: '#0284c7', display: 'inline-block' }}></span>
            <span>Annual Dry Extent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 12, height: 2, background: '#0ea5e9', borderTop: '1px dashed #0ea5e9', display: 'inline-block' }}></span>
            <span>Monsoon Peak Extent</span>
          </div>
          <div>
            Net Loss: <strong style={{ color: '#dc2626' }}>-22 ha (-22%)</strong>
          </div>
        </div>
      </div>

      {/* Chart 2: Land Cover Transition & Health Score */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title">
            <Layers size={18} color="#8b5cf6" />
            <span>Wetland Basin Transition Analysis</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
            -22 ha Reclaimed
          </span>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
          Conversion breakdown of historical water body into alternate land classes.
        </p>

        {/* Transition Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transitionData.map((item) => {
            const percent = ((item.area / 100) * 100).toFixed(1);
            return (
              <div key={item.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.category}</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {item.area} ha ({percent}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${percent}%`, 
                      height: '100%', 
                      backgroundColor: item.color,
                      borderRadius: '9999px'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Spectral Health Diagnostics Box */}
        <div 
          style={{
            marginTop: '1.25rem',
            padding: '0.85rem',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Wetland Eco-Health Index</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#dc2626' }}>
              {wetland.metrics.waterHealthScore}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NDWI Water Classification Threshold</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              {wetland.metrics.ndwiThreshold}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
