import React from 'react';
import { FundingRound } from '../types/capTable';
import { CalculatedRound } from '../types/capTable';
import FundingRoundInput from './FundingRoundInput';
import RoundSummaryCard from './RoundSummaryCard';

interface FundingRoundPairProps {
  round: FundingRound;
  calculatedRound: CalculatedRound | undefined;
  onUpdate: (roundId: string, updates: Partial<FundingRound>) => void;
  onRemove: (roundId: string) => void;
}

const FundingRoundPair: React.FC<FundingRoundPairProps> = ({ 
  round, 
  calculatedRound, 
  onUpdate, 
  onRemove 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <FundingRoundInput
          round={round}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      </div>
      <div>
        {calculatedRound ? (
          <RoundSummaryCard round={calculatedRound} />
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center text-gray-500">
            No summary available for this round yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default FundingRoundPair;
