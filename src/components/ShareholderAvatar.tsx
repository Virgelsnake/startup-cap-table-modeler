import React from 'react';
import { getInvestorColors } from '../utils/colorUtils';

interface ShareholderAvatarProps {
  name: string;
  id: string;
  roundId: string;
}

/**
 * A consistent avatar component for shareholders (founders and investors)
 * This ensures the same styling is applied across all tables
 */
const ShareholderAvatar: React.FC<ShareholderAvatarProps> = ({ name, id, roundId }) => {
  const colors = getInvestorColors(roundId, id);
  
  return (
    <div className={`h-8 w-8 rounded-full ${colors.bg} flex items-center justify-center mr-3`}>
      <span className="font-medium text-gray-900">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
};

export default ShareholderAvatar;
