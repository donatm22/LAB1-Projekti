import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import './FAQ.css';

const faqData = [
  {
    question: "What exactly is an AURA curated experience?",
    answer: "AURA events are boutique, high-concept gatherings that blend culture, art, music, and thought leadership. Unlike massive commercial festivals, we focus on intimacy, premium craft, and deep human connection."
  },
  {
    question: "How do I secure access to upcoming gatherings?",
    answer: "Because our venues feature strictly limited capacities, tickets are released in curated phases. Members get priority notification. Tap 'Get Started' to join the waitlist for your city."
  },
  {
    question: "Can I apply to be a speaker or featured artist?",
    answer: "Absolutely. We are constantly searching for bold voices, visionaries, and exceptional craftsmen. Head over to our host portal or email your portfolio directly to our curation board."
  },
  {
    question: "What is your refund policy for premium tickets?",
    answer: "Tickets are non-refundable due to the highly tailored nature of our catering and venue setups. However, they can be securely transferred to another guest up to 48 hours prior to the event via your profile dash."
  }
];

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <> {}
      <Navbar />
      <section className="faq-container">
        <div className="faq-header-grid">
          <div className="faq-title-side">
            <span className="sub-badge">COMMON INQUIRIES</span>
            <h1 className="main-title">
              Answers for the <br />
              <span className="accent-text">curious</span> mind.
            </h1>
          </div>
          <div className="faq-desc-side">
            <p className="lead-text">
              Everything you need to know about our curation process, ticketing, 
              and how we bring intimate cultural gatherings to life worldwide.
            </p>
          </div>
        </div>

        <hr className="section-divider" />

        <div className="faq-content-grid">
          <div className="faq-info-card">
            <h3>Still have questions?</h3>
            <p>
              Can't find what you are looking for? Reach out to our dedicated 
              support crew for personalized assistance.
            </p>
            <a href="#contact" className="btn-primary">CONTACT SUPPORT</a>
          </div>

          <div className="faq-accordion-wrapper">
            {faqData.map((item, index) => {
              const isOpen = activeIndex === index;
              return (
                <div 
                  key={index} 
                  className={`faq-item ${isOpen ? 'active' : ''}`}
                >
                  <button 
                    className="faq-toggle" 
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-question">{item.question}</span>
                    <span className="faq-icon"></span>
                  </button>
                  <div className="faq-panel">
                    <p>{item.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    {}
    </>
  );
}

export default FAQ;