import { useCallback, useEffect, useMemo, useState } from "react";
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
    bio: "",
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
    pershkrimi: "",
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
    { name: "imazhi", label: "Image", type: "select", required: true },
  ],
  speakers: [
    { name: "emri", label: "Name", type: "text", required: true },
    { name: "bio", label: "Bio", type: "textarea", required: true },
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
    { name: "pershkrimi", label: "Description", type: "textarea", required: true },
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
  speakers: ["id", "emri", "bio"],
  tickets: ["id", "event_id", "tipi", "cmimi", "sasia"],
  users: ["id", "emri", "email", "roli"],
  categories: ["id", "emri", "pershkrimi"],
  organizers: ["id", "emri_organizates", "email", "telefoni", "website"],
};

const EVENT_IMAGE_OPTIONS = [
  { value: "/best_events/lecture1.jpg", label: "Lecture 1" },
  { value: "/best_events/lecture2.jpg", label: "Lecture 2" },
  { value: "/best_events/lecture3.jpg", label: "Lecture 3" },
  { value: "/best_events/lecture4.jpg", label: "Lecture 4" },
  { value: "/best_events/lecture5.jpg", label: "Lecture 5" },
  { value: "/best_events/lecture6.jpg", label: "Lecture 6" },
  { value: "/best_events/lecture7.jpg", label: "Lecture 7" },
  { value: "/best_events/lecture8.jpg", label: "Lecture 8" },
  { value: "/best_events/lecture9.jpg", label: "Lecture 9" },
  { value: "/best_events/lecture10.jpg", label: "Lecture 10" },
  { value: "/best_events/lecture11.jpg", label: "Lecture 11" },
  { value: "/best_events/lecture12.jpg", label: "Lecture 12" },
  { value: "/best_events/concert1.webp", label: "Concert 1" },
  { value: "/best_events/concert2.webp", label: "Concert 2" },
  { value: "/best_events/concert3.webp", label: "Concert 3" },
];

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

const normalizePayload = (resource, values, isEditing) => {
  const payload = { ...values };

  if (resource === "events") {
    payload.kapaciteti = Number(payload.kapaciteti);
    payload.organizer_id = Number(payload.organizer_id);
    payload.category_id = Number(payload.category_id);
  }

  if (resource === "tickets") {
    payload.event_id = Number(payload.event_id);
    payload.cmimi = Number(payload.cmimi);
    payload.sasia = Number(payload.sasia);
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

  const token = tokenStorage.getToken();
  const currentUser = tokenStorage.getUser();

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
      imazhi: EVENT_IMAGE_OPTIONS,
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
      const [statsData, events, speakers, tickets, categories, organizers, users] =
        await Promise.all([
          dashboardApi.getStats(token),
          eventsApi.getAll(),
          speakersApi.getAll(),
          ticketsApi.getAll(),
          eventCategoriesApi.getAll(),
          organizersApi.getAll(),
          token ? usersApi.getAll(token) : Promise.resolve([]),
        ]);

      setStats(statsData);
      setData({
        events: Array.isArray(events) ? events : [],
        speakers: Array.isArray(speakers) ? speakers : [],
        tickets: Array.isArray(tickets) ? tickets : [],
        categories: Array.isArray(categories) ? categories : [],
        organizers: Array.isArray(organizers) ? organizers : [],
        users: Array.isArray(users) ? users : [],
      });
    } catch (loadError) {
      setError(loadError.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleFormChange = (resource, field, value) => {
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
      const payload = normalizePayload(resource, forms[resource], isEditing);
      let savedResponse;

      if (isEditing) {
        savedResponse = await apiMap[resource].update(editingId[resource], payload, token);
      } else {
        savedResponse = await apiMap[resource].create(payload, token);
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
      setError(submitError.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const activeItems = data[activeResource];
  const activeFields = FIELD_CONFIG[activeResource];
  const activeColumns = TABLE_COLUMNS[activeResource];
  const isEditingActive = Boolean(editingId[activeResource]);
  const hasAdminAccess = currentUser?.roli === "admin" || currentUser?.roli === "organizer";

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
          <div className="stat-card">
            <span>Users</span>
            <strong>{loading ? "..." : stats.users}</strong>
          </div>
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

        {!hasAdminAccess ? (
          <div className="dashboard-message error">
            You need an `admin` or `organizer` account in local storage to use protected CRUD actions.
          </div>
        ) : null}

        {error ? <div className="dashboard-message error">{error}</div> : null}
        {success ? <div className="dashboard-message success">{success}</div> : null}

        <section className="dashboard-layout">
          <aside className="dashboard-sidebar">
            {Object.entries(RESOURCE_CONFIG).map(([key, config]) => (
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
                          <textarea
                            value={value}
                            onChange={(event) =>
                              handleFormChange(activeResource, field.name, event.target.value)
                            }
                            placeholder={field.placeholder || ""}
                            required={field.required}
                            rows="5"
                          />
                        ) : field.type === "select" ? (
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
                          />
                        )}
                        {isPasswordEditField ? (
                          <small>Leave blank to keep the current password.</small>
                        ) : null}
                      </label>
                    );
                  })}
                </div>

                <div className="form-actions">
                  <button type="submit" className="primary-btn" disabled={saving || !hasAdminAccess}>
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
                <button type="button" className="ghost-btn" onClick={loadDashboard}>
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="empty-state">Loading data...</div>
              ) : activeItems.length === 0 ? (
                <div className="empty-state">{RESOURCE_CONFIG[activeResource].empty}</div>
              ) : (
                <div className="table-wrap">
                  <table className="resource-table">
                    <thead>
                      <tr>
                        {activeColumns.map((column) => (
                          <th key={column}>{prettifyKey(column)}</th>
                        ))}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeItems.map((item) => (
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
                                disabled={!hasAdminAccess}
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
