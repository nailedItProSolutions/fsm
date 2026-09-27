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
  marketComparison?: {
    trade: string;
    tradeLabel: string;
    romeLowEstimate: number;
    romeMedianEstimate: number;
    romeHighEstimate: number;
    customerDollarSavings: number;
    percentBelowMedian: number;
  };
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
  tier?: 'essentials' | 'plus' | 'premium';
  pricingVariables?: {
    sqFt: number;
    beds: number;
    baths: number;
    hvacUnits: number;
    kitchens: number;
    propertyAgeYears: number;
    inspectionGrade: string;
  };
  selectedAddOns?: Array<{
    id: string;
    name: string;
    category: string;
    billingType: 'monthly_recurring' | 'one_time';
    nailedItPrice: number;
  }>;
  monthlyAddOnsTotal?: number;
  oneTimeAddOnsTotal?: number;
}

// Phase 4: AI-Powered Technician Vault & Timesheet OCR Types
export type JobTradeCategory = 'Plumbing' | 'Electrical' | 'Drywall' | 'HVAC' | 'Carpentry' | 'Handyman' | 'Turnover';

export interface DailyWorkLog {
  id: string;
  technicianId: string;
  technicianName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "08:00 AM"
  stopTime: string;  // e.g. "04:30 PM"
  totalHours: number; // e.g. 8.5
  propertyLocation: string; // e.g. "4512 Oakwood Ave, Building A"
  propertyId?: string;
  taskDetails: string;
  jobCategory: JobTradeCategory;
  scannedImageUrl?: string;
  rawOcrText?: string;
  confidenceScore: number; // 0.0 to 1.0 (e.g. 0.96)
  createdAt: string;
  source: 'ocr_scan' | 'manual_entry';
  weeklyTimesheetId?: string;
}

export interface PaymentVerification {
  id: string;
  checkNumber?: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: 'check' | 'direct_deposit' | 'ach' | 'zelle';
  checkImageUrl?: string;
  notes?: string;
  verifiedBy: string; // e.g. "Sarah Jenkins (Admin)"
  verifiedAt: string;
}

export interface WeeklyTimesheet {
  id: string;
  technicianId: string;
  technicianName: string;
  weekNumber: number;
  year: number;
  weekStartDate: string; // Monday YYYY-MM-DD
  weekEndDate: string;   // Sunday YYYY-MM-DD
  dailyLogIds: string[];
  totalHours: number;
  hourlyRate: number;    // e.g. $35.00/hr
  totalGrossPay: number; // e.g. $1,400.00
  status: 'draft' | 'pending_review' | 'verified_paid';
  locked: boolean;
  paymentVerification?: PaymentVerification;
  generatedPdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

