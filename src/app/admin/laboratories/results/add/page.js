"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchData, postData } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import {  useUser } from "@/context/UserContext";

export default function AddLabResultPage() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    userId: "",
    orderId: "",
    status: "pending",
    comments: "",
    file: null,
  });

  const { user } = useUser()

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      if (!token) return; // Ensure token is set
      try {
        const data = await fetchData("users/get-all/no-pagination", token);
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    loadUsers();
  }, [token]);
  

  useEffect(() => {
    const loadOrders = async () => {
      if (!form.userId) return setOrders([]);
      try {
        const data = await fetchData(`orders/get/user/custom?userId=${form.userId}&category=LabService`, token);
        console.log(data)
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders", err);
        setOrders([]);
      }
    };
    loadOrders();
  }, [form.userId, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { userId, orderId, file, status, comments } = form;
  
    if (!userId || !orderId || !file) {
      addToast("Please fill all required fields", "error");
      return;
    }
  
    const formData = new FormData();
    formData.append("user", userId);
    formData.append("order", orderId);
    formData.append("status", status);
    formData.append("comments", comments);
    formData.append("uploadedBy", user._id);
    formData.append("resultFile", file); // 👈 Match expected field name
  
    try {
      await postData("/lab-results/custom/create", formData, token, true); // `true` means multipart/form-data
      addToast("Lab result uploaded successfully", "success");
      router.push("/admin/laboratories/results");
    } catch (err) {
      console.error(err);
      addToast("Failed to upload lab result", "error");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 shadow">
      <h1 className="text-2xl font-bold mb-4">Add Lab Result</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Patient</label>
          <select
            name="userId"
            value={form.userId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
            required
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.firstName +" "+ user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Order</label>
          <select
            name="orderId"
            value={form.orderId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
            required
          >
            <option value="">Select an order</option>
            {orders.map((order) => (
              <option key={order._id} value={order._id}>
                {order._id} - {new Date(order.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Result File</label>
          <input
            type="file"
            accept="application/pdf,image/*"
            name="file"
            onChange={handleChange}
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Comments</label>
          <textarea
            name="comments"
            value={form.comments}
            onChange={handleChange}
            rows="3"
            className="w-full border px-3 py-2 rounded"
            placeholder="Optional comments"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
