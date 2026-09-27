/**
 * Nailed It Property Solutions - Dynamic Pricing, Add-Ons & Market Comparison Engine
 * Regional Pricing tailored specifically for Rome, Floyd County, Georgia
 */

// ==========================================
// 1. SUBSCRIPTION PRICING ALGORITHM TYPES
// ==========================================

export type SubscriptionTier = 'essentials' | 'plus' | 'premium';
export type InspectionGrade = 'A' | 'B' | 'C' | 'D';

export interface PropertyPricingVariables {
  sqFt: number;
  beds: number;
  baths: number;
  hvacUnits: number;
  kitchens: number;
  propertyAgeYears: number;
  inspectionGrade: InspectionGrade;
}

export interface SubscriptionModifierBreakdown {
  label: string;
  amount: number;
  type: 'fixed' | 'percentage';
  calculationDetail: string;
}

export interface SubscriptionQuoteResult {
  tier: SubscriptionTier;
  tierName: string;
  basePrice: number;
  modifiers: SubscriptionModifierBreakdown[];
  subtotalBeforeMultipliers: number;
  ageMultiplierPercent: number;
  ageSurchargeAmount: number;
  gradeMultiplierPercent: number;
  gradeSurchargeAmount: number;
  finalMonthlyPrice: number;
  annualEquivalent: number;
  stripePriceDescription: string;
}

// ==========================================
// 2. ADD-ONS & LABOR HOUR BLOCKS TYPES
// ==========================================

export interface PricingAddOn {
  id: string;
  name: string;
  category: 'labor_block' | 'maintenance_upgrade' | 'smart_device';
  description: string;
  billingType: 'monthly_recurring' | 'one_time';
  retailRomePrice: number;
  nailedItPrice: number;
  savings: number;
  laborHours?: number;
  badge?: string;
}

export interface AddOnSelectionState {
  [addOnId: string]: boolean;
}

export interface AddOnsCalculationResult {
  selectedItems: PricingAddOn[];
  monthlyAddOnsTotal: number;
  oneTimeAddOnsTotal: number;
  totalSavingsVsRomeMarket: number;
}

// ==========================================
// 3. ROME, GA SINGLE REPAIR ESTIMATING TYPES
// ==========================================

export type RepairTradeType = 
  | 'plumbing' 
  | 'drywall' 
  | 'electrical' 
  | 'hvac' 
  | 'carpentry' 
  | 'handyman_turnover';

export type RepairSeverity = 'minor' | 'moderate' | 'major';

export interface RomeMarketBenchmark {
  trade: RepairTradeType;
  tradeLabel: string;
  romeMedianHourlyLabor: number;
  romeLowHourlyLabor: number;
  romeHighHourlyLabor: number;
  nailedItHourlyLabor: number; // Pegged 5-10% below median
  discountPercentage: number;
  typicalMaterialsMultiplier: number;
}

export interface RepairScopeTask {
  id: string;
  name: string;
  typicalLaborHours: number;
  typicalMaterialsCost: number;
}

export interface SingleRepairEstimateInput {
  trade: RepairTradeType;
  severity: RepairSeverity;
  taskIds?: string[];
  customLaborHours?: number;
  customMaterialsCost?: number;
  emergencySurcharge?: boolean;
}

export interface SingleRepairEstimateResult {
  trade: RepairTradeType;
  tradeLabel: string;
  severity: RepairSeverity;
  laborHours: number;
  materialsCost: number;
  nailedItLaborCost: number;
  nailedItTotal: number;
  romeLowEstimate: number;
  romeMedianEstimate: number;
  romeHighEstimate: number;
  customerDollarSavings: number;
  percentBelowMedian: number;
  peggingNotes: string;
}

// ==========================================
// STATIC CONSTANTS & HARDCODED BENCHMARKS
// ==========================================

export const SUBSCRIPTION_TIER_CONFIG: Record<
  SubscriptionTier, 
  { name: string; basePrice: number; description: string; includedVisits: string }
