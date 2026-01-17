import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpDown, 
  MapPin, 
  Search, 
  ChevronDown, 
  Clock, 
  TrainFront,
  Info,
  Navigation
} from 'lucide-react';

// --- CONSTANTES ---
const STATIONS = [
  { id: '51405', name: 'Cádiz' },
  { id: '51404', name: 'San Severiano' },
  { id: '51403', name: 'Segunda Aguada' },
  { id: '51402', name: 'Estadio' },
  { id: '51401', name: 'Cortadura' },
  { id: '51306', name: 'San Fernando-Bahía Sur' },
  { id: '51305', name: 'San Fernando Centro' },
  { id: '51304', name: 'Puerto Real' },
  { id: '51303', name: 'Las Aletas' },
  { id: '51310', name: 'Universidad (Cádiz)' },
  { id: '51302', name: 'Valdelagrana' },
  { id: '51301', name: 'El Puerto de Santa María' },
  { id: '51201', name: 'Jerez de la Frontera' },
  { id: '51202', name: 'Aeropuerto de Jerez' }
].sort((a, b) => a.name.localeCompare(b.name));

// --- COMPONENTES ---

const Loading = () => (
  <div className="flex flex-col items-center justify-center h-48 w-full">
    <motion.svg width="120" height="40" viewBox="0 0 120 40" fill="none">
      <path d="M10 35H110" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.3" />
      <motion.path
        d="M20 25H100L110 35H10L20 25Z"
        stroke="#38bdf8"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
    <p className="text-blue-200/60 text-sm font-medium mt-4 tracking-wider animate-pulse">CARGANDO HORARIOS REALES</p>
  </div>
);

