import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { fetchData } from "@/utils/api";  // Assuming you have this API utility
import { useSession } from "next-auth/react";

export default function RecentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession()
  const token = session?.user?.jwt

  // Fetch orders from the backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Replace with the actual API endpoint for fetching orders
        const data = await fetchData("/orders/filter/by?limit=5", token); // You can add pagination/query params as needed
        setOrders(data.orders);  // Assuming 'orders' is the key in the response
        console.log(data.orders)
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    if(token) fetchOrders();
  }, [token]);

  // Loader for the table data
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Medical & Lab Orders
          </h3>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Service Name
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Category
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Price
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <img
                        width={50}
                        height={50}
                        src={order.items[0]?.product?.photo ? `${process.env.NEXT_PUBLIC_NODE_BASE_URL}/${order.items[0]?.product?.photo}` : "/images/placeholder.png"}
                        className="h-[50px] w-[50px]"
                        alt={order.items[0]?.product?.name || "Product"}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.items.map((item) => item.product?.name).join(", ")}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.items.length} {order.category === 'LabService' ? 'Tests' : 'Variants'}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {order.category}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  ${order.totalAmount.toFixed(2)}
                </TableCell>

                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      order.status === "Completed"
                        ? "success"
                        : order.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
