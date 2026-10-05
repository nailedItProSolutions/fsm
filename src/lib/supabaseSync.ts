import { getSupabaseClient } from './supabase';
import {
  Client,
  Property,
  Job,
  Estimate,
  WorkAgreement,
  Invoice,
  Subscription,
  DailyWorkLog,
  WeeklyTimesheet,
  UserProfile,
  AuditLog,
} from '@/types';

// ==========================================
// Mappers: Domain Types <-> Supabase DB Rows
// ==========================================

function clientToDbBase(c: Client): any {
  return {
    id: c.id,
    is_company: Boolean(c.isCompany),
    company_name: c.companyName || null,
    first_name: c.firstName,
    last_name: c.lastName,
    email: c.email || '',
    phone: c.phone || '',
    billing_address: c.billingAddress || {},
    property_ids: c.propertyIds || [],
    notes: c.notes || '',
    total_spent: c.totalSpent || 0,
    active_jobs_count: c.activeJobsCount || 0,
    is_archived: Boolean(c.isArchived),
    archived_at: c.archivedAt || null,
    created_at: c.createdAt || new Date().toISOString(),
    updated_at: c.updatedAt || new Date().toISOString(),
  };
}

function dbToClientBase(r: any): Client {
  return {
    id: r.id,
    isCompany: Boolean(r.is_company),
    companyName: r.company_name || undefined,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email || '',
    phone: r.phone || '',
    billingAddress: r.billing_address || { street: '', city: 'Rome', state: 'GA', zip: '30162' },
    propertyIds: Array.isArray(r.property_ids) ? r.property_ids : [],
    notes: r.notes || '',
    totalSpent: Number(r.total_spent || 0),
    activeJobsCount: Number(r.active_jobs_count || 0),
    isArchived: Boolean(r.is_archived),
    archivedAt: r.archived_at || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at || r.created_at,
  };
}

function propertyToDbBase(p: Property): any {
  const fullAddress = p.street ? `${p.street}${p.unit ? `, ${p.unit}` : ''}, ${p.city || 'Rome'}, ${p.state || 'GA'} ${p.zip || '30162'}` : ((p as any).address || '');
  return {
    id: p.id,
    client_id: p.clientId,
    address: fullAddress,
    property_type: p.label || (p as any).propertyType || 'single_family',
    notes: (p as any).notes || '',
    service_history_job_ids: p.serviceHistoryJobIds || [],
    created_at: p.createdAt || new Date().toISOString(),
  };
}

function dbToPropertyBase(r: any): Property {
  return {
    id: r.id,
    clientId: r.client_id,
    street: r.address || '',
    city: 'Rome',
    state: 'GA',
    zip: '30162',
    label: r.property_type || 'Property',
    serviceHistoryJobIds: Array.isArray(r.service_history_job_ids) ? r.service_history_job_ids : [],
    createdAt: r.created_at,
  };
}

function jobToDbBase(j: Job): any {
  return {
    id: j.id,
    job_number: j.jobNumber,
    client_id: j.clientId,
    client_name: j.clientName,
    property_id: j.propertyId,
    property_address: j.propertyAddress,
    assigned_tech_id: j.assignedTechId || null,
    assigned_tech_name: j.assignedTechName || null,
    title: j.title,
    description: j.description || '',
    status: j.status,
    priority: j.priority || 'medium',
    scheduled_date: j.scheduledDate,
    time_window_start: j.timeWindowStart || '',
    time_window_end: j.timeWindowEnd || '',
    checklist: j.checklist || [],
    photos_before: j.photosBefore || [],
    photos_after: j.photosAfter || [],
    invoice_id: j.invoiceId || null,
    estimate_id: j.estimateId || null,
    work_agreement_id: j.workAgreementId || null,
    original_estimate_total: j.originalEstimateTotal || null,
    variance_amount: j.varianceAmount || null,
    variance_reason: j.varianceReason || null,
    notes: j.notes || '',
    total_amount: j.totalAmount || 0,
    completed_at: j.completedAt || null,
    created_at: j.createdAt || new Date().toISOString(),
  };
}