> = {
  essentials: {
    name: 'Essentials Maintenance',
    basePrice: 99.00,
    description: 'Quarterly mechanical inspection, plumbing check, filter swaps, and priority dispatch.',
    includedVisits: '4 Scheduled Quarterly Visits / Year',
  },
  plus: {
    name: 'Plus Landlord Shield',
    basePrice: 159.00,
    description: 'Bimonthly comprehensive inspection, seasonal gutter cleanouts, tenant turnover priority.',
    includedVisits: '6 Scheduled Bimonthly Visits / Year',
  },
  premium: {
    name: 'Premium Portfolio White-Glove',
    basePrice: 229.00,
    description: 'Monthly bumper-to-bumper property care, zero trip fees, emergency response dispatch waiver.',
    includedVisits: '12 Scheduled Monthly Visits / Year',
  },
};

/**
 * Hardcoded Regional Pricing Data Structure for Rome, Floyd County, Georgia
 * Grounded in local trade benchmarks with Nailed It pegged 5-10% below median.
 */
export const ROME_GA_BENCHMARKS: Record<RepairTradeType, RomeMarketBenchmark> = {
  plumbing: {
    trade: 'plumbing',
    tradeLabel: 'Plumbing & Pipe Containment',
    romeLowHourlyLabor: 85,
    romeMedianHourlyLabor: 110,
    romeHighHourlyLabor: 145,
    nailedItHourlyLabor: 98, // 10.9% below median ($110 -> $98)
    discountPercentage: 10.9,
    typicalMaterialsMultiplier: 1.15,
  },
  drywall: {
    trade: 'drywall',
    tradeLabel: 'Drywall Repair & Ceiling Patching',
    romeLowHourlyLabor: 65,
    romeMedianHourlyLabor: 85,
    romeHighHourlyLabor: 115,
    nailedItHourlyLabor: 78, // 8.2% below median ($85 -> $78)
    discountPercentage: 8.2,
    typicalMaterialsMultiplier: 1.12,
  },
  electrical: {
    trade: 'electrical',
    tradeLabel: 'Electrical, Lighting & Panel Servicing',
    romeLowHourlyLabor: 90,
    romeMedianHourlyLabor: 115,
    romeHighHourlyLabor: 155,
    nailedItHourlyLabor: 104, // 9.6% below median ($115 -> $104)
    discountPercentage: 9.6,
    typicalMaterialsMultiplier: 1.18,
  },
  hvac: {
    trade: 'hvac',
    tradeLabel: 'HVAC Seasonal Servicing & Airflow',
    romeLowHourlyLabor: 95,
    romeMedianHourlyLabor: 125,
    romeHighHourlyLabor: 165,
    nailedItHourlyLabor: 112, // 10.4% below median ($125 -> $112)
    discountPercentage: 10.4,
    typicalMaterialsMultiplier: 1.20,
  },
  carpentry: {
    trade: 'carpentry',
    tradeLabel: 'Finish Carpentry, Trim & Door Repair',
    romeLowHourlyLabor: 70,
    romeMedianHourlyLabor: 90,
    romeHighHourlyLabor: 120,
    nailedItHourlyLabor: 82, // 8.9% below median ($90 -> $82)
    discountPercentage: 8.9,
    typicalMaterialsMultiplier: 1.14,
  },
  handyman_turnover: {
    trade: 'handyman_turnover',
    tradeLabel: 'General Handyman & Turnover Punch-List',
    romeLowHourlyLabor: 60,
    romeMedianHourlyLabor: 80,
    romeHighHourlyLabor: 105,
    nailedItHourlyLabor: 72, // 10.0% below median ($80 -> $72)
    discountPercentage: 10.0,
    typicalMaterialsMultiplier: 1.10,
  },
};

/**
 * Standard Catalog of Add-Ons & Discounted Labor Hour Blocks
 */
