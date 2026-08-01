import {
  Worker, District, Agency, Contractor, Client, Site, GangRow, PayrollRun, SalaryMonth,
  AdvanceRequest, LeaveRequest, PPEItem, WorkerDocument, Job, FeedEvent, AppNotification,
  ComplianceItem, WatchdogAlert, Invoice, TaskItem, Certificate, TrainingModule, AttendanceDay,
} from './types';

export const WORKERS: Worker[] = [
  {
    id: 'BR-2481-0937', name: 'Sunil Kumar Manjhi', nameHi: 'सुनील कुमार मांझी', initials: 'SM',
    skill: 'Mason', category: 'Skilled', district: 'Gaya', dailyWage: 780, askedWage: 800,
    rating: 4.7, status: 'ON_DUTY', phone: '+91 98352 41067', father: 'Late Raghu Manjhi',
    dob: '14 Mar 1991', age: 35, village: 'Bara', block: 'Sherghati', bloodGroup: 'B+',
    aadhaarMasked: 'XXXX-XXXX-4482', aadhaarVerified: true, policeVerified: true,
    bank: { name: 'SBI', maskedAccount: '···9081', upi: true }, pfNumber: 'BR/PAT/48112',
    esicNumber: '3109 4482 7719', joinedDate: '11 Feb 2022', currentSite: 'L&T — Patna Metro C-2',
    skills: ['Brickwork', 'Plastering', 'Shuttering', 'RCC finishing'], yearsExperience: 9,
    languages: ['Hindi', 'Magahi'], advanceBalance: 3500,
  },
  {
    id: 'BR-1130-4482', name: 'Ramesh Paswan', initials: 'RP', skill: 'Bar bender', category: 'Skilled',
    district: 'Patna', dailyWage: 820, rating: 4.5, status: 'ON_DUTY', phone: '+91 96110 28374',
    aadhaarVerified: true, policeVerified: true, skills: ['Bar bending', 'Rebar tying'],
    currentSite: 'L&T — Patna Metro C-2', advanceBalance: 0, yearsExperience: 7,
  },
  {
    id: 'BR-3327-1206', name: 'Meena Devi', initials: 'MD', skill: 'Helper', category: 'Unskilled',
    district: 'Muzaffarpur', dailyWage: 450, rating: 4.8, status: 'AVAILABLE', phone: '+91 91220 84930',
    aadhaarVerified: true, policeVerified: false, skills: ['Material handling'],
    currentSite: 'Adani Warehousing — Begusarai', advanceBalance: 0, yearsExperience: 3,
  },
  {
    id: 'BR-0912-7754', name: 'Mohammad Irfan', initials: 'MI', skill: 'Electrician', category: 'Skilled',
    district: 'Patna', dailyWage: 900, rating: 4.9, status: 'ON_DUTY', phone: '+91 99051 66218',
    aadhaarVerified: true, policeVerified: true, skills: ['Wiring', 'Panel work', 'Metro rail systems'],
    currentSite: 'L&T — Patna Metro C-2', advanceBalance: 2000, yearsExperience: 11,
  },
  {
    id: 'BR-5561-0348', name: 'Santosh Yadav', initials: 'SY', skill: 'Scaffolder', category: 'Semi-skilled',
    district: 'Bhagalpur', dailyWage: 610, rating: 4.2, status: 'AVAILABLE', phone: '+91 98007 41552',
    aadhaarVerified: true, policeVerified: true, skills: ['Scaffolding'], advanceBalance: 0, yearsExperience: 5,
  },
  {
    id: 'BR-2209-8871', name: 'Anita Kumari', initials: 'AK', skill: 'Painter', category: 'Semi-skilled',
    district: 'Darbhanga', dailyWage: 590, rating: 4.6, status: 'ON_DUTY', phone: '+91 97080 33914',
    aadhaarVerified: true, policeVerified: true, skills: ['Painting', 'Putty work'],
    currentSite: 'L&T — Patna Metro C-2', advanceBalance: 1000, yearsExperience: 6,
  },
  {
    id: 'BR-4470-2215', name: 'Birju Ram', initials: 'BR', skill: 'Welder', category: 'Skilled',
    district: 'Rohtas', dailyWage: 860, rating: 4.4, status: 'INACTIVE', phone: '+91 94312 90847',
    aadhaarVerified: true, policeVerified: true, skills: ['Arc welding', 'Gas cutting'],
    advanceBalance: 0, yearsExperience: 12,
  },
  {
    id: 'BR-6684-0093', name: 'Dinesh Sahni', initials: 'DS', skill: 'Plumber', category: 'Skilled',
    district: 'Vaishali', dailyWage: 800, rating: 4.3, status: 'AVAILABLE', phone: '+91 90065 12708',
    aadhaarVerified: true, policeVerified: true, skills: ['Plumbing', 'Pipe fitting'],
    advanceBalance: 1500, yearsExperience: 8,
  },
  {
    id: 'BR-7018-3364', name: 'Kavita Devi', initials: 'KD', skill: 'Helper', category: 'Unskilled',
    district: 'Siwan', dailyWage: 450, rating: 4.1, status: 'INACTIVE', phone: '+91 89860 55329',
    aadhaarVerified: true, policeVerified: false, skills: ['Material handling'], advanceBalance: 0,
    yearsExperience: 2,
  },
];

