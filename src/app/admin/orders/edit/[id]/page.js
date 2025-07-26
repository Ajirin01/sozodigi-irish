"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchData, updateData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";

const EditOrderPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const [order, setOrder] = useState(null);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    status: "",
    paymentStatus: "",
    paymentReference: "",
    shippingAddress: "",
  });

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  useEffect(() => {
    if (!token || !id) return;

    const loadOrder = async () => {
      try {
        const data = await fetchData(`orders/custom/${id}`, token);
        const orderData = data.order;
        setOrder(orderData);

        // Fetch user shipping addresses
        const addressRes = await fetchData(
          `shipping-addresses/user/${orderData.user?._id}`,
          token
        );
        const addresses = addressRes.addresses || [];
        setShippingAddresses(addresses);

        // Determine shipping address
        const currentShippingId = orderData.shippingAddress;
        const defaultAddress = addresses.find((a) => a.address?.isDefault);

        setFormData({
          status: orderData.status || "",
          paymentStatus: orderData.paymentStatus || "",
          paymentReference: orderData.paymentReference || "",
          shippingAddress: currentShippingId || defaultAddress?._id || "",
        });
      } catch (error) {
        console.error("Failed to load order or addresses:", error);
        alertError("Could not fetch order or shipping addresses");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [token, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateData(`orders/${id}`, formData, token);
      alertSuccess("Order updated successfully");
      router.push("/admin/orders");
    } catch (error) {
      console.error("Error updating order:", error);
      alertError("Failed to update order");
    }
  };

  if (loading) return <p>Loading order...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Order</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Order Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Status</label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Reference</label>
          <input
            type="text"
            name="paymentReference"
            value={formData.paymentReference}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Shipping Address</label>
          <select
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">Select Address</option>
            {shippingAddresses.map((address) => (
              <option key={address._id} value={address._id}>
                {address.address.street} – {address.address.city} - {address.address.state}
                {address.address.isDefault ? " (Default)" : ""}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Update Order
        </button>
      </form>
    </div>
  );
};

export default EditOrderPage;
