import * as mock from './mock';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// Simulated network layer. Swap these for Supabase queries when the backend lands.
export const api = {
  async workers() { await delay(); return mock.WORKERS; },
  async worker(id: string) { await delay(250); return mock.WORKERS.find((w) => w.id === id) ?? null; },
  async districts() { await delay(); return mock.DISTRICTS; },
  async agencies() { await delay(); return mock.AGENCIES; },
  async contractors() { await delay(); return mock.CONTRACTORS; },
  async clients() { await delay(); return mock.CLIENTS; },
  async sites() { await delay(); return mock.SITES; },
  async gangSheet() { await delay(); return mock.GANG_SHEET; },
  async payrollRun() { await delay(); return mock.PAYROLL_RUN; },
  async salaryHistory() { await delay(); return mock.SALARY_HISTORY; },
  async advances() { await delay(); return mock.ADVANCE_REQUESTS; },
  async leaves() { await delay(); return mock.LEAVE_REQUESTS; },
  async ppe() { await delay(); return mock.PPE_ITEMS; },
  async documents(workerId?: string) {
    await delay();
    return workerId ? mock.DOCUMENTS.filter((d) => d.workerId === workerId) : mock.DOCUMENTS;
  },
  async jobs() { await delay(); return mock.JOBS; },
  async feed() { await delay(200); return mock.LIVE_FEED; },
  async notifications() { await delay(200); return mock.NOTIFICATIONS; },
  async invoices() { await delay(); return mock.INVOICES; },
  async tasks() { await delay(); return mock.TASKS; },
  async certificates() { await delay(); return mock.CERTIFICATES; },
  async training() { await delay(); return mock.TRAINING; },
  async workerMonth() { await delay(); return mock.WORKER_MONTH; },
  async ai(question: string) { await delay(900); return mock.aiAnswer(question); },
};
