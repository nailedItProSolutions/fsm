/**
 * Phase 4: AI-Powered Technician Vault & Timesheet OCR Ingestion Tests
 * Verifies handwriting extraction schema, chronological sorting, and weekly aggregation.
 */

import {
  normalizeDate,
  computeHoursFromTimes,
  inferJobCategory,
  parseHandwrittenTimesheetText,
  sortWorkLogsChronologically,
  groupWorkLogsByCalendarWeek,
  aggregateWeeklyTimesheet,
  verifyWeeklyTimesheet,
  STANDARD_HOURLY_RATES,
  calculateNetPay,
  updateTimesheetAudit,
  SAMPLE_HANDWRITTEN_TIMESHEETS,
} from '../ocrEngine.ts';
import type { DailyWorkLog, WeeklyTimesheet, TimesheetBonus, TimesheetDeduction } from '@/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ ${testName} - ${detail || 'Assertion failed'}`);
  }
}

console.log('\n--- 1. Normalization & Helper Functions ---');
assert(normalizeDate('10/14/2024') === '2024-10-14', 'normalizes MM/DD/YYYY to YYYY-MM-DD');
assert(normalizeDate('10-15-24') === '2024-10-15', 'normalizes MM-DD-YY to YYYY-MM-DD');
assert(normalizeDate('October 16, 2024') === '2024-10-16', 'normalizes long month names to YYYY-MM-DD');
assert(normalizeDate('Oct 17, 2024') === '2024-10-17', 'normalizes short month names to YYYY-MM-DD');

assert(computeHoursFromTimes('08:00 AM', '04:30 PM') === 8.5, 'computes 8.5 hours between 08:00 AM and 04:30 PM');
assert(computeHoursFromTimes('8:30am', '4:30pm') === 8.0, 'computes 8.0 hours between 8:30am and 4:30pm');
assert(computeHoursFromTimes('09:00 AM', '05:00 PM') === 8.0, 'computes 8.0 hours between 09:00 AM and 05:00 PM');

assert(inferJobCategory('Replaced ruptured copper P-trap and soldered shutoff valve') === 'Plumbing', 'infers Plumbing category');
assert(inferJobCategory('Hung 1/2-in sheetrock, taped and applied hot mud to ceiling') === 'Drywall', 'infers Drywall category');
assert(inferJobCategory('Replaced GFCI breaker and checked Square D panel wiring') === 'Electrical', 'infers Electrical category');
assert(inferJobCategory('Cleaned condenser coils and replaced 20x25 MERV filter on heat pump') === 'HVAC', 'infers HVAC category');
assert(inferJobCategory('Installed new door casing and baseboard trim') === 'Carpentry', 'infers Carpentry category');
assert(inferJobCategory('Unit turnover, trash cleanout and lockbox re-key') === 'Turnover', 'infers Turnover category');

console.log('\n--- 2. Handwriting OCR Extraction into JSON Schema ---');
// Test Sample 1: Mike Rivera Plumbing
const sample1 = SAMPLE_HANDWRITTEN_TIMESHEETS[0];
const parsed1 = parseHandwrittenTimesheetText(sample1.rawHandwritingText);

assert(parsed1.date === '2024-10-14', 'Extracts exact Date: 2024-10-14');
assert(parsed1.startTime === '08:00 AM', 'Extracts Start Time: 08:00 AM');
assert(parsed1.stopTime === '04:30 PM', 'Extracts Stop Time: 04:30 PM');
assert(parsed1.totalHours === 8.5, 'Extracts Total Hours: 8.5');
assert(parsed1.propertyLocation.includes('4512 Oakwood Ave'), 'Extracts Property Location: 4512 Oakwood Ave');
assert(parsed1.jobCategory === 'Plumbing', 'Categorizes trade as Plumbing');
assert(parsed1.taskDetails.toLowerCase().includes('copper p-trap'), 'Extracts Task Details containing copper P-trap');
assert(parsed1.technicianName === 'Mike Rivera', 'Extracts Technician Name: Mike Rivera');
assert(parsed1.confidenceScore >= 0.9, 'Confidence score >= 90%');

