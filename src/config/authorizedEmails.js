/**
 * AUTHORIZED EMAILS & PERSONNEL CONFIGURATION
 * 
 * Master Administrator:
 * - Email: chintabhargavi1133@gmail.com (Passcode: bhargavi)
 * 
 * Pre-Configured Government Users:
 * - User 1: suryateja11@gmail.com (Name: surya teja, Passcode: surya)
 * - User 2: deekshith44@gmail.com (Name: deekshith, Passcode: deekshith)
 * - User 3: suryateja87@gmail.com (Name: surya teja, Passcode: suryateja)
 */

// 1. SIMPLE LIST: Any additional authorized emails can also be listed here:
export const CUSTOM_AUTHORIZED_EMAILS = [
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
    id: 'usr_admin_01',
    email: 'chintabhargavi1122@gmail.com',
    name: 'ch.bhargavi',
    role: 'admin',
    department: 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
    designation: 'Chief Environmental Intelligence Officer',
    clearance: 'Level 5 (National Portal Administrator)',
    passcode: 'bhargavi', // Master Admin unique passcode
    status: 'active',
    createdAt: '2026-01-15T09:00:00.000Z',
    lastLogin: '2026-10-10T19:15:00.000Z',
    totalLogins: 42
  },
  {
    id: 'usr_admin_02',
    email: 'chintabhargavi1133@gmail.com',
    name: 'ch.bhargavi',
    role: 'admin',
    department: 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
    designation: 'Chief Environmental Intelligence Officer',
    clearance: 'Level 5 (National Portal Administrator)',
    passcode: 'bhargavi', // Master Admin unique passcode
    status: 'active',
    createdAt: '2026-01-15T09:00:00.000Z',
    lastLogin: '2026-10-10T19:15:00.000Z',
    totalLogins: 42
  },
  {
    id: 'usr_govt_01',
    email: 'suryateja11@gmail.com',
    name: 'surya teja',
    role: 'government_user',
    department: 'MoEFCC - Wetlands & Ramsar Sites Division',
    designation: 'Authorized Government Officer',
    clearance: 'Level 3 (Senior Government Nodal Officer)',
    passcode: 'surya', // Government User passcode / password
    status: 'active',
    createdAt: '2026-02-10T10:30:00.000Z',
    lastLogin: '2026-10-10T18:40:00.000Z',
    totalLogins: 28
  },
  {
    id: 'usr_govt_02',
    email: 'deekshith44@gmail.com',
    name: 'deekshith',
    role: 'government_user',
    department: 'ISRO Space Applications Centre (SAC), Ahmedabad',
    designation: 'Lead EO & Geo-Spatial Remote Sensing Scientist',
    clearance: 'Level 3 (Technical Geo-Spatial Analyst)',
    passcode: 'deekshith', // Government User passcode / password
    status: 'active',
    createdAt: '2026-02-14T11:00:00.000Z',
    lastLogin: '2026-10-10T17:30:00.000Z',
    totalLogins: 35
  },
  {
    id: 'usr_govt_03',
    email: 'sharma22@gmail.com',
    name: 'sharma',
    role: 'government_user',
    department: 'State Wetland Authority (WB & East Zone)',
    designation: 'Chief Conservator of Forests & Encroachment Cell',
    clearance: 'Level 2 (Regional Enforcement Officer)',
    passcode: 'sharma', // Government User passcode / password
    status: 'active',
    createdAt: '2026-03-01T11:00:00.000Z',
    lastLogin: '2026-10-10T18:00:00.000Z',
    totalLogins: 12
  },
  {
    id: 'usr_govt_04',
    email: 'suryateja87@gmail.com',
    name: 'surya teja',
    role: 'government_user',
    department: 'MoEFCC - Wetlands & Ramsar Sites Division',
    designation: 'Authorized Government Officer',
    clearance: 'Level 3 (Senior Government Nodal Officer)',
    passcode: 'suryateja', // Government User passcode / password
    status: 'active',
    createdAt: '2026-02-10T10:30:00.000Z',
    lastLogin: '2026-10-10T18:40:00.000Z',
    totalLogins: 28
  },
  {
    id: 'usr_govt_04',
    email: 'dr.anita.sharma@isro.gov.in',
    name: 'Dr. Anita Sharma',
    role: 'government_user',
    department: 'ISRO Space Applications Centre (SAC), Ahmedabad',
    designation: 'Lead EO & Geo-Spatial Remote Sensing Scientist',
    clearance: 'Level 3 (Technical Geo-Spatial Analyst)',
    passcode: 'anita',
    status: 'active',
    createdAt: '2026-02-18T14:15:00.000Z',
    lastLogin: '2026-10-10T17:22:00.000Z',
    totalLogins: 35
  },
  {
    id: 'usr_govt_05',
    email: 'rajesh.kumar@moefcc.gov.in',
    name: 'Rajesh Kumar, IAS',
    role: 'government_user',
    department: 'MoEFCC - Wetlands Division',
    designation: 'Joint Secretary & Nodal Officer',
    clearance: 'Level 3 (Senior Government Nodal Officer)',
    passcode: 'rajesh',
    status: 'active',
    createdAt: '2026-03-01T11:00:00.000Z',
    lastLogin: '2026-10-09T16:10:00.000Z',
    totalLogins: 19
  }
];
