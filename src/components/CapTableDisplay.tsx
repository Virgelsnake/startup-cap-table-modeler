import React from 'react';
import { CalculatedCapTable } from '../types/capTable';
import RoundSummaryCard from './RoundSummaryCard';
import { getInvestorColors, getBadgeColors } from '../utils/colorUtils';

interface CapTableDisplayProps {
  calculatedTable: CalculatedCapTable | null;
}

const CapTableDisplay: React.FC<CapTableDisplayProps> = ({ calculatedTable }) => {
  if (!calculatedTable || calculatedTable.rounds.length === 0) {
    console.log("CapTableDisplay: No calculatedTable or rounds, returning placeholder.");
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500 mt-4">
        Enter founder shares or add funding rounds to see the cap table.
      </div>
    ); 
  }
  console.log("CapTableDisplay: Rendering. Received calculatedTable:", calculatedTable);

  const validRounds = calculatedTable.rounds.filter(round => round && round.entries && round.entries.length > 0);
  const foundersRound = validRounds.find(round => round.roundId === 'initial');

  return (
    <div className="space-y-6"> 
      {foundersRound && <RoundSummaryCard round={foundersRound} />}
    </div>
  );
};

export default CapTableDisplay;
