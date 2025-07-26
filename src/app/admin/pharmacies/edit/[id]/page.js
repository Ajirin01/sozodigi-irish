"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchData, updateData } from "@/utils/api";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";

const EditPharmacy = () => {
  const { id } = useParams();
  const pharmacyId = id;

  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({});
  const [error, setError] = useState(null);
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.jwt;

  const { addToast } = useToast();

  const alertSuccess = (msg) => addToast(msg, 'success');
  const alertError = (msg) => addToast(msg, 'error');

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!pharmacyId || !token) return;

    fetchPharmacy();
  }, [pharmacyId, token, sessionStatus]);

  const fetchPharmacy = async () => {
    try {
      setLoading(true);
      const result = await fetchData(`pharmacies/${pharmacyId}`, token);

      // Exclude `employees` and `fees`
      const { employees, pharmacyAdmin, ...filteredData } = result;

      setPharmacy(result); // keep full object if needed elsewhere
      setFormState(filteredData); // only include fields you want to edit
    } catch (err) {
      console.error("Error loading pharmacy:", err);
      setError("Failed to load pharmacy details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested fields like address.city
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

      // Add all form fields
      for (const key in formState) {
        if (key === "address" && typeof formState[key] === "object") {
          for (const subKey in formState.address) {
            formData.append(`address[${subKey}]`, formState.address[subKey]);
          }
        } else {
          formData.append(key, formState[key]);
        }
      }

      const response = await updateData(`pharmacies/custom/update/${pharmacyId}`, formData, token, true); // true = formData mode
      console.log(response);
      alertSuccess("Pharmacy record updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alertError("Failed to update pharmacy record!");
    }
  };

  if (loading) return <p>Loading pharmacy info...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-white/[0.05]">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Edit Pharmacy</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pharmacy Name */}
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

        {/* License Image Upload */}
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

        {/* Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Street</label>
            <input
              type="text"
              name="address.street"
              value={formState.address?.street || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">City</label>
            <input
              type="text"
              name="address.city"
              value={formState.address?.city || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">State</label>
            <input
              type="text"
              name="address.state"
              value={formState.address?.state || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Country</label>
            <input
              type="text"
              name="address.country"
              value={formState.address?.country || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
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

        {/* License Image Preview */}
        {pharmacy?.licenseFile && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">License Image Preview</p>
            <div className="w-[220px] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <Image
                src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${pharmacy.licenseFile}`}
                alt="License"
                width={220}
                height={130}
                className="rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition duration-200"
          >
            Update Pharmacy
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPharmacy;
