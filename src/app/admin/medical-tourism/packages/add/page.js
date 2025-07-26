"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { postData } from "@/utils/api";
import Link from "next/link";

const AddMedicalTourismPackagePage = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    location: "",
    duration: "",
    services: "",
    status: "available",
    photo: null,
  });

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const { addToast } = useToast();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setForm((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("location", form.location);
      formData.append("duration", form.duration);
      formData.append("status", form.status);
      formData.append("photo", form.photo);
      form.services.split(",").forEach((service) => {
        formData.append("services[]", service.trim());
      });

      await postData("tour/create/custom", formData, token, true);
      addToast("Package created successfully!", "success");
      router.push("/admin/medical-tourism/packages");
    } catch (error) {
      console.error("Error creating package:", error);
      addToast("Failed to create package", "error");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 shadow">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Add Medical Tourism Package</h1>
        <Link
          href="/admin/medical-tourism/packages"
          className="text-indigo-600 hover:underline"
        >
          Back
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
        <div>
          <label className="block font-medium mb-1">Package Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Price (USD)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Duration</label>
          <input
            type="text"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Services (comma separated)</label>
          <input
            type="text"
            name="services"
            value={form.services}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
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
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Package Photo</label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleChange}
            required
            className="w-full text-gray-600 dark:text-gray-300"
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
};

export default AddMedicalTourismPackagePage;
