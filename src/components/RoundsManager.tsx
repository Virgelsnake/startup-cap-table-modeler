import React from 'react';
import { useCapTable } from '../context/CapTableContext';

const RoundsManager: React.FC = () => {
  const { addRound } = useCapTable();

  console.log("RoundsManager: Rendering");

  const handleAddRound = () => {
    addRound("New Round", 0);
  };

  return (
    <div className="mt-6 text-center">
      <button
        onClick={handleAddRound}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        + Add Funding Round
      </button>
    </div>
  );
};

export default RoundsManager;
