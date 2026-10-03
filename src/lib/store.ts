import { Client, Property, Job, Estimate, Invoice, UserProfile, UserRole, Subscription, DailyWorkLog, WeeklyTimesheet, PaymentVerification, TimesheetBonus, TimesheetDeduction, AuditLog, AuditActionType, AuditEntityType } from '@/types';
import { sortWorkLogsChronologically, aggregateWeeklyTimesheet, verifyWeeklyTimesheet, updateTimesheetAudit, groupWorkLogsByCalendarWeek } from './ocrEngine';

// Seed Initial Data
export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user-admin-1',
    email: 'admin@nailedit.com',
    displayName: 'Brianna Cronan - HR Mgr',
    role: 'admin',
    phone: '(512) 555-0100',
    employeeId: '1019974',
    pin: '8572',
    active: true,
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    uid: 'user-tech-1',
    email: 'mike@nailedit.com',
    displayName: 'Mike Rivera',
    role: 'technician',
    phone: '(512) 555-0101',
    employeeId: 'TECH-101',
    pin: '4592',
    telegramChatId: '839201948',
    active: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    uid: 'user-tech-2',
    email: 'david@nailedit.com',
    displayName: 'David Lopez',
    role: 'technician',
    phone: '(512) 555-0102',
    employeeId: 'TECH-102',
    pin: '1048',
    telegramChatId: '948172635',
    active: true,
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    uid: 'user-client-1',
    email: 'david@apexpm.com',
    displayName: 'David Chen (Landlord / Investor)',
    role: 'client',
    phone: '(512) 883-9921',
    clientId: 'client-1',
    active: true,
    createdAt: '2024-01-12T10:00:00Z',
  },
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    clientId: 'client-1',
    label: 'Oakwood Apartments (Building A)',
    street: '4512 Oakwood Ave',
    unit: 'Building A, Units 101-104',
    city: 'Austin',
    state: 'TX',
    zip: '78751',
    gateCode: '#4592',
    accessInstructions: 'Key lockbox on north utility door. Code 4592.',
    serviceHistoryJobIds: ['job-1', 'job-4', 'job-pm-1'],
    createdAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 'prop-2',
    clientId: 'client-1',
    label: 'Oakwood Apartments (Building B)',
    street: '4514 Oakwood Ave',
    unit: 'Building B, Units 201-204',
    city: 'Austin',
    state: 'TX',
    zip: '78751',
    gateCode: '#4592',
    accessInstructions: 'Contact on-site super Jim before entering crawl space.',
    serviceHistoryJobIds: [],
    createdAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 'prop-3',
    clientId: 'client-1',
    label: 'Westlake Duplex',
    street: '1208 Westlake Dr',
    unit: 'Unit 2',
    city: 'Austin',
    state: 'TX',
    zip: '78746',
    gateCode: '8821',
    accessInstructions: 'Ring doorbell twice. Tenant has friendly Golden Retriever.',
    serviceHistoryJobIds: ['job-5'],
    createdAt: '2024-02-14T11:00:00Z',
  },
  {
    id: 'prop-4',
    clientId: 'client-2',
    label: 'Primary Residence',
    street: '742 Evergreen Terrace',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
    accessInstructions: 'Side gate is unlocked. Water main shutoff is on south wall.',
    serviceHistoryJobIds: ['job-2'],
    createdAt: '2024-02-10T09:30:00Z',
  },
  {
    id: 'prop-5',
    clientId: 'client-3',
    label: 'Rental Home #1',
    street: '883 Westgate Dr',
    city: 'Austin',
    state: 'TX',
    zip: '78745',
    gateCode: 'Key in Lockbox',
    accessInstructions: 'Code 1984. Vacant property between tenants.',
    serviceHistoryJobIds: ['job-3'],
    createdAt: '2024-03-01T14:00:00Z',
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    isCompany: true,
    companyName: 'Apex Property Management',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david@apexpm.com',
    phone: '(512) 883-9921',
    billingAddress: {
      street: '100 Congress Ave',
      unit: 'Suite 800',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
    propertyIds: ['prop-1', 'prop-2', 'prop-3'],
    notes: 'Manages 18 rental units across Austin. Net-30 invoicing preferred.',
    totalSpent: 18450,
    activeJobsCount: 2,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'client-2',
    isCompany: false,
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.j@gmail.com',
    phone: '(512) 554-1299',
    billingAddress: {
      street: '742 Evergreen Terrace',
      city: 'Austin',
      state: 'TX',
      zip: '78704',
    },
    propertyIds: ['prop-4'],
    notes: 'Referred by Tom in South Austin. Wants seasonal maintenance checkups.',
    totalSpent: 2450,
    activeJobsCount: 1,
    createdAt: '2024-02-10T09:30:00Z',
    updatedAt: '2024-03-20T12:00:00Z',
  },
  {
    id: 'client-3',
    isCompany: false,
    firstName: 'Robert',
    lastName: 'Miller',
    email: 'rmiller78@outlook.com',
    phone: '(512) 441-3380',
    billingAddress: {
      street: '883 Westgate Dr',
      city: 'Austin',
      state: 'TX',
      zip: '78745',
    },
    propertyIds: ['prop-5'],
    notes: 'Out-of-state landlord. Always needs high-res before/after photos emailed.',
    totalSpent: 4120,
    activeJobsCount: 1,
    createdAt: '2024-03-01T14:00:00Z',
    updatedAt: '2024-03-22T08:30:00Z',
  },
  {
    id: 'client-4',
    isCompany: false,
    firstName: 'Elena',
    lastName: 'Rodriguez',
    email: 'elena.rodriguez@gmail.com',
    phone: '(512) 779-1144',
    billingAddress: {
      street: '2105 Riverstone Way',
      city: 'Austin',
      state: 'TX',
      zip: '78731',
    },
    propertyIds: [],
    notes: 'High-end remodel consultation requested for kitchen & primary bath.',
    totalSpent: 0,
    activeJobsCount: 0,
    createdAt: '2024-03-25T16:00:00Z',
    updatedAt: '2024-03-25T16:00:00Z',
  },
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-emergency-1',
    jobNumber: 'JOB-1044',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-1',
    propertyAddress: '4512 Oakwood Ave (Bldg A, Unit 201), Austin, TX',
    assignedTechId: 'user-tech-1',
    assignedTechName: 'Mike Rivera',
    title: '🚨 EMERGENCY: Active Second-Floor Supply Pipe Burst Flooding Unit 101',
    description: 'Catastrophic water line rupture under bathroom vanity. Main riser shutoff required immediately. Water spreading into unit below.',
    status: 'in_progress',
    priority: 'emergency',
    scheduledDate: new Date().toISOString().split('T')[0],
    timeWindowStart: '08:00',
    timeWindowEnd: '10:00',
    checklist: [
      { id: 'em-1', text: 'Shut off main water riser in utility closet (Bldg A north)', done: true },
      { id: 'em-2', text: 'Extract standing water & set commercial dehumidifiers', done: true },
      { id: 'em-3', text: 'Replace ruptured 1/2" copper supply coupling & pressure test', done: false },
      { id: 'em-4', text: 'Cut out wet drywall ceiling in Unit 101 below to prevent mold', done: false },
    ],
    photosBefore: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    ],
    photosAfter: [],
    notes: '24/7 Emergency response dispatched via Telegram Bot to Mike Rivera. Water main key is on utility wall.',
    totalAmount: 850.00,
    createdAt: '2026-09-26T08:15:00Z',
  },
  {
    id: 'job-1',
    jobNumber: 'JOB-1041',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-1',
    propertyAddress: '4512 Oakwood Ave (Bldg A), Austin, TX',
    assignedTechId: 'user-tech-1',
    assignedTechName: 'Mike Rivera',
    title: 'Drywall Patching & Water Leak Inspection',
    description: 'Unit 102 bathroom ceiling dry rot repair after second-floor supply line leak.',
    status: 'in_progress',
    priority: 'high',
    scheduledDate: new Date().toISOString().split('T')[0],
    timeWindowStart: '09:00',
    timeWindowEnd: '12:00',
    checklist: [
      { id: 'c1', text: 'Moisture meter reading on ceiling joists', done: true },
      { id: 'c2', text: 'Cut away damaged drywall section', done: true },
      { id: 'c3', text: 'Install backing cleats & new purple board', done: false },
      { id: 'c4', text: 'Tape, mud, sand, and apply knock-down texture match', done: false },
    ],
    photosBefore: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    ],
    photosAfter: [],
    estimateId: 'est-1',
    notes: 'Property manager requested photo confirmation before final mud coat.',
    totalAmount: 485.00,
    createdAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'job-turnover-1',
    jobNumber: 'JOB-1049',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-1',
    propertyAddress: '4512 Oakwood Ave (Unit 104), Austin, TX',
    assignedTechId: 'user-tech-1',
    assignedTechName: 'Mike Rivera',
    title: 'Apartment Turnover: Standardized Make-Ready Protocol',
    description: 'Full unit turn between tenants. Execute 7-point standardized turnover checklist and document after completion photo.',
    status: 'in_progress',
    priority: 'high',
    scheduledDate: new Date().toISOString().split('T')[0],
    timeWindowStart: '14:00',
    timeWindowEnd: '17:00',
    checklist: [
      { id: 't-1', text: 'HVAC Filter Replacement & Blower Vent Inspection', done: true },
      { id: 't-2', text: 'Re-key Exterior Entry Deadbolts & Verify Master Key', done: true },
      { id: 't-3', text: 'Drywall Patch & Paint Inspection (Walls, Baseboards & Ceiling)', done: false },
      { id: 't-4', text: 'Smoke & Carbon Monoxide Detector Functional Testing', done: false },
      { id: 't-5', text: 'Plumbing Supply Stop, P-Trap & Toilet Flapper Leak Inspection', done: false },
      { id: 't-6', text: 'Appliance Cleanliness & Refrigerator Coil Check', done: false },
      { id: 't-7', text: 'Window Locks & Weatherstripping Integrity Verification', done: false },
    ],
    photosBefore: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    ],
    photosAfter: [],
    notes: 'Key in lockbox 4592. Apex Property Management requires full turnover checklist and after photo verification.',
    totalAmount: 450.00,
    createdAt: '2026-09-26T12:00:00Z',
  },
  {
    id: 'job-turnover-2',
    jobNumber: 'JOB-1050',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-3',
    propertyAddress: '1208 Westlake Dr (Unit 3), Austin, TX',
    assignedTechId: 'user-tech-1',
    assignedTechName: 'Mike Rivera',
    title: 'Turnover Service: Move-In Ready QA Audit',
    description: 'Final turnover verification. All 7 standard turnover punch-list tasks completed and verified with photographic evidence.',
    status: 'in_progress',
    priority: 'medium',
    scheduledDate: new Date().toISOString().split('T')[0],
    timeWindowStart: '15:30',
    timeWindowEnd: '18:00',
    checklist: [
      { id: 't-21', text: 'HVAC Filter Replacement & Blower Vent Inspection', done: true },
      { id: 't-22', text: 'Re-key Exterior Entry Deadbolts & Verify Master Key', done: true },
      { id: 't-23', text: 'Drywall Patch & Paint Inspection (Walls, Baseboards & Ceiling)', done: true },
      { id: 't-24', text: 'Smoke & Carbon Monoxide Detector Functional Testing', done: true },
      { id: 't-25', text: 'Plumbing Supply Stop, P-Trap & Toilet Flapper Leak Inspection', done: true },
      { id: 't-26', text: 'Appliance Cleanliness & Refrigerator Coil Check', done: true },
      { id: 't-27', text: 'Window Locks & Weatherstripping Integrity Verification', done: true },
    ],
    photosBefore: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    ],
    photosAfter: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    ],
    notes: 'All items checked and After photo attached. Ready for final certified completion.',
    totalAmount: 495.00,
    createdAt: '2026-09-26T13:00:00Z',
  },
  {
    id: 'job-2',
    jobNumber: 'JOB-1042',
    clientId: 'client-2',
    clientName: 'Sarah Jenkins',
    propertyId: 'prop-4',
    propertyAddress: '742 Evergreen Terrace, Austin, TX',
    assignedTechId: 'user-tech-1',
    assignedTechName: 'Mike Rivera',
    title: 'Shower Faucet Cartridge Replacement & Re-caulk',
    description: 'Moen positive temp cartridge replacement; scrape old mildewed caulk and apply mold-resistant silicone.',
    status: 'scheduled',
    priority: 'medium',
    scheduledDate: new Date().toISOString().split('T')[0],
    timeWindowStart: '13:00',
    timeWindowEnd: '15:30',
    checklist: [
      { id: 'c5', text: 'Shut off bathroom water supply stops', done: false },
      { id: 'c6', text: 'Extract worn Moen 1222 cartridge with puller', done: false },
      { id: 'c7', text: 'Re-silicone shower pan perimeter', done: false },
    ],
    photosBefore: [],
    photosAfter: [],
    notes: 'Dog is friendly, owner will be home working in office.',
    totalAmount: 245.00,
    createdAt: '2024-03-21T11:00:00Z',
  },
  {
    id: 'job-3',
    jobNumber: 'JOB-1043',
    clientId: 'client-3',
    clientName: 'Robert Miller',
    propertyId: 'prop-5',
    propertyAddress: '883 Westgate Dr, Austin, TX',
    assignedTechId: 'user-tech-2',
    assignedTechName: 'David Lopez',
    title: 'Tenant Turnover Punch-List & Lock Re-key',
    description: 'Re-key 3 exterior deadbolts, replace HVAC filters (20x25x1), patch door hinge screws.',
    status: 'scheduled',
    priority: 'medium',
    scheduledDate: new Date().toISOString().split('T')[0],
    timeWindowStart: '10:00',
    timeWindowEnd: '13:00',
    checklist: [
      { id: 'c8', text: 'Re-key front, side, and garage entry doors', done: false },
      { id: 'c9', text: 'Verify smoke and CO detectors test functional', done: false },
      { id: 'c10', text: 'Replace 2 HVAC air return filters', done: false },
    ],
    photosBefore: [],
    photosAfter: [],
    notes: 'Key is in master lockbox by front porch post.',
    totalAmount: 380.00,
    createdAt: '2024-03-22T08:30:00Z',
  },
  {
    id: 'job-4',
    jobNumber: 'JOB-1039',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-1',
    propertyAddress: '4512 Oakwood Ave (Bldg A), Austin, TX',
    assignedTechId: 'user-tech-2',
    assignedTechName: 'David Lopez',
    title: 'Commercial Gutter Clean & Downspout Snaking',
    description: 'Clean debris from north and west perimeter gutters, flush downspouts with hose.',
    status: 'completed',
    priority: 'low',
    scheduledDate: '2024-03-18',
    timeWindowStart: '08:30',
    timeWindowEnd: '11:30',
    checklist: [
      { id: 'c11', text: 'Blow out heavy roof valley leaves', done: true },
      { id: 'c12', text: 'Clear gutter troughs & bag debris', done: true },
      { id: 'c13', text: 'Water-test downspout drainage to curb', done: true },
    ],
    photosBefore: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    ],
    photosAfter: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    ],
    invoiceId: 'inv-3001',
    completedAt: '2024-03-18T11:15:00Z',
    notes: 'All downspouts flowing freely now. Full debris disposal certified.',
    totalAmount: 320.00,
    createdAt: '2024-03-15T09:00:00Z',
  },
  {
    id: 'job-5',
    jobNumber: 'JOB-1036',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-3',
    propertyAddress: '1208 Westlake Dr (Unit 2), Austin, TX',
    assignedTechId: 'user-tech-1',
    assignedTechName: 'Mike Rivera',
    title: 'Tenant Turnover Punch-List & Interior Re-paint',
    description: 'Complete apartment turnover preparation. Re-painted living area with eggshell satin, cleaned coils, replaced safety hardware.',
    status: 'completed',
    priority: 'medium',
    scheduledDate: '2024-03-10',
    timeWindowStart: '08:00',
    timeWindowEnd: '14:00',
    checklist: [
      { id: 'c14', text: 'Full wall spackle & paint touchup in living room', done: true },
      { id: 'c15', text: 'Inspect and clean refrigerator condenser coils', done: true },
      { id: 'c16', text: 'Test GFCI outlets in kitchen and bathrooms', done: true },
      { id: 'c17', text: 'Install fresh batteries in smoke and CO detectors', done: true },
    ],
    photosBefore: [
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    ],
    photosAfter: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    ],
    completedAt: '2024-03-10T13:45:00Z',
    invoiceId: 'inv-3003',
    notes: 'Turnover completed ahead of schedule. Unit is move-in ready for new tenant.',
    totalAmount: 520.00,
    createdAt: '2024-03-08T09:00:00Z',
  },
  {
    id: 'job-pm-1',
    jobNumber: 'JOB-1048',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-1',
    propertyAddress: '4512 Oakwood Ave (Bldg A), Rome, GA',
    title: 'Preventative Maintenance: Quarterly HVAC, Plumbing & Safety Audit',
    description: 'Automated monthly preventative maintenance service triggered by active $99/mo Stripe subscription renewal [sub_1Oxyz99RomeGa_apex].',
    status: 'unscheduled',
    priority: 'medium',
    scheduledDate: new Date().toISOString().split('T')[0],
    timeWindowStart: '09:00',
    timeWindowEnd: '12:00',
    checklist: [
      { id: 'c-pm-1', text: 'Replace HVAC air filters & inspect blower cage', done: false },
      { id: 'c-pm-2', text: 'Test all smoke & carbon monoxide detectors', done: false },
      { id: 'c-pm-3', text: 'Inspect under-sink plumbing stops & water heater pressure relief valve', done: false },
      { id: 'c-pm-4', text: 'Exterior perimeter gutter & downspout visual inspection', done: false },
    ],
    photosBefore: [],
    photosAfter: [],
    notes: 'Auto-dispatched via Stripe Subscription renewal webhook (sub_1Oxyz99RomeGa_apex)',
    totalAmount: 99.00,
    createdAt: '2026-09-26T10:00:00Z',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-3001',
    invoiceNumber: 'INV-3001',
    jobId: 'job-4',
    jobNumber: 'JOB-1039',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-1',
    propertyAddress: '4512 Oakwood Ave, Austin, TX',
    items: [
      { id: 'ii-1', description: 'Gutter & Roof Valley Clearing (Multi-family Bldg)', quantity: 1, unitPrice: 280, total: 280 },
      { id: 'ii-2', description: 'Downspout Hydro-Flush & Snaking', quantity: 1, unitPrice: 40, total: 40 },
    ],
    subtotal: 320,
    tax: 26.40,
    total: 346.40,
    amountPaid: 346.40,
    balanceDue: 0,
    status: 'paid',
    dueDate: '2024-04-18',
    paidAt: '2024-03-19T14:22:00Z',
    createdAt: '2024-03-18T12:00:00Z',
  },
  {
    id: 'inv-3002',
    invoiceNumber: 'INV-3002',
    jobId: 'job-1',
    jobNumber: 'JOB-1041',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-1',
    propertyAddress: '4512 Oakwood Ave, Austin, TX',
    items: [
      { id: 'ii-3', description: 'Drywall Repair & Texture Match (Labor)', quantity: 3.5, unitPrice: 85, total: 297.50 },
      { id: 'ii-4', description: 'Materials: Moisture resistant drywall, joint compound, primer', quantity: 1, unitPrice: 95, total: 95.00 },
    ],
    subtotal: 392.50,
    tax: 32.38,
    total: 424.88,
    amountPaid: 0,
    balanceDue: 424.88,
    status: 'sent',
    dueDate: '2024-04-20',
    createdAt: '2024-03-20T11:00:00Z',
  },
  {
    id: 'inv-3003',
    invoiceNumber: 'INV-3003',
    jobId: 'job-5',
    jobNumber: 'JOB-1036',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-3',
    propertyAddress: '1208 Westlake Dr, Austin, TX',
    items: [
      { id: 'ii-5', description: 'Turnover Prep & Wall Re-finishing (Labor)', quantity: 4.5, unitPrice: 85, total: 382.50 },
      { id: 'ii-6', description: 'Paint, primer, GFCI receptacles & 9V batteries', quantity: 1, unitPrice: 137.50, total: 137.50 },
    ],
    subtotal: 520.00,
    tax: 42.90,
    total: 562.90,
    amountPaid: 562.90,
    balanceDue: 0,
    status: 'paid',
    dueDate: '2024-04-10',
    paidAt: '2024-03-11T10:15:00Z',
    createdAt: '2024-03-10T14:00:00Z',
  }
];

