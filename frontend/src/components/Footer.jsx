import "./Footer.css";

const FOOTER_LINKS = {
  Discover: ["All Events", "Concerts", "Workshops", "Exhibitions", "Educational Talks", "Socials"],
  Company: ["About AURA", "Our Team", "Partnerships", "Press & Media", "Careers"],
  Support: ["Help Centre", "Contact Us", "Refund Policy", "Accessibility", "Terms of Use"],
};


function Footer(){
    return(
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <span className="footer-logo">AURA</span>
              <p className="footer-tagline">
                The considered guide to evenings worth having.
              </p>
              <div className="footer-socials">
                <a href="#" className="footer-social" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8"/>
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                  </svg>
                </a>
                <a href="#" className="footer-social" aria-label="X / Twitter">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </a>
                <a href="#" className="footer-social" aria-label="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M7 10v7M7 7v.5M12 17v-4c0-1.5 1-2 2-2s2 .5 2 2v4M12 10v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="footer-links">
              {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                <div className="footer-col" key={group}>
                  <span className="footer-col-heading">{group}</span>
                  <ul className="footer-col-list">
                    {links.map((link) => (
                      <li key={link}>
                        <a href="#" className="footer-link">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 AURA Events Ltd. All rights reserved.</span>
            <div className="footer-bottom-links">
              <a href="#" className="footer-bottom-link">Privacy Policy</a>
              <a href="#" className="footer-bottom-link">Cookie Policy</a>
              <a href="#" className="footer-bottom-link">Terms of Service</a>
            </div>
          </div>
        </footer>

    );
}
export default Footer;
