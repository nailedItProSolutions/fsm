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

export function clientToDb(c: Client): any {
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

export function dbToClient(r: any): Client {
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

export function propertyToDb(p: Property): any {
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

export function dbToProperty(r: any): Property {
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

export function jobToDb(j: Job): any {
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

export function dbToJob(r: any): Job {
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

export function estimateToDb(e: Estimate): any {
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

export function dbToEstimate(r: any): Estimate {
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

export function workAgreementToDb(a: WorkAgreement): any {
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

export function dbToWorkAgreement(r: any): WorkAgreement {
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

export function invoiceToDb(i: Invoice): any {
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

export function dbToInvoice(r: any): Invoice {
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

export function subscriptionToDb(s: Subscription): any {
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

export function dbToSubscription(r: any): Subscription {
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

export function userToDb(u: UserProfile): any {
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

export function dbToUser(r: any): UserProfile {
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

export function dailyWorkLogToDb(l: DailyWorkLog): any {
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

export function dbToDailyWorkLog(r: any): DailyWorkLog {
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

export function weeklyTimesheetToDb(t: WeeklyTimesheet): any {
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

export function dbToWeeklyTimesheet(r: any): WeeklyTimesheet {
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

export function auditLogToDb(a: AuditLog): any {
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

export function dbToAuditLog(r: any): AuditLog {
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
// Cloud Sync Engine & Real-Time Upsert Calls
// ==========================================

export async function fetchAllFromSupabase(): Promise<{
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
} | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [
      clientsRes,
      propsRes,
      jobsRes,
      estRes,
      agreementsRes,
      invRes,
      subRes,
      usersRes,
      workLogsRes,
      timesheetsRes,
      auditRes,
    ] = await Promise.all([
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
      client.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(200),
    ]);

    // Check if critical tables returned data
    const hasData = (clientsRes.data?.length || 0) + (jobsRes.data?.length || 0) + (estRes.data?.length || 0) > 0;
    if (!hasData) {
      return null;
    }

    return {
      clients: (clientsRes.data || []).map(dbToClient),
      properties: (propsRes.data || []).map(dbToProperty),
      jobs: (jobsRes.data || []).map(dbToJob),
      estimates: (estRes.data || []).map(dbToEstimate),
      workAgreements: (agreementsRes.data || []).map(dbToWorkAgreement),
      invoices: (invRes.data || []).map(dbToInvoice),
      subscriptions: (subRes.data || []).map(dbToSubscription),
      users: (usersRes.data || []).map(dbToUser),
      dailyWorkLogs: (workLogsRes.data || []).map(dbToDailyWorkLog),
      weeklyTimesheets: (timesheetsRes.data || []).map(dbToWeeklyTimesheet),
      auditLogs: (auditRes.data || []).map(dbToAuditLog),
    };
  } catch (err) {
    console.warn('Failed to pull from Supabase (falling back to local cache):', err);
    return null;
  }
}

/**
 * Pushes entire local database snapshot into Supabase in bulk.
 */
export async function pushAllLocalToSupabase(data: {
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
}): Promise<{
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
    { name: 'clients', rows: data.clients.map(clientToDb), key: 'id' },
    { name: 'properties', rows: data.properties.map(propertyToDb), key: 'id' },
    { name: 'jobs', rows: data.jobs.map(jobToDb), key: 'id' },
    { name: 'estimates', rows: data.estimates.map(estimateToDb), key: 'id' },
    { name: 'work_agreements', rows: data.workAgreements.map(workAgreementToDb), key: 'id' },
    { name: 'invoices', rows: data.invoices.map(invoiceToDb), key: 'id' },
    { name: 'subscriptions', rows: data.subscriptions.map(subscriptionToDb), key: 'id' },
    { name: 'users', rows: data.users.map(userToDb), key: 'uid' },
    { name: 'daily_work_logs', rows: data.dailyWorkLogs.map(dailyWorkLogToDb), key: 'id' },
    { name: 'weekly_timesheets', rows: data.weeklyTimesheets.map(weeklyTimesheetToDb), key: 'id' },
    { name: 'audit_logs', rows: data.auditLogs.map(auditLogToDb), key: 'id' },
  ];

  for (const task of tasks) {
    if (task.rows.length === 0) continue;
    try {
      const { error } = await client.from(task.name).upsert(task.rows, { onConflict: task.key });
      if (error) {
        errors.push(`Table ${task.name}: ${error.message}`);
      } else {
        counts[task.name] = task.rows.length;
      }
    } catch (e: any) {
      errors.push(`Table ${task.name} exception: ${e?.message}`);
    }
  }

  return {
    success: errors.length === 0,
    counts,
    errors,
  };
}

// Single-record background sync helper functions
export function syncRecordInBackground(tableName: string, row: any, conflictKey = 'id') {
  const client = getSupabaseClient();
  if (!client) return;

  Promise.resolve(client.from(tableName).upsert(row, { onConflict: conflictKey }))
    .then(({ error }: any) => {
      if (error) {
        console.warn(`[Supabase Background Sync] ${tableName} error:`, error.message);
      }
    })
    .catch((err: any) => {
      console.warn(`[Supabase Background Sync] ${tableName} exception:`, err);
    });
}

export function deleteRecordInBackground(tableName: string, id: string, idKey = 'id') {
  const client = getSupabaseClient();
  if (!client) return;

  Promise.resolve(client.from(tableName).delete().eq(idKey, id))
    .then(({ error }: any) => {
      if (error) {
        console.warn(`[Supabase Background Sync Delete] ${tableName} error:`, error.message);
      }
    })
    .catch((err: any) => {
      console.warn(`[Supabase Background Sync Delete] ${tableName} exception:`, err);
    });
}
