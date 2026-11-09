import { AirlineItem } from '../types/airline';
import { DEFAULT_AIRLINES } from './defaultAirlines';

export type BlogType = 'airlines' | 'travel' | 'hotels' | 'agency';

export const DEFAULT_HOTELS: AirlineItem[] = [
  {
    id: 'marriott-bonvoy',
    name: 'Marriott Bonvoy & Luxury Resorts',
    code: 'MB',
    primaryColor: '#8a1538',
    accentColor: '#d4af37',
    selected: true,
    offices: [
      { id: 'marriott-nyc', name: 'New York Times Square Desk', city: 'New York', country: 'United States' },
      { id: 'marriott-paris', name: 'Paris Champs-Élysées Luxury Bureau', city: 'Paris', country: 'France' },
      { id: 'marriott-london', name: 'London Mayfair Concierge Desk', city: 'London', country: 'United Kingdom' },
      { id: 'marriott-dubai', name: 'Dubai Marina & Palm Suites', city: 'Dubai', country: 'United Arab Emirates' },
      { id: 'marriott-tokyo', name: 'Tokyo Ginza Guest Services', city: 'Tokyo', country: 'Japan' },
      { id: 'marriott-miami', name: 'Miami Beachfront Resort Bureau', city: 'Miami', country: 'United States' }
    ]
  },
  {
    id: 'hilton-hotels',
    name: 'Hilton Hotels & Resorts',
    code: 'HH',
    primaryColor: '#00263e',
    accentColor: '#1e88e5',
    selected: true,
    offices: [
      { id: 'hilton-nyc', name: 'New York Midtown Reservation Office', city: 'New York', country: 'United States' },
      { id: 'hilton-chicago', name: 'Chicago Magnificent Mile Desk', city: 'Chicago', country: 'United States' },
      { id: 'hilton-london', name: 'London Park Lane Guest Desk', city: 'London', country: 'United Kingdom' },
      { id: 'hilton-rome', name: 'Rome Cavalieri Hospitality Bureau', city: 'Rome', country: 'Italy' },
      { id: 'hilton-tokyo', name: 'Tokyo Shinjuku Assistance Desk', city: 'Tokyo', country: 'Japan' }
    ]
  },
  {
    id: 'hyatt-regency',
    name: 'Hyatt Regency & Grand Hyatt',
    code: 'HY',
    primaryColor: '#1a365d',
    accentColor: '#c59b27',
    selected: true,
    offices: [
      { id: 'hyatt-sf', name: 'San Francisco Downtown Desk', city: 'San Francisco', country: 'United States' },
      { id: 'hyatt-nyc', name: 'New York Grand Central Desk', city: 'New York', country: 'United States' },
      { id: 'hyatt-paris', name: 'Paris Madeleine Executive Desk', city: 'Paris', country: 'France' },
      { id: 'hyatt-dubai', name: 'Dubai Creek Hospitality Bureau', city: 'Dubai', country: 'United Arab Emirates' }
    ]
  },
  {
    id: 'intercontinental-hotels',
    name: 'InterContinental Hotels & Resorts',
    code: 'IHG',
    primaryColor: '#003865',
    accentColor: '#df691a',
    selected: true,
    offices: [
      { id: 'ihg-london', name: 'London Park Lane Luxury Desk', city: 'London', country: 'United Kingdom' },
      { id: 'ihg-paris', name: 'Paris Le Grand Executive Office', city: 'Paris', country: 'France' },
      { id: 'ihg-singapore', name: 'Singapore Marina Bay Desk', city: 'Singapore', country: 'Singapore' },
      { id: 'ihg-dubai', name: 'Dubai Festival City Office', city: 'Dubai', country: 'United Arab Emirates' }
    ]
  },
  {
    id: 'four-seasons',
    name: 'Four Seasons Luxury Resorts',
    code: 'FS',
    primaryColor: '#111827',
    accentColor: '#b45309',
    selected: true,
    offices: [
      { id: 'fs-paris', name: 'Paris George V Concierge', city: 'Paris', country: 'France' },
      { id: 'fs-maui', name: 'Maui Wailea Guest Services', city: 'Maui', country: 'United States' },
      { id: 'fs-dubai', name: 'Dubai Jumeirah Beach Desk', city: 'Dubai', country: 'United Arab Emirates' },
      { id: 'fs-kyoto', name: 'Kyoto Heritage Travel Bureau', city: 'Kyoto', country: 'Japan' }
    ]
  },
  {
    id: 'the-ritz-carlton',
    name: 'The Ritz-Carlton Hotel Company',
    code: 'RC',
    primaryColor: '#0f172a',
    accentColor: '#38bdf8',
    selected: true,
    offices: [
      { id: 'rc-central-park', name: 'New York Central Park Desk', city: 'New York', country: 'United States' },
      { id: 'rc-tokyo', name: 'Tokyo Midtown Luxury Suites Desk', city: 'Tokyo', country: 'Japan' },
      { id: 'rc-cancun', name: 'Cancun Beachfront Resort Desk', city: 'Cancun', country: 'Mexico' },
      { id: 'rc-dubai', name: 'Dubai DIFC Executive Desk', city: 'Dubai', country: 'United Arab Emirates' }
    ]
  }
];

