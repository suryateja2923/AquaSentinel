import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  KeyRound, 
  Search, 
  Trash2, 
  UserPlus, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  FileSpreadsheet, 
  FileCode, 
  Eye, 
  EyeOff, 
  Layers,
  Radio
} from 'lucide-react';
import { dbService } from '../services/dbService';

const AdminConsole = ({ isOpen, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState('active_users'); // 'active_users' | 'activity' | 'users' | 'analytics' | 'passcode'
  
  // Database States
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUsersList, setActiveUsersList] = useState([]);
  const [adminPasscode, setAdminPasscode] = useState('');
  
  // Activity Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // Add User Form State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserDept, setNewUserDept] = useState('State Wetland Authority');
  const [newUserDesignation, setNewUserDesignation] = useState('Senior Environmental Analyst');
  const [newUserRole, setNewUserRole] = useState('government_user');
  const [newUserClearance, setNewUserClearance] = useState('Level 2 (Field Officer)');
  
  // Passcode Update Form State
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showCurrentPasscode, setShowCurrentPasscode] = useState(false);
  const [showNewPasscode, setShowNewPasscode] = useState(false);
  
  // Feedback Messages
  const [notification, setNotification] = useState(null);

  // Load database data
  const loadData = () => {
    setLogs(dbService.getActivityLogs());
    setUsers(dbService.getAuthorizedUsers());
    setAdminPasscode(dbService.getAdminPasscode());
    setActiveUsersList(dbService.getActiveUsers(currentUser));
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Listen for database changes dispatched from anywhere in the app
  useEffect(() => {
    const handleDbUpdate = () => {
      loadData();
    };

    const handleActiveUsersUpdate = (e) => {
      setActiveUsersList(e.detail || dbService.getActiveUsers(currentUser));
    };

    window.addEventListener('wetlands_db_updated', handleDbUpdate);
    window.addEventListener('wetlands_active_users_updated', handleActiveUsersUpdate);
    return () => {
      window.removeEventListener('wetlands_db_updated', handleDbUpdate);
      window.removeEventListener('wetlands_active_users_updated', handleActiveUsersUpdate);
    };
  }, [currentUser]);

  // Show temporary toast / alert
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = 
        (log.email && log.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.userName && log.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.description && log.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.actionType && log.actionType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.ip && log.ip.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
      const matchRole = roleFilter === 'ALL' || log.role === roleFilter;

      return matchSearch && matchCategory && matchRole;
    });
  }, [logs, searchQuery, categoryFilter, roleFilter]);

  // Handle Add New Authorized User
  const handleAddUser = (e) => {
    e.preventDefault();
    const result = dbService.addAuthorizedUser({
      email: newUserEmail,
      name: newUserName,
      department: newUserDept,
      designation: newUserDesignation,
      role: newUserRole,
      clearance: newUserClearance
    });

    if (result.success) {
      showToast(`Authorized personnel added to database: ${newUserEmail}`);
      setIsAddUserOpen(false);
      setNewUserEmail('');
      setNewUserName('');
      loadData();
    } else {
      showToast(result.message, 'error');
    }
  };

  // Toggle user status
  const handleToggleStatus = (userId, currentEmail) => {
    const result = dbService.toggleUserStatus(userId);
    if (result.success) {
      showToast(`Updated authorization status for ${currentEmail}`);
      loadData();
    } else {
      showToast(result.message, 'error');
    }
  };

  // Delete user
  const handleDeleteUser = (userId, email) => {
    if (window.confirm(`Are you sure you want to permanently revoke & delete ${email} from the authorized database?`)) {
      const result = dbService.deleteAuthorizedUser(userId);
      if (result.success) {
        showToast(`Revoked & deleted user: ${email}`, 'warning');
        loadData();
      } else {
        showToast(result.message, 'error');
      }
    }
  };

  // Clear all past activity logs and start fresh from now onwards
  const handleClearAllLogs = () => {
    if (window.confirm('Clear all past activity logs and start database logins fresh from now onwards?')) {
      dbService.clearActivityLogs();
      setLogs([]);
      showToast('All past database logins cleared! Tracking started fresh from now onwards.');
      loadData();
    }
  };

  // Terminate active website session
  const handleTerminateSession = (userEmail) => {
    if (window.confirm(`Disconnect active session for ${userEmail}?`)) {
      dbService.removeActiveUser(userEmail);
      dbService.logActivity({
        email: currentUser ? currentUser.email : 'admin@moefcc.gov.in',
        userName: currentUser ? currentUser.name : 'Administrator',
        role: 'admin',
        department: 'Security Operations',
        actionType: 'TERMINATE_SESSION',
        category: 'Security Alert',
        description: `Administrator terminated active session for: ${userEmail}`,
        status: 'warning'
      });
      showToast(`Terminated active session for ${userEmail}`);
      setActiveUsersList(dbService.getActiveUsers(currentUser));
      loadData();
    }
  };

  // Update Admin Passcode
  const handleUpdatePasscode = (e) => {
    e.preventDefault();
    if (!newPasscode.trim()) {
      showToast('Please enter a new passcode.', 'error');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      showToast('New passcodes do not match.', 'error');
      return;
    }
    const result = dbService.setAdminPasscode(newPasscode);
    if (result.success) {
      showToast('Unique Admin Passcode successfully updated in database!');
      setNewPasscode('');
      setConfirmPasscode('');
      loadData();
    } else {
      showToast(result.message, 'error');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvData = dbService.exportLogsAsCsv();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wetlands_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Activity audit logs exported as CSV.');
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonData = dbService.exportLogsAsJson();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wetlands_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Activity audit logs exported as JSON.');
  };

  // Simulate a live field event for demo
  const handleSimulateFieldAction = () => {
    const actions = [
      {
        email: 'dr.anita.sharma@isro.gov.in',
        userName: 'Dr. Anita Sharma',
        role: 'government_user',
        department: 'ISRO Space Applications Centre (SAC)',
        actionType: 'HOTSPOT_INSPECT',
        category: 'Analysis & Layers',
        description: 'Inspected Hotspot #2: VIP Road Corridor Expansion & Incursion (6.2 ha loss)',
        status: 'warning'
      },
      {
        email: 'rajesh.kumar@moefcc.gov.in',
        userName: 'Rajesh Kumar, IAS',
        role: 'government_user',
        department: 'MoEFCC - Wetlands Division',
        actionType: 'EXPORT_REPORT',
        category: 'Data Export',
        description: 'Generated Satellite EO Compliance Audit Brief for Ministry review',
        status: 'success'
      },
      {
        email: 'p.sengupta@wb.gov.in',
        userName: 'Prabir Sengupta, IFS',
        role: 'government_user',
        department: 'State Wetland Authority',
        actionType: 'TOGGLE_LAYER',
        category: 'Layers & Filters',
        description: 'Activated 500m Buffer Zone & Eco-Sensitive Boundary layer',
        status: 'info'
      },
      {
        email: 'unknown.intruder@external-net.org',
        userName: 'Unregistered Entity',
        role: 'unauthorized',
        department: 'External Public Network',
        actionType: 'UNAUTHORIZED_LOGIN_ATTEMPT',
        category: 'Security Alert',
        description: 'BLOCKED: Unauthorized login attempt with unregistered email external-net.org',
        status: 'alert'
      }
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    dbService.logActivity(randomAction);
    loadData();
    showToast(`Simulated event logged: ${randomAction.actionType}`);
  };

  if (!isOpen) return null;

  // Analytics Aggregates
  const totalLogsCount = logs.length;
  const securityAlertsCount = logs.filter(l => l.status === 'alert' || l.role === 'unauthorized').length;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content admin-console-box" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1200px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden' }}
      >
        {/* Top Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
          color: 'white',
          padding: '1.2rem 1.75rem',
          borderBottom: '2px solid #6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}>
              <ShieldCheck size={26} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                  National Wetland Intelligence • Admin Command Center
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: '1px solid rgba(74, 222, 128, 0.3)'
                }}>
                  <Radio size={10} className="pulse-dot" /> LIVE AUDIT DB
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                Centralized User Activity Monitoring, Personnel Authorizations & Passcode Security
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleSimulateFieldAction}
              style={{
                fontSize: '0.78rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600
              }}
              title="Inject a real-time field officer event to test live stream"
            >
              <RefreshCw size={13} />
              Simulate Live Event
            </button>
            <button 
              onClick={onClose}
              style={{ 
                color: '#cbd5e1', 
                background: 'rgba(255,255,255,0.08)', 
                borderRadius: '8px', 
                padding: '6px',
                cursor: 'pointer' 
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-light)',
          padding: '0.75rem 1.5rem',
          gap: '1rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE WEBSITE USERS</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a' }}>
                {activeUsersList.length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>online now</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <Activity size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIONS LOGGED (FROM NOW)</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {logs.length} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>events</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SECURITY INTERCEPTIONS</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#dc2626' }}>
                {securityAlertsCount} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>unauthorized blocked</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <KeyRound size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>ADMIN PASSCODE CLEARANCE</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7c3aed' }}>
                LEVEL 5 <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Unique PIN Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.65rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-card)',
          flexShrink: 0
        }}>
          {/* TAB 1: ACTIVE USERS (LIVE SESSIONS ONLY) */}
          <button
            onClick={() => setActiveTab('active_users')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === 'active_users' ? 'var(--color-brand-light)' : 'transparent',
              color: activeTab === 'active_users' ? '#0284c7' : 'var(--text-muted)',
              border: activeTab === 'active_users' ? '1px solid #bae6fd' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
            <Users size={16} />
            <span>Active Users</span>
            <span style={{ 
              fontSize: '0.7rem', 
              background: '#059669', 
              color: 'white', 
              padding: '0.1rem 0.5rem', 
              borderRadius: '9999px',
              fontWeight: 800 
            }}>
              {activeUsersList.length} Online
            </span>
          </button>

          {/* TAB 2: AUDIT ACTIVITY LOG (FROM NOW ONWARDS) */}
          <button
            onClick={() => setActiveTab('activity')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === 'activity' ? 'var(--color-brand-light)' : 'transparent',
              color: activeTab === 'activity' ? '#0284c7' : 'var(--text-muted)',
              border: activeTab === 'activity' ? '1px solid #bae6fd' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <Activity size={16} />
            <span>Audit Activity Log</span>
            <span style={{ 
              fontSize: '0.7rem', 
              background: '#0284c7', 
              color: 'white', 
              padding: '0.1rem 0.45rem', 
              borderRadius: '9999px',
              fontWeight: 800 
            }}>
              {logs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === 'users' ? 'var(--color-brand-light)' : 'transparent',
              color: activeTab === 'users' ? '#0284c7' : 'var(--text-muted)',
              border: activeTab === 'users' ? '1px solid #bae6fd' : '1px solid transparent'
            }}
          >
            <Users size={16} />
            <span>Authorized Emails Database</span>
            <span style={{ 
              fontSize: '0.7rem', 
              background: 'var(--bg-muted)', 
              color: 'var(--text-main)', 
              padding: '0.1rem 0.45rem', 
              borderRadius: '9999px',
              fontWeight: 800 
            }}>
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === 'analytics' ? 'var(--color-brand-light)' : 'transparent',
              color: activeTab === 'analytics' ? '#0284c7' : 'var(--text-muted)',
              border: activeTab === 'analytics' ? '1px solid #bae6fd' : '1px solid transparent'
            }}
          >
            <Layers size={16} />
            <span>Activity Telemetry & Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('passcode')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: activeTab === 'passcode' ? 'var(--color-brand-light)' : 'transparent',
              color: activeTab === 'passcode' ? '#7c3aed' : 'var(--text-muted)',
              border: activeTab === 'passcode' ? '1px solid #ddd6fe' : '1px solid transparent'
            }}
          >
            <KeyRound size={16} />
            <span>Admin Unique Passcode</span>
          </button>
        </div>

        {/* Global Toast Notification */}
        {notification && (
          <div style={{
            margin: '0.75rem 1.5rem 0',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: notification.type === 'error' ? '#fef2f2' : notification.type === 'warning' ? '#fffbeb' : '#f0fdf4',
            color: notification.type === 'error' ? '#b91c1c' : notification.type === 'warning' ? '#b45309' : '#15803d',
            border: `1px solid ${notification.type === 'error' ? '#fecaca' : notification.type === 'warning' ? '#fde68a' : '#bbf7d0'}`
          }}>
            {notification.type === 'error' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
            {notification.message}
          </div>
        )}

        {/* TAB 1: ACTIVE USERS (SHOWS ONLY THE USERS CURRENTLY USING THE WEBSITE) */}
        {activeTab === 'active_users' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.25rem 1.5rem' }}>
            {/* Active Users Header & Action Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e', display: 'inline-block' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Live Active Website Users
                  </h3>
                  <span style={{
                    fontSize: '0.72rem',
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    fontWeight: 800
                  }}>
                    {activeUsersList.length} User{activeUsersList.length === 1 ? '' : 's'} Online Now
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Showing only personnel and administrators currently logged in and actively using the website.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button
                  onClick={() => {
                    setActiveUsersList(dbService.getActiveUsers(currentUser));
                    showToast('Active website user sessions refreshed.');
                  }}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Refresh Sessions</span>
                </button>

                <button
                  onClick={handleClearAllLogs}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#dc2626',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                  title="Remove all past database logins and start audit trail fresh from now onwards"
                >
                  <Trash2 size={14} />
                  <span>Clear Past Logins (Start Fresh)</span>
                </button>
              </div>
            </div>

            {/* Active Users Table / Cards */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--bg-card)' }}>
              {activeUsersList.length === 0 ? (
                <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Users size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>No active user sessions detected</div>
                  <div style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>Users will appear here as soon as they log into the website.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Active Officer / User</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Role & Access Level</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Department & Designation</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Live Session Status</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Current Activity</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>GovNet Origin IP</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Session Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeUsersList.map((user) => {
                      const isAdm = user.role === 'admin';
                      return (
                        <tr key={user.sessionId || user.email} style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ position: 'relative' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  background: isAdm ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.9rem',
                                  boxShadow: isAdm ? '0 2px 8px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(2, 132, 199, 0.3)'
                                }}>
                                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span style={{
                                  position: 'absolute',
                                  bottom: -1,
                                  right: -1,
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  background: '#22c55e',
                                  border: '2px solid white',
                                  boxShadow: '0 0 6px #22c55e'
                                }} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                                  {user.name}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                width: 'fit-content',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '9999px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                background: isAdm ? '#f5f3ff' : '#f0f9ff',
                                color: isAdm ? '#7c3aed' : '#0284c7',
                                border: `1px solid ${isAdm ? '#ddd6fe' : '#bae6fd'}`
                              }}>
                                {isAdm ? '🛡️ Admin' : '🏛️ Govt User'}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {user.clearance || 'Level 3 Clearance'}
                              </span>
                            </div>
                          </td>

                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.82rem' }}>
                              {user.designation || 'Authorized Officer'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {user.department || 'MoEFCC - Wetlands Division'}
                            </div>
                          </td>

                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: 800, fontSize: '0.78rem' }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                              <span>ONLINE NOW</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Logged in at {user.loginTime || 'Active'}
                            </div>
                          </td>

                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{
                              background: 'var(--bg-subtle)',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-light)',
                              fontSize: '0.76rem',
                              color: 'var(--text-main)',
                              fontWeight: 600,
                              maxWidth: '260px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }} title={user.currentActivity}>
                              {user.currentActivity || 'Active on Portal'}
                            </div>
                          </td>

                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {user.ip || '10.14.38.92 (NIC GovNet VPN)'}
                            </div>
                          </td>

                          <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleTerminateSession(user.email)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#dc2626',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              title="Disconnect active session"
                            >
                              Disconnect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT ACTIVITY LOG (FROM NOW ONWARDS) */}
        {activeTab === 'activity' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1rem 1.5rem' }}>
            {/* Filter and Control Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user email, officer name, action, or GovNet IP..."
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem 0.6rem 2.3rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="Authentication">Authentication</option>
                <option value="GIS Navigation">GIS Navigation</option>
                <option value="Analysis & Layers">Analysis & Layers</option>
                <option value="Data Export">Data Export</option>
                <option value="Security Alert">Security Alerts</option>
                <option value="Admin Config">Admin Config</option>
              </select>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              >
                <option value="ALL">All User Roles</option>
                <option value="government_user">Government Users Only</option>
                <option value="admin">Administrators Only</option>
                <option value="unauthorized">Blocked Unauthorized Entities</option>
              </select>

              {/* Export Buttons */}
              <button
                onClick={handleExportCsv}
                style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: '8px',
                  background: '#0284c7',
                  color: 'white',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <FileSpreadsheet size={15} />
                Export CSV
              </button>

              <button
                onClick={handleExportJson}
                style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: '8px',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <FileCode size={15} />
                Export JSON
              </button>

              <button
                onClick={handleClearAllLogs}
                style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#dc2626',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
                title="Wipe previous logins and start tracking fresh from now onwards"
              >
                <Trash2 size={15} />
                Clear Logs (Start From Now)
              </button>
            </div>

            {/* Live Activity Table */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '10px', background: 'var(--bg-card)' }}>
              {filteredLogs.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Activity size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>No activity records match your filter criteria</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Clear filters or interact with the GIS portal to generate live activity.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Timestamp</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Government User / Email</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Role</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Action Type</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Activity Description</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>GovNet IP / Origin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      // Determine visual styling based on status & action
                      const isAlert = log.status === 'alert' || log.role === 'unauthorized';
                      const isWarning = log.status === 'warning';

                      let badgeBg = '#f1f5f9';
                      let badgeColor = '#475569';
                      if (isAlert) {
                        badgeBg = '#fee2e2';
                        badgeColor = '#dc2626';
                      } else if (isWarning) {
                        badgeBg = '#fef3c7';
                        badgeColor = '#d97706';
                      } else if (log.actionType === 'LOGIN' || log.actionType === 'ADMIN_LOGIN') {
                        badgeBg = '#dcfce7';
                        badgeColor = '#15803d';
                      } else if (log.category === 'GIS Navigation') {
                        badgeBg = '#e0f2fe';
                        badgeColor = '#0284c7';
                      } else if (log.category === 'Analysis & Layers') {
                        badgeBg = '#ede9fe';
                        badgeColor = '#7c3aed';
                      }

                      return (
                        <tr 
                          key={log.id} 
                          style={{ 
                            borderBottom: '1px solid var(--border-light)',
                            background: isAlert ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                            transition: 'background 0.15s'
                          }}
                        >
                          {/* Timestamp */}
                          <td style={{ padding: '0.7rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{log.timeFormatted}</div>
                            <div style={{ fontSize: '0.7rem' }}>{log.dateFormatted}</div>
                          </td>

                          {/* User Email & Department */}
                          <td style={{ padding: '0.7rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: isAlert ? '#dc2626' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {isAlert ? <ShieldAlert size={14} color="#dc2626" /> : null}
                              {log.userName}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                              {log.email}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '1px' }}>
                              {log.department}
                            </div>
                          </td>

                          {/* Role Pill */}
                          <td style={{ padding: '0.7rem 1rem', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: log.role === 'admin' ? '#f5f3ff' : log.role === 'unauthorized' ? '#fef2f2' : '#ecfdf5',
                              color: log.role === 'admin' ? '#7c3aed' : log.role === 'unauthorized' ? '#dc2626' : '#059669',
                              border: `1px solid ${log.role === 'admin' ? '#ddd6fe' : log.role === 'unauthorized' ? '#fecaca' : '#a7f3d0'}`
                            }}>
                              {log.role === 'admin' ? '🛡️ Admin' : log.role === 'unauthorized' ? '🚨 Blocked' : '🏛️ Govt User'}
                            </span>
                          </td>

                          {/* Action Type Badge */}
                          <td style={{ padding: '0.7rem 1rem', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              padding: '0.22rem 0.55rem',
                              borderRadius: '6px',
                              fontWeight: 700,
                              background: badgeBg,
                              color: badgeColor,
                              fontFamily: 'var(--font-mono)'
                            }}>
                              {log.actionType}
                            </span>
                          </td>

                          {/* Description & Details */}
                          <td style={{ padding: '0.7rem 1rem' }}>
                            <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                              {log.description}
                            </div>
                          </td>

                          {/* GovNet IP */}
                          <td style={{ padding: '0.7rem 1rem', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {log.ip}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AUTHORIZED EMAILS DATABASE MANAGEMENT */}
        {activeTab === 'users' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1rem 1.5rem' }}>
            {/* Header with Add Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Authorized Government Email Registry
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Only emails listed in this database can authenticate into the Satellite Intelligence portal.
                </div>
              </div>

              <button
                onClick={() => setIsAddUserOpen(true)}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)'
                }}
              >
                <UserPlus size={16} />
                Authorize New Government Email
              </button>
            </div>

            {/* Users Table */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '10px', background: 'var(--bg-card)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Personnel Name & Email</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Ministry / Department</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Designation & Clearance</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Role</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Activity Telemetry</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isActive = user.status === 'active';
                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        {/* Name & Email */}
                        <td style={{ padding: '0.8rem 1rem' }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                            {user.name}
                          </div>
                          <div style={{ color: '#0284c7', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                            {user.email}
                          </div>
                        </td>

                        {/* Department */}
                        <td style={{ padding: '0.8rem 1rem', color: 'var(--text-main)', fontWeight: 500 }}>
                          {user.department}
                        </td>

                        {/* Designation & Clearance */}
                        <td style={{ padding: '0.8rem 1rem' }}>
                          <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.designation}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{user.clearance}</div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '0.8rem 1rem', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            background: user.role === 'admin' ? '#f5f3ff' : '#ecfdf5',
                            color: user.role === 'admin' ? '#7c3aed' : '#059669',
                            border: `1px solid ${user.role === 'admin' ? '#ddd6fe' : '#a7f3d0'}`
                          }}>
                            {user.role === 'admin' ? '🛡️ Administrator' : '🏛️ Government User'}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '0.8rem 1rem', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            fontWeight: 700,
                            background: isActive ? '#dcfce7' : '#fee2e2',
                            color: isActive ? '#15803d' : '#b91c1c'
                          }}>
                            {isActive ? '● Active Authorized' : '○ Suspended / Revoked'}
                          </span>
                        </td>

                        {/* Activity */}
                        <td style={{ padding: '0.8rem 1rem', whiteSpace: 'nowrap', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          <div>Logins: <b>{user.totalLogins || 0}</b></div>
                          <div>Last: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.8rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleToggleStatus(user.id, user.email)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                background: isActive ? '#fff7ed' : '#f0fdf4',
                                color: isActive ? '#c2410c' : '#15803d',
                                border: `1px solid ${isActive ? '#ffedd5' : '#bbf7d0'}`
                              }}
                              title={isActive ? 'Revoke access for this email' : 'Reactivate access'}
                            >
                              {isActive ? 'Revoke Access' : 'Re-activate'}
                            </button>

                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                style={{
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca'
                                }}
                                title="Delete user permanently"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add User Modal Dialog */}
            {isAddUserOpen && (
              <div className="modal-overlay" onClick={() => setIsAddUserOpen(false)} style={{ zIndex: 1250 }}>
                <div 
                  className="modal-content" 
                  onClick={(e) => e.stopPropagation()}
                  style={{ maxWidth: '520px', width: '90%', borderRadius: '14px', padding: '1.5rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserPlus size={20} color="#0284c7" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Authorize New Government Personnel
                      </h3>
                    </div>
                    <button onClick={() => setIsAddUserOpen(false)} style={{ color: 'var(--text-muted)' }}>
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleAddUser}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                        Official Email Address *
                      </label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="e.g. officer.name@state.gov.in"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                        Full Name & Title *
                      </label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Dr. Ramesh Chander, IFS"
                        required
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                        Ministry / Department
                      </label>
                      <input
                        type="text"
                        value={newUserDept}
                        onChange={(e) => setNewUserDept(e.target.value)}
                        placeholder="e.g. State Wetland Authority / MoEFCC"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                        Designation & Title
                      </label>
                      <input
                        type="text"
                        value={newUserDesignation}
                        onChange={(e) => setNewUserDesignation(e.target.value)}
                        placeholder="e.g. Senior Environmental Analyst"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                          Role
                        </label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            fontSize: '0.88rem',
                            outline: 'none'
                          }}
                        >
                          <option value="government_user">Government User</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                          Clearance Level
                        </label>
                        <select
                          value={newUserClearance}
                          onChange={(e) => setNewUserClearance(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            fontSize: '0.88rem',
                            outline: 'none'
                          }}
                        >
                          <option value="Level 2 (Field Officer)">Level 2 (Field Officer)</option>
                          <option value="Level 3 (Nodal Officer)">Level 3 (Nodal Officer)</option>
                          <option value="Level 4 (Chief Conservator)">Level 4 (Chief Conservator)</option>
                          <option value="Level 5 (Portal Admin)">Level 5 (Portal Admin)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setIsAddUserOpen(false)}
                        style={{
                          padding: '0.65rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          background: 'var(--bg-subtle)',
                          color: 'var(--text-main)',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '0.65rem 1.25rem',
                          borderRadius: '8px',
                          background: '#0284c7',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        Store in Database
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACTIVITY TELEMETRY & STATS */}
        {activeTab === 'analytics' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Action Distribution Breakdown */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={18} color="#0284c7" /> User Action Distribution Breakdown
                </h4>
                
                {['GIS Navigation', 'Analysis & Layers', 'Authentication', 'Data Export', 'Security Alert'].map(cat => {
                  const count = logs.filter(l => l.category === cat).length;
                  const pct = totalLogsCount > 0 ? Math.round((count / totalLogsCount) * 100) : 0;
                  
                  return (
                    <div key={cat} style={{ marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat}</span>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{count} events ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${pct}%`, 
                          height: '100%', 
                          background: cat === 'Security Alert' ? '#ef4444' : cat === 'GIS Navigation' ? '#0284c7' : cat === 'Analysis & Layers' ? '#7c3aed' : '#059669',
                          borderRadius: '9999px' 
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Most Active Personnel Leaderboard */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} color="#059669" /> Most Active Government Personnel
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {users.slice(0, 5).map(u => {
                    const userActionsCount = logs.filter(l => l.email === u.email).length;
                    return (
                      <div 
                        key={u.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          background: 'var(--bg-subtle)',
                          borderRadius: '8px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{u.email}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            background: 'rgba(2, 132, 199, 0.1)',
                            color: '#0284c7',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px'
                          }}>
                            {userActionsCount} actions
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Security Interception Audit Notice */}
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <ShieldAlert size={20} color="#dc2626" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991b1b' }}>
                  National Cyber Security & Access Enforcement Summary
                </h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                All user interactions with high-resolution Sentinel-2 and Landsat-9 earth observation imagery are audited and stamped with GovNet network identifiers in accordance with the National Geo-Spatial Data Policy. Unauthorized email entries are blocked at the perimeter and logged for administrative investigation.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN PASSCODE CREDENTIALS */}
        {activeTab === 'passcode' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', maxWidth: '640px' }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '14px',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(124, 58, 237, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7c3aed'
                }}>
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Admin Unique Passcode Configuration
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Configure the master security passcode used by the Administrator to access the portal.
                  </div>
                </div>
              </div>

              {/* Current Passcode Display */}
              <div style={{
                background: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Current Active Unique Passcode
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <code style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: '#7c3aed',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {showCurrentPasscode ? adminPasscode : '••••••••••'}
                  </code>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPasscode(!showCurrentPasscode)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {showCurrentPasscode ? <EyeOff size={15} /> : <Eye size={15} />}
                    <span>{showCurrentPasscode ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>
              </div>

              {/* Change Passcode Form */}
              <form onSubmit={handleUpdatePasscode}>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-main)' }}>
                    Enter New Unique Passcode
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPasscode ? 'text' : 'password'}
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="Enter minimum 4 characters"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.8rem 0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border-light)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPasscode(!showNewPasscode)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        background: 'none'
                      }}
                    >
                      {showNewPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-main)' }}>
                    Confirm New Unique Passcode
                  </label>
                  <input
                    type={showNewPasscode ? 'text' : 'password'}
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Re-type new passcode"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-light)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                  }}
                >
                  Save New Admin Passcode
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConsole;
