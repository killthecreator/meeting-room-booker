import { useAuth } from "../context/AuthContext";
import CalendarIcon from "./Icons/CalendarIcon";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/60 bg-white/70 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="from-primary-500 to-primary-700 shadow-primary-500/20 flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br shadow-sm">
          <CalendarIcon className="size-4 text-white" />
        </div>
        <h1 className="text-secondary-900 text-base font-semibold tracking-tight">
          Meeting Room Booker
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-secondary-500 text-sm font-medium">
          {user!.name}
        </span>
        <button
          onClick={logout}
          className="border-secondary-200 text-secondary-600 hover:border-secondary-300 hover:text-secondary-800 cursor-pointer rounded-lg border bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 hover:shadow active:scale-[0.97]"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
