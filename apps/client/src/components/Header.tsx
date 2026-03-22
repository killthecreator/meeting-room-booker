import { useAuth } from "../context/AuthContext";
import CalendarIcon from "./Icons/CalendarIcon";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/60 bg-white/70 px-6 py-3 backdrop-blur-xl dark:border-zinc-700/80 dark:bg-zinc-900/80">
      <div className="flex items-center gap-3">
        <div className="from-primary-500 to-primary-700 shadow-primary-500/20 flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br shadow-sm">
          <CalendarIcon className="size-4 text-white" />
        </div>
        <h1 className="text-base font-semibold tracking-tight text-secondary-900 dark:text-zinc-100">
          Meeting Room Booker
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-secondary-500 dark:text-zinc-400">
          {user!.name}
        </span>
        <button
          onClick={logout}
          className="cursor-pointer rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-xs font-medium text-secondary-600 shadow-sm transition-all duration-200 hover:border-secondary-300 hover:text-secondary-800 hover:shadow active:scale-[0.97] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
