import { useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import googleLogo from "../assets/google-svg.svg";
import { register } from "../utils/auth";
import { db } from "../utils/firebase";
import { doc, setDoc } from "firebase/firestore";

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const user = await register(email, password);
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
      });
      navigate('/login')
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] relative">
      {/* Header with Logo */}
      <div className="absolute top-0 left-4 m-4 flex items-center">
        <img
          src="/logo.png" // Replace with your logo path if different
          alt="Company Logo"
          className="w-10 h-10"
        />
        <h1 className="text-2xl font-bold text-[#E0E0E0] ml-2">CodeCollab</h1>
      </div>
      {/* Signup Container */}
      <div className="flex items-center justify-center pt-20 pb-9">
        <div className="bg-[#1E1E1E] py-10 px-8 sm:px-10 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-center text-3xl font-bold text-[#E0E0E0] mb-6">
            Signup
          </h2>
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-[#B0BEC5]">
                Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#B0BEC5]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.66 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="appearance-none rounded-md block w-full pl-10 pr-3 py-2 border border-[#2C3E50] placeholder-[#B0BEC5] text-[#E0E0E0] bg-transparent focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
                />
              </div>
            </div>
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-[#B0BEC5]">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#B0BEC5]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="appearance-none rounded-md block w-full pl-10 pr-3 py-2 border border-[#2C3E50] placeholder-[#B0BEC5] text-[#E0E0E0] bg-transparent focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
                />
              </div>
            </div>
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-[#B0BEC5]">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#B0BEC5]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c.832 0 1.5.668 1.5 1.5v3a1.5 1.5 0 11-3 0v-3c0-.832.668-1.5 1.5-1.5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 11V7a5 5 0 00-10 0v4"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="appearance-none rounded-md block w-full pl-10 pr-3 py-2 border border-[#2C3E50] placeholder-[#B0BEC5] text-[#E0E0E0] bg-transparent focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[#121212] bg-gradient-to-r from-[#4A90E2] to-[#50E3C2] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2]"
            >
              Sign Up
            </button>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2C3E50]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1E1E1E] text-[#B0BEC5]">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="flex items-center justify-center w-full px-4 py-2 border border-[#2C3E50] rounded-md text-sm font-medium text-[#B0BEC5] bg-[#121212] hover:bg-[#2A2A2A]"
              >
                <img
                  src={googleLogo}
                  alt="Google Logo"
                  className="h-5 w-5 mr-2"
                />
                Google
              </button>
            </div>
            <p className="mt-4 text-center text-[#B0BEC5]">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      <footer className="text-[#B0BEC5] text-xs md:text-sm text-center pb-4">
        &copy; {new Date().getFullYear()} Real-Time Code Editor. All Rights Reserved.
      </footer>
    </div>
  );
}