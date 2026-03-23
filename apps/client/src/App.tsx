import { MeetingCalendar } from "./components/MeetingCalendar";
import { LoginPage } from "./components/LoginPage";
import { ConfirmMeetingCreationProvider } from "./context/ConfirmMeetingCreationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MeetingsProvider } from "./context/MeetingsContext";
import Header from "./components/Header";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import { usePrefersDarkMode } from "./lib/usePrefersDarkMode";
import { GOOGLE_CLIENT_ID } from "./config";

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
  const prefersDark = usePrefersDarkMode();

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        closeOnClick
        pauseOnHover
        newestOnTop
        hideProgressBar
        stacked
        theme={prefersDark ? "dark" : "light"}
      />
    </GoogleOAuthProvider>
  );
}
