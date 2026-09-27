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
    getPropertiesByClientId: (clientId: string) => store.getPropertiesByClientId(clientId),
    getPropertyById: (id: string) => store.getPropertyById(id),
    getJobsByClientId: (clientId: string) => store.getJobsByClientId(clientId),
    getJobsByTechId: (techId: string) => store.getJobsByTechId(techId),
    getInvoicesByClientId: (clientId: string) => store.getInvoicesByClientId(clientId),
    getEstimatesByClientId: (clientId: string) => store.getEstimatesByClientId(clientId),
    getSubscriptionsByClientId: (clientId: string) => store.getSubscriptionsByClientId(clientId),
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
  };
}
