"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { postData } from "@/utils/api";
import { Editor } from "@tinymce/tinymce-react";

const AddBlog = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    featuredImage: null, // Track selected image file
    isPublished: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleEditorChange = (content, editor) => {
    setFormData((prev) => ({
      ...prev,
      content: content,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    form.append("title", formData.title);
    form.append("content", formData.content);
    form.append("tags", formData.tags);
    form.append("isPublished", formData.isPublished);
    form.append("author", session?.user?.id);

    // Add the featured image if selected
    if (formData.featuredImage) {
      form.append("featuredImage", formData.featuredImage);
    }

    try {
      const res = await postData("blogs/custom/create", form, token, true);
      addToast("Blog added successfully!", "success");
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error adding blog:", error);
      addToast("Failed to add blog", "error");
    } finally {
      setLoading(false);
    }
  };

  const imageUploadHandler = async (blobInfo, success, failure) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const imageDataUrl = reader.result; // This is the base64 Data URL of the image
      if (imageDataUrl) {
        success(imageDataUrl); // Insert image as base64 Data URL into the content
      } else {
        failure("Image upload failed");
      }
    };
  
    reader.onerror = () => {
      failure("Failed to read the image file");
    };
  
    // Read the image file as a Data URL
    reader.readAsDataURL(blobInfo.blob()); 
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-4">Add New Blog</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" encType="multipart/form-data">
        <input
          name="title"
          placeholder="Blog Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="p-3 border rounded-lg"
        />
        <label className="block mb-1">Content</label>
        <Editor
          apiKey={process.env.NEXT_PUBLIC_VITE_TINYMCE_API_KEY}
          value={formData.content}
          init={{
            height: 300,
            menubar: false,
            plugins: ["link", "lists", "image"],
            toolbar:
              "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image",
            images_upload_handler: imageUploadHandler, // Image upload handler
            image_resizing: true, // Enable image resizing after upload (built-in feature)
          }}
          onEditorChange={handleEditorChange}
          id="my-editor-id"
        />
        <input
          name="tags"
          placeholder="Tags (comma separated)"
          value={formData.tags}
          onChange={handleChange}
          className="p-3 border rounded-lg"
        />
        
        {/* Featured Image Input */}
        <div>
          <label className="block mb-2">Featured Image</label>
          <input
            type="file"
            name="featuredImage"
            accept="image/*"
            onChange={handleChange}
            className="p-3 border  rounded-lg"
          />
        </div>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
          />
          <span>Publish</span>
        </label>
        <button
          type="submit"
          className="bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Blog"}
        </button>
      </form>
    </div>
  );
};

export default AddBlog;
