import React, { useState } from 'react';
import { useCapTable } from '../context/CapTableContext';
import { Founder } from '../types/capTable';
// Explicitly add .ts extension to ensure module resolution
import { formatNumber, parseFormattedNumber } from '../utils/formatting.ts';
// Import icons
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import ShareholderAvatar from './ShareholderAvatar';

const FoundersInput: React.FC = () => {
  // Destructure context values
  const { 
    state, 
    setFoundersShares, 
    setInitialValuation, 
    setInitialPricePerShare,
    addFounder,
    updateFounder,
    removeFounder
  } = useCapTable();

  // State for adding new founders
  const [newFounderName, setNewFounderName] = useState('');
  const [newFounderShares, setNewFounderShares] = useState<number | string>('');
  
  // State for editing founders
  const [editingFounderId, setEditingFounderId] = useState<string | null>(null);
  const [editFounderName, setEditFounderName] = useState('');
  const [editFounderShares, setEditFounderShares] = useState<number | string>('');

  const handleSharesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFormattedNumber(event.target.value);
    setFoundersShares(isNaN(value) ? 0 : value);
  };

  const handleValuationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFormattedNumber(event.target.value);
    setInitialValuation(isNaN(value) ? 0 : value);
  };

  const handlePricePerShareChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFormattedNumber(event.target.value);
    setInitialPricePerShare(isNaN(value) ? 0 : value);
  };
  
  // Handle adding a new founder
  const handleAddFounder = () => {
    const trimmedName = newFounderName.trim();
    const shares = typeof newFounderShares === 'string' ? parseFloat(newFounderShares) : newFounderShares;
    
    if (trimmedName && !isNaN(shares) && shares > 0) {
      addFounder(trimmedName, shares);
      setNewFounderName('');
      setNewFounderShares('');
    } else {
      console.warn('Founder name cannot be empty and shares must be a positive number.');
    }
  };
  
  // Start editing a founder
  const handleEditFounder = (founder: Founder) => {
    setEditingFounderId(founder.id);
    setEditFounderName(founder.name);
    setEditFounderShares(founder.shares);
  };
  
  // Save founder edits
  const handleSaveFounderEdit = () => {
    if (!editingFounderId) return;
    
    const trimmedName = editFounderName.trim();
    const shares = typeof editFounderShares === 'string' ? parseFloat(editFounderShares) : editFounderShares;
    
    if (trimmedName && !isNaN(shares) && shares > 0) {
      updateFounder(editingFounderId, {
        name: trimmedName,
        shares: shares
      });
      // Reset edit state
      setEditingFounderId(null);
      setEditFounderName('');
      setEditFounderShares('');
    } else {
      console.warn('Founder name cannot be empty and shares must be a positive number.');
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingFounderId(null);
    setEditFounderName('');
    setEditFounderShares('');
  };
  
  // Delete a founder
  const handleDeleteFounder = (founderId: string) => {
    if (window.confirm('Are you sure you want to remove this founder?')) {
      removeFounder(founderId);
    }
  };

  const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm";
  const cardClassName = "bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden";

  return (
    <div className={`${cardClassName} mb-6 overflow-visible`}>
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Initial Setup</h2>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="founders-shares" className="block text-sm font-medium text-gray-700">
            Total Initial Founders' Shares
          </label>
          <input
            type="text"
            id="founders-shares"
            value={formatNumber(state.foundersShares, 'shares')}
            onChange={handleSharesChange}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            pattern="[0-9,]*"
            className={inputClassName}
            min="0"
            step="1"
            readOnly={state.founders.length > 0}
          />
          <p className="mt-1 text-xs text-gray-500">
            {state.founders.length > 0 
              ? "This value is calculated from individual founders' shares below." 
              : "The total number of shares held by founders before any investment."}
          </p>
        </div>

        <div>
          <label htmlFor="initial-valuation" className="block text-sm font-medium text-gray-700">
            Initial Valuation ($)
          </label>
          <input
            type="text"
            id="initial-valuation"
            value={formatNumber(state.initialValuation, 'currency', 0)}
            onChange={handleValuationChange}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            pattern="[0-9]*"
            className={inputClassName}
            min="0"
            step="1"
          />
          <p className="mt-1 text-xs text-gray-500">Implied valuation based on founders' shares. Used to calculate initial share price.</p>
        </div>

        <div>
          <label htmlFor="initial-pps" className="block text-sm font-medium text-gray-700">
            Initial Price Per Share ($)
          </label>
          <input
            type="text"
            id="initial-pps"
            value={formatNumber(state.initialPricePerShare, 'currency', 0)}
            onChange={handlePricePerShareChange}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            pattern="[0-9]*"
            className={inputClassName}
            min="0"
            step="1"
          />
          </div>
        </div>
      
        {/* Display Existing Founders */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Founders</h4>
          {state.founders && state.founders.length > 0 ? (
            <div className="rounded-lg border border-gray-100 overflow-hidden">
              {state.founders.map((founder, index) => (
                <div key={founder.id} className={`flex items-center justify-between p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  {editingFounderId === founder.id ? (
                    // Edit form for this founder
                    <div className="w-full flex flex-col space-y-3">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={editFounderName}
                          onChange={(e) => setEditFounderName(e.target.value)}
                          className={inputClassName}
                          placeholder="Founder Name"
                        />
                        <input
                          type="number"
                          value={editFounderShares}
                          onChange={(e) => setEditFounderShares(e.target.value)}
                          className={inputClassName}
                          placeholder="Number of Shares"
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
                          onClick={handleSaveFounderEdit}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center"
                        >
                          <FiCheck className="mr-1" size={14} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display founder info with edit/delete buttons
                    <>
                      <div className="flex items-center">
                        {/* Use consistent avatar component for founders */}
                        <ShareholderAvatar 
                          name={founder.name}
                          id={founder.id}
                          roundId="initial"
                        />
                        <div>
                          <div className="font-medium text-gray-800">{founder.name}</div>
                          <div className="text-sm text-gray-500">{formatNumber(founder.shares, 'shares')} shares</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditFounder(founder)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit founder"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteFounder(founder.id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Remove founder"
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
            <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg border border-gray-200 italic">No founders added yet.</div>
          )}
        </div>
      
        {/* Add New Founder Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Add New Founder</h4>
          <div className="flex items-end space-x-3">
            <div className="flex-grow">
              <label htmlFor="new-founder-name" className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                id="new-founder-name"
                value={newFounderName}
                onChange={(e) => setNewFounderName(e.target.value)}
                className={inputClassName}
                placeholder="Founder Name"
              />
            </div>
            <div className="flex-grow">
              <label htmlFor="new-founder-shares" className="block text-xs font-medium text-gray-600 mb-1">Shares</label>
              <input
                type="number"
                id="new-founder-shares"
                value={newFounderShares}
                onChange={(e) => setNewFounderShares(e.target.value)}
                className={inputClassName}
                placeholder="Number of Shares"
                step="1"
                min="0"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <button
              onClick={handleAddFounder}
              className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm whitespace-nowrap flex items-center"
            >
              <FiPlus className="mr-1" size={16} /> Add Founder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundersInput;
