import React, { useState } from "react";
import { FaUser, FaLock, FaEnvelope, FaKey, FaUserAlt } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/lppm-logo.png";

function LoginForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);

  const API_BASE_URL = "http://127.0.0.1:8000/api";
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, {
          email,
          password,
        });
        if (res.data && res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        navigate("/");
      } else {
        if (password !== confirmPassword) {
          alert("Password dan konfirmasi tidak sama!");
          return;
        }
        const res = await axios.post(`${API_BASE_URL}/auth/register`, {
          name,
          username,
          email,
          password,
        });
        if (res.data && res.data.user && res.data.user.email) {
          setEmail(res.data.user.email);
        }
        setIsLoginMode(true);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan. Silakan cek konsol untuk detail.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-[#4d0a0a] to-[#9D1414]">
      <div className="bg-gray-100 rounded-xl shadow-2xl w-[420px] p-8 relative">
        {/* Icon User di Atas */}
        <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-[#9D1414] w-16 h-16 rounded-full flex items-center justify-center">
          <FaUser className="text-white text-2xl" />
        </div>

        {/* Tab Login / Register */}
        <div className="flex justify-between mt-10 mb-5 text-[15px] font-medium">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`w-1/2 py-2 rounded-l-full ${isLoginMode
                ? "bg-[#9D1414] text-white"
                : "bg-transparent text-gray-700"
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`w-1/2 py-2 rounded-r-full ${!isLoginMode
                ? "bg-[#9D1414] text-white"
                : "bg-transparent text-gray-700"
              }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-[15px]">
          {!isLoginMode && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#9D1414]"
                required
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#9D1414]"
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="adel@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#9D1414]"
            required
          />
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#9D1414]"
            required
          />
          {!isLoginMode && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#9D1414]"
              required
            />
          )}

          {isLoginMode && (
            <div className="text-right">
              <a href="#" className="text-[#9D1414] text-xs hover:underline">
                Forgot password?
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#9D1414] text-white py-2 rounded-full font-semibold text-[15px] hover:bg-[#7a0f0f] transition"
          >
            {isLoginMode ? "Login" : "Register"}
          </button>

          <p className="text-center text-xs text-gray-700">
            {isLoginMode
              ? "Don’t have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-[#9D1414] font-semibold hover:underline"
            >
              {isLoginMode ? "Register now" : "Login"}
            </button>
          </p>
        </form>
      </div>

      {/* Logo di Kanan */}
      <div className="ml-48">
        <img src={logo} alt="LPPM Logo" className="w-64 mb-3" />
      </div>
    </div>



  );
}

export default LoginForm;
