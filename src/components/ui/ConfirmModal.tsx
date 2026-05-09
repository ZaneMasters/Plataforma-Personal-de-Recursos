import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
}

export const ConfirmModal = ({ isOpen, title, description, onConfirm, onCancel }: ConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-white/95 dark:bg-surface-800/95 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6 border border-red-200 dark:border-red-900/50">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2 font-display tracking-tight">{title}</h3>
          <p className="text-surface-500 dark:text-surface-400 mb-8 max-w-sm leading-relaxed text-sm">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              className="px-6 py-2.5 text-sm font-bold text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 rounded-lg transition-colors w-full sm:w-auto"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded shadow-sm transition-all active:scale-95 w-full sm:w-auto"
              onClick={onConfirm}
            >
              Sí, Confirmar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
