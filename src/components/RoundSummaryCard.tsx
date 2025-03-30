import React from 'react';
import { CalculatedRound, CapTableEntry } from '../types/capTable';
import { formatNumber } from '../utils/formatting';
import { FiDollarSign, FiPieChart, FiUsers } from 'react-icons/fi';
import { getBadgeColors } from '../utils/colorUtils';
import ShareholderAvatar from './ShareholderAvatar';

interface RoundSummaryCardProps {
  round: CalculatedRound;
}

const RoundSummaryCard: React.FC<RoundSummaryCardProps> = ({ round }) => {
  console.log(`RoundSummaryCard: Rendering Summary Card for: ${round.roundName || round.roundId}`);
  // Ensure pricePerShare is valid before calculating values
  const isValidPricePerShare = round.pricePerShare !== undefined && round.pricePerShare !== null && !isNaN(round.pricePerShare);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{round.roundName} Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-3">
              <FiUsers className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Total Shares</div>
              <div className="text-lg font-bold text-gray-800">{formatNumber(round.totalShares, 'shares')}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-3">
              <FiDollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Post-Money Valuation</div>
              <div className="text-lg font-bold text-gray-800">{formatNumber(round.postMoneyValuation, 'currency')}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-2 mr-3">
              <FiPieChart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Price Per Share</div>
              <div className="text-lg font-bold text-gray-800">{formatNumber(round.pricePerShare, 'currency')}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shareholder</th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ownership %</th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value ($)</th>
            </tr>
          </thead>
          <tbody>
            {round.entries.map((entry: CapTableEntry, index) => { 
              // Calculate value based on shares and price per share for this round
              const calculatedValue = isValidPricePerShare ? entry.shares * round.pricePerShare : 0;
              return (
                <tr key={entry.shareholderId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                  <td className="py-3 px-6 text-sm">
                    <div className="flex items-center">
                      {/* Use consistent avatar component */}
                      <ShareholderAvatar 
                        name={entry.shareholderName}
                        id={entry.shareholderId}
                        roundId={round.roundId}
                      />
                      <span className="font-medium text-gray-800">{entry.shareholderName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700 text-right">{formatNumber(entry.shares, 'shares')}</td>
                  <td className="py-3 px-6 text-sm font-medium text-right">
                    {/* Use consistent badge colors based on round and shareholder ID */}
                    <span className={`${getBadgeColors(round.roundId, entry.shareholderId).bg} text-gray-800 py-1 px-2 rounded-full text-xs`}>
                      {formatNumber(entry.ownershipPercentage / 100, 'percentage')}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm font-medium text-green-600 text-right">
                    {formatNumber(calculatedValue, 'currency')}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
            <td className="py-2 px-4 text-sm text-gray-800">Total</td>
            <td className="py-2 px-4 text-sm text-gray-900 text-right">{formatNumber(round.totalShares, 'shares')}</td>
            <td className="py-2 px-4 text-sm text-gray-900 text-right">{formatNumber(round.entries.reduce((sum: number, e: CapTableEntry) => sum + e.ownershipPercentage, 0) / 100, 'percentage')}</td>
            <td className="py-2 px-4 text-sm text-gray-900 text-right">
              {formatNumber(round.entries.reduce((sum: number, e: CapTableEntry) => {
                const entryValue = isValidPricePerShare ? e.shares * round.pricePerShare : 0;
                return sum + entryValue;
              }, 0), 'currency')}
            </td>
          </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default RoundSummaryCard;
