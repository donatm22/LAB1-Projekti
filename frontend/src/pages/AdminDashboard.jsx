import Navbar from "../components/Navbar";

function AdminDashboard() {
  return (
    <div>
      <Navbar />

      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
        <p>Manage events, speakers, tickets, and users from here.</p>

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
