import React from 'react';
import { 
  FileText, 
  Printer, 
  X 
} from 'lucide-react';

const ReportModal = ({ isOpen, onClose, wetland }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileText size={20} color="#0284c7" />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Wetland EO Satellite Audit & Compliance Report
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Official Earth Observation Intelligence Briefing • ISO 19115 Metadata Compliant
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '0.3rem' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Executive Summary */}
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Wetland Site</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>{wetland.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>🏘️ Village</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0284c7' }}>{wetland.village || 'Pamohi & Azara'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>🏛️ District</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0369a1' }}>{wetland.district || 'Kamrup'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Water</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{wetland.metrics.currentWaterArea}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Baseline Change</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }}>{wetland.metrics.changePercent}</div>
              </div>
            </div>
          </div>

          {/* Finding summary text */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              1. Satellite Change Detection Assessment (2020–2026)
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Multi-spectral analysis utilizing Normalized Difference Water Index (NDWI) algorithms reveals a continuous shrinkage of open water surface area from an initial baseline of <strong>100.0 hectares (2020)</strong> to <strong>78.0 hectares (2026)</strong>. This represents an unprecedented loss of <strong>22.0 hectares (-22%)</strong> within the designated wetland boundary.
            </p>
          </div>

          {/* Hotspots Breakdown */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-main)' }}>
              2. Identified High-Priority Encroachment Hotspots
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(wetland?.hotspots || []).map((hs, i) => (
                <div 
                  key={hs.id} 
                  style={{ 
                    padding: '0.65rem 0.85rem', 
                    borderRadius: 'var(--radius-sm)', 
                    background: 'var(--bg-subtle)',
                    borderLeft: `4px solid ${hs.statusColor}`,
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.2rem' }}>
                    <span>#{i + 1}. {hs.title}</span>
                    <span style={{ color: '#dc2626' }}>{hs.lossArea} lost ({hs.severity})</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    GPS Centroid: {hs.lat}° N, {hs.lng}° E • Status: {hs.actionStatus}
                  </div>
                  <div style={{ color: 'var(--text-main)', fontSize: '0.78rem' }}>
                    {hs.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Statutory Actions */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              3. Recommended Regulatory Directives
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Issue immediate stay order under Wetlands (Conservation and Management) Rules on unauthorized sand infill.</li>
              <li>Deploy unmanned aerial drone (UAV) LiDAR mapping for millimeter-accurate boundary demarcation.</li>
              <li>Re-establish natural hydrological feeder channels blocked by the northern railway embankment.</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-pill" onClick={onClose}>
            Close
          </button>
          <button className="btn-pill primary" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
