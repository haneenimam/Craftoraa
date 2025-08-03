import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './Context/LanguageContext';
import { CartProvider } from './Context/CartContext'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { AuthProvider } from './Context/Auth'; 

ReactDOM.createRoot(document.getElementById('root')).render(
 <React.StrictMode>
    <LanguageProvider>
      <CartProvider>
        <AuthProvider> 
          <App />
        </AuthProvider>
      </CartProvider>
    </LanguageProvider>
  </React.StrictMode>
);


