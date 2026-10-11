/**
 * AUTHORIZED EMAILS & PERSONNEL CONFIGURATION
 * 
 * Master Administrator:
 * - Email: chilimurusharma@gmail.com / chilimursharma@gmail.com (Name: Chilimur Sharma, Passcode: sharma / admin@2026)
 * 
 * Authorized Government Officers (Replaces Environmental Officer):
 * - Officer 1: chsuryachowdary12@gmail.com (Name: Surya Chowdary, Designation: Authorized Government Officer, Passcode: surya / officer@2026)
 * - Officer 2: suryateja11@gmail.com (Name: Surya Teja, Passcode: surya)
 * - Officer 3: deekshith44@gmail.com (Name: Deekshith, Passcode: deekshith)
 * - Officer 4: suryateja87@gmail.com (Name: Surya Teja, Passcode: suryateja)
 */

// 1. SIMPLE LIST: Any additional authorized emails can also be listed here:
export const CUSTOM_AUTHORIZED_EMAILS = [
  "chilimurusharma@gmail.com",
  "chilimursharma@gmail.com",
  "chsuryachowdary12@gmail.com",
  "chintabhargavi1122@gmail.com",
  "chintabhargavi1133@gmail.com",
  "suryateja11@gmail.com",
  "deekshith44@gmail.com",
  "suryateja87@gmail.com",
  "sharma22@gmail.com"
];

// 2. DETAILED LIST: Pre-configured authorized government personnel & admin:
export const INITIAL_AUTHORIZED_USERS = [
  {
    id: 'usr_admin_sharma',
    email: 'chilimurusharma@gmail.com',
    name: 'Chilimuru Sharma',
    role: 'admin',
    department: 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
    designation: 'Chief Portal Administrator & Executive Director',
    clearance: 'Level 5 (National Portal Administrator)',
    passcode: 'sharma', // Admin passcode
    status: 'active',
    createdAt: '2026-01-15T09:00:00.000Z',
    lastLogin: '2026-10-11T05:00:00.000Z',
    totalLogins: 52
  },
  {
    id: 'usr_admin_sharma_alt',
    email: 'chilimursharma@gmail.com',
    name: 'Chilimur Sharma',
    role: 'admin',
    department: 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
    designation: 'Chief Portal Administrator & Executive Director',
    clearance: 'Level 5 (National Portal Administrator)',
    passcode: 'sharma', // Admin passcode
    status: 'active',
    createdAt: '2026-01-15T09:00:00.000Z',
    lastLogin: '2026-10-11T05:00:00.000Z',
    totalLogins: 52
  },
  {
    id: 'usr_govt_surya',
    email: 'chsuryachowdary12@gmail.com',
    name: 'Surya Chowdary',
    role: 'government_user', // Government Officer
    department: 'National Wetland Authority & State Revenue Division',
    designation: 'Authorized Government Officer & Senior Nodal Lead',
    clearance: 'Level 4 (Senior Government Nodal Officer)',
    passcode: 'surya', // Government Officer passcode
    status: 'active',
    createdAt: '2026-02-10T10:30:00.000Z',
    lastLogin: '2026-10-11T04:45:00.000Z',
    totalLogins: 38
  },
  {
    id: 'usr_admin_bhargavi',
    email: 'chintabhargavi1133@gmail.com',
    name: 'ch.bhargavi',
    role: 'admin',
    department: 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
    designation: 'Chief Portal Administrator',
    clearance: 'Level 5 (National Portal Administrator)',
    passcode: 'bhargavi',
    status: 'active',
    createdAt: '2026-01-15T09:00:00.000Z',
    lastLogin: '2026-10-10T19:15:00.000Z',
    totalLogins: 42
  },
  {
    id: 'usr_govt_01',
    email: 'suryateja11@gmail.com',
    name: 'Surya Teja',
    role: 'government_user',
    department: 'MoEFCC - Wetlands & Ramsar Sites Division',
    designation: 'Authorized Government Officer',
    clearance: 'Level 3 (Senior Government Nodal Officer)',
    passcode: 'surya',
    status: 'active',
    createdAt: '2026-02-10T10:30:00.000Z',
    lastLogin: '2026-10-10T18:40:00.000Z',
    totalLogins: 28
  },
  {
    id: 'usr_govt_02',
    email: 'deekshith44@gmail.com',
    name: 'Deekshith',
    role: 'government_user',
    department: 'ISRO Space Applications Centre (SAC), Ahmedabad',
    designation: 'Authorized Government Officer & Lead EO Analyst',
    clearance: 'Level 3 (Technical Geo-Spatial Analyst)',
    passcode: 'deekshith',
    status: 'active',
    createdAt: '2026-02-14T11:00:00.000Z',
    lastLogin: '2026-10-10T17:30:00.000Z',
    totalLogins: 35
  },
  {
    id: 'usr_govt_04',
    email: 'suryateja87@gmail.com',
    name: 'Surya Teja',
    role: 'government_user',
    department: 'MoEFCC - Wetlands & Ramsar Sites Division',
    designation: 'Authorized Government Officer',
    clearance: 'Level 3 (Senior Government Nodal Officer)',
    passcode: 'suryateja',
    status: 'active',
    createdAt: '2026-02-10T10:30:00.000Z',
    lastLogin: '2026-10-10T18:40:00.000Z',
    totalLogins: 28
  }
];
