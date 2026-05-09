import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AboutUs from "./pages/About";
import Socials from "./pages/Socials";
import EventsPage from "./pages/Eventet";
import AdminDashboard from "./pages/AdminDashboard";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/socials" element={<Socials />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
