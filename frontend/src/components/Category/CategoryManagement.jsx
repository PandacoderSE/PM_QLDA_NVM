import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import handleClicking from "../Alert/handleClickking";
import Modal from "@mui/material/Modal";
import ScrollToTopButton from "../Default/ScrollToTopButton";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import handleWarning from "../Alert/handleWarning";
import Pagination_T from "../Default/Pagination";
import Sidebar from "../Default/Sidebar";
import NavBar from "../Default/NavBar";
import AnimatedCard from "../Animation/AnimatedCard";
import CustomAlert from "../Alert/CustomAlert";
import { getToken, getTokenAccess } from "../Services/localStorageService";
import AlertInfo from "../Alert/AlertInfo";
import { MdAddBox, MdCategory, MdEdit } from "react-icons/md";
import handleAlert from "../Alert/handleAlert";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const CategoryManagement = () => {
  const [isModalOpen, setIsModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [nameEditError, setNameEditError] = useState("");
  const [descriptionEditError, setDescriptionEditError] = useState("");
  const token = getToken();
  
  const [currentCategory, setCurrentCategory] = useState({
    id: "",
    name: "",
    description: "",
  });
  

  /* Xử lý liên quan đến việc validation các trường dữ liệu */
  const specialCharactersRegex = /[!@#$%^&*(),.?":{}|<>]/g;
  const numberRegex = /\d/;
  const validateField = (value, isNameField) => {
    if (!value) {
      return "Trường không được để trống";
    }
    if (value.length < 2) {
      return "Độ dài không được nhỏ hơn 2 ký tự";
    }
    if (specialCharactersRegex.test(value)) {
      return "Không được chứa ký tự đặc biệt";
    }
    if (isNameField && numberRegex.test(value)) {
      return "Tên danh mục không được chứa số";
    }
    return "";
  };
  /* Kết thúc xử lý liên quan đến việc validation các trường dữ liệu */

  /* Xử lý liên quan đến đóng mở sidebar và phân trang */
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(() => {
    const savedState = localStorage.getItem("isDrawerOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(!isDrawerOpen);
    localStorage.setItem("isDrawerOpen", JSON.stringify(newState));
  };
  const [selected, setSelected] = useState("category");

  // Phân trang, thực hiện việc có 5 bản ghi tối đa trên 1 trang
  const handleSelect = (page) => setSelected(page);
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = categories.slice(startIndex, endIndex); // Trong tbody, sử dụng currentItems.map để đổ dữ liệu lên
  /* Kết thúc xử lý liên quan đến đóng mở sidebar và phân trang */

  /* Xử lý liên quan đến modal
   */
  // Mở modal xử lý mở màn hình thêm danh mục
  const openModal = () => {
    setIsModal(true);
  };
  const closeModal = () => {
    setName("");
    setDescription("");
    setIsModal(false);
  };
  // Mở modal xử lý sửa thông tin danh mục
  const openEditModal = () => {
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };
  /* Kết thúc xử lý liên quan đến modal */

  // Xử lý thông tin của thông báo, cứ 3 giây sẽ tắt thông báo popup hiện lên
  const [alert, setAlert] = useState({ message: "", type: "" });
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 3000);
  };
  // Kết thúc xử lý thông tin của thông báo, cứ 3 giây sẽ tắt thông báo popup hiện lên

  

  // API xử lý việc lấy tất cả danh mục 
  useEffect(() => {
    fetchCategories();
  }, [selectedCategories]);

  // Get all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/categories/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(response.data.data);
    } catch (error) {
      handleAlert("Lỗi", "Có lỗi khi thêm mới dữ liệu !", "error", "OK");
    }
  };

  // Thêm mới danh mục
  const handleAddNewCategory = async (e) => {
    e.preventDefault();
    if (name === "" || description === "") {
      showAlert("Bạn cần nhập đủ thông tin trước khi thêm mới", "error");
      return;
    } else {
      try {
        const nameValidation = validateField(name, true);
        const descriptionValidation = validateField(description, false);
        setNameError(nameValidation);
        setDescriptionError(descriptionValidation);
        if (!nameValidation && !descriptionValidation) {
          const response = await axios.post(
            "http://localhost:8080/api/v1/categories/add-new-category",
            { name, description },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          handleAlert("Thành công", "Thêm mới thành công !", "success", "OK")
          fetchCategories();
          handleResetInput();
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          handleAlert("Lỗi", "Tên danh mục đã tồn tại, vui lòng chọn tên khác !", "error", "OK");
        } else if (error.response && error.response.status === 500) {
          handleAlert("Lỗi", "Có lỗi khi thêm mới dữ liệu !", "error", "OK");
        }
      }
    }

    closeModal();
  };
  // Kết thúc thêm mới danh mục

  // Xử lý việc chọn các checkbox, các id theo checkbox lưu vào mảng selectedCategories
  const handleCheckboxChange = (categoryId) => {
    setSelectedCategories((prevState) =>
      prevState.includes(categoryId)
        ? prevState.filter((id) => id !== categoryId)
        : [...prevState, categoryId]
    );
  };
  // Kết thúc việc xử lý việc chọn các checkbox, các id theo checkbox lưu vào mảng selectedCategories

  // Xử lý việc xóa danh mục
  const handleDeleteCategory = async () => {
    try {
      await Promise.all(
        selectedCategories.map((id) =>
          axios.delete(`http://localhost:8080/api/v1/categories/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
      setSelectedCategories([]);
      fetchCategories();
    } catch (error) {
      if (error.response && error.response.status === 404) {
        showAlert("Id danh mục không tồn tại, vui lòng thử lại !", "error");
      }
      showAlert("Có lỗi khi xóa dữ liệu !", "error");
    }
  };
  // Kết thúc việc xử lý xóa danh mục

  // Xử lý chức năng tìm kiếm theo tên danh mục
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm === "") {
      showAlert("Cần nhập thông tin trước khi tìm kiếm.", "error");
      return;
    } else {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/v1/categories/search/${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(response.data.data);
        if (response.data.data.length == 0) {
          showAlert("Thiết bị không tồn tại, vui lòng thử lại!", "error");
          fetchCategories();
        }
      } catch (error) {
        showAlert("Có lỗi khi tìm kiếm dữ liệu !", "error");
      }
    }
  };
  // Kết thúc chức năng tìm kiếm theo tên danh mục

  // Khi chọn button Edit, hiện ra thông tin chi tiết của danh mục
  const handleEditClick = async (categoryId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/categories/update/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentCategory(response.data.data);
      setIsEditModalOpen(true);

    } catch (error) {
      showAlert("Thiết bị không tồn tại, vui lòng thử lại!", "error");
    }
  };
  // Kết thúc khi chọn button Edit, hiện ra thông tin chi tiết của danh mục

  // Xử lý việc thay đổi của các input item
  const handleInputChange = (event) => {
    const { value } = event.target;
    console.log(value);

    setCurrentCategory((prevState) => ({ ...prevState, name: value }));
  };
  // Kết thúc xử lý việc thay đổi của các input item

  // Xử lý việc chọn nút sửa trong modal sửa thông tin danh mục
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updatedProfileData = {
      id: currentCategory.id,
      name: currentCategory.name,
      description: currentCategory.description,
    };
    try {
    
        const response = await axios.put(
          `http://localhost:8080/api/v1/categories/edit`,
          updatedProfileData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsEditModalOpen(false);
        fetchCategories();
        showAlert("Cập nhật thành công!", "success");
      handleResetInput();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        handleAlert("Lỗi", "Tên danh mục đã tồn tại, vui lòng chọn tên khác !", "error", "OK");
      }
      showAlert("Tên danh mục đã tồn tại, vui lòng thử lại", "error");
      handleResetInput();
    }
  };
  // Kết thúc xử lý việc chọn nút sửa trong modal sửa thông tin danh mục

  // Cập nhật các input item về ""
  const handleResetInput = () => {
    setName("");
    setDescription("");
  }
  // Kết thúc cập nhật các input item về ""

  // Validate lỗi của các trường dữ liệu
  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setName(value);
      setNameError(validateField(value, true));
    } else if (name === "description") {
      setDescription(value);
      setDescriptionError(validateField(value, false));
    }
    if (name === "searchTerm") {
      setSearchTerm(value);
      setSearchError(validateField(value, false));
    }
    if (name === "nameEdit") {
      setName(value);
      setNameEditError(validateField(value, true));
    }
    if (name === "descriptionEdit") {
      setDescription(value);
      setDescriptionEditError(validateField(value, false));
    }
  };
  // Kết thúc validate lỗi của các trường dữ liệu

  // Xử lý việc chọn tất cả các checkbox
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const handleSelectAllChange = () => {
    if (isSelectAllChecked) {
      setSelectedCategories([]);
    } else {
      const allCateoryIds = currentItems.map((category) => category.id);
      setSelectedCategories(allCateoryIds);
    }
    setIsSelectAllChecked(!isSelectAllChecked);
  };
  // Kết thúc xử lý việc chọn tất cả các checkbox

  return (
    <div>
      <AnimatedCard animationType={"slideUp"} duration={0.5}>
        <main>
          <h3 className="text-center font-bold text-2xl">DACH SÁCH DANH MỤC</h3>
          <div className="flex mt-5">
            <div className="ml-10">
              {/* Search */}
              <form className="flex items-center max-w-sm mx-auto mt-2">
                <label htmlFor="simple-search" className="sr-only">
                  Tìm kiếm
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    id="searchTerm"
                    className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Tên/Mã danh mục..."
                    value={searchTerm}
                    name="searchTerm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onInput={handleInput}
                    required
                  />
        
                </div>
                <button
                  onClick={handleSearch}
                  className="p-2.5 ms-5 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
                </button>
              </form>
            </div>
            <div className="ml-6 mt-2.5">
              <button
                type="button"
                onClick={openModal}
                className="flex text-white bg-green-500 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-2 text-center"
              >
                
                <MdAddBox size={24}/>
                <MdCategory size={24}/>
              </button>
            </div>
            <div className="ml-6">
              {selectedCategories.length !== 0 ? (
                <CustomAlert
                  buttonText={"Xóa"}
                  title={"Xác nhận xóa"}
                  icon={"warning"}
                  showCancelButton={true}
                  confirmButtonText="Xác nhận"
                  cancelButtonText="Hủy"
                  customMessage="Xóa thành công!"
                  bgButtonColor="bg-red-500"
                  bgButtonHover="hover:bg-red-800"
                  textButtonColor="text-white"
                  showSecondAlert={true}
                  onConfirm={() => handleDeleteCategory()}
                />
              ) : null}
            </div>
            {/* modal thêm mới sản phẩm */}
            <Modal
              open={isModalOpen}
              onClose={closeModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
            >
              <div
                className="bg-white p-5 rounded-lg border-t-4 border-orange-500"
                style={{ width: "500px" }}
              >
                <h2 className="text-center font-bold uppercase mb-5 mt-5 text-2xl">
                  Thêm mới danh mục
                </h2>
                <form>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Tên danh mục
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      placeholder="Computer"
                      value={name}
                      maxLength={100}
                      onChange={(e) => setName(e.target.value)}
                      required
                      name="name"
                      onInput={handleInput}
                    />
                    {nameError && <p style={{ color: "red" }}>{nameError}</p>}
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="message"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Mô tả
                    </label>
                    <textarea
                      id="message"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="4"
                      maxLength={255}
                      className="block p-2.5 outline-none w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Viết mô tả tại đây..."
                      required
                      name="description"
                      onInput={handleInput}
                    ></textarea>
                    {descriptionError && (
                      <p style={{ color: "red" }}>{descriptionError}</p>
                    )}
                  </div>
                  {nameError || descriptionError ? (
                    <div></div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        type="submit"
                        onClick={handleAddNewCategory}
                        className="text-white bg-gradient-to-r from-orange-500 to-orange-600  focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        + Thêm
                      </button>

                      <button
                        className="text-white bg-gray-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        type="button"
                        onClick={closeModal}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </Modal>
          </div>
          <div className="mt-5 overflow-x-auto px-10">
            {categories.length > 0 ? (
              <table className="rounded-lg shadow-2xl items-center w-full align-top border-collapse text-slate-500">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="text-center bg-blue-50 py-4 w-6 text-xs font-medium text-black uppercase tracking-wider border-r border-gray-300 rounded-tl-lg">
                    <div className="justify-center flex items-center">
                      <input
                        id="checkbox-table-search-all"
                        type="checkbox"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAllChange();
                        }}
                        className="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2"
                        npm={isSelectAllChecked}
                      />
                    </div>
                  </th>
                  <th className="justify-center bg-blue-50 font-bold px-2 py-2 w-auto text-center text-black tracking-wider border-r border-gray-300">
                    Mã danh mục
                  </th>
                  <th className="bg-blue-50 font-bold px-2 py-2 w-auto text-center text-black tracking-wider border-r border-gray-300">
                    Tên danh mục
                  </th>
                  <th className="bg-blue-50 font-bold px-2 py-2 w-auto text-center text-black tracking-wider border-r border-gray-300">
                    Mô tả
                  </th>
                  <th className="text-center bg-blue-50 font-bold px-2 py-2 w-20 text-black tracking-wider border-gray-300 rounded-tr-lg">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y ">
                {currentItems.map((category, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="w-6 border-r border-gray-300">
                      <div className="flex items-center text-center justify-center">
                        <input
                          id={`checkbox-table-search-${category.id}`}
                          type="checkbox"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="w-4 h-4 ext-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCheckboxChange(category.id)}
                        />
                      </div>
                    </td>
                    <td className="text-center text-black p-2 w-1/4 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                      <h6 className="mb-0 leading-normal">{category.id}</h6>
                    </td>
                    <td className="text-center text-black p-2 w-1/4 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                      <h6 className="mb-0 leading-normal">{category.name}</h6>
                    </td>
                    <td className="text-center text-black p-2 w-1/4 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                      <span className="font-semibold leading-tight text-slate-400">
                        {category.description}
                      </span>
                    </td>
                    <td className="p-4 text-center align-middle whitespace-nowrap text-sm font-semibold border-gray-300 rounded-bl-lg">
                      <button
                        onClick={() => handleEditClick(category.id)}
                        type="button"
                        className="text-white bg-gradient-to-r from-orange-500 to-orange-600 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                      >
                        <MdEdit size={24}/>
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Modal chỉnh sửa sản phẩm */}
                {isEditModalOpen && (
                  <Modal
                    open={isEditModalOpen}
                    onClose={closeEditModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
                  >
                    <div
                      className="bg-white p-5 rounded-lg border-t-4 border-orange-500"
                      style={{ width: "500px" }}
                    >
                      <h2 className="text-center font-bold uppercase mb-5 mt-5 text-2xl">
                        Cập nhật danh mục
                      </h2>
                      <form>
                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Tên danh mục
                          </label>
                          <input
                            type="hidden"
                            name="id"
                            id="id"
                            value={currentCategory.id}
                            onChange={(e) =>
                              setCurrentCategory({
                                ...currentCategory,
                                id: e.target.value,
                              })
                            }
                          />
                          <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            name="nameEdit"
                            maxLength={100}
                            value={currentCategory.name}
                            onChange={(e) =>
                              setCurrentCategory({
                                ...currentCategory,
                                name: e.target.value,
                              })
                            }
                            onInput={handleInput}
                          />
                          {nameEditError && (
                            <p style={{ color: "red" }}>{nameEditError}</p>
                          )}
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="message"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Mô tả 2
                          </label>
                          <textarea
                            id="description"
                            name="descriptionEdit"
                            maxLength={255}
                            value={currentCategory.description}
                            onChange={(e) =>
                              setCurrentCategory({
                                ...currentCategory,
                                description: e.target.value,
                              })
                            }
                            onInput={handleInput}
                            rows="4"
                            className="block p-2.5 outline-none w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Viết mô tả tại đây..."
                          ></textarea>
                          {descriptionEditError && (
                            <p style={{ color: "red" }}>
                              {descriptionEditError}
                            </p>
                          )}
                        </div>
                        {descriptionEditError || nameEditError ? (
                          <button
                            className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            type="button"
                            onClick={closeEditModal}
                          >
                            Hủy
                          </button>
                        ) : (
                          <div className="flex items-center justify-between">
                            <button
                              onClick={handleEditSubmit}
                              type="button"
                              className="text-white bg-gradient-to-r from-orange-500 to-orange-600 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                            >
                              Sửa
                            </button>

                            <button
                              className="text-white bg-gray-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                              type="button"
                              onClick={closeEditModal}
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  </Modal>
                )}
              </tbody>
            </table>
            ) : (
              <div className="text-center font-bold mt-5">Chưa tồn tại dữ liệu danh mục, vui lòng thêm mới !!</div>
            )}
            
            {/* Phân trang */}
            <Pagination_T
              pageCount={Math.ceil(categories.length / itemsPerPage)}
              onPageChange={handlePageClick}
            />
          </div>
        </main>
      </AnimatedCard>
      <ScrollToTopButton />
      {alert.message && (
        <AlertInfo message={alert.message} type={alert.type} z="z-[99999]" />
      )}
    </div>
  );
};

export default CategoryManagement;