// Test Sample 2: Mike Rivera Drywall (varied format)
const sample2 = SAMPLE_HANDWRITTEN_TIMESHEETS[1];
const parsed2 = parseHandwrittenTimesheetText(sample2.rawHandwritingText);
assert(parsed2.date === '2024-10-15', 'Extracts Date: 2024-10-15 from "October 15, 2024"');
assert(parsed2.startTime === '08:30 AM', 'Extracts Start Time: 08:30 AM');
assert(parsed2.stopTime === '04:30 PM', 'Extracts Stop Time: 04:30 PM');
assert(parsed2.totalHours === 8.0, 'Extracts Total Hours: 8.0');
assert(parsed2.propertyLocation.includes('1208 Westlake Dr'), 'Extracts Property: 1208 Westlake Dr');
assert(parsed2.jobCategory === 'Drywall', 'Categorizes trade as Drywall');

// Test Sample 4: David Lopez HVAC
const sample4 = SAMPLE_HANDWRITTEN_TIMESHEETS[3];
const parsed4 = parseHandwrittenTimesheetText(sample4.rawHandwritingText);
assert(parsed4.date === '2024-10-17', 'Extracts Date: 2024-10-17');
assert(parsed4.technicianName === 'David Lopez', 'Extracts Technician: David Lopez');
assert(parsed4.jobCategory === 'HVAC', 'Categorizes trade as HVAC');
assert(parsed4.totalHours === 8.0, 'Extracts Hours: 8.0');

console.log('\n--- 3. Database Chronological Sorting Logic ---');
// Create work logs uploaded intentionally in random sequence (3, 1, 4, 2)
const unorganizedLogs: DailyWorkLog[] = [
  {
    id: 'log-oct16',
    technicianId: 'user-tech-1',
    technicianName: 'Mike Rivera',
    date: '2024-10-16',
    startTime: '09:00 AM',
    stopTime: '05:00 PM',
    totalHours: 8.0,
    propertyLocation: '742 Evergreen Terrace',
    taskDetails: 'Electrical GFCI repair',
    jobCategory: 'Electrical',
    confidenceScore: 0.95,
    createdAt: '2024-10-20T12:00:00Z', // uploaded 4th
    source: 'ocr_scan',
  },
  {
    id: 'log-oct14',
    technicianId: 'user-tech-1',
    technicianName: 'Mike Rivera',
    date: '2024-10-14',
    startTime: '08:00 AM',
    stopTime: '04:30 PM',
    totalHours: 8.5,
    propertyLocation: '4512 Oakwood Ave, Building A',
    taskDetails: 'Plumbing leak repair',
    jobCategory: 'Plumbing',
    confidenceScore: 0.98,
    createdAt: '2024-10-20T10:00:00Z', // uploaded 1st
    source: 'ocr_scan',
  },
  {
    id: 'log-oct17',
    technicianId: 'user-tech-2',
    technicianName: 'David Lopez',
    date: '2024-10-17',
    startTime: '08:00 AM',
    stopTime: '04:00 PM',
    totalHours: 8.0,
    propertyLocation: '4514 Oakwood Ave',
    taskDetails: 'HVAC tune-up',
    jobCategory: 'HVAC',
    confidenceScore: 0.96,
    createdAt: '2024-10-20T11:00:00Z', // uploaded 2nd
    source: 'ocr_scan',
  },
  {
    id: 'log-oct15',
    technicianId: 'user-tech-1',
    technicianName: 'Mike Rivera',
    date: '2024-10-15',
    startTime: '08:30 AM',
    stopTime: '04:30 PM',
    totalHours: 8.0,
    propertyLocation: '1208 Westlake Dr',
    taskDetails: 'Drywall ceiling patch',
    jobCategory: 'Drywall',
    confidenceScore: 0.94,
    createdAt: '2024-10-20T11:30:00Z', // uploaded 3rd
    source: 'ocr_scan',
  },
];

