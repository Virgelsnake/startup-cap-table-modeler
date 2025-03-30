import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { CapTableState, FundingRound, Investor, CalculatedCapTable, Founder } from '../types/capTable';
import { calculateCapTable } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';

interface CapTableContextType {
  state: CapTableState;
  // Funding round functions
  addRound: (roundName: string, preMoney: number) => void;
  updateRound: (roundId: string, updates: Partial<FundingRound>) => void;
  removeRound: (roundId: string) => void;
  // Investor functions
  addInvestor: (roundId: string, investorName: string, amountInvested: number) => void;
  updateInvestor: (roundId: string, investorId: string, updates: Partial<Investor>) => void;
  removeInvestor: (roundId: string, investorId: string) => void;
  // Founder functions
  addFounder: (founderName: string, shares: number) => void;
  updateFounder: (founderId: string, updates: Partial<Founder>) => void;
  removeFounder: (founderId: string) => void;
  // Initial setup functions
  setFoundersShares: (shares: number) => void;
  setInitialValuation: (valuation: number) => void;
  setInitialPricePerShare: (pps: number) => void;
  calculatedTable: CalculatedCapTable;
}

const CapTableContext = createContext<CapTableContextType | undefined>(undefined);

const initialState: CapTableState = {
  foundersShares: 0, 
  initialValuation: 0, 
  initialPricePerShare: 0,
  founders: [],
  fundingRounds: [],
};

interface CapTableProviderProps {
  children: ReactNode;
}

