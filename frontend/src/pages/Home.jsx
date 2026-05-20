import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import { eventCategoriesApi, eventsApi } from "../services/api";
// static events removed: use only dynamically fetched events
import { mapApiEventToCard } from "../utils/eventMapper";

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
    heading: "Quality over quantity.",
    body: "We don't list everything. We list the things worth attending — concerts with soul, workshops with substance, exhibitions with a point of view. If it's on AURA, someone on our team has vouched for it personally.",
  },
  {
    number: "II",
    heading: "The right room matters.",
    body: "A great concert in the wrong venue is a lesser experience. A workshop with the wrong crowd teaches you nothing. We think carefully about context — not just what the event is, but where it happens and who else will be there.",
  },
  {
    number: "III",
    heading: "Every kind of evening.",
    body: "Culture doesn't live in one room. It's in a jazz basement on a Tuesday, a philosophy lecture on a Sunday afternoon, a ceramics workshop you almost didn't book. AURA exists across all of it.",
  },
  {
    number: "IV",
    heading: "Something worth keeping.",
    body: "Most nights dissolve by morning. We design for the ones that don't — the performance you still think about, the idea from a talk you've since come back to, the skill from a workshop you still use. That residue is the point.",
  },
];

const STATS = [
  { value: "340+", label: "Events hosted" },
  { value: "650K+", label: "Attendees" },
  { value: "80+", label: "Speakers & artists" },
  { value: "20", label: "Countries" },
];

const FOOTER_LINKS = {
  Discover: ["All Events", "Concerts", "Workshops", "Exhibitions", "Educational Talks", "Socials"],
  Company: ["About AURA", "Our Team", "Partnerships", "Press & Media", "Careers"],
  Support: ["Help Centre", "Contact Us", "Refund Policy", "Accessibility", "Terms of Use"],
};

