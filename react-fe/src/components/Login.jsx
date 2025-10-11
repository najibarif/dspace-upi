import React, { useState, useEffect } from "react";
import { FaUser, FaKey } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoginMode, setIsLoginMode] = useState(true);

  const API_BASE_URL = "http://127.0.0.1:8000/api";
  const navigate = useNavigate();

  // NOTE: we intentionally do NOT auto-redirect from this page so it's
  // always possible to visit /login during development and testing.

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        // LOGIN
        const res = await axios.post(`${API_BASE_URL}/auth/login`, {
          email,
          password,
        });
        console.log("Login success:", res.data);
        // persist user (simple) and redirect to Home
        if (res.data && res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        // navigate immediately to Home (avoid blocking alert)
        navigate("/");
      } else {
        // REGISTER
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
  console.log("Register success:", res.data);
        // prefill email and switch to login mode
        if (res.data && res.data.user && res.data.user.email) {
          setEmail(res.data.user.email);
        }
        // optionally prefill password (not recommended) — we won't prefill password
        setIsLoginMode(true); // otomatis pindah ke form login
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan. Cek konsol untuk detailnya.");
    }
  };

  return (
    <div className="w-[430px] bg-[#D9D9D9] p-8 ml-[-500px] mt-10 rounded-2xl shadow-lg">
      {/* Header Titles */}
      <div className="w-[100px] h-[100px] mt-[-80px] mr-[100px] ml-[150px]
          rounded-full bg-gradient-to-br from-[#b91c1c] to-[#7f0f0f] 
          flex items-center justify-center text-white text-[36px] 
          shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
            <FaUser />
      </div>

      {/* Tab Controls */}
      <div className="relative flex h-12 ms-6 mb-6 mt-6 border border-gray-300 rounded-full overflow-hidden z-10">
        <button
          className={`w-1/2 text-lg font-medium transition-all z-10 ${
            isLoginMode ? "text-white" : "text-black"
          }`}
          onClick={() => setIsLoginMode(true)}
        >
          Login
        </button>
        <button
          className={`w-1/2 text-lg font-medium transition-all z-10 ${
            !isLoginMode ? "text-white" : "text-black"
          }`}
          onClick={() => setIsLoginMode(false)}
        >
          Register
        </button>
        <div
          className={`absolute top-0 h-full w-1/2 rounded-full bg-[#9D1414] transition-all pointer-events-none ${
            isLoginMode ? "left-0" : "left-1/2"
          }`}
        ></div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Signup-only Fields */}
        {!isLoginMode && (
          <>
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-[#9D1414] placeholder-gray-400"
            />
            <input
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-[#9D1414] placeholder-gray-400 mt-2"
            />
          </>
        )}

        {/* Shared Fields */}
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
          className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-[#9D1414]  placeholder-gray-400"
        />
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-[#9D1414]  placeholder-gray-400"
        />

        {/* Signup-only Field */}
        {!isLoginMode && (
          <input
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
            className="w-full p-3 border-b-2 border-gray-300 outline-none focus:border-[#9D1414]  placeholder-gray-400"
          />
        )}

        {/* Forgot Password (Only for Login) */}
        {isLoginMode && (
          <div className="text-right">
            <a href="#" className="text-[#9D1414] hover:underline">
              Forgot password?
            </a>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="w-full p-3 bg-[#9D1414] text-white rounded-full text-lg font-medium hover:opacity-90 transition">
          {isLoginMode ? "Login" : "Register"}
        </button>

        {/* Switch Mode Link */}
        <p className="text-center text-gray-600">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsLoginMode(!isLoginMode);
            }}
            className="text-[#9D1414] hover:underline"
          >
            {isLoginMode ? "Register now" : "Login"}
          </a>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
