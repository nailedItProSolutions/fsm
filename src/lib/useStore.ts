'use client';

import { useState, useEffect } from 'react';
import { FSMStore } from './store';
import { Client, Property, Job, Invoice, Estimate } from '@/types';

export function useFSMStore() {
  const store = FSMStore.getInstance();
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, [store]);

  return {
    clients: store.getClients(),
    properties: store.getProperties(),
    jobs: store.getJobs(),
    invoices: store.getInvoices(),
    estimates: store.getEstimates(),
    subscriptions: store.getSubscriptions(),
    getClientById: (id: string) => store.getClientById(id),
    getJobById: (id: string) => store.getJobById(id),
    getEstimateById: (id: string) => store.getEstimateById(id),
    getInvoiceById: (id: string) => store.getInvoiceById(id),
    getSubscriptionById: (id: string) => store.getSubscriptionById(id),
    getTechnicians: () => store.getTechnicians(),
    technicians: store.getTechnicians(),
    getUsers: () => store.getUsers(),
    addTechnician: (techData: any) => store.addTechnician(techData),
    updateTechnician: (uid: string, updates: any) => store.updateTechnician(uid, updates),
    deleteTechnician: (uid: string, authorizingUser?: any) => store.deleteTechnician(uid, authorizingUser),
    verifyEmployeePin: (pin: string, employeeId?: string) => store.verifyEmployeePin(pin, employeeId),
    deleteEstimate: (estimateId: string, authorizingUser?: any) => store.deleteEstimate(estimateId, authorizingUser),
    deleteWorkAgreement: (agreementId: string, authorizingUser?: any) => store.deleteWorkAgreement(agreementId, authorizingUser),
    deleteInvoice: (invoiceId: string, authorizingUser?: any) => store.deleteInvoice(invoiceId, authorizingUser),
    deleteJob: (jobId: string, authorizingUser?: any) => store.deleteJob(jobId, authorizingUser),
    clearClientHistory: (clientId: string, authorizingUser?: any) => store.clearClientHistory(clientId, authorizingUser),
    getPropertiesByClientId: (clientId: string) => store.getPropertiesByClientId(clientId),
    getPropertyById: (id: string) => store.getPropertyById(id),
    getJobsByClientId: (clientId: string) => store.getJobsByClientId(clientId),
    getJobsByTechId: (techId: string) => store.getJobsByTechId(techId),
    getInvoicesByClientId: (clientId: string) => store.getInvoicesByClientId(clientId),
    getEstimatesByClientId: (clientId: string) => store.getEstimatesByClientId(clientId),
    getSubscriptionsByClientId: (clientId: string) => store.getSubscriptionsByClientId(clientId),
    archiveClient: (id: string) => store.archiveClient(id),
    unarchiveClient: (id: string) => store.unarchiveClient(id),
  addClient: (clientData: any, initialProperty?: any) => store.addClient(clientData, initialProperty),
    addProperty: (propertyData: any) => store.addProperty(propertyData),
    addJob: (jobData: any) => store.addJob(jobData),
    updateJob: (jobId: string, updates: any) => store.updateJob(jobId, updates),
    updateJobStatus: (jobId: string, status: any) => store.updateJobStatus(jobId, status),
    toggleChecklistItem: (jobId: string, itemId: string) => store.toggleChecklistItem(jobId, itemId),
    addJobPhoto: (jobId: string, type: 'before' | 'after', photoUrl: string) => store.addJobPhoto(jobId, type, photoUrl),
    addEstimate: (estimateData: any) => store.addEstimate(estimateData),
    updateEstimateStatus: (id: string, status: any) => store.updateEstimateStatus(id, status),
    convertEstimateToJob: (estimateId: string, date?: string, techId?: string) => store.convertEstimateToJob(estimateId, date, techId),
    recordEstimatePayment: (estimateId: string, paymentData: any) => store.recordEstimatePayment(estimateId, paymentData),
    createWorkAgreement: (estimateId: string, agreementData: any) => store.createWorkAgreement(estimateId, agreementData),
    getWorkAgreements: () => store.getWorkAgreements(),
    getWorkAgreementById: (id: string) => store.getWorkAgreementById(id),
    getWorkAgreementByEstimateId: (estimateId: string) => store.getWorkAgreementByEstimateId(estimateId),
    signWorkAgreementClient: (agreementId: string, clientSignatureName: string) => store.signWorkAgreementClient(agreementId, clientSignatureName),
    addInvoice: (invoiceData: any) => store.addInvoice(invoiceData),
    markInvoicePaid: (invoiceId: string, stripePaymentIntentId?: string) => store.markInvoicePaid(invoiceId, stripePaymentIntentId),
    createSubscription: (subData: any) => store.createSubscription(subData),
    cancelSubscription: (subId: string) => store.cancelSubscription(subId),
    triggerSubscriptionRenewal: (subId: string) => store.triggerSubscriptionRenewal(subId),
    dailyWorkLogs: store.getDailyWorkLogs(),
    weeklyTimesheets: store.getWeeklyTimesheets(),
    getDailyWorkLogsByTechId: (techId: string) => store.getDailyWorkLogsByTechId(techId),
    addDailyWorkLog: (logData: any) => store.addDailyWorkLog(logData),
    getWeeklyTimesheetsByTechId: (techId: string) => store.getWeeklyTimesheetsByTechId(techId),
    addWeeklyTimesheet: (timesheet: any) => store.addWeeklyTimesheet(timesheet),
    updateWeeklyTimesheetAudit: (timesheetId: string, updates: any) => store.updateWeeklyTimesheetAudit(timesheetId, updates),
    verifyWeeklyTimesheetPayment: (timesheetId: string, verification: any) => store.verifyWeeklyTimesheetPayment(timesheetId, verification),
    generateMissingWeeklyTimesheets: () => store.generateMissingWeeklyTimesheets(),
    auditLogs: store.getAuditLogs(),
    getAuditLogs: (limit?: number) => store.getAuditLogs(limit),
    getAuditLogsByEntity: (entityType: any, entityId: string) => store.getAuditLogsByEntity(entityType, entityId),
    logActivity: (...args: any[]) => (store.logActivity as Function)(...args),
    resetToDefault: () => store.resetToDefault(),
    syncAllToSupabase: () => store.syncAllToSupabase(),
    hydrateFromSupabase: () => store.hydrateFromSupabase(),
    syncWithCloud: (mode?: 'merge' | 'replace') => store.syncWithCloud(mode),
    syncState: store.getSyncState(),
  };
}


export function useActiveFSMData() {
  const store = useFSMStore();
  const archivedClientIds = new Set(store.clients.filter(c => c.isArchived).map(c => c.id));
  
  return {
    ...store,
    clients: store.clients.filter(c => !c.isArchived),
    properties: store.properties.filter(p => !archivedClientIds.has(p.clientId)),
    jobs: store.jobs.filter(j => !archivedClientIds.has(j.clientId)),
    invoices: store.invoices.filter(i => !archivedClientIds.has(i.clientId)),
    estimates: store.estimates.filter(e => !archivedClientIds.has(e.clientId)),
  };
}
