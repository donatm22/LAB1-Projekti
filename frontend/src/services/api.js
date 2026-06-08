import axios from "axios";
import { apiUrl } from "../config/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";
let refreshSessionPromise = null;
let memoryToken = null;
let memoryUser = null;

const requestCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; 
const REQUEST_TIMEOUT = 10000; 

const generateCacheKey = (path, options) => {
  const method = options.method || "GET";
  const token = options.token || "";
  return `${method}:${path}:${token}`;
};

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

const normalizeFiltersAndToken = (filters, token) => {
  if (typeof filters === "string") {
    return { filters: {}, token: filters };
  }

  return { filters: filters || {}, token };
};

const getCachedResponse = (cacheKey) => {
  const cached = requestCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  // Remove expired cache
  if (cached) {
    requestCache.delete(cacheKey);
  }
  return null;
};

const setCachedResponse = (cacheKey, data, ttl = CACHE_TTL) => {
  requestCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttl,
  });
};

export const clearCache = (pattern) => {
  if (!pattern) {
    requestCache.clear();
    return;
  }
  for (const key of requestCache.keys()) {
    if (key.includes(pattern)) {
      requestCache.delete(key);
    }
  }
};

const buildHeaders = (token, hasBody = false, isFormData = false) => {
  const headers = {};

  if (hasBody && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const request = async (path, options = {}) => {
  const {
    method = "GET",
    body,
    token,
    headers = {},
    retryOn401 = true,
    skipAuthRefresh = false,
    useCache = true,
    cacheTtl = CACHE_TTL,
  } = options;

  const cacheKey = generateCacheKey(path, { ...options, method });
  if (method === "GET" && useCache) {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  try {
    const response = await axios.request({
      url: apiUrl(path),
      method,
      withCredentials: true,
      headers: {
          ...buildHeaders(token, body !== undefined, isFormData),
        ...headers,
      },
      data: body,
      validateStatus: () => true,
      timeout: REQUEST_TIMEOUT,
    });

    if (response.status < 200 || response.status >= 300) {
      const data = response.data;

      if (
        response.status === 401 &&
        retryOn401 &&
        !skipAuthRefresh &&
        !path.startsWith("/auth/")
      ) {
        try {
          await refreshAccessToken();
          return request(path, {
            ...options,
            retryOn401: false,
            token: tokenStorage.getToken(),
          });
        } catch (refreshError) {
          tokenStorage.clear();
          throw refreshError;
        }
      }

      const error = new Error(
        data?.message || data?.error || "Request failed"
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    // Cache successful GET responses
    if (method === "GET" && useCache) {
      setCachedResponse(cacheKey, response.data, cacheTtl);
    }

    return response.data;
  } catch (error) {
    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      throw new Error(`Request timeout after ${REQUEST_TIMEOUT}ms`);
    }
    throw error;
  }
};

const refreshAccessToken = async () => {
  if (!refreshSessionPromise) {
    refreshSessionPromise = request("/auth/refresh", {
      method: "POST",
      retryOn401: false,
      skipAuthRefresh: true,
      useCache: false,
    })
      .then((data) => {
        if (data?.token) {
          tokenStorage.setToken(data.token);
        }

        if (data?.user) {
          tokenStorage.setUser(data.user);
        }

        return data;
      })
      .catch((error) => {
        tokenStorage.clear();
        throw error;
      })
      .finally(() => {
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
};

export const tokenStorage = {
  getToken() {
    if (!memoryToken) {
      memoryToken = localStorage.getItem(TOKEN_KEY);
    }
    return memoryToken;
  },
  setToken(token) {
    memoryToken = token;
    localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event("authChanged"));
  },
  removeToken() {
    memoryToken = null;
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("authChanged"));
  },
  getUser() {
    if (!memoryUser) {
      try {
        memoryUser = JSON.parse(localStorage.getItem(USER_KEY));
      } catch {
        memoryUser = null;
      }
    }
    return memoryUser;
  },
  setUser(user) {
    memoryUser = user;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("authChanged"));
  },
  clear() {
    memoryToken = null;
    memoryUser = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("authChanged"));
  },
};

export const authApi = {
  login(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },
  refresh() {
    return request("/auth/refresh", {
      method: "POST",
      retryOn401: false,
      skipAuthRefresh: true,
    });
  },
  me(token = tokenStorage.getToken()) {
    return request("/auth/me", { token });
  },
  logout(token = tokenStorage.getToken()) {
    return request("/auth/logout", {
      method: "POST",
      token,
    });
  },
};

export const usersApi = {
  getAll(filters = {}, token = tokenStorage.getToken()) {
    const normalized = normalizeFiltersAndToken(filters, token);
    return request(`/users${buildQueryString(normalized.filters)}`, { token: normalized.token });
  },
  getById(id, token = tokenStorage.getToken()) {
    return request(`/users/${id}`, { token });
  },
  create(userData) {
    clearCache("/users");
    return request("/users/create", {
      method: "POST",
      body: userData,
      useCache: false,
    });
  },
  update(id, userData, token = tokenStorage.getToken()) {
    clearCache("/users");
    return request(`/users/update/${id}`, {
      method: "PUT",
      body: userData,
      token,
      useCache: false,
    });
  },
  delete(id, token = tokenStorage.getToken()) {
    clearCache("/users"); // Invalidate users cache
    return request(`/users/deleteUser/${id}`, {
      method: "DELETE",
      token,
      useCache: false,
    });
  },
};

export const eventsApi = {
  getAll(filters = {}, token = tokenStorage.getToken()) {
    const normalized = normalizeFiltersAndToken(filters, token);
    return request(`/event${buildQueryString(normalized.filters)}`, {
      token: normalized.token,
      useCache: false,
    });
  },
  getManaged(filters = {}, token = tokenStorage.getToken()) {
    const normalized = normalizeFiltersAndToken(filters, token);
    return request(`/event/managed${buildQueryString(normalized.filters)}`, {
      token: normalized.token,
      useCache: false,
    });
  },
  getById(id) {
    return request(`/event/${id}`);
  },
  create(eventData, token = tokenStorage.getToken()) {
    clearCache("/event");
    const isFormData = eventData instanceof FormData;
    return request("/event/POST", {
      method: "POST",
      body: eventData,
      token,
      useCache: false,
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
  },
  update(id, eventData, token = tokenStorage.getToken()) {
    clearCache("/event");
    const isFormData = eventData instanceof FormData;
    return request(`/event/PUT/${id}`, {
      method: "PUT",
      body: eventData,
      token,
      useCache: false,
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
  },
  delete(id, token = tokenStorage.getToken()) {
    clearCache("/event");
    return request(`/event/DELETE/${id}`, {
      method: "DELETE",
      token,
      useCache: false,
    });
  },
};

export const speakersApi = {
  getAll(token = tokenStorage.getToken()) {
    return request("/speaker", { token });
  },
  getById(id) {
    return request(`/speaker/${id}`);
  },
  create(speakerData, token = tokenStorage.getToken()) {
    clearCache("/speaker");
    return request("/speaker", {
      method: "POST",
      body: speakerData,
      token,
      useCache: false,
    });
  },
  update(id, speakerData, token = tokenStorage.getToken()) {
    clearCache("/speaker");
    return request(`/speaker/${id}`, {
      method: "PUT",
      body: speakerData,
      token,
      useCache: false,
    });
  },
  delete(id, token = tokenStorage.getToken()) {
    clearCache("/speaker");
    return request(`/speaker/${id}`, {
      method: "DELETE",
      token,
      useCache: false,
    });
  },
};

export const ticketsApi = {
  getAll(filters = {}, token = tokenStorage.getToken()) {
    const normalized = normalizeFiltersAndToken(filters, token);
    return request(`/ticket${buildQueryString(normalized.filters)}`, { token: normalized.token });
  },
  getById(id) {
    return request(`/ticket/${id}`);
  },
  create(ticketData, token = tokenStorage.getToken()) {
    clearCache("/ticket");
    return request("/ticket", {
      method: "POST",
      body: ticketData,
      token,
      useCache: false,
    });
  },
  update(id, ticketData, token = tokenStorage.getToken()) {
    clearCache("/ticket");
    return request(`/ticket/${id}`, {
      method: "PUT",
      body: ticketData,
      token,
      useCache: false,
    });
  },
  delete(id, token = tokenStorage.getToken()) {
    clearCache("/ticket");
    return request(`/ticket/${id}`, {
      method: "DELETE",
      token,
      useCache: false,
    });
  },
};

export const eventCategoriesApi = {
  getAll(token = tokenStorage.getToken()) {
    return request("/eventCategories", { token });
  },
  getById(id) {
    return request(`/eventCategories/${id}`);
  },
  create(categoryData, token = tokenStorage.getToken()) {
    clearCache("/eventCategories");
    return request("/eventCategories", {
      method: "POST",
      body: categoryData,
      token,
      useCache: false,
    });
  },
  update(id, categoryData, token = tokenStorage.getToken()) {
    clearCache("/eventCategories");
    return request(`/eventCategories/${id}`, {
      method: "PUT",
      body: categoryData,
      token,
      useCache: false,
    });
  },
  delete(id, token = tokenStorage.getToken()) {
    clearCache("/eventCategories"); 
    return request(`/eventCategories/${id}`, {
      method: "DELETE",
      token,
      useCache: false,
    });
  },
};

export const dashboardApi = {
  async getStats(token = tokenStorage.getToken()) {
    const [usersResult, eventsResult, speakersResult, ticketsResult, categoriesResult, organizersResult] =
      await Promise.allSettled([
        token ? usersApi.getAll(token) : Promise.resolve([]),
        eventsApi.getAll(),
        speakersApi.getAll(),
        ticketsApi.getAll(),
        eventCategoriesApi.getAll(),
      ]);

    const users = usersResult.status === "fulfilled" ? usersResult.value : [];
    const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];
    const speakers = speakersResult.status === "fulfilled" ? speakersResult.value : [];
    const tickets = ticketsResult.status === "fulfilled" ? ticketsResult.value : [];
    const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

    return {
      users: Array.isArray(users) ? users.length : 0,
      events: Array.isArray(events) ? events.length : 0,
      speakers: Array.isArray(speakers) ? speakers.length : 0,
      tickets: Array.isArray(tickets) ? tickets.length : 0,
      categories: Array.isArray(categories) ? categories.length : 0,
    };
  },
};

export const chatApi = {
  send(messages) {
    return request("/chat", {
      method: "POST",
      body: { messages },
    });
  },
};

export const emailApi = {
  sendTicketPurchase(payload, token = tokenStorage.getToken()) {
    return request("/email/send-ticket-purchase", {
      method: "POST",
      body: payload,
      token,
      useCache: false,
    });
  },
};

export { request };
