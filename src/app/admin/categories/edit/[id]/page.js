"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchData, updateData } from "@/utils/api";
import { useSession } from "next-auth/react";

const EditCategory = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  // Fetch category details if editing
  useEffect(() => {
    if (id && token) {
      const getCategory = async () => {
        try {
          const data = await fetchData(`categories/${id}`, token);
          setCategoryName(data.name);
          setDescription(data.description);
          setStatus(data.status || "active");
          setImagePreview(data.image ? `${process.env.NEXT_PUBLIC_NODE_BASE_URL}${data.image}` : null);
        } catch (error) {
          console.error("Error fetching category:", error);
        }
      };
      getCategory();
    }
  }, [id, token]);

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Preview new image
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Update existing category
        await updateData(`categories/${id}`, {name: categoryName}, token, false);
        alert("Category updated successfully!");
      
        router.push("/admin/categories");
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
        {id ? "Edit Category" : "Add New Category"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter category name"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (id ? "Updating..." : "Adding...") : id ? "Update Category" : "Add Category"}
        </button>
      </form>
    </div>
  );
};

export default EditCategory;
