import Dialog from './Dialog';

const PrescriptionDialog = ({
  showPrescriptions,
  setShowPrescriptions,
  prescriptions,
  handleDeletePrescription,
  newPrescription,
  setNewPrescription,
  handleAddPrescription,
  savingPrescription
}) => {
  if (!showPrescriptions) return null;

  return (
    <Dialog title="Prescriptions" onClose={() => setShowPrescriptions(false)}>
      {prescriptions.length > 0 ? (
        <div className="mb-4">
          {prescriptions.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border-b mb-2"
            >
              <div>
                <p className="font-semibold">{item.medication}</p>
                <p className="text-sm text-gray-600">
                  {item.dosage} – {item.frequency}
                </p>
              </div>
              <button
                onClick={() => handleDeletePrescription(index)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-4">No prescriptions yet.</p>
      )}

      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Medication"
        value={newPrescription.medication}
        onChange={(e) =>
          setNewPrescription({ ...newPrescription, medication: e.target.value })
        }
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Dosage"
        value={newPrescription.dosage}
        onChange={(e) =>
          setNewPrescription({ ...newPrescription, dosage: e.target.value })
        }
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Frequency"
        value={newPrescription.frequency}
        onChange={(e) =>
          setNewPrescription({ ...newPrescription, frequency: e.target.value })
        }
      />
      <button
        className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={handleAddPrescription}
      >
        {savingPrescription ? 'Adding Prescription...' : 'Add Prescription'}
      </button>
    </Dialog>
  );
};

export default PrescriptionDialog;
