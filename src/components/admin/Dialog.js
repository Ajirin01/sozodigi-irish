const Dialog = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-99999999999 bg-black/50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">
            ×
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
  
  export default Dialog;
  