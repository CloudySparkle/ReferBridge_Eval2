import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../sidebar-collapse.css';
import '../index.css';
import '../dashboard.css';
import '../network.css';
import '../requests.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
