import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, TrainFront } from 'lucide-react';
import { TrainService } from '../types';

interface TimeCardProps {
  service: TrainService;
  index: number;
}

const TimeCard: React.FC<TimeCardProps> = ({ service, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'upcoming' | 'transit' | 'passed'>('upcoming');

  // Logic for the real-time progress bar
  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      const [depH, depM] = service.departureTime.split(':').map(Number);
      const [arrH, arrM] = service.arrivalTime.split(':').map(Number);
      
      const depDate = new Date();
      depDate.setHours(depH, depM, 0, 0);
      
      const arrDate = new Date();
      arrDate.setHours(arrH, arrM, 0, 0);

      // Handle overnight trips (unlikely for short distance, but good practice)
      if (arrDate < depDate) arrDate.setDate(arrDate.getDate() + 1);

      if (now < depDate) {
        setStatus('upcoming');
        setProgress(0);
      } else if (now > arrDate) {
        setStatus('passed');
        setProgress(100);
      } else {
        setStatus('transit');
        const totalDuration = arrDate.getTime() - depDate.getTime();
        const elapsed = now.getTime() - depDate.getTime();
        setProgress((elapsed / totalDuration) * 100);
      }
    };

    updateProgress();
    const timer = setInterval(updateProgress, 30000); // Update every 30s
    return () => clearInterval(timer);
  }, [service]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="w-full max-w-md mx-auto mb-4"
    >
      <div 
        className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
          status === 'transit' 
            ? 'bg-blue-900/20 border-blue-400/40 shadow-[0_0_20px_rgba(56,189,248,0.15)]' 
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        } backdrop-blur-md`}
      >
        {/* Progress Bar Background */}
        {status === 'transit' && (
          <div className="absolute top-0 left-0 h-full bg-blue-500/5 z-0" style={{ width: `${progress}%` }} />
        )}
        
        {/* Top Progress Line (Visual Accent) */}
        {status === 'transit' && (
          <motion.div 
            className="absolute top-0 left-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee] z-10"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        )}

        <div className="p-4 relative z-10" onClick={() => setExpanded(!expanded)}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-600/80 text-white">
                {service.line}
              </span>
              {status === 'transit' && (
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-cyan-400 font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  En camino
                </span>
              )}
            </div>
            <div className="text-white/40 text-xs font-mono">
              {service.durationMinutes} min
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-center">
              <span className="block text-2xl font-bold text-white tracking-tight">{service.departureTime}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Salida</span>
            </div>
            
            <div className="flex-1 px-4 flex flex-col items-center">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent relative">
                 <TrainFront size={16} className="absolute -top-2 left-1/2 -translate-x-1/2 text-slate-500" />
              </div>
            </div>

            <div className="text-center">
              <span className="block text-2xl font-bold text-white tracking-tight">{service.arrivalTime}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Llegada</span>
            </div>
          </div>
        </div>

        {/* Accordion for Stops */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-black/20 border-t border-white/5"
            >
              <div className="p-4 space-y-3">
                {service.stops.map((stop, i) => (
                  <div key={stop.stationId} className="flex items-center gap-3 relative">
                    {/* Vertical Line */}
                    {i !== service.stops.length - 1 && (
                      <div className="absolute left-[5px] top-[14px] w-[1px] h-full bg-white/10" />
                    )}
                    
                    <div className="w-2.5 h-2.5 rounded-full border border-white/30 bg-slate-900 z-10" />
                    <span className="text-sm text-slate-300 flex-1">{stop.stationName}</span>
                    <span className="text-xs font-mono text-slate-500">{stop.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Expand Indicator */}
        <div 
          className="h-4 flex items-center justify-center bg-black/10 cursor-pointer hover:bg-black/20 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
            <ChevronDown size={14} className="text-white/30" />
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};

export default TimeCard;