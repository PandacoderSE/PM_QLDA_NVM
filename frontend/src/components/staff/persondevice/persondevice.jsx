import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../Services/localStorageService";
import handleAlert from "../../Alert/handleAlert";

const Persondevice = () => {
  const [assignments, setAssignments] = useState([]);
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState("");
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = assignments.slice(startIndex, endIndex);
  const token = getToken();

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      const params = {};
      if (status) params.status = status.toUpperCase();
      if (serialNumber) params.serialNumber = serialNumber.trim();

      const response = await axios.get(
        "http://localhost:8080/api/v1/devices/assignments",
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data?.data || [];
      setAssignments(data);
      if (data.length === 0) {
        handleAlert("Thông báo", "Không tìm thấy vật tư phù hợp!", "info");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleAlert("Lỗi", "Bạn không có quyền truy cập!", "error");
      } else {
        console.error("Lỗi API:", err);
        handleAlert("Lỗi", "Lỗi khi tải danh sách!", "error");
      }
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [status, serialNumber]);

  // Select/deselect device
  const handleSelectDevice = (deviceId) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  // Approve multiple devices
  const handleApprove = async () => {
    if (selectedDevices.length === 0) {
      handleAlert("Cảnh báo", "Vui lòng chọn ít nhất một thiết bị để xác nhận!", "warning");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/devices/approve-assignment",
        selectedDevices,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        handleAlert("Thành công", "Đã xác nhận bàn giao thành công!", "success");
        setSelectedDevices([]);
        fetchAssignments();
      } else {
        handleAlert("Lỗi", "Lỗi khi xác nhận!", "error");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        handleAlert("Lỗi", "Bạn không có quyền xác nhận!", "error");
      } else {
        console.error("Lỗi API:", err);
        handleAlert("Lỗi", "Lỗi khi xác nhận!", "error");
      }
    }
  };

  // Reject assignment
  const handleReject = async (assignmentId) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/devices/assignments/reject?assignmentId=${assignmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        handleAlert("Thành công", "Đã từ chối bàn giao!", "success");
        fetchAssignments();
      } else {
        handleAlert("Lỗi", "Lỗi khi từ chối!", "error");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        handleAlert("Lỗi", "Bạn không có quyền từ chối!", "error");
      } else {
        console.error("Lỗi API:", err);
        handleAlert("Lỗi", "Lỗi khi từ chối!", "error");
      }
    }
  };

  // Return device
  const handleReturn = async (assignmentId) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/devices/assignments/return?assignmentId=${assignmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        handleAlert("Thành công", "Đã trả lại vật tư!", "success");
        fetchAssignments();
      } else {
        handleAlert("Lỗi", "Lỗi khi trả lại!", "error");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        handleAlert("Lỗi", "Bạn không có quyền trả lại!", "error");
      } else {
        console.error("Lỗi API:", err);
        handleAlert("Lỗi", "Lỗi khi trả lại!", "error");
      }
    }
  };

  // Handle PDF actions (view or download)
  const handlePdfAction = async (assignmentId, action = "download") => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/devices/${assignmentId}/download-pdf`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));

      if (action === "view") {
        window.open(url, "_blank");
        window.URL.revokeObjectURL(url);
        handleAlert("Thành công", "Đã mở biên bản bàn giao!", "success");
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `handover_${assignmentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        handleAlert("Thành công", "Tải biên bản bàn giao thành công!", "success");
      }
    } catch (err) {
      console.error(`Lỗi khi ${action === "view" ? "xem" : "tải"} PDF:`, err);
      handleAlert("Lỗi", `Lỗi khi ${action === "view" ? "xem" : "tải"} biên bản bàn giao!`, "error");
    }
  };

  return (
    <div className="min-h-screen bg-white-100 p-1">
      <div className="container mx-auto">
        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Danh Sách Vật Tư Cá Nhân
        </h2>

        {/* Filters */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã Vật Tư
              </label>
              <input
                type="text"
                placeholder="Nhập mã vật tư"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng Thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Chọn trạng thái</option>
                <option value="PENDING">ĐANG CHỜ</option>
                <option value="ASSIGNED">ĐÃ DUYỆT</option>
                <option value="RETURNED">ĐÃ TRẢ</option>
                <option value="REJECTED">TỪ CHỐI</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAssignments}
                className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                Tìm Kiếm
              </button>
            </div>
          </div>
        </div>

        {/* Approve button for multiple devices */}
        {selectedDevices.length > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleApprove}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition shadow-md"
            >
              Xác Nhận ({selectedDevices.length} thiết bị)
            </button>
          </div>
        )}

        {/* Device List (Card Layout) */}
        <div className="space-y-6">
          {currentItems.length === 0 ? (
            <div className="text-center text-gray-600 p-6 bg-white rounded-lg shadow-md">
              Không có vật tư được bàn giao.
            </div>
          ) : (
            currentItems.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {assignment.status === "PENDING" && (
                      <input
                        type="checkbox"
                        checked={selectedDevices.includes(assignment.deviceId)}
                        onChange={() => handleSelectDevice(assignment.deviceId)}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Mã Vật Tư: {assignment.serialNumber}
                      </h3>
                      <div className="w-full h-0.5 bg-orange-500 mt-2 mb-3"></div>
                      <p className="text-sm text-gray-600">
                        Nhà Sản Xuất: {assignment.manufacturer}
                      </p>
                      <p className="text-sm text-gray-600">
                        Người Bàn Giao: admin
                      </p>
                      <p className="text-sm text-gray-600">
                        Thời Gian Bàn Giao: {new Date(assignment.handoverDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        assignment.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-600"
                          : assignment.status === "ASSIGNED"
                          ? "bg-green-100 text-green-600"
                          : assignment.status === "RETURNED"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {assignment.status === "PENDING"
                        ? "ĐANG CHỜ"
                        : assignment.status === "ASSIGNED"
                        ? "ĐÃ DUYỆT"
                        : assignment.status === "RETURNED"
                        ? "ĐÃ TRẢ"
                        : "TỪ CHỐI"}
                    </span>
                    <div className="flex gap-2">
                      {assignment.status === "PENDING" && (
                        <button
                          onClick={() => handleReject(assignment.id)}
                          className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition shadow-sm"
                        >
                          Từ Chối
                        </button>
                      )}
                      {(assignment.status === "ASSIGNED" || assignment.status === "RETURNED") && (
                        <>
                          <button
                            onClick={() => handlePdfAction(assignment.id, "view")}
                            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                          >
                            Xem PDF
                          </button>
                          <button
                            onClick={() => handlePdfAction(assignment.id, "download")}
                            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                          >
                            Tải PDF
                          </button>
                        </>
                      )}
                      {assignment.status === "ASSIGNED" && (
                        <button
                          onClick={() => handleReturn(assignment.id)}
                          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                        >
                          Trả Lại
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Fixed Pagination (Restored Original) */}
        <div className="fixed bottom-2 right-2 bg-white py-2 px-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              className="p-1 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            {Array.from({ length: Math.ceil(assignments.length / itemsPerPage) }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`px-2 py-1 rounded text-sm ${
                  currentPage === index
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(assignments.length / itemsPerPage) - 1)
                )
              }
              disabled={currentPage === Math.ceil(assignments.length / itemsPerPage) - 1}
              className="p-1 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Persondevice;