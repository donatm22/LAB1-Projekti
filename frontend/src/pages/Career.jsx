import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Career.css';

const jobOpenings = [
  {
    id: 1,
    title: "Lead Experience & Spatial Designer",
    department: "Design",
    location: "Remote / Europe",
    type: "Full-time"
  },
  {
    id: 2,
    title: "Technical Operations & Venue Logistics Director",
    department: "Operations",
    location: "Prishtina, Kosovo",
    type: "Full-time"
  },
  {
    id: 3,
    title: "Experiential Brand Marketing Lead",
    department: "Marketing",
    location: "Hybrid",
    type: "Contract"
  },
  {
    id: 4,
    title: "Lead Experience & Scenography Designer",
    department: "Design",
    location: "Prishtina, Kosovo / Hybrid",
    type: "Full-time"
  },
  {
    id: 5,
    title: "Head of Venue Relations & Hospitality Logistics",
    department: "Operations",
    location: "Prishtina, Kosovo",
    type: "Full-time"
  },
  {
    id: 6,
    title: "Technical Production & Stage Manager",
    department: "Operations",
    location: "On-Site / Touring",
    type: "Contract"
  },
  {
    id: 7,
    title: "Experiential Brand Partnership Lead",
    department: "Marketing",
    location: "Hybrid",
    type: "Full-time"
  }
];

const departments = ["All", "Design", "Operations", "Marketing"];

export default function Career() {
  const [selectedDept, setSelectedDept] = useState("All");

  const filteredJobs = selectedDept === "All" 
    ? jobOpenings 
    : jobOpenings.filter(job => job.department === selectedDept);

  return (
    <>
      <Navbar />
      <main className="careers-page">
        
        {/* --- HERO SECTION --- */}
        <section className="careers-hero">
          <div className="hero-grid">
            <div className="hero-title-area">
              <span className="badge">JOIN THE CREW</span>
              <h1 className="hero-heading">
                Engineer the infrastructure of <br />
                <span className="italic-accent">live culture.</span>
              </h1>
            </div>
            <div className="hero-desc-area">
              <p className="hero-lead">
                We are building the next generation of event software and curated live experiences. 
                From interactive canvas floorplans to high-traffic ticketing engines, we solve complex 
                spatial and technical logistical problems beautifully.
              </p>
              <a href="#openings" className="btn-scrolldown">EXPLORE OPEN ROLES</a>
            </div>
          </div>
        </section>

        <hr className="layout-divider" />

        {/* --- BENTO BENEFITS SECTION --- */}
        <section className="bento-benefits-section">
          <span className="badge">WHY WORK WITH US</span>
          <h2 className="section-title">Designed for creators who execute.</h2>
          
          <div className="bento-grid">
            <div className="bento-card card-large">
              <h3>High-Velocity Infrastructure</h3>
              <p>We build systems that withstand massive, instantaneous traffic spikes during global ticket drops. Our frontend architecture values 60fps canvas interfaces and flawless state isolation.</p>
            </div>
            <div className="bento-card card-small accent-bg">
              <h3>On-Site Testing</h3>
              <p>We don’t just build behind screens. You’ll have the opportunity to deploy your code, interfaces, and logistics workflows live in premium spaces globally.</p>
            </div>
            <div className="bento-card card-small">
              <h3>Morning Energy</h3>
              <p>Physical stamina powers mental clarity. We sponsor full gym memberships so you can keep your morning routine locked down before the deep work blocks start.</p>
            </div>
            <div className="bento-card card-medium">
              <h3>Asynchronous Focus</h3>
              <p>We completely protect your makers' schedule. No endless status meetings, no micromanagement—just pure, high-end production and execution.</p>
            </div>
          </div>
        </section>

        {/* --- JOB LISTINGS SECTION --- */}
        <section id="openings" className="listings-section">
          <div className="listings-header">
            <div>
              <span className="badge">ACTIVE CALLS</span>
              <h2 className="section-title">Open Positions</h2>
            </div>
            
            {/* Filter System */}
            <div className="filter-pill-wrapper">
              {departments.map((dept) => (
                <button
                  key={dept}
                  className={`filter-pill ${selectedDept === dept ? 'active' : ''}`}
                  onClick={() => setSelectedDept(dept)}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Job Rows */}
          <div className="jobs-list-container">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job.id} className="job-row-card">
                  <div className="job-meta-main">
                    <span className="job-dept-tag">{job.department}</span>
                    <h3 className="job-title-text">{job.title}</h3>
                  </div>
                  <div className="job-meta-secondary">
                    <span className="job-location">{job.location}</span>
                    <span className="job-type-badge">{job.type}</span>
                  </div>
                  <div className="job-action">
                    <button className="btn-secondary">VIEW ROLE</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-listings-state">
                <p>No open slots in this department currently. Send us an open application instead.</p>
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}