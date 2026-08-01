import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export const useWorkers = () => useQuery({ queryKey: ['workers'], queryFn: api.workers });
export const useWorker = (id: string) =>
  useQuery({ queryKey: ['worker', id], queryFn: () => api.worker(id), enabled: !!id });
export const useDistricts = () => useQuery({ queryKey: ['districts'], queryFn: api.districts });
export const useAgencies = () => useQuery({ queryKey: ['agencies'], queryFn: api.agencies });
export const useContractors = () => useQuery({ queryKey: ['contractors'], queryFn: api.contractors });
export const useClients = () => useQuery({ queryKey: ['clients'], queryFn: api.clients });
export const useSites = () => useQuery({ queryKey: ['sites'], queryFn: api.sites });
export const useGangSheet = () => useQuery({ queryKey: ['gangSheet'], queryFn: api.gangSheet });
export const usePayrollRun = () => useQuery({ queryKey: ['payrollRun'], queryFn: api.payrollRun });
export const useSalaryHistory = () => useQuery({ queryKey: ['salaryHistory'], queryFn: api.salaryHistory });
export const useAdvances = () => useQuery({ queryKey: ['advances'], queryFn: api.advances });
export const useLeaves = () => useQuery({ queryKey: ['leaves'], queryFn: api.leaves });
export const usePPE = () => useQuery({ queryKey: ['ppe'], queryFn: api.ppe });
export const useDocuments = (workerId?: string) =>
  useQuery({ queryKey: ['documents', workerId], queryFn: () => api.documents(workerId) });
export const useJobs = () => useQuery({ queryKey: ['jobs'], queryFn: api.jobs });
export const useFeed = () => useQuery({ queryKey: ['feed'], queryFn: api.feed });
export const useNotifications = () => useQuery({ queryKey: ['notifications'], queryFn: api.notifications });
export const useInvoices = () => useQuery({ queryKey: ['invoices'], queryFn: api.invoices });
export const useTasks = () => useQuery({ queryKey: ['tasks'], queryFn: api.tasks });
export const useCertificates = () => useQuery({ queryKey: ['certificates'], queryFn: api.certificates });
export const useTraining = () => useQuery({ queryKey: ['training'], queryFn: api.training });
export const useWorkerMonth = () => useQuery({ queryKey: ['workerMonth'], queryFn: api.workerMonth });
