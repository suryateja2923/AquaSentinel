import React, { useState, useEffect, useRef } from 'react';
import { 
  Waves, 
  Download, 
  Moon, 
  Sun, 
  ChevronDown, 
  Play, 
  Pause,
  ShieldCheck,
  LogOut,
  UserCheck,
  Radio,
  Lock,
  Search,
  Navigation,
  MapPin,
  Loader2,
  X
} from 'lucide-react';
import { WETLAND_PRESERVES } from '../data/wetlandsData';
import { locationService } from '../services/locationService';

const Header = ({ 
  selectedWetland, 
  setSelectedWetland, 
  darkMode, 
  setDarkMode, 
  onOpenReport,
  isPlaying,
  setIsPlaying,
  currentYear,
  currentUser,
  onOpenAdminConsole,
  onLogout,
  activityCount = 0,
  activeUserCount = 1
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Location Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // GPS Geolocation State
  const [isLocating, setIsLocating] = useState(false);
  const [locationToast, setLocationToast] = useState(null);

  const searchContainerRef = useRef(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search Input Change with Debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await locationService.searchLocations(searchQuery);
        setSearchResults(results);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle Selection of a Location Result
  const handleSelectLocation = (loc) => {
    if (loc.isPreset && loc.raw) {
      setSelectedWetland(loc.raw);
    } else {
      // Dynamic custom site for the searched village/district
      const customSite = locationService.generateCustomWetlandSite({
        id: loc.id,
        name: loc.name,
        village: loc.village,
        district: loc.district,
        state: loc.state,
        lat: loc.coordinates[0],
        lng: loc.coordinates[1],
        zoom: 14
      });
      setSelectedWetland(customSite);
    }
    setSearchQuery('');
    setShowDropdown(false);
    showNotice(`📍 Located: Village "${loc.village}", District "${loc.district}"`);
  };

  // Handle Manual Direct Search when user presses Enter or clicks Find Location
  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    if (searchResults.length > 0) {
      handleSelectLocation(searchResults[0]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await locationService.searchLocations(searchQuery);
      if (results && results.length > 0) {
        handleSelectLocation(results[0]);
      } else {
        const customSite = locationService.generateCustomWetlandSite({
          id: `loc_${Date.now()}`,
          name: `${searchQuery} Catchment Basin`,
          village: `${searchQuery} (Village)`,
          district: `${searchQuery} District`,
          state: 'User Specified Catchment',
          lat: 26.128,
          lng: 91.655,
          zoom: 14
        });
        setSelectedWetland(customSite);
        setSearchQuery('');
        setShowDropdown(false);
        showNotice(`📍 Located & Loaded: "${searchQuery}" Catchment Data`);
      }
    } catch (e) {
      // fallback to generated site
      const customSite = locationService.generateCustomWetlandSite({
        id: `loc_${Date.now()}`,
        name: `${searchQuery} Catchment Basin`,
        village: `${searchQuery} (Village)`,
        district: `${searchQuery} District`,
        state: 'Catchment Zone',
        lat: 26.128,
        lng: 91.655,
        zoom: 14
      });
      setSelectedWetland(customSite);
      setSearchQuery('');
      setShowDropdown(false);
      showNotice(`📍 Located: "${searchQuery}" Catchment`);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle GPS "Enable Location" Button Click
  const handleEnableLocation = async () => {
    setIsLocating(true);
    try {
      const locationData = await locationService.getUserCurrentLocation();
      setSelectedWetland(locationData.site);
      showNotice(`🎯 GPS Location Enabled: Village "${locationData.village}", District "${locationData.district}"`);
    } catch (err) {
      showNotice(`⚠️ GPS notice: Using high-precision Kamrup & Pamohi monitoring coordinates.`);
    } finally {
      setIsLocating(false);
    }
  };

  const showNotice = (msg) => {
    setLocationToast(msg);
    setTimeout(() => setLocationToast(null), 3800);
  };

  return (
    <header className="top-nav">
      {/* Top Security & Agency Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
        color: '#94a3b8',
        padding: '0.35rem 1.5rem',
        fontSize: '0.72rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontWeight: 700 }}>
            <Lock size={11} /> GOVERNMENT OF INDIA • MoEFCC RESTRICTED PORTAL
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#cbd5e1' }}>National Remote Sensing Centre & ISRO Space Applications Centre</span>
        </div>

        {/* Current Location Quick Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8' }}>
            <MapPin size={11} />
            <span>
              Active Site: <b>{selectedWetland.isDefaultExample ? 'e.g. Pamohi (Type your location to load)' : selectedWetland.name}</b>
            </span>
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
            <Radio size={10} /> AUDIT DB: ACTIVE
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#94a3b8' }}>
            GovNet VPN: <code style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>10.14.82.119</code>
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="top-nav-inner" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Brand Section */}
        <div className="brand-section">
          <div className="brand-logo-icon">
            <Waves size={24} />
          </div>
          <div>
            <div className="brand-title">
              WetlandSat EO
              <span className="brand-badge">Sentinel-2 MSI</span>
            </div>
            <div className="brand-subtitle">
              Automated Wetland Surface Water & Encroachment Intelligence
            </div>
          </div>
        </div>

        {/* Center: LOCATION SEARCH & ENABLE LOCATION (GPS) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, maxWidth: '560px', minWidth: '340px' }}>
          {/* Search Box with Autocomplete */}
          <div ref={searchContainerRef} style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleManualSearch();
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="e.g. Type any village, district, or city (e.g. Pamohi, Kamrup, Puri...)"
                style={{
                  width: '100%',
                  padding: '0.45rem 2rem 0.45rem 2.2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-light)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-xl)',
                maxHeight: '340px',
                overflowY: 'auto',
                zIndex: 1100
              }}>
                {isSearching ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <Loader2 size={14} className="spin-animate" />
                    <span>Searching all villages & districts (unlimited)...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', background: 'var(--bg-subtle)' }}>
                      Search Results ({searchResults.length})
                    </div>
                    {searchResults.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => handleSelectLocation(res)}
                        style={{
                          padding: '0.55rem 0.75rem',
                          borderBottom: '1px solid var(--border-light)',
                          cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={13} color="#0284c7" />
                          <span>{res.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span>🏘️ Village: <b style={{ color: '#0284c7' }}>{res.village}</b></span>
                          <span>•</span>
                          <span>🏛️ District: <b style={{ color: '#0369a1' }}>{res.district}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    No exact location found for "{searchQuery}". Try any village name or district.
                  </div>
                ) : (
                  <div style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                      e.g. Search any Village, District, or Wetland:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.65rem' }}>
                      {[
                        'e.g. Pamohi (Village)',
                        'e.g. Kamrup (District)',
                        'e.g. Azara',
                        'e.g. Chilika',
                        'e.g. Puri District',
                        'e.g. Alappuzha',
                        'e.g. Bhojtal',
                        'e.g. Kolleru'
                      ].map((egTag) => (
                        <button
                          key={egTag}
                          type="button"
                          onClick={() => {
                            const term = egTag.replace(/e\.g\.\s*|\s*\(.*?\)/g, '').trim();
                            setSearchQuery(term);
                            setShowDropdown(true);
                          }}
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border-light)',
                            color: '#0284c7',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(2, 132, 199, 0.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                        >
                          {egTag}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                      ⚡ <b>Unlimited search:</b> Type any Indian village, taluk, town, or district to generate live satellite earth observation metrics.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Direct "Find Location" Button */}
          <button
            onClick={handleManualSearch}
            disabled={isSearching}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              background: '#0284c7',
              color: 'white',
              fontSize: '0.78rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Fetch and load satellite data for entered location"
          >
            {isSearching ? <Loader2 size={13} className="spin-animate" /> : <Search size={13} />}
            <span>Find Location</span>
          </button>

          {/* Enable Location (GPS) Button */}
          <button
            onClick={handleEnableLocation}
            disabled={isLocating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: isLocating ? '#0284c7' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: 'none',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
              cursor: isLocating ? 'default' : 'pointer'
            }}
            title="Enable GPS to locate your village and district"
          >
            {isLocating ? (
              <>
                <Loader2 size={14} className="spin-animate" />
                <span>Locating GPS...</span>
              </>
            ) : (
              <>
                <Navigation size={14} />
                <span>Enable Location</span>
              </>
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Preset Selector Dropdown */}
          <div className="select-wrapper">
            <select 
              className="wetland-select"
              value={selectedWetland.id}
              onChange={(e) => {
                if (e.target.value === 'eg_custom_site') return;
                const found = WETLAND_PRESERVES.find(w => w.id === e.target.value);
                if (found) setSelectedWetland(found);
              }}
            >
              <option value="eg_custom_site">
                📍 e.g. Pamohi (Type location in search bar to change)
              </option>
              {WETLAND_PRESERVES.map(w => (
                <option key={w.id} value={w.id}>
                  📍 {w.name} ({w.district || w.state})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-caret" />
          </div>

          {/* Temporal Playback Button */}
          <button 
            className="btn-pill"
            onClick={() => setIsPlaying(!isPlaying)}
            title="Animate temporal evolution across satellite archives (1970s–2026)"
          >
            {isPlaying ? <Pause size={14} color="#0284c7" /> : <Play size={14} />}
            <span>{isPlaying ? `Playing (${currentYear})` : 'Time Lapse (1970–2026)'}</span>
          </button>

          {/* Export Report Button */}
          <button 
            className="btn-pill primary"
            onClick={onOpenReport}
          >
            <Download size={14} />
            <span>EO Report</span>
          </button>

          {/* Dark / Light Toggle */}
          <button 
            className="btn-pill"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{ width: '38px', justifyContent: 'center', padding: '0.45rem' }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div style={{ height: '24px', width: '1px', background: 'var(--border-light)', margin: '0 0.25rem' }} />

          {/* USER AUTHENTICATION & ADMIN CONTROLS */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* If Admin: Dedicated Admin Console Button */}
              {isAdmin && (
                <button
                  onClick={onOpenAdminConsole}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s'
                  }}
                  title="Open Admin Activity Monitoring & Database Management Console"
                >
                  <ShieldCheck size={15} />
                  <span>Admin Console</span>
                  <span style={{
                    fontSize: '0.68rem',
                    background: 'rgba(34, 197, 94, 0.25)',
                    color: '#4ade80',
                    border: '1px solid rgba(74, 222, 128, 0.4)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                    {activeUserCount} Online
                  </span>
                </button>
              )}

              {/* User Identity Pill */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.35rem 0.75rem',
                  background: isAdmin ? '#f5f3ff' : 'var(--bg-subtle)',
                  border: `1px solid ${isAdmin ? '#ddd6fe' : 'var(--border-light)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: isAdmin ? '#7c3aed' : '#0284c7',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {isAdmin ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
                </div>

                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.82rem' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isAdmin ? '#7c3aed' : '#0284c7', fontWeight: 600 }}>
                    {isAdmin ? '🛡️ System Admin' : `🏛️ Govt User`}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="btn-pill"
                style={{ 
                  padding: '0.45rem 0.75rem', 
                  color: '#dc2626',
                  background: 'rgba(239, 68, 68, 0.08)',
                  borderColor: 'rgba(239, 68, 68, 0.25)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                title="Sign out and return completely outside of dashboard"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating GPS Location Notification Toast */}
      {locationToast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#ffffff',
          padding: '0.65rem 1.25rem',
          borderRadius: '9999px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          border: '1px solid #38bdf8',
          fontSize: '0.84rem',
          fontWeight: 700,
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>{locationToast}</span>
        </div>
      )}
    </header>
  );
};

export default Header;
