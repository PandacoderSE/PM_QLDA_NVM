import React, { useState, useEffect } from "react";
import { useNavigate, useNavigation } from "react-router-dom";
import ScrollToTopButton from "../Default/ScrollToTopButton";
import Sidebar from "../Default/Sidebar";
import NavBar from "../Default/NavBar";
import Pagination_T from "../Default/Pagination";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getToken, setToken } from "../Services/localStorageService";
import Modal from "@mui/material/Modal";
import CustomAlert from "../Alert/CustomAlert.jsx";
import AnimatedCard from "../Animation/AnimatedCard";
import { TrendingUp } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import AlertInfo from "../Alert/AlertInfo";
import {
  MdAddCircle,
  MdDelete,
  MdDeleteForever,
  MdPeople,
} from "react-icons/md";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const UserrManagement = () => {
  // Alert
  const [alert, setAlert] = useState({ message: "", type: "" });
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 3000);
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [errors, setErrors] = useState({});
  const [roleed, setRoleed] = useState([]);
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  const navigate = useNavigate();
  // call list users
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = users.slice(startIndex, endIndex); // Trong tbody, sử dụng currentItems.map để đổ dữ liệu lên
  // Call API get all products
  useEffect(() => {
    fetchUsers();
  }, [setSelectedUser]);
  // Get all categories
  const token = getToken();
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/user/getAll",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate("/authed");
      }
    }
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();

    if (searchTerm === "") {
      showAlert("Cần nhập mã nhân viên để tìm kiếm", "error");
      return;
    } else {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/v1/user/getUser/${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Search:", response.data);

        // Kiểm tra và chuyển đổi giá trị trả về thành mảng nếu cần
        const usersData = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data];
        setUsers(usersData);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          navigate("/authed");
        } else {
          showAlert("Không tìm thấy User ", "error");
          fetchUsers();
        }
      }
    }
  };
  // call api xóa 1, nhiều
  const handleCheckboxChange = (userid) => {
    setSelectedUser((prevState) =>
      prevState.includes(userid)
        ? prevState.filter((id) => id !== userid)
        : [...prevState, userid]
    );
  };

  const handleDelete = async () => {
    try {
      const ids = selectedUser.join(",");
      if (ids.length <= 0) {
        showAlert("Vui lòng chọn tài khoản để xóa !", "error");
        return;
      }
      withReactContent(Swal)
        .fire({
          title: "Xác nhận",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Xác nhận",
          cancelButtonText: "Hủy bỏ",
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            await axios.delete(
              `http://localhost:8080/api/v1/user/deleteUsers/${ids}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setSelectedUser([]);
            withReactContent(Swal).fire({
              title: "Thành công",
              text: "Xóa thành công!",
              icon: "success",
              confirmButtonText: "OK",
            });
            fetchUsers();
          }
        });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate("/authed");
      } else if (error.response && error.response.status === 404) {
        showAlert("Vui lòng chọn tài khoản để xóa !", "error");
        return;
      } else {
        fetchUsers();
      }
    }
  };

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(() => {
    const savedState = localStorage.getItem("isDrawerOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const [selected, setSelected] = React.useState("user-management");

  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(!isDrawerOpen);
    localStorage.setItem("isDrawerOpen", JSON.stringify(newState));
  };
  const handleSelect = (page) => setSelected(page);

  // Open edit moal
  const openEditModal = () => {
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const [userInfo, setUserInfo] = useState({
    id: "",
    email: "",
    firstname: "",
    lastname: "",
    phone: "",
    username: "",
    password: "",
    status: "0",
    roles: [],
  });
  const validateField = (name, value) => {
    let error = "";

    if (name === "email") {
      if (!value) {
        error = "Email là bắt buộc";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = "Email không hợp lệ";
      }
    } else if (name === "firstname") {
      if (!value) {
        error = "Tên là bắt buộc";
      } else if (
        !/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/.test(
          value
        )
      ) {
        error = "Tên chỉ được chứa chữ cái";
      }
    } else if (name === "lastname") {
      if (!value) {
        error = "Họ là bắt buộc";
      } else if (
        !/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/.test(
          value
        )
      ) {
        error = "Họ chỉ được chứa chữ cái";
      }
    } else if (name === "phone") {
      if (!value) {
        error = "Số điện thoại là bắt buộc";
      } else if (!/^\d{10}$/.test(value)) {
        error = "Số điện thoại phải chứa 10 ký tự số";
      }
    } else if (name === "username") {
      if (!value) {
        error = "Tên đăng nhập là bắt buộc";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Mật khẩu là bắt buộc";
      }
    } else if (name === "id") {
      if (!value) {
        error = "Mã Nhân Viên là bắt buộc";
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Validate field on blur
    validateField(name, value);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: value, // Giữ nguyên giá trị cũ của roles nếu không có thay đổi
    }));
    if (name !== "roles") {
      validateField(name, value);
    }
    console.log(userInfo);
  };
  const handleEditClick = async (id) => {
    console.log("id user: " + id);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/user/getUser/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserInfo(response.data.data);
      setRoleed([response.data.data.roles[0].name]);
      setIsEditModalOpen(true);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate("/authed");
      } else {
        alert(" Lỗi ");
        showAlert("Lỗi", "error");
      }
    }
  };
  const handleUpdate = async (id) => {
    const validationErrors = {};
    Object.keys(userInfo).forEach((key) => {
      validateField(key, userInfo[key]);
      if (errors[key]) {
        validationErrors[key] = errors[key];
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    userInfo.roles = roleed;
    try {
      console.log(userInfo);
      const response = await axios.put(
        `http://localhost:8080/api/v1/user/updateUser/${id}`,
        userInfo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // alert('Cập nhật hồ sơ thành công');
        showAlert("Cập nhật hồ sơ thành công!!!", "success");
        closeEditModal();
      } else {
        showAlert("Cập nhật hồ sơ thất bại", "error");
        console.error("Cập nhật hồ sơ thất bại");
      }
      fetchUsers();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        navigate("/authed");
      } else {
        showAlert("Lỗi khi update", "error");
        // alert("Lỗi khi update ");
      }
    }
  };

  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const handleSelectAllChange = () => {
    if (isSelectAllChecked) {
      setSelectedUser([]);
    } else {
      const allUserIds = currentItems.map((user) => user.id);
      setSelectedUser(allUserIds);
    }
    setIsSelectAllChecked(!isSelectAllChecked);
  };

  return (
    <>
      <div>
        <AnimatedCard animationType={"slideUp"} duration={0.5}>
          <main>
            <h3 className="text-center font-bold text-2xl">
              {t("list-users")}
            </h3>
            <div className="flex mt-5">
              <div className="ml-5">
                {/* Search */}
                <form class="flex items-center max-w-sm mx-auto">
                  <label for="simple-search" class="sr-only">
                    Tìm kiếm
                  </label>
                  <div class="relative w-full mt-2">
                    <input
                      type="text"
                      id="simple-search"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder={`${t("employee-code")}....`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    class="p-2.5 ms-2 mt-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
                </form>
              </div>
              <div className="ml-6 mt-2">
                <button
                  type="button"
                  class="flex text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-2 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  onClick={() => {
                    navigate("/add-new-user");
                  }}
                >
                  <MdAddCircle size={24} />
                  <MdPeople size={24} />
                </button>
              </div>
              <div className="ml-3">
                <button
                  className="bg-red-500 hover:bg-red-600 p-2 rounded-lg text-white mt-2"
                  onClick={() => handleDelete()}
                >
                  <MdDelete size={24} />
                </button>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto rounded-lg shadow-2xl">
              <table className="items-center w-full mb-0 align-top border-collapse text-slate-500">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="bg-blue-50 px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-r border-gray-300">
                      <div class="flex items-center">
                        <input
                          id="checkbox-table-search-all"
                          type="checkbox"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAllChange();
                          }}
                          class="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          checked={isSelectAllChecked}
                        />
                      </div>
                    </th>
                    <th className="text-center bg-blue-50 font-bold px-6 py-3 text-black tracking-wider border-r border-gray-300">
                      ID
                    </th>
                    <th className="bg-blue-50 font-bold px-6 py-3 text-center text-black tracking-wider border-r border-gray-300">
                      {t("username")}
                    </th>
                    <th className="bg-blue-50 font-bold px-6 py-3 text-center text-black tracking-wider border-r border-gray-300">
                      {t("firstname")}
                    </th>
                    <th className="bg-blue-50 font-bold px-6 py-3 text-center text-black tracking-wider border-r border-gray-300">
                      {t("lastname")}
                    </th>
                    <th className="bg-blue-50 font-bold px-6 py-3 text-center text-black tracking-wider border-r border-gray-300">
                      {t("email")}
                    </th>
                    <th className="bg-blue-50 font-bold px-6 py-3 text-center text-black tracking-wider border-r border-gray-300">
                      {t("phone-number")}
                    </th>
                    <th className="bg-blue-50 font-bold px-6 py-3 text-center text-black tracking-wider border-r border-gray-300">
                      {t("status")}
                    </th>
                    <th className="bg-blue-50 font-bold px-6 py-3 text-center text-black tracking-wider border-r border-gray-300">
                      {t("role")}
                    </th>
                    <th className="bg-blue-50 font-bold px-6 py-3 text-center text-black tracking-wider border-gray-300">
                      {t("operation")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 border-b">
                  {currentItems.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-4 w-4 border-r border-gray-300">
                        <div class="flex items-center">
                          <input
                            id={`checkbox-table-search-${user.id}`}
                            type="checkbox"
                            onclick={(e) => {
                              e.stopPropagation();
                            }}
                            class="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            checked={selectedUser.includes(user.id)}
                            onChange={() => handleCheckboxChange(user.id)}
                          />

                          <label for="checkbox-table-search-1" class="sr-only">
                            checkbox
                          </label>
                        </div>
                      </td>
                      <td className=" text-center text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                        <h6 class="mb-0 leading-normal">{user.id}</h6>
                      </td>
                      <td className="text-center text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                        <span class=" font-semibold leading-tight text-slate-400">
                          {user.username}
                        </span>
                      </td>
                      <td className="text-center text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                        <span class=" font-semibold leading-tight text-slate-400">
                          {user.firstname}
                        </span>
                      </td>
                      <td className="text-center text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                        <span class=" font-semibold leading-tight text-slate-400">
                          {user.lastname}
                        </span>
                      </td>
                      <td className="text-center text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                        <span class=" font-semibold leading-tight text-slate-400">
                          {user.email}
                        </span>
                      </td>
                      <td className="text-center text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                        <span class=" font-semibold leading-tight text-slate-400">
                          {user.phone}
                        </span>
                      </td>
                      <td className="text-center text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                        <span class=" font-semibold leading-tight text-slate-400">
                          {user.status}
                        </span>
                      </td>
                      <td className="text-center text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                        <span class=" font-semibold leading-tight text-slate-400">
                          {user.roles.length > 0
                            ? user.roles.map((role) => role.name).join(", ")
                            : "No roles"}
                        </span>
                      </td>

                      <td class="text-center p-2 align-middle bg-transparent border-b-0 whitespace-nowrap shadow-transparent">
                        <button
                          type="button"
                          className="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:focus:ring-yellow-900"
                          onClick={() => handleEditClick(user.id)}
                        >
                          {t("edit")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {Math.ceil(users.length / itemsPerPage) > 1 && (
                <Pagination_T
                  pageCount={Math.ceil(users.length / itemsPerPage)}
                  onPageChange={handlePageClick}
                />
              )}
              {isEditModalOpen && (
                <Modal
                  open={isEditModalOpen}
                  onClose={closeEditModal}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
                >
                  <div
                    className="bg-white p-5 rounded-lg"
                    style={{ width: "500px" }}
                  >
                    <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                      <div class="pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                        <h3 class="text-lg text-center font-semibold text-gray-900 dark:text-white uppercase">
                          {t("user-edit")}
                        </h3>
                      </div>
                      <form>
                        <div class="grid gap-4 mb-4 sm:grid-cols-2">
                          <div class="grid gap-4 sm:col-span-2 md:gap-6 sm:grid-cols-2">
                            <div className="mt-5 ">
                              <label
                                for="weight"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                {t("employee-code")}
                              </label>
                              <input
                                type="text"
                                name="id"
                                id="id"
                                className="p-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder={t("employee-code")}
                                value={userInfo.id}
                                maxLength={100}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled
                              />
                            </div>
                            <div className="mt-5">
                              <label
                                for="length"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                {t("username")}
                              </label>
                              <input
                                type="text"
                                name="username"
                                id="username"
                                className="p-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder={t("username")}
                                value={userInfo.username}
                                maxLength={100}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled
                              />
                              {errors.username && (
                                <div className="text-red-500 text-xs">
                                  {errors.username}
                                </div>
                              )}
                            </div>
                            <div className="mt-5">
                              <label
                                for="width"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                {t("firstname")}
                              </label>
                              <input
                                type="text"
                                name="firstname"
                                id="firstname"
                                className="p-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder={t("firstname")}
                                value={userInfo.firstname}
                                maxLength={100}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                              />
                              {errors.firstname && (
                                <div className="text-red-500 text-xs">
                                  {errors.firstname}
                                </div>
                              )}
                            </div>
                            <div className="mt-5">
                              <label
                                for="width"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                {t("lastname")}
                              </label>
                              <input
                                type="text"
                                name="lastname"
                                id="lastname"
                                className="p-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder={t("lastname")}
                                value={userInfo.lastname}
                                maxLength={100}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                              />
                              {errors.lastname && (
                                <div className="text-red-500 text-xs">
                                  {errors.lastname}
                                </div>
                              )}
                            </div>
                            <div className="mt-5">
                              <label
                                for="breadth"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                {t("phone-number")}
                              </label>
                              <input
                                type="text"
                                name="phone"
                                id="phone"
                                className="p-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder={t("phone-number")}
                                value={userInfo.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                              />
                              {errors.phone && (
                                <div className="text-red-500 text-xs">
                                  {errors.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-5">
                            <label
                              for="status"
                              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              {t("status")}
                            </label>
                            <select
                              name="status"
                              value={userInfo.status}
                              onChange={handleChange}
                              className="p-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            >
                              <option value="0">{t("inactive")} </option>
                              <option value="1">{t("active")}</option>
                            </select>
                          </div>
                          <div className="mt-5">
                            <label
                              htmlFor="role"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              {t("role")}
                            </label>
                            <select
                              name="roles"
                              value={roleed} // Ensure the name matches the state field
                              onChange={(event) => {
                                setRoleed([event.target.value]);
                              }}
                              className="p-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="MANAGE">MANAGE</option>
                            </select>
                          </div>

                          <div className="mt-5">
                            <label
                              for="length"
                              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              {t("email")}
                            </label>
                            <input
                              type="text"
                              name="email"
                              className="p-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder={t("email")}
                              value={userInfo.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            {errors.email && (
                              <div className="text-red-500 text-xs">
                                {errors.email}
                              </div>
                            )}
                          </div>
                        </div>

                        <div class="mt-5 items-center justify-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
                          <button
                            type="button"
                            onClick={() => handleUpdate(userInfo.id)}
                            class="w-full justify-center sm:w-auto inline-flex items-center bg-blue-600 text-white hover:opacity-95 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 focus:z-10 "
                          >
                            {t("update")}
                          </button>
                          <button
                            type="button"
                            class="w-full justify-center sm:w-auto text-gray-500 inline-flex items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                            onClick={closeEditModal}
                          >
                            <svg
                              class="mr-1 -ml-1 w-5 h-5"
                              fill="currentColor"
                              viewbox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                              />
                            </svg>
                            {t("cancel")}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </Modal>
              )}
            </div>
            
          </main>
        </AnimatedCard>
        <ScrollToTopButton />
        {alert.message && (
          <AlertInfo message={alert.message} type={alert.type} />
        )}
      </div>
    </>
  );
};
export default UserrManagement;