export const DEFAULT_TRAVEL: AirlineItem[] = [
  {
    id: 'paris-travel-guide',
    name: 'Paris Destination & Tourism Bureau',
    code: 'PAR',
    primaryColor: '#1e3a8a',
    accentColor: '#f59e0b',
    selected: true,
    offices: [
      { id: 'par-eiffel', name: 'Eiffel Tower Visitor Assistance', city: 'Paris', country: 'France' },
      { id: 'par-louvre', name: 'Louvre & Tuileries Tour Desk', city: 'Paris', country: 'France' },
      { id: 'par-champs', name: 'Champs-Élysées Travel Services', city: 'Paris', country: 'France' }
    ]
  },
  {
    id: 'tokyo-destination-hub',
    name: 'Tokyo Explorer Travel Hub',
    code: 'TYO',
    primaryColor: '#991b1b',
    accentColor: '#fbbf24',
    selected: true,
    offices: [
      { id: 'tyo-shibuya', name: 'Shibuya Crossing Tourist Hub', city: 'Tokyo', country: 'Japan' },
      { id: 'tyo-shinjuku', name: 'Shinjuku Central Visitor Desk', city: 'Tokyo', country: 'Japan' },
      { id: 'tyo-ginza', name: 'Ginza Premium Concierge Desk', city: 'Tokyo', country: 'Japan' }
    ]
  },
  {
    id: 'new-york-city-explorer',
    name: 'New York City Visitor Bureau',
    code: 'NYC',
    primaryColor: '#0f766e',
    accentColor: '#f97316',
    selected: true,
    offices: [
      { id: 'nyc-midtown', name: 'Midtown Manhattan Visitor Center', city: 'New York', country: 'United States' },
      { id: 'nyc-lower', name: 'Lower Manhattan Financial Tour Desk', city: 'New York', country: 'United States' },
      { id: 'nyc-brooklyn', name: 'Brooklyn Bridge Tourism Desk', city: 'New York', country: 'United States' }
    ]
  },
  {
    id: 'london-travel-desk',
    name: 'London Heritage & City Bureau',
    code: 'LON',
    primaryColor: '#1e1b4b',
    accentColor: '#ef4444',
    selected: true,
    offices: [
      { id: 'lon-westminster', name: 'Westminster & Big Ben Assistance', city: 'London', country: 'United Kingdom' },
      { id: 'lon-soho', name: 'Soho & Covent Garden Desk', city: 'London', country: 'United Kingdom' },
      { id: 'lon-kensington', name: 'Kensington & Chelsea Tourist Hub', city: 'London', country: 'United Kingdom' }
    ]
  },
  {
    id: 'dubai-tourism-bureau',
    name: 'Dubai Luxury Travel Directory',
    code: 'DXB',
    primaryColor: '#78350f',
    accentColor: '#fbbf24',
    selected: true,
    offices: [
      { id: 'dxb-downtown', name: 'Downtown & Burj Khalifa Desk', city: 'Dubai', country: 'United Arab Emirates' },
      { id: 'dxb-marina', name: 'Dubai Marina & JBR Desk', city: 'Dubai', country: 'United Arab Emirates' },
      { id: 'dxb-palm', name: 'Palm Jumeirah Resort Bureau', city: 'Dubai', country: 'United Arab Emirates' }
    ]
  },
  {
    id: 'rome-heritage-tours',
    name: 'Rome Ancient Heritage Desk',
    code: 'ROM',
    primaryColor: '#831843',
    accentColor: '#facc15',
    selected: true,
    offices: [
      { id: 'rom-colosseum', name: 'Colosseum & Imperial Forum Desk', city: 'Rome', country: 'Italy' },
      { id: 'rom-vatican', name: 'Vatican City & St Peter Bureau', city: 'Rome', country: 'Italy' },
      { id: 'rom-trevi', name: 'Trevi & Spanish Steps Tourist Hub', city: 'Rome', country: 'Italy' }
    ]
  }
];

