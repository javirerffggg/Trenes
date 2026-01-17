import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, MapPin, Search } from 'lucide-react';
import { ALL_STATIONS } from '../constants';
import { Station } from '../types';

interface GlassSearchCardProps {
  origin: string | null;
  destination: string | null;
  onOriginChange: (id: string) => void;
  onDestinationChange: (id: string) => void;
  onSwap: () => void;
}

const GlassSearchCard: React.FC<GlassSearchCardProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwap
}) => {
  const [activeField, setActiveField] = useState<'origin' | 'dest' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const originName = ALL_STATIONS.find(s => s.id === origin)?.name || '';
  const destName = ALL_STATIONS.find(s => s.id === destination)?.name || '';

  const handleFocus = (field: 'origin' | 'dest') => {
    setActiveField(field);
    setSearchQuery('');
  };

  const handleSelect = (station: Station) => {
    if (activeField === 'origin') onOriginChange(station.id);
    if (activeField === 'dest') onDestinationChange(station.id);
    setActiveField(null);
  };

  const filteredStations = ALL_STATIONS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative z-50 w-full max-w-md mx-auto mb-6">
      <motion.div 
        className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-5"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex flex-col gap-4 relative">
          
          {/* Swap Button Absolute Centered */}
          <motion.button
            className="absolute top-1/2 left-[calc(100%-2.5rem)] md:left-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 hover:bg-blue-500/40 transition-colors"
            onClick={onSwap}
            whileTap={{ rotate: 180, scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <ArrowUpDown size={18} />
          </motion.button>

          {/* Origin Input */}
          <div className="group relative">
            <label className="text-xs text-blue-200/70 ml-1 mb-1 block uppercase tracking-wider font-bold">Origen</label>
            <div 
              className="flex items-center bg-slate-900/40 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-400/50 transition-all shadow-inner"
              onClick={() => handleFocus('origin')}
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 mr-3 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
              <span className={`text-lg font-medium truncate ${originName ? 'text-white' : 'text-white/30'}`}>
                {originName || 'Seleccionar origen...'}
              </span>
            </div>
          </div>

          {/* Destination Input */}
          <div className="group relative">
            <label className="text-xs text-blue-200/70 ml-1 mb-1 block uppercase tracking-wider font-bold">Destino</label>
            <div 
              className="flex items-center bg-slate-900/40 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-400/50 transition-all shadow-inner"
              onClick={() => handleFocus('dest')}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 mr-3 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <span className={`text-lg font-medium truncate ${destName ? 'text-white' : 'text-white/30'}`}>
                {destName || 'Seleccionar destino...'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dropdown Modal for Selection */}
      <AnimatePresence>
        {activeField && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-0 left-0 w-full h-auto min-h-[300px] max-h-[500px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            {/* Search Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="text-blue-400" size={20} />
              <input 
                autoFocus
                type="text"
                placeholder={`Buscar ${activeField === 'origin' ? 'origen' : 'destino'}...`}
                className="bg-transparent text-white w-full outline-none text-lg placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => setActiveField(null)}
                className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded hover:bg-white/10"
              >
                ESC
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-2">
              {filteredStations.map((station) => (
                <motion.button
                  key={station.id}
                  layout
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-600/20 text-slate-300 hover:text-white transition-colors flex items-center gap-3 group"
                  onClick={() => handleSelect(station)}
                >
                  <MapPin size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                  <span className="font-medium">{station.name}</span>
                </motion.button>
              ))}
              {filteredStations.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  No se encontraron estaciones.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlassSearchCard;