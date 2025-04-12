import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserMenu from "../Login/UserMenu";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import handleClicking from "../Alert/handleClickking";
import Aside from "../Default/Aside";
import Sidebar from "../Default/Sidebar";
import NavBar from "../Default/NavBar";
import Pagination_T from "../Default/Pagination";
import { Password } from "@mui/icons-material";
import { getToken } from "../Services/localStorageService";
import axios from "axios";
import { useTranslation } from "react-i18next";
const CreateNewUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [errors, setErrors] = useState({});
  const [roleed, setRoleed] = useState([]);
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
  const validateOBJECT = (userInfo) => {
    for (const key in userInfo) {
      if (userInfo[key] === "" || userInfo[key] === null) {
        return false;
      }
    }
    return true;
  };

  const token = getToken();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Validate field on change
    validateField(name, value);
  };
  const validateUserInfo = (userInfo) => {
    for (const key in userInfo) {
      if (userInfo[key] === "" || userInfo[key] === null) {
        return false;
      }
    }
    return true;
  };

  // Sử dụng hàm validateUserInfo trong handleUpdate

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Validate field on blur
    validateField(name, value);
  };

  const submitUser = async (e) => {
    userInfo.roles = roleed;
    e.preventDefault();
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
    if (!validateUserInfo(userInfo)) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/user/addUser",
        userInfo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("User added", userInfo);
      console.log("User added", response.data.data);
      MySwal.fire("Success", "User added successfully", "success");
      navigate("/user-management");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        MySwal.fire(
          "Error",
          "Mã nhân viên hoặc tên đăng nhập đã tồn tại",
          "error"
        );
      } else if (error.response && error.response.status === 400) {
        MySwal.fire(
          "Error",
          "Tên đăng nhập hoặc mật khẩu chưa đặt chuẩn",
          "error"
        );
      } else if (error.response && error.response.status === 403) {
        navigate("/authed");
      } else {
        alert("lỗi");
      }
    }
  };
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(() => {
    const savedState = localStorage.getItem("isDrawerOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const [selected, setSelected] = React.useState("add-new-user"); //Điều chỉnh phù hợp để bôi đậm lựa chọn trên sidebar và navbar

  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(!isDrawerOpen);
    localStorage.setItem("isDrawerOpen", JSON.stringify(newState));
  };

  const handleSelect = (page) => setSelected(page);
  // Open modal
  const openModal = () => {
    setIsModal(true);
  };
  const closeModal = () => {
    setIsModal(false);
  };
  // Open edit moal
  const openEditModal = () => {
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div>
      <main>
        <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
          <div class="pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
            <h3 class="text-lg text-center font-semibold text-gray-900 dark:text-white uppercase">
              {t("user-info")}
            </h3>
          </div>
          <form action="#">
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
                    onChange={handleChange}
                    required
                    onBlur={handleBlur}
                    maxLength={100}
                  />
                  {errors.id && (
                    <div className="text-red-500 text-xs">{errors.id}</div>
                  )}
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
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                  {errors.username && (
                    <div className="text-red-500 text-xs">
                      {errors.username}
                    </div>
                  )}
                </div>
                <div className="mt-5">
                  <label
                    for="breadth"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {t("password")}
                  </label>
                  <input
                    type="text"
                    name="password"
                    id="password"
                    className="p-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder={t("password")}
                    value={userInfo.password}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                  {errors.password && (
                    <div className="text-red-500 text-xs">
                      {errors.password}
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
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    maxLength={100}
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
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    maxLength={100}
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
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                  {errors.phone && (
                    <div className="text-red-500 text-xs">{errors.phone}</div>
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
                  value={roleed}
                  onChange={(event) => {
                    setRoleed([event.target.value]);
                  }}
                  className="p-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                >
                  <option>Chọn Role</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGE">MANAGE</option>
                  <option value="STAFF">STAFF</option>
                </select>
              </div>
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
                id="email"
                className="p-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder={t("email")}
                onBlur={handleBlur}
                onChange={handleChange}
                maxLength={50}
              />
              {errors.email && (
                <div className="text-red-500 text-xs">{errors.email}</div>
              )}
            </div>
            <div class="mt-5 items-center justify-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={submitUser}
                class="w-full justify-center sm:w-auto inline-flex items-center bg-blue-600 text-white hover:opacity-95 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 focus:z-10 "
              >
                + {t("add-new")}
              </button>
              <button
                type="button"
                class="w-full justify-center sm:w-auto text-gray-500 inline-flex items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                onClick={() => {
                  navigate("/user-management");
                }}
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
      </main>
    </div>
  );
};
export default CreateNewUser;
