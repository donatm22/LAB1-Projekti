import "./Home.css";

const curatedCards = [
  {
    title: "The Vanguard Sessions",
    subtitle: "Live performances with intimate stage design.",
    className: "curation-card curation-stage",
  },
  {
    title: "Golden Supper Clubs",
    subtitle: "Private dining and premium networking tables.",
    className: "curation-card curation-dining",
  },
  {
    title: "Archive Halls",
    subtitle: "Spaces made for panels, launches, and screenings.",
    className: "curation-card curation-archive",
  },
  {
    title: "Planning Notes",
    subtitle: "Editorial calendars and curated event briefs.",
    className: "curation-card curation-note",
  },
];

const planningPoints = [
  "Meaningful registration tracking",
  "Organized speaker and sponsor management",
  "Fast event publishing for your team",
];

export default function Home() {
  return (
    <div className="landing-shell">
      <div className="landing-page">
        <header className="landing-header">
          <div className="brand-block">
            <span className="brand-mini">Evently</span>
          </div>

          <nav className="landing-nav">
            <a href="/">Home</a>
            <a href="/login">Login</a>
            <a href="/admin">Dashboard</a>
          </nav>

          <div className="header-actions">
            <button className="ghost-button">Collections</button>
            <button className="primary-button">Get Started</button>
          </div>
        </header>

        <section className="hero-section">
          <div className="hero-copy">
            <p className="section-kicker">Curated event management</p>
            <h1>
              Unforgettable <span>Experiences.</span>
            </h1>
            <p className="hero-description">
              Plan conferences, speaker sessions, ticketing, and premium
              gatherings inside one elegant platform made for memorable events.
            </p>

            <div className="hero-actions">
              <button className="primary-button">Book a Demo</button>
              <button className="text-button">Browse Collections</button>
            </div>
          </div>

          <div className="hero-side-note">
            <p>
              Editorial tools for teams who want each event to feel deliberate,
              polished, and easy to manage from first announcement to final
              registration.
            </p>
          </div>
        </section>

        <section className="hero-visual">
          <div className="arch-gallery">
            <div className="arch-column">
              <div className="arch-window arch-tall">
                <span className="arch-glow" />
              </div>
            </div>

            <div className="arch-column">
              <div className="arch-window arch-tall arch-center">
                <span className="arch-glow" />
              </div>
            </div>

            <div className="arch-column">
              <div className="arch-window arch-tall">
                <span className="arch-glow" />
              </div>
            </div>
          </div>

          <div className="floating-note">
            <p className="floating-title">The Nightfall Editorial Suite</p>
            <p>Built for modern events, speakers, registrations, and tickets.</p>
          </div>
        </section>

        <section className="curation-section">
          <div className="section-heading">
            <p className="section-kicker">Curated collections</p>
            <h2>Design every experience with intention.</h2>
          </div>

          <div className="curation-grid">
            {curatedCards.map((card) => (
              <article key={card.title} className={card.className}>
                <div className="card-surface">
                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.subtitle}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="editorial-section">
          <div className="editorial-visual">
            <div className="book-cover">
              <span>EVENT</span>
              <span>PLANNING</span>
              <span>ISSUE</span>
            </div>
          </div>

          <div className="editorial-copy">
            <p className="section-kicker">Platform focus</p>
            <h2>
              An editorial <span>standard</span> for planners.
            </h2>
            <p>
              Bring structure to your events with one dashboard for users,
              speakers, categories, sponsors, payments, and registrations.
            </p>

            <ul className="planning-list">
              {planningPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="newsletter-panel">
          <p className="newsletter-kicker">Join the editorial planner list</p>
          <h2>Get event ideas and platform updates.</h2>

          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button className="dark-button">Subscribe</button>
          </div>
        </section>

        <footer className="landing-footer">
          <span>About</span>
          <span>Events</span>
          <span>Speakers</span>
          <span>Contact</span>
        </footer>
      </div>
    </div>
  );
}
