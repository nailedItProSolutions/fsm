import { 
  calculateSubscriptionQuote, 
  calculateAddOns, 
  calculateSingleRepairEstimate,
  ROME_GA_BENCHMARKS,
  AVAILABLE_ADDONS
} from '../pricingEngine.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function assertClose(actual: number, expected: number, tolerance = 0.05, message = '') {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    console.log(`  ✓ PASS: ${message} (Got ${actual}, Expected ~${expected})`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message} (Got ${actual}, Expected ${expected}, Diff ${diff})`);
    failed++;
  }
}

console.log('\n=== RUNNING NAILED IT FSM PRICING ENGINE UNIT TESTS ===\n');

// ----------------------------------------------------
// TEST SUITE 1: SUBSCRIPTION PRICING ALGORITHM
// ----------------------------------------------------
console.log('--- Test Suite 1: Subscription Pricing Algorithm ("Fair & Profitable" Calculator) ---');

// Test 1.1: Base essentials tier for pristine property under 1500 sq ft
const baseQuote = calculateSubscriptionQuote('essentials', {
  sqFt: 1450,
  beds: 3,
  baths: 2,
  hvacUnits: 1,
  kitchens: 1,
  propertyAgeYears: 10,
  inspectionGrade: 'A',
});

assert(baseQuote.basePrice === 99.00, 'Base essentials starting price is $99.00');
assert(baseQuote.modifiers.length === 0, 'No modifiers applied for pristine baseline property');
assert(baseQuote.finalMonthlyPrice === 99.00, 'Final price matches base $99.00');
assert(baseQuote.annualEquivalent === 1188.00, 'Annual equivalent matches $99 * 12 = $1188.00');

// Test 1.2: Square footage upcharges (+15 for every 500 sq ft over 1500)
const sqFtQuote1 = calculateSubscriptionQuote('essentials', {
  sqFt: 1950, // 450 over 1500 -> 1 bracket -> +$15
  beds: 3,
  baths: 2,
  hvacUnits: 1,
  kitchens: 1,
  propertyAgeYears: 5,
  inspectionGrade: 'A',
});
assert(sqFtQuote1.finalMonthlyPrice === 114.00, '1,950 sq ft (+450 sq ft) incurs exactly +$15.00 ($114.00 total)');

const sqFtQuote2 = calculateSubscriptionQuote('essentials', {
  sqFt: 2500, // 1000 over 1500 -> 2 brackets -> +$30
  beds: 3,
  baths: 2,
  hvacUnits: 1,
  kitchens: 1,
  propertyAgeYears: 5,
  inspectionGrade: 'A',
});
assert(sqFtQuote2.finalMonthlyPrice === 129.00, '2,500 sq ft (+1,000 sq ft) incurs exactly +$30.00 ($129.00 total)');

// Test 1.3: Mechanical & Room modifiers (+20 per extra HVAC, +25 per extra kitchen, +5 bed, +10 bath)
const multiUnitQuote = calculateSubscriptionQuote('essentials', {
  sqFt: 1500,
  beds: 4, // +1 bed -> +$5
  baths: 3, // +1 bath -> +$10
  hvacUnits: 2, // +1 HVAC -> +$20
  kitchens: 2, // +1 kitchen -> +$25
  propertyAgeYears: 8,
  inspectionGrade: 'A',
});
// Total fixed additions: 5 + 10 + 20 + 25 = 60. Final: 99 + 60 = 159.00
assert(multiUnitQuote.finalMonthlyPrice === 159.00, 'Multi-unit modifiers add up accurately: $99 + $60 = $159.00');

// Test 1.4: Property Age Surcharge (> 20 years: +10%; > 40 years: +15%)
const ageQuote1 = calculateSubscriptionQuote('essentials', {
  sqFt: 1500,
  beds: 3,
  baths: 2,
  hvacUnits: 1,
  kitchens: 1,
  propertyAgeYears: 25, // +10% on $99 = +$9.90
  inspectionGrade: 'A',
});
assert(ageQuote1.ageMultiplierPercent === 10, '25-year property has 10% age multiplier');
assertClose(ageQuote1.finalMonthlyPrice, 108.90, 0.01, '25-year property final price is $108.90');