// [name, col, row, workers, demand, migration]
const D: [string, number, number, number, number, number][] = [
  ['W CHAMPARAN', 1, 1, 9840, 620, 410], ['E CHAMPARAN', 2, 1, 12480, 540, 880],
  ['SHEOHAR', 3, 1, 1820, 90, 310], ['SITAMARHI', 4, 1, 7120, 310, 940],
  ['MADHUBANI', 5, 1, 10940, 420, 1620], ['SUPAUL', 6, 1, 5210, 180, 720],
  ['ARARIA', 7, 1, 6080, 240, 910], ['KISHANGANJ', 8, 1, 4310, 150, 680],
  ['GOPALGANJ', 1, 2, 6540, 280, 1140], ['SIWAN', 2, 2, 8120, 350, 1490],
  ['MUZAFFARPUR', 3, 2, 16240, 1180, 760], ['DARBHANGA', 4, 2, 11360, 610, 1210],
  ['SAHARSA', 5, 2, 4980, 210, 650], ['MADHEPURA', 6, 2, 4420, 170, 590],
  ['PURNIA', 7, 2, 8760, 520, 470], ['KATIHAR', 8, 2, 6890, 300, 520],
  ['BUXAR', 1, 3, 4210, 190, 410], ['BHOJPUR', 2, 3, 7640, 410, 530],
  ['SARAN', 3, 3, 9120, 460, 980], ['VAISHALI', 4, 3, 10480, 720, 440],
  ['SAMASTIPUR', 5, 3, 9860, 480, 860], ['BEGUSARAI', 6, 3, 8540, 690, 310],
  ['KHAGARIA', 7, 3, 3980, 160, 480], ['BHAGALPUR', 8, 3, 11220, 840, 390],
  ['KAIMUR', 1, 4, 3640, 140, 380], ['ROHTAS', 2, 4, 6980, 520, 290],
  ['ARWAL', 3, 4, 2110, 80, 260], ['PATNA', 4, 4, 28460, 2340, 180],
  ['NALANDA', 5, 4, 8210, 430, 350], ['LAKHISARAI', 6, 4, 2860, 110, 300],
  ['MUNGER', 7, 4, 5140, 380, 270], ['BANKA', 8, 4, 3720, 130, 460],
  ['AURANGABAD', 2, 5, 5890, 340, 330], ['GAYA', 3, 5, 13480, 890, 610],
  ['JEHANABAD', 4, 5, 3120, 120, 280], ['SHEIKHPURA', 5, 5, 1960, 70, 240],
  ['NAWADA', 6, 5, 4480, 160, 420], ['JAMUI', 7, 5, 3310, 120, 390],
];

