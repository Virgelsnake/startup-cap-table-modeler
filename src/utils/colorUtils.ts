// Color utility functions for consistent colors across the application

// Base colors available
const baseColors = [
  'blue',    // Index 0: Reserved for Initial/Founders
  'green',   // Index 1: First funding round / First investor color
  'purple',  // Index 2
  'orange',  // Index 3
  'pink',    // Index 4
  'indigo',  // Index 5
  'teal',    // Index 6
  'red',     // Index 7
  'yellow',  // Index 8
];

// Intensity levels for shades (background)
const intensityLevels = [
  '100',  // Light
  '200',  // Medium-light
  '300',  // Medium
  '400',  // Medium-dark
  '500',  // Dark
];

// Cache for shareholder colors to ensure consistency across components
const shareholderColorCache: Record<string, { bg: string }> = {};

// Cache for round background colors (used for UI elements, not shareholders)
const roundUiColorCache: Record<string, string> = {};

// Global counter for round indices to assign UI colors
let globalRoundIndexCounter = 0;
const roundIndexMap: Record<string, number> = { initial: 0 }; // 'initial' maps to founder color index

// Default background color if something goes wrong
const DEFAULT_BG = 'bg-gray-200';

/**
 * Simple hash function for string to integer.
 * @param str - Input string
 * @returns 32-bit integer hash
 */
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

/**
 * Returns a UI base color for a funding round (e.g., for card backgrounds)
 * This is SEPARATE from shareholder avatar colors.
 * @param roundId - The round identifier
 * @returns The base color name (e.g., 'blue', 'green')
 */
export const getRoundUiBaseColor = (roundId: string): string => {
  if (roundUiColorCache[roundId]) {
    return roundUiColorCache[roundId];
  }

  // Use index 0 ('blue') for the initial/founders round UI elements
  if (roundId === 'initial') {
     roundUiColorCache[roundId] = baseColors[0];
     return baseColors[0];
  }

  // Assign a unique, persistent index if not already mapped (starting from 1)
  if (roundIndexMap[roundId] === undefined) {
    globalRoundIndexCounter++;
    roundIndexMap[roundId] = globalRoundIndexCounter;
  }
  const roundIndex = roundIndexMap[roundId];

  // Determine color based on the persistent index, cycling through available colors (skipping index 0)
  const colorIndex = 1 + ((roundIndex - 1) % (baseColors.length - 1));
  const color = baseColors[colorIndex];

  roundUiColorCache[roundId] = color; // Cache the determined color
  return color;
};

/**
 * Returns a consistent color pair (avatar background) for any shareholder.
 * Founders always get the 'initial' base color.
 * Investors get a consistent base color based on their ID.
 * Intensity is always based on shareholder ID.
 * @param shareholderId - The founder or investor identifier
 * @param isFounder - Boolean flag indicating if the shareholder is a founder
 * @returns Object with bg (background) color class
 */
export const getShareholderColor = (
  shareholderId: string,
  isFounder: boolean,
): { bg: string } => {
  try {
    if (!shareholderId) {
      console.warn(`getShareholderColor: Invalid input - shareholderId is empty`);
      return { bg: DEFAULT_BG };
    }

    // Check cache first
    if (shareholderColorCache[shareholderId]) {
      return shareholderColorCache[shareholderId];
    }

    // Determine Base Color
    let baseColor: string;
    if (isFounder) {
      baseColor = baseColors[0]; // Founders always use the first color (e.g., 'blue')
    } else {
      // Investors: Hash ID to pick a base color (excluding the founder color at index 0)
      const investorBaseHash = simpleHash(`base-${shareholderId}`); // Salt for distinction
      const availableBaseColors = baseColors.slice(1);
      const baseColorIndex = Math.abs(investorBaseHash) % availableBaseColors.length;
      baseColor = availableBaseColors[baseColorIndex];
    }

    // Determine Intensity (Shade)
    const intensityHash = simpleHash(`intensity-${shareholderId}`); // Salt for distinction
    const intensityIndex = Math.abs(intensityHash) % intensityLevels.length;
    const intensity = intensityLevels[intensityIndex];

    // Combine base color and intensity
    const result = {
      bg: `bg-${baseColor}-${intensity}`
    };

    // Cache the result
    shareholderColorCache[shareholderId] = result;

    // console.log(`Color generated for ${shareholderId} (Founder: ${isFounder}): ${result.bg}`); // Debug log (optional)
    return result;

  } catch (error) {
    console.error(`Error generating shareholder color for ${shareholderId}:`, error);
    return { bg: DEFAULT_BG };
  }
};

/**
 * Returns a consistent color pair for an investor.
 * @param investorId - The investor identifier
 * @returns Object with bg (background) color class
 */
export const getInvestorColors = (investorId: string): { bg: string } => {
  // Call the unified function, indicating this is NOT a founder
  return getShareholderColor(investorId, false);
};

/**
 * Returns a consistent color pair for a founder.
 * @param founderId - The founder identifier
 * @returns Object with bg (background) color class
 */
export const getFounderColors = (founderId: string): { bg: string } => {
  // Call the unified function, indicating this IS a founder
  return getShareholderColor(founderId, true);
};

/**
 * Returns consistent badge styling for percentages or tags for any shareholder.
 * Uses the shareholder's consistent color but forces the lightest intensity.
 * @param shareholderId - The founder or investor identifier
 * @param isFounder - Boolean flag indicating if the shareholder is a founder
 * @returns Object with bg (background) color class for badges
 */
export const getShareholderBadgeColor = (
  shareholderId: string,
  isFounder: boolean,
): { bg: string } => {
  try {
    if (!shareholderId) {
      console.warn(`getShareholderBadgeColor: Invalid input - shareholderId is empty`);
      return { bg: 'bg-gray-50' }; // Default light gray badge
    }

    // Get the shareholder's base color and intensity
    const shareholderColors = getShareholderColor(shareholderId, isFounder);

    // Create badge color by forcing intensity '100'
    const badgeBg = shareholderColors.bg.replace(/-(\d+)$/, '-100');

    // Basic validation
    if (!badgeBg.startsWith('bg-')) {
      console.error(`Generated invalid badge class: ${badgeBg} from ${shareholderColors.bg}`);
      return { bg: 'bg-gray-100' };
    }

    return { bg: badgeBg };

  } catch (error) {
    console.error(`Error generating badge color for ${shareholderId}:`, error);
    return { bg: 'bg-gray-100' }; // Slightly darker default badge on error
  }
};

/**
 * Returns badge colors for an investor.
 * @param investorId - The investor identifier
 * @returns Object with bg (background) color class for badges
 */
export const getInvestorBadgeColors = (investorId: string): { bg: string } => {
  return getShareholderBadgeColor(investorId, false);
};

/**
 * Returns badge colors for a founder.
 * @param founderId - The founder identifier
 * @returns Object with bg (background) color class for badges
 */
export const getFounderBadgeColors = (founderId: string): { bg: string } => {
  return getShareholderBadgeColor(founderId, true);
};
