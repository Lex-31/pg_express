import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import LoginForm from './components/LoginForm'; // Assuming LoginForm is in components
import RegistrationForm from './components/RegistrationForm'; // Assuming RegistrationForm is in components

import './index.css'; // Keep or remove based on your project needs

// A simple component to hold the login and registration forms
const LoginPage = () => (
  <>
    <h2>Вход</h2>
    <LoginForm />
    <h2>Регистрация</h2>
    <RegistrationForm />
  </>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Optional: Add a route for the root path that redirects or shows login */}
        {/* <Route path="/" element={<LoginPage />} /> */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
