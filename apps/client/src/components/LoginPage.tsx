import { useAuth } from "../context/AuthContext";
import CalendarIcon from "./Icons/CalendarIcon";
import GoogleLogo from "./Icons/GoogleLogo";

export function LoginPage() {
  const { login, error } = useAuth();

  return (
    <div className="flex min-h-screen min-w-screen flex-col items-center justify-center bg-linear-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] p-4 dark:from-slate-950 dark:via-indigo-950 dark:to-violet-950">
      <div className="animate-fade-in shadow-primary-900/10 w-full max-w-sm rounded-2xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/85 dark:shadow-black/40">
        <div className="from-primary-500 to-primary-700 shadow-primary-500/30 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg">
          <CalendarIcon className="size-7 text-white" />
        </div>
        <h1 className="mb-1 text-center text-xl font-bold tracking-tight text-secondary-900 dark:text-zinc-100">
          Meeting Room Booker
        </h1>
        <p className="mb-8 text-center text-sm font-light text-secondary-500 dark:text-zinc-400">
          Sign in with your Google account to continue
        </p>
        {error && (
          <p
            className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={login}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-secondary-200 bg-white text-base font-medium text-secondary-800 shadow-sm transition-all duration-200 hover:border-secondary-300 hover:shadow-md active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-500"
        >
          <GoogleLogo className="size-5" />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}
