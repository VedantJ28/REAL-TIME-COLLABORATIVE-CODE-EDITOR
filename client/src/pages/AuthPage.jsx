import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen flex">
      {/* Left side illustration for large screens */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 justify-center items-center">
        <div className="max-w-md p-4">
          <svg
            className="w-full h-auto"
            viewBox="0 0 500 500"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M100,300 C150,200 350,200 400,300 L400,500 L100,500 Z" 
              fill="#ffffff" 
              opacity="0.3"
            />
            <circle cx="250" cy="250" r="80" fill="#ffffff" opacity="0.5" />
          </svg>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-white">
            Welcome Back!
          </h2>
          <p className="mt-2 text-center text-lg text-gray-200">
            Join us and collaborate with other users.
          </p>
        </div>
      </div>

      {/* Right side form container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-6 py-2 text-xl ${
                activeTab === 'login'
                  ? 'font-extrabold border-b-2 border-indigo-600 text-gray-900'
                  : 'font-medium text-gray-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-6 py-2 text-xl ${
                activeTab === 'register'
                  ? 'font-extrabold border-b-2 border-indigo-600 text-gray-900'
                  : 'font-medium text-gray-600'
              }`}
            >
              Register
            </button>
          </div>
        </div>
        <div className="mt-8 mx-auto w-full max-w-md">
          {activeTab === 'login' ? <Login /> : <Register />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;