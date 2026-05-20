/**
 * Lazy loading utilities for React components
 * Optimized for performance with preloading and selective lazy loading
 */

import React, { lazy, Suspense } from "react";

// Cache for preloaded components
const preloadCache = new Map();

/**
 * Create a lazy-loaded component with a fallback UI
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} FallbackComponent - Component to show while loading
 * @returns {React.Component} - Wrapped component with Suspense
 */
export const createLazyComponent = (importFunc, FallbackComponent) => {
  const LazyComponent = lazy(importFunc);

  return (props) => React.createElement(
    Suspense,
    { fallback: React.createElement(FallbackComponent) },
    React.createElement(LazyComponent, props)
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
 * @param {string} cacheKey - Optional cache key to avoid duplicate preloads
 */
export const preloadComponent = (importFunc, cacheKey) => {
  // Use cache to avoid duplicate preloads
  const key = cacheKey || importFunc.toString();
  
  if (preloadCache.has(key)) {
    return preloadCache.get(key);
  }

  const preloadPromise = importFunc().catch((error) => {
    console.warn("Component preload failed:", error);
  });

  preloadCache.set(key, preloadPromise);
  return preloadPromise;
};

/**
 * Preload multiple components in parallel
 * @param {Array} preloads - Array of { importFunc, cacheKey } objects
 */
export const preloadComponents = async (preloads) => {
  return Promise.all(
    preloads.map((preload) =>
      preloadComponent(preload.importFunc, preload.cacheKey)
    )
  ).catch((error) => {
    console.warn("Batch preload encountered errors:", error);
  });
};

/**
 * Preload on route change
 * @param {string} route - Target route path
 * @param {Object} importMap - Map of routes to import functions
 */
export const preloadOnRoute = (route, importMap) => {
  const importFunc = importMap[route];
  if (importFunc) {
    preloadComponent(importFunc, route);
  }
};

/**
 * Preload on hover/focus for predicted navigation
 * @param {Function} importFunc - Dynamic import function
 * @param {HTMLElement} element - Element to attach listeners
 * @param {string} cacheKey - Cache key
 */
export const preloadOnInteraction = (importFunc, element, cacheKey) => {
  if (!element) return;

  const handlePreload = () => {
    preloadComponent(importFunc, cacheKey);
    // Remove listener after first preload
    element.removeEventListener("mouseenter", handlePreload);
    element.removeEventListener("focus", handlePreload);
  };

  element.addEventListener("mouseenter", handlePreload, { once: true });
  element.addEventListener("focus", handlePreload, { once: true });
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
  EventsPage: () => import("../pages/Eventet"),
  TicketPurchase: () => import("../pages/TicketPurchase"),
  AdminDashboard: () => import("../pages/AdminDashboard"),
  Account: () => import("../pages/Account"),
};

/**
 * Heavy components that benefit from lazy loading
 */
export const lazyComponents = {
  Chatbot: () => import("../components/Chatbot"),
  Navbar: () => import("../components/Navbar"),
  Footer: () => import("../components/Footer"),
  Team: () => import("../components/Team"),
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
