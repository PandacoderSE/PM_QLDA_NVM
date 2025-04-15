import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../Services/localStorageService";
import Pagination_T from "../../Default/Pagination";
import Swal from "sweetalert2";
import handleAlert from "../../Alert/handleAlert";
const Persondevice = () => {
  const [assignments, setAssignments] = useState([]);
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState("");
  const [selectedDevices, setSelectedDevices] = useState([]); // Danh sách deviceId được chọn
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = assignments.slice(startIndex, endIndex);
  const token = getToken();
  // Lấy danh sách vật tư
  const fetchAssignments = async () => {
    try {
      const params = {};
      if (status) params.status = status;
      if (serialNumber) params.serialNumber = serialNumber;

      const response = await axios.get(
        "http://localhost:8080/api/v1/devices/assignments",
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAssignments(response.data?.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Bạn không có quyền truy cập!");
      } else {
        console.error("Lỗi API:", err);
      }
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Chọn/bỏ chọn thiết bị
  const handleSelectDevice = (deviceId) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  // Duyệt bàn giao nhiều thiết bị
  const handleApprove = async () => {
    if (selectedDevices.length === 0) {
      alert("Vui lòng chọn ít nhất một thiết bị để xác nhận!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/devices/approve-assignment",
        selectedDevices, // Truyền danh sách ID trực tiếp vào body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Đã xác nhận bàn giao thành công!");
        setSelectedDevices([]); // Reset lựa chọn
        fetchAssignments(); // Cập nhật danh sách
      } else {
        alert("Lỗi khi xác nhận!");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Bạn không có quyền xác nhận!");
      } else {
        console.error("Lỗi API:", err);
        alert("Lỗi khi xác nhận!");
      }
    }
  };

  // Từ chối bàn giao
  // Từ chối bàn giao
const handleReject = async (assignmentId) => {
  try {
    const response = await axios.post(
      `http://localhost:8080/api/v1/devices/assignments/reject?assignmentId=${assignmentId}`,
      {}, // Payload rỗng vì dữ liệu đã nằm trong query parameter
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.success) {
      handleAlert.fire("Thành công", "Đã từ chối bàn giao!", "success");
      fetchAssignments();
    } else {
      handleAlert.fire("Lỗi", "Lỗi khi từ chối!", "error");
    }
  } catch (err) {
    if (err.response?.status === 403) {
      handleAlert.fire("Lỗi", "Bạn không có quyền từ chối!", "error");
    } else {
      console.error("Lỗi API:", err);
      handleAlert.fire("Lỗi", "Lỗi khi từ chối!", "error");
    }
  }
};

// Trả lại vật tư
const handleReturn = async (assignmentId) => {
  try {
    const response = await axios.post(
      `http://localhost:8080/api/v1/devices/assignments/return?assignmentId=${assignmentId}`,
      {}, // Payload rỗng vì dữ liệu đã nằm trong query parameter
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.success) {
      handleAlert.fire("Thành công", "Đã trả lại vật tư!", "success");
      fetchAssignments();
    } else {
      handleAlert.fire("Lỗi", "Lỗi khi trả lại!", "error");
    }
  } catch (err) {
    if (err.response?.status === 403) {
      handleAlert.fire("Lỗi", "Bạn không có quyền trả lại!", "error");
    } else {
      console.error("Lỗi API:", err);
      handleAlert.fire("Lỗi", "Lỗi khi trả lại!", "error");
    }
  }
};

  return (
    <div className="p-4">
      {/* Tiêu đề */}
      <h2 className="text-2xl font-bold mb-4 text-center">
        DANH SÁCH VẬT TƯ CÁ NHÂN
      </h2>

      {/* Bộ lọc */}
      <div className="flex gap-4 mt-10 mb-10">
        <input
          type="text"
          placeholder="Mã vật tư"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          className="border p-2 rounded w-1/4"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded w-1/4"
        >
          <option value="">Trạng thái</option>
          <option value="PENDING">PENDING</option>
          <option value="ASSIGNED">APPROVED</option>
          <option value="RETURNED">RETURNED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        {/* <button
          onClick={fetchAssignments}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Tìm
        </button> */}
        <button
          onClick={fetchAssignments}
          class="bg-blue-500 text-white px-4 py-2 rounded font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          <svg
            class="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
          <span class="sr-only">Tìm kiếm</span>
        </button>
      </div>

      {/* Nút xác nhận nhiều thiết bị */}
      {selectedDevices.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleApprove}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Xác nhận ({selectedDevices.length} thiết bị)
          </button>
        </div>
      )}

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDevices(
                        currentItems
                          .filter((a) => a.status === "PENDING")
                          .map((a) => a.deviceId)
                      );
                    } else {
                      setSelectedDevices([]);
                    }
                  }}
                  checked={
                    currentItems.filter((a) => a.status === "PENDING").length >
                      0 &&
                    selectedDevices.length ===
                      currentItems.filter((a) => a.status === "PENDING").length
                  }
                />
              </th>
              <th className="border border-gray-300 p-2">Mã vật tư</th>
              <th className="border border-gray-300 p-2">Người bàn giao</th>
              <th className="border border-gray-300 p-2">Manufacturer</th>
              <th className="border border-gray-300 p-2">Thời gian bàn giao</th>
              <th className="border border-gray-300 p-2">Trạng thái</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody align="center">
            {currentItems.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="border border-gray-300 p-2 text-center"
                >
                  Không có vật tư được bàn giao.
                </td>
              </tr>
            ) : (
              currentItems.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">
                    {assignment.status === "PENDING" && (
                      <input
                        type="checkbox"
                        checked={selectedDevices.includes(assignment.deviceId)}
                        onChange={() => handleSelectDevice(assignment.deviceId)}
                      />
                    )}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {assignment.serialNumber}
                  </td>
                  <td className="border border-gray-300 p-2">admin</td>
                  <td className="border border-gray-300 p-2">
                    {assignment.manufacturer}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(assignment.handoverDate).toLocaleDateString()}
                  </td>
                  <td
                    className={`border border-gray-300 p-2 ${
                      assignment.status === "PENDING"
                        ? "text-yellow-500"
                        : assignment.status === "ASSIGNED"
                        ? "text-green-500"
                        : assignment.status === "RETURN"
                        ? "text-red-500"
                        : ""
                    }`}
                  >
                    {assignment.status}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <div className="flex gap-2">
                      {assignment.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleReject(assignment.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {assignment.status === "ASSIGNED" && (
                        <button
                          onClick={() => handleReturn(assignment.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          Trả lại
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* <Pagination_T
                    pageCount={Math.ceil(assignments.length / itemsPerPage)}
                    onPageChange={handlePageClick}
                  /> */}
      </div>
      {/* Pagination cố định */}
      <div className="fixed bottom-0 right-0 w-full bg-white py-4 border-t border-gray-300">
        <Pagination_T
          pageCount={Math.ceil(assignments.length / itemsPerPage)}
          onPageChange={handlePageClick}
        />
      </div>
    </div>
  );
};

export default Persondevice;
