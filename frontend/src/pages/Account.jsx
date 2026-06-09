import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import NotificationList from "../components/NotificationList";
import { tokenStorage } from "../services/api";
import "./Account.css";

const AVATAR_VARIANTS = [
  { background: "linear-gradient(135deg, #c48a5a, #f1d2b4)", accent: "#6d3f1b" },
  { background: "linear-gradient(135deg, #7e8c6b, #dbe3c7)", accent: "#314221" },
  { background: "linear-gradient(135deg, #6d7fa8, #d2d9f1)", accent: "#243458" },
  { background: "linear-gradient(135deg, #a06b7f, #efd1db)", accent: "#5b2439" },
  { background: "linear-gradient(135deg, #b48c58, #f0deb8)", accent: "#68461f" },
  { background: "linear-gradient(135deg, #688f8a, #d4ece8)", accent: "#24524d" },
];

const getHash = (value) =>
  Array.from(String(value || "")).reduce((hash, char) => hash + char.charCodeAt(0), 0);

function Account() {
  const navigate = useNavigate();
  const currentUser = tokenStorage.getUser();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true });
    }
  }, [currentUser, navigate]);

  const avatar = useMemo(() => {
    const seed = currentUser?.id || currentUser?.email || currentUser?.emri || "guest";
    const variant = AVATAR_VARIANTS[Math.abs(getHash(seed)) % AVATAR_VARIANTS.length];
    const initials = (currentUser?.emri || "U")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

    return { ...variant, initials: initials || "U" };
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="account-page">
      <Navbar />

      <main className="account-shell">
        <section className="account-card">
          <div className="account-avatar" style={{ background: avatar.background }}>
            <span aria-hidden="true" className="account-avatar-mark" style={{ color: avatar.accent }}>
              <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
                <path d="M48 8a22 22 0 1 1 0 44 22 22 0 0 1 0-44Zm0 52c-18.2 0-33 13.4-33 30v2h66v-2c0-16.6-14.8-30-33-30Z" fill="currentColor" />
              </svg>
            </span>
            <span className="account-avatar-initials">{avatar.initials}</span>
          </div>

          <div className="account-content">
            <span className="account-eyebrow">Account</span>
            <h1>{currentUser.emri || "Unnamed user"}</h1>
            <p className="account-subtitle">This is your minimal profile page.</p>

            <div className="account-meta">
              <div>
                <span>Email</span>
                <strong>{currentUser.email || "No email available"}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{currentUser.roli || "user"}</strong>
              </div>
            </div>
          </div>
        </section>

        <NotificationList />
      </main>
    </div>
  );
}

export default Account;
