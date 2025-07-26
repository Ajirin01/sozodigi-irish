"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchData } from "@/utils/api"; // Using custom API utility

const AddProduct = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    pharmacy: "",
    prescriptionRequired: false,
    status: "available",
    photo: null,
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch categories, brands, and pharmacies
  useEffect(() => {
    const fetchDataFromAPI = async () => {
      try {
        const [categoryRes, brandRes, pharmacyRes] = await Promise.all([
          fetchData("categories/get-all/no-pagination"),
          fetchData("brands/get-all/no-pagination"),
          fetchData("pharmacies/get-all/no-pagination"),
        ]);
        setCategories(categoryRes);
        setBrands(brandRes);
        setPharmacies(pharmacyRes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDataFromAPI();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle file upload with preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      await fetchData("/api/medications", {
        method: "POST",
        body: formDataToSend,
      });

      alert("Medication added successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error adding medication:", error);
      alert("Failed to add medication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Add New Medication</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-medium">Medication Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter medication name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Enter medication description"
            required
          ></textarea>
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter price"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter stock quantity"
              required
            />
          </div>
        </div>

        {/* Category, Brand & Pharmacy */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "category", label: "Category", options: categories },
            { name: "brand", label: "Brand", options: brands },
            { name: "pharmacy", label: "Pharmacy", options: pharmacies },
          ].map(({ name, label, options }) => (
            <div key={name}>
              <label className="block text-gray-700 font-medium">{label}</label>
              <select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select {label}</option>
                {options.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Prescription & Status */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="prescriptionRequired"
              checked={formData.prescriptionRequired}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-gray-700 font-medium">Prescription Required</span>
          </label>
          <div>
            <label className="block text-gray-700 font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="available">Available</option>
              <option value="out of stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-gray-700 font-medium">Product Image</label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-3 border rounded-lg"
            required
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-lg shadow-md" />
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Medication"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
