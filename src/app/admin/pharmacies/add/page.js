"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { postData, fetchData } from "@/utils/api";

const CreatePharmacy = () => {
  const [users, setUsers] = useState([]); // State to hold users

  const [formState, setFormState] = useState({
    name: '',
    licenseFile: null,
    contactNumber: '',
    contactEmail: '', // Added contactEmail to state
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
    },
    pharmacyAdmin: '',
    status: 'unverified', // Default value for status
  });

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await fetchData("users/get-all/no-pagination", token); // Adjust if required
        console.log(usersData);
        setUsers(usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
        alertError("Failed to load users.");
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]); // Depend on token, so it re-fetches when token changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormState((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      for (const key in formState) {
        if (key === "address" && typeof formState[key] === "object") {
          for (const subKey in formState.address) {
            formData.append(`address[${subKey}]`, formState.address[subKey]);
          }
        } else {
          formData.append(key, formState[key]);
        }
      }

      const response = await postData(`pharmacies/custom/create`, formData, token, true);
      console.log(response);
      alertSuccess("Pharmacy created successfully!");
      // optionally redirect or clear form
    } catch (err) {
      console.error("Create error:", err);
      alertError("Failed to create pharmacy.");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-white/[0.05]">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Create Pharmacy</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Pharmacy Name</label>
          <input
            type="text"
            name="name"
            value={formState.name || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* License Upload */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">License Image</label>
          <input
            type="file"
            name="licenseFile"
            accept="application/pdf, image/png, image/jpeg, image/jpg"
            onChange={(e) => {
              const file = e.target.files[0];
              setFormState((prev) => ({ ...prev, licenseFile: file }));
            }}
            className="w-full text-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={formState.contactNumber || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Contact Email</label>
          <input
            type="email"
            name="contactEmail"
            value={formState.contactEmail || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["street", "city", "state", "country"].map((field) => (
            <div key={field}>
              <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">
                {field}
              </label>
              <input
                type="text"
                name={`address.${field}`}
                value={formState.address?.[field] || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              />
            </div>
          ))}
        </div>

        {/* Pharmacy Admin */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Pharmacy Admin</label>
          <select
            name="pharmacyAdmin"
            value={formState.pharmacyAdmin || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          >
            <option value="">Select Admin</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Status</label>
          <select
            name="status"
            value={formState.status || "unverified"}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          >
            <option value="unverified">Unverified</option>
            <option value="verified">Verified</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition duration-200"
          >
            Create Pharmacy
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePharmacy;
