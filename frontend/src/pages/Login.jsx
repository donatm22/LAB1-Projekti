import { Link } from "react-router-dom";
import { useState} from "react";
import "./Login.css"
import { authApi, tokenStorage } from "../services/api";

function Login(){
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const data = await authApi.login(formData);
            console.log(data);

            tokenStorage.setToken(data.token);
            tokenStorage.setUser(data.user);
            alert("Login u krye me sukses!");
        }catch(error){
            console.error("Error gjat Login:", error);
            alert(error.message || "Server error");
        }
    };
    return (
    <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
            <h1>Login<span>.</span></h1>

            <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
            />

            <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
            />

            <button type="submit">Login</button>
            <div className="links">
            Don't have an account? <Link to="/signup">Sign Up</Link>
            </div>
        </form>
    </div>
  );
}
export default Login;
