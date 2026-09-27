import { Client, Property, Job, Estimate, Invoice, UserProfile, Subscription } from '@/types';

// Seed Initial Data
export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user-admin-1',
    email: 'admin@nailedit.com',
    displayName: 'Sarah Jenkins (Admin)',
    role: 'admin',
    phone: '(512) 555-0100',
    active: true,
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    uid: 'user-tech-1',
    email: 'mike@nailedit.com',
    displayName: 'Mike Rivera',
    role: 'technician',
    phone: '(512) 555-0101',
    active: true,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    uid: 'user-tech-2',
    email: 'david@nailedit.com',
    displayName: 'David Lopez',
    role: 'technician',
    phone: '(512) 555-0102',
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

// In-Memory / LocalStorage State Store Helper
const STORAGE_KEY = 'nailed_it_fsm_store_v5';

export class FSMStore {
  private static instance: FSMStore;
  private clients: Client[] = INITIAL_CLIENTS;
  private properties: Property[] = INITIAL_PROPERTIES;
  private jobs: Job[] = INITIAL_JOBS;
  private invoices: Invoice[] = INITIAL_INVOICES;
  private estimates: Estimate[] = INITIAL_ESTIMATES;
  private subscriptions: Subscription[] = INITIAL_SUBSCRIPTIONS;
  private users: UserProfile[] = INITIAL_USERS;
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
          this.users = parsed.users || INITIAL_USERS;
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
            users: this.users,
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

  // --- Clients ---
  public getClients(): Client[] {
    return [...this.clients];
  }

  public getClientById(id: string): Client | undefined {
    return this.clients.find((c) => c.id === id);
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
      Object.assign(job, updates);
      this.persist();
    }
  }

  public toggleChecklistItem(jobId: string, itemId: string) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (job && job.checklist) {
      const item = job.checklist.find((c) => c.id === itemId);
      if (item) {
        item.done = !item.done;
        this.persist();
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
    return newEst;
  }

  public updateEstimateStatus(id: string, status: Estimate['status']) {
    const est = this.estimates.find((e) => e.id === id);
    if (est) {
      est.status = status;
      this.persist();
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
    return newInv;
  }

  public markInvoicePaid(invoiceId: string, stripePaymentIntentId?: string) {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (inv) {
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
    return newSub;
  }

  public cancelSubscription(id: string) {
    const sub = this.subscriptions.find((s) => s.id === id);
    if (sub) {
      sub.status = 'canceled';
      this.persist();
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
    this.persist();

    return { job: newJob, renewalInvoice: newInv };
  }

  // Reset demo data helper
  public resetToDefault() {
    this.clients = INITIAL_CLIENTS;
    this.properties = INITIAL_PROPERTIES;
    this.jobs = INITIAL_JOBS;
    this.invoices = INITIAL_INVOICES;
    this.estimates = INITIAL_ESTIMATES;
    this.subscriptions = INITIAL_SUBSCRIPTIONS;
    this.users = INITIAL_USERS;
    this.persist();
  }
}
