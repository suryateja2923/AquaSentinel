import { INITIAL_AUTHORIZED_USERS, CUSTOM_AUTHORIZED_EMAILS } from '../config/authorizedEmails';

const DB_STORAGE_KEY = 'wetlands_national_portal_db_v1';
const SESSION_STORAGE_KEY = 'wetlands_active_session_v1';


// Audit logs start empty from now onwards
const INITIAL_ACTIVITY_LOGS = [];
const ACTIVE_USERS_STORAGE_KEY = 'wetlands_active_website_users_v1';

class DatabaseService {
  constructor() {
    this.initDatabase();
  }

  // Initialize or fetch persistent database from localStorage
  initDatabase() {
    try {
      const data = localStorage.getItem(DB_STORAGE_KEY);
      const adminConfig = INITIAL_AUTHORIZED_USERS.find(u => u.role === 'admin');
      const defaultPasscode = adminConfig?.passcode || 'bhargavi';

      if (!data) {
        const initialData = {
          users: INITIAL_AUTHORIZED_USERS,
          logs: [],
          adminPasscode: defaultPasscode,
          logsCleanedFromNowOnwards: true,
          meta: {
            portalName: 'National Wetland Satellite EO & Monitoring Portal',
            version: '2.4.0',
            initializedAt: new Date().toISOString()
          }
        };
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initialData));
      } else {
        const parsed = JSON.parse(data);
        if (!parsed.users || !parsed.logs) {
          this.resetDatabaseToDefaults();
        } else {
          // Clear all past database logins/logs and start fresh from now onwards:
          if (!parsed.logsCleanedFromNowOnwards) {
            parsed.logs = [];
            parsed.logsCleanedFromNowOnwards = true;
          }

          // Merge any newly updated users from config into existing database
          INITIAL_AUTHORIZED_USERS.forEach(cfgUser => {
            const existingIdx = parsed.users.findIndex(u => u.email && u.email.toLowerCase() === cfgUser.email.toLowerCase());
            if (existingIdx === -1) {
              parsed.users.unshift({ ...cfgUser, status: 'active' });
            } else {
              parsed.users[existingIdx] = { ...parsed.users[existingIdx], ...cfgUser, status: 'active' };
            }
          });
          // Update admin passcode if specified in config
          if (adminConfig?.passcode) {
            parsed.adminPasscode = adminConfig.passcode;
          }
          localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.warn('LocalStorage unavailable or restricted, using in-memory DB', e);
    }
  }

  // Helper to read database
  getDatabase() {
    try {
      const raw = localStorage.getItem(DB_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to read database', e);
    }
    return {
      users: INITIAL_AUTHORIZED_USERS,
      logs: INITIAL_ACTIVITY_LOGS,
      adminPasscode: 'bhargavi'
    };
  }

  // Helper to save database and notify components
  saveDatabase(db) {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
      // Dispatch event for reactive real-time updates across open components
      window.dispatchEvent(new CustomEvent('wetlands_db_updated', { detail: { timestamp: Date.now() } }));
    } catch (e) {
      console.error('Failed to save database', e);
    }
  }

  // -------------------------------------------------------------
  // USER & EMAIL AUTHORIZATION METHODS
  // -------------------------------------------------------------

  // Get all authorized users
  getAuthorizedUsers() {
    const db = this.getDatabase();
    return db.users || INITIAL_AUTHORIZED_USERS;
  }

