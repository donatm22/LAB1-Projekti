import axios from "axios";
import { apiUrl } from "../config/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const buildHeaders = (token, hasBody = false) => {
  const headers = {};

  if (hasBody) {
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
  } = options;

  const response = await axios.request({
    url: apiUrl(path),
    method,
    headers: {
      ...buildHeaders(token, body !== undefined),
      ...headers,
    },
    data: body,
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    const data = response.data;
    const error = new Error(
      data?.message || data?.error || "Request failed"
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return response.data;
};

export const tokenStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event("authChanged"));
  },
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("authChanged"));
  },
  getUser() {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("authChanged"));
  },
  clear() {
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
  getAll(token = tokenStorage.getToken()) {
    return request("/users", { token });
  },
  getById(id, token = tokenStorage.getToken()) {
    return request(`/users/${id}`, { token });
  },
  create(userData) {
    return request("/users/create", {
      method: "POST",
      body: userData,
    });
  },
  update(id, userData, token = tokenStorage.getToken()) {
    return request(`/users/update/${id}`, {
      method: "PUT",
      body: userData,
      token,
    });
  },
  delete(id, token = tokenStorage.getToken()) {
    return request(`/users/deleteUser/${id}`, {
      method: "DELETE",
      token,
    });
  },
};

export const eventsApi = {
  getAll(token = tokenStorage.getToken()) {
    return request("/event", { token });
  },
  getById(id) {
    return request(`/event/${id}`);
  },
  create(eventData, token = tokenStorage.getToken()) {
    return request("/event/POST", {
      method: "POST",
      body: eventData,
      token,
    });
  },
  update(id, eventData, token = tokenStorage.getToken()) {
    return request(`/event/PUT/${id}`, {
      method: "PUT",
      body: eventData,
      token,
    });
  },
  delete(id, token = tokenStorage.getToken()) {
    return request(`/event/DELETE/${id}`, {
      method: "DELETE",
      token,
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
    return request("/speaker", {
      method: "POST",
      body: speakerData,
      token,
    });
  },
  update(id, speakerData, token = tokenStorage.getToken()) {
    return request(`/speaker/${id}`, {
      method: "PUT",
      body: speakerData,
      token,
    });
  },
  delete(id, token = tokenStorage.getToken()) {
    return request(`/speaker/${id}`, {
      method: "DELETE",
      token,
    });
  },
};

export const ticketsApi = {
  getAll(token = tokenStorage.getToken()) {
    return request("/ticket", { token });
  },
  getById(id) {
    return request(`/ticket/${id}`);
  },
  create(ticketData, token = tokenStorage.getToken()) {
    return request("/ticket", {
      method: "POST",
      body: ticketData,
      token,
    });
  },
  update(id, ticketData, token = tokenStorage.getToken()) {
    return request(`/ticket/${id}`, {
      method: "PUT",
      body: ticketData,
      token,
    });
  },
  delete(id, token = tokenStorage.getToken()) {
    return request(`/ticket/${id}`, {
      method: "DELETE",
      token,
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
    return request("/eventCategories", {
      method: "POST",
      body: categoryData,
      token,
    });
  },
  update(id, categoryData, token = tokenStorage.getToken()) {
    return request(`/eventCategories/${id}`, {
      method: "PUT",
      body: categoryData,
      token,
    });
  },
  delete(id, token = tokenStorage.getToken()) {
    return request(`/eventCategories/${id}`, {
      method: "DELETE",
      token,
    });
  },
};

export const organizersApi = {
  getAll(token = tokenStorage.getToken()) {
    return request("/organizers", { token });
  },
  getById(id) {
    return request(`/organizers/${id}`);
  },
  create(organizerData, token = tokenStorage.getToken()) {
    return request("/organizers", {
      method: "POST",
      body: organizerData,
      token,
    });
  },
  update(id, organizerData, token = tokenStorage.getToken()) {
    return request(`/organizers/${id}`, {
      method: "PUT",
      body: organizerData,
      token,
    });
  },
  delete(id, token = tokenStorage.getToken()) {
    return request(`/organizers/${id}`, {
      method: "DELETE",
      token,
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
        organizersApi.getAll(),
      ]);

    const users = usersResult.status === "fulfilled" ? usersResult.value : [];
    const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];
    const speakers = speakersResult.status === "fulfilled" ? speakersResult.value : [];
    const tickets = ticketsResult.status === "fulfilled" ? ticketsResult.value : [];
    const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
    const organizers = organizersResult.status === "fulfilled" ? organizersResult.value : [];

    return {
      users: Array.isArray(users) ? users.length : 0,
      events: Array.isArray(events) ? events.length : 0,
      speakers: Array.isArray(speakers) ? speakers.length : 0,
      tickets: Array.isArray(tickets) ? tickets.length : 0,
      categories: Array.isArray(categories) ? categories.length : 0,
      organizers: Array.isArray(organizers) ? organizers.length : 0,
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

export { request };
