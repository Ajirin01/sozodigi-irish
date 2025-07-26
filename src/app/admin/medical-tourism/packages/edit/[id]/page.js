"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { fetchData, updateData } from "@/utils/api";
import Link from "next/link";

const EditMedicalTourismPackagePage = () => {
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

  const [existingPhoto, setExistingPhoto] = useState(null);

  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

  useEffect(() => {
    const loadPackage = async () => {
      try {
        const data = await fetchData(`tour/${id}`);
        setForm({
          name: data.name,
          description: data.description,
          price: data.price,
          location: data.location,
          duration: data.duration,
          services: data.services.join(", "),
          status: data.status,
          photo: null,
        });
        setExistingPhoto(`${process.env.NEXT_PUBLIC_NODE_BASE_URL}${data.photo}`);
      } catch (error) {
        console.error("Failed to load package", error);
      }
    };

    if (id) loadPackage();
  }, [id]);

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
      if (form.photo) formData.append("photo", form.photo);
      form.services.split(",").forEach((service) => {
        formData.append("services[]", service.trim());
      });

      await updateData(`tour/update/custom/${id}`, formData, token, true);
      addToast("Package updated successfully!", "success");
      router.push("/admin/medical-tourism/packages");
    } catch (error) {
      console.error("Error updating package:", error);
      addToast("Failed to update package", "error");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 shadow">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Edit Medical Tourism Package</h1>
        <Link
          href="/admin/medical-tourism/packages"
          className="text-indigo-600 hover:underline"
        >
          Back
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
        {["name", "description", "price", "location", "duration", "services"].map((field) => (
          <div key={field}>
            <label className="block font-medium mb-1 capitalize">{field.replace("services", "Services (comma separated)")}</label>
            {field === "description" ? (
              <textarea
                name={field}
                value={form[field]}
                onChange={handleChange}
                rows="3"
                className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
              />
            ) : (
              <input
                type={field === "price" ? "number" : "text"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
              />
            )}
          </div>
        ))}

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
          {existingPhoto && (
            <div className="mb-2">
              <img src={existingPhoto} alt="Existing" className="w-32 h-32 object-cover rounded" />
            </div>
          )}
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-gray-600 dark:text-gray-300"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditMedicalTourismPackagePage;
