import React, { useState } from 'react';
import { 
  Droplets, 
  TrendingDown, 
  MapPin, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Eye,
  EyeOff,
  Sliders,
  Sparkles
} from 'lucide-react';
import { getWetlandConditionForYear } from '../data/wetlandsData';

const ProposedDesignCard = ({ 
  wetland, 
  layerVisibility, 
  toggleLayer, 
  layerOpacity, 
  setLayerOpacity,
  selectedYear,
  onHotspotClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dynamic calculated wetland condition based on selectedYear (supports 1970s to 2026, and pre-1970 like 1800)
  const condition = getWetlandConditionForYear(wetland, selectedYear);
  const hasRecord = condition.hasSatelliteRecord;
  const waterValue = hasRecord ? `${condition.waterArea} ha` : 'No Record';
  const diffPercent = condition.comparisonVsPresent;
  const isPositiveCapacity = diffPercent !== null && diffPercent >= 0;
  const changeValue = hasRecord ? (isPositiveCapacity ? `+${diffPercent}%` : `${diffPercent}%`) : 'No Record';

  return (
    <div className="proposed-design-card">
      <h2 className="card-title">Wetland monitoring dashboard — proposed design</h2>

      {/* Default Example Site Prompt Banner */}
      {wetland.isDefaultExample && (
        <div style={{
          background: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.55rem 0.8rem',
          marginBottom: '0.85rem',
          fontSize: '0.76rem',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem'
        }}>
          <Sparkles size={14} color="#0284c7" />
          <span>
            <strong>e.g. Reference Mode:</strong> Type any village, district or wetland in the search box above to load satellite data for that area.
          </span>
        </div>
      )}

      {/* No Satellite Record Warning for pre-1970 (e.g. 1800) */}
      {!hasRecord && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px dashed #ef4444',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.85rem',
          marginBottom: '0.85rem',
          fontSize: '0.76rem',
          color: '#b91c1c',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.45rem'
        }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>⚠️</span>
          <div>
            <strong>No Satellite Record for {selectedYear}:</strong> Spaceborne Earth Observation began with Landsat-1 in 1972. Digital telemetry is unavailable for {selectedYear}.
          </div>
        </div>
      )}

      {/* Village & District Administrative Metadata */}
      <div style={{
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 0.85rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} />
            <span>{wetland.name}</span>
          </div>
          <span style={{ 
            fontSize: '0.66rem', 
            padding: '0.15rem 0.45rem', 
            background: 'rgba(2, 132, 199, 0.12)', 
            color: '#0284c7', 
            borderRadius: '9999px', 
            fontWeight: 700 
          }}>
            {hasRecord ? 'EO MONITORED' : 'NO RECORD'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              🏘️ Village / Locality
            </div>
            <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', wordBreak: 'break-word' }}>
              {wetland.village || 'Pamohi & Azara'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              🏛️ District
            </div>
            <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', wordBreak: 'break-word' }}>
              {wetland.district || 'Kamrup Metropolitan'}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', padding: '0 0.2rem' }}>
          <span>State: <b>{wetland.state}</b></span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>[{wetland.coordinates[0].toFixed(3)}°N, {wetland.coordinates[1].toFixed(3)}°E]</span>
        </div>
      </div>

      {/* 2x2 Stats Grid exactly mirroring the design mockup */}
      <div className="stats-2x2-grid">
        {/* Metric 1: Current mapped water */}
        <div className="stat-item">
          <div className="stat-icon-row">
            <Droplets size={22} strokeWidth={1.8} />
          </div>
          <div className="stat-label">Current mapped water</div>
          <div className="stat-value" style={{ color: !hasRecord ? '#dc2626' : undefined, fontSize: !hasRecord ? '1.2rem' : undefined }}>
            {waterValue}
          </div>
        </div>

        {/* Metric 2: Change since baseline */}
        <div className="stat-item">
          <div className="stat-icon-row">
            {isPositiveCapacity ? <Sparkles size={22} color="#10b981" /> : <TrendingDown size={22} strokeWidth={1.8} />}
          </div>
          <div className="stat-label">
            {!hasRecord ? 'Telemetry Status' : (selectedYear < 1980 ? '1970s Primal Capacity' : 'Change since baseline')}
          </div>
          <div 
            className={`stat-value ${isPositiveCapacity ? 'positive' : 'negative'}`}
            style={{ 
              color: !hasRecord ? '#dc2626' : (isPositiveCapacity ? '#10b981' : '#ea580c'),
              fontSize: !hasRecord ? '1.2rem' : undefined 
            }}
          >
            {changeValue}
          </div>
        </div>

        {/* Metric 3: Potential hotspots */}
        <div 
          className="stat-item"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            if (wetland.hotspots && wetland.hotspots.length > 0) {
              onHotspotClick(wetland.hotspots[0]);
            }
          }}
          title="Click to view hotspots"
        >
          <div className="stat-icon-row">
            <MapPin size={22} strokeWidth={1.8} />
          </div>
          <div className="stat-label">Potential hotspots</div>
          <div className="stat-value" style={{ color: !hasRecord ? '#dc2626' : (condition.builtUpEncroached === 0 ? '#10b981' : undefined), fontSize: !hasRecord ? '1.2rem' : undefined }}>
            {!hasRecord ? 'No Record' : (condition.builtUpEncroached === 0 ? '0 (Pristine)' : wetland.metrics.hotspotsCount)}
          </div>
        </div>

        {/* Metric 4: Comparison */}
        <div className="stat-item">
          <div className="stat-icon-row">
            <Calendar size={22} strokeWidth={1.8} />
          </div>
          <div className="stat-label">Comparison</div>
          <div className="stat-value" style={{ fontSize: '1.2rem', color: !hasRecord ? '#dc2626' : (selectedYear < 1980 ? '#0284c7' : undefined) }}>
            {!hasRecord ? `${selectedYear} (No Record)` : (selectedYear === 2026 ? '2020 vs 2026' : `${selectedYear} vs 2026`)}
          </div>
        </div>
      </div>

      {/* Illustrative note */}
      <p className="illustrative-note">
        Illustrative interface only. These figures are sample values, not actual satellite-analysis results.
      </p>

      {/* Horizontal divider */}
      <hr className="card-divider" />

      {/* Interactive map layers section */}
      <div className="layers-section">
        <div className="layers-section-header">
          <h3 className="layers-section-title">Interactive map layers</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Toggle to filter
          </span>
        </div>

        <ul className="layer-list">
          {/* Layer 1: Historical water boundary */}
          <li 
            className={`layer-list-item ${layerVisibility.historicalWater ? 'active' : ''}`}
            onClick={() => toggleLayer('historicalWater')}
          >
            <div className="layer-item-left">
              <span 
                className="layer-bullet-bullet" 
                style={{ backgroundColor: '#0284c7' }}
              />
              <span className="layer-name">Historical water boundary</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="layer-subtext">
                {selectedYear < 1980 ? `1970s Primal (${condition.waterArea} ha)` : '2020 Baseline (100 ha)'}
              </span>
              <input 
                type="checkbox" 
                className="layer-checkbox"
                checked={layerVisibility.historicalWater}
                onChange={() => {}} // handled by li onClick
              />
            </div>
          </li>

          {/* Layer 2: Latest water boundary */}
          <li 
            className={`layer-list-item ${layerVisibility.latestWater ? 'active' : ''}`}
            onClick={() => toggleLayer('latestWater')}
          >
            <div className="layer-item-left">
              <span 
                className="layer-bullet-bullet" 
                style={{ backgroundColor: '#059669' }}
              />
              <span className="layer-name">Latest water boundary</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="layer-subtext">{selectedYear} ({waterValue})</span>
              <input 
                type="checkbox" 
                className="layer-checkbox"
                checked={layerVisibility.latestWater}
                onChange={() => {}}
              />
            </div>
          </li>

          {/* Layer 3: Areas of detected change */}
          <li 
            className={`layer-list-item ${layerVisibility.detectedChanges ? 'active' : ''}`}
            onClick={() => toggleLayer('detectedChanges')}
          >
            <div className="layer-item-left">
              <span 
                className="layer-bullet-bullet" 
                style={{ backgroundColor: '#f59e0b' }}
              />
              <span className="layer-name">Areas of detected change</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="layer-subtext">-22 ha lost</span>
              <input 
                type="checkbox" 
                className="layer-checkbox"
                checked={layerVisibility.detectedChanges}
                onChange={() => {}}
              />
            </div>
          </li>

          {/* Layer 4: Potential built-up encroachment */}
          <li 
            className={`layer-list-item ${layerVisibility.encroachments ? 'active' : ''}`}
            onClick={() => toggleLayer('encroachments')}
          >
            <div className="layer-item-left">
              <span 
                className="layer-bullet-bullet" 
                style={{ backgroundColor: '#ef4444' }}
              />
              <span className="layer-name">Potential built-up encroachment</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="layer-subtext">4 zones detected</span>
              <input 
                type="checkbox" 
                className="layer-checkbox"
                checked={layerVisibility.encroachments}
                onChange={() => {}}
              />
            </div>
          </li>
        </ul>

        {/* Circular Down Arrow Button matching the user mockup */}
        <div className="expand-button-wrapper">
          <button 
            className="expand-circle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse layer options" : "Expand layer controls & opacity"}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Expanded Controls Drawer */}
        {isExpanded && (
          <div className="expandable-layers-details">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem' }}>
              <Sliders size={14} />
              <span>Layer Opacity & Advanced Filter</span>
            </div>

            <div className="layer-opacity-control">
              <span>Historical Boundary Opacity</span>
              <input 
                type="range" 
                min="0.1" 
                max="1.0" 
                step="0.05"
                className="layer-opacity-slider"
                value={layerOpacity.historicalWater}
                onChange={(e) => setLayerOpacity(prev => ({ ...prev, historicalWater: parseFloat(e.target.value) }))}
              />
              <span>{Math.round(layerOpacity.historicalWater * 100)}%</span>
            </div>

            <div className="layer-opacity-control">
              <span>Latest Boundary Opacity</span>
              <input 
                type="range" 
                min="0.1" 
                max="1.0" 
                step="0.05"
                className="layer-opacity-slider"
                value={layerOpacity.latestWater}
                onChange={(e) => setLayerOpacity(prev => ({ ...prev, latestWater: parseFloat(e.target.value) }))}
              />
              <span>{Math.round(layerOpacity.latestWater * 100)}%</span>
            </div>

            <div className="layer-opacity-control">
              <span>Change Detection Highlight</span>
              <input 
                type="range" 
                min="0.1" 
                max="1.0" 
                step="0.05"
                className="layer-opacity-slider"
                value={layerOpacity.detectedChanges}
                onChange={(e) => setLayerOpacity(prev => ({ ...prev, detectedChanges: parseFloat(e.target.value) }))}
              />
              <span>{Math.round(layerOpacity.detectedChanges * 100)}%</span>
            </div>

            <div className="layer-opacity-control">
              <span>500m Eco-Buffer Zone</span>
              <button
                className="btn-pill"
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => toggleLayer('bufferZone')}
              >
                {layerVisibility.bufferZone ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{layerVisibility.bufferZone ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposedDesignCard;