export const INITIAL_ESTIMATES: Estimate[] = [
  {
    id: 'est-201',
    estimateNumber: 'EST-2024-101',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-1',
    propertyAddress: '4512 Oakwood Ave, Rome, GA',
    items: [
      { id: 'ei-1', type: 'labor', description: 'Commercial Gutter & Downspout Clean (Full Building)', quantity: 4, unitPrice: 85, total: 340 },
      { id: 'ei-2', type: 'material', description: 'Heavy Duty Leaf Guards (200 linear ft)', quantity: 1, unitPrice: 280, total: 280 },
      { id: 'ei-3', type: 'flat_rate', description: 'Two-Year Warranty & Semiannual Inspection', quantity: 1, unitPrice: 150, total: 150 },
    ],
    subtotal: 770.00,
    taxRate: 0.07,
    taxAmount: 53.90,
    total: 823.90,
    status: 'approved',
    convertedToJobId: 'job-1',
    validUntil: '2026-11-30',
    createdAt: '2024-03-10T10:00:00Z',
  },
  {
    id: 'est-202',
    estimateNumber: 'EST-2024-102',
    clientId: 'client-2',
    clientName: 'Sarah Jenkins',
    propertyId: 'prop-4',
    propertyAddress: '742 Evergreen Terrace, Rome, GA',
    items: [
      { id: 'ei-4', type: 'labor', description: 'Master Bath Shower Pan Re-grout & Mold Remediation', quantity: 3.5, unitPrice: 90, total: 315 },
      { id: 'ei-5', type: 'material', description: 'Commercial Epoxy Grout & Color-Match Silicone', quantity: 2, unitPrice: 45, total: 90 },
    ],
    subtotal: 405.00,
    taxRate: 0.07,
    taxAmount: 28.35,
    total: 433.35,
    status: 'sent',
    validUntil: '2026-10-31',
    createdAt: '2024-03-22T14:30:00Z',
    marketComparison: {
      trade: 'plumbing',
      tradeLabel: 'Plumbing & Bathroom Moisture Remediation',
      romeLowEstimate: 395.00,
      romeMedianEstimate: 475.00,
      romeHighEstimate: 585.00,
      customerDollarSavings: 41.65,
      percentBelowMedian: 8.8,
    },
  },
  {
    id: 'est-203',
    estimateNumber: 'EST-2024-103',
    clientId: 'client-3',
    clientName: 'Robert Miller',
    propertyId: 'prop-5',
    propertyAddress: '883 Westgate Dr, Rome, GA',
    items: [
      { id: 'ei-6', type: 'labor', description: 'Full Rental Turnover Interior Paint (Walls & Trim)', quantity: 12, unitPrice: 75, total: 900 },
      { id: 'ei-7', type: 'material', description: 'Sherwin-Williams Cashmere Low-Lustre (5 Gal)', quantity: 2, unitPrice: 165, total: 330 },
      { id: 'ei-8', type: 'flat_rate', description: 'HVAC Vent Pressure Cleaning & Sanitization', quantity: 1, unitPrice: 200, total: 200 },
    ],
    subtotal: 1430.00,
    taxRate: 0.07,
    taxAmount: 100.10,
    total: 1530.10,
    status: 'draft',
    validUntil: '2026-12-15',
    createdAt: '2024-03-24T09:15:00Z',
  }
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-101',
    clientId: 'client-1',
    clientName: 'Apex Property Management',
    propertyId: 'prop-1',
    propertyAddress: '4512 Oakwood Ave, Rome, GA',
    planName: 'Preventative Maintenance Plan ($99/mo)',
    amount: 99.00,
    billingInterval: 'month',
    status: 'active',
    stripeSubscriptionId: 'sub_1Oxyz99RomeGa_apex',
    currentPeriodStart: '2026-09-01T00:00:00Z',
    currentPeriodEnd: '2026-10-01T00:00:00Z',
    autoDispatchEnabled: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-102',
    clientId: 'client-2',
    clientName: 'Sarah Jenkins',
    propertyId: 'prop-4',
    propertyAddress: '742 Evergreen Terrace, Rome, GA',
    planName: 'Preventative Maintenance Plan ($99/mo)',
    amount: 99.00,
    billingInterval: 'month',
    status: 'active',
    stripeSubscriptionId: 'sub_1Oxyz99RomeGa_sarah',
    currentPeriodStart: '2026-09-15T00:00:00Z',
    currentPeriodEnd: '2026-10-15T00:00:00Z',
    autoDispatchEnabled: true,
    createdAt: '2026-03-15T00:00:00Z',
  }
];

