import {
  CancellationSettlementItem,
  CancellationStage,
  Estimate,
  Job,
  WorkAgreement,
} from '@/types';

export const EXPOSED_SYSTEM_CATEGORIES = [
  'Exposed Ceiling, Joists, Rafters & Overhead Structural Cavities (Unfinished / Open)',
  'Tongue & Groove (T&G) Boards, Millwork & Wood Materials — Proper Climate Acclimation, Flat Stacking, Moisture Control & On-Site Storage',
  'Plumbing & Water Supply / Drain Lines (Uncapped or Unpressurized)',
  'Electrical Wiring, Panels & Open Junctions (Uninspected / Rough-In)',
  'Drywall, Framing & Structural Wall Cavities (Opened / Unsealed)',
  'Subflooring, Tile & Moisture Barriers (Exposed / Incomplete)',
  'HVAC Equipment, Ductwork & Condensate Lines (Partially Connected)',
  'Roofing, Flashing, Siding & Exterior Weather Envelope (Unsealed)',
  'Appliances, Fixtures & Custom Cabinetry Mounting (Unfinished)',
  'Staged / Uninstalled Materials Left On-Site (Warping, Cupping, Weather, Humidity & Theft Risk)',
] as const;

export const CANCELLATION_STAGE_LABELS: Record<CancellationStage, string> = {
  pre_mobilization: 'Pre-Mobilization (Scheduled / Admin & Allocation)',
  materials_procured: 'Materials Procured / Staged (Pre-Install or Early Stage)',
  mid_job_active: 'Mid-Job Cancellation (Active Work in Progress Halted)',
  substantial_completion: 'Late-Stage / Punch-List Cancellation (Substantial Scope Performed)',
  recurring_plan: 'Recurring Maintenance Care Plan Termination',
};

/**
 * Generates an ironclad 7-Article Service Contract Cancellation, Stop-Work Settlement
 * & Mutual Liability Release Agreement governed by Georgia Law (Rome, Floyd County, GA).
 */
