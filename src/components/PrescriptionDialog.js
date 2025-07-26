import { useState, useEffect } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon, LinkIcon } from "@heroicons/react/24/outline";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";


const PrescriptionDialog = ({ isOpen, onClose, selectedItem, onLinkPrescription }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [fullscreenImage, setFullscreenImage] = useState(null); // For fullscreen view
  const { data: session } = useSession();
  const token = session?.user?.jwt;

  useEffect(() => {
    if (isOpen) {
      const fetchPrescriptions = async () => {
        try {
          const response = await fetchData("prescriptions/user/all", token);
          console.log(response)
          setPrescriptions(response.prescriptions || []); // Ensure we have an array
        } catch (error) {
          console.error("Error fetching prescriptions:", error);
          setPrescriptions([]); // Set to an empty array on error
        }
      };
      fetchPrescriptions();
    }
  }, [isOpen, token]);

  return (
    <>
      {/* Fullscreen Image View */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-20 flex items-center justify-center">
          <img
            src={fullscreenImage}
            alt="Fullscreen Prescription"
            className="max-h-[90%] max-w-[90%] object-contain"
          />
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>
      )}

      {/* Dialog for linking prescriptions */}
      <Dialog open={isOpen} onClose={onClose} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-medium text-gray-900">Link a Prescription</DialogTitle>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">Select a prescription to link with this item.</p>

            {/* Display fetched prescriptions as thumbnails */}
            {prescriptions.length > 0 ? (
              <ul className="mt-4 grid grid-cols-2 gap-4">
                {prescriptions.map((prescription) => (
                  <li key={prescription._id} className="flex flex-col items-center justify-between">
                    <img
                      src={
                        prescription.fileUrl.startsWith("http")
                          ? prescription.fileUrl
                          : `${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${prescription.fileUrl}`
                      }
                      alt={`Prescription #${prescription._id}`}
                      className="w-24 h-24 object-cover border rounded-md cursor-pointer mb-2"
                      onClick={() => setFullscreenImage(prescription.fileUrl.startsWith("http")
                        ? prescription.fileUrl
                        : `${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${prescription.fileUrl}`)}
                    />
                    <div className="flex justify-between w-full">
                      <span className="text-gray-700 text-xs">#{prescription._id.slice(-4)}</span>
                      <button
                        onClick={() => onLinkPrescription(selectedItem, prescription._id)}
                        className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700"
                      >
                        Link
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-gray-500 text-sm">No prescriptions available Or prescriptions expired. Please upload a prescription.</p>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default PrescriptionDialog;