export const DISTRICTS: District[] = D.map(([name, col, row, workers, demand, migration]) => ({
  name, col, row, workers, demand, migration,
}));

export const AGENCIES: Agency[] = [
  { id: 'AG-0112', name: 'Mithila Manpower Services', owner: 'Farzana Khatoon', complianceScore: 96, workers: 1840, district: 'Darbhanga', phone: '+91 99340 71128' },
  { id: 'AG-0287', name: 'Magadh Labour Co-op', owner: 'Devendra Prasad', complianceScore: 91, workers: 1210, district: 'Gaya', phone: '+91 94301 55870' },
  { id: 'AG-0341', name: 'Champaran Workforce Pvt Ltd', owner: 'Nusrat Jahan', complianceScore: 88, workers: 960, district: 'E Champaran', phone: '+91 98390 20114' },
  { id: 'AG-0455', name: 'Kosi Skilled Services', owner: 'Manoj Jha', complianceScore: 84, workers: 720, district: 'Saharsa', phone: '+91 90312 84756' },
  { id: 'AG-0518', name: 'Patliputra Staffing', owner: 'Ritu Sinha', complianceScore: 93, workers: 2110, district: 'Patna', phone: '+91 98110 66742' },
];

export const CONTRACTORS: Contractor[] = [
  { id: 'CT-01', name: 'L&T Construction', contact: 'Rajiv Menon · Project Director', sites: 4, workersDeployed: 3820, sector: 'Metro rail' },
  { id: 'CT-02', name: 'Tata Projects', contact: 'Amit Kulkarni', sites: 2, workersDeployed: 1460, sector: 'Infrastructure' },
  { id: 'CT-03', name: 'IRCON', contact: 'B. K. Singh', sites: 3, workersDeployed: 2210, sector: 'Railways' },
  { id: 'CT-04', name: 'NHAI (Purnia bypass)', contact: 'Site PIU Purnia', sites: 1, workersDeployed: 880, sector: 'Highways' },
  { id: 'CT-05', name: 'JSW Steel', contact: 'Plant HR, Aurangabad', sites: 2, workersDeployed: 1140, sector: 'Steel' },
];

export const CLIENTS: Client[] = [
  { id: 'CL-01', name: 'Adani Infra', contact: 'Priya Nair', sites: ['Adani Warehousing — Begusarai'], monthlyBilling: 8200000 },
  { id: 'CL-02', name: 'L&T Construction', contact: 'Rajiv Menon', sites: ['Patna Metro C-2', 'Airport expansion'], monthlyBilling: 14600000 },
  { id: 'CL-03', name: 'JSW Steel', contact: 'Plant HR', sites: ['Banka', 'Aurangabad plant'], monthlyBilling: 5400000 },
  { id: 'CL-04', name: 'IRCON', contact: 'B. K. Singh', sites: ['Railway yard, Gaya Jn'], monthlyBilling: 3900000 },
];

export const SITES: Site[] = [
  { id: 'S-01', name: 'L&T — Patna Metro C-2', client: 'L&T Construction', district: 'Patna', gates: ['Gate 1', 'Gate 2', 'Gate 3'], geofenceMeters: 150, qrGateActive: true, lat: 25.5941, lng: 85.1376, onDuty: 214, shift: '08:00–17:00' },
  { id: 'S-02', name: 'Adani Warehousing — Begusarai', client: 'Adani Infra', district: 'Begusarai', gates: ['Gate 1'], geofenceMeters: 150, qrGateActive: true, lat: 25.4182, lng: 86.1272, onDuty: 148, shift: '09:00–18:00' },
  { id: 'S-03', name: 'JSW Plant — Aurangabad', client: 'JSW Steel', district: 'Aurangabad', gates: ['Gate 1', 'Gate 3'], geofenceMeters: 200, qrGateActive: false, lat: 24.7522, lng: 84.3742, onDuty: 96, shift: '08:00–17:00' },
  { id: 'S-04', name: 'Railway yard — Gaya Jn', client: 'IRCON', district: 'Gaya', gates: ['Gate 2'], geofenceMeters: 120, qrGateActive: true, lat: 24.8028, lng: 84.9994, onDuty: 62, shift: '20:00–05:00' },
];