function Home() {
  const [selectedChips, setSelectedChips] = useState([]);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const [apiEvents, setApiEvents] = useState([]);

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
      })
      .catch((error) => {
        console.error("Failed to load client events:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const allEvents = useMemo(() => apiEvents, [apiEvents]);

  const featuredEvents = allEvents.filter((event) => event.isFeatured).slice(0, 4);
  const activeFeaturedEvent = featuredEvents[activeFeaturedIndex] ?? featuredEvents[0];

  const toggleChip = (chip) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const moveFeaturedCarousel = (direction) => {
    if (featuredEvents.length === 0) return;

    setActiveFeaturedIndex((currentIndex) => {
      const offset = direction === "next" ? 1 : -1;
      return (currentIndex + offset + featuredEvents.length) % featuredEvents.length;
    });
  };

  return (
    <div className="home-wrapper">
      <Navbar />

      <main className="home-page">

        <section className="hero">
          <div className="hero-top">
            <div className="hero-left">
              <span className="hero-eyebrow">Curated Experiences</span>
              <h1 className="hero-headline">
                Events that leave a
                <em> lasting </em>impression.
              </h1>
            </div>
            <div className="hero-right">
              <p className="hero-description">
                Beyond the ordinary night out lies something worth remembering.
                AURA brings together the best of culture, music, ideas, and craft —
                intimate gatherings designed to move you.
              </p>
              <div className="hero-cta-row">
                <a href="/events" className="hero-btn-primary">Get Started</a>
              </div>
            </div>
          </div>

          <div className="hero-stats">
            {STATS.map((stat) => (
              <div className="hero-stat" key={stat.label}>
                <span className="hero-stat-value">{stat.value}</span>
                <span className="hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          {activeFeaturedEvent && (
            <div className="featured-carousel" aria-label="Featured events carousel">
              <div className="featured-carousel-heading">
                <div>
                  <span className="hero-section-label">Featured now</span>
                  <h2>Four events worth putting first.</h2>
                </div>
                <div className="slider-arrows">
                  <button
                    type="button"
                    className="slider-arrow"
                    onClick={() => moveFeaturedCarousel("prev")}
                    aria-label="Previous featured event"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="slider-arrow"
                    onClick={() => moveFeaturedCarousel("next")}
                    aria-label="Next featured event"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="featured-carousel-grid">
                <Link
                  to={`/events/${activeFeaturedEvent.id}/tickets`}
                  className="featured-main-card"
                >
                  <img src={activeFeaturedEvent.image} alt={activeFeaturedEvent.title} />
                  <div className="featured-main-overlay">
                    <span className="archive-category">{activeFeaturedEvent.category}</span>
                    <h3>{activeFeaturedEvent.title}</h3>
                    <p>{activeFeaturedEvent.speaker}</p>
                    <span className="featured-location">{activeFeaturedEvent.location} - {activeFeaturedEvent.date}</span>
                  </div>
                </Link>

                <div className="featured-thumbs" aria-label="Choose featured event">
                  {featuredEvents.map((event, index) => (
                    <Link
                      to={`/events/${event.id}/tickets`}
                      key={event.id}
                      className={`featured-thumb${activeFeaturedIndex === index ? " active" : ""}`}
                      onMouseEnter={() => setActiveFeaturedIndex(index)}
                      onFocus={() => setActiveFeaturedIndex(index)}
                      aria-current={activeFeaturedIndex === index ? "true" : undefined}
                    >
                      <img src={event.image} alt="" aria-hidden="true" />
                      <span>
                        <strong>{event.title}</strong>
                        <i>{event.location}</i>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="why-aura">
          <div className="why-aura-inner">
            <div className="why-aura-left">
              <span className="hero-eyebrow">Why AURA</span>
              <h2 className="why-heading">A case for living well.</h2>
              <p className="why-aside">
                In a culture of endless options, we do the curation for you.
                Every event on AURA is selected for one reason: it's worth your evening.
              </p>
              <div className="why-rule" aria-hidden="true" />
              <p className="why-footnote">
                Est. in the belief that how you spend your time defines who you become.
              </p>
            </div>
            <div className="why-aura-right">
              {PILLARS.map((pillar) => (
                <article className="why-pillar" key={pillar.number}>
                  <span className="why-pillar-number" aria-hidden="true">{pillar.number}</span>
                  <div className="why-pillar-body">
                    <h3 className="why-pillar-heading">{pillar.heading}</h3>
                    <p className="why-pillar-text">{pillar.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="subscribe">
          <div className="subscribe-inner">
            <div className="subscribe-left">
              <span className="hero-eyebrow">Stay in the loop</span>
              <h2 className="subscribe-heading">
                Join the list.<br />
                Miss <em>nothing</em>.
              </h2>
              <p className="subscribe-body">
                We surface events we think you'd actually want to attend —
                no noise, no filler. Just a quiet note in your inbox when
                something worth your evening lands on AURA.
              </p>
              <div className="subscribe-trust">
                <span className="subscribe-trust-item">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5L5.5 10 11 3" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  No spam, ever
                </span>
                <span className="subscribe-trust-item">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5L5.5 10 11 3" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Unsubscribe anytime
                </span>
                <span className="subscribe-trust-item">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5L5.5 10 11 3" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Joined by 12,000+ members
                </span>
              </div>
            </div>
            <div className="subscribe-right">
              <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
                <div className="subscribe-field">
                  <label htmlFor="subscribe-name" className="subscribe-label">Your name</label>
                  <input id="subscribe-name" type="text" placeholder="Jane Smith" className="subscribe-input" />
                </div>
                <div className="subscribe-field">
                  <label htmlFor="subscribe-email" className="subscribe-label">Email address</label>
                  <input id="subscribe-email" type="email" placeholder="jane@example.com" className="subscribe-input" />
                </div>
                <div className="subscribe-categories">
                  <span className="subscribe-label">I'm interested in</span>
                  <div className="subscribe-chips">
                    {FILTER_CHIPS.map((chip) => (
                      <button
                        type="button"
                        key={chip}
                        className={`subscribe-chip${selectedChips.includes(chip) ? " selected" : ""}`}
                        onClick={() => toggleChip(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="subscribe-btn">
                  Notify me
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </section>

      <Footer />

      </main>
    </div>
  );
}

export default Home;