export const AVAILABLE_ADDONS: PricingAddOn[] = [
  {
    id: 'labor-block-2hr',
    name: '2-Hour Flex Fix Labor Block',
    category: 'labor_block',
    description: 'Prepaid 2-hour technician block for punch-list repairs, door adjustments, and minor fixes.',
    billingType: 'one_time',
    retailRomePrice: 190.00,
    nailedItPrice: 150.00,
    savings: 40.00,
    laborHours: 2,
    badge: 'Popular for Turnovers',
  },
  {
    id: 'labor-block-5hr',
    name: '5-Hour Maintenance Sprint Block',
    category: 'labor_block',
    description: 'Prepaid 5-hour technician bundle for intermediate maintenance, caulking, and fixture swaps.',
    billingType: 'one_time',
    retailRomePrice: 475.00,
    nailedItPrice: 350.00,
    savings: 125.00,
    laborHours: 5,
    badge: 'Best Value / Save $125',
  },
  {
    id: 'labor-block-10hr',
    name: '10-Hour Property Refresh Block',
    category: 'labor_block',
    description: 'Prepaid 10-hour comprehensive block for rental make-readies, drywall patches, and full overhauls.',
    billingType: 'one_time',
    retailRomePrice: 950.00,
    nailedItPrice: 650.00,
    savings: 300.00,
    laborHours: 10,
    badge: 'Portfolio Favorite / Save $300',
  },
  {
    id: 'addon-dryer-vent',
    name: 'Dryer Vent Lint Extraction & Airflow Audit',
    category: 'maintenance_upgrade',
    description: 'Full rotary brush cleanout of dryer exhaust ducting to prevent fire hazard and lower electric bills.',
    billingType: 'monthly_recurring',
    retailRomePrice: 25.00,
    nailedItPrice: 15.00,
    savings: 10.00,
    badge: '+$15/mo add-on',
  },
  {
    id: 'addon-water-heater',
    name: 'Water Heater Sediment Flush & Anode Audit',
    category: 'maintenance_upgrade',
    description: 'Annual tank descaling, sediment power flush, pressure relief valve check, and anode corrosion rating.',
    billingType: 'monthly_recurring',
    retailRomePrice: 30.00,
    nailedItPrice: 20.00,
    savings: 10.00,
    badge: '+$20/mo add-on',
  },
  {
    id: 'addon-gutter-cleaning',
    name: 'Seasonal Gutter Debris Clearing & Snaking',
    category: 'maintenance_upgrade',
    description: 'Biannual debris scoop, downspout pressure clear, and foundation splash block leveling.',
    billingType: 'monthly_recurring',
    retailRomePrice: 35.00,
    nailedItPrice: 25.00,
    savings: 10.00,
    badge: '+$25/mo add-on',
  },
  {
    id: 'addon-smart-locks',
    name: 'Smart Lock & Keyless Entry Battery Refresh',
    category: 'smart_device',
    description: 'Automated battery replacement, code reprogramming, and digital strike plate realignment for electronic locks.',
    billingType: 'monthly_recurring',
    retailRomePrice: 18.00,
    nailedItPrice: 10.00,
    savings: 8.00,
    badge: '+$10/mo add-on',
  },
];

// ==========================================
// 4. COMPUTATION FUNCTIONS
// ==========================================

/**
 * Subscription Pricing Algorithm (The "Fair & Profitable" Calculator)
 * 
 * Rules:
 * 1. Base tier starting price ($99/mo essentials, $159/mo plus, $229/mo premium).
 * 2. Square Footage: +$15 for every 500 sq ft over 1,500 sq ft threshold.
 * 3. Additional HVAC units: +$20 per additional unit beyond 1st.
 * 4. Additional Kitchens: +$25 per additional unit beyond 1st.
 * 5. Beds & Baths: +$5 per bed over 3; +$10 per bath over 2.
 * 6. Property Age Multiplier:
 *    - <= 20 years: 0%
 *    - 21 - 40 years: +10%
 *    - 41+ years: +15%
 * 7. Initial Inspection Grade Multiplier:
 *    - Grade A: 0%
 *    - Grade B: +5%
 *    - Grade C: +15%
 *    - Grade D: +25%
 */
