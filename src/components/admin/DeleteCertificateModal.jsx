"use client";
import React, { useState } from "react";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";

const DeleteCertificateModal = ({ isOpen, onClose, onConfirm, certID }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (inputValue !== certID) {
      setError(`Please type ${certID} exactly to confirm.`);
      return;
    }
    onConfirm();
    setInputValue("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mb-4">
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Serious Confirmation</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Deleting a medical certificate is a permanent action and will invalidate all verified copies.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                To confirm, please type <span className="text-red-600 font-extrabold">{certID}</span> below:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError("");
              }}
              placeholder={certID}
              className={`w-full p-4 border rounded-2xl outline-none transition-all dark:bg-gray-900 ${
                error ? "border-red-500 ring-4 ring-red-50" : "border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-red-50"
              }`}
            />
            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleConfirm}
              className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FaTrash /> Delete Permanently
            </button>
            <button
              onClick={onClose}
              className="px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCertificateModal;
