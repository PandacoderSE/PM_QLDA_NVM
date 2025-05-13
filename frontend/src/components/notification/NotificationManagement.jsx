import { useEffect, useState } from "react";
import { MdAddCircle, MdDelete, MdInfo } from "react-icons/md";
import { getToken } from "../Services/localStorageService";
import axios from "axios";
import handleAlert from "../Alert/handleAlert";
import Pagination_T from "../Default/Pagination";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const NotificationManagement = () => {
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    content: "",
  });
  const [isValid, setIsValid] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = Array.isArray(notifications)
    ? notifications.slice(startIndex, endIndex)
    : [];

  const token = getToken();

  // Check if both date fields are filled to enable buttons
  const isDateRangeFilled = searchStartDate && searchEndDate;

  // Fetch all notifications
  useEffect(() => {
    fetchNotis();
  }, []);

  const fetchNotis = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/notifications/getAll",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fetchedNotifications = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setNotifications(fetchedNotifications);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error("Unauthorized access - Invalid or missing token");
        handleAlert(
          "Lỗi",
          "Bạn không có quyền truy cập. Vui lòng kiểm tra lại thông tin đăng nhập!",
          "error",
          "Đóng"
        );
      } else {
        console.error("Error fetching notifications", error);
        handleAlert(
          "Lỗi",
          "Không thể tải danh sách thông báo. Vui lòng thử lại sau!",
          "error",
          "Đóng"
        );
      }
      setNotifications([]);
    }
  };

  // Search notifications by date range
  const handleSearch = async (e) => {
    e.preventDefault();
    if (new Date(searchStartDate) > new Date(searchEndDate)) {
      handleAlert(
        "Lỗi",
        "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!",
        "error",
        "Đóng"
      );
      return;
    }
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/notifications/getNotiDate",
        {
          params: {
            fromDate: searchStartDate,
            toDate: searchEndDate,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const filteredNotifications = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error("Error fetching filtered notifications", error);
      handleAlert(
        "Lỗi",
        "Không thể tìm kiếm thông báo. Vui lòng thử lại!",
        "error",
        "Đóng"
      );
      setNotifications([]);
    }
  };

  // Select all notifications
  const handleSelectAllChange = () => {
    if (isSelectAllChecked) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map((notif) => notif.id));
    }
    setIsSelectAllChecked(!isSelectAllChecked);
  };

  // Toggle checkbox for individual notification selection
  const handleCheckboxChange = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(
        selectedNotifications.filter((notifId) => notifId !== id)
      );
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  // Delete selected notifications
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/v1/notifications/deleteNoti/${selectedNotifications.join(
          ","
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications(
        notifications.filter(
          (notif) => !selectedNotifications.includes(notif.id)
        )
      );
      setSelectedNotifications([]);
      setIsSelectAllChecked(false);
      handleAlert("Thành công", "Xóa thông báo thành công!", "success", "OK");
    } catch (error) {
      console.error("Error deleting notifications", error);
      handleAlert("Lỗi", "Xóa thông báo thất bại!", "error", "Đóng");
    }
  };

  // Open add notification modal
  const handleAddNew = () => {
    setIsAddModalOpen(true);
  };

  // Open detail modal
  const handleDetailClick = (notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
  };

  // Close modals
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedNotification(null);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewNotification({ title: "", content: "" });
    setErrors({ title: "", content: "" });
    setIsValid(false);
  };

  // Update new notification fields
  const handleNewNotificationChange = (e) => {
    const { name, value } = e.target || { name: "content", value: e };
    setNewNotification((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    setErrors((prevErrors) => {
      let newError = { ...prevErrors };
      if (name === "title") {
        newError.title =
          value.length > 10 ? "" : "Tiêu đề phải có hơn 10 ký tự.";
      }
      if (name === "content") {
        const text = value.replace(/<[^>]+>/g, "");
        newError.content =
          text.length > 10 ? "" : "Nội dung phải có hơn 10 ký tự.";
      }
      return newError;
    });

    const isTitleValid = newNotification.title.length > 10;
    const isContentValid =
      name === "content"
        ? value.replace(/<[^>]+>/g, "").length > 10
        : newNotification.content.replace(/<[^>]+>/g, "").length > 10;
    setIsValid(isTitleValid && isContentValid);
  };

  // Confirm adding new notification
  const handleConfirmAdd = async (e) => {
    e.preventDefault();
    if (!isValid) {
      handleAlert(
        "Lỗi",
        "Vui lòng kiểm tra lại tiêu đề và nội dung!",
        "error",
        "Đóng"
      );
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/notifications",
        newNotification,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      handleAlert("Thành công", "Thêm mới thành công!", "success", "OK");
      fetchNotis();
      closeAddModal();
    } catch (error) {
      console.error("Lỗi khi thêm thông báo mới", error);
      handleAlert("Lỗi", "Thêm thông báo thất bại!", "error", "Đóng");
    }
  };

  // Truncate content
  const truncateContent = (content) => {
    const text = content.replace(/<[^>]+>/g, "");
    const words = text.split(" ");
    return words.length > 3 ? `${words.slice(0, 3).join(" ")}...` : text;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleClearFilter = () => {
    setSearchStartDate("");
    setSearchEndDate("");
    fetchNotis();
  };

  return (
    <div className="min-h-screen bg-white-100">
      <div className="container p-5">
        <h3 className="text-center font-bold text-3xl text-gray-800 mb-8">
          Danh Sách Thông Báo
        </h3>

        {/* Search and Action Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-gray-50 p-4 rounded-lg shadow-md ">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto"
          >
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Từ
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={searchStartDate}
                    onChange={(e) => setSearchStartDate(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 w-36 h-9 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.querySelector('input[type="date"][name="startDate"]').showPicker()
                    }
                  >
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Đến
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={searchEndDate}
                    onChange={(e) => setSearchEndDate(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 w-36 h-9 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.querySelector('input[type="date"][name="endDate"]').showPicker()
                    }
                  >
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={!isDateRangeFilled}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 h-9 w-9 flex items-center justify-center transition duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
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
                <span className="sr-only">Search</span>
              </button>
              <button
                type="button"
                onClick={handleClearFilter}
                disabled={!isDateRangeFilled}
                className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 h-9 w-9 flex items-center justify-center transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed mt-6"
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="sr-only">Clear</span>
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition duration-200 text-sm"
            >
              <MdAddCircle size={16} />
              Thêm mới
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 focus:ring-4 focus:ring-red-300 transition duration-200 disabled:bg-red-200 disabled:cursor-not-allowed text-sm"
              disabled={selectedNotifications.length === 0}
            >
              <MdDelete size={16} />
              Xóa
            </button>
          </div>
        </div>

        {/* Notification Card List */}
        <div className="mb-6 flex items-center gap-4 ">
          <input
            type="checkbox"
            checked={isSelectAllChecked}
            onChange={handleSelectAllChange}
            className="w-5 h-5 rounded"
          />
          <span className="text-sm font-medium text-gray-600">
            Chọn tất cả
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((notification) => (
            <div
              key={notification.id}
              className=" rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 bg-gray-50 border-t-4 border-orange-500"
            >
              <div className="flex items-center justify-between mb-4">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => handleCheckboxChange(notification.id)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm font-semibold text-gray-500">
                  ID: {notification.id}
                </span>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {notification.title}
              </h4>
              <p className="text-gray-600 mb-4">
                {truncateContent(notification.content)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {formatDate(notification.createdTime)}
                </span>
                <button
                  onClick={() => handleDetailClick(notification)}
                  className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition duration-200"
                >
                  <MdInfo size={20} />
                  Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Pagination_T
            pageCount={Math.ceil(notifications.length / itemsPerPage)}
            onPageChange={handlePageClick}
          />
        </div>

        {/* Detail Modal */}
        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-xl border-t-4 border-orange-500">
              <h3 className="text-2xl font-bold text-black-600 flex items-center gap-3 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.94 5.22a2 2 0 011.11-.34h11.9c.39 0 .77.13 1.11.34L10 10.29 2.94 5.22zM18 7.21V13a2 2 0 01-2 2H4a2 2 0 01-2-2V7.21l7.46 5.08a1 1 0 001.08 0L18 7.21z" />
                </svg>
                Thông tin chi tiết
              </h3>
              {selectedNotification && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">
                      ID:
                    </span>
                    <p className="text-gray-800 text-base">
                      {selectedNotification.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">
                      Tiêu đề:
                    </span>
                    <p className="text-gray-800 text-base">
                      {selectedNotification.title}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      Nội dung:
                    </span>
                    <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                      <div
                        className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: selectedNotification.content,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">
                      Ngày đăng:
                    </span>
                    <p className="text-gray-800 text-base">
                      {formatDate(selectedNotification.createdTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600">
                      Người đăng:
                    </span>
                    <p className="text-gray-800 text-base">
                      {selectedNotification.createby}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={closeDetailModal}
                className="mt-8 w-full text-white bg-gradient-to-r from-orange-500 to-orange-600 focus:outline-none focus:ring-4 focus:ring-blue-300 font-semibold rounded-lg text-sm px-5 py-3"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-xl border-t-4 border-orange-500">
              <h3 className="text-2xl font-bold text-black flex items-center gap-3 mb-6 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.94 5.22a2 2 0 011.11-.34h11.9c.39 0 .77.13 1.11.34L10 10.29 2.94 5.22zM18 7.21V13a2 2 0 01-2 2H4a2 2 0 01-2-2V7.21l7.46 5.08a1 1 0 001.08 0L18 7.21z" />
                </svg>
                Thêm Thông Báo Mới
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tiêu đề:</label>
                  <input
                    type="text"
                    name="title"
                    value={newNotification.title}
                    onChange={handleNewNotificationChange}
                    onBlur={() => validateField("title", newNotification.title)}
                    className="mt-1 border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Nhập tiêu đề"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nội dung:</label>
                  <ReactQuill
                    value={newNotification.content}
                    onChange={(value) =>
                      handleNewNotificationChange({ target: { name: "content", value } })
                    }
                    onBlur={() => validateField("content", newNotification.content)}
                    className="mt-1 bg-white"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ align: [] }],
                        ["clean"],
                      ],
                    }}
                    placeholder="Nhập nội dung thông báo"
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  className="flex-1 text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:orange-500-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 transition duration-200"
                >
                  Gửi
                </button>
                <button
                  onClick={closeAddModal}
                  className="flex-1 text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 transition duration-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;