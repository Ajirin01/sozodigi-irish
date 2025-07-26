"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchData, postData, updateData } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";
import { useParams } from "next/navigation"; // Importing useParams

export default function EditLabResultPage() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    status: "pending",
    comments: "",
    file: null,
    resultFileUrl: "",
  });
  const { user } = useUser();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const router = useRouter();
  const { addToast } = useToast();

  const params = useParams();  // Use useParams to access dynamic route params

  // Fetch lab result to edit based on the passed ID (from params)
  useEffect(() => {
    const loadLabResult = async () => {
      if (!params.id || !token) return;
      try {
        const data = await fetchData(`lab-results/${params.id}`, token);
        setForm({
          userId: data.user._id,
          orderId: data.order._id,
          status: data.status,
          comments: data.comments || "",
          resultFileUrl: data.resultFile,
        });
      } catch (err) {
        console.error("Failed to fetch lab result", err);
        addToast("Failed to load lab result", "error");
      }
    };
    loadLabResult();
  }, [params.id, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {file, status, comments } = form;

    const formData = new FormData();
    formData.append("status", status);
    formData.append("comments", comments);
    formData.append("uploadedBy", user._id);
    if (file) formData.append("resultFile", file); // Append file if it's updated

    try {
      await updateData(`lab-results/custom/update/${params.id}`, formData, token, true); // multipart/form-data
      addToast("Lab result updated successfully", "success");
      router.push("/admin/laboratories/results");
    } catch (err) {
      console.error(err);
      addToast("Failed to update lab result", "error");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Lab Result</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Result File</label>
          {form.resultFileUrl && (
            <div>
              <a href={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}${form.resultFileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                View Current File
              </a>
            </div>
          )}
          <input
            type="file"
            accept="application/pdf,image/*"
            name="file"
            onChange={handleChange}
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
