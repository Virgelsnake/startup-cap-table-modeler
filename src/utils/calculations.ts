import { CapTableState, CalculatedCapTable, CapTableEntry } from '../types/capTable';

/**
 * Calculates the capitalization table based on founder shares and subsequent funding rounds.
 * @param state The current state containing founder shares and funding rounds.
 * @returns The calculated capitalization table.
 */
export const calculateCapTable = (state: CapTableState): CalculatedCapTable => {
  let currentTotalShares = state.foundersShares;

  // --- Initial Founders Round ---
  // Calculate initial price per share based on initial valuation, handle division by zero
  const initialPricePerShare = 
      (state.foundersShares > 0 && state.initialValuation > 0) 
      ? state.initialValuation / state.foundersShares 
      : 0;

  // Create entries for individual founders if they exist
  const initialRoundEntries: CapTableEntry[] = [];
  
  if (state.founders.length > 0) {
    // Add each individual founder as an entry
    state.founders.forEach(founder => {
      initialRoundEntries.push({
        shareholderId: founder.id,
        shareholderName: founder.name,
        roundId: 'initial',
        shares: founder.shares,
        // Individual ownership percentage (will be recalculated later)
        ownershipPercentage: state.foundersShares > 0 ? (founder.shares / state.foundersShares) * 100 : 0,
      });
    });
  } else {
    // If no individual founders, use the legacy single "Founders" entry
    initialRoundEntries.push({
      shareholderId: 'founders',
      shareholderName: 'Founders',
      roundId: 'initial',
      shares: state.foundersShares,
      // Ownership is 100% initially, calculation happens later if needed relative to others
      ownershipPercentage: 100, 
    });
  }

  const calculatedTable: CalculatedCapTable = {
    rounds: [
      {
        roundId: 'initial',
        roundName: 'Founders',
        // Use initialValuation as the post-money valuation for the first round
        postMoneyValuation: state.initialValuation,
        pricePerShare: initialPricePerShare, // Use calculated initial price per share
        totalShares: state.foundersShares,
        entries: initialRoundEntries, 
      },
    ],
  };

  // --- Subsequent Funding Rounds ---
  let previousRoundEntries = initialRoundEntries;

  state.fundingRounds.forEach((round) => {
    const previousTotalShares = currentTotalShares;
    const previousRound = calculatedTable.rounds[calculatedTable.rounds.length - 1]; // Get the most recently added round
    let newSharesThisRound = 0;
    let pricePerShareThisRound = 0;
    let postMoneyValuationThisRound = 0;

    // --- LOGGING: Round Inputs ---
    console.log(`
--- Calculating Round: ${round.name} (ID: ${round.id}) ---`);
    console.log(`Method: ${round.calculationMethod}, Prev Total Shares: ${previousTotalShares}`);
    if (round.calculationMethod === 'by_valuation') {
        console.log(`Input PreMoney: ${round.preMoneyValuation}`);
    } else {
        console.log(`Input Fixed New Shares: ${round.newSharesIssued}`);
    }
    console.log('Investors:', JSON.stringify(round.investors.map(inv => ({ name: inv.name, amount: inv.amountInvested })), null, 2));
    // --- END LOGGING ---

    const totalInvestmentThisRound = round.investors.reduce(
      (sum, inv) => sum + (inv.amountInvested || 0),
      0
    );
    console.log(`Calculated Total Investment: ${totalInvestmentThisRound}`); // LOG

    // --- Calculate Price Per Share and New Shares based on Method ---
    if (round.calculationMethod === 'by_valuation') {
        console.log('[Valuation Method] Calculating Price/Shares...'); // LOG
      if (round.preMoneyValuation <= 0 || previousTotalShares <= 0) {
          pricePerShareThisRound = 0; 
          newSharesThisRound = 0; 
          postMoneyValuationThisRound = round.preMoneyValuation + totalInvestmentThisRound;
          console.warn(`Round '${round.name}': Cannot calculate price per share with zero pre-money valuation or zero previous shares.`);
      } else {
          pricePerShareThisRound = round.preMoneyValuation / previousTotalShares;
          console.log(` -> Calculated PPS (PreMoney/PrevShares): ${pricePerShareThisRound}`); // LOG
          if (pricePerShareThisRound > 0) {
              newSharesThisRound = totalInvestmentThisRound / pricePerShareThisRound;
          } else {
              newSharesThisRound = 0; 
              console.warn(`Round '${round.name}': Calculated price per share is zero. Cannot determine new shares.`);
          }
          console.log(` -> Calculated New Shares (Invest/PPS): ${newSharesThisRound}`); // LOG
          postMoneyValuationThisRound = round.preMoneyValuation + totalInvestmentThisRound;
      }
    } else if (round.calculationMethod === 'by_fixed_shares') {
        console.log('[Fixed Shares Method] Calculating Price/Valuation...'); // LOG
      newSharesThisRound = round.newSharesIssued || 0;
      console.log(` -> Using Fixed New Shares: ${newSharesThisRound}`); // LOG
      if (newSharesThisRound > 0) {
          pricePerShareThisRound = totalInvestmentThisRound / newSharesThisRound;
          console.log(` -> Calculated PPS (Invest/NewShares): ${pricePerShareThisRound}`); // LOG
          const impliedPreMoney = pricePerShareThisRound * previousTotalShares;
          postMoneyValuationThisRound = impliedPreMoney + totalInvestmentThisRound;
      } else {
          pricePerShareThisRound = 0; 
          postMoneyValuationThisRound = previousRound.postMoneyValuation; 
          console.warn(`Round '${round.name}': Fixed shares set to zero. Cannot calculate price per share.`);
      }
    }

    console.log(`Final PPS for Round: ${pricePerShareThisRound}`); // LOG
    console.log(`Final New Shares for Round: ${newSharesThisRound}`); // LOG

    // Ensure non-negative shares and price
    newSharesThisRound = Math.max(0, newSharesThisRound);
    pricePerShareThisRound = Math.max(0, pricePerShareThisRound);
    currentTotalShares += newSharesThisRound; // Update total shares *after* calculations for this round

    // --- Create Entries for this Round --- 
    let currentRoundEntries: CapTableEntry[] = [];

    // 1. Carry over previous shareholders (diluted)
    previousRoundEntries.forEach(prevEntry => {
        currentRoundEntries.push({
            ...prevEntry, // Copy basic info
            roundId: round.id, // Update roundId for this snapshot
            // Shares remain the same, ownership % changes
        });
    });

    // 2. Add new investors for this round
    round.investors.forEach(investor => {
      if (pricePerShareThisRound > 0) {
          // --- LOGGING: Investor Share Calculation ---
          const investedAmount = investor.amountInvested || 0;
          console.log(` -> Allocating shares for ${investor.name}: Amount=${investedAmount}, PPS=${pricePerShareThisRound}`); // LOG
          // --- END LOGGING ---
          const sharesForInvestor = Math.max(0, (investor.amountInvested || 0) / pricePerShareThisRound);
          console.log(` -> Calculated sharesForInvestor: ${sharesForInvestor}`); // LOG

          // Check if investor already exists from a previous round (unlikely with unique IDs, but good practice)
          // For simplicity here, we assume unique investors per round or add shares if they reappear.
          // A more robust system might merge entries based on a global investor ID.
           currentRoundEntries.push({
              shareholderId: investor.id,
              shareholderName: investor.name,
              roundId: round.id,
              shares: sharesForInvestor,
              ownershipPercentage: 0, // Will calculate next
           });
      } else {
           // Handle case where price per share is zero - investor gets 0 shares for their investment
           currentRoundEntries.push({
                shareholderId: investor.id,
                shareholderName: investor.name,
                roundId: round.id,
                shares: 0,
                ownershipPercentage: 0,
            });
          console.warn(`Round '${round.name}', Investor '${investor.name}': Price per share is zero, assigned 0 shares.`);
      }
    });
    
     // --- Recalculate Ownership Percentages for this Round --- 
     // Calculate the sum of shares directly from the entries we've gathered for this round
     const sumOfEntryShares = currentRoundEntries.reduce((sum, entry) => sum + entry.shares, 0);
     // Use this sum as the denominator for percentage calculations
     const denominatorForPercentage = sumOfEntryShares; 

     // Compare with the pre-calculated total for debugging purposes
     const preCalculatedTotalShares = currentTotalShares; // This was updated earlier
     if (denominatorForPercentage > 0 && Math.abs(denominatorForPercentage - preCalculatedTotalShares) > 0.001) { 
         console.warn(
             `Round '${round.name}': Discrepancy Alert! Pre-calculated total shares (${preCalculatedTotalShares}) ` +
             `differs significantly from the actual sum of shares in the entry list (${denominatorForPercentage}). ` +
             `Percentages will be based on the ACTUAL SUM of entry shares (${denominatorForPercentage}) to ensure 100% total.`
         );
     }

     // Calculate percentages using the actual sum of shares in the list as the denominator
     if (denominatorForPercentage > 0) { 
         currentRoundEntries = currentRoundEntries.map((entry, idx) => {
             const calculatedPercentage = (entry.shares / denominatorForPercentage) * 100;
             // Log calculation for the first entry only to verify inputs
             if (idx === 0) {
                 console.log(` -> Percentage Calc (First Entry: ${entry.shareholderName}): shares=${entry.shares}, denominator=${denominatorForPercentage}, result=${calculatedPercentage}`);
             }
              return {
                  ...entry,
                  ownershipPercentage: calculatedPercentage,
              };
         });
     } else {
           // Handle zero total shares case 
           currentRoundEntries = currentRoundEntries.map(entry => ({ ...entry, ownershipPercentage: 0 }));
     }
     
     // Add the fully calculated round details to the table
     calculatedTable.rounds.push({
         roundId: round.id,
         roundName: round.name,
         postMoneyValuation: postMoneyValuationThisRound,
         pricePerShare: pricePerShareThisRound,
         // Report the total shares consistent with valuation calculations, even if denominator differed slightly
         totalShares: preCalculatedTotalShares, 
         entries: currentRoundEntries, 
     });

    // Update previous entries for the next iteration
    previousRoundEntries = currentRoundEntries;
  });

  return calculatedTable;
};
