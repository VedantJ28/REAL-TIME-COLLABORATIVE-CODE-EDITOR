import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="auth-page">
      <div className="auth-tabs">
        <button
          onClick={() => setActiveTab('login')}
          style={{ fontWeight: activeTab === 'login' ? 'bold' : 'normal' }}
        >
          Login
        </button>
        <button
          onClick={() => setActiveTab('register')}
          style={{ fontWeight: activeTab === 'register' ? 'bold' : 'normal' }}
        >
          Register
        </button>
      </div>
      <div className="auth-form">
        {activeTab === 'login' ? <Login /> : <Register />}
      </div>
    </div>
  );
};

export default AuthPage;