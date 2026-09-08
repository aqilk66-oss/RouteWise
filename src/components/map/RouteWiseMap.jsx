import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { 
  Bus, 
  MapPin, 
  Building2, 
  AlertCircle, 
  Compass, 
  Clock, 
  Maximize2, 
  Layers, 
  Navigation,
  Info
} from 'lucide-react';
import { 
  createBusIcon, 
  createStopIcon, 
  createSchoolIcon, 
  isValidCoordinate 
} from '../../utils/mapUtils';
import { formatTime } from '../../utils/formatters';

// Helper component to auto-fit map viewport to active coordinates
const MapBoundsFitter = ({ bounds, center }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else if (center) {
      map.setView(center, 14);
    }
  }, [map, bounds, center]);

  return null;
};

/**
 * RouteWise Interactive Geospatial Operational Map
 * Uses OpenStreetMap standard tiles with zero external proprietary API keys required.
 * Renders real schools, stops, route polylines, and live vehicle telemetry.
 */
export const RouteWiseMap = ({
  center = [40.7128, -74.0060], // Default fallback
  zoom = 13,
  stops = [],
  school = null,
  activeBus = null, // { busNumber, latitude, longitude, heading, speed, trackingStatus, lastUpdated }
  activeStopIndex = 0,
  onSelectStop = null,
  onSelectBus = null,
  className = '',
  height = '420px',
  fallbackText = 'Geospatial coordinates pending assignment.',
}) => {
  // Filter and format legitimate stop coordinates
  const validStops = useMemo(() => {
    return stops
      .map((s, idx) => {
        const lat = s.latitude || s.lat || (s.coordinates && s.coordinates.lat);
        const lng = s.longitude || s.lng || (s.coordinates && s.coordinates.lng);
        if (!isValidCoordinate(lat, lng)) return null;
        return {
          ...s,
          sequence: s.sequence || idx + 1,
          lat: Number(lat),
          lng: Number(lng),
          status: idx < activeStopIndex ? 'completed' : idx === activeStopIndex ? 'current' : 'upcoming'
        };
      })
      .filter(Boolean);
  }, [stops, activeStopIndex]);

  // School coordinates validation
  const validSchool = useMemo(() => {
    if (!school) return null;
    const lat = school.latitude || school.lat;
    const lng = school.longitude || school.lng;
    if (!isValidCoordinate(lat, lng)) return null;
    return {
      ...school,
      lat: Number(lat),
      lng: Number(lng)
    };
  }, [school]);

  // Active Bus location validation
  const validBus = useMemo(() => {
    if (!activeBus) return null;
    const lat = activeBus.latitude || activeBus.lat;
    const lng = activeBus.longitude || activeBus.lng;
    if (!isValidCoordinate(lat, lng)) return null;
    return {
      ...activeBus,
      lat: Number(lat),
      lng: Number(lng)
    };
  }, [activeBus]);

  // Compute polyline path through valid waypoints
  const routePolyline = useMemo(() => {
    const points = [];
    if (validSchool) points.push([validSchool.lat, validSchool.lng]);
    validStops.forEach(s => points.push([s.lat, s.lng]));
    return points;
  }, [validSchool, validStops]);

  // Compute bounding box
  const bounds = useMemo(() => {
    const allCoords = [];
    if (validSchool) allCoords.push([validSchool.lat, validSchool.lng]);
    validStops.forEach(s => allCoords.push([s.lat, s.lng]));
    if (validBus) allCoords.push([validBus.lat, validBus.lng]);
    return allCoords.length > 0 ? allCoords : null;
  }, [validSchool, validStops, validBus]);

  // Initial Center determination
  const initialCenter = useMemo(() => {
    if (validBus) return [validBus.lat, validBus.lng];
    if (validSchool) return [validSchool.lat, validSchool.lng];
    if (validStops.length > 0) return [validStops[0].lat, validStops[0].lng];
    return center;
  }, [validBus, validSchool, validStops, center]);

  const hasAnyGeodata = validStops.length > 0 || validSchool || validBus;

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-border shadow-card bg-slate-900 ${className}`}>
      {/* Map Control / Legend Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Status pill */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700 text-xs text-white shadow-soft">
          <Navigation className="w-3.5 h-3.5 text-brand-teal" />
          <span className="font-bold">
            {validBus?.isLive ? 'Live Tracking Active' : 'Corridor Navigation Map'}
          </span>
          {validBus?.isLive && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal" />
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-white shadow-soft">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Campus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
            <span>Current Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-teal" />
            <span>Passed</span>
          </div>
          {validBus && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span>Bus #{validBus.busNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Map or Graceful Coordinate Warning */}
      {!hasAnyGeodata ? (
        <div 
          className="flex flex-col items-center justify-center p-8 text-center text-slate-300 space-y-3"
          style={{ height }}
        >
          <div className="p-3 rounded-2xl bg-slate-800 text-slate-400 border border-slate-700">
            <MapPin className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-white">Geospatial Coordinates Pending</h4>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            {fallbackText} Stops, buses, and schools will automatically render once GPS latitude and longitude values are registered.
          </p>
        </div>
      ) : (
        <div style={{ height }} className="w-full relative z-0">
          <MapContainer
            center={initialCenter}
            zoom={zoom}
            scrollWheelZoom={false}
            className="w-full h-full"
            style={{ height: '100%', width: '100%' }}
          >
            {/* Standard OpenStreetMap Tile Layer with clean CartoDB Voyager styling */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <MapBoundsFitter bounds={bounds} center={initialCenter} />

            {/* Stop-to-Stop Route Polyline Corridor */}
            {routePolyline.length > 1 && (
              <Polyline
                positions={routePolyline}
                pathOptions={{
                  color: '#2563EB',
                  weight: 4,
                  opacity: 0.85,
                  dashArray: '8, 8',
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            )}

            {/* School Marker */}
            {validSchool && (
              <Marker
                position={[validSchool.lat, validSchool.lng]}
                icon={createSchoolIcon(validSchool.name || 'Campus')}
              >
                <Popup className="custom-map-popup">
                  <div className="p-1 space-y-1">
                    <p className="text-xs font-bold text-brand-navy">{validSchool.name || 'School Campus'}</p>
                    <p className="text-[11px] text-slate-500">{validSchool.address || 'District Educational Facility'}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Stops Markers */}
            {validStops.map((stop) => (
              <Marker
                key={stop.id || stop.sequence}
                position={[stop.lat, stop.lng]}
                icon={createStopIcon(stop.sequence, stop.status)}
                eventHandlers={{
                  click: () => onSelectStop && onSelectStop(stop)
                }}
              >
                <Popup className="custom-map-popup">
                  <div className="p-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-brand-blue text-white">
                        Stop #{stop.sequence}
                      </span>
                      <p className="text-xs font-bold text-brand-navy">{stop.name}</p>
                    </div>
                    {stop.address && (
                      <p className="text-[11px] text-slate-500">{stop.address}</p>
                    )}
                    {(stop.scheduledPickupTime || stop.time) && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Scheduled: {stop.scheduledPickupTime || stop.time}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Active Bus Marker */}
            {validBus && (
              <Marker
                position={[validBus.lat, validBus.lng]}
                icon={createBusIcon(validBus.busNumber, validBus.heading, validBus.isLive)}
                eventHandlers={{
                  click: () => onSelectBus && onSelectBus(validBus)
                }}
              >
                <Popup className="custom-map-popup">
                  <div className="p-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-brand-navy">Bus #{validBus.busNumber}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {validBus.trackingStatus || 'Active'}
                      </span>
                    </div>
                    {validBus.speed !== undefined && validBus.speed !== null ? (
                      <p className="text-[11px] text-slate-600 font-medium">
                        Speed: <strong>{validBus.speed} km/h</strong>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Speed unavailable
                      </p>
                    )}
                    {validBus.heading !== undefined && validBus.heading !== null && (
                      <p className="text-[11px] text-slate-600 font-medium">
                        Heading: <strong>{validBus.heading}°</strong>
                      </p>
                    )}
                    {validBus.accuracy && (
                      <p className="text-[10px] text-slate-400">
                        GPS Accuracy: ±{Math.round(validBus.accuracy)}m
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-mono">
                      Telemetry: {formatTime(validBus.lastUpdated || new Date())}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default RouteWiseMap;
