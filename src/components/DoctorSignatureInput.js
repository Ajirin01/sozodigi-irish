import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

const DoctorSignatureInput = ({ onSignature }) => {
  const sigCanvasRef = useRef(null);
  const [trimmedDataURL, setTrimmedDataURL] = useState(null);

  const handleClear = () => {
    sigCanvasRef.current.clear();
    setTrimmedDataURL(null);
    onSignature(null); // Optional: notify parent
  };

  const handleSave = () => {
    if (!sigCanvasRef.current.isEmpty()) {
      const dataURL = sigCanvasRef.current.getCanvas().toDataURL("image/png");
      setTrimmedDataURL(dataURL);
      onSignature(dataURL); // Pass signature image back to parent
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-semibold">Draw Signature</label>
      <div className="border border-gray-300 rounded-md bg-white">
        <SignatureCanvas
          penColor="black"
          canvasProps={{ width: 400, height: 150, className: "rounded-md" }}
          ref={sigCanvasRef}
        />
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Save
        </button>
      </div>

      {trimmedDataURL && (
        <div className="mt-3">
          <p className="text-sm text-gray-600">Saved Preview:</p>
          <img src={trimmedDataURL} alt="Saved Signature" className="border mt-1 h-20" />
        </div>
      )}
    </div>
  );
};

export default DoctorSignatureInput;
