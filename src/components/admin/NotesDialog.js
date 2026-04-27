import React, { useState } from 'react';
import Dialog from './Dialog';
import PatientHistory from './PatientHistory';

const NotesDialog = ({
  showDocs,
  setShowDocs,
  sessionNotes,
  setSessionNotes,
  handleSaveNotes,
  savingNotes,
  patientId,
  token
}) => {
  const [activeTab, setActiveTab] = useState('current');

  if (!showDocs) return null;

  return (
    <Dialog title="Consultation Documentation" onClose={() => setShowDocs(false)}>
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
            className="w-full h-48 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            placeholder="Enter notes here..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
          />
          <button
            className="mt-4 w-full bg-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-100"
            onClick={handleSaveNotes}
            disabled={savingNotes}
          >
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </button>
        </>
      ) : (
        <PatientHistory userId={patientId} token={token} type="notes" />
      )}
    </Dialog>
  );
};

export default NotesDialog;
