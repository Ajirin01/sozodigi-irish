import Dialog from './Dialog';

const LabReferralDialog = ({
  showReferrals,
  setShowReferrals,
  labReferrals,
  handleDeleteReferral,
  newReferral,
  setNewReferral,
  handleAddReferral,
  savingReferral
}) => {
  if (!showReferrals) return null;

  return (
    <Dialog title="Lab Referrals" onClose={() => setShowReferrals(false)}>
      {labReferrals.length > 0 ? (
        <div className="mb-4 space-y-3">
          {labReferrals.map((ref, index) => (
            <div
              key={index}
              className="p-2 border-b flex justify-between items-start"
            >
              <div className="text-sm">
                <p><strong>{ref.testName}</strong> ({ref.status})</p>
                {ref.labName && <p className="text-gray-600">Lab: {ref.labName}</p>}
                {ref.note && <p className="text-gray-500 text-xs">{ref.note}</p>}
              </div>
              <button
                onClick={() => handleDeleteReferral(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-4">No lab referrals yet.</p>
      )}

      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Test Name"
        value={newReferral.testName}
        onChange={(e) => setNewReferral({ ...newReferral, testName: e.target.value })}
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Lab Name (optional)"
        value={newReferral.labName}
        onChange={(e) => setNewReferral({ ...newReferral, labName: e.target.value })}
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Note (optional)"
        value={newReferral.note}
        onChange={(e) => setNewReferral({ ...newReferral, note: e.target.value })}
      />
      <select
        className="w-full mb-2 p-2 border rounded"
        value={newReferral.status}
        onChange={(e) => setNewReferral({ ...newReferral, status: e.target.value })}
      >
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <button
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleAddReferral}
      >
        {savingReferral ? 'Adding Referral...' : 'Add Lab Referral'}
      </button>
    </Dialog>
  );
};

export default LabReferralDialog;