function dbToJobBase(r: any): Job {
  return {
    id: r.id,
    jobNumber: r.job_number,
    clientId: r.client_id,
    clientName: r.client_name,
    propertyId: r.property_id,
    propertyAddress: r.property_address,
    assignedTechId: r.assigned_tech_id || undefined,
    assignedTechName: r.assigned_tech_name || undefined,
    title: r.title,
    description: r.description || '',
    status: r.status,
    priority: r.priority || 'medium',
    scheduledDate: r.scheduled_date,
    timeWindowStart: r.time_window_start || '',
    timeWindowEnd: r.time_window_end || '',
    checklist: Array.isArray(r.checklist) ? r.checklist : [],
    photosBefore: Array.isArray(r.photos_before) ? r.photos_before : [],
    photosAfter: Array.isArray(r.photos_after) ? r.photos_after : [],
    invoiceId: r.invoice_id || undefined,
    estimateId: r.estimate_id || undefined,
    workAgreementId: r.work_agreement_id || undefined,
    originalEstimateTotal: r.original_estimate_total ? Number(r.original_estimate_total) : undefined,
    varianceAmount: r.variance_amount !== null && r.variance_amount !== undefined ? Number(r.variance_amount) : undefined,
    varianceReason: r.variance_reason || undefined,
    notes: r.notes || '',
    totalAmount: Number(r.total_amount || 0),
    completedAt: r.completed_at || undefined,
    createdAt: r.created_at,
  };
}

function estimateToDbBase(e: Estimate): any {
  return {
    id: e.id,
    estimate_number: e.estimateNumber,
    client_id: e.clientId,
    client_name: e.clientName,
    property_id: e.propertyId,
    property_address: e.propertyAddress,
    items: e.items || [],
    subtotal: e.subtotal || 0,
    tax_rate: e.taxRate || 0,
    tax_amount: e.taxAmount || 0,
    total: e.total || 0,
    deposit_paid: e.depositPaid || 0,
    work_agreement_id: e.workAgreementId || null,
    payments: e.payments || [],
    status: e.status,
    valid_until: e.validUntil || '',
    converted_to_job_id: e.convertedToJobId || null,
    market_comparison: e.marketComparison || null,
    created_at: e.createdAt || new Date().toISOString(),
  };
}

function dbToEstimateBase(r: any): Estimate {
  return {
    id: r.id,
    estimateNumber: r.estimate_number,
    clientId: r.client_id,
    clientName: r.client_name,
    propertyId: r.property_id,
    propertyAddress: r.property_address,
    items: Array.isArray(r.items) ? r.items : [],
    subtotal: Number(r.subtotal || 0),
    taxRate: Number(r.tax_rate || 0),
    taxAmount: Number(r.tax_amount || 0),
    total: Number(r.total || 0),
    depositPaid: Number(r.deposit_paid || 0),
    workAgreementId: r.work_agreement_id || undefined,
    payments: Array.isArray(r.payments) ? r.payments : [],
    status: r.status,
    validUntil: r.valid_until || '',
    convertedToJobId: r.converted_to_job_id || undefined,
    marketComparison: r.market_comparison || undefined,
    createdAt: r.created_at,
  };
}

function workAgreementToDbBase(a: WorkAgreement): any {
  return {
    id: a.id,
    contract_id: a.contractId || null,
    agreement_number: a.agreementNumber,
    estimate_id: a.estimateId,
    estimate_number: a.estimateNumber,
    job_id: a.jobId || null,
    job_number: a.jobNumber || null,
    client_id: a.clientId,
    client_name: a.clientName,
    property_id: a.propertyId,
    property_address: a.propertyAddress,
    original_estimate_total: a.originalEstimateTotal || 0,
    updated_total: a.updatedTotal || 0,
    variance_amount: a.varianceAmount || 0,
    variance_reason: a.varianceReason || '',
    deposit_paid: a.depositPaid || 0,
    amount_due_now: a.amountDueNow || 0,
    due_now_description: a.dueNowDescription || null,
    balance_due_upon_completion: a.balanceDueUponCompletion !== undefined ? a.balanceDueUponCompletion : a.balanceDue || 0,
    balance_due: a.balanceDue || 0,
    payment_method: a.paymentMethod || null,
    payment_receipt_number: a.paymentReceiptNumber || null,
    items: a.items || [],
    terms: a.terms || '',
    contractor_signed_by: a.contractorSignedBy || '',
    contractor_signed_at: a.contractorSignedAt || '',
    client_signature_name: a.clientSignatureName || null,
    client_signed_at: a.clientSignedAt || null,
    created_at: a.createdAt || new Date().toISOString(),
  };
}

