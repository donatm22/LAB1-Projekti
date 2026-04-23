import React from "react";
import "./Socials.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SOCIAL_PLATFORMS = [
  {
    id: "IG",
    name: "Instagram",
    handle: "@aura_culture",
    description: "Visual highlights, behind-the-scenes stories, and daily cultural inspiration.",
    link: "https://instagram.com",
    initials: "IG",
  },
  {
    id: "LI",
    name: "LinkedIn",
    handle: "Aura Culture",
    description: "Professional updates, industry news, and deep dives into the business of art.",
    link: "https://linkedin.com",
    initials: "LI",
  },
  {
    id: "TW",
    name: "Twitter / X",
    handle: "@aura_events",
    description: "Real-time updates, event announcements, and cultural commentary.",
    link: "https://twitter.com",
    initials: "TW",
  },
];

function Socials() {
  return (
    <div className="socials-page-wrapper">
      <Navbar />
      
      <main className="socials-main">
        {/* Hero Section */}
        <section className="socials-hero">
          <div className="socials-hero-content">
            <span className="eyebrow">Connect</span>
            <h1 className="socials-headline">
              Join the <em>community.</em>
            </h1>
            <p className="socials-description">
              Beyond the platform, we are a growing network of culture obsessives. 
              Find us where you spend your time.
            </p>
          </div>
        </section>

        {/* Socials Grid */}
        <section className="socials-grid-section">
          <div className="socials-grid">
            {SOCIAL_PLATFORMS.map((platform) => (
              <a 
                href={platform.link} 
                key={platform.id} 
                className="social-card"
                target={platform.link !== "#" ? "_blank" : "_self"}
                rel="noreferrer"
              >
                <div className="social-card-icon" aria-hidden="true">
                  <span>{platform.initials}</span>
                </div>
                <div className="social-card-body">
                  <div className="social-card-header">
                    <h3 className="social-platform-name">{platform.name}</h3>
                    <span className="social-handle">{platform.handle}</span>
                  </div>
                  <p className="social-platform-desc">{platform.description}</p>
                  <div className="social-card-footer">
                    <span className="social-action">Visit Platform</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="social-footer-cta">
          <div className="cta-box">
            <h2>Never miss a moment.</h2>
            <p>Our community members get first access to tickets and exclusive curator notes.</p>
            <button className="cta-btn">Register Now</button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Socials;