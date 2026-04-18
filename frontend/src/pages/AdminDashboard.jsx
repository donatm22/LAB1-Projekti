import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";
import { dashboardApi } from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    speakers: 0,
    tickets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await dashboardApi.getStats();
        setStats(statsData);
      } catch (error) {
        console.error("Gabim gjate marrjes se statistikave:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <Navbar />

      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
        <p>Manage events, speakers, tickets, and users from here.</p>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{loading ? "Loading..." : stats.users}</p>
          </div>

          <div className="stat-card">
            <h3>Total Events</h3>
            <p>{loading ? "Loading..." : stats.events}</p>
          </div>

          <div className="stat-card">
            <h3>Total Speakers</h3>
            <p>{loading ? "Loading..." : stats.speakers}</p>
          </div>

          <div className="stat-card">
            <h3>Total Tickets</h3>
            <p>{loading ? "Loading..." : stats.tickets}</p>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h2>Events</h2>
            <p>Add, update, or delete events.</p>
            <button>Manage Events</button>
          </div>

          <div className="dashboard-card">
            <h2>Speakers</h2>
            <p>Manage all speakers in the system.</p>
            <button>Manage Speakers</button>
          </div>

          <div className="dashboard-card">
            <h2>Tickets</h2>
            <p>View and update ticket information.</p>
            <button>Manage Tickets</button>
          </div>

          <div className="dashboard-card">
            <h2>Users</h2>
            <p>Check users and their roles.</p>
            <button>Manage Users</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
