'use client';

import { useState, useRef } from 'react';
import { FiInfo } from 'react-icons/fi';
import { usePopper } from 'react-popper';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const InfoTooltip = ({ 
  content, 
  position = 'top', 
  className = '' 
}: InfoTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const referenceRef = useRef<HTMLButtonElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  
  // Close tooltip when clicking outside
  useOnClickOutside(popperRef, () => {
    if (isVisible) setIsVisible(false);
  });

  // Configure popper
  const { styles, attributes } = usePopper(
    referenceRef.current,
    popperRef.current,
    {
      placement: position,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    }
  );

  return (
    <>
      <button
        ref={referenceRef}
        type="button"
        className={`ml-1 text-gray-400 hover:text-gray-500 focus:outline-none ${className}`}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Information"
      >
        <FiInfo size={16} />
      </button>
      
      {isVisible && (
        <div
          ref={popperRef}
          style={styles.popper}
          {...attributes.popper}
          className="z-10 bg-gray-800 text-white text-sm rounded-md shadow-lg p-3 max-w-xs"
        >
          {content}
          <div className="tooltip-arrow" data-popper-arrow />
        </div>
      )}
    </>
  );
};

export default InfoTooltip;
