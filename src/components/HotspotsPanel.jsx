import React from 'react';
import { AlertTriangle, MapPin, ExternalLink, Activity } from 'lucide-react';

const HotspotsPanel = ({ wetland, activeHotspot, onSelectHotspot }) => {
  return (
    <div className="hotspots-quick-card">
      <div className="hotspots-quick-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <AlertTriangle size={18} color="#dc2626" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Encroachment Hotspots
          </h3>
        </div>
        <div className="hotspots-badge">
          <Activity size={12} />
          <span>{(wetland?.hotspots || []).length} Priority Alerts</span>
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
        Identified via multi-temporal Sentinel-2 MSI spectral anomaly detection and NDVI/NDWI delta analysis.
      </p>

      <div className="hotspots-list">
        {(wetland?.hotspots || []).map((hs) => {
          const isSelected = activeHotspot && activeHotspot.id === hs.id;
          return (
            <div 
              key={hs.id} 
              className={`hotspot-card-item ${isSelected ? 'selected' : ''}`}
              style={{
                borderLeftColor: hs.statusColor,
                backgroundColor: isSelected ? 'var(--bg-card)' : undefined,
                boxShadow: isSelected ? 'var(--shadow-md)' : undefined,
                borderColor: isSelected ? hs.statusColor : undefined
              }}
              onClick={() => onSelectHotspot(hs)}
            >
              <div className="hotspot-item-header">
                <span className="hotspot-item-title">{hs.title}</span>
                <span className="hotspot-item-loss">
                  {hs.lossArea}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                <MapPin size={11} />
                <span>{hs.locationName}</span>
                <span>•</span>
                <span style={{ 
                  color: hs.severity === 'Critical' ? '#dc2626' : hs.severity === 'High' ? '#ea580c' : '#d97706',
                  fontWeight: 700 
                }}>
                  {hs.severity} Risk
                </span>
              </div>

              <div className="hotspot-item-desc">
                {hs.description}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.45rem', paddingTop: '0.45rem', borderTop: '1px solid var(--border-light)', fontSize: '0.72rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Detected: <strong>{hs.detectedDate}</strong>
                </span>
                <span style={{ color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  Fly to Coordinates <ExternalLink size={10} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotspotsPanel;
