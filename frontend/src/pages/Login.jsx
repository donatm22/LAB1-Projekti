import { useState} from "react";
import "./Login.css"
import { apiUrl } from "../config/api";

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
            const response = await fetch(apiUrl("/auth/login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            console.log(data);

            if(response.ok){
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                alert("Login u krye me sukses!");
            }else{
                alert(data.message || "Login deshtoi");
            }
        }catch(error){
            console.error("Error gjat Login:", error);
            alert("Server error");
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
            Don't have an account? <a href="/signup">Sign Up</a>
            </div>
        </form>
    </div>
  );
}
export default Login;
