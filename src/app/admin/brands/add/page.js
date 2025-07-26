"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { postData } from "@/utils/api";
import { useSession } from "next-auth/react";

const AddBrand = () => {
  const router = useRouter();
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(null);
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brandName.trim() || !description.trim()) {
      alert("Brand name and description are required!");
      return;
    }

    const formData = new FormData();
    formData.append("name", brandName);
    formData.append("description", description);
    formData.append("status", status);
    if (logo) formData.append("logo", logo);

    console.log(formData)

    setLoading(true);

    try {
        postData("brands/create", formData, token, true)
      alert("Brand added successfully!");

      router.push("/admin/brands");
    } catch (error) {
      console.error("Error adding brand:", error);
      alert("Failed to add brand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="max-w-lg w-full bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
          Add New Brand
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand Name */}
          <div>
            <label htmlFor="brand-name" className="block font-medium text-gray-700 dark:text-gray-300">
              Brand Name
            </label>
            <input
              id="brand-name"
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter brand name"
              required
            />
          </div>

          {/* Brand Description */}
          <div>
            <label htmlFor="brand-description" className="block font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="brand-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter brand description"
              rows="3"
              required
            />
          </div>

          {/* Brand Logo Upload */}
          <div>
            <label htmlFor="brand-logo" className="block font-medium text-gray-700 dark:text-gray-300">
              Brand Logo
            </label>
            <input
              id="brand-logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files[0])}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Brand Status */}
          <div>
            <label htmlFor="brand-status" className="block font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              id="brand-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Brand"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBrand;
