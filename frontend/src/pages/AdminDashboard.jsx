import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";
import {
  dashboardApi,
  eventCategoriesApi,
  eventsApi,
  speakersApi,
  ticketsApi,
  tokenStorage,
  usersApi,
} from "../services/api";

const RESOURCE_CONFIG = {
  events: {
    label: "Events",
    description: "Create, update, and remove platform events.",
    empty: "No events found.",
    singular: "event",
  },
  speakers: {
    label: "Speakers",
    description: "Manage speaker bios and names.",
    empty: "No speakers found.",
    singular: "speaker",
  },
  tickets: {
    label: "Tickets",
    description: "Configure prices, quantities, and event mapping.",
    empty: "No tickets found.",
    singular: "ticket",
  },
  users: {
    label: "Users",
    description: "Manage user accounts and roles.",
    empty: "No users found.",
    singular: "user",
  },
  categories: {
    label: "Categories",
    description: "Control event category metadata.",
    empty: "No categories found.",
    singular: "category",
  },
};

const EMPTY_FORMS = {
  events: {
    titulli: "",
    pershkrimi: "",
    data_fillimit: "",
    data_perfundimit: "",
    lokacioni: "",
    kapaciteti: "",
    statusi: "",
    category_id: "",
    imazhi: "",
  },
  speakers: {
    emri: "",
    event_ids: "",
  },
  tickets: {
    event_id: "",
    tipi: "",
    cmimi: "",
    sasia: "",
  },
  users: {
    emri: "",
    email: "",
    password: "",
    roli: "user",
  },
  categories: {
    emri: "",
  },
};

const FIELD_CONFIG = {
  events: [
    { name: "titulli", label: "Title", type: "text", required: true },
    { name: "pershkrimi", label: "Description", type: "textarea", required: true },
    { name: "data_fillimit", label: "Start date", type: "datetime-local", required: true },
    { name: "data_perfundimit", label: "End date", type: "datetime-local", required: true },
    { name: "lokacioni", label: "Location", type: "text", required: true },
    { name: "kapaciteti", label: "Capacity", type: "number", required: true },
    { name: "statusi", label: "Status", type: "text", required: true, placeholder: "active" },
    { name: "category_id", label: "Category", type: "select", required: true },
    {
      name: "imazhi",
      label: "Photos",
      type: "textarea",
      required: false,
      placeholder: "Add up to 10 image URLs, one per line",
    },
  ],
  speakers: [
    { name: "emri", label: "Name", type: "text", required: true },
    {
      name: "event_ids",
      label: "Connected events",
      type: "textarea",
      required: true,
      placeholder: "Paste one event ID per line",
    },
  ],
  tickets: [
    { name: "event_id", label: "Event", type: "select", required: true },
    { name: "tipi", label: "Type", type: "text", required: true, placeholder: "VIP" },
    { name: "cmimi", label: "Price", type: "number", required: true, step: "0.01" },
    { name: "sasia", label: "Quantity", type: "number", required: true },
  ],
  users: [
    { name: "emri", label: "Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: false },
    { name: "roli", label: "Role", type: "select", required: true },
  ],
  categories: [
    { name: "emri", label: "Name", type: "text", required: true },
  ],
};

const TABLE_COLUMNS = {
  events: ["id", "titulli", "lokacioni", "statusi", "kapaciteti", "displayOrganizer", "category_id"],
  speakers: ["id", "emri"],
  tickets: ["id", "event_id", "tipi", "cmimi", "sasia"],
  users: ["id", "emri", "email", "roli"],
  categories: ["id", "emri"],
};

const apiMap = {
  events: eventsApi,
  speakers: speakersApi,
  tickets: ticketsApi,
  users: usersApi,
  categories: eventCategoriesApi,
};

const RESPONSE_ITEM_KEYS = {
  events: "event",
  speakers: "speaker",
  tickets: "ticket",
  users: "user",
  categories: "eventCategories",
};

const formatDateTimeInput = (value) => {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
};

const LETTERS_ONLY_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-.]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateResourceForm = (resource, values, isEditing) => {
  if (resource === "events") {
    if (!/^\d+$/.test(String(values.kapaciteti).trim()) || Number(values.kapaciteti) <= 0) {
      return "Capacity duhet te jete numer pozitiv.";
    }
    if (Number.isNaN(Date.parse(values.data_fillimit)) || Number.isNaN(Date.parse(values.data_perfundimit))) {
      return "Start date dhe end date duhet te jene data valide.";
    }

    const startDate = new Date(values.data_fillimit);
    const endDate = new Date(values.data_perfundimit);
    const now = new Date();

    if (startDate < now) return "Start date nuk mund te jete ne te kaluaren.";
    if (endDate < now) return "End date nuk mund te jete ne te kaluaren.";
    if (endDate < startDate) return "End date duhet te jete pas ose e barabarte me start date.";
  }

  if (resource === "tickets") {
    if (!/^\d+(\.\d+)?$/.test(String(values.cmimi).trim()) || Number(values.cmimi) <= 0) {
      return "Price duhet te jete numer pozitiv.";
    }
    if (!/^\d+$/.test(String(values.sasia).trim()) || Number(values.sasia) <= 0) {
      return "Quantity duhet te jete numer pozitiv.";
    }
  }

  if (resource === "speakers" && !LETTERS_ONLY_REGEX.test(String(values.emri).trim())) {
    return "Speaker name mund te permbaje vetem shkronja.";
  }

  if (resource === "categories" && !LETTERS_ONLY_REGEX.test(String(values.emri).trim())) {
    return "Category name mund te permbaje vetem shkronja.";
  }

  if (resource === "users") {
    if (!LETTERS_ONLY_REGEX.test(String(values.emri).trim())) return "User name mund te permbaje vetem shkronja.";
    if (!EMAIL_REGEX.test(String(values.email).trim())) return "Email nuk eshte valid.";
    if (!isEditing && String(values.password || "").length < 6) return "Password duhet te kete te pakten 6 karaktere.";
    if (isEditing && values.password && String(values.password).length < 6) return "Password duhet te kete te pakten 6 karaktere.";
  }

  return "";
};

