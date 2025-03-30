import { CapTableProvider, useCapTable } from './context/CapTableContext'; 
import FoundersInput from './components/FoundersInput';
import RoundsManager from './components/RoundsManager';
import CapTableDisplay from './components/CapTableDisplay';
import FundingRoundPair from './components/FundingRoundPair';
// Import icons
import { FiPieChart, FiDollarSign, FiUsers } from 'react-icons/fi';

function AppContent() { 
  const { state, calculatedTable, updateRound, removeRound } = useCapTable(); 

  // Log state before rendering grid
  console.log(`App.tsx: Rendering Grid. state.fundingRounds count: ${state.fundingRounds.length}, calculatedTable.rounds count: ${calculatedTable?.rounds.length}`);

  // Find matching calculated rounds for each funding round
  const getCalculatedRoundForId = (roundId: string) => {
    return calculatedTable?.rounds.find(r => r.roundId === roundId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm py-4 px-6 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-green-600 text-2xl font-bold mr-2">CAP</span>
            <span className="text-gray-800 text-2xl font-bold">TABLE</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out flex items-center">
              <span className="mr-2">Export PDF</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center border border-gray-100">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FiUsers className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Total Founders</h3>
              <p className="text-2xl font-bold text-gray-800">{state.founders.length || 0}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center border border-gray-100">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <FiPieChart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Funding Rounds</h3>
              <p className="text-2xl font-bold text-gray-800">{state.fundingRounds.length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center border border-gray-100">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <FiDollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Initial Valuation</h3>
              <p className="text-2xl font-bold text-gray-800">${new Intl.NumberFormat('en-US').format(state.initialValuation)}</p>
            </div>
          </div>
        </div>
        
        {/* Founders Section - Initial Setup and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <FoundersInput />
          </div>
          <div>
            <CapTableDisplay calculatedTable={calculatedTable} />
          </div>
        </div>

        {/* Funding Rounds Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Funding Rounds</h2>
          </div>
          
          {/* Render each funding round with its corresponding summary */}
          {state.fundingRounds.map(round => (
            <FundingRoundPair
              key={round.id}
              round={round}
              calculatedRound={getCalculatedRoundForId(round.id)}
              onUpdate={updateRound}
              onRemove={removeRound}
            />
          ))}
          
          {/* Add New Round Button */}
          <RoundsManager />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <CapTableProvider>
      <AppContent /> 
    </CapTableProvider>
  )
}

export default App
