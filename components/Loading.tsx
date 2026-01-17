import React from 'react';
import { motion } from 'framer-motion';

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-48 w-full">
      <motion.svg
        width="120"
        height="40"
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
      >
        {/* Track */}
        <path d="M10 35H110" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.3" />
        
        {/* Train Body Outline - Abstract */}
        <motion.path
          d="M20 25H100L110 35H10L20 25Z"
          stroke="#38bdf8"
          strokeWidth="2"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { 
              pathLength: 1, 
              opacity: 1,
              transition: { 
                duration: 1.5, 
                ease: "easeInOut", 
                repeat: Infinity,
                repeatType: "reverse"
              } 
            }
          }}
        />
        
        {/* Speed lines */}
        <motion.path
          d="M115 28H125"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ x: [-10, 0, -10], opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M112 32H118"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ x: [-10, 0, -10], opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.2, ease: "linear" }}
        />
      </motion.svg>
      <p className="text-blue-200/60 text-sm font-medium mt-4 tracking-wider animate-pulse">
        CARGANDO HORARIOS
      </p>
    </div>
  );
};

export default Loading;