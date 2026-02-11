import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the root element where the React application will be mounted.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to.");
}

// Create a root and render the App component within React's StrictMode.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);