const sortedAsc = sortWorkLogsChronologically(unorganizedLogs, 'asc');
assert(sortedAsc[0].date === '2024-10-14', 'First sorted log is Oct 14');
assert(sortedAsc[1].date === '2024-10-15', 'Second sorted log is Oct 15');
assert(sortedAsc[2].date === '2024-10-16', 'Third sorted log is Oct 16');
assert(sortedAsc[3].date === '2024-10-17', 'Fourth sorted log is Oct 17');
assert(sortedAsc[0].id === 'log-oct14', 'Maintains accurate log reference ID');

const sortedDesc = sortWorkLogsChronologically(unorganizedLogs, 'desc');
assert(sortedDesc[0].date === '2024-10-17', 'Reverse chronological sorts Oct 17 first');
assert(sortedDesc[3].date === '2024-10-14', 'Reverse chronological sorts Oct 14 last');

console.log('\n--- 4. Tamper-Proof Weekly Timesheet Aggregation & Locking ---');
// Filter logs for Mike Rivera (Oct 14, 15, 16)
const mikesLogs = unorganizedLogs.filter((l) => l.technicianId === 'user-tech-1');
const groupedWeeks = groupWorkLogsByCalendarWeek(mikesLogs);

assert(groupedWeeks.size === 1, 'All logs correctly grouped into single calendar week');

const weekKey = Array.from(groupedWeeks.keys())[0];
const weekLogs = groupedWeeks.get(weekKey)!;
const weeklyTimesheet = aggregateWeeklyTimesheet(weekLogs, 'user-tech-1', 'Mike Rivera', 35.0);

assert(weeklyTimesheet.totalHours === 24.5, 'Aggregates exact total hours: 24.5 hrs (8.5 + 8.0 + 8.0)');
assert(weeklyTimesheet.totalGrossPay === 857.5, 'Computes total gross pay: $857.50 (24.5 hrs × $35/hr)');
assert(weeklyTimesheet.dailyLogIds.length === 3, 'Contains 3 daily work log IDs');
assert(weeklyTimesheet.status === 'pending_review', 'Status initialized to pending_review');
assert(weeklyTimesheet.locked === false, 'Initially unlocked before payment verification');

// Simulate Admin attaching Payment Verification (Check Image / Receipt)
const verifiedTimesheet = verifyWeeklyTimesheet(weeklyTimesheet, {
  checkNumber: 'CHK-94821',
  amount: 857.5,
  paymentDate: '2024-10-21',
  paymentMethod: 'check',
  checkImageUrl: '/mock_checks/check_94821_mike_rivera.jpg',
  notes: 'Issued Floyd County First National Bank business payroll check',
  verifiedBy: 'Sarah Jenkins (Admin)',
});

assert(verifiedTimesheet.status === 'verified_paid', 'Status updated to verified_paid');
assert(verifiedTimesheet.locked === true, 'Weekly timesheet is permanently LOCKED');
assert(verifiedTimesheet.paymentVerification?.checkNumber === 'CHK-94821', 'Check number CHK-94821 permanently attached');
assert(verifiedTimesheet.paymentVerification?.verifiedBy === 'Sarah Jenkins (Admin)', 'Verified by admin Sarah Jenkins');
assert(Boolean(verifiedTimesheet.paymentVerification?.verifiedAt), 'Timestamp recorded for payment lock');

console.log('\n--- 5. Editable Hourly Pay Presets, Bonuses, Deductions & Bold Net Pay Audit ---');
// 5.1 Hourly Rate Presets
assert(STANDARD_HOURLY_RATES.includes(15), 'Includes $15/hr preset option');
assert(STANDARD_HOURLY_RATES.includes(19), 'Includes $19/hr preset option');
assert(STANDARD_HOURLY_RATES.includes(20), 'Includes $20/hr preset option');
assert(STANDARD_HOURLY_RATES.includes(24), 'Includes $24/hr preset option');
assert(STANDARD_HOURLY_RATES.includes(25), 'Includes $25/hr preset option');
assert(STANDARD_HOURLY_RATES.includes(35), 'Includes $35/hr preset option');
assert(STANDARD_HOURLY_RATES.length === 6, 'Contains all 6 specified preset options');

