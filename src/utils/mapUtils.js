import L from 'leaflet';

/**
 * Validates whether latitude and longitude are valid numbers within realistic geographical boundaries
 */
export const isValidCoordinate = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  if (typeof lat === 'string' && lat.trim() === '') return false;
  if (typeof lng === 'string' && lng.trim() === '') return false;
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (isNaN(nLat) || isNaN(nLng)) return false;
  return nLat >= -90 && nLat <= 90 && nLng >= -180 && nLng <= 180;
};

/**
 * Creates custom styled HTML markers matching RouteWise branding
 */
export const createBusIcon = (busNumber = 'Bus', heading = null, isLive = true) => {
  const rotationStyle = heading !== null && !isNaN(Number(heading)) 
    ? `transform: rotate(${Number(heading)}deg);` 
    : '';

  const pulseHtml = isLive 
    ? `<span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-teal"></span>
      </span>`
    : '';

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div class="relative group cursor-pointer">
        <div class="flex items-center justify-center w-9 h-9 rounded-2xl bg-brand-navy border-2 border-white shadow-elevated text-white transition-transform hover:scale-110" style="${rotationStyle}">
          <svg class="w-5 h-5 text-brand-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"></path>
            <path d="M16 6v6"></path>
            <path d="M2 12h20"></path>
            <path d="M4 18h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"></path>
            <path d="M6 18v2"></path>
            <path d="M18 18v2"></path>
          </svg>
        </div>
        ${pulseHtml}
        <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-soft whitespace-nowrap">
          ${busNumber}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

export const createStopIcon = (sequence = 1, status = 'upcoming') => {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';

  const bgColor = isCurrent 
    ? 'bg-brand-blue text-white ring-4 ring-brand-blue/30 scale-110 shadow-lg' 
    : isCompleted 
    ? 'bg-brand-teal text-white' 
    : 'bg-white border-2 border-slate-700 text-slate-700 shadow-soft';

  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div class="flex items-center justify-center w-7 h-7 rounded-xl ${bgColor} font-black text-xs transition-transform hover:scale-125">
        ${sequence}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
};

export const createSchoolIcon = (schoolName = 'School') => {
  return L.divIcon({
    className: 'custom-school-marker',
    html: `
      <div class="relative group cursor-pointer">
        <div class="flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 border-2 border-white shadow-elevated text-white transition-transform hover:scale-110">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"></path>
            <path d="M18 22V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v17"></path>
            <path d="M2 22h20"></path>
          </svg>
        </div>
        <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-amber-950/90 text-amber-200 font-black text-[9px] px-1.5 py-0.5 rounded shadow-soft whitespace-nowrap">
          ${schoolName}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};
