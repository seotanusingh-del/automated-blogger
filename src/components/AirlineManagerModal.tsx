import React, { useEffect, useState } from 'react';
import { 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  X, 
  RotateCcw, 
  Plane, 
  Building2, 
  Compass, 
  Briefcase, 
  Search,
  Check
} from 'lucide-react';
import { AirlineItem, AirlineOffice } from '../types/airline';
import { 
  DEFAULT_AIRLINES 
} from '../data/defaultAirlines';
import { 
  DEFAULT_ENTITIES_BY_TYPE, 
  BlogType, 
  getDefaultEntities 
} from '../data/defaultEntities';

interface AirlineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  airlines: AirlineItem[];
  onSave: (updatedAirlines: AirlineItem[]) => void;
  isDarkMode: boolean;
  entityLabel?: string;
  activeBlogType?: BlogType;
  onChangeBlogType?: (type: BlogType) => void;
}

export const AirlineManagerModal: React.FC<AirlineManagerModalProps> = ({
  isOpen,
  onClose,
  airlines,
  onSave,
  isDarkMode,
  entityLabel = 'Airline',
  activeBlogType = 'airlines',
  onChangeBlogType
}) => {
  const [currentCategory, setCurrentCategory] = useState<BlogType>(activeBlogType);
  const [airlineList, setAirlineList] = useState<AirlineItem[]>(airlines);
  const [bulkInput, setBulkInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedAirlineId, setExpandedAirlineId] = useState<string | null>(null);
  const [newOfficeCity, setNewOfficeCity] = useState('');
  const [newOfficeName, setNewOfficeName] = useState('');
  const [newOfficeCountry, setNewOfficeCountry] = useState('United States');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    setAirlineList(airlines);
    setExpandedAirlineId(null);
  }, [airlines]);

  useEffect(() => {
    setCurrentCategory(activeBlogType);
  }, [activeBlogType]);

  if (!isOpen) return null;

  const currentLabel = currentCategory === 'airlines' ? 'Airline' :
                       currentCategory === 'hotels' ? 'Hotel' :
                       currentCategory === 'travel' ? 'Destination' : 'Agency Desk';

  const currentPlural = currentCategory === 'airlines' ? 'Airlines' :
                        currentCategory === 'hotels' ? 'Hotels & Resorts' :
                        currentCategory === 'travel' ? 'Destinations' : 'Agency Desks';

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
          { id: `${id}-hq`, name: `${name} Main Bureau`, city: 'Headquarters', country: 'United States' }
        ]
      };
    });

    setAirlineList([...airlineList, ...newItems]);
    setBulkInput('');
    setStatusNotice(`Added ${newItems.length} ${currentPlural.toLowerCase()}.`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleResetToCategoryDefaults = (cat = currentCategory) => {
    const defaults = getDefaultEntities(cat);
    setAirlineList(defaults);
    setStatusNotice(`Reset to ${defaults.length} default ${cat} entries.`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleSwitchCategory = (cat: BlogType) => {
    setCurrentCategory(cat);
    if (onChangeBlogType) onChangeBlogType(cat);
    // Load presets if currently empty or switching
    const saved = localStorage.getItem(`easyflight_entities_${cat}`);
    if (saved) {
      try {
        setAirlineList(JSON.parse(saved));
        return;
      } catch (_) {}
    }
    setAirlineList(getDefaultEntities(cat));
  };

  const handleSaveAndClose = () => {
    onSave(airlineList);
    try {
      localStorage.setItem(`easyflight_entities_${currentCategory}`, JSON.stringify(airlineList));
    } catch (_) {}
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

  const filteredList = airlineList.filter(item => 
    !searchFilter.trim() || 
    item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.offices.some(o => o.city.toLowerCase().includes(searchFilter.toLowerCase()) || o.name.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const getBulkPlaceholder = () => {
    switch (currentCategory) {
      case 'hotels':
        return 'e.g. Marriott_Bonvoy, Hilton_Hotels, Hyatt_Regency, Four_Seasons, Ritz_Carlton';
      case 'travel':
        return 'e.g. Paris_Explorer, Tokyo_Travel_Desk, New_York_Guide, Rome_Heritage_Bureau';
      case 'agency':
        return 'e.g. Priority_Travel_Concierge, Global_Flight_Desk, 247_Booking_Support';
      default:
        return 'e.g. Virgin_Atlantic, Air_France, Cathay_Pacific, Emirates, Singapore_Airlines';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`border rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-start justify-between pb-4 border-b gap-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Manage Directory &amp; Entities ({airlineList.length} {currentPlural})
              </h2>
              {statusNotice && (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {statusNotice}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage target brands, airlines, hotel chains, and travel desks with their localized city locations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs: Airlines, Hotels, Travel, Agency */}
        <div className={`pt-3 pb-2 flex flex-wrap items-center justify-between gap-2 border-b ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
            <button
              type="button"
              onClick={() => handleSwitchCategory('airlines')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                currentCategory === 'airlines' 
                  ? 'bg-sky-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Airlines</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchCategory('hotels')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                currentCategory === 'hotels' 
                  ? 'bg-amber-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hotels &amp; Resorts</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchCategory('travel')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                currentCategory === 'travel' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Travel &amp; Tours</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchCategory('agency')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                currentCategory === 'agency' 
                  ? 'bg-violet-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Agency Desks</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={`Search ${currentPlural.toLowerCase()}...`}
              className={`w-full border text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
              }`}
            />
          </div>
        </div>

        {/* Scrollable Entity List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1 min-h-[220px]">
          {filteredList.length === 0 ? (
            <div className={`p-8 text-center border border-dashed rounded-xl ${
              isDarkMode ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-300'
            }`}>
              No matching entries found. Use the Bulk Add box below or click "Reset to Category Defaults".
            </div>
          ) : (
            filteredList.map((airline) => {
              const isExpanded = expandedAirlineId === airline.id;
              return (
                <div
                  key={airline.id}
                  className={`rounded-xl border overflow-hidden ${
                    isDarkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between p-3">
                    <div 
                      onClick={() => setExpandedAirlineId(isExpanded ? null : airline.id)}
                      className="flex items-center gap-2.5 cursor-pointer flex-1"
                    >
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{airline.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        {airline.offices.length} Locations / Desks
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-auto mr-2" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto mr-2" />
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteAirline(airline.id)}
                      title={`Delete ${currentLabel.toLowerCase()}`}
                      className={`p-1.5 rounded-lg border border-transparent transition ${
                        isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-900' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sub-offices / Locations Drawer */}
                  {isExpanded && (
                    <div className={`p-3 border-t space-y-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        Locations &amp; Hubs under {airline.name}:
                      </div>

                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {airline.offices.map((off) => (
                          <div
                            key={off.id}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded border text-xs ${
                              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <MapPin className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                              <span className={`font-medium truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{off.name}</span>
                              <span className="text-slate-500 text-[10px]">({off.city})</span>
                            </div>
                            <button
                              onClick={() => handleDeleteOffice(airline.id, off.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="Delete location"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Office/Location Form */}
                      <div className={`pt-2 border-t flex flex-wrap items-center gap-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <input
                          type="text"
                          placeholder="City / Region"
                          value={newOfficeCity}
                          onChange={(e) => setNewOfficeCity(e.target.value)}
                          className={`text-xs border rounded px-2.5 py-1.5 flex-1 min-w-[120px] outline-none ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="Location / Desk Name"
                          value={newOfficeName}
                          onChange={(e) => setNewOfficeName(e.target.value)}
                          className={`text-xs border rounded px-2.5 py-1.5 flex-1 min-w-[120px] outline-none ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={newOfficeCountry}
                          onChange={(e) => setNewOfficeCountry(e.target.value)}
                          className={`text-xs border rounded px-2.5 py-1.5 w-24 outline-none ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                          }`}
                        />
                        <button
                          onClick={() => handleAddOffice(airline.id)}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Plus className="w-3 h-3" /> Add Desk
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Entities (Bulk) Textarea */}
        <div className={`pt-3 border-t space-y-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Add {currentPlural} (Bulk)</div>
            <span className="text-[11px] text-slate-500 italic">
              Separate with commas or new lines. Use underscore (_) for spaces.
            </span>
          </div>
          <textarea
            rows={2}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder={getBulkPlaceholder()}
            className={`w-full text-xs border rounded-lg p-2.5 outline-none focus:border-sky-500 font-mono ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />

          <div className="flex flex-wrap items-center justify-between pt-1 gap-2">
            <button
              onClick={handleAddBulkAirlines}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" /> + Add {currentPlural}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleResetToCategoryDefaults(currentCategory)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
                title={`Load default ${currentPlural.toLowerCase()}`}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset {currentCategory} Defaults
              </button>
              <button
                onClick={handleSaveAndClose}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow"
              >
                Save &amp; Apply
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
