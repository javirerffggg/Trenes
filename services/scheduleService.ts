import { Station, TrainService, StopTime } from '../types';
import { STATIONS } from '../constants';

// Helper to add minutes to a time string
const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m + minutes);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// Calculates duration between two time strings
const getDuration = (start: string, end: string): number => {
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
};

// SIMULATION ENGINE:
// Since we don't have the live backend here, we simulate the "Algorithm" described in the prompt.
// In a real app, this would query the indexedDB populated from the GTFS `stop_times.txt`.
export const findSchedules = (
  originId: string,
  destinationId: string,
  _date: Date // In a real app, we check calendar.txt exceptions here
): TrainService[] => {
  
  const originIdx = STATIONS.findIndex(s => s.id === originId);
  const destIdx = STATIONS.findIndex(s => s.id === destinationId);

  if (originIdx === -1 || destIdx === -1) return [];

  const direction = destIdx > originIdx ? 1 : -1; // 1 = Towards Jerez, -1 = Towards Cádiz
  const stationSubset = direction === 1 
    ? STATIONS.slice(originIdx, destIdx + 1)
    : STATIONS.slice(destIdx, originIdx + 1).reverse();

  // Generate mock services based on current time to make it feel alive
  const services: TrainService[] = [];
  const now = new Date();
  let startHour = now.getHours();
  if (startHour < 6) startHour = 6; // First train

  // Create 10 trains starting from "now" or 6AM
  for (let i = 0; i < 10; i++) {
    const hour = (startHour + Math.floor(i / 2)) % 24;
    const minute = (i % 2) * 30 + 15; // :15 and :45
    
    // Skip if it's late night (just for realism)
    if (hour > 23 || hour < 5) continue;

    const departureBase = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Calculate stops with realistic travel times (approx 3-5 mins per station)
    const stops: StopTime[] = stationSubset.map((station, idx) => {
      const travelTime = idx * 4; // 4 minutes avg between stops
      return {
        stationId: station.id,
        stationName: station.name,
        time: addMinutes(departureBase, travelTime)
      };
    });

    const departureTime = stops[0].time;
    const arrivalTime = stops[stops.length - 1].time;

    services.push({
      id: `svc-${hour}-${minute}`,
      line: 'C1', // Assuming C1 for main line simulation
      departureTime,
      arrivalTime,
      durationMinutes: getDuration(departureTime, arrivalTime),
      stops,
      isAccessible: true
    });
  }

  return services;
};