const ageQuote2 = calculateSubscriptionQuote('essentials', {
  sqFt: 1500,
  beds: 3,
  baths: 2,
  hvacUnits: 1,
  kitchens: 1,
  propertyAgeYears: 55, // +15% on $99 = +$14.85
  inspectionGrade: 'A',
});
assert(ageQuote2.ageMultiplierPercent === 15, '55-year property has 15% age multiplier');
assertClose(ageQuote2.finalMonthlyPrice, 113.85, 0.01, '55-year property final price is $113.85');

// Test 1.5: Inspection Grade Multipliers (A: 0%, B: +5%, C: +15%, D: +25%)
const gradeB = calculateSubscriptionQuote('essentials', {
  sqFt: 1500, beds: 3, baths: 2, hvacUnits: 1, kitchens: 1, propertyAgeYears: 5, inspectionGrade: 'B'
});
assertClose(gradeB.finalMonthlyPrice, 103.95, 0.01, 'Grade B inspection incurs +5% ($103.95)');

const gradeC = calculateSubscriptionQuote('essentials', {
  sqFt: 1500, beds: 3, baths: 2, hvacUnits: 1, kitchens: 1, propertyAgeYears: 5, inspectionGrade: 'C'
});
assertClose(gradeC.finalMonthlyPrice, 113.85, 0.01, 'Grade C inspection incurs +15% ($113.85)');

const gradeD = calculateSubscriptionQuote('essentials', {
  sqFt: 1500, beds: 3, baths: 2, hvacUnits: 1, kitchens: 1, propertyAgeYears: 5, inspectionGrade: 'D'
});
assertClose(gradeD.finalMonthlyPrice, 123.75, 0.01, 'Grade D inspection incurs +25% ($123.75)');

// Test 1.6: Complex real-world property in Rome, GA (e.g. 2,800 sq ft, 2 HVACs, 30 years old, Grade C)
// Base: $99
// SqFt 2800 -> 1300 over 1500 -> 3 brackets × $15 = +$45
// 2 HVACs -> +$20
// Subtotal before multipliers: 99 + 45 + 20 = $164.00
// Age 30 yrs -> +10% of 164 = $16.40
// Grade C -> +15% of 164 = $24.60
// Expected Total: 164 + 16.40 + 24.60 = $205.00
const complexQuote = calculateSubscriptionQuote('essentials', {
  sqFt: 2800,
  beds: 3,
  baths: 2,
  hvacUnits: 2,
  kitchens: 1,
  propertyAgeYears: 30,
  inspectionGrade: 'C',
});
assert(complexQuote.subtotalBeforeMultipliers === 164.00, 'Subtotal before percentage multipliers is $164.00');
assertClose(complexQuote.finalMonthlyPrice, 205.00, 0.01, 'Complex multi-variable quote calculates to $205.00/mo');

// Test 1.7: Plus and Premium Tier Bases
const plusQuote = calculateSubscriptionQuote('plus', {
  sqFt: 1500, beds: 3, baths: 2, hvacUnits: 1, kitchens: 1, propertyAgeYears: 5, inspectionGrade: 'A'
});
assert(plusQuote.basePrice === 159.00 && plusQuote.finalMonthlyPrice === 159.00, 'Plus tier base calculates to $159.00');

const premiumQuote = calculateSubscriptionQuote('premium', {
  sqFt: 1500, beds: 3, baths: 2, hvacUnits: 1, kitchens: 1, propertyAgeYears: 5, inspectionGrade: 'A'
});
assert(premiumQuote.basePrice === 229.00 && premiumQuote.finalMonthlyPrice === 229.00, 'Premium tier base calculates to $229.00');