export function buildGeorgiaCancellationTerms(params: {
  clientName: string;
  propertyAddress: string;
  estimateNumber: string;
  agreementNumber?: string;
  contractId?: string;
  jobNumber?: string;
  stage: CancellationStage;
  stopWorkDate: string;
  completionPercentage: number;
  workPerformedSummary: string;
  unfinishedWorkRisks: string;
  exposedSystemsList: string[];
  originalContractTotal: number;
  totalSettlementCharges: number;
  priorPaymentsCredited: number;
  refundIssued: number;
  settlementBalanceDue: number;
}): string {
  const {
    clientName,
    propertyAddress,
    estimateNumber,
    agreementNumber,
    contractId,
    jobNumber,
    stopWorkDate,
    completionPercentage,
    workPerformedSummary,
    unfinishedWorkRisks,
    exposedSystemsList,
    originalContractTotal,
    totalSettlementCharges,
    priorPaymentsCredited,
    refundIssued,
    settlementBalanceDue,
  } = params;

  const refDocs = [
    `Estimate ${estimateNumber}`,
    agreementNumber ? `Work Agreement ${agreementNumber}` : null,
    contractId ? `Master Contract ${contractId}` : null,
    jobNumber ? `Work Order ${jobNumber}` : null,
  ]
    .filter(Boolean)
    .join(' / ');

  const exposedText =
    exposedSystemsList.length > 0
      ? exposedSystemsList.join('; ')
      : 'All partially completed, opened, or modified trade areas at the service property';

  const retainedAmount = Math.min(priorPaymentsCredited, totalSettlementCharges);

  return [
    `ARTICLE I — NOTICE OF CLIENT-INITIATED STOP-WORK DIRECTIVE & TERMINATION FOR CONVENIENCE (GEORGIA CONTRACT LAW): Client (${clientName}) has voluntarily elected to halt operations and cancel the underlying Service Contract (${refDocs}) for the service property located at ${propertyAddress} effective ${stopWorkDate} ("Stop-Work Date"), at an estimated ${completionPercentage}% stage of project execution. Client acknowledges and stipulates that this cancellation is initiated solely at Client's election and convenience, and is NOT the result of any default, defective workmanship, or breach by Nailed It Property Solutions ("Contractor"). Upon execution of this directive, Contractor is instructed to cease all further labor, material procurement, and site operations at the Property.`,

    `ARTICLE II — QUANTUM MERUIT, COMPLETED LABOR, PROCURED MATERIALS & LIQUIDATED MOBILIZATION SETTLEMENT (GEORGIA STATUTORY LAW): Under Georgia law, upon owner-initiated termination prior to completion, Contractor is legally entitled to full compensation for all labor performed, materials furnished or custom-ordered, supplier restocking charges, scheduling displacement, and mobilization/demobilization expenses. From the Original Contract Total of $${originalContractTotal.toFixed(2)}, the parties stipulate and agree that the fair, reasonable, and liquidated value of Completed Labor, Procured/Delivered Materials, Supplier Restocking Fees, and Crew Mobilization/Scheduling Displacement incurred through the Stop-Work Date is $${totalSettlementCharges.toFixed(2)} (enforceable as agreed quantum meruit and liquidated damages under Georgia law, and not as a penalty). After applying Client's prior deposits/payments of $${priorPaymentsCredited.toFixed(2)} (of which $${retainedAmount.toFixed(2)} is irrevocably earned and retained by Contractor), the Net Cancellation Settlement Balance Due Immediately from Client is $${settlementBalanceDue.toFixed(2)}${refundIssued > 0 ? ` (with a net refund of $${refundIssued.toFixed(2)} to be remitted by Contractor)` : ' (with $0.00 refund due to Client)'}.`,

    `ARTICLE III — IMMEDIATE VOIDING OF ALL WARRANTIES & ASSUMPTION OF "AS-IS, WHERE-IS" UNFINISHED SITE & MATERIAL STORAGE RISKS (MID-JOB PROTECTION): Because Contractor has been instructed to halt work prior to full completion, final testing, sealing, or code finalization: (a) ALL EXPRESS AND IMPLIED WARRANTIES—including Contractor's 1-Year Workmanship Warranty, any manufacturer pass-through warranties, and any implied warranties of habitability, fitness, or merchantability—are IMMEDIATELY VOIDED AND EXTINGUISHED in their entirety; (b) Work completed prior to stop-work (${workPerformedSummary || 'as itemized herein'}) and all unfinished, open, or exposed conditions (${unfinishedWorkRisks || 'as existing on-site at demobilization'}, specifically including: ${exposedText}) are accepted by Client strictly "AS-IS, WHERE-IS, WITH ALL FAULTS"; (c) Client expressly assumes sole responsibility for the proper climate-controlled storage, flat elevated stacking, humidity/temperature acclimation, and weather protection of all Tongue & Groove (T&G) boards, lumber, millwork, trim, and building materials left on-site, and waives any claim for wood warping, cupping, bowing, splitting, moisture absorption, or discoloration; and (d) To the fullest extent permitted by Georgia law, Client assumes 100% of the risk and agrees to release, defend, indemnify, and hold harmless Nailed It Property Solutions, its representative Charles Willis, and its technicians from and against any and all claims, exposed ceiling hazards, falling debris, insulation/dust exposure, water leaks, moisture intrusion, mold, structural damage, electrical/plumbing/HVAC failures, building code violations, tenant or invitee injuries, or defects caused by the unfinished state of the Property or by Client or any subsequent contractor altering, storing, tying into, or completing the work.`,

    `ARTICLE IV — CONDITIONAL RELEASE & EXPRESS PRESERVATION OF FLOYD COUNTY MECHANICS' AND MATERIALMEN'S LIEN RIGHTS (GEORGIA LIEN LAW): Any release of Client's payment obligations under this Agreement is STRICTLY CONDITIONAL upon Contractor's receipt of good, cleared, and irrevocable funds in the full amount of the Net Cancellation Settlement Balance Due ($${settlementBalanceDue.toFixed(2)}). Until said Settlement Balance is paid in full, Nailed It Property Solutions expressly reserves and retains all statutory rights under Georgia law to record a Claim of Mechanics' and Materialmen's Lien against the real property located at ${propertyAddress} with the Clerk of the Superior Court of Floyd County, Georgia (Rome, GA) within ninety (90) days of the last day labor, services, or materials were furnished. Any unpaid Settlement Balance shall accrue statutory commercial interest at the rate of 1.5% per month (18% per annum) under Georgia commercial law, plus fifteen percent (15%) statutory attorney's fees and all costs of collection.`,

    `ARTICLE V — CONTRACTOR'S RIGHT OF ENTRY FOR TOOL & UNBILLED MATERIAL RECOVERY & PHOTOGRAPHIC SITE RECORD (GEORGIA PROPERTY LAW): Client grants Contractor and its personnel an irrevocable license and right of entry onto the Property to retrieve all Contractor-owned tools, ladders, drop cloths, staging equipment, and any unused materials not paid for by Client in the Settlement Balance. Interference with Contractor's retrieval of its equipment or materials shall constitute unlawful conversion of property under Georgia law. Client further acknowledges that Contractor's time-stamped Stop-Work photographs, checklist logs, and digital audit trail constitute conclusive, binding evidence of the exact scope performed and the safe, broom-swept condition in which the Property was left upon demobilization.`,

    `ARTICLE VI — IRREVOCABLE WAIVER OF CHARGEBACKS, PAYMENT REVERSALS & COMMERCIAL NON-DISPARAGEMENT (GEORGIA LITIGATION & DISPUTE LAW): Client irrevocably waives any right to initiate a credit/debit card chargeback, ACH reversal, Zelle/Venmo payment dispute, or check stop-payment order against any prior deposit ($${priorPaymentsCredited.toFixed(2)}) or any settlement payment made hereunder. Client stipulates that any attempted payment reversal or chargeback after executing this Agreement constitutes a bad-faith breach of contract and stubborn litigiousness under Georgia law, entitling Contractor to recover the full disputed sum, a $250.00 administrative dispute fee, and 100% of its actual attorney's fees and court costs. In consideration of the mutual covenants herein, Client agrees not to publish false, defamatory, or disparaging statements regarding Contractor's services or this terminated project on any public forum or review platform.`,

    `ARTICLE VII — GOVERNING LAW, EXCLUSIVE VENUE IN ROME, FLOYD COUNTY, GEORGIA & ELECTRONIC EXECUTION: This Agreement shall be governed by and construed exclusively in accordance with the laws of the State of Georgia. The parties irrevocably stipulate and agree that the EXCLUSIVE jurisdiction and venue for any legal action, lien foreclosure, or collection proceeding arising out of or relating to this Agreement or the underlying project shall lie in the Superior Court or Magistrate Court of Floyd County, Georgia (located in Rome, Georgia), and Client expressly waives any objection to personal jurisdiction or venue therein. Pursuant to the Georgia Uniform Electronic Transactions Act, the parties agree that digital signatures, typed electronic signatures, and audit-stamped acknowledgments affixed hereto carry the same full legal force and admissibility as original wet-ink signatures.`,
  ].join('\n\n');
}

