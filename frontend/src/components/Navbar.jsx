import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Events", href: "events" },
  { label: "About Us", href: "about" },
  { label: "Exhibitions", href: "#exhibitions" },
  { label: "Socials", href:"socials" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <header className="navbar-shell" ref={menuRef}>
      <nav className="navbar">
        <Link className="navbar-logo" to="/">
          AURA
        </Link>

        <ul className="navbar-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.to ? (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `navbar-link${isActive ? " active" : ""}`
                  }
                  end
                >
                  {item.label}
                </NavLink>
              ) : (
                <a className="navbar-link" href={item.href}>
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <label className="navbar-search" htmlFor="event-search">
            <span className="navbar-search-icon" aria-hidden="true">&#128269;</span>
            <input
              id="event-search"
              type="search"
              name="event-search"
              placeholder="Search events..."
              aria-label="Search events"
            />
          </label>

          <Link className="navbar-cta" to="/create">
            Create Event
          </Link>

          <Link className="navbar-profile" to="/login" aria-label="Open profile">
            <svg viewBox="0 0 185.20833 185.20834" xmlns="http://www.w3.org/2000/svg">
              <g fill="currentColor">
                <circle cx="92.604" cy="49.077" r="45.192" />
                <path d="M 92.604,102.428 A 78.983215,78.983215 0 0 0 13.6207,181.323 H 171.5873 A 78.983215,78.983215 0 0 0 92.604,102.428 Z" />
              </g>
            </svg>
          </Link>

          <button
            className={`navbar-hamburger${isOpen ? " open" : ""}`}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav"
        className={`navbar-mobile-menu${isOpen ? " open" : ""}`}
        aria-hidden={!isOpen}
      >
        <label className="navbar-mobile-search" htmlFor="mobile-event-search">
          <span className="navbar-search-icon" aria-hidden="true">&#128269;</span>
          <input
            id="mobile-event-search"
            type="search"
            name="event-search"
            placeholder="Search events..."
            aria-label="Search events"
          />
        </label>

        {navItems.map((item) =>
          item.to ? (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `navbar-mobile-link${isActive ? " active" : ""}`
              }
              end
            >
              {item.label}
            </NavLink>
          ) : (
            <a key={item.label} className="navbar-mobile-link" href={item.href}>
              {item.label}
            </a>
          )
        )}
      </div>
    </header>
  );
}

export default Navbar;