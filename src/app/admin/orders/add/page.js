"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { fetchData, postData } from "@/utils/api";
import { useRouter } from "next/navigation";

const OrderCreationPage = () => {
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState("");
  const [status, setStatus] = useState("pending");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentReference, setPaymentReference] = useState("");

  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  useEffect(() => {
    if (!token) return;

    const loadUsersAndItems = async () => {
      try {
        const [usersData, itemsData] = await Promise.all([
          fetchData("/users", token),
          fetchData("/products", token), // Replace with your actual item endpoint
        ]);
        setUsers(usersData);
        setItems(itemsData);
      } catch (error) {
        alertError("Failed to load users or items");
      }
    };

    loadUsersAndItems();
  }, [token]);

  const handleItemChange = (itemId, field, value) => {
    const updated = selectedItems.map((item) =>
      item._id === itemId ? { ...item, [field]: value } : item
    );
    setSelectedItems(updated);
  };

  const handleAddItem = (item) => {
    if (!selectedItems.find((i) => i._id === item._id)) {
      setSelectedItems([...selectedItems, { ...item, quantity: 1, price: item.price || 0 }]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter((item) => item._id !== itemId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || selectedItems.length === 0 || !totalAmount) {
      return alertError("Please fill all required fields");
    }

    try {
      await postData(
        "/orders/create/manual",
        {
          user: selectedUser,
          items: selectedItems.map(({ _id, quantity, price, category }) => ({
            product: _id,
            quantity,
            price,
            category,
          })),
          totalAmount,
          status,
          paymentStatus,
          paymentReference,
        },
        token
      );

      alertSuccess("Order created successfully");
      router.push("/admin/orders");
    } catch (error) {
      alertError("Failed to create order");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Create Order</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1">User</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Add Items</label>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <button
                type="button"
                key={item._id}
                onClick={() => handleAddItem(item)}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="space-y-4">
            {selectedItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 border p-2 rounded"
              >
                <span className="flex-1">{item.name}</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(item._id, "quantity", +e.target.value)
                  }
                  className="w-16 border p-1 rounded"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(item._id, "price", +e.target.value)
                  }
                  className="w-20 border p-1 rounded"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item._id)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block mb-1">Total Amount</label>
          <input
            type="number"
            step="0.01"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="flex gap-4">
          <div>
            <label className="block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1">Payment Reference</label>
          <input
            type="text"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition-all"
        >
          Create Order
        </button>
      </form>
    </div>
  );
};

export default OrderCreationPage;