// 5.2 Net Pay Calculation Helper
const bonusSample: TimesheetBonus[] = [
  {
    id: 'b-1',
    description: 'Emergency HVAC Weekend Callout',
    amount: 150.0,
    propertyOwner: 'Apex Property Management',
  },
  {
    id: 'b-2',
    description: 'On-time turnover completion incentive',
    amount: 50.0,
    propertyOwner: 'Sarah Jenkins',
  },
];

const deductSample: TimesheetDeduction[] = [
  {
    id: 'd-1',
    description: 'Milwaukee Fuel Drill Advance',
    amount: 120.0,
    amountPaid: 60.0,
    remainingBalance: 60.0,
  },
];

const calcResult = calculateNetPay(1000.0, bonusSample, deductSample);
assert(calcResult.totalBonuses === 200.0, 'Calculates exact total bonuses: $200.00');
assert(calcResult.totalDeductions === 60.0, 'Calculates exact deductions paid: $60.00');
assert(calcResult.netPay === 1140.0, 'Calculates exact Bold Net Pay: $1,140.00 ($1,000 + $200 - $60)');

// 5.3 Audit Flow on Unlocked Timesheet: Rate adjustment, bonuses, deductions
// Take a draft/pending timesheet with 20.0 total hours initially at $35.0/hr
const baseTimesheet: WeeklyTimesheet = {
  id: 'timesheet-2024-W40-user-tech-1',
  technicianId: 'user-tech-1',
  technicianName: 'Mike Rivera',
  weekNumber: 40,
  year: 2024,
  weekStartDate: '2024-09-30',
  weekEndDate: '2024-10-06',
  dailyLogIds: ['log-test-1', 'log-test-2'],
  totalHours: 20.0,
  hourlyRate: 35.0,
  totalGrossPay: 700.0,
  status: 'pending_review',
  locked: false,
  createdAt: '2024-10-06T18:00:00Z',
  updatedAt: '2024-10-06T18:00:00Z',
  netPay: 700.0,
};

// Admin adjusts rate to $24/hr (one of the preset rates), adds bonus with property owner, adds deduction
const auditedTimesheet = updateTimesheetAudit(baseTimesheet, {
  hourlyRate: 24.0,
  bonuses: bonusSample,
  deductions: deductSample,
  auditConfirmed: true,
  auditConfirmedBy: 'Sarah Jenkins (Admin)',
});

// Verify updated values:
// Hours: 20.0, Hourly Rate: $24.00 -> Gross Pay = $480.00
assert(auditedTimesheet.hourlyRate === 24.0, 'Updated hourly rate to $24.00/hr preset');
assert(auditedTimesheet.totalGrossPay === 480.0, 'Recalculates gross pay: $480.00 (20.0 hrs × $24/hr)');
assert(auditedTimesheet.totalBonuses === 200.0, 'Attaches total bonuses: $200.00');
assert(auditedTimesheet.bonuses?.[0].propertyOwner === 'Apex Property Management', 'Preserves bonus property owner');
assert(auditedTimesheet.totalDeductions === 60.0, 'Attaches total deductions paid: $60.00');
assert(auditedTimesheet.deductions?.[0].remainingBalance === 60.0, 'Preserves deduction remaining balance');
assert(auditedTimesheet.netPay === 620.0, 'Calculates and renders Bold Net Pay: $620.00 ($480 + $200 - $60)');
assert(auditedTimesheet.auditConfirmed === true, 'Sets auditConfirmed flag to true');
assert(Boolean(auditedTimesheet.auditConfirmedAt), 'Records audit confirmation timestamp');

console.log(`\n========================================`);
console.log(`Total Tests: ${passed + failed}`);
console.log(`Passed:      ${passed}`);
console.log(`Failed:      ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
