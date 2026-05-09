import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

interface AnimatedStarButtonProps {
  isFavorite: boolean | undefined;
  onClick: (e: React.MouseEvent) => void;
}

export const AnimatedStarButton = ({ isFavorite, onClick }: AnimatedStarButtonProps) => {
  const [isBursting, setIsBursting] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFavorite) {
      setIsBursting(true);
      setTimeout(() => setIsBursting(false), 800);
    }
    onClick(e);
  };

  const particleColors = [
    'text-amber-400',
    'text-yellow-500',
    'text-orange-400',
    'text-pink-400',
    'text-rose-400',
    'text-purple-400'
  ];

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        title={isFavorite ? "Quitar de Favoritos" : "Añadir a Favoritos"}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors relative z-10 ${isFavorite ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 shadow-sm' : 'bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-700'}`}
      >
        <Star className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-amber-400 text-amber-500' : 'text-surface-400'}`} />
      </button>

      <AnimatePresence>
        {isBursting && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(6)].map((_, i) => {
              const angle = (i * 360) / 6 - 90;
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * 45;
              const y = Math.sin(rad) * 45;
              const colorClass = particleColors[i % particleColors.length];
              return (
                <motion.div
                  key={i}
                  initial={{ x: "-50%", y: "-50%", opacity: 1, scale: 0, rotate: 0 }}
                  animate={{
                    x: `calc(-50% + ${x}px)`,
                    y: `calc(-50% + ${y}px)`,
                    opacity: [1, 1, 0],
                    scale: [0, 1.2, 0],
                    rotate: [0, 180]
                  }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`absolute top-1/2 left-1/2 ${colorClass}`}
                >
                  <Star className="w-3 h-3 fill-current" />
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
