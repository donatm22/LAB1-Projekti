import React, { useState } from "react";
import "./Contact.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


function ContactUs() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
      <div className="contact-page">
    < Navbar/>
        <div className="page-content">
          <p className="eyebrow">Get In Touch</p>
          <h1 className="page-title">
            We'd love to hear<br />about your <em>next event.</em>
          </h1>
          <hr className="divider" />

          <div className="contact-layout">
            <div className="contact-info">
              <div className="info-block">
                <h3>Our Office</h3>
                <p>Rr. Xhevded Doda<br/>Pristina, Kosovo 10000</p>
              </div>
              <div className="info-block">
                <h3>Email Us</h3>
                <p><a href="mailto:hello@aura-events.com">hello@aura-events.com</a></p>
              </div>
              <div className="info-block">
                <h3>Phone</h3>
                <p>+383 44 542 323</p>
              </div>
            </div>

            {/* FORM */}
            {submitted ? (
              <div className="success-msg">
                Thank you — we'll be in touch soon.
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select a topic</option>
                    <option value="event">Event Inquiry</option>
                    <option value="exhibition">Exhibition Booking</option>
                    <option value="partnership">Partnership</option>
                    <option value="general">General Question</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your event or question..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="submit-row">
                  <span className="count-note">We reply within 24 hours.</span>
                  <button type="submit" className="submit-btn">Send Message →</button>
                </div>
              </form>
            )}
          </div>
        </div>
        <Footer />
      </div>
  );
}

export default ContactUs;