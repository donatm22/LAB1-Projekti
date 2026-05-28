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
    type: "Full-time",
    description: "We are looking for a visionary Lead Experience & Spatial Designer to shape the physical and digital environments of our live events. You will own the end-to-end spatial design process — from concept sketches to on-site execution — ensuring every venue feels intentional, immersive, and brand-coherent.",
    responsibilities: [
      "Design spatial layouts and experience flows for large-scale live events",
      "Lead a small team of junior designers and external contractors",
      "Collaborate closely with the Technical Operations and Marketing teams",
      "Produce detailed CAD drawings, mood boards, and 3D renders",
      "Manage vendor relationships for fabrication and installation",
      "Conduct post-event reviews and iterate on design systems"
    ],
    requirements: [
      "5+ years of experience in spatial, exhibition, or set design",
      "Proficiency in CAD software (AutoCAD, Rhino, or equivalent)",
      "Strong portfolio demonstrating large-scale experiential projects",
      "Ability to travel to European cities for on-site work",
      "Excellent communication skills in English; additional European languages a plus",
      "Experience working in fast-paced, event-driven environments"
    ]
  },
  {
    id: 2,
    title: "Technical Operations & Venue Logistics Director",
    department: "Operations",
    location: "Prishtina, Kosovo",
    type: "Full-time",
    description: "As our Technical Operations & Venue Logistics Director, you will be the backbone of our event infrastructure. Based in Prishtina, you will oversee all technical aspects of venue preparation, equipment procurement, and day-of logistics for every event we produce.",
    responsibilities: [
      "Plan and execute technical setups including AV, lighting, and staging",
      "Negotiate contracts with venues, suppliers, and technical crews",
      "Build and maintain detailed run-of-show and logistics documents",
      "Lead cross-functional teams of up to 30 crew members on event days",
      "Develop and enforce health & safety protocols across all events",
      "Own the technical operations budget and report to the COO"
    ],
    requirements: [
      "7+ years in technical event production or venue operations",
      "Deep knowledge of AV systems, rigging, and stage management",
      "Proven experience managing large crew teams under pressure",
      "Based in or willing to relocate to Prishtina, Kosovo",
      "Fluent in Albanian and English; Serbian is a bonus",
      "Valid driver's license and ability to work flexible hours including weekends"
    ]
  },
  {
    id: 3,
    title: "Experiential Brand Marketing Lead",
    department: "Marketing",
    location: "Hybrid",
    type: "Contract",
    description: "We need a sharp Experiential Brand Marketing Lead to translate our brand story into memorable, on-the-ground activations. This contract role is ideal for a freelance marketing professional who thrives at the intersection of brand strategy and live experience design.",
    responsibilities: [
      "Develop and execute experiential marketing campaigns tied to event launches",
      "Identify partnership and sponsorship opportunities with aligned brands",
      "Manage on-site brand activations, pop-ups, and interactive installations",
      "Coordinate with the design team to ensure brand consistency across touchpoints",
      "Track and report on campaign performance metrics and ROI",
      "Build and maintain relationships with media partners and influencers"
    ],
    requirements: [
      "4+ years of experiential or field marketing experience",
      "Demonstrated success running brand activations at live events",
      "Strong network in the European events and lifestyle industry",
      "Ability to work independently with minimal supervision",
      "Excellent project management skills; proficiency in tools like Notion or Asana",
      "Available for on-site presence at key events across the year"
    ]
  },
  {
    id: 4,
    title: "Lead Experience & Scenography Designer",
    department: "Design",
    location: "Prishtina, Kosovo / Hybrid",
    type: "Full-time",
    description: "Our Lead Experience & Scenography Designer will craft the visual narratives and scenic environments that make our events unforgettable. Based primarily in Prishtina with flexibility for hybrid work, you will work at the crossroads of theatre, architecture, and brand experience.",
    responsibilities: [
      "Concept and execute scenographic designs for multi-stage events",
      "Develop visual storytelling frameworks aligned with event themes",
      "Oversee scenic element fabrication, sourcing, and installation",
      "Collaborate with lighting and AV teams for integrated design outcomes",
      "Create detailed technical drawings and production packages",
      "Present design concepts to stakeholders and incorporate feedback"
    ],
    requirements: [
      "Degree in Scenography, Architecture, Theatre Design, or related field",
      "4+ years of professional scenography or set design experience",
      "Strong portfolio of immersive or large-scale scenic projects",
      "Proficiency in SketchUp, Vectorworks, or equivalent design tools",
      "Ability to work both remotely and on-site in Prishtina as needed",
      "Creative problem-solver comfortable adapting designs to real-world constraints"
    ]
  },
  {
    id: 5,
    title: "Head of Venue Relations & Hospitality Logistics",
    department: "Operations",
    location: "Prishtina, Kosovo",
    type: "Full-time",
    description: "The Head of Venue Relations & Hospitality Logistics will own all relationships with venue partners and ensure our hospitality standards are world-class. You will be the primary point of contact for venues across Kosovo and the wider Balkans region.",
    responsibilities: [
      "Scout, evaluate, and secure venues for upcoming events",
      "Manage ongoing relationships with venue owners and facility managers",
      "Oversee catering, VIP hospitality, and guest experience logistics",
      "Negotiate venue contracts and ensure compliance with all terms",
      "Coordinate access, permits, and local authority requirements",
      "Build a network of trusted local vendors and service providers"
    ],
    requirements: [
      "5+ years in hospitality management or venue operations",
      "Strong existing relationships with event venues in Kosovo or the Balkans",
      "Experience negotiating high-value contracts",
      "Impeccable organizational skills and attention to detail",
      "Fluent in Albanian; proficiency in English required",
      "Comfortable representing the company in formal meetings and negotiations"
    ]
  },
  {
    id: 6,
    title: "Technical Production & Stage Manager",
    department: "Operations",
    location: "On-Site / Touring",
    type: "Contract",
    description: "We're looking for an experienced Technical Production & Stage Manager to join our touring crew for select events throughout the year. This contract role demands a cool head, a detailed mind, and a genuine love for live production.",
    responsibilities: [
      "Manage all technical aspects of stage operations during events",
      "Coordinate between artists, crews, and venue technical staff",
      "Oversee load-in, sound check, show, and load-out workflows",
      "Create and distribute daily schedules and production advances",
      "Troubleshoot technical issues in real time with speed and composure",
      "Ensure all safety and compliance standards are met on-site"
    ],
    requirements: [
      "3+ years of stage management or technical production experience",
      "Solid understanding of live audio, lighting, and video systems",
      "Ability to travel extensively for touring events",
      "Experience working with high-profile artists or large-scale productions",
      "Strong leadership presence and clear communication under pressure",
      "Flexible availability including evenings, weekends, and extended travel"
    ]
  },
  {
    id: 7,
    title: "Experiential Brand Partnership Lead",
    department: "Marketing",
    location: "Hybrid",
    type: "Full-time",
    description: "As our Experiential Brand Partnership Lead, you will build and manage the strategic partnerships that elevate our events from great to iconic. You will identify brands that align with our values, structure win-win deals, and activate those partnerships in creative, on-brand ways.",
    responsibilities: [
      "Identify, pitch, and close brand partnership and sponsorship deals",
      "Develop compelling partnership decks and activation proposals",
      "Manage the full partnership lifecycle from outreach to post-event reporting",
      "Collaborate with the design and marketing teams on partner activations",
      "Attend key industry events to represent the company and build relationships",
      "Track revenue targets and partnership KPIs, reporting to leadership"
    ],
    requirements: [
      "5+ years in brand partnerships, sponsorship sales, or business development",
      "Proven track record closing sponsorship deals in the events or entertainment space",
      "Excellent presentation and negotiation skills",
      "Self-starter who can manage a pipeline independently",
      "Strong network of brand marketing contacts across industries",
      "Willingness to travel for client meetings and events throughout the year"
    ]
  }
];

