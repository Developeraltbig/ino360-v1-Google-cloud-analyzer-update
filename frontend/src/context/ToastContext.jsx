// frontend/src/context/ToastContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/toast.css';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', delay = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, delay }]);
    
    // Auto remove toast after delay
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, delay);
  };

  const closeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, delay = 3000) => showToast(message, 'success', delay);
  const showError = (message, delay = 4000) => showToast(message, 'danger', delay);
  const showInfo = (message, delay = 3000) => showToast(message, 'info', delay);
  const showWarning = (message, delay = 3000) => showToast(message, 'warning', delay);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
      {children}
      <ToastContainer 
        className="position-fixed p-3" 
        position="top-end" 
        style={{ zIndex: 9999 }}
      >
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            onClose={() => closeToast(toast.id)} 
            bg={toast.type}
            delay={toast.delay}
            autohide
          >
            <Toast.Header closeButton>
              <strong className="me-auto">
                {toast.type === 'success' ? 'Success' : 
                 toast.type === 'danger' ? 'Error' : 
                 toast.type === 'warning' ? 'Warning' : 'Info'}
              </strong>
            </Toast.Header>
            <Toast.Body className={toast.type === 'danger' || toast.type === 'dark' ? 'text-white' : ''}>
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};
