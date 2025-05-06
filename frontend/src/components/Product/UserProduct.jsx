import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getToken } from "../Services/localStorageService";
import SignatureCanvas from "react-signature-canvas";

const UserProduct = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [status, setStatus] = useState("CHUA_SU_DUNG");
  const [serialNumber, setSerialNumber] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serialNumberError, setSerialNumberError] = useState("");
  const [ownerIdError, setOwnerIdError] = useState("");
  const [assignmentIds, setAssignmentIds] = useState([]);
  const [signedAssignments, setSignedAssignments] = useState({});
  const [userSignature, setUserSignature] = useState(null); // Lưu chữ ký có sẵn (Base64)
  const sigCanvas = useRef(null);
  const token = getToken();
  const MySwal = withReactContent(Swal);

  const steps = [
    "Tìm kiếm nhân viên",
    "Thông tin nhân viên",
    "Chọn thiết bị",
    "Xác nhận bàn giao",
    "Ký hợp đồng",
  ];

  // Kiểm tra chữ ký người dùng
  const checkUserSignature = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/devices/signature",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setUserSignature(`data:image/png;base64,${response.data.data}`);
      } else {
        setUserSignature(null);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra chữ ký:", error);
      setUserSignature(null);
    }
  };

  // Validation for username
  const validateUsername = (value) => {
    if (!value) return "Mã nhân viên không được để trống!";
    const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/g;
    if (specialCharactersRegex.test(value)) {
      return "Mã nhân viên không được chứa ký tự đặc biệt!";
    }
    return "";
  };

  // Validation for other fields
  const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/g;
  const validateField = (value) => {
    if (specialCharactersRegex.test(value)) {
      return "Dữ liệu không được chứa ký tự đặc biệt";
    }
    return "";
  };

  // Handle input changes for search form
  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name === "serialNumber") {
      setSerialNumber(value);
      setSerialNumberError(validateField(value));
    }
    if (name === "ownerId") {
      setOwnerId(value);
      setOwnerIdError(validateField(value));
    }
  };

  // Fetch devices by status
  const fetchDevices = async (status) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/devices/by-status/${status}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDeviceList(response.data.data);
      setSelectedDevices([]);
    } catch (error) {
      MySwal.fire("Lỗi", "Không thể tải danh sách thiết bị!", "error");
    }
    setLoading(false);
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/v1/categories/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCategories(response.data.data);
      } catch (error) {
        MySwal.fire("Lỗi", "Không thể tải danh sách danh mục!", "error");
      }
    };
    fetchCategories();
  }, []);

  // Kiểm tra chữ ký khi vào bước 5
  useEffect(() => {
    if (step === 5) {
      checkUserSignature();
    }
  }, [step]);

  // Search employee
  const handleSearch = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/user/getUserDevice/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserInfo(response.data.data);
      setStep(2);
    } catch (error) {
      MySwal.fire("Lỗi", "Không tìm thấy nhân viên!", "error");
    }
    setLoading(false);
  };

  // Handle device selection
  const handleCheckboxChange = (serialNumber) => {
    setSelectedDevices((prev) =>
      prev.includes(serialNumber)
        ? prev.filter((id) => id !== serialNumber)
        : [...prev, serialNumber]
    );
  };

  // Handover devices
  const handleAddDeviceForUser = async () => {
    setLoading(true);
    try {
      const assignments = await Promise.all(
        selectedDevices.map(async (id) => {
          const response = await axios.post(
            `http://localhost:8080/api/v1/devices/set-device`,
            {
              serial_number: id,
              owner_id: username,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return response.data.data.id;
        })
      );
      console.log(assignments);
      setAssignmentIds(assignments);
      MySwal.fire("Thành công", "Bàn giao thiết bị thành công!", "success");
      setStep(5);
    } catch (error) {
      if (error.response?.status === 409) {
        MySwal.fire({
          title: "Thiết bị đã được sử dụng",
          text: `Bạn có muốn chuyển giao thiết bị này cho nhân viên ${username}?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Đồng ý",
          cancelButtonText: "Hủy",
        }).then(async (result) => {
          if (result.isConfirmed) {
            const assignments = await Promise.all(
              selectedDevices.map(async (id) => {
                const response = await axios.post(
                  `http://localhost:8080/api/v1/devices/transfer-device`,
                  {
                    serial_number: id,
                    owner_id: username,
                  },
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                return response.data.data.id;
              })
            );
            setAssignmentIds(assignments);
            MySwal.fire("Thành công", "Bàn giao thiết bị thành công!", "success");
            setStep(5);
          }
        });
      } else {
        MySwal.fire("Lỗi", "Không thể bàn giao thiết bị!", "error");
      }
    }
    setLoading(false);
  };

  // Cancel handover
  const handleTranferEmptyDevice = async () => {
    try {
      MySwal.fire({
        title: "Xóa bàn giao thiết bị",
        text: `Bạn có chắc chắn muốn chuyển trạng thái các thiết bị này thành các thiết bị chưa sử dụng không?`,
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy bỏ",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await Promise.all(
            selectedDevices.map((id) =>
              axios.post(
                `http://localhost:8080/api/v1/devices/transfer-empty-status/${id}`,
                {},
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
            )
          );
          MySwal.fire("Thành công", "Thiết bị đã được chuyển trạng thái!", "success");
          setSelectedDevices([]);
          fetchDevices("CHUA_SU_DUNG");
          handleSearch();
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        MySwal.fire("Lỗi", "Không tìm thấy thiết bị!", "error");
        return;
      }
      setSelectedDevices([]);
    }
  };

  // Search devices
  const handleSearchInfor = async (e) => {
    e.preventDefault();
    if (new Date(fromDate) > new Date(toDate)) {
      MySwal.fire("Lỗi", "Ngày bắt đầu không thể vượt quá ngày kết thúc", "error");
      setFromDate("");
      setToDate("");
      return;
    }
    const query = new URLSearchParams();
    if (serialNumber) query.append("serialNumber", serialNumber);
    if (fromDate) query.append("fromDate", new Date(fromDate));
    if (toDate) query.append("toDate", new Date(toDate));
    if (categoryId) query.append("categoryId", categoryId);
    if (ownerId) query.append("ownerId", ownerId);
    if (status) query.append("status", status);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/devices/search-device?${query.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.length <= 0) {
        MySwal.fire("Thông báo", "Không tồn tại thiết bị cần tìm", "info");
        setFromDate("");
        setToDate("");
        setSerialNumber("");
        setCategoryId("");
        setSelectedDevices([]);
      }
      setDeviceList(response.data);
      setSelectedDevices([]);
    } catch (error) {
      MySwal.fire("Lỗi", "Không thể tìm kiếm thiết bị!", "error");
    }
  };

  // Save signature
  const saveSignature = async (assignmentId, useExisting = false) => {
    try {
      if (useExisting) {
        // Sử dụng chữ ký có sẵn
        const response = await axios.post(
          `http://localhost:8080/api/v1/devices/sign/${assignmentId}`,
          {}, // Không gửi chữ ký
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          setSignedAssignments((prev) => ({
            ...prev,
            [assignmentId]: userSignature, // Lưu chữ ký để hiển thị
          }));
          MySwal.fire("Thành công", "Bàn giao thành công!", "success");
          // fetchAssignments();
        } else {
          MySwal.fire("Lỗi", "API trả về không thành công!", "error");
        }
      } else {
        // Vẽ chữ ký mới
        if (!sigCanvas.current) {
          MySwal.fire("Lỗi", "Không thể truy cập canvas chữ ký!", "error");
          return;
        }
        if (sigCanvas.current.isEmpty()) {
          MySwal.fire("Lỗi", "Vui lòng vẽ chữ ký!", "error");
          return;
        }

        const signatureData = sigCanvas.current.toDataURL("image/png");
        console.log("Signature Data URL:", signatureData);
        const response = await fetch(signatureData);
        if (!response.ok) {
          throw new Error("Không thể chuyển đổi dữ liệu chữ ký thành Blob");
        }
        const blob = await response.blob();
        const formData = new FormData();
        formData.append("signature", blob, "signature.png");

        const apiResponse = await axios.post(
          `http://localhost:8080/api/v1/devices/sign/${assignmentId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (apiResponse.data.success) {
          setSignedAssignments((prev) => ({
            ...prev,
            [assignmentId]: signatureData,
          }));
          setUserSignature(signatureData); // Cập nhật chữ ký có sẵn
          MySwal.fire("Thành công", "Bàn giao thành công!", "success");
          sigCanvas.current.clear();
          // fetchAssignments();
        } else {
          MySwal.fire("Lỗi", "API trả về không thành công!", "error");
        }
      }
    } catch (error) {
      console.error("Lỗi khi lưu chữ ký:", error);
      MySwal.fire("Lỗi", `Không thể lưu chữ ký: ${error.message}`, "error");
    }
  };

  // Fetch assignments for signed status
  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/devices/assignments",
        {
          params: { status: "PENDING" },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssignmentIds(response.data.data.map((assignment) => assignment.id));
    } catch (error) {
      MySwal.fire("Lỗi", "Không thể tải danh sách bàn giao!", "error");
    }
  };

  // View PDF
  const viewPdf = async (assignmentId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/devices/${assignmentId}/download-pdf`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
      MySwal.fire("Thành công", "Đã mở biên bản bàn giao!", "success");
    } catch (error) {
      MySwal.fire("Lỗi", "Không thể mở biên bản bàn giao!", "error");
    }
  };

  // Load devices when status changes
  useEffect(() => {
    if (step === 3) {
      fetchDevices(status);
    }
  }, [status, step]);

  // Date validation
  useEffect(() => {
    if (new Date(fromDate) > new Date(toDate)) {
      MySwal.fire("Lỗi", "Ngày bắt đầu không thể vượt quá ngày kết thúc", "error");
      setFromDate("");
      setToDate("");
    }
  }, [fromDate, toDate]);

  // Progress Bar Component
  const ProgressBar = () => (
    <div className="flex items-center justify-center w-full py-6 bg-gray-100">
      {steps.map((stepName, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                index + 1 <= step ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-sm mt-2 text-center">{stepName}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-1 w-24 mx-2 ${
                index + 1 < step ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Render step components
  const renderStep1 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md w-full flex justify-center items-center h-[calc(100vh-96px)]">
      <div className="max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Bước 1: Tìm kiếm nhân viên
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Mã nhân viên
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập mã nhân viên..."
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md w-full h-[calc(100vh-96px)] no-scrollbar">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Bước 2: Thông tin nhân viên
      </h2>
      {userInfo ? (
        <div>
          <div className="mb-6">
            <p className="text-lg">
              <span className="font-bold">Mã nhân viên:</span>{" "}
              {userInfo.id || "Chưa có dữ liệu"}
            </p>
            <p className="text-lg">
              <span className="font-bold">Tên nhân viên:</span>{" "}
              {userInfo.name || "Chưa có dữ liệu"}
            </p>
            <p className="text-lg">
              <span className="font-bold">Phòng ban:</span> Dev
            </p>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Thiết bị đang sở hữu:</h3>
            {userInfo.listDevice?.length > 0 ? (
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">
                      STT
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Serial Number
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userInfo.listDevice.map((device, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 p-2">{device}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">Không có thiết bị nào.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Không tìm thấy thông tin nhân viên.</p>
      )}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(1)}
          className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Quay lại
        </button>
        <button
          onClick={() => setStep(3)}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md w-full h-[calc(100vh-96px)] flex">
      <div className="w-1/3 pr-4 border-r border-gray-300">
        <h3 className="text-lg font-bold mb-4">Tìm kiếm thiết bị</h3>
        <form onSubmit={handleSearchInfor}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Mã nhân viên
            </label>
            <input
              type="text"
              name="ownerId"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              onInput={handleInput}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mã nhân viên"
            />
            {ownerIdError && (
              <p className="text-red-500 text-sm mt-1">{ownerIdError}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Từ ngày
            </label>
            <input
              type="text"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = "text")}
              onKeyDown={(e) => e.preventDefault()}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Từ ngày"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Đến ngày
            </label>
            <input
              type="text"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = "text")}
              onKeyDown={(e) => e.preventDefault()}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Đến ngày"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Serial Number
            </label>
            <input
              type="text"
              name="serialNumber"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              onInput={handleInput}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Serial Number"
            />
            {serialNumberError && (
              <p className="text-red-500 text-sm mt-1">{serialNumberError}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Danh mục
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Trạng thái thiết bị
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="CHUA_SU_DUNG">Chưa sử dụng</option>
              <option value="DA_SU_DUNG">Đã sử dụng</option>
              <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={serialNumberError || ownerIdError}
            className={`w-full py-2 px-4 rounded-md ${
              serialNumberError || ownerIdError
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-900"
            }`}
          >
            Tìm kiếm
          </button>
        </form>
      </div>
      <div className="w-2/3 pl-4 no-scrollbar">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Bước 3: Chọn thiết bị
        </h2>
        <div className="flex justify-end mb-4">
          {selectedDevices.length > 0 ? (
            <>
              <button
                onClick={handleTranferEmptyDevice}
                className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 mr-2"
              >
                Xóa bàn giao
              </button>
            </>
          ) : (
            <>
              <button
                disabled
                className="py-2 px-4 bg-red-300 text-white rounded-md mr-2"
              >
                Xóa bàn giao
              </button>
            </>
          )}
        </div>
        {loading ? (
          <p className="text-center">Đang tải danh sách thiết bị...</p>
        ) : deviceList.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left"></th>
                <th className="border border-gray-300 p-2 text-left">
                  Serial Number
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Tên danh mục
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {deviceList.map((device, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="checkbox"
                      checked={selectedDevices.includes(device[0])}
                      onChange={() => handleCheckboxChange(device[0])}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">{device[0]}</td>
                  <td className="border border-gray-300 p-2">{device[1]}</td>
                  <td className="border border-gray-300 p-2">
                    {device[5] === "DA_SU_DUNG" ? (
                      <span className="text-green-500">Đã sử dụng</span>
                    ) : device[5] === "CHO_XAC_NHAN" ? (
                      <span className="text-yellow-500">Chờ xác nhận</span>
                    ) : (
                      <span className="text-red-500">Chưa sử dụng</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500">
            Không có thiết bị nào phù hợp.
          </p>
        )}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(2)}
            className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Quay lại
          </button>
          <button
            onClick={() => setStep(4)}
            disabled={selectedDevices.length === 0}
            className={`py-2 px-4 rounded-md ${
              selectedDevices.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md w-full h-[calc(100vh-96px)] no-scrollbar">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Bước 4: Xác nhận bàn giao
      </h2>
      <div>
        <h3 className="text-lg font-bold">Thông tin nhân viên:</h3>
        <p>
          <span className="font-bold">Mã nhân viên:</span>{" "}
          {userInfo?.id || "Chưa có dữ liệu"}
        </p>
        <p>
          <span className="font-bold">Tên nhân viên:</span>{" "}
          {userInfo?.name || "Chưa có dữ liệu"}
        </p>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-bold">Thiết bị được chọn:</h3>
        {selectedDevices.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">STT</th>
                <th className="border border-gray-300 p-2 text-left">
                  Serial Number
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedDevices.map((serial, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{serial}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Không có thiết bị nào được chọn.</p>
        )}
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(3)}
          className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Quay lại
        </button>
        <button
          onClick={handleAddDeviceForUser}
          disabled={loading}
          className={`py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Đang xử lý..." : "Xác nhận bàn giao"}
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="bg-white p-6 rounded-lg shadow-md w-full h-[calc(100vh-96px)] no-scrollbar">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Bước 5: Ký hợp đồng
      </h2>
      <div>
        <h3 className="text-lg font-bold">Danh sách bàn giao:</h3>
        {assignmentIds.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">STT</th>
                <th className="border border-gray-300 p-2 text-left">Mã bàn giao</th>
                <th className="border border-gray-300 p-2 text-left">Người bàn giao</th>
                <th className="border border-gray-300 p-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {assignmentIds.map((id, index) => (
                <tr key={id}>
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{id}</td>
                  <td className="border border-gray-300 p-2">
                    {signedAssignments[id] ? (
                      <img
                        src={signedAssignments[id]}
                        alt="Chữ ký"
                        className="h-10 w-auto"
                      />
                    ) : (
                      <span className="text-gray-500">Chưa ký</span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => viewPdf(id)}
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 mr-2"
                    >
                      Xem PDF
                    </button>
                    {userSignature && !signedAssignments[id] ? (
                      <>
                        <button
                          onClick={() => saveSignature(id, true)}
                          className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 mr-2"
                        >
                          Sử dụng chữ ký hiện tại
                        </button>
                        <button
                          onClick={() => saveSignature(id, false)}
                          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
                        >
                          Vẽ chữ ký mới
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => saveSignature(id, false)}
                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700"
                        disabled={signedAssignments[id]}
                      >
                        Ký
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Không có bàn giao nào.</p>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-bold">Chữ ký:</h3>
        {userSignature ? (
          <div>
            <img
              src={userSignature}
              alt="Chữ ký hiện tại"
              className="border border-gray-300 mb-4"
              style={{ width: "500px", height: "200px", objectFit: "contain" }}
            />
          </div>
        ) : (
          <div>
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{ width: 500, height: 200, className: "sigCanvas border border-gray-300" }}
            />
            <button
              onClick={() => sigCanvas.current.clear()}
              className="mt-2 bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700"
            >
              Xóa chữ ký
            </button>
          </div>
        )}
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(4)}
          className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Quay lại
        </button>
        <button
          onClick={() => {
            setStep(1);
            setUsername("");
            setUserInfo(null);
            setSelectedDevices([]);
            setDeviceList([]);
            setAssignmentIds([]);
            setSignedAssignments({});
            setUserSignature(null);
          }}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Hoàn tất
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      <style jsx>{`
        .no-scrollbar {
          overflow-y: auto;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <ProgressBar />
      <div className="flex-1 p-4 no-scrollbar">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>
    </div>
  );
};

export default UserProduct;