function dbToWorkAgreementBase(r: any): WorkAgreement {
  return {
    id: r.id,
    contractId: r.contract_id || undefined,
    agreementNumber: r.agreement_number,
    estimateId: r.estimate_id,
    estimateNumber: r.estimate_number,
    jobId: r.job_id || undefined,
    jobNumber: r.job_number || undefined,
    clientId: r.client_id,
    clientName: r.client_name,
    propertyId: r.property_id,
    propertyAddress: r.property_address,
    originalEstimateTotal: Number(r.original_estimate_total || 0),
    updatedTotal: Number(r.updated_total || 0),
    varianceAmount: Number(r.variance_amount || 0),
    varianceReason: r.variance_reason || '',
    depositPaid: Number(r.deposit_paid || 0),
    amountDueNow: r.amount_due_now !== undefined && r.amount_due_now !== null ? Number(r.amount_due_now) : undefined,
    dueNowDescription: r.due_now_description || undefined,
    balanceDueUponCompletion: r.balance_due_upon_completion !== undefined && r.balance_due_upon_completion !== null
      ? Number(r.balance_due_upon_completion)
      : Number(r.balance_due || 0),
    balanceDue: Number(r.balance_due || 0),
    paymentMethod: r.payment_method || undefined,
    paymentReceiptNumber: r.payment_receipt_number || undefined,
    items: Array.isArray(r.items) ? r.items : [],
    terms: r.terms || '',
    contractorSignedBy: r.contractor_signed_by || '',
    contractorSignedAt: r.contractor_signed_at || '',
    clientSignatureName: r.client_signature_name || undefined,
    clientSignedAt: r.client_signed_at || undefined,
    createdAt: r.created_at,
  };
}

function invoiceToDbBase(i: Invoice): any {
  return {
    id: i.id,
    invoice_number: i.invoiceNumber,
    job_id: i.jobId,
    job_number: i.jobNumber,
    client_id: i.clientId,
    client_name: i.clientName,
    property_id: i.propertyId,
    property_address: i.propertyAddress,
    items: i.items || [],
    subtotal: i.subtotal || 0,
    tax: i.tax || 0,
    tax_rate: i.taxRate !== undefined ? i.taxRate : (i.taxExempt ? 0 : 0.07),
    tax_exempt: i.taxExempt ?? false,
    total: i.total || 0,
    amount_paid: i.amountPaid || 0,
    balance_due: i.balanceDue || 0,
    status: i.status,
    stripe_payment_link: i.stripePaymentLink || null,
    due_date: i.dueDate || '',
    paid_at: i.paidAt || null,
    created_at: i.createdAt || new Date().toISOString(),
  };
}

function dbToInvoiceBase(r: any): Invoice {
  return {
    id: r.id,
    invoiceNumber: r.invoice_number,
    jobId: r.job_id,
    jobNumber: r.job_number,
    clientId: r.client_id,
    clientName: r.client_name,
    propertyId: r.property_id,
    propertyAddress: r.property_address,
    items: Array.isArray(r.items) ? r.items : [],
    subtotal: Number(r.subtotal || 0),
    tax: Number(r.tax || 0),
    taxRate: r.tax_rate !== undefined && r.tax_rate !== null ? Number(r.tax_rate) : undefined,
    taxExempt: r.tax_exempt !== undefined ? Boolean(r.tax_exempt) : undefined,
    total: Number(r.total || 0),
    amountPaid: Number(r.amount_paid || 0),
    balanceDue: Number(r.balance_due || 0),
    status: r.status,
    stripePaymentLink: r.stripe_payment_link || undefined,
    dueDate: r.due_date || '',
    paidAt: r.paid_at || undefined,
    createdAt: r.created_at,
  };
}

function subscriptionToDbBase(s: Subscription): any {
  return {
    id: s.id,
    client_id: s.clientId,
    client_name: s.clientName,
    property_id: s.propertyId,
    property_address: s.propertyAddress,
    plan_name: s.planName,
    amount: s.amount || 0,
    billing_interval: s.billingInterval || 'month',
    status: s.status,
    stripe_subscription_id: s.stripeSubscriptionId,
    stripe_price_id: s.stripePriceId || null,
    current_period_start: s.currentPeriodStart || '',
    current_period_end: s.currentPeriodEnd || '',
    auto_dispatch_enabled: Boolean(s.autoDispatchEnabled),
    last_dispatched_job_id: s.lastDispatchedJobId || null,
    tier: s.tier || null,
    pricing_variables: s.pricingVariables || null,
    selected_add_ons: s.selectedAddOns || null,
    monthly_add_ons_total: s.monthlyAddOnsTotal || 0,
    one_time_add_ons_total: s.oneTimeAddOnsTotal || 0,
    created_at: s.createdAt || new Date().toISOString(),
  };
}

function dbToSubscriptionBase(r: any): Subscription {
  return {
    id: r.id,
    clientId: r.client_id,
    clientName: r.client_name,
    propertyId: r.property_id,
    propertyAddress: r.property_address,
    planName: r.plan_name,
    amount: Number(r.amount || 0),
    billingInterval: r.billing_interval || 'month',
    status: r.status,
    stripeSubscriptionId: r.stripe_subscription_id,
    stripePriceId: r.stripe_price_id || undefined,
    currentPeriodStart: r.current_period_start || '',
    currentPeriodEnd: r.current_period_end || '',
    autoDispatchEnabled: Boolean(r.auto_dispatch_enabled),
    lastDispatchedJobId: r.last_dispatched_job_id || undefined,
    tier: r.tier || undefined,
    pricingVariables: r.pricing_variables || undefined,
    selectedAddOns: r.selected_add_ons || undefined,
    monthlyAddOnsTotal: r.monthly_add_ons_total ? Number(r.monthly_add_ons_total) : undefined,
    oneTimeAddOnsTotal: r.one_time_add_ons_total ? Number(r.one_time_add_ons_total) : undefined,
    createdAt: r.created_at,
  };
}

