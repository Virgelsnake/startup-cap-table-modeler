import React from 'react';
import { useCapTable } from '../context/CapTableContext';
import { Investor } from '../types/capTable';

interface InvestorInputProps {
  roundId: string;
  investor: Investor;
}

const InvestorInput: React.FC<InvestorInputProps> = ({ roundId, investor }) => {
  const { updateInvestor, removeInvestor } = useCapTable();

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateInvestor(roundId, investor.id, { name: event.target.value });
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    updateInvestor(roundId, investor.id, { investedAmount: isNaN(value) ? 0 : value });
  };

  const handleRemove = () => {
    removeInvestor(roundId, investor.id);
  };

  return (
    <div className="flex items-end space-x-2 mb-2 p-2 border-l-2 border-gray-200 pl-3">
      <div className="flex-grow">
        <label htmlFor={`investor-name-${investor.id}`} className="block text-xs font-medium text-gray-600">
          Investor Name
        </label>
        <input
          type="text"
          id={`investor-name-${investor.id}`}
          name={`investor-name-${investor.id}`}
          value={investor.name}
          onChange={handleNameChange}
          className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Investor Name"
        />
      </div>
      <div className="w-1/3">
        <label htmlFor={`investor-amount-${investor.id}`} className="block text-xs font-medium text-gray-600">
          Invested Amount ($)
        </label>
        <input
          type="number"
          id={`investor-amount-${investor.id}`}
          name={`investor-amount-${investor.id}`}
          value={investor.investedAmount}
          onChange={handleAmountChange}
          min="0"
          step="1000"
          className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., 50000"
        />
      </div>
      <button
        type="button"
        onClick={handleRemove}
        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 h-8 mb-0.5" // Adjusted height and margin
      >
        Remove
      </button>
    </div>
  );
};

export default InvestorInput;
