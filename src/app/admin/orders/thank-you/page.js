"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ThankYouPage = () => {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Retrieve order details from session or state (you may want to fetch from the API here)
    const orderData = sessionStorage.getItem("newOrderBasket");
    if (orderData) {
      setOrderDetails(JSON.parse(orderData));
    }
  }, []);

  const handleGoHome = () => {
    router.push("/"); // Navigate to the homepage
  };

  const handleViewOrders = () => {
    router.push("/admin/orders"); // Navigate to the orders page
  };

  const calculateTotalPrice = () => {
    return orderDetails?.reduce((total, item) => total + item.price * (item.quantity || 1), 0);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Thank You for Your Order!</h2>

      {orderDetails ? (
        <>
          <p className="text-lg">Your order has been successfully submitted. Below are the details:</p>

          <ul className="space-y-4 mt-4">
            {orderDetails.map((item) => (
              <li key={item._id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">Price: ${item.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Quantity: {(item.quantity || 1)}</p>
                </div>
                <p className="text-sm text-gray-900">
                  ${(item.price * (item.quantity || 1)).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center mt-4 text-lg font-medium text-gray-900">
            <span>Total</span>
            <span>${calculateTotalPrice()?.toFixed(2)}</span>
          </div>

          <div className="mt-6 space-x-4">
            <button
              onClick={handleGoHome}
              className="bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Return to Home
            </button>
            <button
              onClick={handleViewOrders}
              className="bg-gray-700 text-white px-4 py-2 rounded"
            >
              View My Orders
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">Loading your order details...</p>
      )}
    </div>
  );
};

export default ThankYouPage;
