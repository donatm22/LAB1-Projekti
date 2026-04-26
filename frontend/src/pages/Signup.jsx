import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import { usersApi } from "../services/api";

const INITIAL_FORM = {
  emri: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function Signup() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await usersApi.create({
        emri: formData.emri.trim(),
        email: formData.email.trim(),
        password: formData.password,
        roli: "user",
      });

      setSuccess("Registration successful. Your account has been saved.");
      window.alert("Registration successful. Your account has been saved.");
      setFormData(INITIAL_FORM);
      navigate("/login");
    } catch (submitError) {
      setError(submitError.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <section className="signup-shell">
        <div className="signup-story">
          <span className="signup-eyebrow">Join AURA</span>
          <h1>
            Create your account<span>.</span>
          </h1>
          <p>
            Register once and keep your event history, tickets, and registrations in one place.
          </p>

          <div className="signup-benefits" aria-label="Registration benefits">
            <article className="signup-benefit">
              <span className="signup-benefit-index">01</span>
              <div>
                <h2 className="signup-benefit-title">Fast access</h2>
                <p className="signup-benefit-text">
                  Set up your profile in a few steps and get ready to explore the event platform.
                </p>
              </div>
            </article>

            <article className="signup-benefit">
              <span className="signup-benefit-index">02</span>
              <div>
                <h2 className="signup-benefit-title">Saved in the database</h2>
                <p className="signup-benefit-text">
                  Your account is stored in the backend Users table, so it can be reused for login.
                </p>
              </div>
            </article>

            <article className="signup-benefit">
              <span className="signup-benefit-index">03</span>
              <div>
                <h2 className="signup-benefit-title">Built for the same flow</h2>
                <p className="signup-benefit-text">
                  The page follows the same warm, editorial style as the rest of the app.
                </p>
              </div>
            </article>
          </div>
        </div>

        <form className="signup-card" onSubmit={handleSubmit}>
          <div className="signup-card-content">
            <span className="signup-badge">User Registration</span>
            <h2>Start here</h2>
            <p>We will create a standard user account for you.</p>

            {error ? <div className="signup-message error">{error}</div> : null}
            {success ? <div className="signup-message success">{success}</div> : null}

            <div className="signup-form">
              <label className="signup-field full">
                <span>Full name</span>
                <input
                  type="text"
                  name="emri"
                  placeholder="Enter your full name"
                  value={formData.emri}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="signup-field full">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="signup-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="signup-field">
                <span>Confirm password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </label>
            </div>

            <div className="signup-actions">
              <button type="submit" className="signup-btn" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </button>

              <p className="signup-links">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Signup;
