import { MeetingCalendar } from "./components/MeetingCalendar";
import { LoginPage } from "./components/LoginPage";
import { ConfirmMeetingCreationProvider } from "./context/ConfirmMeetingCreationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <p className="text-secondary-500">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary-50">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-3 bg-white border-b border-secondary-200 shadow-sm">
        <h1 className="text-lg font-semibold text-secondary-800">
          Meeting Room Booker
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-secondary-600">{user.name}</span>
          <button
            onClick={logout}
            className="text-sm cursor-pointer text-secondary-500 hover:text-secondary-700 underline"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 flex justify-center">
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
