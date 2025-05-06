import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getToken } from "../../Services/localStorageService";
import handleAlert from "../../Alert/handleAlert";
import SignatureCanvas from "react-signature-canvas";

const Persondevice = () => {
  const [assignments, setAssignments] = useState([]);
  const [serialNumber, setSerialNumber] = useState("");
  const [status, setStatus] = useState("");
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [userSignature, setUserSignature] = useState(null); // Chữ ký hiện có (Base64)
  const [isSigning, setIsSigning] = useState(false); // Điều khiển màn hình ký
  const [approvedAssignmentIds, setApprovedAssignmentIds] = useState([]); // Danh sách assignmentId đã xác nhận
  const sigCanvas = useRef(null);
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
    } catch (err) {
      if (err.response?.status === 401) {
        handleAlert("Lỗi", "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", "error");
      } else {
        handleAlert("Lỗi", err.response?.data?.message || "Lỗi khi tải danh sách!", "error");
      }
    }
  };

  // Check user signature
  const checkUserSignature = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/devices/signature",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success && response.data.data) {
        setUserSignature(`data:image/png;base64,${response.data.data}`);
      } else {
        setUserSignature(null);
      }
    } catch (error) {
      setUserSignature(null);
    }
  };

  // Fetch assignments and check signature on mount
  useEffect(() => {
    if (!token) {
      handleAlert("Lỗi", "Không tìm thấy token. Vui lòng đăng nhập lại!", "error");
      return;
    }
    fetchAssignments();
    checkUserSignature();
  }, [status, serialNumber]);

  // Handle page navigation
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = assignments.slice(startIndex, endIndex);

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
        const approvedIds = response.data.data
          .map((device) => {
            const assignment = assignments.find((a) => a.deviceId === device.id);
            return assignment ? assignment.id : null;
          })
          .filter((id) => id !== null);
        if (approvedIds.length === 0) {
          handleAlert("Cảnh báo", "Không có bàn giao nào được xác nhận!", "warning");
          return;
        }
        setApprovedAssignmentIds(approvedIds);
        setIsSigning(true);
        setSelectedDevices([]);
        fetchAssignments();
      } else {
        handleAlert("Lỗi", response.data.message || "Lỗi khi xác nhận bàn giao!", "error");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        handleAlert("Lỗi", "Bạn không có quyền xác nhận bàn giao!", "error");
      } else if (err.response?.status === 401) {
        handleAlert("Lỗi", "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", "error");
      } else {
        handleAlert("Lỗi", err.response?.data?.message || "Lỗi khi xác nhận bàn giao!", "error");
      }
    }
  };

  // Handle signature submission
  const handleSignAssignment = async (assignmentId, useExisting = false) => {
    try {
      if (!approvedAssignmentIds.includes(assignmentId)) {
        handleAlert("Lỗi", `Bàn giao ${assignmentId} không nằm trong danh sách đã xác nhận!`, "error");
        return;
      }

      const formData = new FormData();
      if (!useExisting) {
        if (!sigCanvas.current) {
          handleAlert("Lỗi", "Không thể truy cập canvas chữ ký!", "error");
          return;
        }
        if (sigCanvas.current.isEmpty()) {
          handleAlert("Lỗi", "Vui lòng vẽ chữ ký!", "error");
          return;
        }

        const signatureData = sigCanvas.current.toDataURL("image/png");
        const response = await fetch(signatureData);
        if (!response.ok) {
          throw new Error("Không thể chuyển đổi dữ liệu chữ ký thành Blob");
        }
        const blob = await response.blob();
        formData.append("signature", blob, "signature.png");
      }

      const response = await axios.post(
        `http://localhost:8080/api/v1/devices/sign-staff/${assignmentId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        handleAlert("Thành công", `Đã ký bàn giao ${assignmentId} thành công!`, "success");
      } else {
        handleAlert("Lỗi", response.data.message || "Không thể ký bàn giao!", "error");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleAlert("Lỗi", "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", "error");
      } else if (err.response?.status === 403) {
        handleAlert(
          "Lỗi",
          err.response?.data?.message ||
            "Bạn không có quyền ký bàn giao này. Vui lòng liên hệ quản trị viên!",
          "error"
        );
      } else {
        handleAlert(
          "Lỗi",
          err.response?.data?.message || `Không thể ký bàn giao: ${err.message}`,
          "error"
        );
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
        handleAlert("Lỗi", response.data.message || "Lỗi khi từ chối!", "error");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        handleAlert("Lỗi", "Bạn không có quyền từ chối!", "error");
      } else if (err.response?.status === 401) {
        handleAlert("Lỗi", "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", "error");
      } else {
        handleAlert("Lỗi", err.response?.data?.message || "Lỗi khi từ chối!", "error");
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
        handleAlert("Lỗi", response.data.message || "Lỗi khi trả lại!", "error");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        handleAlert("Lỗi", "Bạn không có quyền trả lại!", "error");
      } else if (err.response?.status === 401) {
        handleAlert("Lỗi", "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", "error");
      } else {
        handleAlert("Lỗi", err.response?.data?.message || "Lỗi khi trả lại!", "error");
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
      handleAlert(
        "Lỗi",
        err.response?.data?.message || `Lỗi khi ${action === "view" ? "xem" : "tải"} biên bản bàn giao!`,
        "error"
      );
    }
  };

  // Handle sign all assignments
  const handleSignAll = async (useExisting = false) => {
    try {
      for (const assignmentId of approvedAssignmentIds) {
        await handleSignAssignment(assignmentId, useExisting);
      }
      handleAlert("Thành công", "Đã ký tất cả bàn giao thành công!", "success");
      setIsSigning(false);
      setApprovedAssignmentIds([]);
      if (sigCanvas.current) sigCanvas.current.clear();
      fetchAssignments();
      checkUserSignature();
    } catch (err) {
      handleAlert("Lỗi", `Lỗi khi ký bàn giao: ${err.message}`, "error");
    }
  };

  // Render signing screen
  const renderSigningScreen = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full min-h-[calc(100vh-96px)]">
        <h2 className="text-2xl font-bold mb-4 text-center">Ký Hợp Đồng Bàn Giao</h2>
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Danh sách bàn giao cần ký:</h3>
          {approvedAssignmentIds.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">STT</th>
                  <th className="border border-gray-300 p-2 text-left">Mã bàn giao</th>
                  <th className="border border-gray-300 p-2 text-left">Chữ ký</th>
                  <th className="border border-gray-300 p-2 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {approvedAssignmentIds.map((id, index) => {
                  const assignment = assignments.find((a) => a.id === id);
                  const isSigned = assignment?.status === "ASSIGNED" && userSignature;
                  return (
                    <tr key={id}>
                      <td className="border border-gray-300 p-2">{index + 1}</td>
                      <td className="border border-gray-300 p-2">{id}</td>
                      <td className="border border-gray-300 p-2">
                        {isSigned ? (
                          <img
                            src={userSignature}
                            alt="Chữ ký"
                            className="w-[100px] h-[50px] object-contain"
                          />
                        ) : (
                          <span className="text-gray-500">Chưa ký</span>
                        )}
                      </td>
                      <td className="border border-gray-300 p-2 flex gap-2">
                        <button
                          onClick={() => handlePdfAction(id, "view")}
                          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700"
                        >
                          Xem PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center">Không có bàn giao nào cần ký.</p>
          )}
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Chữ ký:</h3>
          {userSignature ? (
            <div className="border border-gray-300 p-2">
              <img
                src={userSignature}
                alt="Chữ ký hiện tại"
                className="w-[300px] h-[200px] object-contain"
              />
            </div>
          ) : (
            <div>
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "border border-gray-300",
                }}
              />
              <button
                onClick={() => sigCanvas.current?.clear()}
                className="mt-2 bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700"
              >
                Xóa chữ ký
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => {
              setIsSigning(false);
              setApprovedAssignmentIds([]);
              if (sigCanvas.current) sigCanvas.current.clear();
            }}
            className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Quay lại
          </button>
          {userSignature ? (
            <button
              onClick={() => handleSignAll(true)}
              className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Ký tất cả với chữ ký hiện tại
            </button>
          ) : (
            <button
              onClick={() => handleSignAll(false)}
              className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Ký tất cả
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render main screen
  const renderMainScreen = () => (
    <div className="min-h-screen bg-white-100 p-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Danh Sách Vật Tư Cá Nhân
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
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
        <div className="space-y-6">
          {currentItems.length === 0 ? (
            <div className="text-center text-gray-600 p-6 bg-white rounded-lg shadow-md">
              Không có vật tư được bàn giao.
            </div>
          ) : (
            currentItems.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
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
                      <p className="text-sm text-gray-600">Người Bàn Giao: admin</p>
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
        <div className="fixed bottom-4 right-4 bg-white py-2 px-4 rounded-lg shadow-md border border-gray-200">
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

  return (
    <div className="w-full h-screen bg-white-100 flex flex-col">
      <style jsx>{`
        .no-scrollbar {
          overflow-y: auto;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {isSigning ? renderSigningScreen() : renderMainScreen()}
    </div>
  );
};

export default Persondevice;