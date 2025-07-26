import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef } from "react";
import { PhoneIncoming, X } from "lucide-react";

export default function IncomingCallDialog({ appointment, onAccept, onReject }) {
  const ringtoneRef = useRef(null);

  useEffect(() => {
    ringtoneRef.current = new Audio("/sounds/ringtone.mp3");
    ringtoneRef.current.loop = true;
    ringtoneRef.current.play().catch(() => {});

    return () => {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    };
  }, []);

  return (
    <Transition appear show={!!appointment} as={Fragment}>
      <Dialog as="div" className="relative z-99999999999" onClose={() => onReject()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                Incoming Video Call
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Appointment ID: <strong>{appointment?.appointmentId}</strong>
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={onReject}
                  className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  <X size={16} />
                  Reject
                </button>
                <button
                  onClick={onAccept}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                >
                  <PhoneIncoming size={16} />
                  Accept
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