export const DEFAULT_AGENCY: AirlineItem[] = [
  {
    id: 'priority-travel-concierge',
    name: 'Priority Travel & Flight Concierge',
    code: 'PTC',
    primaryColor: '#047857',
    accentColor: '#34d399',
    selected: true,
    offices: [
      { id: 'ptc-us', name: 'USA Dispatch & Escalations Hub', city: 'New York', country: 'United States' },
      { id: 'ptc-uk', name: 'UK & European Assistance Bureau', city: 'London', country: 'United Kingdom' },
      { id: 'ptc-can', name: 'Canada Passenger Support Desk', city: 'Toronto', country: 'Canada' }
    ]
  },
  {
    id: 'global-flight-desk',
    name: 'Global Flight Assistance Desk',
    code: 'GFD',
    primaryColor: '#1d4ed8',
    accentColor: '#60a5fa',
    selected: true,
    offices: [
      { id: 'gfd-nyc', name: 'New York Corporate Rebooking Hub', city: 'New York', country: 'United States' },
      { id: 'gfd-lon', name: 'London 24/7 International Dispatch', city: 'London', country: 'United Kingdom' },
      { id: 'gfd-sin', name: 'Asia-Pacific Operations Center', city: 'Singapore', country: 'Singapore' }
    ]
  },
  {
    id: '247-booking-support',
    name: '24/7 Dispute & Rebooking Bureau',
    code: 'DRB',
    primaryColor: '#6d28d9',
    accentColor: '#a78bfa',
    selected: true,
    offices: [
      { id: 'drb-na', name: 'North American Operations Bureau', city: 'Chicago', country: 'United States' },
      { id: 'drb-eu', name: 'European Passenger Rights Desk', city: 'Frankfurt', country: 'Germany' }
    ]
  },
  {
    id: 'premier-flight-partners',
    name: 'Premier Voyage Partners',
    code: 'PVP',
    primaryColor: '#b91c1c',
    accentColor: '#f87171',
    selected: true,
    offices: [
      { id: 'pvp-la', name: 'Los Angeles Booking Desk', city: 'Los Angeles', country: 'United States' },
      { id: 'pvp-mia', name: 'Miami Caribbean Gateway Office', city: 'Miami', country: 'United States' }
    ]
  }
];

export const DEFAULT_ENTITIES_BY_TYPE: Record<BlogType, AirlineItem[]> = {
  airlines: DEFAULT_AIRLINES,
  hotels: DEFAULT_HOTELS,
  travel: DEFAULT_TRAVEL,
  agency: DEFAULT_AGENCY
};

export function getDefaultEntities(type: BlogType): AirlineItem[] {
  return DEFAULT_ENTITIES_BY_TYPE[type] || DEFAULT_AIRLINES;
}
