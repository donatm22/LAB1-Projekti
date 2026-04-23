import React, { useState } from "react";
import "./About.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Team from "../components/Team";



const PILLARS = [
  {
    number: "I",
    heading: "Curation over volume.",
    body: "We'd rather show you three perfect evenings than thirty mediocre ones. Every listing is reviewed by a human curator who has been there.",
  },
  {
    number: "II",
    heading: "Context, not just content.",
    body: "We believe knowing the story behind the art deepens the experience. Every event page is written to transport, not just inform.",
  },
  {
    number: "III",
    heading: "Something worth keeping.",
    body: "Most nights dissolve by morning. We design for the ones that don't — the performance you still think about, the idea you've since come back to.",
  },
];

const TIMELINE = [
  { year: "2018", title: "The beginning.", desc: "Born in a Dallas studio apartment with a spreadsheet, a mailing list of 40 friends, and an obsession with finding the city's hidden gems." },
  { year: "2020", title: "Going digital.", desc: "We launched our first discovery platform, bringing curated cultural programming to audiences during a transformative period." },
  { year: "2022", title: "National expansion.", desc: "Aura expanded to 12 cities, forging partnerships with over 600 independent venues, galleries, and cultural institutions." },
  { year: "2024", title: "Community of 300K.", desc: "We crossed 300,000 members and introduced our membership tier — a more intimate, members-only layer of curated access." },
];

function AboutUs() {
  const [expandedYear, setExpandedYear] = useState(null);

  const toggleYear = (year) =>
    setExpandedYear((prev) => (prev === year ? null : year));

  return (
    <div>
      <Navbar />
    <div className="about-wrapper">
      

      <main className="about-page">

        <section className="about-hero">
          <div className="about-hero-bg" aria-hidden="true">
            <svg viewBox="0 0 960 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <circle cx="820" cy="100" r="340" fill="var(--color-accent)" opacity=".12" />
              <circle cx="140" cy="420" r="220" fill="var(--color-accent)" opacity=".07" />
              {Array.from({ length: 20 }).map((_, i) => (
                <line key={i}
                  x1={480} y1={260}
                  x2={480 + Math.cos((i * 18) * Math.PI / 180) * 520}
                  y2={260 + Math.sin((i * 18) * Math.PI / 180) * 520}
                  stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.08"
                />
              ))}
            </svg>
          </div>

          <div className="about-hero-content">
            <div className="about-hero-left">
              <span className="eyebrow">Our Story</span>
              <h1 className="about-headline">
                We believe culture
                <em> deserves </em>an audience.
              </h1>
            </div>
            <div className="about-hero-right">
              <p className="about-hero-desc">
                Aura was built by art lovers, music obsessives, and curious wanderers
                who were tired of missing the moments that mattered. We exist to make
                sure you never do.
              </p>
              <div className="about-hero-cta-row">
                <a href="#mission" className="about-btn-primary">Our Mission</a>
                <a href="#team" className="about-btn-ghost">
                  Meet the Team
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </section>

        <section className="about-mission" id="mission">
          <div className="about-mission-inner">
            <div className="about-mission-left">
              <span className="eyebrow">Our Mission</span>
              <h2 className="about-section-heading">Making the invisible unmissable.</h2>
              <p className="about-mission-aside">
                Every city hides a world of extraordinary experiences — underground
                concerts, ephemeral exhibitions, intimate workshops with masters of
                their craft. They happen and disappear, often unknown to the very
                people who would have loved them most.
              </p>
              <div className="about-rule" aria-hidden="true" />
              <p className="about-footnote">
                Est. in the belief that how you spend your evenings defines who you become.
              </p>
            </div>
            <div className="about-mission-right">
              {PILLARS.map((pillar) => (
                <article className="about-pillar" key={pillar.number}>
                  <span className="about-pillar-number" aria-hidden="true">{pillar.number}</span>
                  <div className="about-pillar-body">
                    <h3 className="about-pillar-heading">{pillar.heading}</h3>
                    <p className="about-pillar-text">{pillar.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-team" id="team">
          <Team />
        </section>

        <section className="about-timeline">
          <div className="about-timeline-inner">
            <div className="about-timeline-header">
              <span className="eyebrow">Our History</span>
              <h2 className="about-section-heading">
                From a spreadsheet
                <em> to 340,000 members.</em>
              </h2>
            </div>
            <div className="about-timeline-list">
              {TIMELINE.map((item) => (
                <button
                  key={item.year}
                  className={`about-timeline-item${expandedYear === item.year ? " open" : ""}`}
                  onClick={() => toggleYear(item.year)}
                  aria-expanded={expandedYear === item.year}
                >
                  <span className="about-timeline-year">{item.year}</span>
                  <div className="about-timeline-body">
                    <span className="about-timeline-title">{item.title}</span>
                    {expandedYear === item.year && (
                      <p className="about-timeline-desc">{item.desc}</p>
                    )}
                  </div>
                  <svg
                    className="about-timeline-chevron"
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="about-cta">
          <div className="about-cta-inner">
            <span className="eyebrow eyebrow--light">Join AURA</span>
            <h2 className="about-cta-heading">
              Ready to find your next
              <em> ethereal moment?</em>
            </h2>
            <p className="about-cta-body">
              Join 340,000 curious people discovering the best cultural experiences
              in their city — curated by humans, not algorithms.
            </p>
            <div className="about-cta-buttons">
              <a href="/events" className="about-cta-btn-primary">Explore Events</a>
              <a href="/membership" className="about-cta-btn-ghost">Become a Member</a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
    </div>
  );
}

export default AboutUs;