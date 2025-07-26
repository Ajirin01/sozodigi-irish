import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CircleLoader } from "react-spinners";

export default function LoadingOverlay({ isLoading = false }) {
  return (
    <Transition show={isLoading} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        open={isLoading}
        onClose={() => {}} // Prevent backdrop click from doing anything
      >
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center">
          <CircleLoader color="#4F46E5" size={60} />
        </div>
      </Dialog>
    </Transition>
  );
}