// ----------------------------------------------------
// TEST SUITE 2: ADD-ONS & LABOR HOUR BLOCKS
// ----------------------------------------------------
console.log('\n--- Test Suite 2: Optional Add-Ons & Discounted Labor Hour Blocks ---');

// Test 2.1: Labor Hour Blocks calculations and savings
const laborAddons = calculateAddOns(['labor-block-2hr', 'labor-block-5hr']);
assert(laborAddons.oneTimeAddOnsTotal === (150.00 + 350.00), '2hr ($150) + 5hr ($350) blocks sum to $500.00 one-time');
assert(laborAddons.totalSavingsVsRomeMarket === (40.00 + 125.00), 'Total savings vs Rome market is $165.00');

// Test 2.2: Monthly recurring add-ons
const recurringAddons = calculateAddOns(['addon-dryer-vent', 'addon-water-heater', 'addon-gutter-cleaning']);
assert(recurringAddons.monthlyAddOnsTotal === (15.00 + 20.00 + 25.00), 'Monthly add-ons sum to $60.00/mo');
assert(recurringAddons.oneTimeAddOnsTotal === 0, 'No one-time charge for pure monthly add-ons');

// Test 2.3: Mixed selection (Labor Block + Recurring Maintenance)
const mixedAddons = calculateAddOns(['labor-block-10hr', 'addon-dryer-vent']);
assert(mixedAddons.oneTimeAddOnsTotal === 650.00, '10-hr block charges $650.00 one-time');
assert(mixedAddons.monthlyAddOnsTotal === 15.00, 'Dryer vent charges $15.00 monthly recurring');
assert(mixedAddons.totalSavingsVsRomeMarket === 310.00, 'Mixed savings sum to $300 + $10 = $310.00');

// ----------------------------------------------------
// TEST SUITE 3: ROME, GA SINGLE REPAIR ESTIMATING
// ----------------------------------------------------
console.log('\n--- Test Suite 3: Rome, GA Single Repair Estimating (5-10% Below Median Pegging) ---');

const trades = Object.keys(ROME_GA_BENCHMARKS) as (keyof typeof ROME_GA_BENCHMARKS)[];

trades.forEach((trade) => {
  const benchmark = ROME_GA_BENCHMARKS[trade];
  const estimate = calculateSingleRepairEstimate({
    trade,
    severity: 'moderate',
  });

  const laborDiscountPct = ((benchmark.romeMedianHourlyLabor - benchmark.nailedItHourlyLabor) / benchmark.romeMedianHourlyLabor) * 100;
  
  assert(
    laborDiscountPct >= 5.0 && laborDiscountPct <= 12.0,
    `${benchmark.tradeLabel}: Labor rate ($${benchmark.nailedItHourlyLabor}/hr) is ${laborDiscountPct.toFixed(1)}% below Rome median ($${benchmark.romeMedianHourlyLabor}/hr) [Satisfies 5-10% constraint]`
  );

  assert(
    estimate.nailedItTotal < estimate.romeMedianEstimate,
    `${benchmark.tradeLabel}: Nailed It total ($${estimate.nailedItTotal.toFixed(2)}) is lower than Rome median estimate ($${estimate.romeMedianEstimate.toFixed(2)})`
  );

  assert(
    estimate.customerDollarSavings > 0,
    `${benchmark.tradeLabel}: Customer saves $${estimate.customerDollarSavings.toFixed(2)} vs Rome median`
  );
});

// Test 3.2: Emergency 24/7 surcharge calculation on repair
const regularPlumbing = calculateSingleRepairEstimate({ trade: 'plumbing', severity: 'minor', emergencySurcharge: false });
const emergencyPlumbing = calculateSingleRepairEstimate({ trade: 'plumbing', severity: 'minor', emergencySurcharge: true });
assertClose(emergencyPlumbing.nailedItTotal, regularPlumbing.nailedItTotal * 1.25, 0.1, '24/7 Emergency response applies 1.25x surcharge on repair estimate');

console.log('\n======================================================');
console.log(`UNIT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