// Phase 4: Initial Scanned Daily Work Logs & Weekly Timesheets
export const INITIAL_DAILY_WORK_LOGS: DailyWorkLog[] = [
  {
    id: 'log-101',
    technicianId: 'user-tech-1',
    technicianName: 'Mike Rivera',
    date: '2024-10-14',
    startTime: '08:00 AM',
    stopTime: '04:30 PM',
    totalHours: 8.5,
    propertyLocation: '4512 Oakwood Ave, Building A',
    propertyId: 'prop-1',
    taskDetails: 'Replaced ruptured copper P-trap under master bathroom vanity. Soldered brass ball valve, pressure tested to 60 PSI.',
    jobCategory: 'Plumbing',
    confidenceScore: 0.98,
    source: 'ocr_scan',
    weeklyTimesheetId: 'timesheet-2024-W42-user-tech-1',
    createdAt: '2024-10-14T17:00:00Z',
  },
  {
    id: 'log-102',
    technicianId: 'user-tech-1',
    technicianName: 'Mike Rivera',
    date: '2024-10-15',
    startTime: '08:30 AM',
    stopTime: '04:30 PM',
    totalHours: 8.0,
    propertyLocation: '1208 Westlake Dr, Unit 2',
    propertyId: 'prop-3',
    taskDetails: 'Repaired hallway ceiling drywall following AC overflow leak. Installed 1/2-in drywall patch and taped 45-min hot mud.',
    jobCategory: 'Drywall',
    confidenceScore: 0.96,
    source: 'ocr_scan',
    weeklyTimesheetId: 'timesheet-2024-W42-user-tech-1',
    createdAt: '2024-10-15T17:00:00Z',
  },
  {
    id: 'log-103',
    technicianId: 'user-tech-2',
    technicianName: 'David Lopez',
    date: '2024-10-15',
    startTime: '08:00 AM',
    stopTime: '04:00 PM',
    totalHours: 8.0,
    propertyLocation: '4514 Oakwood Ave, Building B',
    propertyId: 'prop-2',
    taskDetails: 'Seasonal preventative maintenance on 3-ton heat pump. Cleaned condenser coils, replaced 20x25 MERV 11 filter and cleared drain.',
    jobCategory: 'HVAC',
    confidenceScore: 0.95,
    source: 'ocr_scan',
    createdAt: '2024-10-15T16:30:00Z',
  },
  {
    id: 'log-104',
    technicianId: 'user-tech-1',
    technicianName: 'Mike Rivera',
    date: '2024-10-16',
    startTime: '09:00 AM',
    stopTime: '05:00 PM',
    totalHours: 8.0,
    propertyLocation: '742 Evergreen Terrace',
    propertyId: 'prop-4',
    taskDetails: 'Kitchen island circuit diagnosis. Replaced tripped 20A GFCI receptacle and re-balanced panel breaker load.',
    jobCategory: 'Electrical',
    confidenceScore: 0.97,
    source: 'ocr_scan',
    weeklyTimesheetId: 'timesheet-2024-W42-user-tech-1',
    createdAt: '2024-10-16T17:30:00Z',
  },
  {
    id: 'log-105',
    technicianId: 'user-tech-2',
    technicianName: 'David Lopez',
    date: '2024-10-17',
    startTime: '08:00 AM',
    stopTime: '04:00 PM',
    totalHours: 8.0,
    propertyLocation: '4512 Oakwood Ave, Building A',
    propertyId: 'prop-1',
    taskDetails: 'Exterior cedar siding repair and replacement of rotted south-facing window casing trim. Primed and sealed with exterior silicone.',
    jobCategory: 'Carpentry',
    confidenceScore: 0.94,
    source: 'ocr_scan',
    createdAt: '2024-10-17T16:45:00Z',
  },
  {
    id: 'log-106',
    technicianId: 'user-tech-1',
    technicianName: 'Mike Rivera',
    date: '2024-10-18',
    startTime: '08:30 AM',
    stopTime: '04:00 PM',
    totalHours: 7.5,
    propertyLocation: '883 Westgate Dr',
    propertyId: 'prop-5',
    taskDetails: 'Tenant turnover punch-list: smoke detector battery replacements, door lockbox installation, interior touch-up and debris sweep.',
    jobCategory: 'Turnover',
    confidenceScore: 0.99,
    source: 'ocr_scan',
    weeklyTimesheetId: 'timesheet-2024-W42-user-tech-1',
    createdAt: '2024-10-18T16:30:00Z',
  },
];