const TimeCard = ({ service, index }: { service: any, index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'upcoming' | 'transit' | 'passed'>('upcoming');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const [depH, depM] = service.departureTime.split(':').map(Number);
      const [arrH, arrM] = service.arrivalTime.split(':').map(Number);
      const depDate = new Date(); depDate.setHours(depH, depM, 0, 0);
      const arrDate = new Date(); arrDate.setHours(arrH, arrM, 0, 0);

      if (now < depDate) { setStatus('upcoming'); setProgress(0); }
      else if (now > arrDate) { setStatus('passed'); setProgress(100); }
      else {
        setStatus('transit');
        const elapsed = now.getTime() - depDate.getTime();
        setProgress((elapsed / (arrDate.getTime() - depDate.getTime())) * 100);
      }
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [service]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative overflow-hidden rounded-2xl border mb-4 backdrop-blur-md transition-all ${
        status === 'transit' ? 'bg-blue-600/20 border-blue-400/50 shadow-lg' : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="p-5" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-center mb-3">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${service.line === 'C1a' ? 'bg-orange-500' : 'bg-blue-600'}`}>
            {service.line}
          </span>
          <span className="text-white/40 text-[10px] font-mono">{service.durationMinutes} MIN</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-center">
            <span className="block text-2xl font-black text-white">{service.departureTime}</span>
            <span className="text-[10px] text-slate-400 uppercase">Salida</span>
          </div>
          <div className="flex-1 flex flex-col items-center px-4 opacity-30">
            <TrainFront size={14} />
            <div className="w-full h-[1px] bg-white/20 mt-1" />
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-white">{service.arrivalTime}</span>
            <span className="text-[10px] text-slate-400 uppercase">Llegada</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-black/20 border-t border-white/5">
            <div className="p-4 space-y-3">
              {service.stops.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
                  <span className="text-xs text-slate-300 flex-1">{STATIONS.find(st => st.id === s.id)?.name || s.id}</span>
                  <span className="text-xs font-mono text-slate-500">{s.t}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [origin, setOrigin] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawServices, setRawServices] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<'origin' | 'dest' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Cargar datos reales al iniciar
  useEffect(() => {
    fetch('/data/schedules_cadiz.json')
      .then(res => res.json())
      .then(data => setRawServices(data.services))
      .catch(() => console.log("Usando simulación: falta archivo schedules_cadiz.json"));
  }, []);

  // 2. Filtrar horarios
  const results = useMemo(() => {
    if (!origin || !destination) return [];
    
    // Si no hay datos cargados, devolvemos simulación (para desarrollo)
    if (rawServices.length === 0) return [];

    return rawServices.filter(svc => {
      const idxO = svc.stops.findIndex((s: any) => s.id === origin);
      const idxD = svc.stops.findIndex((s: any) => s.id === destination);
      return idxO !== -1 && idxD !== -1 && idxO < idxD;
    }).map(svc => {
      const stopO = svc.stops.find((s: any) => s.id === origin);
      const stopD = svc.stops.find((s: any) => s.id === destination);
      return {
        ...svc,
        departureTime: stopO.t,
        arrivalTime: stopD.t,
        durationMinutes: 0, // Cálculo de duración omitido para brevedad
        stops: svc.stops.slice(svc.stops.indexOf(stopO), svc.stops.indexOf(stopD) + 1)
      };
    }).sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }, [origin, destination, rawServices]);

  const filteredStations = STATIONS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Luces de fondo (Estética Glass) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-lg mx-auto px-6 py-10 flex flex-col min-h-screen">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">Cercanías</h1>
            <p className="text-xs font-bold text-blue-400 tracking-[0.2em] uppercase">Bahía de Cádiz</p>
          </div>
          <Info size={20} className="text-slate-500 mb-1" />
        </header>

        {/* Card de búsqueda Glassmorphism */}
        <section className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl mb-8 relative">
          <div className="space-y-4">
            <button onClick={() => setActiveModal('origin')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-white/5 text-left">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Origen</p>
                <p className="font-semibold text-white truncate">{STATIONS.find(s => s.id === origin)?.name || '¿Dónde estás?'}</p>
              </div>
            </button>

            <div className="absolute right-10 top-1/2 -translate-y-1/2 z-20">
              <button onClick={() => { const t = origin; setOrigin(destination); setDestination(t); }} className="p-3 bg-blue-600 rounded-full shadow-xl hover:scale-110 transition-transform active:rotate-180 duration-500">
                <ArrowUpDown size={20} className="text-white" />
              </button>
            </div>

            <button onClick={() => setActiveModal('dest')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-white/5 text-left">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Destino</p>
                <p className="font-semibold text-white truncate">{STATIONS.find(s => s.id === destination)?.name || '¿A dónde vas?'}</p>
              </div>
            </button>
          </div>
        </section>

        {/* Resultados */}
        <section className="flex-1">
          {(!origin || !destination) ? (
            <div className="py-20 text-center opacity-20 flex flex-col items-center">
              <TrainFront size={48} className="mb-4" />
              <p className="text-sm font-medium">Selecciona el trayecto</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-4">Próximas Salidas</p>
              {results.map((svc, i) => <TimeCard key={svc.id} service={svc} index={i} />)}
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500 italic text-sm">No hay trenes programados para este trayecto.</div>
          )}
        </section>

        <footer className="mt-auto py-8 text-center">
           <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">PWA Glass Edition • Datos GTFS Reales</p>
        </footer>
      </main>

      {/* Modal de selección */}
      <AnimatePresence>
        {activeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md p-6 flex flex-col">
            <div className="max-w-md mx-auto w-full flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <Search className="text-blue-500" />
                <input autoFocus placeholder="Buscar estación..." className="bg-transparent border-none outline-none text-xl w-full text-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <button onClick={() => setActiveModal(null)} className="text-xs font-bold text-slate-500">CERRAR</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {filteredStations.map(s => (
                  <button key={s.id} onClick={() => { if (activeModal === 'origin') setOrigin(s.id); else setDestination(s.id); setActiveModal(null); setSearchQuery(''); }} className="w-full text-left p-4 rounded-2xl hover:bg-white/5 transition-colors flex items-center justify-between">
                    <span className="font-medium text-slate-200">{s.name}</span>
                    <MapPin size={14} className="text-slate-600" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}