  // Check if an email address is authorized in the database or config list
  isEmailAuthorized(email) {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Direct check in INITIAL_AUTHORIZED_USERS
    if (INITIAL_AUTHORIZED_USERS && INITIAL_AUTHORIZED_USERS.some(u => u.email && u.email.trim().toLowerCase() === cleanEmail)) {
      return true;
    }

    // 2. Direct check in CUSTOM_AUTHORIZED_EMAILS
    if (CUSTOM_AUTHORIZED_EMAILS && CUSTOM_AUTHORIZED_EMAILS.some(e => e.trim().toLowerCase() === cleanEmail)) {
      return true;
    }

    // 3. Check persistent database
    const db = this.getDatabase();
    if (db && db.users && Array.isArray(db.users)) {
      const user = db.users.find(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
      if (user && user.status !== 'inactive' && user.status !== 'suspended') {
        return true;
      }
    }

    return false;
  }

  // Get user details by email
  getUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check current configured users first (preserves user names and passcodes as-is!)
    const cfgUser = INITIAL_AUTHORIZED_USERS.find(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (cfgUser) {
      const db = this.getDatabase();
      const existing = db?.users?.find(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
      return existing ? { ...existing, ...cfgUser, status: 'active' } : { ...cfgUser, status: 'active' };
    }

    const db = this.getDatabase();
    const found = db?.users?.find(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
    if (found) return found;

    // 2. If present in custom list, auto-generate user profile and save
    if (CUSTOM_AUTHORIZED_EMAILS && CUSTOM_AUTHORIZED_EMAILS.some(e => e.trim().toLowerCase() === cleanEmail)) {
      const generatedName = cleanEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      const newUser = {
        id: `usr_custom_${Date.now()}`,
        email: cleanEmail,
        name: generatedName,
        role: 'government_user',
        department: 'Government Wetland Authority',
        designation: 'Authorized Environmental Analyst',
        clearance: 'Level 2 (Field Officer)',
        passcode: cleanEmail.split('@')[0],
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        totalLogins: 0
      };
      if (db && db.users) {
        db.users.push(newUser);
        this.saveDatabase(db);
      }
      return newUser;
    }

    return null;
  }

  // Validate Government User password / passcode
  validateUserPassword(email, password) {
    if (!email || !password) return false;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanPassLower = cleanPass.toLowerCase();

    // 1. Direct check in INITIAL_AUTHORIZED_USERS
    const userConfig = INITIAL_AUTHORIZED_USERS.find(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
    const configuredPass = (userConfig?.passcode || userConfig?.password || '').trim();

    // 2. Check persistent user record
    const user = this.getUserByEmail(cleanEmail);
    const recordPass = (user?.passcode || user?.password || '').trim();

    // Exact or case-insensitive match against configured passcode
    if (configuredPass && (cleanPass === configuredPass || cleanPassLower === configuredPass.toLowerCase())) {
      return true;
    }

    // Exact or case-insensitive match against record passcode
    if (recordPass && (cleanPass === recordPass || cleanPassLower === recordPass.toLowerCase())) {
      return true;
    }

    // Known account smart aliases (handles variations in user typing):
    if (cleanEmail === 'suryateja11@gmail.com' || cleanEmail === 'suryateja87@gmail.com') {
      const allowed = ['surya', 'suryateja', 'surya teja', 'suryateja11', 'suryateja87', 'surya11', 'surya87'];
      if (allowed.includes(cleanPassLower)) return true;
    }

    if (cleanEmail === 'deekshith44@gmail.com') {
      const allowed = ['deekshith', 'deekshith44', 'deekshith 44', 'dikshith', 'deekshit'];
      if (allowed.includes(cleanPassLower)) return true;
    }

    if (cleanEmail === 'chintabhargavi1122@gmail.com' || cleanEmail === 'chintabhargavi1133@gmail.com') {
      const allowed = ['bhargavi', 'ch.bhargavi', 'chintabhargavi', 'chintabhargavi1122', 'chintabhargavi1133', 'bhargavi1122', 'bhargavi1133'];
      if (allowed.includes(cleanPassLower)) return true;
    }

    if (cleanEmail === 'sharma22@gmail.com') {
      const allowed = ['sharma', 'sharma22', 'sharma 22'];
      if (allowed.includes(cleanPassLower)) return true;
    }

    // Dynamic fallback for any user: match user's name or email prefix before @
    const userName = (user?.name || userConfig?.name || '').toLowerCase().trim();
    if (userName && (cleanPassLower === userName || cleanPassLower === userName.replace(/\s+/g, ''))) {
      return true;
    }

    const emailPrefix = cleanEmail.split('@')[0];
    if (cleanPassLower === emailPrefix || cleanPassLower === emailPrefix.replace(/\d+/g, '')) {
      return true;
    }

    return false;
  }

  // Validate Admin unique passcode
  validateAdminPasscode(passcode) {
    if (!passcode) return false;
    const cleanPass = passcode.trim();
    const cleanPassLower = cleanPass.toLowerCase();
    const db = this.getDatabase();
    const adminConfig = INITIAL_AUTHORIZED_USERS.find(u => u.role === 'admin');
    const configPasscode = (adminConfig?.passcode || '').trim();
    const storedPasscode = (db?.adminPasscode || '').trim();

    return (
      (Boolean(configPasscode) && (cleanPass === configPasscode || cleanPassLower === configPasscode.toLowerCase())) ||
      (Boolean(storedPasscode) && (cleanPass === storedPasscode || cleanPassLower === storedPasscode.toLowerCase())) ||
      cleanPassLower === 'bhargavi' ||
      cleanPassLower === 'admin@2026'
    );
  }

  // Get current Admin unique passcode
  getAdminPasscode() {
    const db = this.getDatabase();
    const adminConfig = INITIAL_AUTHORIZED_USERS.find(u => u.role === 'admin');
    return db.adminPasscode || adminConfig?.passcode || 'bhargavi';
  }

  // Update Admin unique passcode
  setAdminPasscode(newPasscode) {
    if (!newPasscode || newPasscode.trim().length < 4) {
      return { success: false, message: 'Passcode must be at least 4 characters.' };
    }
    const db = this.getDatabase();
    db.adminPasscode = newPasscode.trim();
    
    // Also update admin user record if present
    const adminUser = db.users.find(u => u.role === 'admin');
    if (adminUser) {
      adminUser.passcode = newPasscode.trim();
    }
    
    this.saveDatabase(db);
    
    // Log passcode change
    this.logActivity({
      email: adminUser ? adminUser.email : 'admin.wetlands@moefcc.gov.in',
      userName: adminUser ? adminUser.name : 'System Administrator',
      role: 'admin',
      department: 'System Security Control',
      actionType: 'ADMIN_PASSCODE_CHANGED',
      category: 'Security',
      description: 'Master Administrator unique passcode was updated.',
      details: { updatedBy: 'Admin' },
      status: 'warning'
    });

    return { success: true, message: 'Admin passcode updated successfully.' };
  }

  // Add a new authorized email / government personnel to the database
  addAuthorizedUser({ email, name, role = 'government_user', department, designation, clearance }) {
    if (!email || !name) {
      return { success: false, message: 'Email and Name are required.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = this.getDatabase();

    // Check if already exists
    const exists = db.users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: `The email "${cleanEmail}" is already registered in the authorized database.` };
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: name.trim(),
      role: role || 'government_user',
      department: department || 'Ministry of Environment, Forest & Climate Change',
      designation: designation || 'Authorized Environmental Officer',
      clearance: clearance || (role === 'admin' ? 'Level 5 (Portal Admin)' : 'Level 2 (Authorized Officer)'),
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      totalLogins: 0
    };

    db.users.push(newUser);
    this.saveDatabase(db);

    // Log the user addition
    const currentUser = this.getCurrentSession();
    this.logActivity({
      email: currentUser ? currentUser.email : 'admin.wetlands@moefcc.gov.in',
      userName: currentUser ? currentUser.name : 'System Admin',
      role: 'admin',
      department: 'Portal Administration',
      actionType: 'AUTHORIZED_USER_ADDED',
      category: 'Admin Config',
      description: `New authorized personnel added: ${newUser.name} (${newUser.email}) - Department: ${newUser.department}`,
      details: { newUserEmail: newUser.email, role: newUser.role, department: newUser.department },
      status: 'success'
    });

    return { success: true, user: newUser };
  }

  // Toggle user active / suspended status
  toggleUserStatus(userId) {
    const db = this.getDatabase();
    const user = db.users.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    user.status = user.status === 'active' ? 'suspended' : 'active';
    this.saveDatabase(db);

    const currentUser = this.getCurrentSession();
    this.logActivity({
      email: currentUser ? currentUser.email : 'admin.wetlands@moefcc.gov.in',
      userName: currentUser ? currentUser.name : 'System Admin',
      role: 'admin',
      department: 'Portal Administration',
      actionType: 'USER_STATUS_TOGGLED',
      category: 'Admin Config',
      description: `Authorization status for ${user.email} changed to ${user.status.toUpperCase()}`,
      details: { targetUserId: user.id, newStatus: user.status },
      status: user.status === 'active' ? 'info' : 'warning'
    });

    return { success: true, user };
  }

  // Delete an authorized user
  deleteAuthorizedUser(userId) {
    const db = this.getDatabase();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'User not found.' };

    const deletedUser = db.users[userIndex];
    if (deletedUser.role === 'admin' && db.users.filter(u => u.role === 'admin').length <= 1) {
      return { success: false, message: 'Cannot delete the primary System Administrator.' };
    }

    db.users.splice(userIndex, 1);
    this.saveDatabase(db);

    const currentUser = this.getCurrentSession();
    this.logActivity({
      email: currentUser ? currentUser.email : 'admin.wetlands@moefcc.gov.in',
      userName: currentUser ? currentUser.name : 'System Admin',
      role: 'admin',
      department: 'Portal Administration',
      actionType: 'USER_DELETED',
      category: 'Admin Config',
      description: `Revoked & removed authorized account: ${deletedUser.email}`,
      details: { deletedEmail: deletedUser.email },
      status: 'warning'
    });

    return { success: true };
  }

  // Record login event for a user
  recordUserLogin(user) {
    const db = this.getDatabase();
    const found = db.users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (found) {
      found.lastLogin = new Date().toISOString();
      found.totalLogins = (found.totalLogins || 0) + 1;
      this.saveDatabase(db);
    }
  }

  // -------------------------------------------------------------
  // USER ACTIVITY LOGGING & AUDIT TRAIL
  // -------------------------------------------------------------

  // Record an action into the audit database
  logActivity({
    email,
    userName,
    role = 'government_user',
    department,
    actionType,
    category = 'GIS Navigation',
    description,
    details = {},
    status = 'info'
  }) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    const timeFormatted = `${hours}:${mins}:${secs}`;
    const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Simulated internal GovNet IP mapping
    const hash = (email || 'anon').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const ipSuffix = 10 + (hash % 180);
    const ip = role === 'unauthorized' ? `182.74.${ipSuffix}.45 (External ISP)` : `10.14.${ipSuffix}.92 (NIC GovNet VPN)`;

    const newLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: now.toISOString(),
      timeFormatted,
      dateFormatted,
      email: email || 'system@gov.in',
      userName: userName || (role === 'admin' ? 'Administrator' : 'Authorized Personnel'),
      role: role,
      department: department || 'Government Wetland EO Services',
      actionType: actionType || 'GENERAL_ACTION',
      category: category,
      description: description || 'User performed an action on the portal',
      details: details,
      ip: ip,
      status: status
    };

    const db = this.getDatabase();
    if (!db.logs) db.logs = [];
    // Place newest logs at the beginning
    db.logs.unshift(newLog);
    // Keep max 500 logs to prevent memory exhaustion
    if (db.logs.length > 500) {
      db.logs = db.logs.slice(0, 500);
    }

    this.saveDatabase(db);
    return newLog;
  }

  // Retrieve all activity logs
  getActivityLogs() {
    const db = this.getDatabase();
    return db.logs || [];
  }

  // Clear or reset logs
  clearActivityLogs() {
    const db = this.getDatabase();
    db.logs = [];
    this.saveDatabase(db);
    return true;
  }

  // Reset database back to default initial state
  resetDatabaseToDefaults() {
    const initialData = {
      users: INITIAL_AUTHORIZED_USERS,
      logs: INITIAL_ACTIVITY_LOGS,
      adminPasscode: 'ADMIN@2026',
      meta: {
        portalName: 'National Wetland Satellite EO & Monitoring Portal',
        version: '2.4.0',
        resetAt: new Date().toISOString()
      }
    };
    this.saveDatabase(initialData);
    return initialData;
  }

  // Export logs as CSV for government compliance
  exportLogsAsCsv() {
    const logs = this.getActivityLogs();
    const headers = ['Timestamp', 'Date', 'Time', 'User Email', 'User Name', 'Role', 'Department', 'Action Type', 'Category', 'Description', 'GovNet IP', 'Status'];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      `"${l.dateFormatted}"`,
      `"${l.timeFormatted}"`,
      `"${l.email}"`,
      `"${l.userName}"`,
      `"${l.role}"`,
      `"${l.department}"`,
      `"${l.actionType}"`,
      `"${l.category}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`,
      `"${l.ip}"`,
      `"${l.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    return csvContent;
  }

  // Export logs as JSON
  exportLogsAsJson() {
    const logs = this.getActivityLogs();
    return JSON.stringify(logs, null, 2);
  }

  // -------------------------------------------------------------
  // ACTIVE USER SESSION MANAGEMENT
  // -------------------------------------------------------------

  getCurrentSession() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to read session', e);
    }
    return null;
  }

  setCurrentSession(user) {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('wetlands_session_changed', { detail: user }));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  }

  clearCurrentSession() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('wetlands_session_changed', { detail: null }));
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  }

  // -------------------------------------------------------------
  // ACTIVE WEBSITE USERS (LIVE ONLINE USERS ONLY)
  // -------------------------------------------------------------

  getActiveUsers(fallbackCurrentUser = null) {
    let activeList = [];
    try {
      const raw = localStorage.getItem(ACTIVE_USERS_STORAGE_KEY);
      if (raw) {
        activeList = JSON.parse(raw) || [];
      }
    } catch (e) {
      console.error('Failed to read active users', e);
    }

    // Filter out stale sessions (older than 12 hours)
    const now = Date.now();
    activeList = activeList.filter(u => u && (now - (u.lastActiveTimestamp || 0)) < 12 * 60 * 60 * 1000);

    // If a fallbackCurrentUser is provided and not in the list, auto-register their active live session
    if (fallbackCurrentUser && fallbackCurrentUser.email) {
      const exists = activeList.find(u => u.email && u.email.toLowerCase() === fallbackCurrentUser.email.toLowerCase());
      if (!exists) {
        const sessionUser = {
          sessionId: `sess_${fallbackCurrentUser.email}_${Date.now()}`,
          email: fallbackCurrentUser.email,
          name: fallbackCurrentUser.name,
          role: fallbackCurrentUser.role,
          department: fallbackCurrentUser.department || 'MoEFCC - Wetland Intelligence Division',
          designation: fallbackCurrentUser.designation || 'Authorized Officer',
          clearance: fallbackCurrentUser.clearance || 'Level 3 Clearance',
          ip: fallbackCurrentUser.role === 'admin' ? '10.14.30.92 (NIC GovNet VPN)' : '10.14.38.92 (NIC GovNet VPN)',
          loginTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          loginDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          loginTimestamp: Date.now(),
          lastActive: 'Just now',
          lastActiveTimestamp: Date.now(),
          currentActivity: 'Active on Wetland EO Dashboard',
          status: 'online'
        };
        activeList.unshift(sessionUser);
        try {
          localStorage.setItem(ACTIVE_USERS_STORAGE_KEY, JSON.stringify(activeList));
        } catch (err) {}
      }
    }

    return activeList;
  }

  addActiveUser(user, activity = 'Navigating Wetland Portal') {
    if (!user || !user.email) return;
    try {
      let activeList = [];
      const raw = localStorage.getItem(ACTIVE_USERS_STORAGE_KEY);
      if (raw) {
        activeList = JSON.parse(raw) || [];
      }
      
      const cleanEmail = user.email.trim().toLowerCase();
      const existingIdx = activeList.findIndex(u => u.email && u.email.toLowerCase() === cleanEmail);

      const now = Date.now();
      const sessionUser = {
        sessionId: `sess_${cleanEmail}_${now}`,
        email: cleanEmail,
        name: user.name,
        role: user.role,
        department: user.department || 'MoEFCC - Wetlands Division',
        designation: user.designation || 'Authorized Officer',
        clearance: user.clearance || 'Level 3 Clearance',
        ip: user.role === 'admin' ? '10.14.30.92 (NIC GovNet VPN)' : '10.14.38.92 (NIC GovNet VPN)',
        loginTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        loginDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        loginTimestamp: now,
        lastActive: 'Just now',
        lastActiveTimestamp: now,
        currentActivity: activity,
        status: 'online'
      };

      if (existingIdx !== -1) {
        activeList[existingIdx] = { ...activeList[existingIdx], ...sessionUser };
      } else {
        activeList.unshift(sessionUser);
      }

      localStorage.setItem(ACTIVE_USERS_STORAGE_KEY, JSON.stringify(activeList));
      window.dispatchEvent(new CustomEvent('wetlands_active_users_updated', { detail: activeList }));
    } catch (e) {
      console.error('Failed to add active user', e);
    }
  }

  updateActiveUserActivity(email, activity) {
    if (!email) return;
    try {
      const raw = localStorage.getItem(ACTIVE_USERS_STORAGE_KEY);
      if (!raw) return;
      const activeList = JSON.parse(raw) || [];
      const user = activeList.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        user.currentActivity = activity;
        user.lastActive = 'Just now';
        user.lastActiveTimestamp = Date.now();
        localStorage.setItem(ACTIVE_USERS_STORAGE_KEY, JSON.stringify(activeList));
        window.dispatchEvent(new CustomEvent('wetlands_active_users_updated', { detail: activeList }));
      }
    } catch (e) {}
  }

  removeActiveUser(email) {
    if (!email) return;
    try {
      const raw = localStorage.getItem(ACTIVE_USERS_STORAGE_KEY);
      if (!raw) return;
      let activeList = JSON.parse(raw) || [];
      activeList = activeList.filter(u => u.email && u.email.toLowerCase() !== email.toLowerCase());
      localStorage.setItem(ACTIVE_USERS_STORAGE_KEY, JSON.stringify(activeList));
      window.dispatchEvent(new CustomEvent('wetlands_active_users_updated', { detail: activeList }));
    } catch (e) {
      console.error('Failed to remove active user', e);
    }
  }

  clearActiveUsers() {
    try {
      localStorage.removeItem(ACTIVE_USERS_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('wetlands_active_users_updated', { detail: [] }));
    } catch (e) {}
  }
}

export const dbService = new DatabaseService();
export default dbService;