const normalizePayload = (resource, values, isEditing) => {
  const payload = { ...values };

  if (resource === "events") {
    payload.kapaciteti = Number(payload.kapaciteti);
  }

  if (resource === "tickets") {
    payload.cmimi = Number(payload.cmimi);
    payload.sasia = Number(payload.sasia);
  }

  if (resource === "speakers") {
    payload.event_ids = String(payload.event_ids || "")
      .split(/\r?\n|,/)
      .map((value) => value.trim())
      .filter(Boolean);
  }

  if (resource === "users" && isEditing && !payload.password) {
    delete payload.password;
  }

  return payload;
};

const getFormValuesFromItem = (resource, item) => {
  const defaults = EMPTY_FORMS[resource];
  if (!item) return defaults;

  return {
    ...defaults,
    ...item,
    data_fillimit: formatDateTimeInput(item.data_fillimit),
    data_perfundimit: formatDateTimeInput(item.data_perfundimit),
    category_id: item.category_id ?? "",
    event_id: item.event_id ?? "",
    imazhi: (() => {
      if (!item.imazhi) return "";
      try {
        const parsed = JSON.parse(item.imazhi);
        return Array.isArray(parsed) ? parsed.join("\n") : item.imazhi;
      } catch {
        return item.imazhi;
      }
    })(),
    event_ids: Array.isArray(item.event_ids) ? item.event_ids.join("\n") : "",
    password: "",
  };
};

