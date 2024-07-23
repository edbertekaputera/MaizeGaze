import React, { useState } from 'react';

function GuideButton({
  buttonColor = 'bg-blue-500',
  buttonHoverColor = 'bg-blue-600',
  tooltipColor = 'bg-gray-800',
  iconColor = 'text-white',
  tooltipContent = 'A notice will be displayed when the button is hovered.'
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        className={`p-2 rounded-full ${buttonColor} ${iconColor} hover:${buttonHoverColor} transition-colors duration-300`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </button>
      {isHovered && (
        <div className={`absolute left-full ml-2 p-2 ${tooltipColor} text-white text-sm rounded shadow-lg max-w-xs`}>
          {tooltipContent}
        </div>
      )}
    </div>
  );
}

export default GuideButton;