"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/context/ToastContext";
import { postData, fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";

const ReviewOrderPage = () => {
  const router = useRouter();
  const { addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const [basket, setBasket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const selectedUser = typeof window !== "undefined" ? sessionStorage.getItem("newOrderUser") : null;
  const selectedOrderType = typeof window !== "undefined" ? sessionStorage.getItem("newOrderType") : null;

  useEffect(() => {
    if (!selectedUser) {
      addToast("No user selected. Please select a user to place the order.", "error");
      router.push("/admin/orders/start");
    } else {
      fetchUserData(selectedUser);
    }
  }, [router, selectedUser]);

  const fetchUserData = async (userId) => {
    try {
      const response = await fetchData(`users/${userId}`, token);
      setUser(response);
    } catch (err) {
      console.error(err);
      addToast("Error fetching user details. Please try again.", "error");
    }
  };

  useEffect(() => {
    const storedBasket = selectedOrderType === "Medication"? sessionStorage.getItem("newOrderBasket") : sessionStorage.getItem("newLabOrderBasket");
    if (storedBasket) {
      setBasket(JSON.parse(storedBasket));
    }
    setLoading(false);
  }, []);

  const handleQuantityChange = (itemId, quantity) => {
    setBasket((prev) =>
      prev.map((item) =>
        item._id === itemId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const removeFromBasket = (itemId) => {
    const updatedBasket = basket.filter((item) => item._id !== itemId);
    setBasket(updatedBasket);
    sessionStorage.setItem("newOrderBasket", JSON.stringify(updatedBasket));
    addToast("Item removed from basket", "warning");
  };

  const calculateTotalPrice = () => {
    return basket.reduce((total, item) => total + item.price * (item.quantity || 1), 0);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    if (basket.length === 0) {
      addToast("Your basket is empty, add items before proceeding", "error");
      return;
    }

    const isMedication = selectedOrderType === "Medication";
    const isLabService = selectedOrderType === "LabService";

    const orderItems = basket.map((item) => {
      const base = {
        quantity: item.quantity || 1,
        price: item.price,
      };

      if (isMedication || isLabService) {
        return { ...base, product: item._id };
      }else {
        throw new Error("Unknown order type");
      }
    });

    const orderData = {
      user: selectedUser,
      category: selectedOrderType,
      placedBy: session?.user?.id,
      items: orderItems,
      totalAmount: calculateTotalPrice(),
      paymentStatus: "pending",
      paymentReference: "",
    };

    try {
      await postData("orders/create/manual", orderData, token);
      addToast("Order submitted successfully", "success");
      setIsSubmitting(false);
      sessionStorage.setItem("newOrderBasket", JSON.stringify(basket));
      router.push("/admin/orders/thank-you");
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      addToast("Failed to submit order. Please try again.", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Review Your Order</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          {basket.length === 0 ? (
            <p className="text-gray-500">No items in your basket.</p>
          ) : (
            <div className="space-y-4">
              {user && (
                <p className="text-xl sm:text-2xl font-bold">
                  Order summary for {user.firstName?.toUpperCase()} {user.lastName?.toUpperCase()}
                </p>
              )}

              <ul>
                {basket.map((item) => (
                  <li key={item._id} className="flex justify-between items-center border-b pb-2 pt-2">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Price: ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) =>
                          handleQuantityChange(item._id, parseInt(e.target.value, 10))
                        }
                        className="w-12 p-1 border rounded"
                        disabled={!item.quantity}
                      />
                      <button onClick={() => removeFromBasket(item._id)}>
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center mt-4 text-lg font-medium text-gray-900">
                <span>Total</span>
                <span>${calculateTotalPrice().toFixed(2)}</span>
              </div>

              <button
                className="bg-indigo-700 text-white px-4 py-2 text-sm rounded w-full mt-4"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex justify-center items-center">
                    <div className="w-4 h-4 border-2 border-t-2 border-white rounded-full animate-spin"></div>
                  </div>
                ) : (
                  'Confirm Order'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewOrderPage;