export const GANG_SHEET: GangRow[] = [
  { workerId: 'BR-2481-0937', name: 'Sunil K. Manjhi', skill: 'Mason', week: ['P', 'P', 'P', 'P', 'P', 'P'], punchIn: '07:58', otToday: '1.5h' },
  { workerId: 'BR-1130-4482', name: 'Ramesh Paswan', skill: 'Bar bender', week: ['P', 'P', 'A', 'P', 'P', 'P'], punchIn: '08:04' },
  { workerId: 'BR-0912-7754', name: 'Mohammad Irfan', skill: 'Electrician', week: ['P', 'P', 'P', 'P', 'H', 'P'], punchIn: '07:51', otToday: '2h' },
  { workerId: 'BR-2209-8871', name: 'Anita Kumari', skill: 'Painter', week: ['P', 'H', 'P', 'P', 'P', 'P'], punchIn: '08:12' },
  { workerId: 'BR-5561-0348', name: 'Santosh Yadav', skill: 'Scaffolder', week: ['A', 'P', 'P', 'P', 'P', 'A'] },
  { workerId: 'BR-6684-0093', name: 'Dinesh Sahni', skill: 'Plumber', week: ['P', 'P', 'P', 'A', 'P', 'P'], punchIn: '08:00', otToday: '1h' },
];

export const PAYROLL_RUN: PayrollRun = {
  id: 'P-2214',
  month: 'July 2026',
  agency: 'Mithila Manpower',
  client: 'L&T C-2',
  workerCount: 38,
  gross: 688400,
  overtime: 42300,
  advanceRecovery: 31500,
  pfEsic: 58020,
  net: 641180,
  status: 'PENDING_APPROVAL',
  lines: [
    { workerId: 'BR-2481-0937', worker: 'Sunil K. Manjhi', days: 26, wagePerDay: 780, ot: 1170, advanceRecovery: 1500, pfEsic: 1830, net: 18450, status: 'PENDING' },
    { workerId: 'BR-1130-4482', worker: 'Ramesh Paswan', days: 24, wagePerDay: 820, ot: 0, advanceRecovery: 0, pfEsic: 1770, net: 17910, status: 'PENDING' },
    { workerId: 'BR-0912-7754', worker: 'Mohammad Irfan', days: 26, wagePerDay: 900, ot: 2700, advanceRecovery: 2000, pfEsic: 2110, net: 21990, status: 'PENDING' },
    { workerId: 'BR-2209-8871', worker: 'Anita Kumari', days: 25, wagePerDay: 590, ot: 0, advanceRecovery: 1000, pfEsic: 1330, net: 12420, status: 'PENDING' },
    { workerId: 'BR-5561-0348', worker: 'Santosh Yadav', days: 22, wagePerDay: 610, ot: 610, advanceRecovery: 0, pfEsic: 1210, net: 12820, status: 'PENDING' },
    { workerId: 'BR-6684-0093', worker: 'Dinesh Sahni', days: 26, wagePerDay: 800, ot: 800, advanceRecovery: 1500, pfEsic: 1870, net: 18230, status: 'PENDING' },
    { workerId: 'BR-3327-1206', worker: 'Meena Devi', days: 27, wagePerDay: 450, ot: 0, advanceRecovery: 0, pfEsic: 1090, net: 11060, status: 'PENDING' },
  ],
};

export const SALARY_HISTORY: SalaryMonth[] = [
  { month: 'Jul 2026', days: 26, gross: 21780, advance: 1500, pfEsic: 1830, net: 18450, mode: 'IMPS (pending)', paid: false },
  { month: 'Jun 2026', days: 25, gross: 20940, advance: 1500, pfEsic: 1760, net: 17680, mode: 'IMPS ✓', paid: true },
  { month: 'May 2026', days: 27, gross: 22620, advance: 0, pfEsic: 1900, net: 20720, mode: 'UPI ✓', paid: true },
  { month: 'Apr 2026', days: 24, gross: 19860, advance: 500, pfEsic: 1670, net: 17690, mode: 'IMPS ✓', paid: true },
];

