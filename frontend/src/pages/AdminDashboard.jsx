import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";
import {
  dashboardApi,
  eventCategoriesApi,
  eventsApi,
  organizersApi,
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
  organizers: {
    label: "Organizers",
    description: "Maintain organizer details used by events.",
    empty: "No organizers found.",
    singular: "organizer",
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
    organizer_id: "",
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
  organizers: {
    emri_organizates: "",
    pershkrimi: "",
    email: "",
    telefoni: "",
    website: "",
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
    { name: "organizer_id", label: "Organizer", type: "select", required: true },
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
  organizers: [
    { name: "emri_organizates", label: "Organization", type: "text", required: false },
    { name: "pershkrimi", label: "Description", type: "textarea", required: false },
    { name: "email", label: "Email", type: "email", required: false },
    { name: "telefoni", label: "Phone", type: "text", required: false },
    { name: "website", label: "Website", type: "url", required: false },
  ],
};

const TABLE_COLUMNS = {
  events: ["id", "titulli", "lokacioni", "statusi", "kapaciteti", "organizer_id", "category_id"],
  speakers: ["id", "emri"],
  tickets: ["id", "event_id", "tipi", "cmimi", "sasia"],
  users: ["id", "emri", "email", "roli"],
  categories: ["id", "emri"],
  organizers: ["id", "emri_organizates", "email", "telefoni", "website"],
};

const apiMap = {
  events: eventsApi,
  speakers: speakersApi,
  tickets: ticketsApi,
  users: usersApi,
  categories: eventCategoriesApi,
  organizers: organizersApi,
};

const RESPONSE_ITEM_KEYS = {
  events: "event",
  speakers: "speaker",
  tickets: "ticket",
  users: "user",
  categories: "eventCategories",
  organizers: "organizer",
};

const formatDateTimeInput = (value) => {
  if (!value) {
    return "";
  }

  const normalized = String(value).replace(" ", "T");
  return normalized.slice(0, 16);
};

const LETTERS_ONLY_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-.]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s()-]{7,20}$/;

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

    if (startDate < now) {
      return "Start date nuk mund te jete ne te kaluaren.";
    }

    if (endDate < now) {
      return "End date nuk mund te jete ne te kaluaren.";
    }

    if (endDate < startDate) {
      return "End date duhet te jete pas ose e barabarte me start date.";
    }
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
    if (!LETTERS_ONLY_REGEX.test(String(values.emri).trim())) {
      return "User name mund te permbaje vetem shkronja.";
    }

    if (!EMAIL_REGEX.test(String(values.email).trim())) {
      return "Email nuk eshte valid.";
    }

    if (!isEditing && String(values.password || "").length < 6) {
      return "Password duhet te kete te pakten 6 karaktere.";
    }

    if (isEditing && values.password && String(values.password).length < 6) {
      return "Password duhet te kete te pakten 6 karaktere.";
    }
  }

  if (resource === "organizers") {
    if (values.email && !EMAIL_REGEX.test(String(values.email).trim())) {
      return "Organizer email nuk eshte valid.";
    }

    if (values.telefoni && !PHONE_REGEX.test(String(values.telefoni).trim())) {
      return "Phone duhet te permbaje vetem shifra dhe simbole valide.";
    }

    if (values.website) {
      try {
        const url = new URL(String(values.website).trim());
        if (!["http:", "https:"].includes(url.protocol)) {
          return "Website duhet te jete link valid.";
        }
      } catch {
        return "Website duhet te jete link valid.";
      }
    }
  }

  return "";
};

const normalizePayload = (resource, values, isEditing) => {
  const payload = { ...values };

  if (resource === "events") {
    payload.kapaciteti = Number(payload.kapaciteti);
    const toNumberIfNumeric = (v) => {
      if (v === null || v === undefined || v === "") return v;
      const s = String(v).trim();
      return /^-?\d+$/.test(s) ? Number(s) : v;
    };
    payload.organizer_id = toNumberIfNumeric(payload.organizer_id);
    payload.category_id = toNumberIfNumeric(payload.category_id);
  }

  if (resource === "tickets") {
    payload.event_id = Number(payload.event_id);
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

  if (resource === "organizers") {
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") {
        payload[key] = null;
      }
    });
  }

  return payload;
};

