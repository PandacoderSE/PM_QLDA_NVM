import React, { useEffect, useState } from "react";

import Modal from "@mui/material/Modal";
import ScrollToTopButton from "../Default/ScrollToTopButton";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Pagination_T from "../Default/Pagination";
import {
  MdDelete,
  MdAssignment,
  MdList,
  MdArrowDropDown,
  MdSearch,
} from "react-icons/md"; // Import Material Icons

import AnimatedCard from "../Animation/AnimatedCard";
import { getToken } from "../Services/localStorageService";
import handleAlert from "../Alert/handleAlert";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const UserProduct = () => {
  const [username, setUsername] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [status, setStatus] = useState("DA_SU_DUNG");
  const [serialNumber, setSerialNumber] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [serialNumberError, setSerialNumberError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [ownerIdError, setOwnerIdError] = useState("");
  const token = getToken();

  // Xử lý thông tin của thông báo, cứ 3 giây sẽ tắt thông báo popup hiện lên
  const [alert, setAlert] = useState({ message: "", type: "" });
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 3000);
  };
  // Kết thúc xử lý thông tin của thông báo, cứ 3 giây sẽ tắt thông báo popup hiện lên

  // Kiểm tra validation cho các trường dữ liệu
  const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/g;
  const numberRegex = /\d/;
  const validateField = (value, isNameField) => {
    if (isNameField && !value) {
      return "Trường này không được để trống !";
    }
    if (specialCharactersRegex.test(value)) {
      return "Dữ liệu không được chứa ký tự đặc biệt";
    }
    return "";
  };

  // Xử lý các trường input
  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name === "serialNumber") {
      setSerialNumber(value);
      setSerialNumberError(validateField(value, false));
    }
    if (name === "ownerId") {
      setOwnerId(value);
      setOwnerIdError(validateField(value, false));
    }
    if (name === "username") {
      setUsername(value);
      setUsernameError(validateField(value, true));
    }
  };
  // Kết thúc kiểm tra validation cho các trường dữ liệu

  // Chuẩn date: dd/mm/yyyy
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  // Kết thúc format chuẩn date: dd/mm/yyyy

  // Xử lý việc ẩn hiện modal
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  // Kết thúc xử lý việc ẩn hiện modal

  // Lấy toàn bộ danh sách thiết bị theo trạng thái
  useEffect(() => {
    fetchDevices(status);
  }, [status]);
  // Kết thúc lấy toàn bộ danh sách thiết bị theo trạng thái

  // Mỗi khi trạng thái thiết bị thay đổi, thì toàn bộ các checkbox được chọn sẽ hết check
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setSelectedDevices([]);
  };
  // Kết thúc mỗi khi trạng thái thiết bị thay đổi, thì toàn bộ các checkbox được chọn sẽ hết check

  // API get danh sách thiết bị theo trạng thái : "DA SU DUNG" // "CHUA SU DUNG" // "chờ sử dụng"
  const fetchDevices = async (status) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/devices/by-status/${status}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setDeviceList(response.data.data);
      setSelectedDevices([]);
    } catch (error) {
      showAlert("Có lỗi khi lấy dữ liệu !", "error");
      setSelectedDevices([]);
    }
  };
  // Kết thúc API get danh sách thiết bị theo trạng thái : "DA SU DUNG" // "CHUA SU DUNG"

  // Kéo sidebar và xử lý phân trang
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(() => {
    const savedState = localStorage.getItem("isDrawerOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(!isDrawerOpen);
    localStorage.setItem("isDrawerOpen", JSON.stringify(newState));
  };
  const [selected, setSelected] = useState("qr-code-manager");
  const handleSelect = (page) => setSelected(page);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

    // Quản lý phân trang
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = deviceList.slice(startIndex, endIndex); // Trong tbody, sử dụng currentItems.map để đổ dữ liệu lên
  // Kết thúc Kéo sidebar và xử lý phân trang

  //   Xử lý việc tìm kiếm thông tin người dùng
  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/user/getUserDevice/${username}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      console.log(response.data.data) ; 
      setUserInfo(response.data.data);
      if (response.data.data.length > 0) {
        handleAlert("Thành công", "", "success", "OK");
        fetchDevices("DA_SU_DUNG");
      } else {
        handleAlert("", `Người dùng ${username} không sở hữu thiết bị nào, thực hiện bàn giao thiết bị ngay`, "info", "OK");
        fetchDevices("DA_SU_DUNG");
      }
      setSelectedDevices([]);
      setIsUserOpen(true);
    } catch (error) {
        handleAlert("Không tìm thấy", "Người dùng không tồn tại trong hệ thống", "error", "OK");
      setIsUserOpen(false);
      setUserInfo({});
      setSelectedDevices([]);
    }
  };
  //   Kết thúc Xử lý việc tìm kiếm thông tin người dùng

  // Handle list device
  const handleListDevice = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/devices/by-status`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setDeviceList(response.data.data);
      if (response.data.data.length > 0) {
        handleAlert("Thành công", "Lấy danh sách sản phẩm thành công", "success", "OK");
      } else {
        handleAlert("Không tìm thấy", "Không tồn tại sản phẩm nào chưa sử dụng, vui lòng thử lại !", "info", "OK");
      }
    } catch (error) {
      handleAlert("Không tìm thấy", "Có lỗi trong quá trình lấy dữ liệu", "error", "OK");
    }
  };

  // Xử lý việc chọn checkbox
  const handleCheckboxChange = (categoryId) => {
    setSelectedDevices((prevState) =>
      prevState.includes(categoryId)
        ? prevState.filter((id) => id !== categoryId)
        : [...prevState, categoryId]
    );
  };
  // Kết thúc Xử lý việc chọn checkbox

  // Bàn giao thiết bị cho người dùng
  const handleAddDeviceForUser = async () => {
    try {
      await Promise.all(
        selectedDevices.map((id) =>
          axios.post(
            `http://localhost:8080/api/v1/devices/set-device`,
            {
              serial_number: id,
              owner_id: username,
            },
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          )
        )
      );
      handleAlert("Thành công", "Bàn giao thiết bị thành công !", "success", "OK")
      setSelectedDevices([]);
      handleSearch();
      fetchDevices("CHO_SU_DUNG");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        if (userInfo.some((user) => user[2] === selectedDevices[0])) {
          handleAlert("Thông báo", "Bạn đang dùng thiết bị này rồi, không cần phải bàn giao nữa!", "info", "OK");
        } else {
          withReactContent(Swal)
            .fire({
              title: "Thiết bị đã có người sử dụng",
              text: `Bạn có chắc chắn muốn bàn giao thiết bị này cho nhân viên có mã ${username} không?`,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Đồng ý",
              cancelButtonText: "Hủy bỏ",
            })
            .then(async (result) => {
              if (result.isConfirmed) {
                await Promise.all(
                  selectedDevices.map((id) =>
                    axios.post(
                      `http://localhost:8080/api/v1/devices/transfer-device`,
                      {
                        serial_number: id,
                        owner_id: username,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${getToken()}`,
                        },
                      }
                    )
                  )
                );
                handleAlert("Thành công", "Thiết bị đã được bàn giao!", "success")
                setSelectedDevices([]);
                handleSearch();
                fetchDevices("DA_SU_DUNG");
              }
            });
        }

        return;
      }
      if (error.response && error.response.status === 404) {
        handleAlert("Lỗi", "Không tìm thấy thiết bị !", "error");
        return;
      }
      setSelectedDevices([]);
    }
  };
  useEffect(() => {
    if (new Date(fromDate) > new Date(toDate)) {
      handleAlert("Không tìm thấy", "Ngày bắt đầu không thể vượt quá ngày kết thúc", "error", "OK");
      setFromDate("");
      setToDate("");
    }
  }, [fromDate, toDate]);

  // Xử lý việc tìm kiếm thông tin thiết bị
  const handleSearchInfor = async (e) => {
    e.preventDefault();
    // Kiểm tra fromDate không lớn hơn toDate
    if (new Date(fromDate) > new Date(toDate)) {
      handleAlert("Không tìm thấy", "Ngày bắt đầu không thể vượt quá ngày kết thúc", "error", "OK");
      setFromDate("");
      setToDate("");
    }
    const query = new URLSearchParams();
    if (serialNumber) query.append("serialNumber", serialNumber);
    if (fromDate) query.append("fromDate", new Date(fromDate));
    if (toDate) query.append("toDate", new Date(toDate));
    if (categoryId) query.append("categoryId", categoryId);
    if (ownerId) query.append("ownerId", ownerId);
    if (status) query.append("status", status);

    // Gửi yêu cầu tìm kiếm tới API backend
    const response = await axios.get(
      `http://localhost:8080/api/v1/devices/search-device?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
      {}
    );
    if (response.data.length <= 0) {
      handleAlert("Không tìm thấy", "Không tồn tại thiết bị cần tìm", "info", "OK");
      setFromDate("");
      setToDate("");
      setSerialNumber("");
      setCategoryId("");
      setSelectedDevices([]);
    }
    console.log(response.data) ; 
    setDeviceList(response.data);
    setSelectedDevices([]);
  };

  // Xử lý việc xóa bàn giao thiết bị
  const handleTranferEmptyDevice = async () => {
    try {
      withReactContent(Swal)
        .fire({
          title: "Xóa bàn giao thiết bị",
          text: `Bạn có chắc chắn muốn chuyển trạng thái các thiết bị này thành các thiết bị chưa sử dụng không ?`,
          icon: "error",
          showCancelButton: true,
          confirmButtonText: "Đồng ý",
          cancelButtonText: "Hủy bỏ",
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            await Promise.all(
              selectedDevices.map((id) =>
                axios.post(
                  `http://localhost:8080/api/v1/devices/transfer-empty-status/${id}`,
                  {},
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                      )}`,
                    },
                  }
                )
              )
            );
            handleAlert("Thành công", "Thiết bị đã được chuyển trạng thái !", "success");
            setSelectedDevices([]);
            fetchDevices("CHUA_SU_DUNG");
            handleSearch();
          }
        });
      // handleSearch();
      return;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        handleAlert("Lỗi", "Không tìm thấy thiết bị !", "error")
        return;
      }
      setSelectedDevices([]);
    }
  };

  // Gửi yêu cầu lấy danh sách danh mục khi component được mount
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await axios.get (
        "http://localhost:8080/api/v1/categories/all",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      const data = response.data.data;
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Hàm chuyển đổi base64 thành URL đối tượng
  const base64ToImage = (base64) => {
    return `data:image/png;base64,${base64}`;
  };

  // Xử lý khi ấn nút Edit
  const handleEditClick = async (categoryId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/devices/get-device/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setSelectedProduct(response.data.data);
      setIsModalOpen(true);
    } catch (error) {
      showAlert("Có lỗi khi tìm dữ liệu !!");
    }
  };
  const { 
    email = "Chưa có dữ liệu", 
    name = "Chưa có dữ liệu", 
    phone = "Chưa có dữ liệu", 
    id = "Chưa có dữ liệu", 
    listDevice = [], 
  } = userInfo || {};
  return (
    <AnimatedCard animationType={"slideUp"} duration={0.5}>
      <div className="flex h-screen">
        {/* Side bar */}
        <main className="ease-soft-in-out xl:ml-68.5 relative h-full max-h-screen rounded-xl transition-all duration-200 w-full">
          {/* Navigation */}
          <main className="ease-soft-in-out xl:ml-68.5 relative h-full max-h-screen rounded-xl transition-all duration-200">
            <h3 className="text-center font-bold text-2xl">
              BÀN GIAO THIẾT BỊ
            </h3>
            <div className="mt-4 ">
              {/* Search input */}
              <div className="flex items-center flex-col">
                <div>
                  {/* Search input */}
                  <div className="flex mx-auto" style={{ width: "100%" }}>
                    <input
                      type="text"
                      id="default-search"
                      className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Mã nhân viên..."
                      value={username}
                      name="username"
                      onChange={(e) => setUsername(e.target.value)}
                      onInput={handleInput}
                      required
                    />
                    {usernameError ? (
                      <button
                        onClick={handleSearch}
                        disabled
                        className="ml-10 p-4 text-white bg-gray-400  focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        <MdSearch size={24} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSearch}
                        className="ml-10 p-4 text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        <MdSearch size={24} />
                      </button>
                    )}
                  </div>
                  {usernameError && (
                    <p style={{ color: "red" }}>{usernameError}</p>
                  )}
                </div>
                  <div className="flex justify-between mt-5 mx-auto w-11/12">
                    <div className="flex flex-col">
                      <h1 className="text-2xl font-bold">
                        Thông tin nhân viên:
                      </h1>
                      <p className="p-4 text-xl text-gray-700 dark:text-gray-400">
                        <span className="text-xl font-bold">
                          Mã nhân viên:{" "}
                        </span>
                        {id}
                      </p>
                      <p className="p-4 text-xl font-normal text-gray-700 dark:text-gray-400">
                        <span className="text-xl font-bold">
                          Tên nhân viên:{" "}
                        </span>
                        {name}
                      </p>
                      <p className="p-4 text-xl font-normal text-gray-700 dark:text-gray-400">
                        <span className="text-xl font-bold">Phòng ban: dev</span>
                        {/* {userInfo?.length > 0 ? userInfo[0][3] : "..."} */}
                      </p>
                    </div>

                    <div className="w-1/2">
                      <div className="w-full flex flex-col">
                        <span className="text-2xl font-bold">
                          Đang sở hữu thiết bị với mã:
                        </span>
                        <table className="table-auto border-collapse w-full mt-4">
                          <thead>
                            <tr>
                              <th className="text-lg border px-4 py-2">STT</th>
                              <th className="text-lg border px-4 py-2">
                                Serial Number
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                          {listDevice.length > 0 ? (
                            listDevice.map((device, index) => (
                                <tr key={index}>
                                  <td className="text-lg border px-4 py-2 text-center">
                                    {index + 1}
                                  </td>
                                  <td className="text-lg border px-4 py-2 text-center">
                                    {device}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <></>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
    
              </div>

              <hr className="mt-4" />
              {isUserOpen && (
                <div className="">
                  <h3 className="text-center font-bold text-2xl mt-6">
                    DANH SÁCH THIẾT BỊ
                  </h3>
                  <div className="flex gap-8">
                    {/* Form search device */}
                    <div
                      className="border-r-2"
                      style={{ width: "30%", marginTop: "80px" }}
                    >
                      <form onSubmit={handleSearchInfor}>
                        <main className="px-4 sm:px-6 lg:px-8 mt-3 mx-auto">
                          <div className="flex items-center w-full h-100 flex-1">
                            <div className="flex items-center flex-1 ml-4 cursor-pointer w-full">
                              <div className="w-full">
                                <div>
                                  <input
                                    type="text"
                                    id="ownerId"
                                    name="ownerId"
                                    value={ownerId}
                                    onChange={(e) => setOwnerId(e.target.value)}
                                    onInput={handleInput}
                                    className="block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder="Mã nhân viên"
                                  />
                                  {ownerIdError && (
                                    <p style={{ color: "red" }}>
                                      {ownerIdError}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center w-full h-100 flex-1 mt-3">
                            <div className="flex items-center flex-1 ml-4 cursor-pointer w-full">
                              <div className="w-full">
                                <div>
                                  <input
                                    type="text"
                                    id="fromDate"
                                    placeholder="Từ ngày"
                                    value={fromDate}
                                    onChange={(e) =>
                                      setFromDate(e.target.value)
                                    }
                                    onFocus={(e) => (e.target.type = "date")}
                                    onBlur={(e) => (e.target.type = "text")}
                                    onKeyDown={(e) => e.preventDefault()}
                                    className="block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center w-full h-100 flex-1 mt-3">
                            <div className="flex items-center flex-1 ml-4 cursor-pointer w-full">
                              <div className="w-full">
                                <div>
                                  <input
                                    type="text"
                                    id="toDate"
                                    value={toDate}
                                    placeholder="Đến ngày"
                                    onChange={(e) => setToDate(e.target.value)}
                                    onFocus={(e) => (e.target.type = "date")}
                                    onBlur={(e) => (e.target.type = "text")}
                                    onKeyDown={(e) => e.preventDefault()}
                                    className="block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </main>
                        <main className="px-4 sm:px-6 lg:px-8 mt-3 mx-auto">
                          <div className="flex items-center w-full h-100 flex-1">
                            <div className="flex items-center flex-1 ml-4 cursor-pointer w-full">
                              <div className="w-full">
                                <div>
                                  <input
                                    type="text"
                                    id="serialNumber"
                                    name="serialNumber"
                                    value={serialNumber}
                                    onChange={(e) =>
                                      setSerialNumber(e.target.value)
                                    }
                                    onInput={handleInput}
                                    className="block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                    placeholder="Serial number"
                                  />
                                  {serialNumberError && (
                                    <p style={{ color: "red" }}>
                                      {serialNumberError}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </main>
                        <main className="px-4 sm:px-6 lg:px-8 mt-3 mx-auto">
                          <div className="flex items-center w-full h-100 flex-1">
                            <div className="flex items-center flex-1 ml-4 cursor-pointer w-full">
                              <div className="w-full relative">
                                <form className="w-100">
                                  <select
                                    id="category"
                                    value={categoryId}
                                    onChange={(e) =>
                                      setCategoryId(e.target.value)
                                    }
                                    className="block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                  >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map((category) => (
                                      <option
                                        key={category.id}
                                        value={category.id}
                                      >
                                        {category.name}
                                      </option>
                                    ))}
                                  </select>
                                  <MdArrowDropDown
                                    className="absolute top-1/2 transform -translate-y-1/2 right-0 flex items-center pointer-events-none"
                                    size={24}
                                  />
                                </form>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center w-full h-100 flex-1 mt-3">
                            <div className="flex items-center flex-1 ml-4 cursor-pointer w-full">
                              <div className="w-full">
                                <form className="w-100 relative">
                                  <select
                                    id="status"
                                    onChange={handleStatusChange}
                                    className="block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                  >
                                    <option
                                      selected={status === "DA_SU_DUNG"}
                                      value="DA_SU_DUNG"
                                    >
                                      Đã sử dụng
                                    </option>
                                    <option
                                      selected={status === "CHUA_SU_DUNG"}
                                      value="CHUA_SU_DUNG"
                                    >
                                      Chưa sử dụng
                                    </option>
                                    <option
                                      selected={status === "CHO_XAC_NHAN"}
                                      value="CHO_XAC_NHAN"
                                    >
                                      Chờ xác nhận
                                    </option>
                                  </select>
                                  <MdArrowDropDown
                                    className="absolute top-1/2 transform -translate-y-1/2 right-0 flex items-center pointer-events-none"
                                    size={24}
                                  />
                                </form>
                              </div>
                            </div>
                          </div>
                        </main>
                        {serialNumberError || ownerIdError ? (
                          <div className="w-full flex justify-center mt-5">
                            <button
                              type="submit"
                              disabled
                              className="font-bold text-white bg-gray-400                                                                                                                                                                                                                                                                                                                                                                                                    focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                            >
                              Tìm kiếm
                            </button>
                          </div>
                        ) : (
                          <div className="w-full flex justify-center mt-5">
                            <button
                              type="submit"
                              className="font-bold text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                            >
                              Tìm kiếm
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                    <hr className="mt-4" />
                    <div className="relative overflow-x-auto mt-3 flex-1">
                      <div className="flex items-center justify-end">
                        {selectedDevices.length > 0 ? (
                          <>
                            <button
                              title="Xóa bàn giao"
                              type="button"
                              onClick={handleTranferEmptyDevice}
                              className="bg-red-500 p-3 m-2 rounded-lg text-white hover:bg-red-600 cursor-pointer"
                            >
                              {/* <MdDelete className=""/> */}
                              Xóa bàn giao
                            </button>
                            <button
                              title="Bàn giao thiết bị"
                              type="button"
                              onClick={handleAddDeviceForUser}
                              className="bg-gray-500 p-3 m-2 rounded-lg text-white hover:bg-gray-600 cursor-pointer"
                            >
                              {/* <MdList className="" /> */}
                              Bàn giao thiết bị
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              title="Xóa bàn giao"
                              type="button"
                              disabled
                              onClick={handleTranferEmptyDevice}
                              className="bg-red-400 p-3 m-2 rounded-lg text-white"
                            >
                              {/* <MdDelete className="" /> */}
                              Xóa bàn giao
                            </button>
                            <button
                              title="Bàn giao thiết bị"
                              type="button"
                              disabled
                              onClick={handleAddDeviceForUser}
                              className="bg-gray-400 p-3 m-2 rounded-lg text-white"
                            >
                              {/* <MdList className="" /> */}
                              Bàn giao thiết bị
                            </button>
                          </>
                        )}
                      </div>

                      {deviceList.length > 0 ? (
                        <table className="w-full text-sm text-left rtl:text-right mt-2 text-gray-500 dark:text-gray-400">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th className="font-bold text-left uppercase align-middle order-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-white "></th>
                              <th scope="col" className="px-4 py-3">
                                Serial number
                              </th>
                              <th scope="col" className="px-4 py-3">
                                Tên danh mục
                              </th>
                              {/* <th scope="col" className="px-6 py-3">
                              Specification
                            </th> */}
                              {/* <th scope="col" className="px-6 py-3">
                              Ngày mua
                            </th> */}
                              {deviceList[0][5] === "DA_SU_DUNG" || deviceList[0][5] === "CHO_XAC_NHAN" ? (
                                <th scope="col" className="px-4 py-3">
                                  Mã nhân viên sử dụng
                                </th>
                              ) : (
                                <div></div>
                              )}

                              <th scope="col" className="px-4 py-3">
                                Trạng thái
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentItems.map((device, index) => (
                              <tr
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                style={
                                  username === device[4]
                                    ? {
                                        backgroundColor: "gray",
                                        color: "white",
                                      }
                                    : { backgroundColor: "white" }
                                }
                              >
                                <td className="text-center">
                                  <input
                                    id={`checkbox-table-search-${device[0]}`}
                                    type="checkbox"
                                    onclick="event.stopPropagation()"
                                    className="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    checked={selectedDevices.includes(
                                      device[0]
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(device[0])
                                    }
                                  />
                                </td>

                                <th
                                  scope="row"
                                  className="px-6 py-4 font-medium whitespace-nowrap cursor-pointer text-blue-600"
                                  onClick={() => handleEditClick(device[0])}
                                >
                                  {device[0]}
                                </th>
                                <td className="px-6 py-4">{device[1]}</td>
                                {/* <td className="px-6 py-4">{device[2]}</td> */}
                                {/* <td className="px-6 py-4">{formatDate(device[3])}</td> */}

                                <td className="px-4 py-4">
                                  {device[5] === "DA_SU_DUNG" ? (
                                    // <span className="text-red-500 font-bold">
                                    //   Chưa bàn giao
                                    // </span>
                                    device[4]
                                  ) : (
                                    <div></div>
                                  )}
                                </td>
                                <td className="px-4 py-4">
                                {device[5] === "DA_SU_DUNG" ? (
                                  <span className="text-green-500 font-bold">
                                    Đã sử dụng
                                  </span>
                                ) : device[5] === "CHO_XAC_NHAN" ? (
                                  <span className="text-yellow-500 font-bold">
                                    Chờ xác nhận
                                  </span>
                                ) : (
                                  <span className="text-red-500 font-bold">
                                    Chưa sử dụng
                                  </span>
                                )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <h3 className="font-bold text-center mt-4">
                          Chưa tồn tại thiết bị nào, vui lòng chọn tìm kiếm
                          thiết bị khác !!!{" "}
                        </h3>
                      )}

                      <Pagination_T
                        pageCount={Math.ceil(deviceList.length / itemsPerPage)}
                        onPageChange={handlePageClick}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </main>
        <ScrollToTopButton />
        {isModalOpen && (
          <Modal
            open={isModalOpen}
            onClose={closeModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 text-black"
          >
            <div className="bg-white p-5 rounded-lg">
              <h2 className="text-center text-black font-bold uppercase mb-5 mt-5 text-2xl">
                THÔNG TIN THIẾT BỊ
              </h2>
              <form>
                <div className="mb-4 text-center">
                  <p>
                    Serial number: <b>{selectedProduct[0][0]}</b>
                  </p>
                  <p>
                    Tên danh mục: <b>{selectedProduct[0][1]}</b>
                  </p>
                  <p>
                    Thông số: <b>{selectedProduct[0][2]}</b>
                  </p>
                  <p>
                    Ngày mua: <b>{formatDate(selectedProduct[0][3])}</b>
                  </p>
                  <p>
                    Accounting code: <b>{selectedProduct[0][5]}</b>
                  </p>
                  {selectedProduct[0][4] === "DA_SU_DUNG" ? (
                    <>
                      <h3 className="font-bold">Đang được sử dụng bởi: </h3>
                      <p>
                        Trạng thái:{" "}
                        {selectedProduct[0][4] === "DA_SU_DUNG"
                          ? "Đã sử dụng"
                          : "Chưa sử dụng"}
                      </p>
                      <p>
                        Mã nhân viên: <b>{selectedProduct[0][7]}</b>
                      </p>

                      <p>
                        Tên người dùng: <b>{selectedProduct[0][6]}</b>
                      </p>
                    </>
                  ) : (
                    <p>Trạng thái: Chưa sử dụng</p>
                  )}
                  <div className="flex justify-center items-center">
                    <img
                      className=""
                      src={base64ToImage(selectedProduct[0][8])}
                      alt="QR Code"
                    />
                  </div>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
    </AnimatedCard>
  );
};

export default UserProduct;
