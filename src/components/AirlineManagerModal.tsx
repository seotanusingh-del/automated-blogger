import React, { useState } from 'react';
import { Trash2, Plus, ChevronDown, ChevronUp, MapPin, X, RotateCcw, Check } from 'lucide-react';
import { AirlineItem, AirlineOffice } from '../types/airline';
import { DEFAULT_AIRLINES } from '../data/defaultAirlines';

interface AirlineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  airlines: AirlineItem[];
  onSave: (updatedAirlines: AirlineItem[]) => void;
  entityLabel?: string;
}

export const AirlineManagerModal: React.FC<AirlineManagerModalProps> = ({
  isOpen,
  onClose,
  airlines,
  onSave,
  entityLabel = 'Airline'
}) => {
  const [airlineList, setAirlineList] = useState<AirlineItem[]>(airlines);
  const [bulkInput, setBulkInput] = useState('');
  const [expandedAirlineId, setExpandedAirlineId] = useState<string | null>(null);
  const [newOfficeCity, setNewOfficeCity] = useState('');
  const [newOfficeName, setNewOfficeName] = useState('');
  const [newOfficeCountry, setNewOfficeCountry] = useState('United States');

  if (!isOpen) return null;

  const handleDeleteAirline = (id: string) => {
    setAirlineList(airlineList.filter(a => a.id !== id));
  };

  const handleAddBulkAirlines = () => {
    if (!bulkInput.trim()) return;
    const lines = bulkInput.split(/[\n,]+/).map(s => s.trim().replace(/_/g, ' ')).filter(Boolean);
    const newItems: AirlineItem[] = lines.map(name => {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return {
        id: `${id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name,
        selected: true,
        offices: [
          { id: `${id}-hq`, name: `${name} Headquarters`, city: 'Headquarters', country: 'United States' }
        ]
      };
    });

    setAirlineList([...airlineList, ...newItems]);
    setBulkInput('');
  };

  const handleResetDefaults = () => {
    setAirlineList(DEFAULT_AIRLINES);
  };

  const handleSaveAndClose = () => {
    onSave(airlineList);
    onClose();
  };

  const handleAddOffice = (airlineId: string) => {
    if (!newOfficeCity.trim()) return;
    const officeCity = newOfficeCity.trim();
    const officeCountry = newOfficeCountry.trim() || 'United States';
    const officeName = newOfficeName.trim() || `${officeCity} Office in ${officeCountry}`;

    setAirlineList(airlineList.map(a => {
      if (a.id !== airlineId) return a;
      const newOff: AirlineOffice = {
        id: `${a.id}-${officeCity.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        name: officeName,
        city: officeCity,
        country: officeCountry
      };
      return {
        ...a,
        offices: [...a.offices, newOff]
      };
    }));

    setNewOfficeCity('');
    setNewOfficeName('');
  };

  const handleDeleteOffice = (airlineId: string, officeId: string) => {
    setAirlineList(airlineList.map(a => {
      if (a.id !== airlineId) return a;
      return {
        ...a,
        offices: a.offices.filter(o => o.id !== officeId)
      };
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">
              {entityLabel} Manager ({airlineList.length} {entityLabel}s)
            </h2>
            <p className="text-xs text-slate-400">
              Manage entries and their associated locations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Airline List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 pr-1">
          {airlineList.map((airline) => {
            const isExpanded = expandedAirlineId === airline.id;
            return (
              <div
                key={airline.id}
                className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden"
              >
                <div className="flex items-center justify-between p-3">
                  <div 
                    onClick={() => setExpandedAirlineId(isExpanded ? null : airline.id)}
                    className="flex items-center gap-2.5 cursor-pointer flex-1"
                  >
                    <span className="text-xs font-semibold text-slate-100">{airline.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {airline.offices.length} Offices
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-auto mr-2" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto mr-2" />
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteAirline(airline.id)}
                    title="Delete airline"
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sub-offices Drawer */}
                {isExpanded && (
                  <div className="p-3 bg-slate-900/60 border-t border-slate-800/80 space-y-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Offices under {airline.name}:
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {airline.offices.map((off) => (
                        <div
                          key={off.id}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span className="text-slate-200 font-medium truncate">{off.name}</span>
                            <span className="text-slate-500 text-[10px]">({off.city})</span>
                          </div>
                          <button
                            onClick={() => handleDeleteOffice(airline.id, off.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Office Form */}
                    <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="City (e.g. Bozeman)"
                        value={newOfficeCity}
                        onChange={(e) => setNewOfficeCity(e.target.value)}
                        className="text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white flex-1 min-w-[120px] outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Country (e.g. United States)"
                        value={newOfficeCountry}
                        onChange={(e) => setNewOfficeCountry(e.target.value)}
                        className="text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white flex-1 min-w-[120px] outline-none"
                      />
                      <button
                        onClick={() => handleAddOffice(airline.id)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3 h-3" /> Add Office
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Airlines (Bulk) Textarea matching screenshot */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-300">Add Airlines (Bulk)</div>
          <p className="text-[11px] text-slate-400 italic">
            Separate with commas or new lines. Use underscore (_) for spaces.
          </p>
          <textarea
            rows={2}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="e.g. Virgin_Atlantic, Air_France, Cathay_Pacific"
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-sky-500 font-mono"
          />

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleAddBulkAirlines}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" /> + Add Airlines
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
              </button>
              <button
                onClick={handleSaveAndClose}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
