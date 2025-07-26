"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchData } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

const StartOrderPage = () => {
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const router = useRouter();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [orderType, setOrderType] = useState("");

  useEffect(() => {
    if (!token) return;

    const loadUsers = async () => {
      try {
        const data = await fetchData("users/get-all/no-pagination", token);
        setUsers(data);
      } catch (error) {
        addToast("Failed to load users", "error");
      }
    };

    loadUsers();
  }, [token]);

  const handleNext = () => {
    if (!selectedUser || !orderType) {
      return addToast("Select user and order type", "error");
    }

    // Persist selections in sessionStorage
    sessionStorage.setItem("newOrderUser", selectedUser); // Save selected user
    sessionStorage.setItem("newOrderType", orderType);    // Save order type

    // Navigate to next step based on the order type
    router.push(
      orderType === "Medication"
        ? "/admin/orders/create/medication"
        : "/admin/orders/create/lab"
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Start New Order</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Select User</label>
          <select
            className="w-full border p-2 rounded text-gray-500"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">-- Select --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Order Type</label>
          <div className="flex gap-4">
            <button
              type="button"
              className={`px-4 py-2 rounded border ${
                orderType === "Medication"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800"
              }`}
              onClick={() => setOrderType("Medication")}
            >
              Medication
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded border ${
                orderType === "LabService"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800"
              }`}
              onClick={() => setOrderType("LabService")}
            >
              Lab Service
            </button>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="bg-indigo-600 text-white px-6 py-2 rounded mt-4 hover:bg-indigo-700"
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default StartOrderPage;
