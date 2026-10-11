import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  RotateCcw, 
  Play, 
  Pause, 
  Crosshair, 
  SlidersHorizontal, 
  MapPin,
  Calendar,
  Edit3
} from 'lucide-react';
import { MAP_BASEMAPS, HISTORICAL_EPOCHS, getWetlandConditionForYear } from '../data/wetlandsData';
import { locationService } from '../services/locationService';

const InteractiveMap = ({
  wetland,
  layerVisibility,
  layerOpacity,
  selectedYear,
  setSelectedYear,
  isPlaying,
  setIsPlaying,
  activeHotspot,
  setActiveHotspot,
  splitMode,
  setSplitMode
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersGroupRef = useRef({});
  const markersGroupRef = useRef(null);
  const inspectorMarkerRef = useRef(null);

  const [activeBasemap, setActiveBasemap] = useState('osm');
  const [inspectorData, setInspectorData] = useState(null);
  const [customYearInput, setCustomYearInput] = useState(selectedYear);
  const [isEditingYear, setIsEditingYear] = useState(true);

  const yearCondition = getWetlandConditionForYear(wetland, selectedYear);

  useEffect(() => {
    setCustomYearInput(selectedYear);
  }, [selectedYear]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: wetland.coordinates,
      zoom: wetland.zoom,
      zoomControl: false,
      attributionControl: true
    });

    // Custom zoom control in bottom-left
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Initial base tile layer
    const baseConfig = MAP_BASEMAPS[activeBasemap] || MAP_BASEMAPS.osm;
    tileLayerRef.current = L.tileLayer(baseConfig.url, {
      attribution: baseConfig.attribution,
      maxZoom: baseConfig.maxZoom || 19,
      subdomains: baseConfig.subdomains || 'abc'
    }).addTo(map);

    // Initialize layer groups
    layersGroupRef.current = {
      bufferZone: L.layerGroup().addTo(map),
      historicalWater: L.layerGroup().addTo(map),
      latestWater: L.layerGroup().addTo(map),
      detectedChanges: L.layerGroup().addTo(map),
      encroachments: L.layerGroup().addTo(map)
    };

    markersGroupRef.current = L.layerGroup().addTo(map);

    // Map Inspector click handler
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      // Calculate mock NDWI based on proximity to center
      const distFromCenter = Math.hypot(lat - wetland.coordinates[0], lng - wetland.coordinates[1]);
      const estimatedNdwi = Math.max(-0.4, (0.55 - distFromCenter * 25)).toFixed(2);
      
      let classification = 'Water Body';
      if (estimatedNdwi < -0.1) classification = 'Built-up / Urban Impervious';
      else if (estimatedNdwi < 0.15) classification = 'Marshland / Mudflat / Silt';
      else if (estimatedNdwi < 0.35) classification = 'Shallow / Seasonally Inundated';

      setInspectorData({
        lat: lat.toFixed(5),
        lng: lng.toFixed(5),
        village: wetland.village || 'Local Village Sector',
        district: wetland.district || 'District Area',
        ndwi: estimatedNdwi,
        classification
      });

      locationService.reverseGeocode(lat, lng).then(geo => {
        if (geo && (geo.village || geo.district)) {
          setInspectorData(prev => prev ? {
            ...prev,
            village: geo.village || prev.village,
            district: geo.district || prev.district
          } : null);
        }
      }).catch(() => {});

      if (inspectorMarkerRef.current) {
        map.removeLayer(inspectorMarkerRef.current);
      }

      const inspectIcon = L.divIcon({
        className: 'custom-inspect-icon',
        html: `<div style="width: 14px; height: 14px; background: #3b82f6; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      inspectorMarkerRef.current = L.marker([lat, lng], { icon: inspectIcon }).addTo(map);
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wetland.id]);

  // Update basemap when activeBasemap changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const baseConfig = MAP_BASEMAPS[activeBasemap] || MAP_BASEMAPS.satellite;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(baseConfig.url, {
      attribution: baseConfig.attribution,
      maxZoom: baseConfig.maxZoom || 19,
      subdomains: baseConfig.subdomains || 'abc'
    }).addTo(mapInstanceRef.current);
    
    // Ensure base tile is at the bottom
    tileLayerRef.current.bringToBack();
  }, [activeBasemap]);

  // Draw GeoJSON / Vector polygons based on visibility and year
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const { 
      bufferZone: bufferGrp, 
      historicalWater: histGrp, 
      latestWater: latestGrp, 
      detectedChanges: changesGrp, 
      encroachments: encGrp 
    } = layersGroupRef.current;

    // Clear previous vector layers
    bufferGrp.clearLayers();
    histGrp.clearLayers();
    latestGrp.clearLayers();
    changesGrp.clearLayers();
    encGrp.clearLayers();

    const geom = wetland.geometries;
    if (!geom) return;

    // 1. Buffer zone (Eco-sensitive 500m)
    if (layerVisibility.bufferZone && geom.bufferZone) {
      const poly = L.polygon(geom.bufferZone, {
        color: '#8b5cf6',
        weight: 1.5,
        dashArray: '6, 6',
        fillColor: '#8b5cf6',
        fillOpacity: 0.05
      });
      poly.bindTooltip('500m Eco-Sensitive Buffer Zone', { sticky: true });
      bufferGrp.addLayer(poly);
    }

    // 2. Historical Water Boundary (1970s - 2020 Baseline)
    if (layerVisibility.historicalWater && geom.historicalWater && yearCondition.hasSatelliteRecord) {
      const is1970s = selectedYear < 1980;
      const histPoly = L.polygon(geom.historicalWater, {
        color: is1970s ? '#0284c7' : '#0369a1',
        weight: is1970s ? 3.5 : 2,
        fillColor: '#0284c7',
        fillOpacity: (is1970s ? 0.45 : 0.22) * layerOpacity.historicalWater
      });
      histPoly.bindTooltip(`Historical Water Basin (${selectedYear < 1980 ? '1970s Primal Basin: ' + (yearCondition.waterArea || 'Pristine') + ' ha' : 'Baseline Reference'})`, { sticky: true });
      histGrp.addLayer(histPoly);
    }

    // 3. Latest Water Boundary (scaled to selectedYear)
    if (layerVisibility.latestWater && geom.latestWater && yearCondition.hasSatelliteRecord) {
      const is1970s = selectedYear < 1980;
      const latestPoly = L.polygon(geom.latestWater, {
        color: is1970s ? '#38bdf8' : '#059669',
        weight: 2.5,
        fillColor: is1970s ? '#0284c7' : '#10b981',
        fillOpacity: (is1970s ? 0.5 : 0.45) * layerOpacity.latestWater
      });
      latestPoly.bindTooltip(`Mapped Water Surface (${selectedYear}: ${yearCondition.waterArea || 'Pristine'} ha • ${yearCondition.sensor})`, { sticky: true });
      latestGrp.addLayer(latestPoly);
    }

    // 4. Areas of detected change (only in eras where loss occurred)
    if (layerVisibility.detectedChanges && geom.detectedChanges && selectedYear >= 1990) {
      geom.detectedChanges.forEach((changeCoords, idx) => {
        const changePoly = L.polygon(changeCoords, {
          color: '#f59e0b',
          weight: 2,
          dashArray: '4, 4',
          fillColor: '#ea580c',
          fillOpacity: 0.55 * layerOpacity.detectedChanges
        });
        changePoly.bindTooltip(`Change Zone #${idx + 1}: Desiccated & Encroached Sector (${selectedYear})`, { sticky: true });
        changesGrp.addLayer(changePoly);
      });
    }

    // 5. Encroachment Polygons (Zero in 1970s!)
    if (layerVisibility.encroachments && geom.encroachments && selectedYear >= 1995) {
      geom.encroachments.forEach((encCoords, idx) => {
        const encPoly = L.polygon(encCoords, {
          color: '#ef4444',
          weight: 2.5,
          fillColor: '#dc2626',
          fillOpacity: 0.65 * layerOpacity.encroachments
        });
        const hp = wetland.hotspots ? wetland.hotspots[idx] : null;
        if (hp) {
          encPoly.bindTooltip(`Hotspot Alert (${selectedYear}): ${hp.title} (${hp.lossArea})`, { sticky: true });
        }
        encGrp.addLayer(encPoly);
      });
    }

  }, [wetland, layerVisibility, layerOpacity, selectedYear, yearCondition]);

  // Render Hotspots markers
  useEffect(() => {
    if (!markersGroupRef.current || !mapInstanceRef.current) return;
    markersGroupRef.current.clearLayers();

    if (!layerVisibility.encroachments) return;

    (wetland.hotspots || []).forEach((hs) => {
      const icon = L.divIcon({
        className: 'custom-pulsing-marker',
        html: `
          <div class="pulsing-marker-wrapper">
            <div class="pulsing-wave" style="border-color: ${hs.statusColor};"></div>
            <div class="pulsing-dot" style="background-color: ${hs.statusColor};"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([hs.lat, hs.lng], { icon });

      // Rich popup content
      const popupHtml = `
        <div style="font-family: inherit; min-width: 210px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-weight: 700; font-size: 13px; color: #0f172a;">${hs.title}</span>
            <span style="background: #fee2e2; color: #dc2626; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 9999px;">
              ${hs.severity}
            </span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            📍 ${hs.locationName}
          </div>
          <div style="font-size: 12px; margin-bottom: 6px; line-height: 1.35; color: #334155;">
            ${hs.description}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 11px;">
            <div><strong>Lost Area:</strong> <span style="color: #dc2626; font-weight: 700;">${hs.lossArea}</span></div>
            <div><strong>Detected:</strong> ${hs.detectedDate}</div>
          </div>
          <div style="margin-top: 6px; font-size: 10px; color: #0284c7; font-weight: 600;">
            Status: ${hs.actionStatus}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      
      marker.on('click', () => {
        setActiveHotspot(hs);
      });

      markersGroupRef.current.addLayer(marker);
    });
  }, [wetland, layerVisibility.encroachments, setActiveHotspot]);

  // When activeHotspot changes from an external click (e.g. from sidebar), fly to it
  useEffect(() => {
    if (activeHotspot && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([activeHotspot.lat, activeHotspot.lng], 16, {
        animate: true,
        duration: 1.2
      });
    }
  }, [activeHotspot]);

  // Center & Reset Map View
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(wetland.coordinates, wetland.zoom, {
        duration: 1.0
      });
    }
  };

  return (
    <div className="map-container-card">
      {/* Map Toolbar */}
      <div className="map-toolbar">
        <div className="map-toolbar-left">
          <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
            <Layers size={16} /> Basemap:
          </span>
          <button 
            className={`tab-btn ${activeBasemap === 'osm' ? 'active' : ''}`}
            onClick={() => setActiveBasemap('osm')}
          >
            OpenStreetMap
          </button>
          <button 
            className={`tab-btn ${activeBasemap === 'satellite' ? 'active' : ''}`}
            onClick={() => setActiveBasemap('satellite')}
          >
            Satellite EO
          </button>
          <button 
            className={`tab-btn ${activeBasemap === 'cartoLight' ? 'active' : ''}`}
            onClick={() => setActiveBasemap('cartoLight')}
          >
            GIS Light
          </button>
          <button 
            className={`tab-btn ${activeBasemap === 'cartoDark' ? 'active' : ''}`}
            onClick={() => setActiveBasemap('cartoDark')}
          >
            Night EO
          </button>
          <button 
            className={`tab-btn ${activeBasemap === 'topo' ? 'active' : ''}`}
            onClick={() => setActiveBasemap('topo')}
          >
            Topographic
          </button>
        </div>

        <div className="map-toolbar-right">
          {/* Split Mode Toggle */}
          <button 
            className={`btn-pill ${splitMode ? 'primary' : ''}`}
            onClick={() => setSplitMode(!splitMode)}
            title="Toggle Baseline vs Current Comparison Mode"
          >
            <SlidersHorizontal size={14} />
            <span>{splitMode ? 'Exit Split View' : 'Compare 2020 vs 2026'}</span>
          </button>

          {/* Reset View */}
          <button 
            className="btn-pill"
            onClick={handleResetView}
            title="Reset map view to wetland extent"
          >
            <RotateCcw size={14} />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Map Element Container */}
      <div className="leaflet-map-wrapper">
        <div ref={mapContainerRef} className="map-canvas" id="interactive-wetland-map" />

        {/* Live Satellite Status Pill */}
        <div className="map-floating-pill">
          <div 
            className="live-indicator" 
            style={{ 
              background: selectedYear < 1980 ? '#38bdf8' : (selectedYear < 2016 ? '#f59e0b' : '#10b981') 
            }} 
          />
          <span>{yearCondition.sensor}</span>
          <span style={{ color: 'var(--text-muted)' }}>
            • {selectedYear < 1980 ? 'Archival Telemetry (USGS/NASA)' : `Cloud: ${wetland.metrics.cloudCoverage}`}
          </span>
        </div>

        {/* Map Legend Overlay */}
        <div className="map-floating-legend">
          <div className="legend-title">EO Map Layer Legend ({selectedYear})</div>
          
          {layerVisibility.historicalWater && (
            <div className="legend-row">
              <div className="legend-swatch" style={{ background: '#0284c7' }} />
              <span>{selectedYear < 1980 ? `1970s Primal Basin (${yearCondition.waterArea} ha)` : '2020 Baseline Water (100 ha)'}</span>
            </div>
          )}

          {layerVisibility.latestWater && (
            <div className="legend-row">
              <div className="legend-swatch" style={{ background: selectedYear < 1980 ? '#38bdf8' : '#10b981' }} />
              <span>{selectedYear} Mapped Extent ({yearCondition.waterArea} ha)</span>
            </div>
          )}

          {layerVisibility.detectedChanges && (
            <div className="legend-row">
              <div className="legend-swatch" style={{ background: '#ea580c', border: '1.5px dashed #f59e0b' }} />
              <span>{selectedYear < 1990 ? 'Zero Detected Loss (Pre-1990)' : 'Areas of Detected Loss (-22 ha)'}</span>
            </div>
          )}

          {layerVisibility.encroachments && (
            <div className="legend-row">
              <div className="legend-swatch" style={{ background: '#dc2626' }} />
              <span>{selectedYear < 1985 ? 'Zero Encroachment (0.0 ha Pristine)' : 'Encroachment Hotspot Perimeter'}</span>
            </div>
          )}

          {layerVisibility.bufferZone && (
            <div className="legend-row">
              <div className="legend-swatch" style={{ background: 'transparent', border: '2px dashed #8b5cf6' }} />
              <span>500m Eco-Sensitive Buffer</span>
            </div>
          )}
        </div>

        {/* Floating Active Village & District HUD Badge */}
        <div 
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            zIndex: 500,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(10px)',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#ffffff',
            fontSize: '0.8rem',
            pointerEvents: 'none'
          }}
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0
          }}>
            <MapPin size={14} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 800, color: '#f8fafc' }}>
                🏘️ {wetland.village || 'Pamohi & Azara'}
              </span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                🏛️ {wetland.district || 'Kamrup Metropolitan'}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              {wetland.name} ({wetland.state})
            </div>
          </div>
        </div>

        {/* Inspector Tooltip Box (when user clicks on map) */}
        {inspectorData && (
          <div 
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 500,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(8px)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-light)',
              fontSize: '0.78rem',
              minWidth: '240px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Crosshair size={15} color="#0284c7" /> Satellite Inspector
              </span>
              <button 
                onClick={() => setInspectorData(null)}
                style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '0.4rem 0.6rem', borderRadius: '6px', marginBottom: '0.45rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.78rem' }}>
                🏘️ Village: <span style={{ color: '#0284c7' }}>{inspectorData.village}</span>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.78rem', marginTop: '2px' }}>
                🏛️ District: <span style={{ color: '#0369a1' }}>{inspectorData.district}</span>
              </div>
            </div>

            <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem', fontSize: '0.74rem' }}>
              Coords: {inspectorData.lat}° N, {inspectorData.lng}° E
            </div>
            <div style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.2rem' }}>
              NDWI Score: <span style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{inspectorData.ndwi}</span>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              Classification: <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{inspectorData.classification}</span>
            </div>
          </div>
        )}

        {/* Central No Satellite Record HUD Alert */}
        {!yearCondition.hasSatelliteRecord && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 600,
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '2px dashed #ef4444',
            padding: '1.25rem 2rem',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#ffffff',
            maxWidth: '480px',
            pointerEvents: 'none',
            boxShadow: '0 12px 35px rgba(0,0,0,0.6)'
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>⚠️</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f87171', letterSpacing: '0.02em' }}>
              NO SATELLITE RECORD FOR YEAR {selectedYear}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.5rem', lineHeight: 1.5 }}>
              {yearCondition.recordNotice || `Systematic spaceborne Earth Observation began with Landsat-1 in 1972. No satellite telemetry, water classification, or sensor imagery exists for ${selectedYear}.`}
            </div>
            <div style={{ 
              marginTop: '0.75rem', 
              fontSize: '0.72rem', 
              padding: '0.25rem 0.65rem', 
              borderRadius: '9999px', 
              background: 'rgba(239, 68, 68, 0.2)', 
              color: '#fca5a5',
              display: 'inline-block',
              fontWeight: 700
            }}>
              Pre-Satellite Era • Telemetry Archive Starts at 1970/1972
            </div>
          </div>
        )}
      </div>

      {/* Temporal Timeline Scrub Bar & Historical Epochs */}
      <div className="temporal-control-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button 
              className="temporal-playback-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              title="Animate historical evolution across satellite archives (1970s–2026)"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause Timeline' : 'Animate (1970s–2026)'}</span>
            </button>

            <button
              onClick={() => setIsEditingYear(!isEditingYear)}
              className="temporal-edit-toggle-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: isEditingYear ? '#0284c7' : 'var(--bg-subtle)',
                color: isEditingYear ? '#ffffff' : 'var(--text-main)',
                border: '1px solid var(--border-light)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Edit3 size={13} />
              <span>{isEditingYear ? 'Hide Edit Studio' : 'Edit / Custom Year'}</span>
            </button>
          </div>

          {/* Quick Epoch Selector Pills (1970s, 1980s, 1990s, 2000s, 2010s, 2020s, 2026) */}
          <div className="temporal-epoch-pills">
            {HISTORICAL_EPOCHS.map((epoch) => {
              const isActive = (epoch.year === selectedYear) || 
                (epoch.id === '1970s' && selectedYear < 1980) ||
                (epoch.id === '1980s' && selectedYear >= 1980 && selectedYear < 1990) ||
                (epoch.id === '1990s' && selectedYear >= 1990 && selectedYear < 2000) ||
                (epoch.id === '2000s' && selectedYear >= 2000 && selectedYear < 2010) ||
                (epoch.id === '2010s' && selectedYear >= 2010 && selectedYear < 2020);

              return (
                <button
                  key={epoch.id}
                  onClick={() => {
                    setSelectedYear(epoch.year);
                    if (isPlaying) setIsPlaying(false);
                  }}
                  className={`epoch-pill-btn ${isActive ? 'active' : ''}`}
                  title={`${epoch.title} (${epoch.sensor})`}
                >
                  {epoch.label}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Surface:</span>
            <strong style={{ color: selectedYear < 1980 ? '#0284c7' : 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              {yearCondition.waterArea} ha
            </strong>
            <span style={{ 
              fontSize: '0.72rem', 
              padding: '0.1rem 0.45rem', 
              borderRadius: '9999px',
              fontWeight: 700,
              background: yearCondition.comparisonVsPresent >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 88, 12, 0.15)',
              color: yearCondition.comparisonVsPresent >= 0 ? '#10b981' : '#ea580c'
            }}>
              {yearCondition.comparisonVsPresent >= 0 ? `+${yearCondition.comparisonVsPresent}%` : `${yearCondition.comparisonVsPresent}%`}
            </span>
          </div>
        </div>

        {/* 1970 - 2026 Range Scrub Slider */}
        <div className="temporal-slider-container" style={{ width: '100%', marginTop: '0.4rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7' }}>
              1970
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Landsat-1</span>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="range"
              min="1970"
              max="2026"
              step="1"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
                if (isPlaying) setIsPlaying(false);
              }}
              className="temporal-slider"
            />
            {/* Decade tick markers */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '0 4px', 
              marginTop: '-4px', 
              fontSize: '0.65rem', 
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)'
            }}>
              <span>'70</span>
              <span>'80</span>
              <span>'90</span>
              <span>'00</span>
              <span>'10</span>
              <span>'20</span>
              <span style={{ color: '#0284c7', fontWeight: 700 }}>'26</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#10b981' }}>
              2026
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Sentinel-2</span>
          </div>

          <div className="temporal-year-badge" style={{ 
            background: !yearCondition.hasSatelliteRecord
              ? 'rgba(239, 68, 68, 0.15)' 
              : (selectedYear < 1980 ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-subtle)'),
            color: !yearCondition.hasSatelliteRecord 
              ? '#dc2626' 
              : (selectedYear < 1980 ? '#0284c7' : 'var(--text-main)'),
            border: !yearCondition.hasSatelliteRecord 
              ? '1.5px solid #dc2626' 
              : (selectedYear < 1980 ? '1.5px solid #0284c7' : '1px solid var(--border-light)'),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 1.1
          }}>
            <span style={{ fontSize: '0.95rem' }}>{selectedYear}</span>
            <span style={{ 
              fontSize: '0.6rem', 
              color: !yearCondition.hasSatelliteRecord ? '#dc2626' : 'var(--text-muted)', 
              fontWeight: 700 
            }}>
              {!yearCondition.hasSatelliteRecord ? 'NO RECORD' : (selectedYear < 1980 ? '1970s ERA' : (selectedYear === 2026 ? 'PRESENT' : 'ARCHIVE'))}
            </span>
          </div>
        </div>
      </div>

      {/* Dedicated Historical Condition & Custom Year Edit Option Below */}
      {isEditingYear && (
        <div className="historical-edit-panel">
          <div className="historical-edit-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '6px', 
                background: !yearCondition.hasSatelliteRecord ? '#dc2626' : (selectedYear < 1980 ? '#0284c7' : '#0369a1'), 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Calendar size={13} />
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  Historical Satellite Analysis & Year Edit Controller
                </span>
                <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  (Enter Any Year e.g. 1800, 1970, 2026 • Earth Observation Archive)
                </span>
              </div>
            </div>

            {/* Quick Year Steppers */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => setSelectedYear(selectedYear - 10)}
                className="year-stepper-btn"
                title="Step backward 10 years"
              >
                -10 Yrs
              </button>
              <button
                onClick={() => setSelectedYear(selectedYear - 1)}
                className="year-stepper-btn"
                title="Step backward 1 year"
              >
                -1 Yr
              </button>
              <button
                onClick={() => setSelectedYear(selectedYear + 1)}
                className="year-stepper-btn"
                title="Step forward 1 year"
              >
                +1 Yr
              </button>
              <button
                onClick={() => setSelectedYear(selectedYear + 10)}
                className="year-stepper-btn"
                title="Step forward 10 years"
              >
                +10 Yrs
              </button>
            </div>
          </div>

          {/* Input & Key Landmarks Row */}
          <div className="historical-edit-row">
            {/* Custom Year Edit Input (Unrestricted to any year entered by user) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Enter Target Year:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <input
                  type="number"
                  value={customYearInput}
                  placeholder="e.g. 1800..."
                  onChange={(e) => {
                    setCustomYearInput(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt(customYearInput);
                      if (!isNaN(val)) {
                        setSelectedYear(val);
                        if (isPlaying) setIsPlaying(false);
                      }
                    }
                  }}
                  onBlur={() => {
                    const val = parseInt(customYearInput);
                    if (!isNaN(val)) {
                      setSelectedYear(val);
                    }
                  }}
                  className="custom-year-input"
                  style={{ width: '92px' }}
                />
                <button
                  onClick={() => {
                    const val = parseInt(customYearInput);
                    if (!isNaN(val)) {
                      setSelectedYear(val);
                      if (isPlaying) setIsPlaying(false);
                    }
                  }}
                  className="custom-year-apply-btn"
                >
                  Apply Year
                </button>
              </div>
            </div>

            {/* Key Historic Landmark Buttons */}
            <div className="historical-preset-chips">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Landmark Eras:
              </span>
              <button 
                className={`preset-chip ${selectedYear === 1800 ? 'active' : ''}`}
                onClick={() => setSelectedYear(1800)}
                style={{
                  background: selectedYear === 1800 ? '#dc2626' : undefined,
                  borderColor: selectedYear === 1800 ? '#dc2626' : undefined,
                  color: selectedYear === 1800 ? '#ffffff' : undefined
                }}
                title="Year 1800 (Pre-satellite era - Shows No Record notice)"
              >
                🕰️ 1800 (Pre-Satellite)
              </button>
              <button 
                className={`preset-chip ${selectedYear === 1970 ? 'active' : ''}`}
                onClick={() => setSelectedYear(1970)}
                title="1970 Default Start Observation Year"
              >
                🌿 1970 (Default Start)
              </button>
              <button 
                className={`preset-chip ${selectedYear === 1972 ? 'active' : ''}`}
                onClick={() => setSelectedYear(1972)}
                title="Landsat-1 MSS inaugural satellite mission launch"
              >
                🚀 1972 (Landsat-1 MSS)
              </button>
              <button 
                className={`preset-chip ${selectedYear === 1984 ? 'active' : ''}`}
                onClick={() => setSelectedYear(1984)}
                title="Landsat-5 TM 30m resolution multispectral era"
              >
                🛰️ 1984 (Landsat-5 TM)
              </button>
              <button 
                className={`preset-chip ${selectedYear === 2020 ? 'active' : ''}`}
                onClick={() => setSelectedYear(2020)}
                title="2020 Baseline reference"
              >
                📍 2020 (Baseline)
              </button>
              <button 
                className={`preset-chip ${selectedYear === 2026 ? 'active' : ''}`}
                onClick={() => setSelectedYear(2026)}
                title="2026 Current Sentinel-2 monitoring"
              >
                ⚡ 2026 (Live Sentinel-2)
              </button>
            </div>
          </div>

          {/* NO SATELLITE RECORD ALERT BANNER (Shown if year has no record e.g. 1800) */}
          {!yearCondition.hasSatelliteRecord && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1.5px dashed #ef4444',
              borderRadius: '8px',
              padding: '0.8rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              color: 'var(--text-main)',
              animation: 'fadeIn 0.2s ease-in'
            }}>
              <span style={{ fontSize: '1.4rem' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.9rem' }}>
                  NO SATELLITE RECORD AVAILABLE FOR YEAR {selectedYear}
                </div>
                <div style={{ fontSize: '0.78rem', marginTop: '0.2rem', lineHeight: 1.45 }}>
                  {yearCondition.recordNotice || `Systematic spaceborne Earth Observation began with Landsat-1 in 1972. No satellite sensor telemetry, surface water classifications, or digital imagery records exist for the year ${selectedYear}.`}
                </div>
              </div>
            </div>
          )}

          {/* Satellite Condition Telemetry for Selected Year */}
          <div className="historical-condition-card" style={{
            background: !yearCondition.hasSatelliteRecord 
              ? 'rgba(239, 68, 68, 0.04)' 
              : (selectedYear < 1980 ? 'rgba(2, 132, 199, 0.07)' : 'var(--bg-subtle)'),
            borderColor: !yearCondition.hasSatelliteRecord 
              ? 'rgba(239, 68, 68, 0.35)' 
              : (selectedYear < 1980 ? 'rgba(2, 132, 199, 0.35)' : 'var(--border-light)')
          }}>
            <div className="historical-condition-grid">
              <div className="condition-cell">
                <span className="condition-cell-label">🛰️ Sensor Mission ({selectedYear})</span>
                <strong className="condition-cell-val" style={{ color: !yearCondition.hasSatelliteRecord ? '#dc2626' : '#0284c7' }}>
                  {yearCondition.sensor}
                </strong>
              </div>

              <div className="condition-cell">
                <span className="condition-cell-label">💧 Basin Surface Water Extent</span>
                <strong className="condition-cell-val" style={{ color: !yearCondition.hasSatelliteRecord ? '#dc2626' : undefined }}>
                  {yearCondition.hasSatelliteRecord ? (
                    <>
                      {yearCondition.waterArea} ha 
                      <span style={{ 
                        fontSize: '0.72rem', 
                        marginLeft: '0.35rem',
                        color: yearCondition.comparisonVsPresent >= 0 ? '#10b981' : '#ea580c' 
                      }}>
                        ({yearCondition.comparisonVsPresent >= 0 ? `+${yearCondition.comparisonVsPresent}% vs Present` : `${yearCondition.comparisonVsPresent}% vs Baseline`})
                      </span>
                    </>
                  ) : (
                    'No Record Available'
                  )}
                </strong>
              </div>

              <div className="condition-cell">
                <span className="condition-cell-label">🏗️ Human / Urban Encroachment</span>
                <strong className="condition-cell-val" style={{ color: !yearCondition.hasSatelliteRecord ? '#dc2626' : (yearCondition.builtUpEncroached === 0 ? '#10b981' : '#dc2626') }}>
                  {yearCondition.hasSatelliteRecord ? (
                    yearCondition.builtUpEncroached === 0 ? '0.0 ha (Zero Encroachment — Pristine)' : `${yearCondition.builtUpEncroached} ha Detected`
                  ) : (
                    'No Record Available'
                  )}
                </strong>
              </div>

              <div className="condition-cell">
                <span className="condition-cell-label">🌿 Ecological Health Status</span>
                <strong className="condition-cell-val" style={{ color: !yearCondition.hasSatelliteRecord ? '#dc2626' : (selectedYear < 1980 ? '#10b981' : (yearCondition.builtUpEncroached > 15 ? '#dc2626' : 'var(--text-main)')) }}>
                  {yearCondition.ecologicalStatus}
                </strong>
              </div>
            </div>

            <div style={{
              marginTop: '0.55rem',
              paddingTop: '0.5rem',
              borderTop: '1px dashed var(--border-light)',
              fontSize: '0.78rem',
              lineHeight: 1.45,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.45rem'
            }}>
              <span style={{ fontSize: '1rem' }}>
                {!yearCondition.hasSatelliteRecord ? '⚠️' : (selectedYear < 1980 ? '🌱' : '📡')}
              </span>
              <span>
                <strong>Historical Earth Observation Insight ({selectedYear}):</strong> {yearCondition.historicalDescription}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