export const ADVANCE_REQUESTS: AdvanceRequest[] = [
  { id: 'ADV-118', workerId: 'BR-2481-0937', worker: 'Sunil K. Manjhi', amount: 3500, reason: 'Daughter school fees', monthlyDeduction: 1500, requestedOn: '02 Jun 2026', status: 'APPROVED' },
  { id: 'ADV-131', workerId: 'BR-0912-7754', worker: 'Mohammad Irfan', amount: 2000, reason: 'Medical', monthlyDeduction: 1000, requestedOn: '18 Jun 2026', status: 'APPROVED' },
  { id: 'ADV-140', workerId: 'BR-6684-0093', worker: 'Dinesh Sahni', amount: 4000, reason: 'House repair', monthlyDeduction: 1500, requestedOn: '29 Jul 2026', status: 'PENDING' },
  { id: 'ADV-142', workerId: 'BR-2209-8871', worker: 'Anita Kumari', amount: 1500, reason: 'Festival', monthlyDeduction: 750, requestedOn: '01 Aug 2026', status: 'PENDING' },
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'LV-208', workerId: 'BR-1130-4482', worker: 'Ramesh Paswan', from: '04 Aug 2026', to: '06 Aug 2026', reason: 'Family function', status: 'PENDING' },
  { id: 'LV-211', workerId: 'BR-3327-1206', worker: 'Meena Devi', from: '08 Aug 2026', to: '08 Aug 2026', reason: 'Medical', status: 'PENDING' },
  { id: 'LV-199', workerId: 'BR-2481-0937', worker: 'Sunil K. Manjhi', from: '13 Jul 2026', to: '13 Jul 2026', reason: 'Personal', status: 'APPROVED' },
];

export const PPE_ITEMS: PPEItem[] = [
  { id: 'PPE-1', workerId: 'BR-2481-0937', item: 'Helmet + hi-vis vest', issued: '02 Jun 2026', condition: 'Good' },
  { id: 'PPE-2', workerId: 'BR-2481-0937', item: 'Safety shoes (sz 8)', issued: '02 Jun 2026', condition: 'Good' },
  { id: 'PPE-3', workerId: 'BR-2481-0937', item: 'Trowel set T-114', issued: '04 Jun 2026', condition: 'Assigned' },
  { id: 'PPE-4', workerId: 'BR-0912-7754', item: 'Insulated gloves class 0', issued: '10 Jun 2026', condition: 'Good' },
  { id: 'PPE-5', workerId: 'BR-1130-4482', item: 'Helmet + hi-vis vest', issued: '05 Jun 2026', condition: 'Replace' },
];

export const DOCUMENTS: WorkerDocument[] = [
  { id: 'DOC-1', workerId: 'BR-2481-0937', type: 'IDENTITY', name: 'Aadhaar card', format: 'PDF', meta: 'Verified 11 Feb 2022' },
  { id: 'DOC-2', workerId: 'BR-2481-0937', type: 'IDENTITY', name: 'PAN card', format: 'Image', meta: 'Verified' },
  { id: 'DOC-3', workerId: 'BR-2481-0937', type: 'VERIFICATION', name: 'Police verification', format: 'PDF', meta: 'Gaya SP office · 2024' },
  { id: 'DOC-4', workerId: 'BR-2481-0937', type: 'SKILL', name: 'ITI Masonry certificate', format: 'PDF', meta: 'NSDC · 2019' },
  { id: 'DOC-5', workerId: 'BR-2481-0937', type: 'BANK', name: 'Passbook first page', format: 'Image', meta: 'SBI Sherghati' },
  { id: 'DOC-6', workerId: 'BR-2481-0937', type: 'MEDICAL', name: 'Fitness certificate', format: 'PDF', meta: 'Valid till Jan 2027' },
];

