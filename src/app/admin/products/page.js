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
import { fetchData } from "@/utils/api";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchData("/products/get-all/brand-category?page=1&perpage=5");
        console.log(data.data)
        setProducts(data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    console.log("HTML Class:", document.documentElement.classList);

    loadProducts();
  }, []);

  const customLoader = ({ src }) => {
    return src; // Allows external image URLs
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">

      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Link
          href="/admin/products/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-full border border-indigo-400 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 hover:ring-4 transition-all duration-300"
        >
          Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Image
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Category
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {products.map((product) => (
                  <TableRow key={product._id}>
                    {/* Product Image */}
                    <TableCell className="px-5 py-4 text-start">
                      <div className="w-10 h-10 overflow-hidden rounded">
                        <Image
                          loader={customLoader}
                          width={40}
                          height={40}
                          src={product.photo || "/images/default-product.jpg"}
                          alt={product.name}
                        />
                      </div>
                    </TableCell>

                    {/* Product Name */}
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {product.name}
                    </TableCell>

                    {/* Product Category */}
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {product.category.name}
                    </TableCell>

                    {/* Product Price */}
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      ${product.price}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-5 py-4 text-start">
                      <Badge
                        size="sm"
                        color={
                          product.status === "available"
                            ? "success"
                            : product.status === "Low Stock"
                            ? "warning"
                            : "error"
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-4 text-start flex gap-3">
                      <Link href={`/admin/products/edit/${product._id}`} className="text-blue-500">
                        <PencilSquareIcon className="w-5 h-5 inline-block" />
                      </Link>
                      <button className="text-red-500" onClick={() => deleteProduct(product._id)}>
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

export default ProductsPage;
