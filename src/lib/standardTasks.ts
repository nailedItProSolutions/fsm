export interface StandardTask {
  id: string;
  category: string;
  description: string;
  estimatedHours: number;
}

export const BASE_HOURLY_RATE = 47.50;

export const STANDARD_TASKS: StandardTask[] = [
  // Plumbing
  { id: 'plumb-1', category: 'Plumbing', description: 'Replace Toilet Fill Valve & Flapper', estimatedHours: 1.0 },
  { id: 'plumb-2', category: 'Plumbing', description: 'Install New Standard Toilet (Labor)', estimatedHours: 2.0 },
  { id: 'plumb-3', category: 'Plumbing', description: 'Clear Standard Sink/Tub Drain Clog', estimatedHours: 1.5 },
  { id: 'plumb-4', category: 'Plumbing', description: 'Replace Garbage Disposal (Labor)', estimatedHours: 1.5 },
  { id: 'plumb-5', category: 'Plumbing', description: 'Install New Kitchen Faucet (Labor)', estimatedHours: 1.5 },
  { id: 'plumb-6', category: 'Plumbing', description: 'Install New Bathroom Vanity Faucet (Labor)', estimatedHours: 1.0 },
  { id: 'plumb-7', category: 'Plumbing', description: 'Repair Minor Pipe Leak (Accessible)', estimatedHours: 2.0 },
  { id: 'plumb-8', category: 'Plumbing', description: 'Re-caulk Bathtub / Shower', estimatedHours: 1.5 },
  
  // Electrical
  { id: 'elec-1', category: 'Electrical', description: 'Replace Standard Light Fixture (Labor)', estimatedHours: 1.0 },
  { id: 'elec-2', category: 'Electrical', description: 'Install Ceiling Fan (Pre-wired box) (Labor)', estimatedHours: 1.5 },
  { id: 'elec-3', category: 'Electrical', description: 'Replace Standard Outlet or Switch', estimatedHours: 0.5 },
  { id: 'elec-4', category: 'Electrical', description: 'Install GFCI Outlet', estimatedHours: 0.75 },
  { id: 'elec-5', category: 'Electrical', description: 'Troubleshoot Minor Electrical Issue', estimatedHours: 1.5 },
  { id: 'elec-6', category: 'Electrical', description: 'Replace Smoke/CO Detector (Hardwired)', estimatedHours: 0.5 },

  // HVAC
  { id: 'hvac-1', category: 'HVAC', description: 'Standard AC Tune-Up & Filter Replacement', estimatedHours: 1.5 },
  { id: 'hvac-2', category: 'HVAC', description: 'Clean Evaporator & Condenser Coils', estimatedHours: 2.0 },
  { id: 'hvac-3', category: 'HVAC', description: 'Clear AC Condensate Drain Line', estimatedHours: 1.0 },
  { id: 'hvac-4', category: 'HVAC', description: 'Replace Digital Thermostat (Labor)', estimatedHours: 1.0 },

  // Carpentry & Drywall
  { id: 'carp-1', category: 'Carpentry & Drywall', description: 'Patch Small Drywall Hole (Up to 6")', estimatedHours: 1.0 },
  { id: 'carp-2', category: 'Carpentry & Drywall', description: 'Patch Medium Drywall Hole (Up to 12" x 12")', estimatedHours: 2.0 },
  { id: 'carp-3', category: 'Carpentry & Drywall', description: 'Repair/Replace Section of Baseboard (Per room)', estimatedHours: 1.5 },
  { id: 'carp-4', category: 'Carpentry & Drywall', description: 'Adjust/Plane Sticking Door', estimatedHours: 0.75 },
  { id: 'carp-5', category: 'Carpentry & Drywall', description: 'Repair Broken Cabinet Hinge/Drawer Track', estimatedHours: 1.0 },

  // General Handyman / Hardware
  { id: 'handy-1', category: 'General Handyman', description: 'Install Door Knob or Deadbolt', estimatedHours: 0.75 },
  { id: 'handy-2', category: 'General Handyman', description: 'Install Smart Lock (Labor)', estimatedHours: 1.25 },
  { id: 'handy-3', category: 'General Handyman', description: 'Mount TV to Drywall/Studs (Up to 65")', estimatedHours: 1.5 },
  { id: 'handy-4', category: 'General Handyman', description: 'Hang Window Blinds / Curtains (Per Window)', estimatedHours: 0.5 },
  { id: 'handy-5', category: 'General Handyman', description: 'Assemble Flat-Pack Furniture (Medium)', estimatedHours: 2.0 },

  // Painting
  { id: 'paint-1', category: 'Painting', description: 'Paint Standard Interior Door & Trim', estimatedHours: 1.5 },
  { id: 'paint-2', category: 'Painting', description: 'Paint Standard Room (Walls only, minor prep) - Up to 12x12', estimatedHours: 4.0 },
  { id: 'paint-3', category: 'Painting', description: 'Touch-up Painting (Assorted spots)', estimatedHours: 2.0 },

  // Turnover / Exterior
  { id: 'turn-1', category: 'Turnover & Exterior', description: 'Standard Apartment Turnover Punchlist (Minor)', estimatedHours: 4.0 },
  { id: 'turn-2', category: 'Turnover & Exterior', description: 'Standard Apartment Turnover Punchlist (Major)', estimatedHours: 8.0 },
  { id: 'turn-3', category: 'Turnover & Exterior', description: 'Pressure Wash Driveway (Standard 2-Car)', estimatedHours: 2.5 },
  { id: 'turn-4', category: 'Turnover & Exterior', description: 'Clean Gutters (Standard 1-Story)', estimatedHours: 2.0 },
  { id: 'turn-5', category: 'Turnover & Exterior', description: 'Replace Exterior Weather Stripping', estimatedHours: 1.0 },
];