function userToDbBase(u: UserProfile): any {
  return {
    uid: u.uid,
    email: u.email || '',
    display_name: u.displayName,
    role: u.role,
    phone: u.phone || null,
    avatar_url: u.avatarUrl || null,
    client_id: u.clientId || null,
    employee_id: u.employeeId || '',
    pin: u.pin || '',
    telegram_chat_id: u.telegramChatId || null,
    active: Boolean(u.active),
    created_at: u.createdAt || new Date().toISOString(),
  };
}

function dbToUserBase(r: any): UserProfile {
  return {
    uid: r.uid,
    email: r.email || '',
    displayName: r.display_name,
    role: r.role,
    phone: r.phone || undefined,
    avatarUrl: r.avatar_url || undefined,
    clientId: r.client_id || undefined,
    employeeId: r.employee_id || '',
    pin: r.pin || '',
    telegramChatId: r.telegram_chat_id || undefined,
    active: r.active !== undefined ? Boolean(r.active) : true,
    createdAt: r.created_at,
  };
}

function dailyWorkLogToDbBase(l: DailyWorkLog): any {
  return {
    id: l.id,
    technician_id: l.technicianId,
    technician_name: l.technicianName,
    date: l.date,
    start_time: l.startTime,
    stop_time: l.stopTime,
    total_hours: l.totalHours || 0,
    property_location: l.propertyLocation,
    property_id: l.propertyId || null,
    task_details: l.taskDetails || '',
    job_category: l.jobCategory,
    scanned_image_url: l.scannedImageUrl || null,
    raw_ocr_text: l.rawOcrText || null,
    confidence_score: l.confidenceScore || 0,
    source: l.source || 'manual_entry',
    weekly_timesheet_id: l.weeklyTimesheetId || null,
    created_at: l.createdAt || new Date().toISOString(),
  };
}

function dbToDailyWorkLogBase(r: any): DailyWorkLog {
  return {
    id: r.id,
    technicianId: r.technician_id,
    technicianName: r.technician_name,
    date: r.date,
    startTime: r.start_time,
    stopTime: r.stop_time,
    totalHours: Number(r.total_hours || 0),
    propertyLocation: r.property_location,
    propertyId: r.property_id || undefined,
    taskDetails: r.task_details || '',
    jobCategory: r.job_category,
    scannedImageUrl: r.scanned_image_url || undefined,
    rawOcrText: r.raw_ocr_text || undefined,
    confidenceScore: Number(r.confidence_score || 0),
    source: r.source || 'manual_entry',
    weeklyTimesheetId: r.weekly_timesheet_id || undefined,
    createdAt: r.created_at,
  };
}

function weeklyTimesheetToDbBase(t: WeeklyTimesheet): any {
  return {
    id: t.id,
    technician_id: t.technicianId,
    technician_name: t.technicianName,
    week_number: t.weekNumber,
    year: t.year,
    week_start_date: t.weekStartDate,
    week_end_date: t.weekEndDate,
    daily_log_ids: t.dailyLogIds || [],
    total_hours: t.totalHours || 0,
    hourly_rate: t.hourlyRate || 35.0,
    total_gross_pay: t.totalGrossPay || 0,
    bonuses: t.bonuses || [],
    total_bonuses: t.totalBonuses || 0,
    deductions: t.deductions || [],
    total_deductions: t.totalDeductions || 0,
    net_pay: t.netPay || 0,
    audit_confirmed: Boolean(t.auditConfirmed),
    audit_confirmed_at: t.auditConfirmedAt || null,
    audit_confirmed_by: t.auditConfirmedBy || null,
    status: t.status || 'draft',
    locked: Boolean(t.locked),
    payment_verification: t.paymentVerification || null,
    generated_pdf_url: t.generatedPdfUrl || null,
    created_at: t.createdAt || new Date().toISOString(),
    updated_at: t.updatedAt || new Date().toISOString(),
  };
}