const getFormValuesFromItem = (resource, item) => {
  const defaults = EMPTY_FORMS[resource];

  if (!item) {
    return defaults;
  }

  return {
    ...defaults,
    ...item,
    data_fillimit: formatDateTimeInput(item.data_fillimit),
    data_perfundimit: formatDateTimeInput(item.data_perfundimit),
    organizer_id: item.organizer_id ?? "",
    category_id: item.category_id ?? "",
    event_id: item.event_id ?? "",
    imazhi: (() => {
      if (!item.imazhi) {
        return "";
      }

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
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getSavedItem = (resource, response) => {
  if (!response || typeof response !== "object") {
    return null;
  }

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
    organizers: 0,
  });
  const [data, setData] = useState({
    events: [],
    speakers: [],
    tickets: [],
    users: [],
    categories: [],
    organizers: [],
  });
  const [forms, setForms] = useState(EMPTY_FORMS);
  const [editingId, setEditingId] = useState({
    events: null,
    speakers: null,
    tickets: null,
    users: null,
    categories: null,
    organizers: null,
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
    organizers: "",
  });
  const [sortState, setSortState] = useState({
    events: { column: null, dir: "asc" },
    speakers: { column: null, dir: "asc" },
    tickets: { column: null, dir: "asc" },
    users: { column: null, dir: "asc" },
    categories: { column: null, dir: "asc" },
    organizers: { column: null, dir: "asc" },
  });

  const token = tokenStorage.getToken();
  const currentUser = tokenStorage.getUser();
  const isOrganizer = currentUser?.roli === "organizer";
  const visibleResourceEntries = useMemo(() => {
    return Object.entries(RESOURCE_CONFIG).filter(([key]) => {
      if (isOrganizer && key === "users") {
        return false;
      }
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
      organizer_id: data.organizers.map((organizer) => ({
        value: organizer.id,
        label: organizer.emri_organizates || `Organizer #${organizer.id}`,
      })),
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
      const [statsData, events, speakers, tickets, categories, organizers, usersResult] =
        await Promise.all([
          dashboardApi.getStats(token),
          eventsApi.getManaged(token),
          speakersApi.getAll(),
          ticketsApi.getAll(),
          eventCategoriesApi.getAll(),
          organizersApi.getAll(),
           token ? usersApi.getAll(token).catch(() => null) : Promise.resolve(null),
        ]);

      setStats({
        ...statsData,
        users: isOrganizer ? 0 : Array.isArray(usersResult) ? usersResult.length : statsData.users,
      });
      setData({
        events: Array.isArray(events) ? events : [],
        speakers: Array.isArray(speakers) ? speakers : [],
        tickets: Array.isArray(tickets) ? tickets : [],
        categories: Array.isArray(categories) ? categories : [],
        organizers: Array.isArray(organizers) ? organizers : [],
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

    if (!confirmed) {
      return;
    }

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
            (typeof value === "string" && value.trim() === "") ||
            (typeof value === "number" && value === 0 && field.type !== "number")
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

      // If creating/updating events and a file was selected, send multipart FormData
      let bodyToSend = payload;

      if (resource === "events") {
        if (eventImageFiles.length > 0) {
          const fd = new FormData();
          Object.entries(payload).forEach(([k, v]) => {
            if (v !== undefined && v !== null) fd.append(k, v);
          });
          eventImageFiles.forEach((file) => {
            fd.append("imazhi", file);
          });
          bodyToSend = fd;
        }
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

          return {
            ...current,
            [resource]: nextItems,
          };
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
      setSuccess(
        `${RESOURCE_CONFIG[resource].label} ${isEditing ? "updated" : "created"} successfully.`
      );
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

    const filtered = items.filter((item) => {
      if (!query) return true;
      return (activeColumns || []).some((col) =>
        String(item[col] ?? "").toLowerCase().includes(query)
      );
    });

    const sort = sortState[activeResource] || {};
    if (!sort || !sort.column) return filtered;

    const sorted = [...filtered].sort((a, b) => {
      const aRaw = a[sort.column];
      const bRaw = b[sort.column];

      const aStr = aRaw === null || aRaw === undefined ? "" : String(aRaw).trim();
      const bStr = bRaw === null || bRaw === undefined ? "" : String(bRaw).trim();

      const aFirst = aStr.charAt(0).toLowerCase();
      const bFirst = bStr.charAt(0).toLowerCase();

      let cmp = aFirst.localeCompare(bFirst);
      if (cmp === 0) cmp = aStr.localeCompare(bStr);

      return sort.dir === "desc" ? -cmp : cmp;
    });

    return sorted;
  }, [activeItems, activeColumns, searchQueries, activeResource, sortState]);

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

  return (
    <div className="admin-page">
      <Navbar />

      <div className="admin-dashboard">
        <section className="dashboard-hero">
          <div>
            <span className="dashboard-eyebrow">Control Center</span>
            <h1>Admin dashboard</h1>
            <p>
              A single place to manage the controllers you already exposed in the backend.
            </p>
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
          <div className="stat-card">
            <span>Organizers</span>
            <strong>{loading ? "..." : stats.organizers}</strong>
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
                <small>{data[key].length}</small>
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
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => resetResourceForm(activeResource)}
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>

              <form className="resource-form" onSubmit={(event) => handleSubmit(activeResource, event)}>
                <div className="form-grid">
                  {activeFields.map((field) => {
                    const options = selectOptions[field.name] || [];
                    const value = forms[activeResource][field.name] ?? "";
                    const isPasswordEditField =
                      activeResource === "users" && field.name === "password" && isEditingActive;

                    return (
                      <label
                        key={field.name}
                        className={`form-field${field.type === "textarea" ? " full-width" : ""}`}
                      >
                        <span>{field.label}</span>
                        {field.type === "textarea" ? (
                          <>
                            <textarea
                              value={value}
                              onChange={(event) =>
                                handleFormChange(activeResource, field.name, event.target.value)
                              }
                              placeholder={field.placeholder || ""}
                              required={field.required}
                              rows="5"
                            />
                            {activeResource === "events" && field.name === "imazhi" ? (
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(event) =>
                                  handleFormChange(activeResource, "event_files", event.target.files)
                                }
                              />
                            ) : null}
                          </>
                        ) : field.type === "select" ? (
                          field.name === "imazhi" ? (
                            <div className="upload-field">
                              <span className="upload-field-label">Upload image</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  handleFormChange(activeResource, "event_files", e.target.files);
                                }}
                              />
                              {forms[activeResource].imazhi ? (
                                <div className="upload-preview">{forms[activeResource].imazhi}</div>
                              ) : null}
                            </div>
                          ) : (
                            <select
                              value={value}
                              onChange={(event) =>
                                handleFormChange(activeResource, field.name, event.target.value)
                              }
                              required={field.required}
                            >
                              <option value="">Select {field.label.toLowerCase()}</option>
                              {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )
                        ) : (
                          <input
                            type={field.type}
                            value={value}
                            onChange={(event) =>
                                handleFormChange(activeResource, field.name, event.target.value)
                            }
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
                                    : activeResource === "organizers" && field.name === "telefoni"
                                      ? PHONE_REGEX.source
                                      : undefined
                            }
                          />
                        )}
                        {isPasswordEditField ? (
                          <small>Leave blank to keep the current password.</small>
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
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => resetResourceForm(activeResource)}
                  >
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
                <div style={{display: "flex", gap: 12, alignItems: "center"}}>
                  <input
                    aria-label={`Search ${RESOURCE_CONFIG[activeResource].label}`}
                    className="resource-search"
                    placeholder={`Search ${RESOURCE_CONFIG[activeResource].label}...`}
                    value={searchQueries[activeResource] || ""}
                    onChange={(e) =>
                      setSearchQueries((cur) => ({ ...cur, [activeResource]: e.target.value }))
                    }
                  />
                  <button type="button" className="ghost-btn" onClick={loadDashboard}>
                    Refresh
                  </button>
                </div>
              </div>

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
                          <th
                            key={column}
                            className="clickable-header"
                            onClick={() => handleHeaderSort(column)}
                          >
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
                              <button
                                type="button"
                                className="table-btn"
                                onClick={() => handleEdit(activeResource, item)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="table-btn danger"
                                onClick={() => handleDelete(activeResource, item.id)}
                              >
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
