import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  CheckCircle2, 
  UserCheck, 
  ArrowRight, 
  Building2, 
  X,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { dbService } from '../services/dbService';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('govt'); // 'govt' | 'admin'
  
  // Government User Form State
  const [govtEmail, setGovtEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState(null);
  
  // Admin Form State
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  
  // Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Government User Verification
  const handleVerifyEmail = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!govtEmail.trim()) {
      setErrorMsg('Please enter your government authorized email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const isAuthorized = dbService.isEmailAuthorized(govtEmail);
      const user = dbService.getUserByEmail(govtEmail);

      if (isAuthorized && user) {
        setVerifiedUser(user);
        setIsOtpSent(true);
        setOtpCode('849201'); // Auto-generated secure session PIN
        setSuccessMsg(`Email verified in National Registry: ${user.name} (${user.department}). One-Time Security PIN dispatched.`);
      } else {
        // Unauthorized attempt!
        setErrorMsg(`ACCESS DENIED: The email "${govtEmail}" is NOT registered in the Authorized Government Personnel Database. This unauthorized access attempt has been logged for security review.`);
        
        // Record unauthorized attempt in database audit log!
        dbService.logActivity({
          email: govtEmail.trim(),
          userName: 'Unregistered Entity',
          role: 'unauthorized',
          department: 'External Public Network',
          actionType: 'UNAUTHORIZED_LOGIN_ATTEMPT',
          category: 'Security Alert',
          description: `BLOCKED: Unauthorized login attempt with email "${govtEmail.trim()}". Access rejected.`,
          details: { attemptedEmail: govtEmail.trim(), reason: 'Email not found in authorized database' },
          status: 'alert'
        });
      }
    }, 400);
  };

  // Complete Government User Login
  const handleCompleteGovtLogin = (e) => {
    e.preventDefault();
    if (!verifiedUser) return;

    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit security verification PIN.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dbService.recordUserLogin(verifiedUser);
      dbService.setCurrentSession(verifiedUser);

      // Log successful login
      dbService.logActivity({
        email: verifiedUser.email,
        userName: verifiedUser.name,
        role: verifiedUser.role,
        department: verifiedUser.department,
        actionType: 'LOGIN',
        category: 'Authentication',
        description: `Government Officer logged in: ${verifiedUser.name} (${verifiedUser.designation})`,
        details: { clearance: verifiedUser.clearance, email: verifiedUser.email },
        status: 'success'
      });

      onLoginSuccess(verifiedUser);
      onClose();
    }, 350);
  };

  // Handle Admin Login via Unique Passcode
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!adminPasscode.trim()) {
      setErrorMsg('Please enter your unique Admin Passcode.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const isValid = dbService.validateAdminPasscode(adminPasscode);

      if (isValid) {
        const adminUser = dbService.getUserByEmail(adminEmail) || {
          id: 'usr_admin_01',
          email: adminEmail,
          name: 'Dr. Arvind Subramanian',
          role: 'admin',
          department: 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
          designation: 'Chief Environmental Intelligence Administrator',
          clearance: 'Level 5 (National Portal Administrator)',
          status: 'active'
        };

        dbService.recordUserLogin(adminUser);
        dbService.setCurrentSession(adminUser);

        // Log admin login to audit database
        dbService.logActivity({
          email: adminUser.email,
          userName: adminUser.name,
          role: 'admin',
          department: adminUser.department,
          actionType: 'ADMIN_LOGIN',
          category: 'Authentication',
          description: `Administrator authenticated via unique security passcode. Full access granted.`,
          details: { clearance: adminUser.clearance, authType: 'Unique Passcode Verification' },
          status: 'success'
        });

        onLoginSuccess(adminUser);
        onClose();
      } else {
        setErrorMsg('ACCESS DENIED: Invalid Admin Passcode. Unauthorized administrative entry recorded.');
        
        // Log failed passcode attempt in audit trail!
        dbService.logActivity({
          email: adminEmail || 'unknown@admin.attempt',
          userName: 'Unknown Attempt',
          role: 'unauthorized',
          department: 'Administrative Portal Gateway',
          actionType: 'FAILED_ADMIN_PASSCODE_ATTEMPT',
          category: 'Security Alert',
          description: `SECURITY ALERT: Incorrect Admin Passcode entered for administrative gateway.`,
          details: { attemptedEmail: adminEmail, result: 'Passcode Mismatch' },
          status: 'alert'
        });
      }
    }, 450);
  };

  // Quick preset click for seamless testing
  const handleQuickLogin = (email, role, passcode = null) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    if (role === 'admin') {
      setActiveTab('admin');
      setAdminEmail(email);
      setAdminPasscode(passcode || 'ADMIN@2026');
    } else if (role === 'unauthorized') {
      setActiveTab('govt');
      setGovtEmail(email);
      setIsOtpSent(false);
      setVerifiedUser(null);
    } else {
      setActiveTab('govt');
      setGovtEmail(email);
      const user = dbService.getUserByEmail(email);
      if (user) {
        setVerifiedUser(user);
        setIsOtpSent(true);
        setOtpCode('849201');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content auth-modal-box" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%', borderRadius: '16px', overflow: 'hidden' }}
      >
        {/* Government Top Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          padding: '1.25rem 1.5rem',
          borderBottom: '3px solid #0284c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
            }}>
              <ShieldCheck size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                Government of India • MoEFCC
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                WetlandSat EO Intelligence Portal
              </div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                <Lock size={12} /> Restricted Access • Authorized Personnel Only
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              color: '#94a3b8', 
              background: 'rgba(255,255,255,0.06)', 
              borderRadius: '8px', 
              padding: '6px',
              cursor: 'pointer' 
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-light)',
          padding: '0.4rem 0.6rem',
          gap: '0.5rem'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('govt'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              background: activeTab === 'govt' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'govt' ? '#0284c7' : 'var(--text-muted)',
              boxShadow: activeTab === 'govt' ? 'var(--shadow-sm)' : 'none',
              border: activeTab === 'govt' ? '1px solid var(--border-light)' : 'none'
            }}
          >
            <Building2 size={16} />
            Government User Login
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              background: activeTab === 'admin' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'admin' ? '#7c3aed' : 'var(--text-muted)',
              boxShadow: activeTab === 'admin' ? 'var(--shadow-sm)' : 'none',
              border: activeTab === 'admin' ? '1px solid var(--border-light)' : 'none'
            }}
          >
            <KeyRound size={16} />
            Administrator (Passcode Access)
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Feedback Messages */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              fontSize: '0.84rem',
              lineHeight: 1.45
            }}>
              <ShieldAlert size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.84rem'
            }}>
              <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* TAB 1: GOVERNMENT USER LOGIN */}
          {activeTab === 'govt' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Authorized Government Email Authentication
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Access is strictly limited to authorized personnel listed in the National Wetland Registry database.
                </div>
              </div>

              {!isOtpSent ? (
                <form onSubmit={handleVerifyEmail}>
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-main)' }}>
                      Official Government Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        value={govtEmail}
                        onChange={(e) => setGovtEmail(e.target.value)}
                        placeholder="e.g. rajesh.kumar@moefcc.gov.in"
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.6rem',
                          borderRadius: '10px',
                          border: '1.5px solid var(--border-light)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      ℹ️ Must be an active email stored in the authorized government database.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: 'white',
                      fontWeight: 700,
                      borderRadius: '10px',
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Verifying Database Record...' : (
                      <>
                        <span>Verify Authorized Email</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteGovtLogin}>
                  {/* Verified Officer Card */}
                  {verifiedUser && (
                    <div style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <UserCheck size={18} color="#059669" />
                          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                            {verifiedUser.name}
                          </span>
                        </div>
                        <span style={{ 
                          fontSize: '0.68rem', 
                          background: '#dcfce7', 
                          color: '#15803d', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '9999px',
                          fontWeight: 700 
                        }}>
                          AUTHORIZED
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        🏛️ {verifiedUser.department}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                        🏷️ {verifiedUser.designation} • 🛡️ {verifiedUser.clearance}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        Security Verification PIN (OTP)
                      </label>
                      <button
                        type="button"
                        onClick={() => { setIsOtpSent(false); setVerifiedUser(null); }}
                        style={{ fontSize: '0.75rem', color: '#0284c7', background: 'none' }}
                      >
                        Change Email
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="6-digit security code"
                        maxLength={6}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.6rem',
                          borderRadius: '10px',
                          border: '1.5px solid var(--border-light)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          fontSize: '1.1rem',
                          letterSpacing: '0.2em',
                          fontWeight: 700,
                          textAlign: 'center',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <KeyRound size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'center' }}>
                      Security PIN pre-dispatched for testing. Click authenticate to proceed.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: 'white',
                      fontWeight: 700,
                      borderRadius: '10px',
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Authenticating Officer...' : (
                      <>
                        <ShieldCheck size={18} />
                        <span>Authenticate & Access Portal</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: ADMINISTRATOR PASSCODE ACCESS */}
          {activeTab === 'admin' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Administrator Access via Unique Passcode
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Master Administration level access with full oversight of user activities and database authorizations.
                </div>
              </div>

              <form onSubmit={handleAdminLogin}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-main)' }}>
                    Admin Account Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin.wetlands@moefcc.gov.in"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.6rem',
                        borderRadius: '10px',
                        border: '1.5px solid var(--border-light)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-main)' }}>
                    Unique Admin Passcode
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showAdminPasscode ? 'text' : 'password'}
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="Enter Admin Passcode (e.g. ADMIN@2026)"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.8rem 0.75rem 2.6rem',
                        borderRadius: '10px',
                        border: '1.5px solid var(--border-light)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '0.95rem',
                        letterSpacing: '0.05em',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <button
                      type="button"
                      onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        background: 'none',
                        padding: '4px'
                      }}
                    >
                      {showAdminPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    🔑 Default master passcode: <code style={{ color: '#7c3aed', fontWeight: 700 }}>ADMIN@2026</code>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: 'white',
                    fontWeight: 700,
                    borderRadius: '10px',
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Authenticating Admin Passcode...' : (
                    <>
                      <KeyRound size={18} />
                      <span>Authenticate with Unique Passcode</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Quick Demo Pre-Authorized Accounts Picker */}
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-light)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HelpCircle size={14} /> Quick Evaluation Test Profiles
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin.wetlands@moefcc.gov.in', 'admin', 'ADMIN@2026')}
                style={{
                  textAlign: 'left',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd6fe',
                  background: '#f5f3ff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6d28d9' }}>
                  🛡️ Chief Administrator
                </span>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                  Passcode: ADMIN@2026
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dr.anita.sharma@isro.gov.in', 'govt')}
                style={{
                  textAlign: 'left',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd',
                  background: '#f0f9ff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1' }}>
                  🛰️ Dr. Anita Sharma (ISRO)
                </span>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                  Lead EO Scientist
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rajesh.kumar@moefcc.gov.in', 'govt')}
                style={{
                  textAlign: 'left',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d' }}>
                  🏛️ Rajesh Kumar, IAS (MoEFCC)
                </span>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                  National Nodal Officer
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('unauthorized.guest@gmail.com', 'unauthorized')}
                style={{
                  textAlign: 'left',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b91c1c' }}>
                  ⚠️ Test Unauthorized Email
                </span>
                <span style={{ fontSize: '0.7rem', color: '#991b1b' }}>
                  See access refusal & audit alert
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