function dbToWeeklyTimesheetBase(r: any): WeeklyTimesheet {
  return {
    id: r.id,
    technicianId: r.technician_id,
    technicianName: r.technician_name,
    weekNumber: Number(r.week_number || 1),
    year: Number(r.year || 2026),
    weekStartDate: r.week_start_date,
    weekEndDate: r.week_end_date,
    dailyLogIds: Array.isArray(r.daily_log_ids) ? r.daily_log_ids : [],
    totalHours: Number(r.total_hours || 0),
    hourlyRate: Number(r.hourly_rate || 35),
    totalGrossPay: Number(r.total_gross_pay || 0),
    bonuses: Array.isArray(r.bonuses) ? r.bonuses : [],
    totalBonuses: Number(r.total_bonuses || 0),
    deductions: Array.isArray(r.deductions) ? r.deductions : [],
    totalDeductions: Number(r.total_deductions || 0),
    netPay: Number(r.net_pay || 0),
    auditConfirmed: Boolean(r.audit_confirmed),
    auditConfirmedAt: r.audit_confirmed_at || undefined,
    auditConfirmedBy: r.audit_confirmed_by || undefined,
    status: r.status || 'draft',
    locked: Boolean(r.locked),
    paymentVerification: r.payment_verification || undefined,
    generatedPdfUrl: r.generated_pdf_url || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at || r.created_at,
  };
}

function auditLogToDbBase(a: AuditLog): any {
  return {
    id: a.id,
    employee_id: a.employeeId || '',
    employee_name: a.employeeName || '',
    employee_role: a.employeeRole || '',
    user_name: a.userName || null,
    user_role: a.userRole || null,
    action_type: a.actionType,
    entity_type: a.entityType,
    entity_id: a.entityId,
    entity_title: a.entityTitle || null,
    summary: a.summary || '',
    description: a.description || null,
    previous_state: a.previousState || null,
    new_state: a.newState || null,
    timestamp: a.timestamp || new Date().toISOString(),
  };
}

function dbToAuditLogBase(r: any): AuditLog {
  return {
    id: r.id,
    employeeId: r.employee_id || '',
    employeeName: r.employee_name || '',
    employeeRole: r.employee_role || 'admin',
    userName: r.user_name || undefined,
    userRole: r.user_role || undefined,
    actionType: r.action_type,
    entityType: r.entity_type,
    entityId: r.entity_id,
    entityTitle: r.entity_title || undefined,
    summary: r.summary || '',
    description: r.description || undefined,
    previousState: r.previous_state || undefined,
    newState: r.new_state || undefined,
    timestamp: r.timestamp,
  };
}


// ==========================================
// Lossless wrappers: every row also carries the full domain object in a
// `raw` JSONB column, so round-trips never lose structure (e.g. property
// street/city/state/zip). Rows pushed by older versions (no `raw`) fall
// back to the legacy column mappers and are flagged as "legacy".
// ==========================================

const withRaw = (row: any, obj: unknown) => ({ ...row, raw: obj });
const fromRow = <T>(r: any, base: (row: any) => T): T =>
  r && r.raw && typeof r.raw === 'object' ? (r.raw as T) : base(r);

export function clientToDb(c: Client): any { return withRaw(clientToDbBase(c), c); }
export function dbToClient(r: any): Client { return fromRow(r, dbToClientBase); }
export function propertyToDb(p: Property): any { return withRaw(propertyToDbBase(p), p); }
export function dbToProperty(r: any): Property { return fromRow(r, dbToPropertyBase); }
export function jobToDb(j: Job): any { return withRaw(jobToDbBase(j), j); }
export function dbToJob(r: any): Job { return fromRow(r, dbToJobBase); }
export function estimateToDb(e: Estimate): any { return withRaw(estimateToDbBase(e), e); }
export function dbToEstimate(r: any): Estimate { return fromRow(r, dbToEstimateBase); }
export function workAgreementToDb(a: WorkAgreement): any { return withRaw(workAgreementToDbBase(a), a); }
export function dbToWorkAgreement(r: any): WorkAgreement { return fromRow(r, dbToWorkAgreementBase); }
export function invoiceToDb(i: Invoice): any { return withRaw(invoiceToDbBase(i), i); }
export function dbToInvoice(r: any): Invoice { return fromRow(r, dbToInvoiceBase); }
export function subscriptionToDb(s: Subscription): any { return withRaw(subscriptionToDbBase(s), s); }
export function dbToSubscription(r: any): Subscription { return fromRow(r, dbToSubscriptionBase); }
export function userToDb(u: UserProfile): any { return withRaw(userToDbBase(u), u); }
export function dbToUser(r: any): UserProfile { return fromRow(r, dbToUserBase); }
export function dailyWorkLogToDb(l: DailyWorkLog): any { return withRaw(dailyWorkLogToDbBase(l), l); }
export function dbToDailyWorkLog(r: any): DailyWorkLog { return fromRow(r, dbToDailyWorkLogBase); }
export function weeklyTimesheetToDb(t: WeeklyTimesheet): any { return withRaw(weeklyTimesheetToDbBase(t), t); }
export function dbToWeeklyTimesheet(r: any): WeeklyTimesheet { return fromRow(r, dbToWeeklyTimesheetBase); }
export function auditLogToDb(a: AuditLog): any { return withRaw(auditLogToDbBase(a), a); }
export function dbToAuditLog(r: any): AuditLog { return fromRow(r, dbToAuditLogBase); }