export const JOBS: Job[] = [
  { id: 'J-01', title: 'MASON × 12', count: 12, wage: 800, site: 'NHAI Bodh Gaya bypass', distanceKm: 8, startNote: 'starts Mon', need: 'ITI preferred · 3 months', district: 'Gaya' },
  { id: 'J-02', title: 'HELPER × 40', count: 40, wage: 480, site: 'JSW plant, Aurangabad', distanceKm: 34, startNote: 'bus provided', need: 'No experience needed', district: 'Aurangabad' },
  { id: 'J-03', title: 'BAR BENDER × 6', count: 6, wage: 840, site: 'Railway yard, Gaya Jn', distanceKm: 5, startNote: 'night shift', need: 'Skilled · PF + ESIC', district: 'Gaya' },
  { id: 'J-04', title: 'PAINTER × 8', count: 8, wage: 620, site: 'AIIMS staff quarters', distanceKm: 12, startNote: '6 weeks', need: 'Semi-skilled', district: 'Patna' },
  { id: 'J-05', title: 'HELPER × 120', count: 120, wage: 480, site: 'NHAI Purnia bypass', distanceKm: 210, startNote: 'camp stay', need: 'No experience needed', district: 'Purnia' },
];

export const LIVE_FEED: FeedEvent[] = [
  { id: 'F-1', time: '10:41', message: 'Meena Devi (Muzaffarpur) — GPS punch-in at Adani Warehousing gate 1', kind: 'attendance' },
  { id: 'F-2', time: '10:38', message: 'Payroll run #P-2214 approved · ₹3.2 L → 22 workers via IMPS', kind: 'payroll' },
  { id: 'F-3', time: '10:31', message: 'New demand: NHAI Purnia bypass — 120 helpers, ₹480/day', kind: 'demand' },
  { id: 'F-4', time: '10:24', message: 'Duplicate Aadhaar flag: BR-8812 vs BR-6604 (review queued)', kind: 'alert' },
  { id: 'F-5', time: '10:16', message: 'Mithila Manpower compliance score ↑ 94 → 96', kind: 'compliance' },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'N-1', title: 'Attendance marked', body: 'Punch-in 07:58 at L&T Patna Metro C-2, Gate 2. GPS + face verified.', time: '07:58', kind: 'attendance', read: false },
  { id: 'N-2', title: 'July salary processing', body: '₹18,450 net queued via IMPS. Slip will arrive on WhatsApp.', time: 'Yesterday', kind: 'payroll', read: false },
  { id: 'N-3', title: 'New job near you', body: 'BAR BENDER × 6 at Railway yard, Gaya Jn — ₹840/day, night shift.', time: 'Yesterday', kind: 'job', read: true },
  { id: 'N-4', title: 'Shift reminder', body: 'Shift starts 08:00 tomorrow at Gate 2. Carry helmet and vest.', time: '2 days ago', kind: 'shift', read: true },
  { id: 'N-5', title: 'Advance recovery', body: '₹1,500 will be deducted from July salary. Balance after: ₹2,000.', time: '3 days ago', kind: 'payroll', read: true },
];

export const COMPLIANCE_QUEUE: ComplianceItem[] = [
  { item: 'Payroll runs (Jul)', pending: '₹4.82 Cr', due: '5 Aug' },
  { item: 'PF filings', pending: '312 workers', due: '15 Aug' },
  { item: 'ESIC filings', pending: '148 workers', due: '15 Aug' },
  { item: 'Advance outstanding', pending: '₹86.4 L', due: 'rolling' },
];

export const WATCHDOG: WatchdogAlert[] = [
  { label: 'Duplicate Aadhaar flags', value: '3 open', severity: 'critical' },
  { label: 'Ghost attendance alerts', value: '1 site', severity: 'warn' },
  { label: 'Wage anomaly checks', value: 'clear', severity: 'ok' },
];

