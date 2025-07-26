import Dialog from './Dialog';

const NotesDialog = ({
  showDocs,
  setShowDocs,
  sessionNotes,
  setSessionNotes,
  handleSaveNotes,
  savingNotes
}) => {
  if (!showDocs) return null;

  return (
    <Dialog title="Consultation Documentation" onClose={() => setShowDocs(false)}>
      <textarea
        className="w-full h-32 p-2 border rounded"
        placeholder="Enter notes here..."
        value={sessionNotes}
        onChange={(e) => setSessionNotes(e.target.value)}
      />
      <button
        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        onClick={handleSaveNotes}
        disabled={savingNotes}
      >
        {savingNotes ? 'Saving...' : 'Save Notes'}
      </button>
    </Dialog>
  );
};

export default NotesDialog;
