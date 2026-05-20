/**
 * Lazy loading utilities for React components
 * Helps with code splitting and dynamic imports
 */

import { lazy, Suspense } from "react";

/**
 * Create a lazy-loaded component with a fallback UI
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} FallbackComponent - Component to show while loading
 * @returns {React.Component} - Wrapped component with Suspense
 */
export const createLazyComponent = (importFunc, FallbackComponent) => {
  const LazyComponent = lazy(importFunc);

  return (props) => (
    <Suspense fallback={<FallbackComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Create a lazy-loaded component with minimal fallback
 * @param {Function} importFunc - Dynamic import function
 * @returns {React.Component} - Lazy component with null fallback
 */
export const createMinimalLazyComponent = (importFunc) => {
  return lazy(importFunc);
};

/**
 * Preload a component before it's needed
 * Useful for improving perceived performance on navigation
 * @param {Function} importFunc - Dynamic import function
 */
export const preloadComponent = (importFunc) => {
  importFunc();
};

/**
 * Route-based code splitting helper
 * Returns lazy-loaded pages with automatic suspense handling
 */
export const lazyPages = {
  Home: () => import("../pages/Home"),
  Login: () => import("../pages/Login"),
  Signup: () => import("../pages/Signup"),
  About: () => import("../pages/About"),
  Socials: () => import("../pages/Socials"),
  Events: () => import("../pages/Eventet"),
  TicketPurchase: () => import("../pages/TicketPurchase"),
  Account: () => import("../pages/Account"),
  AdminDashboard: () => import("../pages/AdminDashboard"),
};

/**
 * Heavy components that benefit from lazy loading
 */
export const lazyComponents = {
  Chatbot: () => import("./Chatbot"),
  Navbar: () => import("./Navbar"),
  Footer: () => import("./Footer"),
  Team: () => import("./Team"),
};

/**
 * Check if the browser supports dynamic imports
 * @returns {boolean} - true if dynamic imports are supported
 */
export const supportsDynamicImport = () => {
  return typeof import !== "undefined";
};

/**
 * Monitor lazy loading performance
 * @param {string} componentName - Name of the component being loaded
 * @param {Function} importFunc - The import function
 * @returns {Promise} - Resolves with the module
 */
export const monitorLazyLoad = async (componentName, importFunc) => {
  const startTime = performance.now();
  try {
    const module = await importFunc();
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    console.log(`[Lazy Load] ${componentName}: ${loadTime.toFixed(2)}ms`);
    return module;
  } catch (error) {
    console.error(`[Lazy Load Error] ${componentName}:`, error);
    throw error;
  }
};
