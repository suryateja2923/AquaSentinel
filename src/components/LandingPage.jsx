import React from 'react';
import { 
  Waves, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Layers, 
  Activity, 
  FileText, 
  Navigation, 
  Sun, 
  Moon, 
  Sparkles, 
  Radio, 
  Calendar 
} from 'lucide-react';

const LandingPage = ({ onNavigateToLogin, darkMode, setDarkMode }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: darkMode ? '#070b14' : '#f8fafc',
      color: darkMode ? '#f8fafc' : '#0f172a',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Dynamic Ambient Background Gradients */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '650px',
        background: darkMode 
          ? 'radial-gradient(circle at 50% -10%, rgba(2, 132, 199, 0.25) 0%, rgba(99, 102, 241, 0.15) 35%, transparent 70%)'
          : 'radial-gradient(circle at 50% -10%, rgba(2, 132, 199, 0.15) 0%, rgba(224, 242, 254, 0.6) 45%, transparent 75%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Grid Pattern Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '700px',
        backgroundImage: darkMode
          ? 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)'
          : 'linear-gradient(rgba(2, 132, 199, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(2, 132, 199, 0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* TOP RESTRICTED GOVNET TICKER */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        background: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.98)',
        color: '#e2e8f0',
        padding: '0.45rem 2rem',
        fontSize: '0.74rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            color: '#38bdf8', 
            fontWeight: 800,
            letterSpacing: '0.03em'
          }}>
            <Lock size={12} /> GOVERNMENT OF INDIA • MoEFCC
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#cbd5e1' }}>
            National Wetland Satellite Earth Observation & Remote Sensing Command Portal
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#4ade80',
            padding: '0.15rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 700
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            ISRO Sentinel-2 Feed: Active
          </span>
          <span style={{ color: '#94a3b8' }}>NIC GovNet Protected</span>
        </div>
      </div>

      {/* MAIN TOP NAVIGATION BAR */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: darkMode ? 'rgba(7, 11, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(14px)',
        borderBottom: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
        padding: '0.85rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s'
      }}>
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
            color: '#ffffff'
          }}>
            <Waves size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                fontSize: '1.15rem', 
                fontWeight: 800, 
                color: darkMode ? '#f8fafc' : '#0f172a',
                letterSpacing: '-0.02em'
              }}>
                WetlandSat Intelligence
              </span>
              <span style={{
                fontSize: '0.66rem',
                background: darkMode ? '#1e293b' : '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                padding: '0.1rem 0.45rem',
                borderRadius: '6px',
                fontWeight: 800
              }}>
                EO v2.4
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
              National Wetland Earth Observation Portal • MoEFCC & ISRO
            </div>
          </div>
        </div>

        {/* Center Quick Nav Badges */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#features" style={{ 
            fontSize: '0.84rem', 
            fontWeight: 600, 
            color: darkMode ? '#cbd5e1' : '#475569',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}>
            Satellite Capabilities
          </a>
          <a href="#preserves" style={{ 
            fontSize: '0.84rem', 
            fontWeight: 600, 
            color: darkMode ? '#cbd5e1' : '#475569',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}>
            Ramsar Preserves
          </a>
          <a href="#archives" style={{ 
            fontSize: '0.84rem', 
            fontWeight: 600, 
            color: darkMode ? '#cbd5e1' : '#475569',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}>
            1970–2026 Archives
          </a>
          <a href="#security" style={{ 
            fontSize: '0.84rem', 
            fontWeight: 600, 
            color: darkMode ? '#cbd5e1' : '#475569',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}>
            GovNet Security
          </a>
        </nav>

        {/* Right CTA & Dark Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
              background: darkMode ? '#1e293b' : '#f1f5f9',
              color: darkMode ? '#f8fafc' : '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={onNavigateToLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <ShieldCheck size={16} />
            <span>Authorized Sign In</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        padding: '4.5rem 2rem 3rem',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        {/* National Banner Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.95rem',
          borderRadius: '9999px',
          background: darkMode ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.1)',
          border: '1px solid rgba(2, 132, 199, 0.3)',
          color: '#0284c7',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={14} color="#0284c7" />
          <span>National Geospatial Wetland Monitoring System • Landsat-1 to Sentinel-2 (1970–2026)</span>
        </div>

        {/* Hero Main Heading */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
          fontWeight: 900,
          lineHeight: 1.12,
          letterSpacing: '-0.03em',
          maxWidth: '980px',
          margin: '0 auto 1.25rem',
          color: darkMode ? '#f8fafc' : '#0f172a'
        }}>
          National Wetland Earth Observation &amp;{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Satellite Intelligence Portal
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p style={{
          fontSize: 'clamp(0.95rem, 1.3vw, 1.15rem)',
          color: darkMode ? '#94a3b8' : '#475569',
          maxWidth: '780px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          Comprehensive multi-decadal satellite observation system for the <b>Ministry of Environment, Forest &amp; Climate Change (MoEFCC)</b>, ISRO SAC, and State Wetland Authorities. Analyze hydrological health, detect unauthorized encroachments, and audit surface water extent from 1970 to 2026 across every village and district.
        </p>

        {/* Primary Call to Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '3.5rem'
        }}>
          <button
            onClick={onNavigateToLogin}
            style={{
              padding: '0.85rem 1.85rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)',
              cursor: 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(2, 132, 199, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.4)';
            }}
          >
            <span>Enter Intelligence Portal</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onNavigateToLogin}
            style={{
              padding: '0.85rem 1.75rem',
              borderRadius: '12px',
              background: darkMode ? '#1e293b' : '#ffffff',
              color: darkMode ? '#f8fafc' : '#0f172a',
              fontSize: '1rem',
              fontWeight: 700,
              border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0284c7';
              e.currentTarget.style.color = '#0284c7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = darkMode ? '#334155' : '#cbd5e1';
              e.currentTarget.style.color = darkMode ? '#f8fafc' : '#0f172a';
            }}
          >
            <ShieldCheck size={18} color="#0284c7" />
            <span>Government Personnel Sign In</span>
          </button>
        </div>

        {/* Live Satellite Operational Metrics Ticker */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          padding: '1.5rem',
          borderRadius: '16px',
          background: darkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          border: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7', letterSpacing: '-0.02em' }}>
              85+
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Ramsar Sites Mapped
            </div>
            <div style={{ fontSize: '0.72rem', color: darkMode ? '#94a3b8' : '#64748b' }}>
              High-resolution satellite GIS coverage
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', letterSpacing: '-0.02em' }}>
              50+ Years
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Multi-Spectral Archives
            </div>
            <div style={{ fontSize: '0.72rem', color: darkMode ? '#94a3b8' : '#64748b' }}>
              Landsat-1 MSS (1970) to Sentinel-2 (2026)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7c3aed', letterSpacing: '-0.02em' }}>
              10-Meter
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Spatial Resolution
            </div>
            <div style={{ fontSize: '0.72rem', color: darkMode ? '#94a3b8' : '#64748b' }}>
              Automated NDWI surface water extraction
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', letterSpacing: '-0.02em' }}>
              Unlimited
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Village &amp; District Search
            </div>
            <div style={{ fontSize: '0.72rem', color: darkMode ? '#94a3b8' : '#64748b' }}>
              Auto GPS geolocation tracking
            </div>
          </div>
        </div>
      </section>

      {/* SATELLITE CAPABILITIES & FEATURES GRID */}
      <section id="features" style={{
        padding: '5rem 2rem',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#0284c7',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem'
          }}>
            Cutting-Edge Remote Sensing Capabilities
          </div>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            fontWeight: 800,
            color: darkMode ? '#f8fafc' : '#0f172a',
            margin: 0
          }}>
            Engineered for Environmental Defense &amp; Compliance
          </h2>
          <p style={{
            fontSize: '0.95rem',
            color: darkMode ? '#94a3b8' : '#64748b',
            maxWidth: '680px',
            margin: '0.75rem auto 0'
          }}>
            Integrated with multi-spectral satellite sensors, automatic desiccation tracking, and artificial intelligence alert engines.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Card 1 */}
          <div style={{
            background: darkMode ? '#111827' : '#ffffff',
            border: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.85rem',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(2, 132, 199, 0.12)',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Calendar size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: darkMode ? '#f8fafc' : '#0f172a', margin: '0 0 0.5rem' }}>
              Multi-Decadal Satellite Archives (1970–2026)
            </h3>
            <p style={{ fontSize: '0.86rem', color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: 0 }}>
              Access satellite archives spanning over 50 years. Seamlessly inspect wetland degradation, water shrinkages, and land-use shifts from early Landsat-1 MSS sensors to contemporary Sentinel-2 optical imagery.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: darkMode ? '#111827' : '#ffffff',
            border: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.85rem',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(5, 150, 105, 0.12)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Activity size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: darkMode ? '#f8fafc' : '#0f172a', margin: '0 0 0.5rem' }}>
              NDWI Water Delineation &amp; Desiccation
            </h3>
            <p style={{ fontSize: '0.86rem', color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: 0 }}>
              Normalized Difference Water Index calculations detect water bodies automatically, flagging severe desiccation, seasonal perimeter loss, and depth-level changes in real time.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: darkMode ? '#111827' : '#ffffff',
            border: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.85rem',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: darkMode ? '#f8fafc' : '#0f172a', margin: '0 0 0.5rem' }}>
              Hotspot Incursion &amp; Encroachment AI
            </h3>
            <p style={{ fontSize: '0.86rem', color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: 0 }}>
              Autonomous detection of illegal soil infilling, landfilling, road corridor expansions, and unauthorized construction inside the mandatory 500m eco-sensitive buffer zone.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{
            background: darkMode ? '#111827' : '#ffffff',
            border: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.85rem',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(124, 58, 237, 0.12)',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Navigation size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: darkMode ? '#f8fafc' : '#0f172a', margin: '0 0 0.5rem' }}>
              GPS Auto-Detection &amp; Universal Search
            </h3>
            <p style={{ fontSize: '0.86rem', color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: 0 }}>
              Turn on live GPS location with one click to locate and monitor your local village and district catchment, or type any village/taluk name across India for instant custom satellite telemetry.
            </p>
          </div>

          {/* Card 5 */}
          <div style={{
            background: darkMode ? '#111827' : '#ffffff',
            border: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.85rem',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(2, 132, 199, 0.12)',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: darkMode ? '#f8fafc' : '#0f172a', margin: '0 0 0.5rem' }}>
              Executive EO Compliance Audit Reports
            </h3>
            <p style={{ fontSize: '0.86rem', color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: 0 }}>
              Generate structured, exportable satellite audit reports with official Ministry headers, geospatial coordinates, threat matrix, and legal regulatory recommendations.
            </p>
          </div>

          {/* Card 6 */}
          <div style={{
            background: darkMode ? '#111827' : '#ffffff',
            border: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.85rem',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: darkMode ? '#f8fafc' : '#0f172a', margin: '0 0 0.5rem' }}>
              Active User Telemetry &amp; Security Command
            </h3>
            <p style={{ fontSize: '0.86rem', color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: 0 }}>
              Live monitoring of authorized personnel sessions, Level 5 Administrator Passcode security, and real-time audit logging from this moment forward.
            </p>
          </div>
        </div>
      </section>

      {/* RAMSAR PRESERVES SPOTLIGHT SECTION */}
      <section id="preserves" style={{
        background: darkMode ? '#0c1220' : '#f1f5f9',
        padding: '5rem 2rem',
        borderTop: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
        borderBottom: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', letterSpacing: '0.08em' }}>
                Protected Ecological Assets
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.3rem)', fontWeight: 800, color: darkMode ? '#f8fafc' : '#0f172a', margin: '0.35rem 0 0' }}>
                Featured National Ramsar Sites
              </h2>
            </div>

            <button
              onClick={onNavigateToLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#0284c7',
                cursor: 'pointer',
                background: 'none'
              }}
            >
              <span>Explore All 85+ Sites in GIS Dashboard</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {[
              {
                name: 'Deepor Beel',
                state: 'Assam',
                type: 'Freshwater Lake & Ramsar Site',
                area: '4,014 ha',
                status: 'High Alert',
                tagColor: '#ef4444',
                desc: 'Facing severe fragmentation from municipal landfill & railway corridor expansion.'
              },
              {
                name: 'Chilika Lake',
                state: 'Odisha',
                type: 'Brackish Water Coastal Lagoon',
                area: '1,16,500 ha',
                status: 'Monitored',
                tagColor: '#059669',
                desc: 'Asia’s largest brackish water lagoon; active monitoring for siltation and aquaculture.'
              },
              {
                name: 'Loktak Lake',
                state: 'Manipur',
                type: 'Phumdis Floating Biomass Wetland',
                area: '28,700 ha',
                status: 'Moderate Risk',
                tagColor: '#f59e0b',
                desc: 'Home of the Sangai deer; undergoing temporal hydrological shifts and weed expansion.'
              },
              {
                name: 'Bhoj Wetland',
                state: 'Madhya Pradesh',
                type: 'Urban Twin Reservoir Wetland',
                area: '3,201 ha',
                status: 'Monitored',
                tagColor: '#059669',
                desc: 'Critical drinking water catchment for Bhopal; monitored for urban peripheral runoff.'
              }
            ].map((site) => (
              <div 
                key={site.name}
                onClick={onNavigateToLogin}
                style={{
                  background: darkMode ? '#111827' : '#ffffff',
                  border: darkMode ? '1px solid #1f2937' : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = '#0284c7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = darkMode ? '#1f2937' : '#e2e8f0';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    📍 {site.state}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    color: site.tagColor,
                    background: `${site.tagColor}15`,
                    border: `1px solid ${site.tagColor}40`
                  }}>
                    {site.status}
                  </span>
                </div>

                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: darkMode ? '#f8fafc' : '#0f172a', marginBottom: '0.25rem' }}>
                  {site.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {site.type} • {site.area}
                </div>
                <div style={{ fontSize: '0.82rem', color: darkMode ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>
                  {site.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section style={{
        padding: '5rem 2rem',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          borderRadius: '24px',
          padding: '3.5rem 2.5rem',
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Glow Circle */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(2, 132, 199, 0.3) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.1)',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#38bdf8',
              marginBottom: '1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <Radio size={12} className="pulse-dot" /> SECURE ACCESS GATEWAY
            </span>

            <h2 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              fontWeight: 900,
              margin: '0 auto 1rem',
              maxWidth: '750px',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              Ready to Inspect Satellite Observations &amp; Wetland Health?
            </h2>

            <p style={{
              fontSize: '1rem',
              color: '#cbd5e1',
              maxWidth: '620px',
              margin: '0 auto 2.25rem',
              lineHeight: 1.6
            }}>
              Enter the national command center with your authorized government email or Level 5 administrator credentials.
            </p>

            <button
              onClick={onNavigateToLogin}
              style={{
                padding: '0.95rem 2.2rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: 800,
                boxShadow: '0 8px 25px rgba(2, 132, 199, 0.5)',
                cursor: 'pointer',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span>Access Secure Login Page</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        marginTop: 'auto',
        background: darkMode ? '#05070d' : '#0f172a',
        color: '#94a3b8',
        padding: '2.5rem 2rem',
        fontSize: '0.8rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.25rem' }}>
              National Wetland Earth Observation &amp; Satellite Intelligence System
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Ministry of Environment, Forest &amp; Climate Change (MoEFCC) • ISRO Space Applications Centre (SAC) • NIC GovNet
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.78rem' }}>
            <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
              Operational v2.4.0
            </span>
            <span>Ramsar Convention Compliance</span>
            <button
              onClick={onNavigateToLogin}
              style={{
                color: '#38bdf8',
                fontWeight: 700,
                cursor: 'pointer',
                background: 'none',
                textDecoration: 'underline'
              }}
            >
              Portal Login →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
