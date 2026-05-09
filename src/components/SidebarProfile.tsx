import { LogOut } from 'lucide-react';
import type { User } from 'firebase/auth';

interface SidebarProfileProps {
  user: User | null | undefined;
  onLogout: (() => void) | undefined;
}

export const SidebarProfile = ({ user, onLogout }: SidebarProfileProps) => {
  if (!user) return null;

  return (
    <div className="mx-4 mt-4 p-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg flex flex-col gap-3 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-colors">
      <div className="flex items-center gap-3">
        {user.photoURL ? (
          <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full shadow-sm" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-900 dark:bg-surface-700 text-white flex items-center justify-center text-xs font-bold">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="overflow-hidden flex-1">
          <p className="text-xs font-bold text-surface-800 dark:text-surface-200 truncate">
            {user.displayName || 'Usuario'}
          </p>
          <p className="text-[10px] text-surface-500 dark:text-surface-400 truncate">{user.email}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full py-1.5 px-2 bg-surface-50 dark:bg-surface-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-600 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 rounded text-xs font-bold transition-colors border border-surface-200 dark:border-surface-700 hover:border-red-200 dark:hover:border-red-900/50 flex items-center justify-center space-x-1"
      >
        <LogOut className="w-3 h-3" />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  );
};