const departments = ["All", "Design", "Operations", "Marketing"];

export default function Career() {
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);

  const filteredJobs = selectedDept === "All"
    ? jobOpenings
    : jobOpenings.filter(job => job.department === selectedDept);

  const openRole = (job) => {
    setSelectedJob(job);
    document.body.style.overflow = 'hidden';
  };

  const closeRole = () => {
    setSelectedJob(null);
    document.body.style.overflow = '';
  };

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
              <p>We don't just build behind screens. You'll have the opportunity to deploy your code, interfaces, and logistics workflows live in premium spaces globally.</p>
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
                    <button className="btn-secondary" onClick={() => openRole(job)}>VIEW ROLE</button>
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

      {/* --- ROLE DETAIL MODAL --- */}
      {selectedJob && (
        <div className="role-overlay" onClick={closeRole}>
          <div className="role-panel" onClick={(e) => e.stopPropagation()}>

            <div className="role-panel-header">
              <div>
                <span className="role-dept-tag">{selectedJob.department}</span>
                <h2 className="role-panel-title">{selectedJob.title}</h2>
                <div className="role-meta-row">
                  <span className="role-location-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {selectedJob.location}
                  </span>
                  <span className="job-type-badge">{selectedJob.type}</span>
                </div>
              </div>
              <button className="role-close-btn" onClick={closeRole} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="role-panel-body">
              <section className="role-section">
                <h4 className="role-section-label">About the Role</h4>
                <p className="role-description">{selectedJob.description}</p>
              </section>

              <section className="role-section">
                <h4 className="role-section-label">Responsibilities</h4>
                <ul className="role-list">
                  {selectedJob.responsibilities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="role-section">
                <h4 className="role-section-label">Requirements</h4>
                <ul className="role-list">
                  {selectedJob.requirements.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="role-panel-footer">
              <button className="btn-apply">APPLY FOR THIS ROLE</button>
              <button className="btn-ghost" onClick={closeRole}>BACK TO LISTINGS</button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
