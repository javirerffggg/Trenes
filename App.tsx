import React, { useState, useEffect, useMemo } from 'react';
import GlassSearchCard from './components/GlassSearchCard';
import TimeCard from './components/TimeCard';
import Loading from './components/Loading';
import { SearchState, TrainService } from './types';
import { findSchedules } from './services/scheduleService';
import { Info } from 'lucide-react';

const App: React.FC = () => {
  const [search, setSearch] = useState<SearchState>({
    origin: null, // Default
    destination: null,
    date: new Date()
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TrainService[]>([]);

  // Simulate loading delay for "App-like" feel
  useEffect(() => {
    if (search.origin && search.destination) {
      setLoading(true);
      
      const timer = setTimeout(() => {
        const data = findSchedules(search.origin!, search.destination!, search.date);
        setResults(data);
        setLoading(false);
      }, 800); // 800ms artificial delay for the animation

      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [search.origin, search.destination, search.date]);

  const handleSwap = () => {
    setSearch(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans selection:bg-blue-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[100px]" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-lg mx-auto px-4 py-8 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Cercanías
            </h1>
            <p className="text-sm text-blue-200/50 font-medium tracking-wide">
              BAHÍA DE CÁDIZ
            </p>
          </div>
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <Info size={20} className="text-slate-400" />
          </button>
        </header>

        {/* Search Interface */}
        <GlassSearchCard 
          origin={search.origin} 
          destination={search.destination}
          onOriginChange={(id) => setSearch(prev => ({ ...prev, origin: id }))}
          onDestinationChange={(id) => setSearch(prev => ({ ...prev, destination: id }))}
          onSwap={handleSwap}
        />

        {/* Results Area */}
        <div className="flex-1 pb-10">
          {loading ? (
            <Loading />
          ) : (
            <div className="space-y-4">
              {results.length > 0 ? (
                <>
                  <div className="flex justify-between items-center px-2 mb-2">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                      Próximos Trenes
                    </h3>
                    <span className="text-xs text-slate-600">
                      {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  {results.map((service, index) => (
                    <TimeCard key={service.id} service={service} index={index} />
                  ))}
                </>
              ) : (
                // Empty State
                (!search.origin || !search.destination) && (
                  <div className="text-center py-20 opacity-40">
                    <p className="text-slate-300">Selecciona origen y destino para ver horarios</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <footer className="mt-auto py-6 text-center text-xs text-slate-600">
          <p>Datos simulados basados en GTFS Renfe</p>
          <p className="mt-1">PWA Glass Edition v1.0</p>
        </footer>

      </main>
    </div>
  );
};

export default App;