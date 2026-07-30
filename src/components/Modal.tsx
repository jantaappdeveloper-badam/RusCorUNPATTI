import React from 'react';
import { soundEngine } from '../utils/audio';
import { Info, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="vibrant-card p-6 md:p-8 max-w-sm md:max-w-md w-full text-[#1E1B4B] text-center relative">
        <button
          onClick={() => {
            soundEngine.playClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-900 p-1.5 rounded-full bg-indigo-50 transition-colors"
        >
          <X className="w-5 h-5 font-bold" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 mx-auto mb-4 flex items-center justify-center border border-indigo-200">
          <Info className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black mb-2 text-[#1E1B4B]">{title}</h3>
        <p className="text-indigo-900/80 text-xs md:text-sm leading-relaxed mb-6 font-medium">
          {message}
        </p>

        <button
          onClick={() => {
            soundEngine.playClickSound();
            onClose();
          }}
          className="w-full btn-vibrant-yellow font-extrabold py-3.5 px-6 rounded-2xl text-sm"
          id="modal-ok-btn"
        >
          OK, Paham
        </button>
      </div>
    </div>
  );
};
