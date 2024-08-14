import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from "./App";
import {DarkModeContextProvider} from "./Home/context/darkModeContext";
import {AuthContextProvider} from "./Home/context/authContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <DarkModeContextProvider>
          <AuthContextProvider>
              <App />
          </AuthContextProvider>
      </DarkModeContextProvider>
  </React.StrictMode>
);
