export interface Investor {
  id: string;
  name: string;
  amountInvested: number;
}

export interface Founder {
  id: string;
  name: string;
  shares: number;
}

// Add calculation method options
export type RoundCalculationMethod = 'by_valuation' | 'by_fixed_shares';

export interface FundingRound {
  id: string;
  name: string; // e.g., "Seed", "Series A"
  calculationMethod: RoundCalculationMethod; // How shares/valuation are determined
  preMoneyValuation: number; // Used if calculationMethod is 'by_valuation'
  newSharesIssued?: number; // Used if calculationMethod is 'by_fixed_shares'
  investors: Investor[];
}

export interface CapTableEntry {
  shareholderId: string; // Can be 'founders' or investor id
  shareholderName: string;
  roundId: string | 'initial'; // 'initial' for founders
  shares: number;
  ownershipPercentage: number;
}

export interface CapTableState {
  foundersShares: number; // Total shares allocated to all founders
  initialValuation: number; // Initial valuation for founder shares
  initialPricePerShare: number; // Initial Price Per Share
  founders: Founder[]; // List of individual founders
  fundingRounds: FundingRound[];
}

export interface CalculatedRound {
  roundId: string | 'initial';
  roundName: string;
  postMoneyValuation: number;
  pricePerShare: number;
  totalShares: number;
  entries: CapTableEntry[];
}

export interface CalculatedCapTable {
  rounds: CalculatedRound[];
}
