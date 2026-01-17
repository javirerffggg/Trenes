export interface Station {
  id: string;
  name: string;
  zone?: number;
}

export interface StopTime {
  stationId: string;
  stationName: string;
  time: string; // HH:mm
}

export interface TrainService {
  id: string;
  line: 'C1' | 'C1a';
  departureTime: string; // HH:mm
  arrivalTime: string; // HH:mm
  durationMinutes: number;
  stops: StopTime[];
  isAccessible: boolean;
}

export interface SearchState {
  origin: string | null;
  destination: string | null;
  date: Date;
}