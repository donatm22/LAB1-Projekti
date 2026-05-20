import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from '../components/EventCard';
import { eventCategoriesApi, eventsApi } from "../services/api";
// static events removed: use only dynamically fetched events
import { mapApiEventToCard } from "../utils/eventMapper";
import './Eventet.css';
 
const EventsPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [apiEvents, setApiEvents] = useState([]);
  const [filters, setFilters] = useState(['All']);
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();
  const allEvents = useMemo(() => apiEvents, [apiEvents]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([eventsApi.getAll(), eventCategoriesApi.getAll()])
      .then(([events, categories]) => {
        if (!isMounted) {
          return;
        }

        const mappedEvents = Array.isArray(events)
          ? events.map((event) =>
              mapApiEventToCard(event, Array.isArray(categories) ? categories : [])
            )
          : [];

        setApiEvents(mappedEvents);

        // Dynamically create filters from actual categories
        if (Array.isArray(categories) && categories.length > 0) {
          const categoryNames = categories.map((cat) => cat.emri);
          setFilters(['All', ...categoryNames]);
        }
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
      allEvents.filter((event) => {
        const matchesFilter = activeFilter === 'All' || event.category === activeFilter;
        const searchableText = [
          event.title,
          event.speaker,
          event.category,
          event.location,
          event.date,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return matchesFilter && (!searchQuery || searchableText.includes(searchQuery));
      }),
    [activeFilter, allEvents, searchQuery]
  );
 
  return (
    <div>
    <Navbar />
      <main class="main">
 
     
        <section class="hero-section">
          <div class="hero-inner">
            <p class="eyebrow">Curated Experiences</p>
            <h1 class="headline">
              Find your next{' '}
              <span class="headline-accent">ethereal</span>{' '}
              moment.
            </h1>
 
            <div class="filter-row">
              {filters.map((f) => (
                <button
                  key={f}
                  class={`filter-btn ${activeFilter === f ? 'filter-btn--active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
 
      
          <div class="hero-rule">
            <span class="rule-label">
              {visibleEvents.length} events available
            </span>
            <div class="rule-line" />
          </div>
        </section>
 
    
        <section class="grid-section">
          {visibleEvents.length > 0 ? (
            <div class="grid">
              {visibleEvents.map((event, i) => (
                <div
                  key={event.id}
                  class="card-wrapper"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <EventCard {...event} />
                </div>
              ))}
            </div>
          ) : (
            <div class="empty-state">
              No events match your search.
            </div>
          )}
        </section>
 
   
        <section class="quote-section">
          <div class="quote-inner">
            <div class="quote-mark">&ldquo;</div>
            <blockquote class="quote-text">
              Design is not just what it looks like and feels like.
              Design is how it{' '}
              <em class="quote-accent">connects</em> us to the moment.
            </blockquote>
          </div>
        </section>
 
      </main>
      <Footer />
    </div>
    
  );
};
 
export default EventsPage;
