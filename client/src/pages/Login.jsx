import React, { useState } from 'react';
import { login, googleLogin } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../assets/google-svg.svg';
import showIcon from '../assets/show.png';
import hideIcon from '../assets/hide.png';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loggedUser = await login(email, password);
      // Retrieve additional user data from Firestore
      const docRef = doc(db, "users", loggedUser.uid);
      const userProfileSnap = await getDoc(docRef);
      if (userProfileSnap.exists()) {
        const userProfile = userProfileSnap.data();
        console.log('Logged in user:', { ...loggedUser, ...userProfile });
      } else {
        console.log('Logged in user:', loggedUser);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const loggedUser = await googleLogin();
      // Retrieve additional user data from Firestore (if exists)
      const docRef = doc(db, "users", loggedUser.uid);
      const userProfileSnap = await getDoc(docRef);
      if (userProfileSnap.exists()) {
        const userProfile = userProfileSnap.data();
        console.log('Logged in user:', { ...loggedUser, ...userProfile });
      } else {
        console.log('Logged in user:', loggedUser);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#121212] relative">
      {/* Company Logo and Name on Top Left */}
      <div className="absolute top-0 left-4 m-4 flex items-center">
        <img
          src="/logo.png"
          alt="Company Logo"
          className="w-10 h-10"
        />
        <h1 className="text-2xl font-bold text-[#E0E0E0] ml-2">CodeCollab</h1>
      </div>
      {/* Login Container */}
      <div className="flex items-center justify-center py-20">
        <div className="bg-[#1E1E1E] py-10 px-8 sm:px-10 rounded-lg shadow-lg w-full max-w-lg">
          {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
          <h2 className="text-center text-3xl font-bold text-[#E0E0E0] mb-6">Login</h2>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-[#B0BEC5]">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Envelope SVG */}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  className="appearance-none rounded-md block w-full pl-10 pr-3 py-2 border border-[#2C3E50] placeholder-[#B0BEC5] text-[#E0E0E0] bg-transparent focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#B0BEC5]">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Lock SVG */}
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="appearance-none rounded-md block w-full pl-10 pr-10 py-2 border border-[#2C3E50] placeholder-[#B0BEC5] text-[#E0E0E0] bg-transparent focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    type="button" 
                    onClick={toggleShowPassword} 
                    className="focus:outline-none"
                  >
                    <img 
                      src={showPassword ? hideIcon : showIcon} 
                      alt={showPassword ? "Hide password" : "Show password"} 
                      className="h-5 w-5" 
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#4A90E2] focus:ring-[#4A90E2] border-[#2C3E50] rounded"
                />
                <label className="ml-2 block text-sm text-[#B0BEC5]">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-[#F0F0F0] hover:underline">
                  Forgot your password?
                </a>
              </div>
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[#121212] bg-gradient-to-r from-[#4A90E2] to-[#50E3C2] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A90E2]"
            >
              Login
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
                onClick={handleGoogleLogin}
                className="flex items-center justify-center w-full px-4 py-2 border border-[#2C3E50] rounded-md text-sm font-medium text-[#B0BEC5] bg-[#121212] hover:bg-[#2A2A2A]"
              >
                <img src={googleLogo} alt="Google Logo" className="h-5 w-5 mr-2" />
                Google
              </button>
            </div>
            <p className="mt-4 text-center text-[#B0BEC5]">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-500 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
      {/* Footer - Inspired from Home.jsx */}
      <footer className="text-[#B0BEC5] text-xs md:text-sm text-center pb-4">
        &copy; {new Date().getFullYear()} Real-Time Code Editor. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Login;