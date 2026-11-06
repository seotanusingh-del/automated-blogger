import { AirlineItem } from '../types/airline';

export const DEFAULT_AIRLINES: AirlineItem[] = [
  {
    id: 'envoy-air',
    name: 'Envoy Air',
    code: 'MQ',
    primaryColor: '#003366',
    accentColor: '#d6001c',
    selected: true,
    offices: [
      { id: 'envoy-bozeman', name: 'Bozeman Office in United States', city: 'Bozeman', country: 'United States', airportCode: 'BZN' },
      { id: 'envoy-honolulu', name: 'Honolulu Office in United States', city: 'Honolulu', country: 'United States', airportCode: 'HNL' },
      { id: 'envoy-atlanta', name: 'Atlanta Office in United States', city: 'Atlanta', country: 'United States', airportCode: 'ATL' },
      { id: 'envoy-madison', name: 'Madison Office in United States', city: 'Madison', country: 'United States', airportCode: 'MSN' },
      { id: 'envoy-columbus', name: 'Columbus Office in United States', city: 'Columbus', country: 'United States', airportCode: 'CMH' },
      { id: 'envoy-los-angeles', name: 'Los Angeles Office in United States', city: 'Los Angeles', country: 'United States', airportCode: 'LAX' },
      { id: 'envoy-chicago', name: 'Chicago Office in United States', city: 'Chicago', country: 'United States', airportCode: 'ORD' },
      { id: 'envoy-dallas', name: 'Dallas Office in United States', city: 'Dallas', country: 'United States', airportCode: 'DFW' },
      { id: 'envoy-miami', name: 'Miami Office in United States', city: 'Miami', country: 'United States', airportCode: 'MIA' },
      { id: 'envoy-houston', name: 'Houston Office in United States', city: 'Houston', country: 'United States', airportCode: 'IAH' },
      { id: 'envoy-headquarters', name: 'Envoy Air Headquarters', city: 'Irving / Dallas', country: 'United States', airportCode: 'DFW' },
      { id: 'envoy-nashville', name: 'Nashville Office in United States', city: 'Nashville', country: 'United States', airportCode: 'BNA' },
      { id: 'envoy-montego-bay', name: 'Montego Bay Office in Jamaica', city: 'Montego Bay', country: 'Jamaica', airportCode: 'MBJ' },
      { id: 'envoy-monroe', name: 'Monroe Office in United States', city: 'Monroe', country: 'United States', airportCode: 'MLU' },
      { id: 'envoy-milwaukee', name: 'Milwaukee Office in United States', city: 'Milwaukee', country: 'United States', airportCode: 'MKE' },
      { id: 'envoy-memphis', name: 'Memphis Office in United States', city: 'Memphis', country: 'United States', airportCode: 'MEM' },
      { id: 'envoy-medford', name: 'Medford Office in United States', city: 'Medford', country: 'United States', airportCode: 'MFR' },
      { id: 'envoy-matanzas', name: 'Matanzas Office in Cuba', city: 'Matanzas', country: 'Cuba', airportCode: 'VRA' },
      { id: 'envoy-manhattan', name: 'Manhattan Office in United States', city: 'Manhattan', country: 'United States', airportCode: 'MHK' },
      { id: 'envoy-little-rock', name: 'Little Rock Office in United States', city: 'Little Rock', country: 'United States', airportCode: 'LIT' },
      { id: 'envoy-las-vegas', name: 'Las Vegas Office in United States', city: 'Las Vegas', country: 'United States', airportCode: 'LAS' },
      { id: 'envoy-la-crosse', name: 'La Crosse Office in United States', city: 'La Crosse', country: 'United States', airportCode: 'LSE' },
      { id: 'envoy-knoxville', name: 'Knoxville Office in Tennessee', city: 'Knoxville', country: 'Tennessee', airportCode: 'TYS' },
      { id: 'envoy-jefferson-city', name: 'Jefferson City Office in United States', city: 'Jefferson City', country: 'United States', airportCode: 'JEF' },
      { id: 'envoy-jackson', name: 'Jackson Office in United States', city: 'Jackson', country: 'United States', airportCode: 'JAN' },
      { id: 'envoy-indianapolis', name: 'Indianapolis Office in United States', city: 'Indianapolis', country: 'United States', airportCode: 'IND' },
      { id: 'envoy-harlingen', name: 'Harlingen Office in United States', city: 'Harlingen', country: 'United States', airportCode: 'HRL' },
      { id: 'envoy-greensboro', name: 'Greensboro Office in United States', city: 'Greensboro', country: 'United States', airportCode: 'GSO' },
      { id: 'envoy-grand-rapids', name: 'Grand Rapids Office in United States', city: 'Grand Rapids', country: 'United States', airportCode: 'GRR' },
      { id: 'envoy-fort-wayne', name: 'Fort Wayne Office in United States', city: 'Fort Wayne', country: 'United States', airportCode: 'FWA' },
      { id: 'envoy-des-moines', name: 'Des Moines Office in Iowa', city: 'Des Moines', country: 'Iowa', airportCode: 'DSM' },
      { id: 'envoy-del-rio', name: 'Del Rio Office in United States', city: 'Del Rio', country: 'United States', airportCode: 'DRT' },
      { id: 'envoy-dayton', name: 'Dayton Office in United States', city: 'Dayton', country: 'United States', airportCode: 'DAY' },
      { id: 'envoy-cleveland', name: 'Cleveland Office in United States', city: 'Cleveland', country: 'United States', airportCode: 'CLE' },
      { id: 'envoy-charleston', name: 'Charleston Office in United States', city: 'Charleston', country: 'United States', airportCode: 'CHS' },
      { id: 'envoy-buffalo', name: 'Buffalo Office in United States', city: 'Buffalo', country: 'United States', airportCode: 'BUF' },
      { id: 'envoy-bentonville', name: 'Bentonville Office in United States', city: 'Bentonville', country: 'United States', airportCode: 'XNA' },
      { id: 'envoy-albuquerque', name: 'Albuquerque Office in United States', city: 'Albuquerque', country: 'United States', airportCode: 'ABQ' },
      { id: 'envoy-abilene', name: 'Abilene Office in United States', city: 'Abilene', country: 'United States', airportCode: 'ABI' }
    ]
  },
  {
    id: 'delta-airlines',
    name: 'Delta Airlines',
    code: 'DL',
    primaryColor: '#002244',
    accentColor: '#c8102e',
    selected: true,
    offices: [
      { id: 'delta-green-bay', name: 'Green Bay Office in United States', city: 'Green Bay', country: 'United States', airportCode: 'GRB' },
      { id: 'delta-greensboro', name: 'Greensboro Office in United States', city: 'Greensboro', country: 'United States', airportCode: 'GSO' },
      { id: 'delta-greenville', name: 'Greenville Office in United States', city: 'Greenville', country: 'United States', airportCode: 'GSP' },
      { id: 'delta-seattle', name: 'Seattle Office in United States', city: 'Seattle', country: 'United States', airportCode: 'SEA' },
      { id: 'delta-guam', name: 'Guam Office in United States', city: 'Guam', country: 'United States', airportCode: 'GUM' },
      { id: 'delta-jacksonville', name: 'Jacksonville Office in United States', city: 'Jacksonville', country: 'United States', airportCode: 'JAX' },
      { id: 'delta-little-rock', name: 'Little Rock Office in United States', city: 'Little Rock', country: 'United States', airportCode: 'LIT' },
      { id: 'delta-kona', name: 'Kona Office in United States', city: 'Kona', country: 'United States', airportCode: 'KOA' },
      { id: 'delta-milwaukee', name: 'Milwaukee Office in United States', city: 'Milwaukee', country: 'United States', airportCode: 'MKE' },
      { id: 'delta-miami', name: 'Miami Office in United States', city: 'Miami', country: 'United States', airportCode: 'MIA' },
      { id: 'delta-new-orleans', name: 'New Orleans Office in United States', city: 'New Orleans', country: 'United States', airportCode: 'MSY' },
      { id: 'delta-tyler', name: 'Tyler Office in United States', city: 'Tyler', country: 'United States', airportCode: 'TYR' },
      { id: 'delta-washington', name: 'Washington, D.C. Office in United States', city: 'Washington, D.C.', country: 'United States', airportCode: 'DCA' },
      { id: 'delta-salt-lake', name: 'Salt Lake City Office in United States', city: 'Salt Lake City', country: 'United States', airportCode: 'SLC' },
      { id: 'delta-san-juan', name: 'San Juan Office in United States', city: 'San Juan', country: 'United States', airportCode: 'SJU' },
      { id: 'delta-spartanburg', name: 'Spartanburg Office in United States', city: 'Spartanburg', country: 'United States', airportCode: 'SPA' },
      { id: 'delta-west-palm', name: 'West Palm Beach Office in United States', city: 'West Palm Beach', country: 'United States', airportCode: 'PBI' },
      { id: 'delta-pittsburgh', name: 'Pittsburgh Office in United States', city: 'Pittsburgh', country: 'United States', airportCode: 'PIT' },
      { id: 'delta-newport-news', name: 'Newport News Office in United States', city: 'Newport News', country: 'United States', airportCode: 'PHF' },
      { id: 'delta-providence', name: 'Providence Office in United States', city: 'Providence', country: 'United States', airportCode: 'PVD' },
      { id: 'delta-savannah', name: 'Savannah Office in United States', city: 'Savannah', country: 'United States', airportCode: 'SAV' },
      { id: 'delta-charleston-city', name: 'Charleston City Office in United States', city: 'Charleston City', country: 'United States', airportCode: 'CHS' },
      { id: 'delta-charlottesville', name: 'Charlottesville Office in United States', city: 'Charlottesville', country: 'United States', airportCode: 'CHO' },
      { id: 'delta-san-antonio', name: 'San Antonio Office in United States', city: 'San Antonio', country: 'United States', airportCode: 'SAT' },
      { id: 'delta-dallas', name: 'Dallas Office in United States', city: 'Dallas', country: 'United States', airportCode: 'DFW' },
      { id: 'delta-houston', name: 'Houston Office in United States', city: 'Houston', country: 'United States', airportCode: 'IAH' },
      { id: 'delta-pasco', name: 'Pasco Office in United States', city: 'Pasco', country: 'United States', airportCode: 'PSC' },
      { id: 'delta-roanoke', name: 'Roanoke Office in United States', city: 'Roanoke', country: 'United States', airportCode: 'ROA' },
      { id: 'delta-nashville', name: 'Nashville Office in United States', city: 'Nashville', country: 'United States', airportCode: 'BNA' },
      { id: 'delta-memphis', name: 'Memphis Office in United States', city: 'Memphis', country: 'United States', airportCode: 'MEM' },
      { id: 'delta-knoxville', name: 'Knoxville Office in United States', city: 'Knoxville', country: 'United States', airportCode: 'TYS' },
      { id: 'delta-sioux-falls', name: 'Sioux Falls Office in United States', city: 'Sioux Falls', country: 'United States', airportCode: 'FSD' },
      { id: 'delta-myrtle-beach', name: 'Myrtle Beach Office in United States', city: 'Myrtle Beach', country: 'United States', airportCode: 'MYR' },
      { id: 'delta-columbia', name: 'Columbia Office in United States', city: 'Columbia', country: 'United States', airportCode: 'CAE' },
      { id: 'delta-scranton', name: 'Scranton Office in United States', city: 'Scranton', country: 'United States', airportCode: 'AVP' },
      { id: 'delta-harrisburg', name: 'Harrisburg Office in United States', city: 'Harrisburg', country: 'United States', airportCode: 'MDT' },
      { id: 'delta-allentown', name: 'Allentown Office in United States', city: 'Allentown', country: 'United States', airportCode: 'ABE' },
      { id: 'delta-oklahoma-city', name: 'Oklahoma City Office in United States', city: 'Oklahoma City', country: 'United States', airportCode: 'OKC' },
      { id: 'delta-toledo', name: 'Toledo Office in United States', city: 'Toledo', country: 'United States', airportCode: 'TOL' },
      { id: 'delta-wilmington', name: 'Wilmington Office in United States', city: 'Wilmington', country: 'United States', airportCode: 'ILM' },
      { id: 'delta-raleigh', name: 'Raleigh Office in United States', city: 'Raleigh', country: 'United States', airportCode: 'RDU' },
      { id: 'delta-jacksonville-city', name: 'Jacksonville City Office in United States', city: 'Jacksonville City', country: 'United States', airportCode: 'JAX' },
      { id: 'delta-kansas-city', name: 'Kansas City Office in United States', city: 'Kansas City', country: 'United States', airportCode: 'MCI' }
    ]
  },
  {
    id: 'american-airlines',
    name: 'American Airlines',
    code: 'AA',
    primaryColor: '#002244',
    accentColor: '#c8102e',
    selected: true,
    offices: [
      { id: 'aa-dallas', name: 'Dallas Fort Worth Headquarters', city: 'Dallas', country: 'United States', airportCode: 'DFW' },
      { id: 'aa-chicago', name: 'Chicago O\'Hare Regional Office', city: 'Chicago', country: 'United States', airportCode: 'ORD' },
      { id: 'aa-miami', name: 'Miami Hub Office', city: 'Miami', country: 'United States', airportCode: 'MIA' },
      { id: 'aa-charlotte', name: 'Charlotte Hub Office', city: 'Charlotte', country: 'United States', airportCode: 'CLT' },
      { id: 'aa-los-angeles', name: 'Los Angeles International Office', city: 'Los Angeles', country: 'United States', airportCode: 'LAX' },
      { id: 'aa-new-york', name: 'New York JFK Office', city: 'New York', country: 'United States', airportCode: 'JFK' },
      { id: 'aa-philadelphia', name: 'Philadelphia Customer Center', city: 'Philadelphia', country: 'United States', airportCode: 'PHL' },
      { id: 'aa-phoenix', name: 'Phoenix Sky Harbor Office', city: 'Phoenix', country: 'United States', airportCode: 'PHX' }
    ]
  },
  {
    id: 'southwest-airlines',
    name: 'Southwest Airlines',
    code: 'WN',
    primaryColor: '#111b40',
    accentColor: '#ffc107',
    selected: true,
    offices: [
      { id: 'wn-dallas', name: 'Dallas Love Field Headquarters', city: 'Dallas', country: 'United States', airportCode: 'DAL' },
      { id: 'wn-houston', name: 'Houston Hobby Regional Office', city: 'Houston', country: 'United States', airportCode: 'HOU' },
      { id: 'wn-chicago', name: 'Chicago Midway Office', city: 'Chicago', country: 'United States', airportCode: 'MDW' },
      { id: 'wn-baltimore', name: 'Baltimore Washington Office', city: 'Baltimore', country: 'United States', airportCode: 'BWI' },
      { id: 'wn-denver', name: 'Denver Station Office', city: 'Denver', country: 'United States', airportCode: 'DEN' },
      { id: 'wn-las-vegas', name: 'Las Vegas Station Office', city: 'Las Vegas', country: 'United States', airportCode: 'LAS' },
      { id: 'wn-orlando', name: 'Orlando Regional Desk', city: 'Orlando', country: 'United States', airportCode: 'MCO' },
      { id: 'wn-phoenix', name: 'Phoenix Operations Office', city: 'Phoenix', country: 'United States', airportCode: 'PHX' }
    ]
  },
  {
    id: 'united-airlines',
    name: 'United Airlines',
    code: 'UA',
    primaryColor: '#002244',
    accentColor: '#005da6',
    selected: true,
    offices: [
      { id: 'ua-chicago', name: 'Chicago Willis Tower Headquarters', city: 'Chicago', country: 'United States', airportCode: 'ORD' },
      { id: 'ua-denver', name: 'Denver Hub Office', city: 'Denver', country: 'United States', airportCode: 'DEN' },
      { id: 'ua-houston', name: 'Houston Bush Intercontinental Office', city: 'Houston', country: 'United States', airportCode: 'IAH' },
      { id: 'ua-newark', name: 'Newark New York Terminal Office', city: 'Newark', country: 'United States', airportCode: 'EWR' },
      { id: 'ua-san-francisco', name: 'San Francisco International Desk', city: 'San Francisco', country: 'United States', airportCode: 'SFO' },
      { id: 'ua-washington', name: 'Washington Dulles Hub Office', city: 'Washington, D.C.', country: 'United States', airportCode: 'IAD' }
    ]
  },
  {
    id: 'alaska-airlines',
    name: 'Alaska Airlines',
    code: 'AS',
    primaryColor: '#01426a',
    accentColor: '#00a3e0',
    selected: true,
    offices: [
      { id: 'as-seattle', name: 'Seattle SeaTac Corporate Headquarters', city: 'Seattle', country: 'United States', airportCode: 'SEA' },
      { id: 'as-anchorage', name: 'Anchorage Regional Operations Office', city: 'Anchorage', country: 'United States', airportCode: 'ANC' },
      { id: 'as-portland', name: 'Portland Regional Desk', city: 'Portland', country: 'United States', airportCode: 'PDX' },
      { id: 'as-san-francisco', name: 'San Francisco International Station', city: 'San Francisco', country: 'United States', airportCode: 'SFO' },
      { id: 'as-los-angeles', name: 'Los Angeles Terminal Desk', city: 'Los Angeles', country: 'United States', airportCode: 'LAX' },
      { id: 'as-fairbanks', name: 'Fairbanks Passenger Center', city: 'Fairbanks', country: 'United States', airportCode: 'FAI' }
    ]
  },
  {
    id: 'jetblue',
    name: 'JetBlue',
    code: 'B6',
    primaryColor: '#00205b',
    accentColor: '#00a9e0',
    selected: true,
    offices: [
      { id: 'b6-new-york', name: 'New York Long Island City Support Center', city: 'New York', country: 'United States', airportCode: 'JFK' },
      { id: 'b6-boston', name: 'Boston Logan Hub Office', city: 'Boston', country: 'United States', airportCode: 'BOS' },
      { id: 'b6-fort-lauderdale', name: 'Fort Lauderdale Regional Office', city: 'Fort Lauderdale', country: 'United States', airportCode: 'FLL' },
      { id: 'b6-orlando', name: 'Orlando Operations Desk', city: 'Orlando', country: 'United States', airportCode: 'MCO' }
    ]
  },
  {
    id: 'avianca',
    name: 'Avianca',
    code: 'AV',
    primaryColor: '#e01e26',
    accentColor: '#ffffff',
    selected: true,
    offices: [
      { id: 'av-miami', name: 'Miami North America Sales Office', city: 'Miami', country: 'United States', airportCode: 'MIA' },
      { id: 'av-new-york', name: 'New York JFK Customer Office', city: 'New York', country: 'United States', airportCode: 'JFK' },
      { id: 'av-los-angeles', name: 'Los Angeles Passenger Services', city: 'Los Angeles', country: 'United States', airportCode: 'LAX' }
    ]
  },
  {
    id: 'frontier',
    name: 'Frontier',
    code: 'F9',
    primaryColor: '#006643',
    accentColor: '#80c342',
    selected: true,
    offices: [
      { id: 'f9-denver', name: 'Denver Corporate Office', city: 'Denver', country: 'United States', airportCode: 'DEN' },
      { id: 'f9-orlando', name: 'Orlando Base Station', city: 'Orlando', country: 'United States', airportCode: 'MCO' },
      { id: 'f9-las-vegas', name: 'Las Vegas Regional Desk', city: 'Las Vegas', country: 'United States', airportCode: 'LAS' }
    ]
  },
  {
    id: 'allegiant-air',
    name: 'Allegiant Air',
    code: 'G4',
    primaryColor: '#002b49',
    accentColor: '#fdb913',
    selected: true,
    offices: [
      { id: 'g4-las-vegas', name: 'Las Vegas Headquarters', city: 'Las Vegas', country: 'United States', airportCode: 'LAS' },
      { id: 'g4-orlando', name: 'Orlando Sanford Operations Desk', city: 'Orlando', country: 'United States', airportCode: 'SFB' },
      { id: 'g4-tampa', name: 'St. Pete-Clearwater Passenger Desk', city: 'Tampa / St. Pete', country: 'United States', airportCode: 'PIE' }
    ]
  },
  {
    id: 'hawaiian',
    name: 'Hawaiian',
    code: 'HA',
    primaryColor: '#3d1152',
    accentColor: '#cf0a2c',
    selected: true,
    offices: [
      { id: 'ha-honolulu', name: 'Honolulu Daniel K. Inouye Headquarters', city: 'Honolulu', country: 'United States', airportCode: 'HNL' },
      { id: 'ha-kahului', name: 'Maui Kahului Regional Desk', city: 'Kahului', country: 'United States', airportCode: 'OGG' },
      { id: 'ha-los-angeles', name: 'Los Angeles Mainland Office', city: 'Los Angeles', country: 'United States', airportCode: 'LAX' }
    ]
  },
  {
    id: 'klm',
    name: 'KLM',
    code: 'KL',
    primaryColor: '#00a1de',
    accentColor: '#ffffff',
    selected: true,
    offices: [
      { id: 'kl-new-york', name: 'New York Customer Care Office', city: 'New York', country: 'United States', airportCode: 'JFK' },
      { id: 'kl-atlanta', name: 'Atlanta Joint Operations Office', city: 'Atlanta', country: 'United States', airportCode: 'ATL' },
      { id: 'kl-houston', name: 'Houston Intercontinental Counter', city: 'Houston', country: 'United States', airportCode: 'IAH' }
    ]
  },
  {
    id: 'latam',
    name: 'Latam',
    code: 'LA',
    primaryColor: '#10004f',
    accentColor: '#ff004f',
    selected: true,
    offices: [
      { id: 'la-miami', name: 'Miami Hub Office', city: 'Miami', country: 'United States', airportCode: 'MIA' },
      { id: 'la-new-york', name: 'New York Passenger Service Desk', city: 'New York', country: 'United States', airportCode: 'JFK' }
    ]
  },
  {
    id: 'emirates',
    name: 'Emirates',
    code: 'EK',
    primaryColor: '#d71921',
    accentColor: '#d4af37',
    selected: true,
    offices: [
      { id: 'ek-new-york', name: 'New York Manhattan Sales Office', city: 'New York', country: 'United States', airportCode: 'JFK' },
      { id: 'ek-los-angeles', name: 'Los Angeles Passenger Center', city: 'Los Angeles', country: 'United States', airportCode: 'LAX' },
      { id: 'ek-chicago', name: 'Chicago O\'Hare Station', city: 'Chicago', country: 'United States', airportCode: 'ORD' }
    ]
  },
  {
    id: 'lufthansa',
    name: 'Lufthansa',
    code: 'LH',
    primaryColor: '#05164d',
    accentColor: '#ffad00',
    selected: true,
    offices: [
      { id: 'lh-new-york', name: 'East Meadow New York Regional Office', city: 'New York', country: 'United States', airportCode: 'JFK' },
      { id: 'lh-chicago', name: 'Chicago Station Support Desk', city: 'Chicago', country: 'United States', airportCode: 'ORD' }
    ]
  }
];
