import React, { useState } from 'react';
import Dialog from './Dialog';
import PatientHistory from './PatientHistory';

const PrescriptionDialog = ({
  showPrescriptions,
  setShowPrescriptions,
  prescriptions,
  handleDeletePrescription,
  newPrescription,
  setNewPrescription,
  handleAddPrescription,
  savingPrescription,
  patientId,
  token
}) => {
  const [activeTab, setActiveTab] = useState('current');

  if (!showPrescriptions) return null;

  return (
    <Dialog title="Prescriptions" onClose={() => setShowPrescriptions(false)}>
      <div className="flex gap-4 mb-4 border-b">
        <button
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'current' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('current')}
        >
          Add Prescription
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {activeTab === 'current' ? (
        <>
          {prescriptions.length > 0 ? (
            <div className="mb-4">
              {prescriptions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-xl mb-2 bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{item.medication}</p>
                    <p className="text-sm text-gray-600">
                      {item.dosage} – {item.frequency}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePrescription(index)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-4 text-sm italic">No prescriptions added in this session.</p>
          )}

          <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <input
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Medication Name"
              value={newPrescription.medication}
              onChange={(e) =>
                setNewPrescription({ ...newPrescription, medication: e.target.value })
              }
            />
            <input
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Dosage (e.g. 500mg)"
              value={newPrescription.dosage}
              onChange={(e) =>
                setNewPrescription({ ...newPrescription, dosage: e.target.value })
              }
            />
            <input
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Frequency (e.g. Twice Daily)"
              value={newPrescription.frequency}
              onChange={(e) =>
                setNewPrescription({ ...newPrescription, frequency: e.target.value })
              }
            />
            <button
              className="w-full mt-2 bg-green-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
              onClick={handleAddPrescription}
            >
              {savingPrescription ? 'Adding...' : 'Add Prescription'}
            </button>
          </div>
        </>
      ) : (
        <PatientHistory userId={patientId} token={token} type="prescriptions" />
      )}
    </Dialog>
  );
};

export default PrescriptionDialog;
