import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface FilterMenuProps {
  title: string;
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function FilterMenu({ 
  title, 
  selectedTypes, 
  onTypeToggle, 
  onReset,
  isOpen,
  onClose 
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

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg 
                 border border-gray-200 py-2 z-50"
    >
      {['A', 'B', 'C'].map((type) => (
        <label 
          key={type}
          className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedTypes.includes(type)}
            onChange={() => onTypeToggle(type)}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 
                     focus:ring-purple-500"
          />
          <span className="ml-3 text-gray-700">Блок {type}</span>
        </label>
      ))}
    </div>
  );
} 