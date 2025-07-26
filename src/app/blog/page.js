"use client";
import { useEffect, useState } from 'react';
import { fetchData } from '@/utils/api';
import Link from 'next/link';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      try {
        const res = await fetchData(`blogs?page=${page}&limit=6`); // Fetch with pagination (6 items per page)
        setBlogs(res.data);
        setTotalPages(res.pages); // Set the total number of pages
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, [page]); // Re-fetch when page changes

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage); // Update the page state
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10">Our Blog</h1>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {blogs.map((blog) => (
              <Link key={blog._id} href={`/blog/${blog._id}?t=${blog.title}`}>
                <div className="bg-white w-80 rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <img
                    src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${blog.featuredImage}` || '/images/blog-placeholder.jpg'}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/blog-placeholder.jpg';
                    }}
                  />
                  <div className="p-5">
                    <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
                    <p
                      className="text-sm text-gray-600 mb-4"
                      dangerouslySetInnerHTML={{
                        __html: blog.content?.slice(0, 100).replace(/(?:\r\n|\r|\n)/g, '<br>') + '...',
                      }}
                    />
                    <p className="text-xs text-gray-400">{new Date(blog.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination controls */}
        <div className="flex justify-center items-center mt-8">
            <button
                onClick={() => handlePageChange(page - 1)}
                className="px-4 py-2 mx-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-700"
                disabled={page === 1}
            >
                Previous
            </button>
            <span className="text-lg font-semibold">
                Page {page} of {totalPages}
            </span>
            <button
                onClick={() => handlePageChange(page + 1)}
                className="px-4 py-2 mx-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-700"
                disabled={page === totalPages}
            >
                Next
            </button>
        </div>

        </>
      )}
    </div>
  );
}
