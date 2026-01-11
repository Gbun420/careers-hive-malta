export type MaltaRegion = 
  | 'Northern'
  | 'Northern Harbour'
  | 'South Eastern'
  | 'Southern Harbour'
  | 'Western'
  | 'Gozo'
  | 'Remote';

const REGION_MAP: Record<string, MaltaRegion> = {
  // Northern Harbour
  'birkirkara': 'Northern Harbour',
  'gzira': 'Northern Harbour',
  'hamrun': 'Northern Harbour',
  'msida': 'Northern Harbour',
  'pembroke': 'Northern Harbour',
  'pieta': 'Northern Harbour',
  'qormi': 'Northern Harbour',
  'st julian': 'Northern Harbour',
  'st julians': 'Northern Harbour',
  'san gwann': 'Northern Harbour',
  'santa venera': 'Northern Harbour',
  'sliema': 'Northern Harbour',
  'swieqi': 'Northern Harbour',
  'ta xbiex': 'Northern Harbour',
  'ta\' xbiex': 'Northern Harbour',
  'st. julian': 'Northern Harbour',
  'st. julians': 'Northern Harbour',

  // Southern Harbour
  'birgu': 'Southern Harbour',
  'vittoriosa': 'Southern Harbour',
  'bormla': 'Southern Harbour',
  'cospicua': 'Southern Harbour',
  'fgura': 'Southern Harbour',
  'floriana': 'Southern Harbour',
  'isla': 'Southern Harbour',
  'senglea': 'Southern Harbour',
  'kalkara': 'Southern Harbour',
  'luqa': 'Southern Harbour',
  'marsa': 'Southern Harbour',
  'paola': 'Southern Harbour',
  'santa lucija': 'Southern Harbour',
  'tarxien': 'Southern Harbour',
  'valletta': 'Southern Harbour',
  'xgħajra': 'Southern Harbour',
  'zabbar': 'Southern Harbour',

  // Northern
  'għargħur': 'Northern',
  'mellieħa': 'Northern',
  'mellieha': 'Northern',
  'mġarr': 'Northern',
  'mgarr': 'Northern',
  'mosta': 'Northern',
  'naxxar': 'Northern',
  'st paul': 'Northern',
  'st pauls': 'Northern',
  'st. paul': 'Northern',
  'st. pauls': 'Northern',
  'bugibba': 'Northern',
  'qawra': 'Northern',

  // Western
  'attard': 'Western',
  'balzan': 'Western',
  'dingli': 'Western',
  'iklin': 'Western',
  'lija': 'Western',
  'mdina': 'Western',
  'mtarfa': 'Western',
  'rabat': 'Western',
  'siġġiewi': 'Western',
  'siggiewi': 'Western',
  'zebbug': 'Western',
  'haz-zebbug': 'Western',

  // South Eastern
  'birżebbuġa': 'South Eastern',
  'birzebbuga': 'South Eastern',
  'għaxaq': 'South Eastern',
  'ghaxaq': 'South Eastern',
  'gudja': 'South Eastern',
  'kirkop': 'South Eastern',
  'marsaskala': 'South Eastern',
  'marsascala': 'South Eastern',
  'marsaxlokk': 'South Eastern',
  'mqabba': 'South Eastern',
  'qrendi': 'South Eastern',
  'safi': 'South Eastern',
  'zejtun': 'South Eastern',
  'żurrieq': 'South Eastern',
  'zurrieq': 'South Eastern',

  // Gozo
  'victoria': 'Gozo',
  'rabat gozo': 'Gozo',
  'fontana': 'Gozo',
  'għajnsielem': 'Gozo',
  'ghajnsielem': 'Gozo',
  'għarb': 'Gozo',
  'gharb': 'Gozo',
  'għasri': 'Gozo',
  'ghasri': 'Gozo',
  'kerċem': 'Gozo',
  'kercem': 'Gozo',
  'munxar': 'Gozo',
  'nadur': 'Gozo',
  'qala': 'Gozo',
  'san lawrenz': 'Gozo',
  'sannat': 'Gozo',
  'xagħra': 'Gozo',
  'xaghra': 'Gozo',
  'xewkija': 'Gozo',
  'żebbuġ gozo': 'Gozo',
  'zebbug gozo': 'Gozo',
  'gozo': 'Gozo',
};

/**
 * Derives the Maltese NSO region from a location string.
 */
export function deriveRegion(location: string): MaltaRegion {
  const loc = location.toLowerCase().trim();
  
  if (loc.includes('remote') || loc.includes('work from home')) {
    return 'Remote';
  }

  // Check for direct matches in the map
  for (const [locality, region] of Object.entries(REGION_MAP)) {
    if (loc.includes(locality)) {
      return region;
    }
  }

  // Default if no match found
  return 'Northern Harbour'; // Most jobs are here, but maybe return a broader default or null?
  // Actually, let's return 'Northern Harbour' as it's the economic hub.
}

/**
 * Estimates commute time in minutes from major hubs (Valletta/Sliema) 
 * based on the region.
 */
export function estimateCommuteTime(region: MaltaRegion): number {
  const estimates: Record<MaltaRegion, number> = {
    'Northern Harbour': 15,
    'Southern Harbour': 15,
    'Northern': 35,
    'Western': 25,
    'South Eastern': 30,
    'Gozo': 90,
    'Remote': 0
  };
  return estimates[region];
}