// ==========================================
// Write tracking (pending / failed background writes)
// ==========================================

export const SYNC_TABLES = [
  'users',
  'clients',
  'properties',
  'jobs',
  'estimates',
  'work_agreements',
  'invoices',
  'subscriptions',
  'daily_work_logs',
  'weekly_timesheets',
  'audit_logs',
];

let pendingWrites = 0;
let cloudDirty = false;
let lastWriteError: string | null = null;
let writeFailureHandler: (() => void) | null = null;
const failedDeletes = new Map<string, { table: string; id: string; idKey: string }>();

export const getPendingWrites = () => pendingWrites;
export const isCloudDirty = () => cloudDirty;
export const markCloudDirty = () => { cloudDirty = true; };
export const clearCloudDirty = () => { cloudDirty = false; };
export const getLastWriteError = () => lastWriteError;
export const setWriteFailureHandler = (fn: (() => void) | null) => { writeFailureHandler = fn; };

export async function waitForPendingWrites(timeoutMs = 8000): Promise<void> {
  const start = Date.now();
  while (pendingWrites > 0 && Date.now() - start < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export function describeSupabaseError(table: string, error: { message?: string; code?: string }): string {
  const msg = error?.message || 'Unknown error';
  if (error?.code === 'PGRST204' || /\braw\b/i.test(msg)) {
    return `Schema is out of date (missing "raw" column on "${table}") - re-run supabase/schema.sql in the Supabase SQL Editor.`;
  }
  if (error?.code === '42P01' || error?.code === 'PGRST205' || /schema cache|does not exist/i.test(msg)) {
    return `Table "${table}" is missing - run supabase/schema.sql in the Supabase SQL Editor.`;
  }
  return `${table}: ${msg}`;
}

function trackWrite(op: PromiseLike<any>, table: string, onFail?: () => void) {
  pendingWrites++;
  const fail = (message: string) => {
    cloudDirty = true;
    lastWriteError = message;
    if (onFail) onFail();
    if (writeFailureHandler) writeFailureHandler();
  };
  Promise.resolve(op).then(
    (res: any) => {
      pendingWrites = Math.max(0, pendingWrites - 1);
      if (res && res.error) {
        console.warn(`[Supabase Background Sync] ${table} error:`, res.error.message);
        fail(describeSupabaseError(table, res.error));
      } else {
        lastWriteError = null;
      }
    },
    (err: any) => {
      pendingWrites = Math.max(0, pendingWrites - 1);
      console.warn(`[Supabase Background Sync] ${table} exception:`, err);
      fail(err?.message || 'Network error');
    }
  );
}

// Single-record background sync helper functions
export function syncRecordInBackground(tableName: string, row: any, conflictKey = 'id') {
  const client = getSupabaseClient();
  if (!client) return;

  const runUpsert = async () => {
    let res = await client.from(tableName).upsert(row, { onConflict: conflictKey });
    // If remote table lacks newly added columns (e.g. before user executes migration SQL), retry with stripped row
    if (res?.error && tableName === 'work_agreements') {
      const msg = res.error.message || '';
      if (res.error.code === 'PGRST204' || /column.*does not exist|schema cache/i.test(msg)) {
        const fallback = { ...row };
        delete fallback.amount_due_now;
        delete fallback.due_now_description;
        delete fallback.balance_due_upon_completion;
        if (/raw/i.test(msg)) delete fallback.raw;
        res = await client.from(tableName).upsert(fallback, { onConflict: conflictKey });
      }
    }
    if (res?.error && tableName === 'invoices') {
      const msg = res.error.message || '';
      if (res.error.code === 'PGRST204' || /column.*does not exist|schema cache/i.test(msg)) {
        const fallback = { ...row };
        delete fallback.tax_exempt;
        delete fallback.tax_rate;
        if (/raw/i.test(msg)) delete fallback.raw;
        res = await client.from(tableName).upsert(fallback, { onConflict: conflictKey });
      }
    }
    return res;
  };

  trackWrite(runUpsert(), tableName);
}

export function deleteRecordInBackground(tableName: string, id: string, idKey = 'id') {
  const client = getSupabaseClient();
  if (!client) return;
  const key = `${tableName}:${id}`;
  trackWrite(client.from(tableName).delete().eq(idKey, id), tableName, () => {
    failedDeletes.set(key, { table: tableName, id, idKey });
  });
}

/** Retries deletes that previously failed (e.g. while offline) so removed records don't resurrect. */
export async function retryFailedDeletes(): Promise<void> {
  const client = getSupabaseClient();
  if (!client || failedDeletes.size === 0) return;
  for (const [key, item] of Array.from(failedDeletes.entries())) {
    try {
      const { error } = await client.from(item.table).delete().eq(item.idKey, item.id);
      if (!error) failedDeletes.delete(key);
    } catch {
      /* keep for next cycle */
    }
  }
}

// ==========================================
// Cloud Sync Engine
// ==========================================

export interface LocalSnapshot {
  clients: Client[];
  properties: Property[];
  jobs: Job[];
  estimates: Estimate[];
  workAgreements: WorkAgreement[];
  invoices: Invoice[];
  subscriptions: Subscription[];
  users: UserProfile[];
  dailyWorkLogs: DailyWorkLog[];
  weeklyTimesheets: WeeklyTimesheet[];
  auditLogs: AuditLog[];
}

export interface CloudSnapshot extends LocalSnapshot {
  /** "table:id" keys of cloud rows written by an older version (no `raw` column data). */
  legacy: Set<string>;
  /** True if the cloud has any clients, jobs or estimates. */
  hasData: boolean;
}

/**
 * Fetches every table. Returns null if Supabase isn't configured.
 * Throws a descriptive Error if any query fails (missing tables, bad key, offline...).
 */
export async function fetchAllFromSupabase(): Promise<CloudSnapshot | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const names = [
    'clients',
    'properties',
    'jobs',
    'estimates',
    'work_agreements',
    'invoices',
    'subscriptions',
    'users',
    'daily_work_logs',
    'weekly_timesheets',
    'audit_logs',
  ];

  const results = await Promise.all([
    client.from('clients').select('*'),
    client.from('properties').select('*'),
    client.from('jobs').select('*'),
    client.from('estimates').select('*'),
    client.from('work_agreements').select('*'),
    client.from('invoices').select('*'),
    client.from('subscriptions').select('*'),
    client.from('users').select('*'),
    client.from('daily_work_logs').select('*'),
    client.from('weekly_timesheets').select('*'),
    client.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(500),
  ]);

  results.forEach((res, i) => {
    if (res.error) throw new Error(describeSupabaseError(names[i], res.error));
  });

  const [clientsRes, propsRes, jobsRes, estRes, agreementsRes, invRes, subRes, usersRes, workLogsRes, timesheetsRes, auditRes] =
    results;

  const legacy = new Set<string>();
  const convert = <T>(table: string, idKey: string, rows: any[] | null, mapper: (r: any) => T): T[] =>
    (rows || []).map((r) => {
      if (!r.raw) legacy.add(`${table}:${r[idKey]}`);
      return mapper(r);
    });

  const snapshot: CloudSnapshot = {
    clients: convert('clients', 'id', clientsRes.data, dbToClient),
    properties: convert('properties', 'id', propsRes.data, dbToProperty),
    jobs: convert('jobs', 'id', jobsRes.data, dbToJob),
    estimates: convert('estimates', 'id', estRes.data, dbToEstimate),
    workAgreements: convert('work_agreements', 'id', agreementsRes.data, dbToWorkAgreement),
    invoices: convert('invoices', 'id', invRes.data, dbToInvoice),
    subscriptions: convert('subscriptions', 'id', subRes.data, dbToSubscription),
    users: convert('users', 'uid', usersRes.data, dbToUser),
    dailyWorkLogs: convert('daily_work_logs', 'id', workLogsRes.data, dbToDailyWorkLog),
    weeklyTimesheets: convert('weekly_timesheets', 'id', timesheetsRes.data, dbToWeeklyTimesheet),
    auditLogs: convert('audit_logs', 'id', auditRes.data, dbToAuditLog),
    legacy,
    hasData: false,
  };
  snapshot.hasData = snapshot.clients.length + snapshot.jobs.length + snapshot.estimates.length > 0;
  return snapshot;
}

/**
 * Reconciles one collection between local state and the cloud.
 *  - 'merge'   : keep local-only records (and push them), cloud wins for shared records
 *                (except legacy cloud rows, where local wins and is re-pushed in the new format).
 *  - 'replace' : cloud is authoritative; local-only records are dropped.
 * Local ordering is preserved to avoid UI flicker. An empty cloud table never wipes local data
 * unless `authoritativeEmpty` is set (fresh device joining an existing cloud database).
 */
export function reconcileCollection<T>(
  table: string,
  local: T[],
  cloud: T[],
  idOf: (item: T) => string,
  legacy: Set<string>,
  mode: 'merge' | 'replace',
  authoritativeEmpty = false
): { result: T[]; toPush: T[] } {
  if (cloud.length === 0 && !(mode === 'replace' && authoritativeEmpty)) {
    return { result: local, toPush: mode === 'merge' ? local : [] };
  }

  const cloudMap = new Map<string, T>();
  cloud.forEach((c) => cloudMap.set(idOf(c), c));
  const localIds = new Set<string>();
  const result: T[] = [];
  const toPush: T[] = [];

  for (const l of local) {
    const id = idOf(l);
    localIds.add(id);
    const c = cloudMap.get(id);
    if (c === undefined) {
      if (mode === 'merge') {
        result.push(l);
        toPush.push(l);
      }
    } else if (mode === 'merge' && legacy.has(`${table}:${id}`)) {
      result.push(l);
      toPush.push(l);
    } else {
      result.push(c);
    }
  }
  for (const c of cloud) {
    if (!localIds.has(idOf(c))) result.push(c);
  }
  return { result, toPush };
}

/**
 * Pushes (a subset of) the local database into Supabase in chunked bulk upserts.
 */
export async function pushAllLocalToSupabase(data: Partial<LocalSnapshot>): Promise<{
  success: boolean;
  counts: Record<string, number>;
  errors: string[];
}> {
  const client = getSupabaseClient();
  const counts: Record<string, number> = {};
  const errors: string[] = [];

  if (!client) {
    return {
      success: false,
      counts,
      errors: ['Supabase client is not configured.'],
    };
  }

  const tasks = [
    { name: 'users', rows: (data.users || []).map(userToDb), key: 'uid' },
    { name: 'clients', rows: (data.clients || []).map(clientToDb), key: 'id' },
    { name: 'properties', rows: (data.properties || []).map(propertyToDb), key: 'id' },
    { name: 'jobs', rows: (data.jobs || []).map(jobToDb), key: 'id' },
    { name: 'estimates', rows: (data.estimates || []).map(estimateToDb), key: 'id' },
    { name: 'work_agreements', rows: (data.workAgreements || []).map(workAgreementToDb), key: 'id' },
    { name: 'invoices', rows: (data.invoices || []).map(invoiceToDb), key: 'id' },
    { name: 'subscriptions', rows: (data.subscriptions || []).map(subscriptionToDb), key: 'id' },
    { name: 'daily_work_logs', rows: (data.dailyWorkLogs || []).map(dailyWorkLogToDb), key: 'id' },
    { name: 'weekly_timesheets', rows: (data.weeklyTimesheets || []).map(weeklyTimesheetToDb), key: 'id' },
    { name: 'audit_logs', rows: (data.auditLogs || []).map(auditLogToDb), key: 'id' },
  ];

  const CHUNK = 100;
  for (const task of tasks) {
    if (task.rows.length === 0) continue;
    let pushed = 0;
    for (let i = 0; i < task.rows.length; i += CHUNK) {
      const chunk = task.rows.slice(i, i + CHUNK);
      try {
        let { error } = await client.from(task.name).upsert(chunk, { onConflict: task.key });
        if (error && task.name === 'work_agreements' && (error.code === 'PGRST204' || /column.*does not exist/i.test(error.message || ''))) {
          // Schema column fallback retry
          const fallbackChunk = chunk.map((r: any) => {
            const copy = { ...r };
            delete copy.amount_due_now;
            delete copy.due_now_description;
            delete copy.balance_due_upon_completion;
            if (/raw/i.test(error?.message || '')) delete copy.raw;
            return copy;
          });
          const retry = await client.from(task.name).upsert(fallbackChunk, { onConflict: task.key });
          error = retry.error;
        }
        if (error) {
          errors.push(describeSupabaseError(task.name, error));
          break;
        }
        pushed += chunk.length;
      } catch (e: any) {
        errors.push(`Table ${task.name} exception: ${e?.message}`);
        break;
      }
    }
    if (pushed > 0) counts[task.name] = pushed;
  }

  return {
    success: errors.length === 0,
    counts,
    errors,
  };
}

/**
 * Subscribes to Supabase Realtime changes on every synced table.
 * Returns an unsubscribe function. Silently no-ops if not configured.
 */
export function subscribeToCloudChanges(onChange: () => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client.channel('fsm-autosync');
    SYNC_TABLES.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => onChange());
    });
    channel.subscribe();
    return () => {
      try {
        client.removeChannel(channel);
      } catch {
        /* ignore */
      }
    };
  } catch (err) {
    console.warn('Realtime subscription unavailable (polling fallback active):', err);
    return () => {};
  }
}
