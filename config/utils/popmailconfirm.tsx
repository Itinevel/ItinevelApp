// components/Popup.tsx
"use client";
import React from 'react';

interface PopupProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ message, show, onClose }) => {
  if (!show) return null; // Only render the popup if "show" is true

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold text-center mb-4">Confirmation Required</h2>
        <p className="text-gray-700 text-center mb-6">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
