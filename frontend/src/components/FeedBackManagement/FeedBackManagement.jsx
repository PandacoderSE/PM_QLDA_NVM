import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../Services/localStorageService";

const FeedBackManagement = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;

  const token = getToken();
  const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api/v1",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch logged-in admin's userId
  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/user/myInfo");
        const userData = response.data.data;
        setUserId(userData.id);
        setError("");
      } catch (error) {
        console.error("Error fetching user info:", error);
        setError("Không thể tải thông tin người dùng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  // Fetch all requests and filter by to_user_id
  useEffect(() => {
    const fetchRequests = async () => {
      if (userId) {
        setLoading(true);
        try {
          const response = await axiosInstance.get("/requests");
          const filteredRequests = response.data.filter(
            (request) => request.toUserId === userId
          );
          setRequests(filteredRequests);
          setError("");
        } catch (error) {
          console.error("Error fetching requests:", error);
          setError("Không thể tải danh sách yêu cầu. Vui lòng thử lại.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchRequests();
  }, [userId]);

  // Fetch messages for selected request
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedRequest) {
        setLoading(true);
        try {
          const response = await axiosInstance.get(`/requests/${selectedRequest.id}`, {
            params: { userId: selectedRequest.userId },
          });
          setMessages(response.data.responses || []);
          setError("");
        } catch (error) {
          console.error("Error fetching request details:", error);
          setError("Không thể tải chi tiết yêu cầu. Vui lòng thử lại.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMessages();
  }, [selectedRequest]);

  // Respond to a request
  const handleSendResponse = async () => {
    if (!newMessage || !selectedRequest) {
      setError("Vui lòng nhập phản hồi và chọn yêu cầu!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/requests/${selectedRequest.id}/respond`,
        null,
        { params: { responseContent: newMessage } }
      );
      console.log("Response from respond:", response.data); // Debug the response
      const newResponses = response.data?.responses || [];
      const newResponse = newResponses.length > 0
        ? newResponses[newResponses.length - 1]
        : { content: newMessage, sender: { firstname: "Admin", lastname: "" } };
      setMessages([...messages, newResponse]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending response:", error);
      setError("Không thể gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Approve a request
  const handleApproveRequest = async (requestId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/requests/${requestId}/approve`);
      setRequests(
        requests.map((request) =>
          request.id === requestId ? { ...request, status: "APPROVED" } : request
        )
      );
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: "APPROVED" });
      }
      setError("");
    } catch (error) {
      console.error("Error approving request:", error);
      setError("Không thể duyệt yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a request
  const handleDeleteRequest = async (requestId) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/requests/${requestId}`);
      setRequests(requests.filter((request) => request.id !== requestId));
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(null);
        setMessages([]);
      }
      setError("");
    } catch (error) {
      console.error("Error deleting request:", error);
      setError("Không thể xóa yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Search requests
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/requests/search", {
        params: { userId: searchUserId, status: searchStatus },
      });
      const filteredRequests = response.data.filter(
        (request) => request.toUserId === userId
      );
      setRequests(filteredRequests);
      setCurrentPage(1);
      setError("");
    } catch (error) {
      console.error("Error searching requests:", error);
      setError("Không thể tìm kiếm yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Reset search
  const handleResetSearch = async () => {
    setSearchUserId("");
    setSearchStatus("");
    setLoading(true);
    try {
      const response = await axiosInstance.get("/requests");
      const filteredRequests = response.data.filter(
        (request) => request.toUserId === userId
      );
      setRequests(filteredRequests);
      setCurrentPage(1);
      setError("");
    } catch (error) {
      console.error("Error resetting search:", error);
      setError("Không thể tải lại danh sách yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(requests.length / requestsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Loading Indicator */}
      {loading && (
        <div className="text-center text-gray-600 mb-4">Đang tải...</div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Tìm Kiếm Yêu Cầu</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Người Gửi
            </label>
            <input
              type="text"
              placeholder="Nhập ID người gửi"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái
            </label>
            <select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Tất cả</option>
              <option value="PENDING">ĐANG CHỜ</option>
              <option value="APPROVED">ĐÃ DUYỆT</option>
              <option value="REJECTED">TỪ CHỐI</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-400"
              disabled={loading}
            >
              Tìm Kiếm
            </button>
            <button
              onClick={handleResetSearch}
              className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition disabled:bg-gray-400"
              disabled={loading}
            >
              Đặt Lại
            </button>
          </div>
        </div>
      </div>

      {/* Request List */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Danh Sách Yêu Cầu</h2>
        {requests.length === 0 ? (
          <p className="text-gray-600">Không có yêu cầu nào.</p>
        ) : (
          <>
            <div className="space-y-2">
              {currentRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-gray-200 rounded hover:bg-gray-100 transition"
                >
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="w-full text-left"
                    disabled={loading}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="font-medium">{request.title}</span>
                        <p className="text-sm text-gray-500">
                          Gửi từ: {request.userId}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span
                          className={`${
                            request.status === "APPROVED"
                              ? "text-green-600"
                              : request.status === "PENDING"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {request.status === "APPROVED"
                            ? "ĐÃ DUYỆT"
                            : request.status === "PENDING"
                            ? "ĐANG CHỜ"
                            : "TỪ CHỐI"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRequest(request.id);
                          }}
                          className="text-red-600 hover:text-red-800 disabled:text-red-400"
                          disabled={loading}
                          title="Xóa yêu cầu"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0H6a1 1 0 00-1 1v1h14V4a1 1 0 00-1-1h-4z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            {requests.length > requestsPerPage && (
              <div className="flex justify-end mt-4 space-x-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    disabled={loading}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Request Details and Responses */}
      {selectedRequest && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            Yêu Cầu: {selectedRequest.title}
          </h2>
          <p className="text-gray-600 mb-2">
            Trạng Thái:{" "}
            <span className="font-medium">
              {selectedRequest.status === "APPROVED"
                ? "ĐÃ DUYỆT"
                : selectedRequest.status === "PENDING"
                ? "ĐANG CHỜ"
                : "TỪ CHỐI"}
            </span>
          </p>
          <p className="text-gray-600 mb-2">
            Gửi từ: {selectedRequest.userId}
          </p>
          <p className="text-gray-600 mb-4">
            Nội Dung: {selectedRequest.content}
          </p>
          <h3 className="text-lg font-semibold mb-2">Phản Hồi</h3>
          <div className="border-t border-gray-200 pt-4 mb-4">
            {messages.length === 0 ? (
              <p className="text-gray-600">Chưa có phản hồi nào.</p>
            ) : (
              <ul className="space-y-2">
                {messages.map((msg, index) => (
                  <li key={index} className="p-3 border border-gray-200 rounded">
                    <p className="font-medium">
                      {msg.sender?.firstname} {msg.sender?.lastname}:
                    </p>
                    <p>{msg.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gửi Phản Hồi
          </label>
          <textarea
            rows="4"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="Nhập phản hồi của bạn..."
            disabled={loading}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleSendResponse}
              className="h-8 w-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:bg-blue-400"
              disabled={loading}
              title="Gửi Phản Hồi"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
            {selectedRequest.status !== "APPROVED" && (
              <button
                onClick={() => handleApproveRequest(selectedRequest.id)}
                className="h-8 w-8 flex items-center justify-center bg-green-600 text-white rounded-full hover:bg-green-700 transition disabled:bg-green-400"
                disabled={loading}
                title="Duyệt Yêu Cầu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedBackManagement;