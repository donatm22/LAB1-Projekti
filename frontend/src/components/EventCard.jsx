import React from "react";
import { Link } from "react-router-dom";
import "./EventCard.css";

const EventCard = ({ id, category, title, location, date, image, isFeatured }) => {
  return (
    <Link
      to={`/events/${id}/tickets`}
      className={`archive-card ${isFeatured ? "featured" : ""}`}
    >
      <div className="archive-card-image-wrap">
        <img 
          src={image} 
          alt={title || `Presentation on ${category}`} 
          className="archive-image"
          loading="lazy" 
        />
        <div className="archive-card-overlay">
          <span className="archive-badge">View Session</span>
        </div>
      </div>

      <div className="archive-card-info">
        <div className="archive-meta-top">
          <span className="archive-category">{category}</span>
          <span className="archive-date">{date}</span>
        </div>
        <h4 className="archive-speaker-name">{title}</h4>
        <p className="archive-location">
          <svg width="10" height="12" viewBox="0 0 11 13" fill="none" aria-hidden="true">
            <path d="M5.5 1C3.015 1 1 3.015 1 5.5c0 3.375 4.5 7.5 4.5 7.5s4.5-4.125 4.5-7.5C10 3.015 7.985 1 5.5 1zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5z" fill="currentColor"/>
          </svg>
          {location}
        </p>
      </div>
    </Link>
  );
};

export default EventCard;