export function calculateSubscriptionQuote(
  tier: SubscriptionTier,
  variables: PropertyPricingVariables
): SubscriptionQuoteResult {
  const config = SUBSCRIPTION_TIER_CONFIG[tier] || SUBSCRIPTION_TIER_CONFIG.essentials;
  const basePrice = config.basePrice;
  const modifiers: SubscriptionModifierBreakdown[] = [];

  // Square Footage Modifier: +$15 for every 500 sq ft over 1500
  if (variables.sqFt > 1500) {
    const extraSqFt = variables.sqFt - 1500;
    const blocksOf500 = Math.ceil(extraSqFt / 500);
    const sqFtUpcharge = blocksOf500 * 15;
    modifiers.push({
      label: `Square Footage Over 1,500 sq ft (${variables.sqFt.toLocaleString()} sq ft)`,
      amount: sqFtUpcharge,
      type: 'fixed',
      calculationDetail: `${blocksOf500} bracket(s) of 500 sq ft × $15.00`,
    });
  }

  // HVAC Units: +$20 per additional HVAC unit over 1
  if (variables.hvacUnits > 1) {
    const extraHvac = variables.hvacUnits - 1;
    const hvacUpcharge = extraHvac * 20;
    modifiers.push({
      label: `Additional HVAC Mechanical Units (${variables.hvacUnits} total units)`,
      amount: hvacUpcharge,
      type: 'fixed',
      calculationDetail: `${extraHvac} extra unit(s) × $20.00/mo filter & coil maintenance`,
    });
  }

  // Kitchens: +$25 per additional secondary/prep kitchen over 1
  if (variables.kitchens > 1) {
    const extraKitchens = variables.kitchens - 1;
    const kitchenUpcharge = extraKitchens * 25;
    modifiers.push({
      label: `Secondary Kitchen / In-Law Suite (${variables.kitchens} total)`,
      amount: kitchenUpcharge,
      type: 'fixed',
      calculationDetail: `${extraKitchens} extra kitchen(s) × $25.00/mo plumbing & appliance line checks`,
    });
  }

  // Beds & Baths modifier: +$5 per bed over 3, +$10 per bath over 2
  let bedBathUpcharge = 0;
  const extraBeds = Math.max(0, variables.beds - 3);
  const extraBaths = Math.max(0, variables.baths - 2);
  if (extraBeds > 0 || extraBaths > 0) {
    bedBathUpcharge = (extraBeds * 5) + (extraBaths * 10);
    modifiers.push({
      label: `Room Capacity Surcharge (${variables.beds} Bed / ${variables.baths} Bath)`,
      amount: bedBathUpcharge,
      type: 'fixed',
      calculationDetail: `${extraBeds} bed(s) × $5 + ${extraBaths} bath(s) × $10`,
    });
  }

  const fixedUpchargesTotal = modifiers.reduce((acc, m) => acc + m.amount, 0);
  const subtotalBeforeMultipliers = basePrice + fixedUpchargesTotal;

  // Property Age Surcharge:
  // > 20 years: +10%; > 40 years: +15%
  let ageMultiplierPercent = 0;
  if (variables.propertyAgeYears > 40) {
    ageMultiplierPercent = 15;
  } else if (variables.propertyAgeYears > 20) {
    ageMultiplierPercent = 10;
  }
  const ageSurchargeAmount = Math.round(subtotalBeforeMultipliers * (ageMultiplierPercent / 100) * 100) / 100;

  // Initial Inspection Grade Surcharge:
  // Grade A: 0%, B: +5%, C: +15%, D: +25%
  let gradeMultiplierPercent = 0;
  switch (variables.inspectionGrade) {
    case 'B':
      gradeMultiplierPercent = 5;
      break;
    case 'C':
      gradeMultiplierPercent = 15;
      break;
    case 'D':
      gradeMultiplierPercent = 25;
      break;
    case 'A':
    default:
      gradeMultiplierPercent = 0;
      break;
  }
  const gradeSurchargeAmount = Math.round(subtotalBeforeMultipliers * (gradeMultiplierPercent / 100) * 100) / 100;

  const rawFinalPrice = subtotalBeforeMultipliers + ageSurchargeAmount + gradeSurchargeAmount;
  // Round to 2 decimal places
  const finalMonthlyPrice = Math.round(rawFinalPrice * 100) / 100;
  const annualEquivalent = Math.round(finalMonthlyPrice * 12 * 100) / 100;

  const stripePriceDescription = `${config.name} (${variables.sqFt} sq ft, Grade ${variables.inspectionGrade}, ${variables.hvacUnits} HVAC)`;

  return {
    tier,
    tierName: config.name,
    basePrice,
    modifiers,
    subtotalBeforeMultipliers,
    ageMultiplierPercent,
    ageSurchargeAmount,
    gradeMultiplierPercent,
    gradeSurchargeAmount,
    finalMonthlyPrice,
    annualEquivalent,
    stripePriceDescription,
  };
}

/**
 * Calculates selected Add-Ons, segregating recurring monthly vs one-time labor hour blocks.
 */
