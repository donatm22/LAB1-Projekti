import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import { eventCategoriesApi, eventsApi } from "../services/api";
import { mapApiEventToCard } from "../utils/eventMapper";
import "./Eventet.css";

const EventsPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [apiEvents, setApiEvents] = useState([]);
  const [filters, setFilters] = useState([{ id: "all", label: "All" }]);
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("q") || "").trim().toLowerCase();

  useEffect(() => {
    let isMounted = true;

    Promise.all([eventsApi.getAll(), eventCategoriesApi.getAll()])
      .then(([events, categories]) => {
        if (!isMounted) {
          return;
        }

        const mappedCategories = Array.isArray(categories) ? categories : [];
        const mappedEvents = Array.isArray(events)
          ? events.map((event) => mapApiEventToCard(event, mappedCategories))
          : [];

        setApiEvents(mappedEvents);
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

  const visibleEvents = useMemo(
    () =>
      apiEvents.filter((event) => {
        const matchesFilter =
          activeFilter === "all" || String(event.categoryId) === String(activeFilter);

        const searchableText = [
          event.title,
          event.speaker,
          event.category,
          event.location,
          event.date,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesFilter && (!searchQuery || searchableText.includes(searchQuery));
      }),
    [activeFilter, apiEvents, searchQuery]
  );

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
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
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
