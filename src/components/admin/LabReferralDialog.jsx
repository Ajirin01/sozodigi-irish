import React, { useState } from 'react';
import Dialog from './Dialog';
import PatientHistory from './PatientHistory';

const LabReferralDialog = ({
  showReferrals,
  setShowReferrals,
  labReferrals,
  handleDeleteReferral,
  newReferral,
  setNewReferral,
  handleAddReferral,
  savingReferral,
  patientId,
  token
}) => {
  const [activeTab, setActiveTab] = useState('current');

  if (!showReferrals) return null;

  return (
    <Dialog title="Lab Referrals" onClose={() => setShowReferrals(false)}>
      <div className="flex gap-4 mb-4 border-b">
        <button
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'current' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('current')}
        >
          Add Referral
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {activeTab === 'current' ? (
        <>
          {labReferrals.length > 0 ? (
            <div className="mb-4 space-y-3">
              {labReferrals.map((ref, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl flex justify-between items-start bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="text-sm">
                    <p className="font-bold text-gray-800 dark:text-white">{ref.testName}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">{ref.status}</p>
                    {ref.labName && <p className="text-gray-600 dark:text-gray-400 mt-1">Lab: {ref.labName}</p>}
                    {ref.note && <p className="text-gray-500 dark:text-gray-500 text-xs italic mt-1">"{ref.note}"</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteReferral(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-4 text-sm italic">No lab referrals added in this session.</p>
          )}

          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
            <input
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
              placeholder="Test Name (e.g. Full Blood Count)"
              value={newReferral.testName}
              onChange={(e) => setNewReferral({ ...newReferral, testName: e.target.value })}
            />
            <input
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
              placeholder="Lab Name (optional)"
              value={newReferral.labName}
              onChange={(e) => setNewReferral({ ...newReferral, labName: e.target.value })}
            />
            <input
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
              placeholder="Doctor's Instruction (optional)"
              value={newReferral.note}
              onChange={(e) => setNewReferral({ ...newReferral, note: e.target.value })}
            />
            <select
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
              value={newReferral.status}
              onChange={(e) => setNewReferral({ ...newReferral, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              className="w-full mt-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
              onClick={handleAddReferral}
            >
              {savingReferral ? 'Adding...' : 'Add Lab Referral'}
            </button>
          </div>
        </>
      ) : (
        <PatientHistory userId={patientId} token={token} type="referrals" />
      )}
    </Dialog>
  );
};

export default LabReferralDialog;
