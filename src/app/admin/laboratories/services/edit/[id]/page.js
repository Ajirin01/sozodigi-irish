"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchData, updateData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";

const EditLabServicePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [laboratory, setLaboratory] = useState("");
  const [laboratories, setLaboratories] = useState([]);
  const [status, setStatus] = useState("available");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [labs, service] = await Promise.all([
          fetchData("/laboratories/get-all/no-pagination", token),
          fetchData(`/lab-services/${id}`, token),
        ]);

        setLaboratories(labs);
        setName(service.name || "");
        setDescription(service.description || "");
        setPrice(service.price?.toString() || "");
        setLaboratory(service.laboratory || "");
        setStatus(service.status || "available");
      } catch (err) {
        console.error("Failed to load data:", err);
        alertError("Failed to load service details.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id && token) {
      loadInitialData();
    }
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price || !laboratory) return;

    setLoading(true);
    try {
      await updateData(
        `/lab-services/${id}`,
        {
          name,
          description,
          price: parseFloat(price),
          laboratory,
          status,
        },
        token
      );
      alertSuccess("Lab service updated successfully!");
    } catch (error) {
      console.error("Failed to update lab service:", error);
      alertError("Failed to update lab service!");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800">
      <h1 className="text-2xl font-semibold mb-4">Edit Lab Service</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block font-medium mb-1">Service Name *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block font-medium mb-1">Price (₦) *</label>
          <input
            type="number"
            step="0.01"
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        {/* Laboratory */}
        <div>
          <label className="block font-medium mb-1">Laboratory *</label>
          <select
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            value={laboratory}
            onChange={(e) => setLaboratory(e.target.value)}
            required
          >
            <option value="">Select a laboratory</option>
            {laboratories.map((lab) => (
              <option key={lab._id} value={lab._id}>
                {lab.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block font-medium mb-1">Status</label>
          <select
            className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Updating..." : "Update Service"}
        </button>
      </form>
    </div>
  );
};

export default EditLabServicePage;
