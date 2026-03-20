import { MeetingCalendar } from "./components/MeetingCalendar";
import { LoginPage } from "./components/LoginPage";
import { ConfirmMeetingCreationProvider } from "./context/ConfirmMeetingCreationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MeetingsProvider } from "./context/MeetingsContext";
import Header from "./components/Header";
import { api } from "./api";
import { cache, Suspense } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

const LoadingFallback = () => {
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
};

const cachedMeetingsRequest = cache(api.meetings.getAll);

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!user) return <LoginPage />;

  const meetingsPromise = cachedMeetingsRequest();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex w-[90vw] flex-1 justify-center p-6">
        <Suspense fallback={<LoadingFallback />}>
          <MeetingsProvider meetingsPromise={meetingsPromise}>
            <ConfirmMeetingCreationProvider>
              <MeetingCalendar />
            </ConfirmMeetingCreationProvider>
          </MeetingsProvider>
        </Suspense>
      </main>
    </div>
  );
}

const cachedVerifyRequest = cache(api.auth.verifyToken);

export default function App() {
  const verifyAuthTokenPromise = cachedVerifyRequest();
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
      <Suspense fallback={<LoadingFallback />}>
        <AuthProvider verifyAuthTokenPromise={verifyAuthTokenPromise}>
          <AppContent />
        </AuthProvider>
      </Suspense>
    </GoogleOAuthProvider>
  );
}
