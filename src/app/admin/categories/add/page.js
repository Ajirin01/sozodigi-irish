"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { postData } from "@/utils/api";
import { useSession } from "next-auth/react";

const AddCategory = () => {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

//   console.log(token)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        postData("categories", { name: categoryName }, token, false)

        alert("Category added successfully!");
        router.push("/admin/categories");
    } catch (error) {
        console.error("Error adding category:", error);
        alert("Failed to add category");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
        Add New Category
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <button
          type="submit"
          className="w-full bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
