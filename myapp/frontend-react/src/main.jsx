import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ИМПОРТИРУЕМ НАШ ГЛАВНЫЙ КОМПОНЕНТ APP
import './index.css';

// Находим корневой элемент в index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендерим компонент App. Вся логика, включая роутер, теперь находится внутри App.jsx
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