export const INITIAL_WEEKLY_TIMESHEETS: WeeklyTimesheet[] = [
  {
    id: 'timesheet-2024-W42-user-tech-1',
    technicianId: 'user-tech-1',
    technicianName: 'Mike Rivera',
    weekNumber: 42,
    year: 2024,
    weekStartDate: '2024-10-14',
    weekEndDate: '2024-10-20',
    dailyLogIds: ['log-101', 'log-102', 'log-104', 'log-106'],
    totalHours: 32.0,
    hourlyRate: 35.0,
    totalGrossPay: 1120.0,
    bonuses: [
      {
        id: 'bonus-101',
        description: 'Emergency Weekend Water Leak Callout Bonus',
        amount: 50.0,
        propertyOwner: 'Apex Property Management',
        propertyId: 'prop-1',
      },
    ],
    totalBonuses: 50.0,
    deductions: [
      {
        id: 'deduct-101',
        description: 'Milwaukee M18 Tool Advance Repayment',
        amount: 100.0,
        amountPaid: 50.0,
        remainingBalance: 50.0,
      },
    ],
    totalDeductions: 50.0,
    netPay: 1120.0, // 1120 gross + 50 bonus - 50 deduction = 1120 net
    auditConfirmed: true,
    auditConfirmedAt: '2024-10-21T10:00:00Z',
    auditConfirmedBy: 'Brianna Cronan - HR Mgr',
    status: 'verified_paid',
    locked: true,
    paymentVerification: {
      id: 'pay-verif-1001',
      checkNumber: 'CHK-94821',
      amount: 1120.0,
      paymentDate: '2024-10-21',
      paymentMethod: 'check',
      checkImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      notes: 'Floyd County First National Bank Payroll Check #CHK-94821 issued to Mike Rivera. Cleared on 10/22/2024.',
      verifiedBy: 'Brianna Cronan - HR Mgr',
      verifiedAt: '2024-10-21T14:30:00Z',
    },
    createdAt: '2024-10-20T18:00:00Z',
    updatedAt: '2024-10-21T14:30:00Z',
  },
  {
    id: 'timesheet-2024-W42-user-tech-2',
    technicianId: 'user-tech-2',
    technicianName: 'David Lopez',
    weekNumber: 42,
    year: 2024,
    weekStartDate: '2024-10-14',
    weekEndDate: '2024-10-20',
    dailyLogIds: ['log-103', 'log-105'],
    totalHours: 16.0,
    hourlyRate: 35.0,
    totalGrossPay: 560.0,
    bonuses: [],
    totalBonuses: 0,
    deductions: [],
    totalDeductions: 0,
    netPay: 560.0,
    auditConfirmed: false,
    status: 'pending_review',
    locked: false,
    createdAt: '2024-10-20T18:00:00Z',
    updatedAt: '2024-10-20T18:00:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-seed-1',
    employeeId: '1019974',
    employeeName: 'Brianna Cronan - HR Mgr',
    employeeRole: 'admin',
    actionType: 'payment_verify',
    entityType: 'timesheet',
    entityId: 'timesheet-2024-W42-user-tech-1',
    entityTitle: 'Mike Rivera - Week 42 Payroll',
    summary: 'Attached verified Check #CHK-94821 and locked weekly timesheet',
    previousState: { status: 'pending_review', locked: false },
    newState: { status: 'verified_paid', locked: true, checkNumber: 'CHK-94821' },
    timestamp: '2024-10-21T14:30:00Z',
  },
  {
    id: 'audit-seed-2',
    employeeId: 'TECH-101',
    employeeName: 'Mike Rivera',
    employeeRole: 'technician',
    actionType: 'checklist_toggle',
    entityType: 'job',
    entityId: 'job-turnover-1',
    entityTitle: 'JOB-1049: Standardized Make-Ready Protocol',
    summary: 'Completed turnover checklist item: Re-key Exterior Deadbolts & Master Key Verification',
    previousState: { checklistItemId: 't-2', done: false },
    newState: { checklistItemId: 't-2', done: true },
    timestamp: '2026-09-26T14:15:00Z',
  },
  {
    id: 'audit-seed-3',
    employeeId: '1019974',
    employeeName: 'Brianna Cronan - HR Mgr',
    employeeRole: 'admin',
    actionType: 'status_change',
    entityType: 'job',
    entityId: 'job-1',
    entityTitle: 'JOB-1042: Ruptured Copper Pipe Emergency',
    summary: 'Job status transitioned from unscheduled to in_progress and assigned to Mike Rivera',
    previousState: { status: 'unscheduled', assignedTechId: null },
    newState: { status: 'in_progress', assignedTechId: 'user-tech-1' },
    timestamp: '2026-09-26T09:30:00Z',
  },
  {
    id: 'audit-seed-4',
    employeeId: '1019974',
    employeeName: 'Brianna Cronan - HR Mgr',
    employeeRole: 'admin',
    actionType: 'create',
    entityType: 'client',
    entityId: 'client-1',
    entityTitle: 'Apex Property Management',
    summary: 'Created new commercial client profile for Apex Property Management (David Chen)',
    newState: { clientId: 'client-1', propertiesCount: 3 },
    timestamp: '2024-01-12T10:00:00Z',
  },
];

