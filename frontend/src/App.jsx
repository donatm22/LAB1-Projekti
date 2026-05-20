import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { authApi, tokenStorage } from "./services/api";
import { preloadComponents } from "./utils/lazyLoadingUtils";
import LoadingFallback from "./components/LoadingFallback";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load all page components for code splitting with webpack chunk names for better caching
const Home = lazy(() =>
  import(/* webpackChunkName: "page-home" */ "./pages/Home")
);
const Login = lazy(() =>
  import(/* webpackChunkName: "page-login" */ "./pages/Login")
);
const Signup = lazy(() =>
  import(/* webpackChunkName: "page-signup" */ "./pages/Signup")
);
const AboutUs = lazy(() =>
  import(/* webpackChunkName: "page-about" */ "./pages/About")
);
const Socials = lazy(() =>
  import(/* webpackChunkName: "page-socials" */ "./pages/Socials")
);
const EventsPage = lazy(() =>
  import(/* webpackChunkName: "page-events" */ "./pages/Eventet")
);
const TicketPurchase = lazy(() =>
  import(/* webpackChunkName: "page-tickets" */ "./pages/TicketPurchase")
);
const AdminDashboard = lazy(() =>
  import(/* webpackChunkName: "page-admin" */ "./pages/AdminDashboard")
);
const Account = lazy(() =>
  import(/* webpackChunkName: "page-account" */ "./pages/Account")
);
const Chatbot = lazy(() =>
  import(/* webpackChunkName: "component-chatbot" */ "./components/Chatbot")
);

function App() {
  useEffect(() => {
    // Validate and refresh auth token
    if (!tokenStorage.getToken()) {
      authApi.refresh().catch(() => {});
    }

    // Preload frequently visited pages after initial render for faster navigation
    const preloadCommonPages = () => {
      preloadComponents([
        {
          importFunc: () =>
            import(/* webpackChunkName: "page-events" */ "./pages/Eventet"),
          cacheKey: "events",
        },
        {
          importFunc: () =>
            import(/* webpackChunkName: "page-login" */ "./pages/Login"),
          cacheKey: "login",
        },
      ]);
    };

    // Schedule preloading for idle time to not block initial render
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(preloadCommonPages, { timeout: 2000 });
    } else {
      setTimeout(preloadCommonPages, 1500);
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
