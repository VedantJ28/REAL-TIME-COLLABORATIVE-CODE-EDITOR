import React, { useState } from 'react';
import { login, googleLogin } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../assets/google-svg.svg'; // Importing the local SVG
import showIcon from '../assets/show.png'; // Import the show PNG
import hideIcon from '../assets/hide.png'; // Import the hide PNG

const Login = () => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate                   = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      console.log('Logged in user:', user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await googleLogin();
      console.log('Logged in with Google:', user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="bg-white py-10 px-8 shadow-lg rounded-lg sm:px-10">
      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
      <form className="space-y-6 mt-6" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* Envelope SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="appearance-none rounded-md relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter your email address"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* Lock SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c.832 0 1.5.668 1.5 1.5v3a1.5 1.5 0 11-3 0v-3c0-.832.668-1.5 1.5-1.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 11V7a5 5 0 00-10 0v4" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="appearance-none rounded-md relative block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter your password"
            />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button 
                type="button" 
                onClick={toggleShowPassword} 
                className="relative z-10 focus:outline-none"
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
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </div>
      </form>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button 
            onClick={handleGoogleLogin}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <img src={googleLogo} alt="Google Logo" className="h-5 w-5 mr-2" />
            Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;