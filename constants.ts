import { Station } from './types';

// Ordenadas geográficamente de Cádiz a Aeropuerto de Jerez
export const STATIONS: Station[] = [
  { id: '51001', name: 'Cádiz' },
  { id: '51002', name: 'San Severiano' },
  { id: '51003', name: 'Segunda Aguada' },
  { id: '51004', name: 'Estadio' },
  { id: '51005', name: 'Cortadura' },
  { id: '51006', name: 'San Fernando-Bahía Sur' },
  { id: '51007', name: 'San Fernando-Centro' },
  { id: '51008', name: 'Puerto Real' },
  { id: '51009', name: 'Las Aletas' },
  { id: '51010', name: 'Valdelagrana' },
  { id: '51011', name: 'Puerto de Santa María' },
  { id: '51012', name: 'Jerez de la Frontera' },
  { id: '51013', name: 'Aeropuerto de Jerez' }
];

// Ramal C1a
export const C1A_STATIONS: Station[] = [
  { id: '51009', name: 'Las Aletas' }, // Conexión
  { id: '51201', name: 'Campus de Puerto Real' }
];

export const ALL_STATIONS = [...STATIONS, ...C1A_STATIONS.filter(s => s.id !== '51009')].sort((a, b) => a.name.localeCompare(b.name));

export const THEME = {
  colors: {
    primary: '#004B93',
    accent: '#38bdf8',
    bgStart: '#0f172a',
    bgEnd: '#1e293b',
  }
};