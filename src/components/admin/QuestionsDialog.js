import Dialog from './Dialog';

const QuestionsDialog = ({
  showQuestions,
  setShowQuestions,
  healthQuestions,
  loadingQuestions
}) => {
  if (!showQuestions) return null;

  return (
    <Dialog title="Patient Health Questions" onClose={() => setShowQuestions(false)}>
      {loadingQuestions ? (
        <p>Loading health questions...</p>
      ) : healthQuestions ? (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {Object.entries(healthQuestions).map(([sectionKey, sectionValue]) => {
            if (typeof sectionValue === "object" && sectionValue !== null) {
              return (
                <div key={sectionKey}>
                  <h3 className="text-lg font-bold capitalize text-blue-800 dark:text-blue-300">
                    {sectionKey.replace(/([A-Z])/g, ' $1')}
                  </h3>
                  <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300">
                    {Object.entries(sectionValue).map(([key, value]) => (
                      <li key={key}>
                        {key.replace(/([A-Z])/g, ' $1')}: {" "}
                        <span className={value ? "text-green-600 font-semibold" : "text-gray-500"}>
                          {value ? "Yes" : "No"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <p>No health questions found for this patient.</p>
      )}
    </Dialog>
  );
};

export default QuestionsDialog;
