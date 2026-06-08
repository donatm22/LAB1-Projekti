import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import { eventCategoriesApi, eventsApi } from "../services/api";
import { mapApiEventToCard } from "../utils/eventMapper";
import "./Eventet.css";

const EventsPage = () => {
  const [apiEvents, setApiEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState([{ id: "all", label: "All" }]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get("category") || "all";
  const searchQuery = (searchParams.get("q") || "").trim();
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const upcomingOnly = searchParams.get("upcoming") === "true";
  const availableOnly = searchParams.get("available") === "true";

  useEffect(() => {
    let isMounted = true;

    eventCategoriesApi.getAll()
      .then((loadedCategories) => {
        if (!isMounted) {
          return;
        }

        const mappedCategories = Array.isArray(loadedCategories) ? loadedCategories : [];

        setCategories(mappedCategories);
        setFilters([
          { id: "all", label: "All" },
          ...mappedCategories.map((category) => ({
            id: String(category.id),
            label: category.emri,
          })),
        ]);
      })
      .catch((error) => {
        console.error("Failed to load events:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    eventsApi
      .getAll({
        q: searchQuery,
        category: activeFilter === "all" ? "" : activeFilter,
        minPrice,
        maxPrice,
        upcoming: upcomingOnly ? "true" : "",
        available: availableOnly ? "true" : "",
      })
      .then((events) => {
        if (!isMounted) {
          return;
        }

        const mappedEvents = Array.isArray(events)
          ? events.map((event) => mapApiEventToCard(event, categories))
          : [];

        setApiEvents(mappedEvents);
      })
      .catch((error) => {
        console.error("Failed to load events:", error);
        if (isMounted) {
          setApiEvents([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeFilter, availableOnly, categories, maxPrice, minPrice, searchQuery, upcomingOnly]);

  const updateFilterParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const visibleEvents = useMemo(() => apiEvents, [apiEvents]);

  return (
    <div>
      <Navbar />
      <main className="main">
        <section className="hero-section">
          <div className="hero-inner">
            <p className="eyebrow">Curated Experiences</p>
            <h1 className="headline">
              Find your next <span className="headline-accent">ethereal</span> moment.
            </h1>

            <div className="filter-row">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`filter-btn ${activeFilter === filter.id ? "filter-btn--active" : ""}`}
                  onClick={() => updateFilterParam("category", filter.id === "all" ? "" : filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="advanced-filter-row" aria-label="Advanced event filters">
              <label className="filter-field">
                <span>Min price</span>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) => updateFilterParam("minPrice", event.target.value)}
                />
              </label>
              <label className="filter-field">
                <span>Max price</span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) => updateFilterParam("maxPrice", event.target.value)}
                />
              </label>
              <label className="filter-check">
                <input
                  type="checkbox"
                  checked={upcomingOnly}
                  onChange={(event) => updateFilterParam("upcoming", event.target.checked ? "true" : "")}
                />
                <span>Upcoming</span>
              </label>
              <label className="filter-check">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(event) => updateFilterParam("available", event.target.checked ? "true" : "")}
                />
                <span>Available</span>
              </label>
            </div>
          </div>

          <div className="hero-rule">
            <span className="rule-label">{visibleEvents.length} events available</span>
            <div className="rule-line" />
          </div>
        </section>

        <section className="grid-section">
          {visibleEvents.length > 0 ? (
            <div className="grid">
              {visibleEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="card-wrapper"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <EventCard {...event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No events match your search.</div>
          )}
        </section>

        <section className="quote-section">
          <div className="quote-inner">
            <div className="quote-mark">&ldquo;</div>
            <blockquote className="quote-text">
              Design is not just what it looks like and feels like. Design is how it{" "}
              <em className="quote-accent">connects</em> us to the moment.
            </blockquote>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;
