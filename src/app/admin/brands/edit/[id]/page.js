"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchData, updateData } from "@/utils/api";

const EditCategory = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  
  const [brand, setBrand] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // To preview selected image
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  // Fetch brand details
  useEffect(() => {
    const getCategory = async () => {
      try {
        const data = await fetchData(`brands/${id}`, token);
        setBrand(data);
        setName(data.name);
        setDescription(data.description);
        setStatus(data.status || "active");
      } catch (error) {
        console.error("Error fetching brand:", error);
      }
    };

    if (id && token) getCategory();
  }, [id, token]);

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Create preview URL
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert("Name and description are required!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("status", status);
    if (image) formData.append("logo", image);

    setLoading(true);

    try {
      await updateData(`brands/update/${id}`, formData, token, true);
      alert("Brand updated successfully!");
      router.push("/admin/brands");
    } catch (error) {
      console.error("Error updating brand:", error);
      alert("Failed to update brand");
    } finally {
      setLoading(false);
    }
  };

  if (!brand) return <p>Loading brand details...</p>;

  return (
    <div className="h-full flex items-center justify-center">
      <div className="max-w-lg w-full bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
          Edit Brand
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300">
              Brand Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>

          {/* Brand Image (Preview Old and New) */}
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300">
              Brand Image
            </label>

            {/* Existing Logo Preview */}
            {brand.image && !imagePreview && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Existing Image:</p>
                <img
                  src={
                    brand.image.startsWith("http")
                      ? brand.image
                      : `${process.env.NEXT_PUBLIC_NODE_BASE_URL}${brand.image}`
                  }
                  alt="Existing Brand"
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
              </div>
            )}

            {/* New Image Preview */}
            {imagePreview && (
              <div>
                <p className="text-sm text-gray-500 mb-2">New Selected Image:</p>
                <img
                  src={imagePreview}
                  alt="New Preview"
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
              </div>
            )}

            {/* File Input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
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
            {loading ? "Updating..." : "Update Brand"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
