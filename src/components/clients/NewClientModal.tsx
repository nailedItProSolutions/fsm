'use client';

import React, { useState } from 'react';
import { useFSMStore } from '@/lib/useStore';
import { X, Building2, User, MapPin, Key, FileText, CheckCircle2 } from 'lucide-react';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (clientId: string) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addClient } = useFSMStore();

  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Billing Address
  const [billStreet, setBillStreet] = useState('');
  const [billUnit, setBillUnit] = useState('');
  const [billCity, setBillCity] = useState('Austin');
  const [billState, setBillState] = useState('TX');
  const [billZip, setBillZip] = useState('78701');

  // Initial Service Property
  const [hasProperty, setHasProperty] = useState(true);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [propLabel, setPropLabel] = useState('Primary Residence');
  const [propStreet, setPropStreet] = useState('');
  const [propUnit, setPropUnit] = useState('');
  const [propCity, setPropCity] = useState('Austin');
  const [propState, setPropState] = useState('TX');
  const [propZip, setPropZip] = useState('78701');
  const [gateCode, setGateCode] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const clientData = {
      isCompany,
      companyName: isCompany ? companyName : undefined,
      firstName,
      lastName,
      email,
      phone,
      billingAddress: {
        street: billStreet,
        unit: billUnit,
        city: billCity,
        state: billState,
        zip: billZip,
      },
      notes,
    };

    let initialPropertyData = undefined;
    if (hasProperty) {
      initialPropertyData = {
        label: isCompany ? (propLabel || 'Main Property') : propLabel,
        street: sameAsBilling ? billStreet : propStreet,
        unit: sameAsBilling ? billUnit : propUnit,
        city: sameAsBilling ? billCity : propCity,
        state: sameAsBilling ? billState : propState,
        zip: sameAsBilling ? billZip : propZip,
        gateCode,
        accessInstructions,
      };
    }

    const created = addClient(clientData, initialPropertyData);
    if (onSuccess) {
      onSuccess(created.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#2a2a2a] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/*  */}
        <div className="bg-[#181818] border-b border-[#262626] text-[#fdfbf7] p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black font-bold text-base">
              +
            </div>
            <div>
              <h3 className="font-bold text-base text-[#fdfbf7]">Add New Client</h3>
              <p className="text-xs text-[#78716c]">Create client profile and initial property</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#78716c] hover:text-[#fdfbf7] p-1 rounded-lg hover:bg-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/*  */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#c5a059] mb-2">
              Client Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setIsCompany(false); setPropLabel('Primary Residence'); }}
                className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition ${
                  !isCompany 
                    ? 'border-[#c5a059] bg-[#c5a059]/10 ring-2 ring-[#c5a059]/20' 
                    : 'border-[#2a2a2a] hover:bg-[#1a1a1a]'
                }`}
              >
                <div className={`p-2 rounded-lg ${!isCompany ? 'bg-[#c5a059] text-black' : 'bg-[#222222] text-[#b8b0a5]'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#fdfbf7]">Residential Homeowner</div>
                  <div className="text-[11px] text-[#78716c]">Individual property owner</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setIsCompany(true); setPropLabel('Commercial / Portfolio Unit #1'); }}
                className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition ${
                  isCompany 
                    ? 'border-[#c5a059] bg-[#c5a059]/10 ring-2 ring-[#c5a059]/20' 
                    : 'border-[#2a2a2a] hover:bg-[#1a1a1a]'
                }`}
              >
                <div className={`p-2 rounded-lg ${isCompany ? 'bg-[#c5a059] text-black' : 'bg-[#222222] text-[#b8b0a5]'}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#fdfbf7]">Property Manager / Landlord</div>
                  <div className="text-[11px] text-[#78716c]">Multiple properties / company</div>
                </div>
              </button>
            </div>
          </div>

          {/*  */}
          {isCompany && (
            <div>
              <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                Company / Organization Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Property Management LLC"
                className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          )}

          {/*  */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          {/*  */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(512) 555-0199"
                className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          {/*  */}
          <div className="border-t border-[#262626] pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#c5a059] mb-3 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Billing Address</span>
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    value={billStreet}
                    onChange={(e) => setBillStreet(e.target.value)}
                    placeholder="Street Address"
                    className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={billUnit}
                    onChange={(e) => setBillUnit(e.target.value)}
                    placeholder="Apt / Suite"
                    className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={billCity}
                  onChange={(e) => setBillCity(e.target.value)}
                  placeholder="City"
                  className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                />
                <input
                  type="text"
                  required
                  value={billState}
                  onChange={(e) => setBillState(e.target.value)}
                  placeholder="State"
                  className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                />
                <input
                  type="text"
                  required
                  value={billZip}
                  onChange={(e) => setBillZip(e.target.value)}
                  placeholder="Zip Code"
                  className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>
          </div>

          {/*  */}
          <div className="border-t border-[#262626] pt-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#c5a059] flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Initial Service Property</span>
              </h4>
              <label className="flex items-center space-x-2 text-xs text-[#b8b0a5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className="rounded accent-[#c5a059] bg-[#181818] border-[#2a2a2a]"
                />
                <span>Same as billing address</span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#b8b0a5] mb-1">
                  Property Label / Identifier
                </label>
                <input
                  type="text"
                  value={propLabel}
                  onChange={(e) => setPropLabel(e.target.value)}
                  placeholder="e.g. Primary Home, Building A, Rental Duplex"
                  className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              {!sameAsBilling && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        required={!sameAsBilling}
                        value={propStreet}
                        onChange={(e) => setPropStreet(e.target.value)}
                        placeholder="Service Street Address"
                        className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={propUnit}
                        onChange={(e) => setPropUnit(e.target.value)}
                        placeholder="Unit #"
                        className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      required={!sameAsBilling}
                      value={propCity}
                      onChange={(e) => setPropCity(e.target.value)}
                      placeholder="City"
                      className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                    />
                    <input
                      type="text"
                      required={!sameAsBilling}
                      value={propState}
                      onChange={(e) => setPropState(e.target.value)}
                      placeholder="State"
                      className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                    />
                    <input
                      type="text"
                      required={!sameAsBilling}
                      value={propZip}
                      onChange={(e) => setPropZip(e.target.value)}
                      placeholder="Zip Code"
                      className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#b8b0a5] mb-1 flex items-center space-x-1">
                    <Key className="w-3 h-3 text-[#78716c]" />
                    <span>Gate / Lockbox Code</span>
                  </label>
                  <input
                    type="text"
                    value={gateCode}
                    onChange={(e) => setGateCode(e.target.value)}
                    placeholder="#1234 or Key under mat"
                    className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#b8b0a5] mb-1">
                    Access Instructions
                  </label>
                  <input
                    type="text"
                    value={accessInstructions}
                    onChange={(e) => setAccessInstructions(e.target.value)}
                    placeholder="Side gate unlocked, watch for dog"
                    className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/*  */}
          <div className="border-t border-[#262626] pt-5">
            <label className="block text-xs font-bold text-[#b8b0a5] mb-1 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-[#78716c]" />
              <span>General Client Notes</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special customer preferences, billing requirements, preferred contact time..."
              className="w-full text-[#fdfbf7] bg-[#181818] placeholder-[#78716c] text-xs px-3.5 py-2.5 rounded-lg border border-[#2a2a2a] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/*  */}
          <div className="border-t border-[#262626] pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-bold text-[#b8b0a5] hover:bg-[#1a1a1a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold shadow-md transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Client & Property</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
