import React, { useState, useRef } from "react";
import "./Home.css";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import { SOUGHT_AFTER_EVENTS } from "../../data/eventsData";

const FILTER_CHIPS = [
  "Educational Talks",
  "Concerts",
  "Workshops",
  "Exhibitions",
  "Socials",
];

const PILLARS = [
  {
    number: "I",
    heading: "Discourse over spectacle.",
    body: "We live in an age that rewards volume. AURA was built as a deliberate correction — a space where the quality of an argument outlasts the noise that surrounds it. Every event is selected not for its headline value, but for the depth of conversation it is capable of producing.",
  },
  {
    number: "II",
    heading: "The right room matters.",
    body: "Ideas do not develop in isolation. They sharpen against other ideas, held by people who have taken the time to care about them. Our gatherings are kept intimate by design — not as an affectation of exclusivity, but because understanding requires proximity.",
  },
  {
    number: "III",
    heading: "Rigour is not a barrier.",
    body: "We do not believe complexity should be a gatekeeping device. Our speakers are chosen for their ability to make difficult things legible without making them simple. Philosophy, mathematics, history — brought back to the human questions that gave rise to them.",
  },
  {
    number: "IV",
    heading: "Something worth keeping.",
    body: "Most evenings dissolve by morning. We design ours to linger — in the form of a reference you return to, a position you have since revised, or a question you are still turning over weeks later. That residue is the point.",
  },
];

function Home() {
  const [activeFilter, setActiveFilter] = useState("Educational Talks");
  const sliderRef = useRef(null);

  const filteredEvents = SOUGHT_AFTER_EVENTS.filter(
    (event) => event.category === activeFilter
  );

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const amount = 420;
    sliderRef.current.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="home-wrapper">
      <Navbar />

      <main className="home-page">

        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-top">
            <div className="hero-left">
              <span className="hero-eyebrow">The Art of the Argument</span>
              <h1 className="hero-headline">
                Insights that leave a
                <em> lasting</em> resonance.
              </h1>
            </div>

            <div className="hero-right">
              <p className="hero-description">
                Beyond the noise of the modern day lies the quiet power of a shared idea.
                Join us for a series of intimate engagements designed to challenge,
                refine, and inspire.
              </p>
            </div>
          </div>

          <p className="hero-section-label">Our most sought-after events</p>

          {/* ── Filter bar + arrows ── */}
          <div className="hero-filters-row">
            <div className="hero-filters">
              <button className="filter-icon-btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Refine
              </button>

              <div className="filter-divider" />

              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip}
                  className={`filter-chip${activeFilter === chip ? " active" : ""}`}
                  onClick={() => setActiveFilter(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="slider-arrows">
              <button
                className="slider-arrow"
                onClick={() => scroll("prev")}
                aria-label="Previous events"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="slider-arrow"
                onClick={() => scroll("next")}
                aria-label="Next events"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Slider ── */}
          <div className="hero-slider" ref={sliderRef}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div className="hero-slide" key={event.id}>
                  <EventCard {...event} />
                </div>
              ))
            ) : (
              <p className="hero-empty">No events found in this category yet.</p>
            )}
          </div>
        </section>

        {/* ── Why AURA ── */}
        <section className="why-aura">
          <div className="why-aura-inner">

            <div className="why-aura-left">
              <span className="hero-eyebrow">Why AURA</span>
              <h2 className="why-heading">
                A case for slowing down.
              </h2>
              <p className="why-aside">
                In a culture of endless content, we make one small argument: that an evening
                spent in genuine intellectual company is among the most worthwhile things
                a person can do with their time.
              </p>
              <div className="why-rule" aria-hidden="true" />
              <p className="why-footnote">
                Est. in the belief that the examined life is still worth living.
              </p>
            </div>

            <div className="why-aura-right">
              {PILLARS.map((pillar) => (
                <article className="why-pillar" key={pillar.number}>
                  <span className="why-pillar-number" aria-hidden="true">
                    {pillar.number}
                  </span>
                  <div className="why-pillar-body">
                    <h3 className="why-pillar-heading">{pillar.heading}</h3>
                    <p className="why-pillar-text">{pillar.body}</p>
                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}

export default Home;