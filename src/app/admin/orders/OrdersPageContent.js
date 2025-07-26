"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { fetchData, deleteData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "", paymentStatus: "", category: "" });

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  
  const { addToast } = useToast();
  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Sync filters with query params
  useEffect(() => {
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const category = searchParams.get("category");

    if (!status && !paymentStatus && !category) {
      setFilters({ status: "", paymentStatus: "", category: "" });
    } else {
      setFilters({
        status: status || "",
        paymentStatus: paymentStatus || "",
        category: category || "",
      });
    }
  }, [searchParams]);

  // Fetch orders whenever filters change
  useEffect(() => {
    if (!token) return;

    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    const loadOrders = async () => {
      try {
        const data = await fetchData(`orders/filter/by?${query.toString()}`, token);
        setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token, filters]);

  const deleteOrder = async () => {
    try {
      await deleteData(`orders/${itemToDelete._id}`, token);
      setOrders(orders.filter((order) => order._id !== itemToDelete._id));
      alertSuccess("Order successfully deleted");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting order:", error);
      alertError("Failed to delete order!");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <Link
          href="/admin/orders/start"
          className="bg-indigo-600 text-white px-4 py-2 rounded-full border border-indigo-400 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 hover:ring-4 transition-all duration-300"
        >
          Create New Order
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="flex flex-col">
          <label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Status</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            value={filters.paymentStatus}
            onChange={handleFilterChange}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">All Categories</option>
            <option value="Medication">Medication</option>
            <option value="LabService">Lab Service</option>
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px]">
          {loading ? (
            <p>Loading orders...</p>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Order ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">User</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Total Amount</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{order._id}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{order.user?.firstName} {order.user?.lastName}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{order.status}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="px-5 py-4 text-start flex gap-3">
                      <Link href={`/admin/orders/view/${order._id}`} className="text-indigo-500">
                        <EyeIcon className="w-5 h-5 inline-block" />
                      </Link>
                      <Link href={`/admin/orders/edit/${order._id}`} className="text-blue-500">
                        <PencilSquareIcon className="w-5 h-5 inline-block" />
                      </Link>
                      <button className="text-red-500" onClick={() => { setIsDialogOpen(true); setItemToDelete(order); }}>
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

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={deleteOrder}
        title="Delete Order"
        message={`Are you sure you want to delete the order with ID "${itemToDelete?._id}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="No, Keep"
      />
    </div>
  );
};

export default OrdersPage;