export const INVOICES: Invoice[] = [
  { id: 'INV-2214', client: 'L&T Construction', month: 'Jul 2026', amount: 14600000, status: 'SENT' },
  { id: 'INV-2215', client: 'Adani Infra', month: 'Jul 2026', amount: 8200000, status: 'PAID' },
  { id: 'INV-2216', client: 'JSW Steel', month: 'Jul 2026', amount: 5400000, status: 'OVERDUE' },
  { id: 'INV-2217', client: 'IRCON', month: 'Jul 2026', amount: 3900000, status: 'DRAFT' },
];

export const TASKS: TaskItem[] = [
  { id: 'T-1', title: 'Verify gang sheet — Block B', site: 'L&T Patna Metro C-2', due: 'Today 17:00', assignees: 6, status: 'IN_PROGRESS' },
  { id: 'T-2', title: 'Capture site safety photos', site: 'L&T Patna Metro C-2', due: 'Today 15:00', assignees: 1, status: 'OPEN' },
  { id: 'T-3', title: 'Issue PPE to 4 new joiners', site: 'Gate 2 store', due: 'Tomorrow 09:00', assignees: 4, status: 'OPEN' },
  { id: 'T-4', title: 'Approve July OT sheet', site: 'L&T Patna Metro C-2', due: '04 Aug', assignees: 38, status: 'OPEN' },
  { id: 'T-5', title: 'Toolbox talk — monsoon safety', site: 'Block B muster', due: 'Done 08 :15', assignees: 42, status: 'DONE' },
];

export const CERTIFICATES: Certificate[] = [
  { id: 'C-1', name: 'ITI Masonry certificate', issuer: 'NSDC', year: '2019' },
  { id: 'C-2', name: 'Working at height', issuer: 'L&T Safety Cell', year: '2024' },
  { id: 'C-3', name: 'First aid basics', issuer: 'Red Cross Patna', year: '2023' },
];

export const TRAINING: TrainingModule[] = [
  { id: 'TR-1', name: 'Scaffold safety (Hindi)', duration: '25 min', progress: 1 },
  { id: 'TR-2', name: 'RCC finishing — advanced', duration: '40 min', progress: 0.6 },
  { id: 'TR-3', name: 'PPE care & usage', duration: '15 min', progress: 0 },
];

/** July 2026 attendance for the signed-in worker: day 13 absent, 14 & 21 half. */
export const WORKER_MONTH: AttendanceDay[] = Array.from({ length: 28 }, (_, i) => {
  const day = i + 1;
  const mark = day === 13 ? 'A' : day === 14 || day === 21 ? 'H' : 'P';
  return {
    date: `2026-07-${String(day).padStart(2, '0')}`,
    mark: mark as AttendanceDay['mark'],
    otHours: day === 14 || day === 21 ? 2 : undefined,
  };
});

export const ATTENDANCE_SERIES = [91.2, 92.0, 90.8, 93.1, 92.6, 88.4, 91.9, 93.4, 92.8, 94.0, 93.2, 91.7, 92.9, 92.4];
export const ATTENDANCE_DATES = ['20 Jul', '21 Jul', '22 Jul', '23 Jul', '24 Jul', '25 Jul', '26 Jul', '27 Jul', '28 Jul', '29 Jul', '30 Jul', '31 Jul', '1 Aug', '2 Aug'];

export const DASH_KPIS_WORKFORCE = [
  { label: 'REGISTERED WORKERS', value: '2,48,312', delta: '↑ 6.2% MoM', tone: 'up' as const },
  { label: 'AGENCIES', value: '1,240', delta: '↑ 38 this month', tone: 'up' as const },
  { label: "TODAY'S ATTENDANCE", value: '92.4%', delta: '84,212 marked in', tone: 'flat' as const },
  { label: 'AVAILABLE NOW', value: '61,480', delta: 'ready to deploy', tone: 'flat' as const },
];

