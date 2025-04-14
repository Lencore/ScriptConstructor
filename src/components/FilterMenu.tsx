import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface FilterMenuProps {
  filterTypes: string[];
  onToggle: (type: string) => void;
  onReset: () => void;
  onClose: () => void;
  title: string;
}

export function FilterMenu({ 
  filterTypes, 
  onToggle, 
  onReset,
  onClose,
  title
}: FilterMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg p-3 min-w-[160px] z-50"
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <h3 className="text-sm font-medium text-google-gray-dark">{title}</h3>
        {filterTypes.length > 0 && (
          <button
            onClick={onReset}
            className="text-google-red hover:text-opacity-80 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="space-y-1">
        {['A', 'B', 'C'].map((type) => (
          <label 
            key={type}
            className="flex items-center px-2 py-1 rounded hover:bg-google-gray-light 
                     cursor-pointer transition-colors w-full"
          >
            <input
              type="checkbox"
              checked={filterTypes.includes(type)}
              onChange={() => onToggle(type)}
              className="w-3.5 h-3.5 rounded border-google-gray-lighter text-google-blue 
                       focus:ring-1 focus:ring-google-blue focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-google-gray-dark">Блок {type}</span>
          </label>
        ))}
      </div>
    </div>
  );
} 