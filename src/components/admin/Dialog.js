const Dialog = ({ title, children, onClose, size = "lg" }) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full mx-4"
  };

  return (
    <div className="fixed inset-0 z-99999999999 bg-black/50 flex justify-center items-center backdrop-blur-sm p-4">
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl ${sizeClasses[size] || sizeClasses.lg} w-full animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-xl font-bold dark:text-white text-gray-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto pr-1 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};
  
  export default Dialog;
  