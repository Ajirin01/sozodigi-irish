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

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const data = await fetchData("/brands/get-all/no-pagination");
        console.log(data)
        setBrands(data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  const deleteBrand = async (brandId) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    console.log(`/brands${brandId}`)

    try {
      await deleteData(`/brands/${brandId}`, token);
      setBrands(brands.filter((brand) => brand._id !== brandId));
    } catch (error) {
      console.error("Error deleting brand:", error);
    }
  };

  const customLoader = ({ src }) => src;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Brand Management</h1>
        <Link
          href="/admin/brands/add"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Brand
        </Link>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px]">
          {loading ? (
            <p>Loading brands...</p>
          ) : (
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"
                  >
                    Logo
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400"
                  >
                    Brand Name
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
                {brands.map((brand) => (
                  <TableRow key={brand._id}>
                    {/* Brand Logo */}
                    <TableCell className="px-5 py-4 text-start">
                      <div className="w-10 h-10 overflow-hidden rounded">
                        <Image
                          loader={customLoader}
                          width={40}
                          height={40}
                          src={
                            brand.logo?.startsWith("http")
                              ? brand.logo
                              : `${process.env.NEXT_PUBLIC_NODE_BASE_URL}${brand.logo}`
                          }
                          alt={brand.name}
                        />
                      </div>
                    </TableCell>

                    {/* Brand Name */}
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {brand.name}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-4 text-start flex gap-3">
                      <Link href={`/admin/brands/edit/${brand._id}`} className="text-blue-500">
                        <PencilSquareIcon className="w-5 h-5 inline-block" />
                      </Link>
                      <button className="text-red-500" onClick={() => deleteBrand(brand._id)}>
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

export default BrandsPage;
