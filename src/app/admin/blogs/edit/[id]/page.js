"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { fetchData, updateData } from "@/utils/api";
import { Editor } from "@tinymce/tinymce-react";

const EditBlog = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();

  const params = useParams()

  const blogId = params.id

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    featuredImage: null,
    isPublished: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blog = await fetchData(`blogs/${blogId}`, token);
        console.log(blog)
        setFormData({
          title: blog.title,
          content: blog.content,
          tags: blog.tags,
          featuredImage: null, // Handle image separately
          isPublished: blog.isPublished,
        });
      } catch (error) {
        console.error("Error fetching blog:", error);
        addToast("Failed to load blog data", "error");
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId, token, addToast]);

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
      const res = await updateData(`blogs/custom/update/${blogId}`, form, token, true); // Use PUT for updating
      addToast("Blog updated successfully!", "success");
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error updating blog:", error);
      addToast("Failed to update blog", "error");
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
      <h2 className="text-2xl font-semibold text-center mb-4">Edit Blog</h2>
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
          apiKey="oz66yasd6jxupf3del6yws3y817g1ru6gl75ma7xzx3b3u27"
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
          {loading ? "Updating..." : "Update Blog"}
        </button>
      </form>
    </div>
  );
};

export default EditBlog;
