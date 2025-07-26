"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  XMarkIcon,
  ShoppingBagIcon,
  TrashIcon,
  PaperClipIcon,
  CloudArrowUpIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { postData } from "@/utils/api";
import { useSession } from "next-auth/react";
import PrescriptionDialog from "./PrescriptionDialog";
import { useToast } from "@/context/ToastContext";
import ConfirmationDialog from "@/components/ConfirmationDialog";

export default function MiniCart() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, updateCartItem, removeFromCart, refreshCart } = useCart();
  const [prescriptions, setPrescriptions] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();

  const cartItems = cart?.items || [];

  const subtotal = cartItems.reduce((total, item) => {
    return total + (Math.round(Number(item.price)) || 0) * (Number(item.quantity) || 0);
  }, 0);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await removeFromCart(itemToDelete._id);
      setIsDialogOpen(false);
      refreshCart();
    } catch (error) {
      alertError("Failed to delete the item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrescriptionUpload = async (event, itemId) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);

    setPrescriptions((prev) => ({
      ...prev,
      [itemId]: file,
    }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemId", itemId);

    try {
      const response = await postData("prescriptions/upload", formData, token, true);

      if (response) {
        alertSuccess("Prescription uploaded successfully!");
        refreshCart();
      } else {
        alertError("Failed to upload prescription.");
        setPrescriptions((prev) => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
      }
    } catch (error) {
      console.error("Error uploading prescription:", error);
      setPrescriptions((prev) => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkPrescription = async (cartItemId, prescriptionId) => {
    setIsLoading(true);
    try {
      const response = await postData("cart/link-prescription", { cartItemId, prescriptionId }, token);
      alertSuccess("Prescription linked successfully!");
      refreshCart();
      setIsPrescriptionDialogOpen(false);
    } catch (error) {
      console.error("Error linking prescription:", error);
      alertError("Failed to link prescription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkPrescription = async (cartItemId) => {
    setIsLoading(true);
    try {
      await postData("cart/unlink-prescription", { cartItemId }, token);
      refreshCart();
      alertSuccess("Prescription unlinked successfully!");
    } catch (error) {
      console.error("Error unlinking prescription:", error);
      alertError("Failed to unlink prescription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="relative p-2 text-gray-700 hover:text-gray-900">
        <ShoppingBagIcon className="h-6 w-6" />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {cartItems.length}
          </span>
        )}
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel className="pointer-events-auto w-screen max-w-md transform transition">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl relative">
                  
                  {/* Localized MiniCart Loading Spinner */}
                  {isLoading && (
                    <div className="absolute inset-0 z-50 bg-white/70 flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-lg font-medium text-gray-900">Shopping Cart</DialogTitle>
                      <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-500">
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mt-8">
                      {cartItems.length > 0 ? (
                        <ul className="-my-6 divide-y divide-gray-200">
                          {cartItems.map((item) => (
                            <li key={item._id} className="flex flex-col py-6">
                              <div className="flex">
                                <div className="h-24 w-24 overflow-hidden rounded-md border border-gray-200">
                                  <img
                                    src={
                                      item.product?.photo?.startsWith("http")
                                        ? item.product?.photo
                                        : `${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${item.product?.photo}`
                                    }
                                    alt={item.product?.name || "Product image"}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/images/lab-test.jpg";
                                    }}
                                  />
                                </div>
                                <div className="ml-4 flex flex-1 flex-col">
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>{item.product?.name}</h3>
                                    <p className="ml-4">₦{Math.round(item.product?.price) * item.quantity}</p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center space-x-2 border px-3 py-1 rounded-md">
                                      {item.productType === "Medication" && (
                                        <>
                                          <button
                                            className="text-gray-600 hover:text-gray-900"
                                            onClick={async () => {
                                              if (item.quantity > 1) {
                                                setIsLoading(true);
                                                try {
                                                  await updateCartItem(item._id, item.quantity - 1);
                                                } catch (err) {
                                                  alertError("Failed to update item quantity.");
                                                } finally {
                                                  setIsLoading(false);
                                                }
                                              }
                                            }}
                                          >
                                            −
                                          </button>
                                          <span>{item.quantity}</span>
                                          <button
                                            className="text-gray-600 hover:text-gray-900"
                                            onClick={async () => {
                                              setIsLoading(true);
                                              try {
                                                await updateCartItem(item._id, item.quantity + 1);
                                              } catch (err) {
                                                alertError("Failed to update item quantity.");
                                              } finally {
                                                setIsLoading(false);
                                              }
                                            }}
                                          >
                                            +
                                          </button>
                                        </>
                                      )}

                                    </div>
                                    <button
                                      className="text-gray-400 hover:text-red-500"
                                      onClick={() => {
                                        setIsDialogOpen(true);
                                        setItemToDelete(item);
                                      }}
                                    >
                                      <TrashIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {item.product?.prescriptionRequired && (
                                <div className="mt-4 grid grid-cols-2 gap-4 items-center">
                                  <div>
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                      <PaperClipIcon className="h-5 w-5 text-gray-500" />
                                      <span>Prescription Required</span>
                                    </label>
                                    <div className="mt-2 flex items-center space-x-3">
                                      {!item.prescription ? (
                                        <>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handlePrescriptionUpload(e, item._id)}
                                            className="hidden"
                                            id={`prescription-${item._id}`}
                                          />
                                          <label
                                            htmlFor={`prescription-${item._id}`}
                                            className="relative cursor-pointer flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-md hover:bg-indigo-700 transition-all duration-200"
                                            style={{ fontSize: ".6rem" }}
                                          >
                                            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                            {prescriptions[item._id] ? "Change Prescription" : "Upload Prescription"}
                                          </label>
                                        </>
                                      ) : (
                                        <span className="text-green-600 font-medium flex items-center" style={{ fontSize: ".6rem" }}>
                                          ✅ Prescription Linked{" "}
                                          <span className="text-gray-400"> / {item.prescriptionLinkStatus}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-end items-center space-x-4">
                                    {!item.prescription ? (
                                      <button
                                        onClick={() => {
                                          setSelectedItem(item._id);
                                          setIsPrescriptionDialogOpen(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800 flex items-center"
                                        style={{ fontSize: ".7rem" }}
                                      >
                                        <LinkIcon className="h-5 w-5 mr-1" />
                                        Link Prescription
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleUnlinkPrescription(item._id)}
                                        className="text-red-600 hover:text-red-800 flex items-center text-xs"
                                        style={{ fontSize: ".7rem" }}
                                      >
                                        <LinkIcon className="h-5 w-5 mr-1" />
                                        Unlink Prescription
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-gray-500">Your cart is empty.</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>₦{subtotal}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                    <div className="mt-6">
                      <Link href="/checkout">
                        <button
                          className="w-full rounded-md bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 disabled:bg-gray-400"
                          disabled={cartItems.some(
                            (item) =>
                              item.product?.prescriptionRequired &&
                              item.prescriptionLinkStatus !== "approved"
                          )}
                        >
                          Checkout
                        </button>
                      </Link>
                      <button type="button" onClick={() => setIsOpen(false)} className="text-indigo-600 hover:text-indigo-500">
                        Continue Shopping →
                      </button>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Link Prescription Dialog */}
      {isPrescriptionDialogOpen && (
        <PrescriptionDialog
          isOpen={isPrescriptionDialogOpen}
          onClose={() => setIsPrescriptionDialogOpen(false)}
          selectedItem={selectedItem}
          onLinkPrescription={handleLinkPrescription}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.product?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="No, Keep"
      />
    </>
  );
}
