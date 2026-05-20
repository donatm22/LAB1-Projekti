import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { authApi, tokenStorage } from "./services/api";
import LoadingFallback from "./components/LoadingFallback";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load all page components for code splitting
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AboutUs = lazy(() => import("./pages/About"));
const Socials = lazy(() => import("./pages/Socials"));
const EventsPage = lazy(() => import("./pages/Eventet"));
const TicketPurchase = lazy(() => import("./pages/TicketPurchase"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Account = lazy(() => import("./pages/Account"));
const Chatbot = lazy(() => import("./components/Chatbot"));

function App() {
  useEffect(() => {
    if (!tokenStorage.getToken()) {
      authApi.refresh().catch(() => {});
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/socials" element={<Socials />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id/tickets" element={<TicketPurchase />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
