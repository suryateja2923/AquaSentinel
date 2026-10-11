import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProposedDesignCard from './components/ProposedDesignCard';
import InteractiveMap from './components/InteractiveMap';
import HotspotsPanel from './components/HotspotsPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import ReportModal from './components/ReportModal';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import AdminConsole from './components/AdminConsole';
import { DEFAULT_EXAMPLE_SITE } from './data/wetlandsData';
import { dbService } from './services/dbService';
import { locationService } from './services/locationService';
import { Radio, ShieldCheck, Navigation, RotateCcw, Loader2 } from 'lucide-react';

function App() {
  const [selectedWetland, setSelectedWetland] = useState(DEFAULT_EXAMPLE_SITE);
  const [selectedYear, setSelectedYear] = useState(1970);
  const [isPlaying, setIsPlaying] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [splitMode, setSplitMode] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // URL Route Detection Function: Detects \admin or /admin and \user or /user in URL
  const checkUrlForAuthRoute = () => {
    try {
      const fullUrl = (
        (window.location.pathname || '') + 
        (window.location.hash || '') + 
        (window.location.search || '')
      ).toLowerCase();

      // If URL contains admin (\admin, /admin, #admin)
      if (fullUrl.includes('admin')) {
        return { view: 'login', tab: 'admin' };
      }
      // If URL contains user (\user, /user, #user)
      if (fullUrl.includes('user')) {
        return { view: 'login', tab: 'user' };
      }
    } catch (e) {}
    return null;
  };

  // App Navigation Flow: 'landing' -> 'login' -> Portal (auto-detects \admin or \user from URL)
  const [viewMode, setViewMode] = useState(() => {
    const route = checkUrlForAuthRoute();
    return route ? route.view : 'landing';
  });
  const [loginInitialTab, setLoginInitialTab] = useState(() => {
    const route = checkUrlForAuthRoute();
    return route ? route.tab : 'user';
  });

  // Listen for browser URL address changes
  useEffect(() => {
    const handleUrlChange = () => {
      const route = checkUrlForAuthRoute();
      if (route) {
        setViewMode(route.view);
        setLoginInitialTab(route.tab);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // User Authentication & Admin States (persists active session across reloads)
  const [currentUser, setCurrentUser] = useState(() => {
    return dbService.getCurrentSession() || null;
  });
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  const [activityCount, setActivityCount] = useState(() => dbService.getActivityLogs().length);
  const [activeUserCount, setActiveUserCount] = useState(() => dbService.getActiveUsers().length);
  const [liveActionToast, setLiveActionToast] = useState(null);

  // Auto-Location Turn On Bar states
  const [isAutoLocationActive, setIsAutoLocationActive] = useState(false);
  const [isAutoLocating, setIsAutoLocating] = useState(false);

  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState({
    historicalWater: true,
    latestWater: true,
    detectedChanges: true,
    encroachments: true,
    bufferZone: false
  });

  // Layer opacity controls
  const [layerOpacity, setLayerOpacity] = useState({
    historicalWater: 0.85,
    latestWater: 0.9,
    detectedChanges: 0.85,
    encroachments: 0.95
  });

  // Keep activity and active users count updated when database changes
  useEffect(() => {
    const handleDbUpdate = () => {
      setActivityCount(dbService.getActivityLogs().length);
    };

    const handleActiveUsersUpdate = (e) => {
      const list = e.detail || dbService.getActiveUsers();
      setActiveUserCount(list.length);
    };

    window.addEventListener('wetlands_db_updated', handleDbUpdate);
    window.addEventListener('wetlands_active_users_updated', handleActiveUsersUpdate);
    return () => {
      window.removeEventListener('wetlands_db_updated', handleDbUpdate);
      window.removeEventListener('wetlands_active_users_updated', handleActiveUsersUpdate);
    };
  }, []);

  // Helper to trigger activity logging and show visual confirmation toast
  const logUserAction = (actionType, category, description, details = {}) => {
    if (!currentUser) return;

    dbService.logActivity({
      email: currentUser.email,
      userName: currentUser.name,
      role: currentUser.role,
      department: currentUser.department,
      actionType,
      category,
      description,
      details,
      status: 'info'
    });

    // Update active user live in-app action telemetry
    dbService.updateActiveUserActivity(currentUser.email, description);

    // Trigger subtle floating toast
    setLiveActionToast({
      actionType,
      description,
      time: new Date().toLocaleTimeString()
    });

    setTimeout(() => {
      setLiveActionToast(null);
    }, 3200);
  };

  // Toggle layer helper with activity tracking
  const toggleLayer = (layerKey) => {
    const nextState = !layerVisibility[layerKey];
    setLayerVisibility(prev => ({
      ...prev,
      [layerKey]: nextState
    }));

    const friendlyNames = {
      historicalWater: 'Historical Baseline (2020)',
      latestWater: 'Latest Delineation (2026)',
      detectedChanges: 'NDWI Desiccation Loss',
      encroachments: 'Encroachment Zones & Infill',
      bufferZone: '500m Eco-Sensitive Buffer'
    };

    logUserAction(
      'TOGGLE_LAYER',
      'Analysis & Layers',
      `${nextState ? 'Activated' : 'Deactivated'} map layer: ${friendlyNames[layerKey] || layerKey}`,
      { layer: layerKey, enabled: nextState }
    );
  };

  // Set opacity helper with activity tracking
  const handleSetLayerOpacity = (newOpacity) => {
    setLayerOpacity(newOpacity);
  };

  // Change wetland preserve helper
  const handleSelectWetland = (wetland) => {
    setSelectedWetland(wetland);
    setActiveHotspot(null);
    logUserAction(
      'VIEW_WETLAND',
      'GIS Navigation',
      `Switched satellite monitoring site to ${wetland.name} (${wetland.state})`,
      { wetlandId: wetland.id, designation: wetland.designation }
    );
  };

  // Change temporal year helper
  const handleSelectYear = (year) => {
    setSelectedYear(year);
    logUserAction(
      'TIMELAPSE_YEAR',
      'GIS Navigation',
      `Adjusted temporal observation year to ${year}`,
      { year }
    );
  };

  // Toggle playback helper
  const handleTogglePlayback = (playing) => {
    setIsPlaying(playing);
    if (playing) {
      logUserAction(
        'TIMELAPSE_PLAY',
        'GIS Navigation',
        `Initiated multi-year satellite time lapse animation (2020-2026)`
      );
    }
  };

  // Inspect hotspot helper
  const handleSelectHotspot = (hs) => {
    setActiveHotspot(hs);
    if (hs) {
      logUserAction(
        'HOTSPOT_INSPECT',
        'Analysis & Layers',
        `Inspected Hotspot Alert: "${hs.title}" (Severity: ${hs.severity}, Loss: ${hs.lossArea})`,
        { hotspotId: hs.id, severity: hs.severity, lossArea: hs.lossArea }
      );
    }
  };

  // Open EO Report helper
  const handleOpenReport = () => {
    setIsReportOpen(true);
    logUserAction(
      'EXPORT_REPORT',
      'Data Export',
      `Generated & reviewed EO Compliance Audit Report for ${selectedWetland.name}`,
      { wetland: selectedWetland.name }
    );
  };

  // Split mode helper
  const handleToggleSplit = (val) => {
    setSplitMode(val);
    logUserAction(
      'TOGGLE_SPLIT',
      'GIS Navigation',
      `${val ? 'Activated' : 'Deactivated'} Sentinel-2 dual side-by-side swipe comparison mode`
    );
  };

  // Location Turn On Bar Helper (Auto-detects GPS and supports unlimited coverage)
  const handleToggleAutoLocation = async (turnOn) => {
    if (!turnOn) {
      setIsAutoLocationActive(false);
      setLiveActionToast('GPS Auto-Location tracking turned OFF.');
      return;
    }

    setIsAutoLocating(true);
    try {
      const locData = await locationService.getUserCurrentLocation();
      setSelectedWetland(locData.site);
      setIsAutoLocationActive(true);
      setLiveActionToast(`🎯 GPS Auto-Detected: Village "${locData.village}", District "${locData.district}"`);
      logUserAction(
        'AUTO_LOCATION_TURNED_ON',
        'GIS Navigation',
        `Location Turn On Bar activated: Located ${locData.village}, ${locData.district} (${locData.state})`,
        { village: locData.village, district: locData.district, coordinates: locData.coordinates }
      );
    } catch (err) {
      // Intelligent fallback for local catchment without limitation
      const fallbackSite = locationService.generateCustomWetlandSite({
        id: `gps_user_${Date.now()}`,
        name: `Local Catchment Monitoring Basin`,
        village: 'Pamohi & Azara (Local Village)',
        district: 'Kamrup Metropolitan (Local District)',
        state: 'Assam, India',
        lat: 26.128,
        lng: 91.655,
        zoom: 14
      });
      setSelectedWetland(fallbackSite);
      setIsAutoLocationActive(true);
      setLiveActionToast('📍 GPS Location Active: Monitoring local village & district basin.');
    } finally {
      setIsAutoLocating(false);
    }
  };

  // User Login Success Handler
  const handleLoginSuccess = (user) => {
    dbService.addActiveUser(user, 'Logged into Portal');
    dbService.setCurrentSession(user);
    setCurrentUser(user);
    if (user.role === 'admin') {
      setIsAdminConsoleOpen(true);
    }
  };

  // User Logout Handler - Takes user completely outside the dashboard to the landing page
  const handleLogout = () => {
    if (currentUser) {
      dbService.removeActiveUser(currentUser.email);
      dbService.logActivity({
        email: currentUser.email,
        userName: currentUser.name,
        role: currentUser.role,
        department: currentUser.department,
        actionType: 'LOGOUT',
        category: 'Authentication',
        description: `User signed out of portal: ${currentUser.name} (${currentUser.email})`,
        status: 'info'
      });
    }
    dbService.clearCurrentSession();
    setCurrentUser(null);
    setViewMode('landing');
    setIsAdminConsoleOpen(false);
  };

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Temporal animation playback loop across satellite eras (1970s Landsat-1 to 2026 Sentinel-2)
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedYear((prev) => {
          if (prev >= 2026) return 1972;
          if (prev < 1980) return 1984; // Landsat-1 MSS (1972) to Landsat-5 TM (1984)
          if (prev < 1990) return 1995;
          if (prev < 2000) return 2005;
          if (prev < 2010) return 2015;
          if (prev < 2020) return 2020;
          return prev + 1; // 2020, 2021, 2022, 2023, 2024, 2025, 2026
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // STEP 1 & 2: If user is not yet logged in:
  // Show Landing Page first, then Login Page, and upon authentication enter the Portal
  if (!currentUser) {
    if (viewMode === 'landing') {
      return (
        <LandingPage 
          onNavigateToLogin={() => {
            setViewMode('login');
            setLoginInitialTab('user');
            try { window.history.pushState(null, '', '/user'); } catch (e) {}
          }}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      );
    }

    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={() => {
          setViewMode('landing');
          try { window.history.pushState(null, '', '/'); } catch (e) {}
        }}
        initialTab={loginInitialTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Header 
        selectedWetland={selectedWetland}
        setSelectedWetland={handleSelectWetland}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenReport={handleOpenReport}
        isPlaying={isPlaying}
        setIsPlaying={handleTogglePlayback}
        currentYear={selectedYear}
        currentUser={currentUser}
        onOpenAdminConsole={() => setIsAdminConsoleOpen(true)}
        onLogout={handleLogout}
        activityCount={activityCount}
        activeUserCount={activeUserCount}
      />

      {/* Quick Role & Activity Notice Bar */}
      <div style={{
        background: currentUser?.role === 'admin' ? 'linear-gradient(90deg, #312e81 0%, #1e1b4b 100%)' : 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-light)',
        padding: '0.45rem 1.5rem',
        fontSize: '0.78rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: currentUser?.role === 'admin' ? '#e0e7ff' : 'var(--text-main)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
            background: currentUser?.role === 'admin' ? '#7c3aed' : '#0284c7',
            color: 'white',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            {currentUser?.role === 'admin' ? '🛡️ Admin Mode' : '🏛️ Government User Mode'}
          </span>
          <span>
            Active Session: <b>{currentUser ? currentUser.name : 'Guest'}</b> ({currentUser?.email})
          </span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span style={{ opacity: 0.85 }}>
            {currentUser?.department}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentUser?.role === 'admin' ? (
            <button
              onClick={() => setIsAdminConsoleOpen(true)}
              style={{
                background: '#4f46e5',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <ShieldCheck size={13} />
              Open Admin Command Center • Active Users ({activeUserCount} online)
            </button>
          ) : (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Radio size={10} color="#059669" /> Every user activity is monitored & recorded for the Administrator
            </span>
          )}
        </div>
      </div>

      {/* LOCATION TURN ON BAR (AUTO-DETECTS GPS LOCATION UNLIMITED) */}
      <div style={{
        background: isAutoLocationActive 
          ? (darkMode ? 'linear-gradient(90deg, rgba(6, 78, 59, 0.4) 0%, rgba(2, 44, 34, 0.4) 100%)' : 'linear-gradient(90deg, #ecfdf5 0%, #d1fae5 100%)')
          : (darkMode ? 'linear-gradient(90deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)' : 'linear-gradient(90deg, #f0fdf4 0%, #f8fafc 100%)'),
        borderBottom: '1px solid ' + (isAutoLocationActive ? '#10b981' : 'var(--border-light)'),
        padding: '0.55rem 1.5rem',
        fontSize: '0.78rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        transition: 'all 0.3s ease'
      }}>
        {/* Left: Location Turn On Button & Live Village / District metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Turn On Location Button */}
          <button
            onClick={() => handleToggleAutoLocation(!isAutoLocationActive)}
            disabled={isAutoLocating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.38rem 0.85rem',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '0.76rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: isAutoLocationActive 
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: isAutoLocationActive ? '0 0 12px rgba(16, 185, 129, 0.4)' : '0 2px 6px rgba(2, 132, 199, 0.3)'
            }}
          >
            {isAutoLocating ? (
              <>
                <Loader2 size={13} className="spin-animate" />
                <span>Auto-Detecting Location...</span>
              </>
            ) : isAutoLocationActive ? (
              <>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                <Navigation size={13} />
                <span>LOCATION: TURNED ON (ACTIVE)</span>
              </>
            ) : (
              <>
                <Navigation size={13} />
                <span>TURN ON LOCATION (AUTO-DETECT)</span>
              </>
            )}
          </button>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            fontSize: '0.82rem'
          }}>
            <span>📍 {selectedWetland.name}</span>
          </span>

          <span style={{
            background: 'var(--bg-card)',
            border: '1px solid ' + (isAutoLocationActive ? '#10b981' : 'var(--border-light)'),
            padding: '0.22rem 0.65rem',
            borderRadius: '6px',
            color: isAutoLocationActive ? '#059669' : '#0284c7',
            fontWeight: 700
          }}>
            🏘️ Village: <b>{selectedWetland.village || 'Auto-Detected Village'}</b>
          </span>

          <span style={{
            background: 'var(--bg-card)',
            border: '1px solid ' + (isAutoLocationActive ? '#10b981' : 'var(--border-light)'),
            padding: '0.22rem 0.65rem',
            borderRadius: '6px',
            color: isAutoLocationActive ? '#047857' : '#0369a1',
            fontWeight: 700
          }}>
            🏛️ District: <b>{selectedWetland.district || 'Auto-Detected District'}</b>
          </span>

          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
            State: <b>{selectedWetland.state}</b>
          </span>
        </div>

        {/* Right: Unlimited Coverage Notice & Re-sync */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            background: 'rgba(2, 132, 199, 0.1)',
            color: '#0284c7'
          }}>
            ⚡ Unlimited Geo-Coverage (All Villages & Districts)
          </span>

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
            [{selectedWetland.coordinates[0].toFixed(3)}°N, {selectedWetland.coordinates[1].toFixed(3)}°E]
          </span>

          {isAutoLocationActive && (
            <button
              onClick={() => handleToggleAutoLocation(true)}
              disabled={isAutoLocating}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                padding: '0.2rem 0.55rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Refresh GPS location"
            >
              <RotateCcw size={11} />
              <span>Refresh GPS</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <main className="main-layout">
        {/* Left Column: Proposed Design Card & Hotspots Drawer */}
        <aside className="sidebar-column">
          <ProposedDesignCard 
            wetland={selectedWetland}
            layerVisibility={layerVisibility}
            toggleLayer={toggleLayer}
            layerOpacity={layerOpacity}
            setLayerOpacity={handleSetLayerOpacity}
            selectedYear={selectedYear}
            onHotspotClick={handleSelectHotspot}
          />

          <HotspotsPanel 
            wetland={selectedWetland}
            activeHotspot={activeHotspot}
            onSelectHotspot={handleSelectHotspot}
          />
        </aside>

        {/* Right Column: Leaflet Interactive Map & Analytics */}
        <section className="main-content-column">
          <InteractiveMap 
            wetland={selectedWetland}
            layerVisibility={layerVisibility}
            layerOpacity={layerOpacity}
            selectedYear={selectedYear}
            setSelectedYear={handleSelectYear}
            isPlaying={isPlaying}
            setIsPlaying={handleTogglePlayback}
            activeHotspot={activeHotspot}
            setActiveHotspot={handleSelectHotspot}
            splitMode={splitMode}
            setSplitMode={handleToggleSplit}
          />

          <AnalyticsPanel 
            wetland={selectedWetland}
            selectedYear={selectedYear}
            setSelectedYear={handleSelectYear}
          />
        </section>
      </main>

      {/* Executive Satellite Audit Modal */}
      <ReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        wetland={selectedWetland}
      />

      {/* Admin Activity & Security Monitoring Console */}
      <AdminConsole 
        isOpen={isAdminConsoleOpen}
        onClose={() => setIsAdminConsoleOpen(false)}
        currentUser={currentUser}
      />

      {/* Live Activity Sync Toast */}
      {liveActionToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.8rem',
          zIndex: 1050,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, display: 'flex', gap: '0.4rem' }}>
              <span>AUDIT DB SYNCED</span>
              <span>•</span>
              <span>{liveActionToast.time}</span>
            </div>
            <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '1px' }}>
              {liveActionToast.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
