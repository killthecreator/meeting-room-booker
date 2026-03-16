import { MeetingCalendar } from "./components/MeetingCalendar";
import { LoginPage } from "./components/LoginPage";
import { ConfirmMeetingCreationProvider } from "./context/ConfirmMeetingCreationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="bg-secondary-50 flex min-h-screen items-center justify-center">
        <p className="text-secondary-500">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="bg-secondary-50 flex min-h-screen flex-col">
      <header className="border-secondary-200 sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-white px-4 py-3 shadow-sm">
        <h1 className="text-secondary-800 text-lg font-semibold">
          Meeting Room Booker
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-secondary-600 text-sm">{user.name}</span>
          <button
            onClick={logout}
            className="text-secondary-500 hover:text-secondary-700 cursor-pointer text-sm underline"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex flex-1 justify-center p-4">
        <ConfirmMeetingCreationProvider>
          <MeetingCalendar />
        </ConfirmMeetingCreationProvider>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
