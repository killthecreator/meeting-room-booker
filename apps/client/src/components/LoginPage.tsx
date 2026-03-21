import { useAuth } from "../context/AuthContext";
import CalendarIcon from "./Icons/CalendarIcon";
import GoogleLogo from "./Icons/GoogleLogo";

export function LoginPage() {
  const { login, error, loading } = useAuth();

  return (
    <div
      className="flex min-h-screen min-w-screen flex-col items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      }}
    >
      <div className="animate-fade-in shadow-primary-900/10 w-full max-w-sm rounded-2xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="from-primary-500 to-primary-700 shadow-primary-500/30 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg">
          <CalendarIcon className="size-7 text-white" />
        </div>
        <h1 className="text-secondary-900 mb-1 text-center text-xl font-bold tracking-tight">
          Meeting Room Booker
        </h1>
        <p className="text-secondary-500 mb-8 text-center text-sm font-light">
          Sign in with your Google account to continue
        </p>
        {error && (
          <p
            className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={login}
          disabled={loading}
          className="border-secondary-200 text-secondary-800 hover:border-secondary-300 flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border bg-white text-base font-medium shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
        >
          {loading ? (
            <span
              className="border-secondary-300 border-t-secondary-700 size-5 shrink-0 animate-spin rounded-full border-2"
              aria-hidden
            />
          ) : (
            <GoogleLogo className="size-5" />
          )}
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}
