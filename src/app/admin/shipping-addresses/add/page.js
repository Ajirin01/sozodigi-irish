"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { postData, fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";

const AddShippingAddress = () => {
  const router = useRouter();
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const { user } = useUser();

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const isAdmin = user?.role === "admin"; // Adjust based on your actual role name
  const { addToast } = useToast();

  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  useEffect(() => {
    if (isAdmin) {
      fetchData("users/get-all/no-pagination", token)
        .then((res) => {
            console.log(res); setUsers(res || [])
        })
        .catch(() => alertError("Failed to load users"));
    }
  }, [isAdmin, token]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      address,
      isDefault,
      user: isAdmin ? selectedUser : session?.user?._id,
    };

    try {
      await postData("shipping-addresses", payload, token);
      alertSuccess("Shipping address added successfully!");
      router.push("/admin/shipping-addresses");
    } catch (error) {
      console.error("Error adding address:", error);
      alertError("Failed to add shipping address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Add New Shipping Address
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isAdmin && (
          <div>
            <label className="block font-medium">Select User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-3 border rounded-lg text-gray-500"
              required
            >
              <option value="">-- Select User --</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName+" "+user.lastName || user.email}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Street */}
        <div>
          <label className="block font-medium">Street Address</label>
          <input
            type="text"
            name="street"
            value={address.street}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        {/* City */}
        <div>
          <label className="block font-medium">City</label>
          <input
            type="text"
            name="city"
            value={address.city}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        {/* State */}
        <div>
          <label className="block font-medium">State</label>
          <input
            type="text"
            name="state"
            value={address.state}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        {/* Country */}
        <div>
          <label className="block font-medium">Country</label>
          <input
            type="text"
            name="country"
            value={address.country}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block font-medium">Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={address.postalCode}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        {/* Set as Default */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={() => setIsDefault(!isDefault)}
            className="w-5 h-5"
          />
          <label>Set as Default Address</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600"
        >
          {loading ? "Adding..." : "Add Shipping Address"}
        </button>
      </form>
    </div>
  );
};

export default AddShippingAddress;