export function calculateAddOns(selectedAddOnIds: string[]): AddOnsCalculationResult {
  const selectedItems = AVAILABLE_ADDONS.filter((addon) => selectedAddOnIds.includes(addon.id));

  let monthlyAddOnsTotal = 0;
  let oneTimeAddOnsTotal = 0;
  let totalSavingsVsRomeMarket = 0;

  selectedItems.forEach((item) => {
    if (item.billingType === 'monthly_recurring') {
      monthlyAddOnsTotal += item.nailedItPrice;
    } else {
      oneTimeAddOnsTotal += item.nailedItPrice;
    }
    totalSavingsVsRomeMarket += item.savings;
  });

  return {
    selectedItems,
    monthlyAddOnsTotal: Math.round(monthlyAddOnsTotal * 100) / 100,
    oneTimeAddOnsTotal: Math.round(oneTimeAddOnsTotal * 100) / 100,
    totalSavingsVsRomeMarket: Math.round(totalSavingsVsRomeMarket * 100) / 100,
  };
}

/**
 * Rome, GA Single Repair Estimating Calculator
 * Pegs labor and materials 5-10% below the Rome median.
 */
export function calculateSingleRepairEstimate(
  input: SingleRepairEstimateInput
): SingleRepairEstimateResult {
  const benchmark = ROME_GA_BENCHMARKS[input.trade] || ROME_GA_BENCHMARKS.handyman_turnover;

  // Determine baseline labor hours and materials according to severity if not custom
  let laborHours = input.customLaborHours || 2;
  let materialsCost = input.customMaterialsCost || 50;

  if (!input.customLaborHours) {
    switch (input.severity) {
      case 'minor':
        laborHours = 1.75;
        materialsCost = 45.00;
        break;
      case 'moderate':
        laborHours = 4.0;
        materialsCost = 110.00;
        break;
      case 'major':
        laborHours = 7.5;
        materialsCost = 240.00;
        break;
    }
  }

  // Nailed It Pegged Labor Cost (5-10% below Floyd County median)
  const nailedItLaborCost = Math.round(laborHours * benchmark.nailedItHourlyLabor * 100) / 100;
  const emergencyMultiplier = input.emergencySurcharge ? 1.25 : 1.0;
  const nailedItTotal = Math.round((nailedItLaborCost + materialsCost) * emergencyMultiplier * 100) / 100;

  // Rome Local Market Comparisons:
  // Low: Rome Low Labor + materials (at cost)
  const romeLowLabor = Math.round(laborHours * benchmark.romeLowHourlyLabor * 100) / 100;
  const romeLowEstimate = Math.round((romeLowLabor + materialsCost) * emergencyMultiplier * 100) / 100;

  // Median: Rome Median Labor + materials with typical contractor markup (1.15x)
  const romeMedianLabor = Math.round(laborHours * benchmark.romeMedianHourlyLabor * 100) / 100;
  const markedUpMaterials = Math.round(materialsCost * benchmark.typicalMaterialsMultiplier * 100) / 100;
  const romeMedianEstimate = Math.round((romeMedianLabor + markedUpMaterials) * emergencyMultiplier * 100) / 100;

  // High: Rome High / Franchise contractor rate (e.g. Mr. Handyman / Rotor-Rooter style franchise)
  const romeHighLabor = Math.round(laborHours * benchmark.romeHighHourlyLabor * 100) / 100;
  const franchiseMaterials = Math.round(materialsCost * 1.30 * 100) / 100;
  const romeHighEstimate = Math.round((romeHighLabor + franchiseMaterials) * emergencyMultiplier * 100) / 100;

  // Customer Savings vs Rome Median
  const customerDollarSavings = Math.max(0, Math.round((romeMedianEstimate - nailedItTotal) * 100) / 100);
  const percentBelowMedian = romeMedianEstimate > 0 
    ? Math.round(((romeMedianEstimate - nailedItTotal) / romeMedianEstimate) * 1000) / 10 
    : 8.5;

  const peggingNotes = `Pegged at $${benchmark.nailedItHourlyLabor}/hr (${benchmark.discountPercentage.toFixed(1)}% below the Rome, GA median rate of $${benchmark.romeMedianHourlyLabor}/hr). Floyd County standard contractor pricing benchmark.`;

  return {
    trade: input.trade,
    tradeLabel: benchmark.tradeLabel,
    severity: input.severity,
    laborHours,
    materialsCost,
    nailedItLaborCost,
    nailedItTotal,
    romeLowEstimate,
    romeMedianEstimate,
    romeHighEstimate,
    customerDollarSavings,
    percentBelowMedian,
    peggingNotes,
  };
}
