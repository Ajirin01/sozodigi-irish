// src/context/ToastContext.js
"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-9999999999999 space-y-2 flex flex-col items-end">
        {toasts.map((toast, index) => (
          <div
            key={index}
            className={`relative max-w-sm w-full flex items-center p-4 mb-2 text-white text-sm rounded-lg shadow-xl animate-slide-in-right backdrop-blur-md bg-gray-800/90 
            ${
              toast.type === "success"
                ? "border-l-4 border-green-500"
                : toast.type === "error"
                ? "border-l-4 border-red-500"
                : "border-l-4 border-blue-500"
            }`}
            onClick={() => removeToast(toast.id)} // Click to remove early
          >
            <span className="mr-3 text-lg">
              {toast.type === "success" && "✅"}
              {toast.type === "error" && "❌"}
              {toast.type === "info" && "ℹ️"}
            </span>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 text-white opacity-70 hover:opacity-100"
            >
              ✖️
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