/**
 * Generates default itemized settlement lines from an Estimate, WorkAgreement, and Job
 * so the contractor starts with an accurate, legally sound mid-job or pre-start breakdown.
 */
export function buildDefaultCancellationItems(params: {
  estimate: Estimate;
  agreement?: WorkAgreement;
  job?: Job;
  stage: CancellationStage;
  completionPercentage: number;
}): CancellationSettlementItem[] {
  const { estimate, agreement, stage, completionPercentage } = params;
  const sourceItems =
    agreement?.items && agreement.items.length > 0 ? agreement.items : estimate.items;
  const contractTotal = Number(agreement?.updatedTotal || estimate.total || 0);

  const laborSourceTotal = sourceItems
    .filter((i) => i.type === 'labor' || i.type === 'flat_rate')
    .reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const materialSourceTotal = sourceItems
    .filter((i) => i.type === 'material')
    .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  const effectiveRatio = Math.max(0, Math.min(100, completionPercentage)) / 100;
  const items: CancellationSettlementItem[] = [];

  if (stage === 'mid_job_active' || stage === 'substantial_completion') {
    const baseLabor = laborSourceTotal > 0 ? laborSourceTotal : contractTotal * 0.65;
    const earnedLabor = Math.round(baseLabor * Math.max(0.25, effectiveRatio) * 100) / 100;
    items.push({
      id: `canc-item-labor-${Date.now()}`,
      category: 'labor_completed',
      description: `Completed & In-Progress Field Labor Performed Prior to Stop-Work (${completionPercentage}% Stage Execution)`,
      details: 'Quantum Meruit & Lienable Field Labor under Georgia Law',
      quantity: 1,
      unitPrice: earnedLabor,
      total: earnedLabor,
    });
  }

  if (
    stage === 'materials_procured' ||
    stage === 'mid_job_active' ||
    stage === 'substantial_completion'
  ) {
    const baseMat =
      materialSourceTotal > 0
        ? materialSourceTotal
        : Math.round(contractTotal * 0.25 * 100) / 100;
    const usedOrDeliveredMat =
      stage === 'materials_procured'
        ? Math.round(baseMat * 0.5 * 100) / 100
        : Math.round(baseMat * Math.max(0.5, effectiveRatio) * 100) / 100;

    if (usedOrDeliveredMat > 0) {
      items.push({
        id: `canc-item-mat-${Date.now() + 1}`,
        category: 'materials_installed',
        description:
          'Procured, Delivered, Custom-Ordered, or Installed Materials & Trade Supplies On-Site',
        details: 'Furnished & Staged Materials under Georgia Law',
        quantity: 1,
        unitPrice: usedOrDeliveredMat,
        total: usedOrDeliveredMat,
      });
    }

    const restockFee = Math.max(45, Math.round(baseMat * 0.2 * 100) / 100);
    items.push({
      id: `canc-item-restock-${Date.now() + 2}`,
      category: 'restocking_fee',
      description:
        'Supplier Return Handling, Material Restocking & Procurement Recovery Fee (20%)',
      details: 'Direct Out-of-Pocket Reliance & Procurement Costs',
      quantity: 1,
      unitPrice: restockFee,
      total: restockFee,
    });
  }

  // Mobilization / Scheduling Displacement / Liquidated Damages (always applicable)
  const defaultMobilization = Math.max(
    150,
    Math.round(contractTotal * 0.15 * 100) / 100
  );
  items.push({
    id: `canc-item-mob-${Date.now() + 3}`,
    category: 'mobilization_fee',
    description:
      'Crew Mobilization, Dispatch Scheduling Displacement & Demobilization Fee (15% Contract Allocation)',
    details: 'Liquidated Damages for Lost Dispatch Capacity under Georgia Law',
    quantity: 1,
    unitPrice: defaultMobilization,
    total: defaultMobilization,
  });

  return items;
}
