import React from 'react';
import { T, I } from './theme';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  confirmColor = T.teal,
  icon = "bell" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-[320px] bg-white rounded-[28px] p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: confirmColor + '10', color: confirmColor }}>
            <I n={icon} s={24} />
          </div>

          <h3 className="text-lg font-bold mb-2" style={{ color: T.navy, fontFamily: 'DM Serif Display' }}>
            {title}
          </h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed" style={{ fontFamily: 'Outfit' }}>
            {message}
          </p>

          <div className="flex flex-col w-full gap-2">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-all active:scale-95 shadow-lg"
              style={{ background: confirmColor, boxShadow: `0 8px 20px ${confirmColor}33`, fontFamily: 'Outfit' }}>
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl text-slate-400 font-bold text-sm hover:bg-slate-50 transition-all"
              style={{ fontFamily: 'Outfit' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
