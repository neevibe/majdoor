export type WorkerStatus = 'ON_DUTY' | 'AVAILABLE' | 'INACTIVE';
export type SkillCategory = 'Skilled' | 'Semi-skilled' | 'Unskilled';

export interface Worker {
  id: string; // BR-####-####
  name: string;
  nameHi?: string;
  initials: string;
  skill: string;
  category: SkillCategory;
  district: string;
  dailyWage: number;
  askedWage?: number;
  rating: number;
  status: WorkerStatus;
  phone: string;
  father?: string;
  dob?: string;
  age?: number;
  village?: string;
  block?: string;
  bloodGroup?: string;
  aadhaarMasked?: string;
  aadhaarVerified: boolean;
  policeVerified: boolean;
  bank?: { name: string; maskedAccount: string; upi: boolean };
  pfNumber?: string;
  esicNumber?: string;
  joinedDate?: string;
  currentSite?: string;
  skills: string[];
  yearsExperience?: number;
  languages?: string[];
  advanceBalance: number;
}

export interface District {
  name: string;
  col: number;
  row: number;
  workers: number;
  demand: number;
  migration: number;
}

export interface Agency {
  id: string;
  name: string;
  owner: string;
  complianceScore: number;
  workers: number;
  district: string;
  phone: string;
}

export interface Contractor {
  id: string;
  name: string;
  contact: string;
  sites: number;
  workersDeployed: number;
  sector: string;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  sites: string[];
  monthlyBilling: number; // ₹
}

export interface Site {
  id: string;
  name: string;
  client: string;
  district: string;
  gates: string[];
  geofenceMeters: number;
  qrGateActive: boolean;
  lat: number;
  lng: number;
  onDuty: number;
  shift: string; // "08:00–17:00"
}

export type DayMark = 'P' | 'A' | 'H';

export interface AttendanceDay {
  date: string; // ISO
  mark: DayMark;
  otHours?: number;
}

export interface GangRow {
  workerId: string;
  name: string;
  skill: string;
  week: DayMark[]; // Mon..Sat
  punchIn?: string;
  punchOut?: string;
  otToday?: string;
}

export type PayLineStatus = 'PENDING' | 'QUEUED' | 'PAYING' | 'PAID';

export interface PayrollLine {
  workerId: string;
  worker: string;
  days: number;
  wagePerDay: number;
  ot: number;
  advanceRecovery: number;
  pfEsic: number;
  net: number;
  status: PayLineStatus;
}

export interface PayrollRun {
  id: string;
  month: string;
  agency: string;
  client: string;
  workerCount: number;
  gross: number;
  overtime: number;
  advanceRecovery: number;
  pfEsic: number;
  net: number;
  status: 'PENDING_APPROVAL' | 'RUNNING' | 'COMPLETE';
  lines: PayrollLine[];
}

export interface SalaryMonth {
  month: string;
  days: number;
  gross: number;
  advance: number;
  pfEsic: number;
  net: number;
  mode: string; // "IMPS ✓" | "UPI ✓" | "IMPS (pending)"
  paid: boolean;
}

export interface AdvanceRequest {
  id: string;
  workerId: string;
  worker: string;
  amount: number;
  reason: string;
  monthlyDeduction: number;
  requestedOn: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface LeaveRequest {
  id: string;
  workerId: string;
  worker: string;
  from: string;
  to: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PPEItem {
  id: string;
  workerId: string;
  item: string;
  issued: string;
  condition: 'Good' | 'Assigned' | 'Replace';
}

export type DocType = 'IDENTITY' | 'VERIFICATION' | 'SKILL' | 'BANK' | 'MEDICAL';

export interface WorkerDocument {
  id: string;
  workerId: string;
  type: DocType;
  name: string;
  format: 'PDF' | 'Image';
  meta: string;
}

export interface Job {
  id: string;
  title: string;
  count: number;
  wage: number;
  site: string;
  distanceKm: number;
  startNote: string;
  need: string;
  district: string;
}

export interface FeedEvent {
  id: string;
  time: string;
  message: string;
  kind: 'attendance' | 'payroll' | 'demand' | 'alert' | 'compliance';
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: 'attendance' | 'payroll' | 'job' | 'emergency' | 'shift' | 'system';
  read: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface KPI {
  label: string;
  value: string;
  delta?: string;
  tone?: 'up' | 'down' | 'flat' | 'warn';
}

export interface ComplianceItem {
  item: string;
  pending: string;
  due: string;
}

export interface WatchdogAlert {
  label: string;
  value: string;
  severity: 'critical' | 'warn' | 'ok';
}

export interface Invoice {
  id: string;
  client: string;
  month: string;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
}

export interface TaskItem {
  id: string;
  title: string;
  site: string;
  due: string;
  assignees: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface TrainingModule {
  id: string;
  name: string;
  duration: string;
  progress: number; // 0..1
}
