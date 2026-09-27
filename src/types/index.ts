export type UserRole = 'admin' | 'dispatcher' | 'technician' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  clientId?: string;
  active: boolean;
  createdAt: string;
}

export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  gateCode?: string;
  accessInstructions?: string;
}

export interface Property extends Address {
  id: string;
  clientId: string;
  label?: string; // e.g. "Primary Residence", "Rental Unit #3", "Commercial HQ"
  serviceHistoryJobIds: string[];
  createdAt: string;
}

export interface Client {
  id: string;
  isCompany: boolean;
  companyName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  billingAddress: Address;
  propertyIds: string[];
  notes?: string;
  totalSpent: number;
  activeJobsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = 'unscheduled' | 'scheduled' | 'in_progress' | 'completed' | 'canceled';
export type JobPriority = 'low' | 'medium' | 'high' | 'emergency';

export interface JobChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Job {
  id: string;
  jobNumber: string; // e.g. "JOB-1042"
  clientId: string;
  clientName: string;
  propertyId: string;
  propertyAddress: string;
  assignedTechId?: string;
  assignedTechName?: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  scheduledDate: string; // YYYY-MM-DD
  timeWindowStart: string; // e.g. "09:00"
  timeWindowEnd: string; // e.g. "12:00"
  checklist: JobChecklistItem[];
  photosBefore: string[];
  photosAfter: string[];
  estimateId?: string;
  invoiceId?: string;
  notes: string;
  totalAmount?: number;
  completedAt?: string;
  createdAt: string;
}

export interface EstimateItem {
  id: string;
  type: 'labor' | 'material' | 'flat_rate';
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  clientId: string;
  clientName: string;
  propertyId: string;
  propertyAddress: string;
  items: EstimateItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'declined';
  convertedToJobId?: string;
  validUntil: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  jobId: string;
  jobNumber: string;
  clientId: string;
  clientName: string;
  propertyId: string;
  propertyAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  stripePaymentLink?: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  clientId: string;
  clientName: string;
  propertyId: string;
  propertyAddress: string;
  planName: string; // e.g. "Preventative Maintenance Membership"
  amount: number;   // 99.00
  billingInterval: 'month' | 'year';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  stripeSubscriptionId: string;
  stripePriceId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoDispatchEnabled: boolean;
  lastDispatchedJobId?: string;
  createdAt: string;
}