// In-Memory / LocalStorage State Store Helper
const STORAGE_KEY = 'nailed_it_fsm_store_v10';

export class FSMStore {
  private static instance: FSMStore;
  private clients: Client[] = INITIAL_CLIENTS;
  private properties: Property[] = INITIAL_PROPERTIES;
  private jobs: Job[] = INITIAL_JOBS;
  private invoices: Invoice[] = INITIAL_INVOICES;
  private estimates: Estimate[] = INITIAL_ESTIMATES;
  private subscriptions: Subscription[] = INITIAL_SUBSCRIPTIONS;
  private dailyWorkLogs: DailyWorkLog[] = INITIAL_DAILY_WORK_LOGS;
  private weeklyTimesheets: WeeklyTimesheet[] = INITIAL_WEEKLY_TIMESHEETS;
  private users: UserProfile[] = INITIAL_USERS;
  private auditLogs: AuditLog[] = INITIAL_AUDIT_LOGS;
  private listeners: Array<() => void> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.clients = parsed.clients || INITIAL_CLIENTS;
          this.properties = parsed.properties || INITIAL_PROPERTIES;
          this.jobs = parsed.jobs || INITIAL_JOBS;
          this.invoices = parsed.invoices || INITIAL_INVOICES;
          this.estimates = parsed.estimates || INITIAL_ESTIMATES;
          this.subscriptions = parsed.subscriptions || INITIAL_SUBSCRIPTIONS;
          this.dailyWorkLogs = parsed.dailyWorkLogs || INITIAL_DAILY_WORK_LOGS;
          this.weeklyTimesheets = parsed.weeklyTimesheets || INITIAL_WEEKLY_TIMESHEETS;
          this.users = parsed.users || INITIAL_USERS;
          this.auditLogs = parsed.auditLogs || INITIAL_AUDIT_LOGS;
        }
      } catch (e) {
        console.error('Failed to load store from localStorage', e);
      }
    }
  }

  public static getInstance(): FSMStore {
    if (!FSMStore.instance) {
      FSMStore.instance = new FSMStore();
    }
    return FSMStore.instance;
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            clients: this.clients,
            properties: this.properties,
            jobs: this.jobs,
            invoices: this.invoices,
            estimates: this.estimates,
            subscriptions: this.subscriptions,
            dailyWorkLogs: this.dailyWorkLogs,
            weeklyTimesheets: this.weeklyTimesheets,
            users: this.users,
            auditLogs: this.auditLogs,
          })
        );
      } catch (e) {
        console.error('Failed to persist store', e);
      }
    }
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  // --- Global Audit Logging Engine ---
  public logActivity(
    actionTypeOrObj: AuditActionType | {
      actionType: AuditActionType;
      entityType: AuditEntityType;
      entityId: string;
      summary?: string;
      description?: string;
      previousState?: any;
      newState?: any;
      entityTitle?: string;
    },
    entityType?: AuditEntityType,
    entityId?: string,
    summary?: string,
    previousState?: any,
    newState?: any,
    entityTitle?: string
  ): AuditLog {
    let actionType: AuditActionType;
    let finalEntityType: AuditEntityType;
    let finalEntityId: string;
    let finalSummary: string;
    let finalPrev: any;
    let finalNext: any;
    let finalTitle: string | undefined;

    if (typeof actionTypeOrObj === 'object' && actionTypeOrObj !== null) {
      actionType = actionTypeOrObj.actionType;
      finalEntityType = actionTypeOrObj.entityType;
      finalEntityId = actionTypeOrObj.entityId;
      finalSummary = actionTypeOrObj.summary || actionTypeOrObj.description || '';
      finalPrev = actionTypeOrObj.previousState;
      finalNext = actionTypeOrObj.newState;
      finalTitle = actionTypeOrObj.entityTitle;
    } else {
      actionType = actionTypeOrObj;
      finalEntityType = entityType!;
      finalEntityId = entityId!;
      finalSummary = summary || '';
      finalPrev = previousState;
      finalNext = newState;
      finalTitle = entityTitle;
    }

    let employeeId = '1019974';
    let employeeName = 'Brianna Cronan - HR Mgr';
    let employeeRole: UserRole = 'admin';

    if (typeof window !== 'undefined') {
      try {
        const userJson = localStorage.getItem('nailed_it_auth_user');
        if (userJson) {
          const parsed = JSON.parse(userJson);
          employeeId = parsed.employeeId || parsed.uid || employeeId;
          employeeName = parsed.displayName || employeeName;
          employeeRole = parsed.role || employeeRole;
        }
      } catch (e) {}
    }

    const logEntry: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      employeeId,
      employeeName,
      employeeRole,
      userName: employeeName,
      userRole: employeeRole,
      actionType,
      entityType: finalEntityType,
      entityId: finalEntityId,
      entityTitle: finalTitle,
      summary: finalSummary,
      description: finalSummary,
      previousState: finalPrev ? JSON.parse(JSON.stringify(finalPrev)) : undefined,
      newState: finalNext ? JSON.parse(JSON.stringify(finalNext)) : undefined,
      timestamp: new Date().toISOString(),
    };

    this.auditLogs.unshift(logEntry);
    this.persist();
    return logEntry;
  }

  public getAuditLogs(limit?: number): AuditLog[] {
    const sorted = [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }

  public getAuditLogsByEntity(entityType: AuditEntityType, entityId: string): AuditLog[] {
    return this.getAuditLogs().filter((l) => l.entityType === entityType && l.entityId === entityId);
  }

  // --- Clients ---
  public getClients(): Client[] {
    return [...this.clients];
  }

  public getClientById(id: string): Client | undefined {
    return this.clients.find((c) => c.id === id);
  }

    public archiveClient(id: string): void {
    const clientIndex = this.clients.findIndex(c => c.id === id);
    if (clientIndex !== -1) {
      this.clients[clientIndex].isArchived = true;
      this.logActivity('status_change', 'Client', id, 'Client archived');
      this.notifySubscribers();
    }
  }

  public unarchiveClient(id: string): void {
    const clientIndex = this.clients.findIndex(c => c.id === id);
    if (clientIndex !== -1) {
      this.clients[clientIndex].isArchived = false;
      this.logActivity('status_change', 'Client', id, 'Client unarchived');
      this.notifySubscribers();
    }
  }
  
public addClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'totalSpent' | 'activeJobsCount' | 'propertyIds'>, initialProperty?: Omit<Property, 'id' | 'clientId' | 'createdAt' | 'serviceHistoryJobIds'>): Client {
    const clientId = `client-${Date.now()}`;
    const now = new Date().toISOString();
    let propertyIds: string[] = [];

    if (initialProperty) {
      const propId = `prop-${Date.now()}`;
      const newProp: Property = {
        ...initialProperty,
        id: propId,
        clientId,
        serviceHistoryJobIds: [],
        createdAt: now,
      };
      this.properties.unshift(newProp);
      propertyIds.push(propId);
    }

    const newClient: Client = {
      ...clientData,
      id: clientId,
      propertyIds,
      totalSpent: 0,
      activeJobsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.clients.unshift(newClient);
    this.persist();
    this.logActivity(
      'create',
      'client',
      newClient.id,
      `Created client profile for ${newClient.companyName || `${newClient.firstName} ${newClient.lastName}`}`,
      undefined,
      newClient,
      newClient.companyName || `${newClient.firstName} ${newClient.lastName}`
    );
    return newClient;
  }

  // --- Properties ---
  public getProperties(): Property[] {
    return [...this.properties];
  }

  public getPropertiesByClientId(clientId: string): Property[] {
    return this.properties.filter((p) => p.clientId === clientId);
  }

  public getPropertyById(id: string): Property | undefined {
    return this.properties.find((p) => p.id === id);
  }

  public addProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'serviceHistoryJobIds'>): Property {
    const propId = `prop-${Date.now()}`;
    const newProp: Property = {
      ...propertyData,
      id: propId,
      serviceHistoryJobIds: [],
      createdAt: new Date().toISOString(),
    };

    this.properties.unshift(newProp);

    // Link to client
    const client = this.clients.find((c) => c.id === propertyData.clientId);
    if (client && !client.propertyIds.includes(propId)) {
      client.propertyIds.push(propId);
      client.updatedAt = new Date().toISOString();
    }

    this.persist();
    this.logActivity(
      'create',
      'property',
      newProp.id,
      `Added property ${newProp.street} (${newProp.label || 'Property'})`,
      undefined,
      newProp,
      newProp.street
    );
    return newProp;
  }

  // --- Jobs ---
  public getJobs(): Job[] {
    return [...this.jobs];
  }

  public getJobsByClientId(clientId: string): Job[] {
    return this.jobs.filter((j) => j.clientId === clientId);
  }

  public getJobsByPropertyId(propertyId: string): Job[] {
    return this.jobs.filter((j) => j.propertyId === propertyId);
  }

  public getJobsByTechId(techId: string): Job[] {
    return this.jobs.filter((j) => j.assignedTechId === techId);
  }

  public addJob(jobData: Omit<Job, 'id' | 'createdAt' | 'jobNumber'>): Job {
    const jobId = `job-${Date.now()}`;
    const jobNumber = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newJob: Job = {
      ...jobData,
      id: jobId,
      jobNumber,
      createdAt: new Date().toISOString(),
    };

    this.jobs.unshift(newJob);

    // Update client active jobs count
    const client = this.clients.find((c) => c.id === jobData.clientId);
    if (client && jobData.status !== 'completed' && jobData.status !== 'canceled') {
      client.activeJobsCount = (client.activeJobsCount || 0) + 1;
    }

    // Update property service history
    const property = this.properties.find((p) => p.id === jobData.propertyId);
    if (property) {
      property.serviceHistoryJobIds.push(jobId);
    }

    this.persist();
    this.logActivity(
      'create',
      'job',
      newJob.id,
      `Created job ${newJob.jobNumber}: ${newJob.title}`,
      undefined,
      newJob,
      `${newJob.jobNumber}: ${newJob.title}`
    );
    return newJob;
  }

  public getJobById(id: string): Job | undefined {
    return this.jobs.find((j) => j.id === id);
  }

  public getTechnicians(): UserProfile[] {
    return this.users.filter((u) => u.role === 'technician');
  }

  public updateJob(jobId: string, updates: Partial<Job>) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (job) {
      const prev = { ...job };
      Object.assign(job, updates);
      this.persist();
      this.logActivity(
        'update',
        'job',
        jobId,
        `Updated job details for ${job.jobNumber}`,
        prev,
        updates,
        `${job.jobNumber}: ${job.title}`
      );
    }
  }

  public toggleChecklistItem(jobId: string, itemId: string) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (job && job.checklist) {
      const item = job.checklist.find((c) => c.id === itemId);
      if (item) {
        const prevDone = item.done;
        item.done = !item.done;
        this.persist();
        this.logActivity(
          'checklist_toggle',
          'job',
          jobId,
          `Toggled checklist item "${item.text}" to ${item.done ? 'complete' : 'incomplete'}`,
          { itemId, done: prevDone },
          { itemId, done: item.done },
          `${job.jobNumber}: ${job.title}`
        );
      }
    }
  }

  public addJobPhoto(jobId: string, type: 'before' | 'after', photoUrl: string) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (job) {
      if (type === 'before') {
        job.photosBefore = [...(job.photosBefore || []), photoUrl];
      } else {
        job.photosAfter = [...(job.photosAfter || []), photoUrl];
      }
      this.persist();
      this.logActivity(
        'photo_added',
        'job',
        jobId,
        `Added ${type} work verification photo to ${job.jobNumber}`,
        undefined,
        { type, photoUrl },
        `${job.jobNumber}: ${job.title}`
      );
    }
  }

  public updateJobStatus(jobId: string, status: Job['status'], completedAt?: string) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (job) {
      const prevStatus = job.status;
      job.status = status;
      if (status === 'completed') {
        job.completedAt = completedAt || new Date().toISOString();
      }
      
      const client = this.clients.find((c) => c.id === job.clientId);
      if (client && prevStatus !== 'completed' && status === 'completed') {
        client.activeJobsCount = Math.max(0, (client.activeJobsCount || 1) - 1);
        client.totalSpent = (client.totalSpent || 0) + (job.totalAmount || 0);
      }
      this.persist();
      this.logActivity(
        'status_change',
        'job',
        jobId,
        `Status transitioned from "${prevStatus}" to "${status}" on ${job.jobNumber}`,
        { status: prevStatus },
        { status },
        `${job.jobNumber}: ${job.title}`
      );
    }
  }

  // --- Estimates ---
  public getEstimates(): Estimate[] {
    return [...this.estimates];
  }

  public getEstimateById(id: string): Estimate | undefined {
    return this.estimates.find((e) => e.id === id);
  }

  public getEstimatesByClientId(clientId: string): Estimate[] {
    return this.estimates.filter((e) => e.clientId === clientId);
  }

  public addEstimate(estimateData: Omit<Estimate, 'id' | 'createdAt' | 'estimateNumber'>): Estimate {
    const estId = `est-${Date.now()}`;
    const estimateNumber = `EST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newEst: Estimate = {
      ...estimateData,
      id: estId,
      estimateNumber,
      createdAt: new Date().toISOString(),
    };

    this.estimates.unshift(newEst);
    this.persist();
    this.logActivity(
      'create',
      'estimate',
      newEst.id,
      `Created estimate quote ${newEst.estimateNumber} ($${newEst.total.toFixed(2)}) for ${newEst.clientName}`,
      undefined,
      newEst,
      newEst.estimateNumber
    );
    return newEst;
  }

  public updateEstimateStatus(id: string, status: Estimate['status']) {
    const est = this.estimates.find((e) => e.id === id);
    if (est) {
      const prevStatus = est.status;
      est.status = status;
      this.persist();
      this.logActivity(
        'status_change',
        'estimate',
        id,
        `Estimate ${est.estimateNumber} status changed from "${prevStatus}" to "${status}"`,
        { status: prevStatus },
        { status },
        est.estimateNumber
      );
    }
  }

  public convertEstimateToJob(estimateId: string, scheduledDate?: string, techId?: string): Job | undefined {
    const est = this.estimates.find((e) => e.id === estimateId);
    if (!est) return undefined;

    const tech = this.users.find((u) => u.uid === techId) || this.users.find((u) => u.role === 'technician');

    const newJob = this.addJob({
      clientId: est.clientId,
      clientName: est.clientName,
      propertyId: est.propertyId,
      propertyAddress: est.propertyAddress,
      assignedTechId: tech?.uid,
      assignedTechName: tech?.displayName || 'Unassigned',
      title: `Service: ${est.items[0]?.description || est.estimateNumber}`,
      description: est.items.map((i) => `• ${i.description} ($${i.total})`).join('\n'),
      status: 'scheduled',
      priority: 'medium',
      scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
      timeWindowStart: '09:00',
      timeWindowEnd: '12:00',
      checklist: est.items.map((item, idx) => ({
        id: `chk-${idx}`,
        text: item.description,
        done: false,
      })),
      photosBefore: [],
      photosAfter: [],
      estimateId: est.id,
      notes: `Converted from approved Estimate ${est.estimateNumber}`,
      totalAmount: est.total,
    });

    est.status = 'approved';
    est.convertedToJobId = newJob.id;
    this.persist();

    return newJob;
  }

  // --- Invoices ---
  public getInvoices(): Invoice[] {
    return [...this.invoices];
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find((i) => i.id === id);
  }

  public getInvoicesByClientId(clientId: string): Invoice[] {
    return this.invoices.filter((i) => i.clientId === clientId);
  }

  public addInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>): Invoice {
    const invId = `inv-${Date.now()}`;
    const invoiceNumber = `INV-${Math.floor(3000 + Math.random() * 6999)}`;
    const newInv: Invoice = {
      ...invoiceData,
      id: invId,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    this.invoices.unshift(newInv);

    // Link to job if applicable
    const job = this.jobs.find((j) => j.id === invoiceData.jobId);
    if (job) {
      job.invoiceId = invId;
    }

    this.persist();
    this.logActivity(
      'create',
      'invoice',
      newInv.id,
      `Generated invoice ${newInv.invoiceNumber} for $${newInv.total.toFixed(2)} (${newInv.clientName})`,
      undefined,
      newInv,
      newInv.invoiceNumber
    );
    return newInv;
  }

  public markInvoicePaid(invoiceId: string, stripePaymentIntentId?: string) {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (inv) {
      const prevStatus = inv.status;
      inv.status = 'paid';
      inv.amountPaid = inv.total;
      inv.balanceDue = 0;
      inv.paidAt = new Date().toISOString();
      if (stripePaymentIntentId) {
        inv.stripePaymentLink = `https://dashboard.stripe.com/test/payments/${stripePaymentIntentId}`;
      }

      // Update client total spent
      const client = this.clients.find((c) => c.id === inv.clientId);
      if (client) {
        client.totalSpent = (client.totalSpent || 0) + inv.total;
      }

      this.persist();
      this.logActivity(
        'payment_received',
        'invoice',
        invoiceId,
        `Payment confirmed for ${inv.invoiceNumber}: $${inv.total.toFixed(2)} paid in full`,
        { status: prevStatus },
        { status: 'paid', amountPaid: inv.total },
        inv.invoiceNumber
      );
    }
  }

  // --- Subscriptions (Module 1: Stripe Recurring Memberships) ---
  public getSubscriptions(): Subscription[] {
    return [...this.subscriptions];
  }

  public getSubscriptionById(id: string): Subscription | undefined {
    return this.subscriptions.find((s) => s.id === id);
  }

  public getSubscriptionsByClientId(clientId: string): Subscription[] {
    return this.subscriptions.filter((s) => s.clientId === clientId);
  }

  public createSubscription(
    subData: Omit<Subscription, 'id' | 'createdAt'>
  ): Subscription {
    const subId = `sub-${Date.now()}`;
    const newSub: Subscription = {
      ...subData,
      id: subId,
      createdAt: new Date().toISOString(),
    };

    this.subscriptions.unshift(newSub);
    this.persist();
    this.logActivity({
      actionType: 'create',
      entityType: 'subscription',
      entityId: newSub.id,
      entityTitle: `${newSub.clientName} – ${newSub.planName}`,
      description: `Created recurring subscription for ${newSub.clientName}: ${newSub.planName} at $${newSub.amount}/mo`,
      newState: newSub,
    });
    return newSub;
  }

  public cancelSubscription(id: string) {
    const sub = this.subscriptions.find((s) => s.id === id);
    if (sub) {
      const prevStatus = sub.status;
      sub.status = 'canceled';
      this.persist();
      this.logActivity({
        actionType: 'delete',
        entityType: 'subscription',
        entityId: id,
        entityTitle: `${sub.clientName} – ${sub.planName}`,
        description: `Cancelled subscription for ${sub.clientName}: ${sub.planName}`,
        previousState: { status: prevStatus },
        newState: { status: 'canceled' },
      });
    }
  }

  public triggerSubscriptionRenewal(subscriptionId: string): { job: Job; renewalInvoice: Invoice } | null {
    const sub = this.subscriptions.find((s) => s.id === subscriptionId);
    if (!sub || sub.status !== 'active') return null;

    const now = new Date();
    // Advance period dates by 1 month
    const newStart = sub.currentPeriodEnd || now.toISOString();
    const endDateObj = new Date(newStart);
    endDateObj.setMonth(endDateObj.getMonth() + 1);
    const newEnd = endDateObj.toISOString();

    sub.currentPeriodStart = newStart;
    sub.currentPeriodEnd = newEnd;

    // 1. Generate automated renewal invoice (Stripe $99 paid invoice)
    const invId = `inv-sub-${Date.now()}`;
    const invoiceNumber = `INV-${Math.floor(5000 + Math.random() * 4999)}`;
    const newInv: Invoice = {
      id: invId,
      invoiceNumber,
      jobId: 'sub-recurring',
      jobNumber: 'STRIPE-SUB',
      clientId: sub.clientId,
      clientName: sub.clientName,
      propertyId: sub.propertyId,
      propertyAddress: sub.propertyAddress,
      items: [
        {
          id: `item-sub-${Date.now()}`,
          description: `${sub.planName} - Automated Monthly Maintenance`,
          quantity: 1,
          unitPrice: sub.amount,
          total: sub.amount,
        },
      ],
      subtotal: sub.amount,
      tax: 0,
      total: sub.amount,
      amountPaid: sub.amount,
      balanceDue: 0,
      status: 'paid',
      stripePaymentLink: `https://dashboard.stripe.com/test/subscriptions/${sub.stripeSubscriptionId}`,
      dueDate: newStart.split('T')[0],
      paidAt: now.toISOString(),
      createdAt: now.toISOString(),
    };
    this.invoices.unshift(newInv);

    // 2. Automatically generate a new "Preventative Maintenance" job in the "unscheduled" queue
    const jobId = `job-${Date.now()}`;
    const jobNumber = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newJob: Job = {
      id: jobId,
      jobNumber,
      clientId: sub.clientId,
      clientName: sub.clientName,
      propertyId: sub.propertyId,
      propertyAddress: sub.propertyAddress,
      title: 'Preventative Maintenance: Quarterly HVAC, Plumbing & Safety Audit',
      description: `Automated monthly preventative maintenance service triggered by active $99/mo Stripe subscription renewal [${sub.stripeSubscriptionId}].`,
      status: 'unscheduled', // Placed directly into Unscheduled queue on Dispatch Board
      priority: 'medium',
      scheduledDate: now.toISOString().split('T')[0],
      timeWindowStart: '09:00',
      timeWindowEnd: '12:00',
      checklist: [
        { id: `chk-pm-1`, text: 'Replace HVAC air filters & inspect blower cage', done: false },
        { id: `chk-pm-2`, text: 'Test all smoke & carbon monoxide detectors', done: false },
        { id: `chk-pm-3`, text: 'Inspect under-sink plumbing stops & water heater pressure relief valve', done: false },
        { id: `chk-pm-4`, text: 'Exterior perimeter gutter & downspout visual inspection', done: false },
        { id: `chk-pm-5`, text: 'Lubricate garage door tracks & test auto-reverse safety eye', done: false },
      ],
      photosBefore: [],
      photosAfter: [],
      invoiceId: invId,
      notes: `Automated dispatch via Stripe Subscription renewal (${sub.stripeSubscriptionId})`,
      totalAmount: sub.amount,
      createdAt: now.toISOString(),
    };
    this.jobs.unshift(newJob);

    // Update client active jobs and property history
    const client = this.clients.find((c) => c.id === sub.clientId);
    if (client) {
      client.activeJobsCount = (client.activeJobsCount || 0) + 1;
      client.totalSpent = (client.totalSpent || 0) + sub.amount;
    }

    const prop = this.properties.find((p) => p.id === sub.propertyId);
    if (prop) {
      prop.serviceHistoryJobIds.push(jobId);
    }

    sub.lastDispatchedJobId = jobId;
    this.logActivity({
      entityType: 'job',
      entityId: newJob.id,
      entityTitle: newJob.title,
      actionType: 'create',
      description: `Auto-dispatched preventative maintenance job for ${sub.clientName} via Stripe subscription`,
      previousState: null,
      newState: newJob,
    });
    this.persist();

    return { job: newJob, renewalInvoice: newInv };
  }

  // --- Phase 4: AI-Powered Daily Work Logs & OCR Vault ---
  public getDailyWorkLogs(): DailyWorkLog[] {
    return sortWorkLogsChronologically(this.dailyWorkLogs, 'asc');
  }

  public getDailyWorkLogsByTechId(techId: string): DailyWorkLog[] {
    return sortWorkLogsChronologically(
      this.dailyWorkLogs.filter((l) => l.technicianId === techId),
      'asc'
    );
  }

  public addDailyWorkLog(logData: Omit<DailyWorkLog, 'id' | 'createdAt'>): DailyWorkLog {
    const newLog: DailyWorkLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.dailyWorkLogs.push(newLog);
    this.logActivity({
      entityType: 'timesheet',
      entityId: newLog.id,
      entityTitle: `${newLog.technicianName} - ${newLog.date} (${newLog.totalHours} hrs)`,
      actionType: 'ocr_upload',
      description: `Uploaded and processed daily work log for ${newLog.technicianName} on ${newLog.date}`,
      previousState: null,
      newState: newLog,
    });
    this.persist();
    return newLog;
  }

  // --- Phase 4: Weekly Timesheets & Payment Verification ---
  public getWeeklyTimesheets(): WeeklyTimesheet[] {
    return [...this.weeklyTimesheets].sort((a, b) => b.weekNumber - a.weekNumber);
  }

  public getWeeklyTimesheetsByTechId(techId: string): WeeklyTimesheet[] {
    return this.weeklyTimesheets
      .filter((t) => t.technicianId === techId)
      .sort((a, b) => b.weekNumber - a.weekNumber);
  }

  public addWeeklyTimesheet(timesheet: WeeklyTimesheet): WeeklyTimesheet {
    const existingIdx = this.weeklyTimesheets.findIndex((t) => t.id === timesheet.id);
    if (existingIdx >= 0) {
      if (!this.weeklyTimesheets[existingIdx].locked) {
        this.weeklyTimesheets[existingIdx] = timesheet;
      }
    } else {
      this.weeklyTimesheets.unshift(timesheet);
    }
    this.persist();
    return timesheet;
  }

  public verifyWeeklyTimesheetPayment(
    timesheetId: string,
    verification: Omit<PaymentVerification, 'id' | 'verifiedAt'>
  ): WeeklyTimesheet | null {
    const timesheet = this.weeklyTimesheets.find((t) => t.id === timesheetId);
    if (!timesheet) return null;

    const previousState = { ...timesheet };
    const updated = verifyWeeklyTimesheet(timesheet, verification);
    const idx = this.weeklyTimesheets.findIndex((t) => t.id === timesheetId);
    if (idx >= 0) {
      this.weeklyTimesheets[idx] = updated;
    }
    this.logActivity({
      entityType: 'timesheet',
      entityId: updated.id,
      entityTitle: `${updated.technicianName} - Week ${updated.weekNumber} (${updated.weekStartDate})`,
      actionType: 'payment_verify',
      description: `Verified payment of $${updated.netPay.toFixed(2)} via ${verification.paymentMethod}${verification.checkNumber ? ` (Ref: ${verification.checkNumber})` : ''}`,
      previousState,
      newState: updated,
    });
    this.persist();
    return updated;
  }

  public updateWeeklyTimesheetAudit(
    timesheetId: string,
    updates: {
      hourlyRate?: number;
      bonuses?: TimesheetBonus[];
      deductions?: TimesheetDeduction[];
      auditConfirmed?: boolean;
      auditConfirmedBy?: string;
    }
  ): WeeklyTimesheet | null {
    const timesheet = this.weeklyTimesheets.find((t) => t.id === timesheetId);
    if (!timesheet) return null;
    if (timesheet.locked) return timesheet; // Cannot alter locked timesheet

    const previousState = { ...timesheet };
    const updated = updateTimesheetAudit(timesheet, updates);
    const idx = this.weeklyTimesheets.findIndex((t) => t.id === timesheetId);
    if (idx >= 0) {
      this.weeklyTimesheets[idx] = updated;
    }
    this.logActivity({
      entityType: 'timesheet',
      entityId: updated.id,
      entityTitle: `${updated.technicianName} - Week ${updated.weekNumber} (${updated.weekStartDate})`,
      actionType: 'audit_confirm',
      description: `Updated timesheet audit details: Net Pay $${updated.netPay.toFixed(2)} at $${updated.hourlyRate}/hr`,
      previousState,
      newState: updated,
    });
    this.persist();
    return updated;
  }

  public generateMissingWeeklyTimesheets(): WeeklyTimesheet[] {
    const generated: WeeklyTimesheet[] = [];
    const techUsers = this.getTechnicians();

    for (const tech of techUsers) {
      const techLogs = this.getDailyWorkLogsByTechId(tech.uid);
      const weekGroups = groupWorkLogsByCalendarWeek(techLogs);

      weekGroups.forEach((logs, weekKey) => {
        const expectedId = `timesheet-${weekKey}-${tech.uid}`;
        const existing = this.weeklyTimesheets.find((t) => t.id === expectedId);
        if (!existing) {
          const newSheet = aggregateWeeklyTimesheet(logs, tech.uid, tech.displayName, 35.0);
          this.weeklyTimesheets.push(newSheet);
          generated.push(newSheet);
        }
      });
    }

    if (generated.length > 0) {
      this.persist();
    }
    return generated;
  }

  // Reset demo data helper
  public resetToDefault() {
    this.clients = INITIAL_CLIENTS;
    this.properties = INITIAL_PROPERTIES;
    this.jobs = INITIAL_JOBS;
    this.invoices = INITIAL_INVOICES;
    this.estimates = INITIAL_ESTIMATES;
    this.subscriptions = INITIAL_SUBSCRIPTIONS;
    this.dailyWorkLogs = INITIAL_DAILY_WORK_LOGS;
    this.weeklyTimesheets = INITIAL_WEEKLY_TIMESHEETS;
    this.users = INITIAL_USERS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.persist();
  }
}
