"use client";

import { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onCancel,
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
  requireIndemnity = false,
  indemnityMessage = "I agree for this session to be ended and understand that this action cannot be undone."
}) {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all m-4">
        <div className="flex justify-center mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold leading-6 text-gray-900 text-center">
          {title}
        </h3>
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-700">{message}</p>
        </div>

        {requireIndemnity && (
          <div className="mt-4 flex items-start text-left bg-gray-50 p-3 rounded-md border border-gray-200">
            <input
              type="checkbox"
              id="indemnityAgreement"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <label htmlFor="indemnityAgreement" className="ml-2 block text-sm text-gray-700 cursor-pointer">
              {indemnityMessage}
            </label>
          </div>
        )}

        <div className="mt-6 flex justify-center space-x-4">
          <button 
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
              onClose();
            }} 
            className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={() => {
              if (requireIndemnity && !isChecked) return;
              onConfirm();
              // Removed onClose() here, so clicking confirm doesn't falsely trigger close/cancel logic
            }} 
            disabled={requireIndemnity && !isChecked}
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none ${
              requireIndemnity && !isChecked 
                ? "bg-red-400 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
