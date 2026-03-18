import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/60 bg-white/70 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="from-primary-500 to-primary-700 shadow-primary-500/20 flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br shadow-sm">
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
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
