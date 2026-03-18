import { MeetingCalendar } from "./components/MeetingCalendar";
import { LoginPage } from "./components/LoginPage";
import { ConfirmMeetingCreationProvider } from "./context/ConfirmMeetingCreationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MeetingsProvider } from "./context/MeetingsContext";
import Header from "./components/Header";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary-200 border-t-primary-600 h-8 w-8 animate-spin rounded-full border-[3px]" />
          <p className="text-secondary-400 text-sm font-light tracking-wide">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 justify-center p-6">
        <MeetingsProvider>
          <ConfirmMeetingCreationProvider>
            <MeetingCalendar />
          </ConfirmMeetingCreationProvider>
        </MeetingsProvider>
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
