"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { postData, fetchData } from "@/utils/api";
import { useUser } from "@/context/UserContext";

const CreatePharmacy = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userId = session?.user?._id;
  const userRole = session?.user?.role;

  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useUser()

  const [formState, setFormState] = useState({
    name: '',
    licenseFile: null,
    contactNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
    },
    labAdmin: userRole === "labAdmin" ? userId : '',
    status: 'unverified',
  });

  // Fetch users if not labAdmin
  useEffect(() => {
    if (token && userRole !== "labAdmin") {
      fetchData("users/get-all/no-pagination", token)
        .then((usersData) => setUsers(usersData || []))
        .catch((err) => {
          console.error("Error fetching users:", err);
          alertError("Failed to load users.");
        });
    }
  }, [token, userRole]);

  // Auto assign labAdmin and check if they already have a lab
  useEffect(() => {
    const checkLabAdminLab = async () => {
      if (token && userRole === "labAdmin" && userId) {
        try {
          const labs = await fetchData(`laboratories/get-all/no-pagination`, token);
          const existingLab = labs?.labs?.find((lab) => lab.labAdmin === userId);

          if (existingLab) {
            alertSuccess("You already have a laboratory created.");
            router.push("/dashboard");
            return;
          }

          setFormState((prev) => ({ ...prev, labAdmin: userId }));
        } catch (err) {
          console.error("Lab admin lab check failed:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkLabAdminLab();
  }, [token, userRole, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
      formData.append("name", formState.name);
      formData.append("contactNumber", formState.contactNumber);
      formData.append("labAdmin", userRole === "labAdmin" ? user._id : formState.labAdmin);

      if (userRole !== "labAdmin") {
        formData.append("status", formState.status);
      }

      if (formState.licenseFile) {
        formData.append("license", formState.licenseFile);
      }

      Object.entries(formState.address).forEach(([key, value]) => {
        formData.append(`address[${key}]`, value);
      });

      await postData(`laboratories/custom/create`, formData, token, true);
      alertSuccess("Laboratory created successfully!");
      router.push("/admin");
    } catch (err) {
      console.error("Create error:", err);
      alertError("Failed to create laboratory.");
    }
  };

  if (loading) return <p className="p-4 text-gray-500">Checking lab admin status...</p>;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-white/[0.05]">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Create Laboratory</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Laboratory Name</label>
          <input
            type="text"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">License Image</label>
          <input
            type="file"
            name="licenseFile"
            accept="application/pdf,image/png,image/jpeg,image/jpg"
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, licenseFile: e.target.files[0] }))
            }
            className="w-full text-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={formState.contactNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["street", "city", "state", "country"].map((field) => (
            <div key={field}>
              <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">
                {field}
              </label>
              <input
                type="text"
                name={`address.${field}`}
                value={formState.address?.[field] || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              />
            </div>
          ))}
        </div>

        {/* LabAdmin - Always visible */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Laboratory Admin</label>
          <select
            name="labAdmin"
            value={formState.labAdmin}
            onChange={handleInputChange}
            disabled={userRole === "labAdmin"}
            className={`w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ${
              userRole === "labAdmin" ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {userRole !== "labAdmin" && <option value="">Select Admin</option>}

            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName}
              </option>
            ))}

            {userRole === "labAdmin" && (
              <option value={userId}>
                You ({user?.firstName} {user?.lastName})
              </option>
            )}
          </select>

          {userRole === "labAdmin" && (
            <p className="text-sm text-gray-500 mt-1">Automatically set to your account</p>
          )}
        </div>

        {userRole !== "labAdmin" && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Status</label>
            <select
              name="status"
              value={formState.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            >
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl"
          >
            Create Laboratory
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePharmacy;
