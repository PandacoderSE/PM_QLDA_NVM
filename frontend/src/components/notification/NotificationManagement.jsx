// src/components/NotificationManager.jsx
import { useEffect, useState } from 'react';
import { MdAddCircle, MdDelete, MdInfo } from 'react-icons/md';
import { getToken } from '../Services/localStorageService';
import axios from 'axios';
import handleAlert from '../Alert/handleAlert';
import Pagination_T from '../Default/Pagination';
import ReactQuill from 'react-quill';
const NotificationManagement = () => {
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [newNotification, setNewNotification] = useState({
    title: '',
    content: '',
  });
  const [errors, setErrors] = useState({
    title: '',
    content: '',
  });
  const [isValid, setIsValid] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const handlePageClick = (data) => {
      setCurrentPage(data.selected);
    };
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = notifications.slice(startIndex, endIndex);
  const token = getToken();

  // Fetch all notifications
  useEffect(() => {
    fetchNotis();
  }, []);

  const fetchNotis = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/notifications/getAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data.data);
      

    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error('Unauthorized access');
        // Add navigation logic here if needed
      } else {
        console.error('Error fetching notifications', error);
      }
    }
  };

  // Search notifications by date range
  const handleSearch = async (e) => {
    e.preventDefault();
    // Kiểm tra tính hợp lệ của ngày
      if (new Date(searchStartDate) > new Date(searchEndDate)) {
        handleAlert("Lỗi", "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!", "error", "Đóng");
        return;
      }
    try {
      const response = await axios.get('http://localhost:8080/api/v1/notifications/getNotiDate', {
        params: {
          fromDate: searchStartDate,
          toDate: searchEndDate,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching filtered notifications', error);
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
      setSelectedNotifications(selectedNotifications.filter((notifId) => notifId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  // Delete selected notifications
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/notifications/deleteNoti/${selectedNotifications.join(',')}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(notifications.filter((notif) => !selectedNotifications.includes(notif.id)));
      setSelectedNotifications([]);
      setIsSelectAllChecked(false);
    } catch (error) {
      console.error('Error deleting notifications', error);
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
    setNewNotification({ title: '', content: ''});
  };

  // Update new notification fields
  const handleNewNotificationChange = (e) => {
    const { name, value } = e.target;
    setNewNotification((prev) => ({ ...prev, [name]: value }));
  
  };
  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
  
    // Cập nhật lỗi ngay khi người dùng rời khỏi trường nhập liệu
    setErrors((prevErrors) => {
      let newError = { ...prevErrors };
      if (name === 'title') {
        newError.title =
          value.length > 10 ? '' : 'Tiêu đề phải có hơn 10 ký tự.';
      }
      if (name === 'content') {
        newError.content =
          value.length > 10 ? '' : 'Nội dung phải có hơn 10 ký tự.';
      }
      return newError;
    });
  
    // Xác nhận tính hợp lệ của toàn bộ form
    const isTitleValid =
      name === 'title' ? value.length > 10 : newNotification.title.length > 10;
    const isContentValid =
      name === 'content' ? value.length > 10 : newNotification.content.length > 10;
    setIsValid(isTitleValid && isContentValid);
  };
  
  // Confirm adding new notification
  const handleConfirmAdd = async (e) => {
    e.preventDefault(); // Ngăn hành vi mặc định của form
    if (!isValid) {
      return; // Ngừng thực thi nếu dữ liệu không hợp lệ
    }
    try {
      const response = await axios.post('http://localhost:8080/api/v1/notifications', newNotification, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Thêm thông báo mới trực tiếp vào state
      handleAlert("Thành công", "Thêm mới thành công !", "success", "OK")
      fetchNotis() ; 
      closeAddModal(); // Đóng modal
    } catch (error) {
      console.error('Lỗi khi thêm thông báo mới', error);
    }
  };
  

  // Truncate content
  const truncateContent = (content) => {
    const words = content.split(' ');
    return words.length > 3 ? `${words.slice(0, 3).join(' ')}...` : content;
  };
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0'); // Đảm bảo ngày luôn có 2 chữ số
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0 nên cần +1
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const handleClearFilter = () => {
    setSearchStartDate('');
    setSearchEndDate('');
    fetchNotis() ; 
  };
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <h3 className="text-center font-bold text-2xl mb-5">Danh Sách Thông Báo</h3>
        
        {/* Search and Action Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
          <form className="flex items-end gap-4" onSubmit={handleSearch}>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500 mb-1">Từ</label>
              <input
                type="date"
                value={searchStartDate}
                onChange={(e) => setSearchStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full md:w-40 h-10"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-500 mb-1">Đến</label>
              <input
                type="date"
                value={searchEndDate}
                onChange={(e) => setSearchEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full md:w-40 h-10"
              />
            </div>
            <button
              type="submit"
              className="p-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 h-10 w-10 flex items-center justify-center"
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
                className="flex items-center justify-center text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-2.5 py-2 h-10 w-10"
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
                <span className="sr-only"></span>
              </button>

          </form>

          <div className="flex items-end gap-2">
            <button
              onClick={handleAddNew}
              className="flex items-center justify-center text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 h-10 w-10"
            >
              <MdAddCircle size={20} />
              
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 h-10 w-10 disabled:bg-red-300"
              disabled={selectedNotifications.length === 0}
            >
              <MdDelete size={20} />
            </button>
          </div>
        </div>

        {/* Notification Table */}
        <div className="overflow-x-auto mt-5">
          <table className="rounded-lg shadow-2xl items-center w-full align-top border-collapse text-slate-500">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="p-3 border text-left bg-blue-50">
                  <input
                    type="checkbox"
                    checked={isSelectAllChecked}
                    onChange={handleSelectAllChange}
                    className="w-4 h-4"
                  />
                </th>
                <th className="p-3 border text-center font-bold bg-blue-50">ID</th>
                <th className="p-3 border text-center font-bold bg-blue-50">Tiêu đề</th>
                <th className="p-3 border text-center font-bold bg-blue-50">Nội dung</th>
                <th className="p-3 border text-center font-bold bg-blue-50">Ngày đăng</th>
                <th className="p-3 border text-center font-bold bg-blue-50">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleCheckboxChange(notification.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-3 border text-center">{notification.id}</td>
                  <td className="p-3 border text-center">{notification.title}</td>
                  <td className="p-3 border text-center">{truncateContent(notification.content)}</td>
                  <td className="p-3 border text-center">{formatDate(notification.createdTime)}</td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => handleDetailClick(notification)}
                      className="text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex items-center justify-center mx-auto"
                    >
                      <MdInfo size={20} />
                      <span className="ml-1 text-sm"></span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination_T
                        pageCount={Math.ceil(notifications.length / itemsPerPage)}
                        onPageChange={handlePageClick}
                      />
        </div>

        {/* Detail Modal */}
        {/* {isDetailModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Chi tiết thông báo</h3>
              {selectedNotification && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID:</label>
                    <p className="mt-1 text-gray-900">{selectedNotification.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tiêu đề:</label>
                    <p className="mt-1 text-gray-900">{selectedNotification.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nội dung:</label>
                    <p className="mt-1 text-gray-900">{selectedNotification.content}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày đăng:</label>
                    <p className="mt-1 text-gray-900">{formatDate(selectedNotification.createdTime)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Người đăng : </label>
                    <p className="mt-1 text-gray-900">{selectedNotification.createby}</p>
                  </div>
                </div>
              )}
              <button
                onClick={closeDetailModal}
                className="mt-6 w-full text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Đóng
              </button>
            </div>
          </div>
        )} */}
        {isDetailModalOpen && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-xl">
      <h3 className="text-2xl font-bold text-blue-600 flex items-center gap-3 mb-6">
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
            <span className="text-sm font-medium text-gray-600">📋 ID:</span>
            <p className="text-gray-800 text-base">{selectedNotification.id}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">🏷️ Tiêu đề:</span>
            <p className="text-gray-800 text-base">{selectedNotification.title}</p>
          </div>
          {/* <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-600">📜 Nội dung:</span>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                {selectedNotification.content}
              </p>
            </div>
          </div> */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-600">📜 Nội dung:</span>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              <div
                className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: selectedNotification.content }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">📅 Ngày đăng:</span>
            <p className="text-gray-800 text-base">{formatDate(selectedNotification.createdTime)}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">✍️ Người đăng:</span>
            <p className="text-gray-800 text-base">{selectedNotification.createby}</p>
          </div>
        </div>
      )}
      <button
        onClick={closeDetailModal}
        className="mt-8 w-full text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-semibold rounded-lg text-sm px-5 py-3"
      >
        Đóng
      </button>
    </div>
  </div>
)}


        {/* Add Modal */}
        {/* {isAddModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Thêm Thông Báo Mới</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tiêu đề:</label>
                  <input
                    type="text"
                    name="title"
                    value={newNotification.title}
                    onChange={handleNewNotificationChange}
                    onBlur={handleFieldBlur}
                    className="mt-1 border rounded-lg px-3 py-2 w-full"
                    placeholder="Enter title"
                  />
                  {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nội dung:</label>
                  <textarea
                    name="content"
                    value={newNotification.content}
                    onChange={handleNewNotificationChange}
                    onBlur={handleFieldBlur}
                    className="mt-1 border rounded-lg px-3 py-2 w-full h-24 resize-y"
                    placeholder="Enter content"
                  />
                </div>
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  className="flex-1 text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Gửi
                </button>
                <button
                  onClick={closeAddModal}
                  className="flex-1 text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )} */}
        {isAddModalOpen && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
      <h3 className="text-2xl font-bold text-blue-600 flex items-center gap-3 mb-6">
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
          <label className="block text-sm font-medium text-gray-600">📋 Tiêu đề:</label>
          <input
            type="text"
            name="title"
            value={newNotification.title}
            onChange={handleNewNotificationChange}
            onBlur={handleFieldBlur}
            className="mt-2 border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-300 focus:outline-none"
            placeholder="Nhập tiêu đề"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-2">{errors.title}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">📜 Nội dung:</label>
          <textarea
            name="content"
            value={newNotification.content}
            onChange={handleNewNotificationChange}
            onBlur={handleFieldBlur}
            className="mt-2 border rounded-lg px-4 py-3 w-full h-32 resize-none focus:ring-2 focus:ring-blue-300 focus:outline-none"
            placeholder="Nhập nội dung"
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-2">{errors.content}</p>
          )}
        </div>
        {/* <div>
      <label className="block text-sm font-medium text-gray-600">📜 Nội dung:</label>
          <ReactQuill
            name="content"
            value={newNotification.content}
            onChange={handleNewNotificationChange}
            onBlur={handleFieldBlur}
            className="mt-2 border rounded-lg w-full h-32 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            placeholder="Nhập nội dung"
            modules={{
              toolbar: [
                [{ 'font': [] }, { 'size': [] }],
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['clean'] // Xóa định dạng
              ]
            }}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-2">{errors.content}</p>
          )}
        </div> */}
      </div>
      <div className="flex gap-4 mt-8">
        <button
          type="button"
          onClick={handleConfirmAdd}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg text-sm px-5 py-3 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Gửi
        </button>
        <button
          onClick={closeAddModal}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg text-sm px-5 py-3 focus:outline-none focus:ring-4 focus:ring-gray-400"
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