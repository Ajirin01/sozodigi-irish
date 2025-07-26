"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import Badge from "@/components/admin/ui/badge/Badge";
import { fetchData, deleteData } from "@/utils/api";
import { useSession } from "next-auth/react";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchData("/categories/get-all/no-pagination");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const deleteCategory = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteData(`categories/${categoryId}`, token);
      setCategories(categories.filter((category) => category._id !== categoryId));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const customLoader = ({ src }) => src;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Link
          href="/admin/categories/add"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Category
        </Link>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px]">
          {loading ? (
            <p>Loading categories...</p>
          ) : (
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"
                  >
                    Category Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {categories.map((category) => (
                  <TableRow key={category._id}>

                    {/* Category Name */}
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {category.name}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-4 text-start flex gap-3">
                      <Link href={`/admin/categories/edit/${category._id}`} className="text-blue-500">
                        <PencilSquareIcon className="w-5 h-5 inline-block" />
                      </Link>
                      <button className="text-red-500" onClick={() => deleteCategory(category._id)}>
                        <TrashIcon className="w-5 h-5 inline-block" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
