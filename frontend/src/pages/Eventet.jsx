import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from '../components/EventCard';
import { SOUGHT_AFTER_EVENTS } from "../../data/eventsData";
import './Eventet.css';
 
const FILTERS = ['All', 'Upcoming', 'Concerts', 'Educational Talks', 'Comedy'];
 
const EventsPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
 
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
              {FILTERS.map((f) => (
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
              {SOUGHT_AFTER_EVENTS.length} events available
            </span>
            <div class="rule-line" />
          </div>
        </section>
 
    
        <section class="grid-section">
          <div class="grid">
            {SOUGHT_AFTER_EVENTS.map((event, i) => (
              <div
                key={event.id}
                class="card-wrapper"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <EventCard {...event} />
              </div>
            ))}
          </div>
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