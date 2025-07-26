"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Yes, Delete",
  cancelText = "Cancel" 
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-99999999999">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white rounded-lg p-6 text-center shadow-lg">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-600" />
          <DialogTitle className="text-lg font-semibold text-gray-900 mt-2">
            {title}
          </DialogTitle>
          <p className="text-gray-700 mt-4">{message}</p>
          <div className="mt-6 flex justify-center space-x-4">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }} 
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              {confirmText}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
