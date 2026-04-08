import "./Navbar.css";
function Navbar(){
    return (
        <nav className="navbar">
            <h2 className="logo">EventHub</h2>

            <ul className="nav-links">
                <li><a href="/">Home</a></li>
                <li> <a href="/events">Events</a></li>
                <li><a href="/speakers">Speakers</a></li>
                <li><a href="/tickets">Tickets</a></li>
                <li><a href="/login">Login</a></li>
            </ul>
        </nav>
    )
}
export default Navbar;