const prettifyKey = (value) =>
  value
    .replaceAll("_", " ")
    .replace("displayOrganizer", "Organizer")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getSavedItem = (resource, response) => {
  if (!response || typeof response !== "object") return null;
  const itemKey = RESPONSE_ITEM_KEYS[resource];
  return response[itemKey] || null;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeResource, setActiveResource] = useState("events");
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    speakers: 0,
    tickets: 0,
    categories: 0,
  });
  const [data, setData] = useState({
    events: [],
    speakers: [],
    tickets: [],
    users: [],
    categories: [],
  });
  const [forms, setForms] = useState(EMPTY_FORMS);
  const [editingId, setEditingId] = useState({
    events: null,
    speakers: null,
    tickets: null,
    users: null,
    categories: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [eventImageFiles, setEventImageFiles] = useState([]);
  const [searchQueries, setSearchQueries] = useState({
    events: "",
    speakers: "",
    tickets: "",
    users: "",
    categories: "",
  });
  const [sortState, setSortState] = useState({
    events: { column: null, dir: "asc" },
    speakers: { column: null, dir: "asc" },
    tickets: { column: null, dir: "asc" },
    users: { column: null, dir: "asc" },
    categories: { column: null, dir: "asc" },
  });
  const [filters, setFilters] = useState({
  events: { category_id: "", statusi: "", upcoming: "" },
  speakers: {},
  tickets: { tipi: "", event_id: "", availability: "", minPrice: "", maxPrice: "" },
  users: { roli: "" },
  categories: {},
});

  const token = tokenStorage.getToken();
  const currentUser = tokenStorage.getUser();
  const isOrganizer = currentUser?.roli === "organizer";

  const visibleResourceEntries = useMemo(() => {
    return Object.entries(RESOURCE_CONFIG).filter(([key]) => {
      if (isOrganizer && key === "users") return false;
      return true;
    });
  }, [isOrganizer]);

  useEffect(() => {
    const isAuthorized = currentUser?.roli === "admin" || currentUser?.roli === "organizer";
    if (!isAuthorized) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const selectOptions = useMemo(
    () => ({
      category_id: data.categories.map((category) => ({
        value: category.id,
        label: category.emri,
      })),
      event_id: data.events.map((event) => ({
        value: event.id,
        label: event.titulli,
      })),
      roli: [
        { value: "user", label: "user" },
        { value: "admin", label: "admin" },
        { value: "organizer", label: "organizer" },
      ],
    }),
    [data]
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsData, events, speakers, tickets, categories, usersResult] =
        await Promise.all([
          dashboardApi.getStats(token),
          isOrganizer ? eventsApi.getManaged(token) : eventsApi.getAll(token),
          speakersApi.getAll(),
          ticketsApi.getAll(),
          eventCategoriesApi.getAll(),
          token ? usersApi.getAll(token).catch(() => null) : Promise.resolve(null),
        ]);

      const fetchedEvents = Array.isArray(events) ? events : [];
      const fetchedTickets = Array.isArray(tickets) ? tickets : [];

      const filteredTickets = isOrganizer
        ? fetchedTickets.filter((ticket) => fetchedEvents.some((e) => e.id === ticket.event_id))
        : fetchedTickets;

      setStats({
        users: isOrganizer ? 0 : Array.isArray(usersResult) ? usersResult.length : statsData.users,
        events: fetchedEvents.length,
        speakers: Array.isArray(speakers) ? speakers.length : 0,
        tickets: filteredTickets.length,
        categories: Array.isArray(categories) ? categories.length : 0,
      });

      setData({
        events: fetchedEvents,
        speakers: Array.isArray(speakers) ? speakers : [],
        tickets: filteredTickets, // Out-of-band records are blocked from render tables
        categories: Array.isArray(categories) ? categories : [],
        users: Array.isArray(usersResult) ? usersResult : [],
      });
    } catch (loadError) {
      setError(loadError.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [isOrganizer, token]);

  useEffect(() => {
    if (isOrganizer && activeResource === "users") {
      setActiveResource("events");
    }
  }, [activeResource, isOrganizer]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleFormChange = (resource, field, value) => {
    if (field === "event_files") {
      setEventImageFiles(Array.from(value || []));
      return;
    }

    setForms((current) => ({
      ...current,
      [resource]: {
        ...current[resource],
        [field]: value,
      },
    }));
  };

  const resetResourceForm = (resource) => {
    setForms((current) => ({
      ...current,
      [resource]: EMPTY_FORMS[resource],
    }));
    setEditingId((current) => ({
      ...current,
      [resource]: null,
    }));
    setEventImageFiles([]);
  };

  const handleEdit = (resource, item) => {
    setActiveResource(resource);
    setError("");
    setSuccess("");
    setForms((current) => ({
      ...current,
      [resource]: getFormValuesFromItem(resource, item),
    }));
    setEditingId((current) => ({
      ...current,
      [resource]: item.id,
    }));
  };

  const handleDelete = async (resource, id) => {
    const label = RESOURCE_CONFIG[resource].singular;
    const confirmed = window.confirm(`Delete this ${label}?`);
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await apiMap[resource].delete(id, token);
      await loadDashboard();
      if (editingId[resource] === id) {
        resetResourceForm(resource);
      }
      setSuccess(`${RESOURCE_CONFIG[resource].label} updated successfully.`);
    } catch (deleteError) {
      setError(deleteError.message || `Failed to delete ${label}.`);
    }
  };

  const handleSubmit = async (resource, event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const isEditing = Boolean(editingId[resource]);
      const formValues = forms[resource];
      const activeFields = FIELD_CONFIG[resource] || [];
      const emptyFields = [];
      
      for (const field of activeFields) {
        if (field.required) {
          const value = formValues[field.name];
          if (
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim() === "")
          ) {
            emptyFields.push(field.label);
          }
        }
      }
      
      if (emptyFields.length > 0) {
        setSaving(false);
        setError(`Please fill in all required fields: ${emptyFields.join(", ")}`);
        return;
      }

      const validationError = validateResourceForm(resource, formValues, isEditing);
      if (validationError) {
        setSaving(false);
        setError(validationError);
        return;
      }
      
      const payload = normalizePayload(resource, forms[resource], isEditing);
      let bodyToSend = payload;

      if (resource === "events" && eventImageFiles.length > 0) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v);
        });
        eventImageFiles.forEach((file) => {
          fd.append("imazhi", file);
        });
        bodyToSend = fd;
      }

      let savedResponse;
      if (isEditing) {
        savedResponse = await apiMap[resource].update(editingId[resource], bodyToSend, token);
      } else {
        savedResponse = await apiMap[resource].create(bodyToSend, token);
      }

      const savedItem = getSavedItem(resource, savedResponse);

      if (savedItem?.id) {
        setData((current) => {
          const currentItems = current[resource];
          const itemExists = currentItems.some((item) => item.id === savedItem.id);
          const nextItems = itemExists
            ? currentItems.map((item) => (item.id === savedItem.id ? savedItem : item))
            : [...currentItems, savedItem];

          return { ...current, [resource]: nextItems };
        });

        if (!isEditing) {
          setStats((current) => ({
            ...current,
            [resource]: current[resource] + 1,
          }));
        }
      }

      resetResourceForm(resource);
      await loadDashboard();
      setSuccess(`${RESOURCE_CONFIG[resource].label} ${isEditing ? "updated" : "created"} successfully.`);
    } catch (submitError) {
      const backendInfo = submitError?.data ? ` (${JSON.stringify(submitError.data)})` : "";
      setError((submitError.message || "Failed to save changes.") + backendInfo);
    } finally {
      setSaving(false);
    }
  };

  const activeItems = data[activeResource];
  const activeFields = FIELD_CONFIG[activeResource];
  const activeColumns = TABLE_COLUMNS[activeResource];
  const isEditingActive = Boolean(editingId[activeResource]);

  const displayedItems = useMemo(() => {
  const items = activeItems || [];
  const query = (searchQueries[activeResource] || "").trim().toLowerCase();
  const activeFilters = filters[activeResource] || {};
  const now = new Date();

  const filtered = items.filter((item) => {
    // Search
    if (query) {
      const matchesSearch = (activeColumns || []).some((col) =>
        String(item[col] ?? "").toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // Filters
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value === "" || value === null || value === undefined) continue;

      if (key === "upcoming") {
        const eventDate = new Date(item.data_fillimit);
        const isUpcoming = !Number.isNaN(eventDate.getTime()) && eventDate >= now;
        if (value === "true" && !isUpcoming) return false;
        if (value === "false" && isUpcoming) return false;
        continue;
      }

      if (key === "availability") {
        const quantity = Number(item.sasia ?? 0);
        if (value === "available" && quantity <= 0) return false;
        if (value === "soldOut" && quantity > 0) return false;
        continue;
      }

      if (key === "minPrice") {
        if (Number(item.cmimi ?? 0) < Number(value)) return false;
        continue;
      }

      if (key === "maxPrice") {
        if (Number(item.cmimi ?? 0) > Number(value)) return false;
        continue;
      }

      if (String(item[key]) !== String(value)) return false;
    }

    return true;
  });

  const sort = sortState[activeResource] || {};
  if (!sort || !sort.column) return filtered;

  return [...filtered].sort((a, b) => {
    const aStr = String(a[sort.column] ?? "").trim();
    const bStr = String(b[sort.column] ?? "").trim();
    const cmp = aStr.localeCompare(bStr);
    return sort.dir === "desc" ? -cmp : cmp;
  });
}, [activeItems, activeColumns, searchQueries, activeResource, sortState, filters]);

  const handleHeaderSort = (column) => {
    setSortState((cur) => {
      const curState = cur[activeResource] || { column: null, dir: "asc" };
      if (curState.column === column) {
        return {
          ...cur,
          [activeResource]: { column, dir: curState.dir === "asc" ? "desc" : "asc" },
        };
      }
      return { ...cur, [activeResource]: { column, dir: "asc" } };
    });
  };

  const updateResourceFilter = (resource, key, value) => {
    setFilters((current) => ({
      ...current,
      [resource]: {
        ...current[resource],
        [key]: value,
      },
    }));
  };

  const clearResourceFilters = (resource) => {
    setFilters((current) => ({
      ...current,
      [resource]: Object.fromEntries(
        Object.keys(current[resource] || {}).map((key) => [key, ""])
      ),
    }));
    setSearchQueries((current) => ({ ...current, [resource]: "" }));
  };

  const eventStatusOptions = useMemo(
    () => [...new Set(data.events.map((event) => event.statusi).filter(Boolean))],
    [data.events]
  );

  return (
    <div className="admin-page">
      <Navbar />

      <div className="admin-dashboard">
        <section className="dashboard-hero">
          <div>
            <span className="dashboard-eyebrow">Control Center</span>
            <h1>Admin dashboard</h1>
            <p>A single place to manage platform resources safely.</p>
          </div>
          <div className="dashboard-session">
            <span className="session-label">Signed in as</span>
            <strong>{currentUser?.emri || "Guest"}</strong>
            <span className="session-role">{currentUser?.roli || "No active role"}</span>
          </div>
        </section>

        <section className="stats-grid">
          {!isOrganizer ? (
            <div className="stat-card">
              <span>Users</span>
              <strong>{loading ? "..." : stats.users}</strong>
            </div>
          ) : null}
          <div className="stat-card">
            <span>Events</span>
            <strong>{loading ? "..." : stats.events}</strong>
          </div>
          <div className="stat-card">
            <span>Speakers</span>
            <strong>{loading ? "..." : stats.speakers}</strong>
          </div>
          <div className="stat-card">
            <span>Tickets</span>
            <strong>{loading ? "..." : stats.tickets}</strong>
          </div>
          <div className="stat-card">
            <span>Categories</span>
            <strong>{loading ? "..." : stats.categories}</strong>
          </div>
        </section>

        {error ? <div className="dashboard-message error">{error}</div> : null}
        {success ? <div className="dashboard-message success">{success}</div> : null}

        <section className="dashboard-layout">
          <aside className="dashboard-sidebar">
            {visibleResourceEntries.map(([key, config]) => (
              <button
                key={key}
                type="button"
                className={`sidebar-tab${activeResource === key ? " active" : ""}`}
                onClick={() => {
                  setActiveResource(key);
                  setError("");
                  setSuccess("");
                }}
              >
                <span>{config.label}</span>
                <small>{data[key]?.length || 0}</small>
              </button>
            ))}
          </aside>

          <div className="dashboard-panels">
            <section className="dashboard-panel form-panel">
              <div className="panel-heading">
                <div>
                  <h2>{isEditingActive ? `Edit ${RESOURCE_CONFIG[activeResource].singular}` : `Create ${RESOURCE_CONFIG[activeResource].singular}`}</h2>
                  <p>{RESOURCE_CONFIG[activeResource].description}</p>
                </div>
                {isEditingActive ? (
                  <button type="button" className="ghost-btn" onClick={() => resetResourceForm(activeResource)}>
                    Cancel edit
                  </button>
                ) : null}
              </div>

              <form className="resource-form" onSubmit={(event) => handleSubmit(activeResource, event)}>
                <div className="form-grid">
                  {activeFields.map((field) => {
                    const options = selectOptions[field.name] || [];
                    const value = forms[activeResource][field.name] ?? "";
                    const isPasswordEditField = activeResource === "users" && field.name === "password" && isEditingActive;

                    return (
                      <label key={field.name} className={`form-field${field.type === "textarea" ? " full-width" : ""}`}>
                        <span>{field.label}</span>
                        {field.type === "textarea" ? (
                          <>
                            <textarea
                              value={value}
                              onChange={(event) => handleFormChange(activeResource, field.name, event.target.value)}
                              placeholder={field.placeholder || ""}
                              required={field.required}
                              rows="5"
                            />
                            {activeResource === "events" && field.name === "imazhi" ? (
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(event) => handleFormChange(activeResource, "event_files", event.target.files)}
                              />
                            ) : null}
                          </>
                        ) : field.type === "select" ? (
                          <select
                            value={value}
                            onChange={(event) => handleFormChange(activeResource, field.name, event.target.value)}
                            required={field.required}
                          >
                            <option value="">Select {field.label.toLowerCase()}</option>
                            {options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={value}
                            onChange={(event) => handleFormChange(activeResource, field.name, event.target.value)}
                            placeholder={field.placeholder || ""}
                            required={isPasswordEditField ? false : field.required}
                            step={field.step}
                            min={field.type === "number" ? "0" : undefined}
                            pattern={
                              activeResource === "speakers" && field.name === "emri"
                                ? LETTERS_ONLY_REGEX.source
                                : activeResource === "categories" && field.name === "emri"
                                  ? LETTERS_ONLY_REGEX.source
                                  : activeResource === "users" && field.name === "emri"
                                    ? LETTERS_ONLY_REGEX.source
                                    : undefined
                            }
                          />
                        )}
                        {isPasswordEditField ? (
                          <small>Leave blank to keep current password.</small>
                        ) : activeResource === "events" && field.name === "imazhi" ? (
                          <small>One image URL per line. Maximum 10 photos.</small>
                        ) : activeResource === "speakers" && field.name === "event_ids" ? (
                          <small>At least one event ID is required for every speaker.</small>
                        ) : null}
                      </label>
                    );
                  })}
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-btn" disabled={saving}>
                    {saving ? "Saving..." : isEditingActive ? "Update" : "Create"}
                  </button>
                  <button type="button" className="ghost-btn" onClick={() => resetResourceForm(activeResource)}>
                    Reset
                  </button>
                </div>
              </form>
            </section>

            <section className="dashboard-panel list-panel">
              <div className="panel-heading">
                <div>
                  <h2>{RESOURCE_CONFIG[activeResource].label}</h2>
                  <p>{RESOURCE_CONFIG[activeResource].description}</p>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <input
                    aria-label={`Search ${RESOURCE_CONFIG[activeResource].label}`}
                    className="resource-search"
                    placeholder={`Search ${RESOURCE_CONFIG[activeResource].label}...`}
                    value={searchQueries[activeResource] || ""}
                    onChange={(e) => setSearchQueries((cur) => ({ ...cur, [activeResource]: e.target.value }))}
                  />
                  <button type="button" className="ghost-btn" onClick={() => clearResourceFilters(activeResource)}>
                    Clear filters
                  </button>
                  <button type="button" className="ghost-btn" onClick={loadDashboard}>
                    Refresh
                  </button>
                </div>
              </div>


              {activeResource === "events" && (
                <div className="filter-bar">
                  <select
                    value={filters.events.category_id}
                    onChange={(e) => updateResourceFilter("events", "category_id", e.target.value)}
                  >
                    <option value="">All categories</option>
                    {data.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.emri}</option>
                    ))}
                  </select>
                  <select
                    value={filters.events.statusi}
                    onChange={(e) => updateResourceFilter("events", "statusi", e.target.value)}
                  >
                    <option value="">All statuses</option>
                    {eventStatusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    value={filters.events.upcoming}
                    onChange={(e) => updateResourceFilter("events", "upcoming", e.target.value)}
                  >
                    <option value="">Any date</option>
                    <option value="true">Upcoming</option>
                    <option value="false">Past</option>
                  </select>
                </div>
              )}

              {activeResource === "tickets" && (
                <div className="filter-bar">
                  <select
                    value={filters.tickets.event_id}
                    onChange={(e) => updateResourceFilter("tickets", "event_id", e.target.value)}
                  >
                    <option value="">All events</option>
                    {data.events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.titulli}</option>
                    ))}
                  </select>
                  <select
                    value={filters.tickets.tipi}
                    onChange={(e) => updateResourceFilter("tickets", "tipi", e.target.value)}
                  >
                    <option value="">All types</option>
                    {[...new Set(data.tickets.map((t) => t.tipi).filter(Boolean))].map((tipi) => (
                      <option key={tipi} value={tipi}>{tipi}</option>
                    ))}
                  </select>
                  <select
                    value={filters.tickets.availability}
                    onChange={(e) => updateResourceFilter("tickets", "availability", e.target.value)}
                  >
                    <option value="">Any availability</option>
                    <option value="available">Available</option>
                    <option value="soldOut">Sold out</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min price"
                    value={filters.tickets.minPrice}
                    onChange={(e) => updateResourceFilter("tickets", "minPrice", e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Max price"
                    value={filters.tickets.maxPrice}
                    onChange={(e) => updateResourceFilter("tickets", "maxPrice", e.target.value)}
                  />
                </div>
              )}

              {activeResource === "users" && (
                <div className="filter-bar">
                  <select
                    value={filters.users.roli}
                    onChange={(e) => updateResourceFilter("users", "roli", e.target.value)}
                  >
                    <option value="">All roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="organizer">Organizer</option>
                  </select>
                </div>
              )}

              {loading ? (
                <div className="empty-state">Loading data...</div>
              ) : displayedItems.length === 0 ? (
                <div className="empty-state">{RESOURCE_CONFIG[activeResource].empty}</div>
              ) : (
                <div className="table-wrap">
                  <table className="resource-table">
                    <thead>
                      <tr>
                        {activeColumns.map((column) => (
                          <th key={column} className="clickable-header" onClick={() => handleHeaderSort(column)}>
                            {prettifyKey(column)}
                            {sortState[activeResource]?.column === column ? (
                              sortState[activeResource].dir === "asc" ? " \u25B2" : " \u25BC"
                            ) : null}
                          </th>
                        ))}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedItems.map((item) => (
                        <tr key={item.id}>
                          {activeColumns.map((column) => (
                            <td key={`${item.id}-${column}`}>
                              <span className="cell-content">
                                {item[column] === null || item[column] === undefined || item[column] === ""
                                  ? "-"
                                  : String(item[column])}
                              </span>
                            </td>
                          ))}
                          <td>
                            <div className="table-actions">
                              <button type="button" className="table-btn" onClick={() => handleEdit(activeResource, item)}>
                                Edit
                              </button>
                              <button type="button" className="table-btn danger" onClick={() => handleDelete(activeResource, item.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
