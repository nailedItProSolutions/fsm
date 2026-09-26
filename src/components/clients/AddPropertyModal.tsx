'use client';

import React, { useState } from 'react';
import { useFSMStore } from '@/lib/useStore';
import { X, Building2, MapPin, Key, Plus, CheckCircle2 } from 'lucide-react';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  onSuccess?: () => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
  onSuccess,
}) => {
  const { addProperty } = useFSMStore();

  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [city, setCity] = useState('Rome');
  const [state, setState] = useState('GA');
  const [zip, setZip] = useState('30161');
  const [gateCode, setGateCode] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addProperty({
      clientId,
      label: label || 'Additional Property',
      street,
      unit,
      city,
      state,
      zip,
      gateCode,
      accessInstructions,
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-lg w-full border border-[#2a2a2a] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/*  */}
        <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#fdfbf7] font-heading">Add Property to Portfolio</h3>
              <p className="text-xs text-[#b8b0a5]">Linking new address to {clientName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#78716c] hover:text-[#fdfbf7] p-1 rounded-lg hover:bg-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
              Property Description / Unit Identifier *
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Unit 4B - Riverfront Duplex, Commercial Storefront"
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 312 Broad St"
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                Unit / Suite
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Suite 102"
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">Zip Code</label>
              <input
                type="text"
                required
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-[#c5a059]" />
                <span>Gate / Lockbox Code</span>
              </label>
              <input
                type="text"
                value={gateCode}
                onChange={(e) => setGateCode(e.target.value)}
                placeholder="Lockbox 4812 on gas meter"
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">Access Notes</label>
              <input
                type="text"
                value={accessInstructions}
                onChange={(e) => setAccessInstructions(e.target.value)}
                placeholder="Call tenant prior to arrival"
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="border-t border-[#222222] pt-4 mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-semibold text-[#b8b0a5] hover:bg-[#1a1a1a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold shadow-md transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Property</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
