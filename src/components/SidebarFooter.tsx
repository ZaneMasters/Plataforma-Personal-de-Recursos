import { HelpCircle, Settings } from 'lucide-react';

interface SidebarFooterProps {
  onSettingsClick: () => void;
}

export const SidebarFooter = ({ onSettingsClick }: SidebarFooterProps) => {
  return (
    <div className="px-4 mt-auto pt-6 border-t border-surface-200/50 dark:border-surface-800 space-y-0.5">
      <button
        onClick={onSettingsClick}
        className="w-full flex items-center space-x-3 px-3 py-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800/50 rounded-md transition-colors text-sm font-medium group"
        title="Personalizar temas y colores"
      >
        <Settings className="w-4 h-4 text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300" />
        <span>Configuraciones</span>
      </button>
      <a
        href="https://github.com/ZaneMasters"
        target="_blank"
        rel="noreferrer"
        className="w-full flex items-center space-x-3 px-3 py-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800/50 rounded-md transition-colors text-sm font-medium group"
      >
        <HelpCircle className="w-4 h-4 text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300" />
        <span>Soporte</span>
      </a>
    </div>
  );
};
