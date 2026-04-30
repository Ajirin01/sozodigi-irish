import React, { useState } from 'react';
import Dialog from './Dialog';
import PatientHistory from './PatientHistory';
import HospitalSelectionTable from './HospitalSelectionTable';

const NotesDialog = ({
  showDocs,
  setShowDocs,
  sessionNotes,
  setSessionNotes,
  handleSaveNotes,
  savingNotes,
  patientId,
  token,
  isMedicalTourism,
  setIsMedicalTourism,
  recommendedHospital,
  setRecommendedHospital,
  hospitals
}) => {
  const [activeTab, setActiveTab] = useState('current');

  if (!showDocs) return null;

  return (
    <Dialog title="Consultation Documentation" onClose={() => setShowDocs(false)} size="2xl">
      <div className="flex gap-4 mb-4 border-b">
        <button
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'current' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('current')}
        >
          Current Notes
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {activeTab === 'current' ? (
        <>
          <textarea
            className="w-full h-32 p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Enter clinical notes here..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
          />
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800">
            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
              <span className="text-lg">🌍</span> Medical Tourism Recommendation
            </h4>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={isMedicalTourism}
                    onChange={(e) => setIsMedicalTourism(e.target.checked)}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 transition-colors">
                  Recommend patient for Medical Tourism
                </span>
              </label>

              {isMedicalTourism && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                  <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider ml-1">
                    Search & Select Recommended Hospital
                  </label>
                  
                  <HospitalSelectionTable 
                    token={token}
                    selectedHospitalId={recommendedHospital}
                    onSelect={setRecommendedHospital}
                  />

                  <p className="mt-2 text-[10px] text-blue-500 italic">
                    Flagging this will notify the medical tourism team to assist the patient with the selected facility.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            className="mt-6 w-full bg-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2"
            onClick={handleSaveNotes}
            disabled={savingNotes}
          >
            {savingNotes ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Documentation'
            )}
          </button>
        </>
      ) : (
        <PatientHistory userId={patientId} token={token} type="notes" />
      )}
    </Dialog>
  );
};

export default NotesDialog;