export const DASH_KPIS_MONEY = [
  { label: 'REVENUE (JUL)', value: '₹3.18 Cr', delta: '↑ 11.4% MoM', tone: 'up' as const },
  { label: 'PAYROLL PENDING', value: '₹4.82 Cr', delta: '214 runs await approval', tone: 'warn' as const },
  { label: 'ADVANCE OUTSTANDING', value: '₹86.4 L', delta: '↓ 4.1% MoM', tone: 'down' as const },
  { label: 'PF + ESIC PENDING', value: '460', delta: 'filings due 15 Aug', tone: 'warn' as const },
];

export const ATT_KPIS = [
  { label: 'MARKED TODAY', value: '84,212', delta: '92.4% of deployed', tone: 'up' as const },
  { label: 'GPS VERIFIED', value: '71,480', delta: 'within 150 m geofence', tone: 'flat' as const },
  { label: 'FACE / SELFIE', value: '9,914', delta: 'supervisor devices', tone: 'flat' as const },
  { label: 'OVERTIME LOGGED', value: '6,118 hrs', delta: '3 sites > 4 hr OT', tone: 'warn' as const },
];

export const AI_SUGGESTIONS = [
  'How many electricians are available in Patna?',
  'Which district has the highest migration?',
  'Predict manpower shortage for September.',
  'Generate payroll for July.',
  "Generate this week's attendance report.",
];

export function aiAnswer(q: string): string {
  const s = q.toLowerCase();
  if (s.includes('electrician')) {
    return 'There are 412 electricians available in Patna right now.\n\n• Skilled (ITI-certified): 268\n• Semi-skilled: 144\n• Median wage: ₹850/day\n• 86 have metro-rail experience\n\nWant me to shortlist the top 50 by rating and distance?';
  }
  if (s.includes('migration')) {
    return 'Madhubani has the highest out-migration: 1,620 workers moved to NCR/Gujarat this quarter.\n\nTop 3: Madhubani 1,620 · Siwan 1,490 · E. Champaran 880.\n\nDriver: post-monsoon farm slack plus a ₹120/day wage gap vs Surat. The ₹560 district wage floor retains about 38%.';
  }
  if (s.includes('shortage') || s.includes('forecast') || s.includes('demand') || s.includes('predict')) {
    return 'September 2026 forecast: statewide shortage of ~4,800 workers.\n\n• Masons, Patna: −22%\n• Helpers, Begusarai: −18%\n• Surplus: Purnia +640, Katihar +410\n\nRecommendation: pre-book 2,100 workers from Purnia–Katihar. Estimated mobilisation cost ₹18.4 L.';
  }
  if (s.includes('payroll') || s.includes('salary')) {
    return 'Draft July 2026 payroll ready:\n\n• 38 workers · Mithila Manpower × L&T C-2\n• Gross ₹6.88 L · Net ₹6.41 L\n• PF ₹52.1 K · ESIC ₹5.9 K\n• Advance recovery ₹31.5 K\n\nIt is awaiting approval in Payroll → Pending. Shall I queue the IMPS batch?';
  }
  if (s.includes('attendance') || s.includes('absent')) {
    return 'Week 27 Jul – 2 Aug: statewide attendance 92.4% (↑ 1.1 pt WoW).\n\nBest site: Adani Warehousing Begusarai — 98.2%.\n\n⚠ Flag: JSW Banka gate 3 logged 11 manual overrides — possible ghost punching. Fraud-review ticket #FR-2210 opened.';
  }
  if (s.includes('near') || s.includes('recommend') || s.includes('worker')) {
    return 'Top available workers near Patna by rating:\n\n1. Meena Devi — Helper · ★ 4.8 · Muzaffarpur\n2. Santosh Yadav — Scaffolder · ★ 4.2 · Bhagalpur\n3. Dinesh Sahni — Plumber · ★ 4.3 · Vaishali\n\nSay "assign" with a site name and I will draft the deployment.';
  }
  return 'I can answer questions about workers, districts, attendance, payroll and demand forecasts across all 38 districts. Try: "Which agency has the best compliance score?"';
}
