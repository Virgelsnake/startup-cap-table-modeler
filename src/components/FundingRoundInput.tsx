import React, { useState } from 'react';
import { FundingRound, RoundCalculationMethod, Investor } from '../types/capTable';
import { useCapTable } from '../context/CapTableContext';
import { formatNumber } from '../utils/formatting';
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import ShareholderAvatar from './ShareholderAvatar';

interface FundingRoundInputProps {
  round: FundingRound;
  onUpdate: (roundId: string, updates: Partial<FundingRound>) => void;
  onRemove: (roundId: string) => void;
}

const FundingRoundInput: React.FC<FundingRoundInputProps> = ({ round, onUpdate, onRemove }) => {
  const { addInvestor, updateInvestor, removeInvestor } = useCapTable();

  console.log("FundingRoundInput: Rendering. Received round:", round);

  const [newInvestorName, setNewInvestorName] = useState('');
  const [newInvestorAmount, setNewInvestorAmount] = useState<number | string>('');
  
  // State for editing investors
  const [editingInvestorId, setEditingInvestorId] = useState<string | null>(null);
  const [editInvestorName, setEditInvestorName] = useState('');
  const [editInvestorAmount, setEditInvestorAmount] = useState<number | string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number | undefined = value;

    if (['preMoneyValuation', 'newSharesIssued'].includes(name)) {
      processedValue = value === '' ? undefined : parseFloat(value) || 0;
    } else if (name === 'name') {
      // Keep name as string
    } else {
      // Handle other potential fields if necessary
      processedValue = value;
    }

    const updates: Partial<FundingRound> = {
      [name]: processedValue,
    };
    onUpdate(round.id, updates);
  };

  const handleCalculationMethodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const method = event.target.value as RoundCalculationMethod;
    const updates: Partial<FundingRound> = { calculationMethod: method };
    // Reset the alternative field when method changes
    if (method === 'by_valuation') {
      updates.newSharesIssued = undefined; 
    } else { // by_fixed_shares
      updates.preMoneyValuation = undefined;
    }
    onUpdate(round.id, updates);
  };

  const handleAddInvestor = () => {
    const trimmedName = newInvestorName.trim();
    const amount = typeof newInvestorAmount === 'string' ? parseFloat(newInvestorAmount) : newInvestorAmount;

    if (trimmedName && !isNaN(amount) && amount > 0) {
      addInvestor(round.id, trimmedName, amount);
      setNewInvestorName('');
      setNewInvestorAmount('');
    } else {
      console.warn('Investor name cannot be empty and amount must be a positive number.');
    }
  };
  
  // Start editing an investor
  const handleEditInvestor = (investor: Investor) => {
    setEditingInvestorId(investor.id);
    setEditInvestorName(investor.name);
    setEditInvestorAmount(investor.amountInvested);
  };
  
  // Save investor edits
  const handleSaveInvestorEdit = () => {
    if (!editingInvestorId) return;
    
    const trimmedName = editInvestorName.trim();
    const amount = typeof editInvestorAmount === 'string' ? parseFloat(editInvestorAmount) : editInvestorAmount;
    
    if (trimmedName && !isNaN(amount) && amount > 0) {
      updateInvestor(round.id, editingInvestorId, {
        name: trimmedName,
        amountInvested: amount
      });
      // Reset edit state
      setEditingInvestorId(null);
      setEditInvestorName('');
      setEditInvestorAmount('');
    } else {
      console.warn('Investor name cannot be empty and amount must be a positive number.');
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingInvestorId(null);
    setEditInvestorName('');
    setEditInvestorAmount('');
  };
  
  // Delete an investor
  const handleDeleteInvestor = (investorId: string) => {
    if (window.confirm('Are you sure you want to remove this investor?')) {
      removeInvestor(round.id, investorId);
    }
  };

  const handleRemoveRound = () => {
    if (window.confirm(`Are you sure you want to remove round "${round.name}"?`)) {
      onRemove(round.id);
    }
  };

  const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm";

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{round.name || 'New Round'}</h3>
        <button
          onClick={handleRemoveRound}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Remove Round
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label htmlFor={`round-name-${round.id}`} className="block text-sm font-medium text-gray-700">Round Name</label>
          <input
            type="text"
            id={`round-name-${round.id}`}
            name="name"
            value={round.name}
            onChange={handleChange}
            className={inputClassName}
            placeholder="e.g., Seed Round"
          />
        </div>
        <div>
          <label htmlFor={`calc-method-${round.id}`} className="block text-sm font-medium text-gray-700">Calculation Method</label>
          <select
            id={`calc-method-${round.id}`}
            name="calculationMethod"
            value={round.calculationMethod}
            onChange={handleCalculationMethodChange}
            className={inputClassName}
          >
            <option value="by_valuation">By Valuation</option>
            <option value="by_fixed_shares">By Fixed Shares</option>
          </select>
        </div>
        {round.calculationMethod === 'by_valuation' ? (
          <div>
            <label htmlFor={`preMoneyValuation-${round.id}`} className="block text-sm font-medium text-gray-700">Pre-Money Valuation ($)</label>
            <input
              type="number"
              id={`preMoneyValuation-${round.id}`}
              name="preMoneyValuation"
              value={round.preMoneyValuation ?? ''}
              onChange={handleChange}
              className={inputClassName}
              placeholder="e.g., 5000000"
              step="1"
              min="0"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
        ) : (
          <div>
            <label htmlFor={`newSharesIssued-${round.id}`} className="block text-sm font-medium text-gray-700">New Shares Issued</label>
            <input
              type="number"
              id={`newSharesIssued-${round.id}`}
              name="newSharesIssued"
              value={round.newSharesIssued ?? ''}
              onChange={handleChange}
              className={inputClassName}
              placeholder="e.g., 1000000"
              step="1"
              min="0"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
        )}
      </div>

      {/* Display Existing Investors */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-3">Investors in this Round</h4>
        {round.investors && round.investors.length > 0 ? (
          <div className="rounded-lg border border-gray-100 overflow-hidden mb-6">
            {round.investors.map((investor, index) => (
              <div key={investor.id} className={`flex items-center justify-between p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                {editingInvestorId === investor.id ? (
                  // Edit form for this investor
                  <div className="w-full flex flex-col space-y-3">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={editInvestorName}
                        onChange={(e) => setEditInvestorName(e.target.value)}
                        className={inputClassName}
                        placeholder="Investor Name"
                      />
                      <input
                        type="number"
                        value={editInvestorAmount}
                        onChange={(e) => setEditInvestorAmount(e.target.value)}
                        className={inputClassName}
                        placeholder="Investment Amount"
                        step="1"
                        min="0"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 flex items-center"
                      >
                        <FiX className="mr-1" size={14} /> Cancel
                      </button>
                      <button
                        onClick={handleSaveInvestorEdit}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center"
                      >
                        <FiCheck className="mr-1" size={14} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display investor info with edit/delete buttons
                  <>
                    <div className="flex items-center">
                      {/* Use consistent avatar component */}
                      <ShareholderAvatar 
                        name={investor.name}
                        id={investor.id}
                        roundId={round.id}
                      />
                      <div>
                        <div className="font-medium text-gray-800">{investor.name}</div>
                        <div className="text-sm text-gray-500">{formatNumber(investor.amountInvested, 'currency')}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditInvestor(investor)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit investor"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteInvestor(investor.id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Remove investor"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg border border-gray-200 italic mb-6">No investors added yet.</div>
        )}

        {/* Add New Investor Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Add New Investor</h4>
          <div className="flex items-end space-x-3">
            <div className="flex-grow">
              <label htmlFor={`new-investor-name-${round.id}`} className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                id={`new-investor-name-${round.id}`}
                value={newInvestorName}
                onChange={(e) => setNewInvestorName(e.target.value)}
                className={inputClassName}
                placeholder="Investor Name"
              />
            </div>
            <div className="flex-grow">
              <label htmlFor={`new-investor-amount-${round.id}`} className="block text-xs font-medium text-gray-600 mb-1">Amount ($)</label>
              <input
                type="number"
                id={`new-investor-amount-${round.id}`}
                value={newInvestorAmount}
                onChange={(e) => setNewInvestorAmount(e.target.value)}
                className={inputClassName}
                placeholder="Investment Amount"
                step="1"
                min="0"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <button
              onClick={handleAddInvestor}
              className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm whitespace-nowrap flex items-center"
            >
              <FiPlus className="mr-1" size={16} /> Add Investor
            </button>
          </div>
        </div>
      </div>
      
      {/* Remove Round Button */}
      <div className="flex justify-end">
        <button
          onClick={() => onRemove(round.id)}
          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100 flex items-center"
        >
          <FiTrash2 className="mr-1" size={14} /> Remove Round
        </button>
      </div>
    </div>
  );
};

export default FundingRoundInput;
