"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import { fetchData } from "@/utils/api";

const FeedbackPage = () => {
  const { data: session } = useSession();
  const [feedbacks, setFeedbacks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filterRating, setFilterRating] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const token = session?.user?.jwt;

  useEffect(() => {
    if (token) {
      loadFeedbacks(page, token);
    }
  }, [token, page, filterRating, filterStartDate, filterEndDate]);
  

  const loadFeedbacks = async (currentPage, token) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        ...(filterRating && { rating: filterRating }),
        ...(filterStartDate && { startDate: filterStartDate }),
        ...(filterEndDate && { endDate: filterEndDate }),
      });
  
      const endpoint = `session-feedback/get/all/paginated?${params.toString()}`;
      const data = await fetchData(endpoint, token);
      console.log(data.data)
      setFeedbacks(data.data);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error("Error loading feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (feedbackItem) => {
    console.log( "@@@@@@@@@@@@", feedbackItem)
    setSelectedFeedback(feedbackItem);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedFeedback(null);
  };
  

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Session Feedback</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm mb-1">Rating</label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-2 py-1 border rounded dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} ★</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Start Date</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">End Date</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </div>
      </div>


      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {loading ? (
            <p>Loading feedback...</p>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    User
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Specialist
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Rating
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Feedback
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Submitted At
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {feedbacks.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {item.session.user?.firstName || "N/A"} {item.session.user?.lastName || ""}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {item.session.specialist?.firstName || "N/A"} {item.session.specialist?.lastName || ""}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {item.rating || "N/A"} ★
                    </TableCell>
                    <TableCell
                      className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 cursor-pointer"
                    >
                      <sapn onClick={() => handleOpenDialog(item)}>
                        {item.feedbackText?.length > 50
                          ? item.feedbackText.substring(0, 50) + "..."
                          : item.feedbackText || "No feedback"}
                      </sapn>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex gap-2 justify-center">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1">{page} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      
      {isDialogOpen && selectedFeedback && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-lg w-full">
          <h2 className="text-lg font-semibold mb-2">Full Feedback</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {selectedFeedback.feedbackText}
          </p>
          <div className="mt-4 text-right">
            <button
              onClick={handleCloseDialog}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
};

export default FeedbackPage;