export const CapTableProvider: React.FC<CapTableProviderProps> = ({ children }) => {
  const [state, setState] = useState<CapTableState>(initialState);

  // This function now calculates the total shares from individual founders
  const setFoundersShares = useCallback((shares: number) => {
    shares = Math.max(0, shares); 
    setState(prevState => {
      const roundedShares = Math.round(shares);
      let newInitialValuation = prevState.initialValuation;
      if (prevState.initialPricePerShare > 0) {
        newInitialValuation = roundedShares * prevState.initialPricePerShare;
      }
      return {
        ...prevState,
        foundersShares: roundedShares,
        initialValuation: Math.round(newInitialValuation),
      };
    });
  }, []);
  
  // Add a new founder
  const addFounder = useCallback((founderName: string, shares: number) => {
    const newFounder: Founder = {
      id: uuidv4(),
      name: founderName,
      shares: Math.round(Math.max(0, shares)),
    };
    
    setState(prevState => {
      // Calculate new total founders shares
      const newTotalShares = prevState.founders.reduce(
        (sum, founder) => sum + founder.shares, 0
      ) + newFounder.shares;
      
      // Calculate new valuation based on price per share
      let newValuation = prevState.initialValuation;
      if (prevState.initialPricePerShare > 0) {
        newValuation = newTotalShares * prevState.initialPricePerShare;
      }
      
      return {
        ...prevState,
        founders: [...prevState.founders, newFounder],
        foundersShares: newTotalShares,
        initialValuation: Math.round(newValuation),
      };
    });
  }, []);
  
  // Update an existing founder
  const updateFounder = useCallback((founderId: string, updates: Partial<Founder>) => {
    setState(prevState => {
      // Update the founder
      const updatedFounders = prevState.founders.map(founder =>
        founder.id === founderId ? { ...founder, ...updates } : founder
      );
      
      // Recalculate total shares
      const newTotalShares = updatedFounders.reduce(
        (sum, founder) => sum + founder.shares, 0
      );
      
      // Recalculate valuation based on price per share
      let newValuation = prevState.initialValuation;
      if (prevState.initialPricePerShare > 0) {
        newValuation = newTotalShares * prevState.initialPricePerShare;
      }
      
      return {
        ...prevState,
        founders: updatedFounders,
        foundersShares: newTotalShares,
        initialValuation: Math.round(newValuation),
      };
    });
  }, []);
  
  // Remove a founder
  const removeFounder = useCallback((founderId: string) => {
    setState(prevState => {
      // Remove the founder
      const updatedFounders = prevState.founders.filter(founder => founder.id !== founderId);
      
      // Recalculate total shares
      const newTotalShares = updatedFounders.reduce(
        (sum, founder) => sum + founder.shares, 0
      );
      
      // Recalculate valuation based on price per share
      let newValuation = prevState.initialValuation;
      if (prevState.initialPricePerShare > 0) {
        newValuation = newTotalShares * prevState.initialPricePerShare;
      }
      
      return {
        ...prevState,
        founders: updatedFounders,
        foundersShares: newTotalShares,
        initialValuation: Math.round(newValuation),
      };
    });
  }, []);

  const setInitialValuation = useCallback((valuation: number) => {
    valuation = Math.max(0, valuation); 
    setState(prevState => {
      const roundedValuation = Math.round(valuation);
      let newInitialPricePerShare = prevState.initialPricePerShare;
      if (prevState.foundersShares > 0) {
        newInitialPricePerShare = roundedValuation / prevState.foundersShares;
      }
      return {
        ...prevState,
        initialValuation: roundedValuation,
        initialPricePerShare: Math.round(newInitialPricePerShare),
      };
    });
  }, []);

  const setInitialPricePerShare = useCallback((pps: number) => {
    pps = Math.max(0, pps); 
    setState(prevState => {
      const roundedPPS = Math.round(pps);
      let newInitialValuation = prevState.initialValuation;
      if (prevState.foundersShares > 0) {
        newInitialValuation = prevState.foundersShares * roundedPPS;
      }
      return {
        ...prevState,
        initialPricePerShare: roundedPPS,
        initialValuation: Math.round(newInitialValuation),
      };
    });
  }, []);

  const addRound = useCallback((roundName: string, preMoney: number) => {
    const newRound: FundingRound = {
      id: uuidv4(),
      name: roundName,
      preMoneyValuation: preMoney,
      calculationMethod: 'by_valuation',
      newSharesIssued: undefined,
      investors: [],
    };
    setState(prevState => ({
      ...prevState,
      fundingRounds: [...prevState.fundingRounds, newRound],
    }));
  }, []);

  const updateRound = useCallback((roundId: string, updates: Partial<FundingRound>) => {
    setState(prevState => ({
      ...prevState,
      fundingRounds: prevState.fundingRounds.map(round =>
        round.id === roundId ? { ...round, ...updates } : round
      ),
    }));
  }, []);

  const removeRound = useCallback((roundId: string) => {
    setState(prevState => ({
      ...prevState,
      fundingRounds: prevState.fundingRounds.filter(round => round.id !== roundId)
    }));
  }, []);

  const addInvestor = useCallback(
    (roundId: string, investorName: string, amountInvested: number) => {
      const newInvestor: Investor = {
        id: uuidv4(),
        name: investorName,
        amountInvested: amountInvested,
      };
      setState(prevState => ({
        ...prevState,
        fundingRounds: prevState.fundingRounds.map(round =>
          round.id === roundId
            ? { ...round, investors: [...round.investors, newInvestor] }
            : round
        ),
      }));
    },
    []
  );

  const updateInvestor = useCallback(
    (roundId: string, investorId: string, updates: Partial<Investor>) => {
      setState(prevState => ({
        ...prevState,
        fundingRounds: prevState.fundingRounds.map(round =>
          round.id === roundId
            ? {
                ...round,
                investors: round.investors.map(investor =>
                  investor.id === investorId ? { ...investor, ...updates } : investor
                ),
              }
            : round
        ),
      }));
    },
    []
  );

  const removeInvestor = useCallback((roundId: string, investorId: string) => {
    setState(prevState => ({
        ...prevState,
        fundingRounds: prevState.fundingRounds.map(round =>
          round.id === roundId
            ? { ...round, investors: round.investors.filter(inv => inv.id !== investorId) }
            : round
        ),
      }));
  }, []);

  const calculatedTable = useMemo(() => {
    console.log("Recalculating Cap Table...");
    return calculateCapTable(state);
  }, [state]);

  const value = {
    state,
    addRound,
    updateRound,
    removeRound,
    addInvestor,
    updateInvestor,
    removeInvestor,
    addFounder,
    updateFounder,
    removeFounder,
    setFoundersShares,
    setInitialValuation,
    setInitialPricePerShare,
    calculatedTable,
  };

  return (
    <CapTableContext.Provider value={value}>
      {children}
    </CapTableContext.Provider>
  );
};

export const useCapTable = (): CapTableContextType => {
  const context = useContext(CapTableContext);
  if (context === undefined) {
    throw new Error('useCapTable must be used within a CapTableProvider');
  }
  return context;
};
