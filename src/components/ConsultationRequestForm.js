import { useState } from "react";
import { ClockIcon, DollarSignIcon, CheckCircleIcon } from "lucide-react";

export default function ConsultationRequestForm({ handleSubmit, handleChange, formData, submitting, calculatedCost }) {
    return (
    <form className="space-y-6 bg-white p-6 rounded-xl shadow dark:bg-gray-900 dark:text-gray-300" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          {[15, 30, 40, 60].map((min) => {
            const isActive = formData.duration === min.toString();
            const price = min * 2; // Customize pricing logic
            return (
              <div
                key={min}
                onClick={() => handleChange({ target: { name: "duration", value: min.toString() } })}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400"
                    : "bg-white text-gray-900 border-gray-200 hover:shadow-md hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold">{min} Minutes</h4>
                  {isActive && <CheckCircleIcon className="w-5 h-5 text-white" />}
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm">
                  <ClockIcon className="w-4 h-4" />
                  <span>{min} mins session</span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm">
                  <DollarSignIcon className="w-4 h-4" />
                  <span>${price.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      
        <div className="text-sm text-gray-700 dark:bg-gray-900 dark:text-white">
            Estimated Cost: <span className="font-semibold text-gray-900 dark:text-white">${calculatedCost}</span>
        </div>

        <div>
            <button
            type="submit"
            disabled={submitting || calculatedCost <= 0}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
            {submitting ? 'Submitting...' : 'Pay Now'}
            </button>
        </div>
    </form>
  );
}
