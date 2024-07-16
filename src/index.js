import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css'; // Import the global CSS
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SelectedRecipesProvider } from './contexts/SelectedRecipesContext'; // Import the SelectedRecipesProvider
import { AuthProvider } from './contexts/AuthContext'; // Import the AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SelectedRecipesProvider>
        <App />
      </SelectedRecipesProvider>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
