import { MeetingCalendar } from "./components/MeetingCalendar";
import { LoginPage } from "./components/LoginPage";
import { ConfirmMeetingCreationProvider } from "./context/ConfirmMeetingCreationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MeetingsProvider } from "./context/MeetingsContext";
import Header from "./components/Header";

import { GoogleOAuthProvider } from "@react-oauth/google";

function AppContent() {
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex w-[90vw] flex-1 justify-center p-6">
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
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
