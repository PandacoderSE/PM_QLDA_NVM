import React, { useState } from "react";
import UserMenu from "../Login/UserMenu";
import Aside from "../Default/Aside";
import NavBar from "../Default/NavBar";
import Sidebar from "../Default/Sidebar";
const EditProduct = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  //Sidebar and nav bar
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(() => {
    const savedState = localStorage.getItem("isDrawerOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const [selected, setSelected] = React.useState("materials-management"); //Điều chỉnh phù hợp để bôi đậm lựa chọn trên sidebar và navbar

  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(!isDrawerOpen);
    localStorage.setItem("isDrawerOpen", JSON.stringify(newState));
  };

  const handleSelect = (page) => setSelected(page);
  return (
    <div className="flex h-screen">
      <Sidebar
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        selected={selected}
        handleSelect={handleSelect}
      />

      <div class="relative p-4 w-full max-w-8xl h-full md:h-auto">
        {/* Navigation */}
        <NavBar selected={selected} />
        <main className="flex-grow ease-soft-in-out relative h-full max-h-screen rounded-xl transition-all duration-200 mt-4 p-4">
          {/* Nội dung chính */}
          <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
            <div class="pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
              <h3 class="text-lg text-center font-semibold text-gray-900 dark:text-white uppercase">
                Thay đổi thông tin sản phẩm
              </h3>
            </div>
            <form action="#">
              <div class="grid gap-4 mb-4 sm:grid-cols-2">
                <div class="grid gap-4 sm:col-span-2 md:gap-6 sm:grid-cols-4">
                  <div>
                    <label
                      for="weight"
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Accounting code
                    </label>
                    <input
                      type="number"
                      name="weight"
                      id="weight"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="12"
                      required=""
                    />
                  </div>
                  <div>
                    <label
                      for="length"
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Serial number
                    </label>
                    <input
                      type="number"
                      name="length"
                      id="length"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="105"
                      required=""
                    />
                  </div>
                  <div>
                    <label
                      for="breadth"
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Ngày mua
                    </label>
                    <input
                      type="date"
                      name="breadth"
                      id="breadth"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="15"
                      required=""
                    />
                  </div>
                  <div>
                    <label
                      for="width"
                      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Ngày cập nhật
                    </label>
                    <input
                      type="date"
                      name="width"
                      id="width"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="23"
                      required=""
                    />
                  </div>
                </div>
                <div>
                  <label
                    for="name"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Người dùng
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Type product name"
                    required=""
                  />
                </div>
                <div>
                  <label
                    for="category"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Phòng ban
                  </label>
                  <select
                    id="category"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  >
                    <option selected="">Select category</option>
                    <option value="TV">TV/Monitors</option>
                    <option value="PC">PC</option>
                    <option value="GA">Gaming/Console</option>
                    <option value="PH">Phones</option>
                  </select>
                </div>
                <div>
                  <label
                    for="category"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Đơn vị sản xuất
                  </label>
                  <select
                    id="category"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  >
                    <option selected="">Select category</option>
                    <option value="TV">TV/Monitors</option>
                    <option value="PC">PC</option>
                    <option value="GA">Gaming/Console</option>
                    <option value="PH">Phones</option>
                  </select>
                </div>
                <div>
                  <label
                    for="category"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Vị trí
                  </label>
                  <select
                    id="category"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  >
                    <option selected="">Select category</option>
                    <option value="TV">TV/Monitors</option>
                    <option value="PC">PC</option>
                    <option value="GA">Gaming/Console</option>
                    <option value="PH">Phones</option>
                  </select>
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="description"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Ghi chú
                  </label>
                  <textarea
                    id="description"
                    rows="4"
                    class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Write product description here"
                  ></textarea>
                </div>
              </div>
              <div class="mb-4 space-y-4 sm:flex sm:space-y-0">
                <div class="flex items-center mr-4">
                  <input
                    id="inline-checkbox"
                    type="checkbox"
                    value=""
                    name="sellingType"
                    class="w-4 h-4 bg-gray-100 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    for="inline-checkbox"
                    class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    In-store only
                  </label>
                </div>
                <div class="flex items-center mr-4">
                  <input
                    id="inline-2-checkbox"
                    type="checkbox"
                    value=""
                    name="sellingType"
                    class="w-4 h-4 bg-gray-100 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    for="inline-2-checkbox"
                    class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    Online selling only
                  </label>
                </div>
                <div class="flex items-center mr-4">
                  <input
                    checked=""
                    id="inline-checked-checkbox"
                    type="checkbox"
                    value=""
                    name="sellingType"
                    class="w-4 h-4 bg-gray-100 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    for="inline-checked-checkbox"
                    class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    Both in-store and online
                  </label>
                </div>
              </div>
              <div class="mb-4">
                <span class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  QR Code
                </span>
                <div class="flex justify-center items-center w-full">
                  <label
                    for="dropzone-file"
                    class="flex flex-col justify-center items-center w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    <div class="flex flex-col justify-center items-center pt-5 pb-6">
                      <svg
                        aria-hidden="true"
                        class="mb-3 w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewbox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span class="font-semibold">Click to upload</span>
                        or drag and drop
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        SVG, PNG, JPG or GIF (MAX. 800x400px)
                      </p>
                    </div>
                    <input id="dropzone-file" type="file" class="hidden" />
                  </label>
                </div>
              </div>
              <div class="items-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  class="w-full justify-center sm:w-auto inline-flex items-center bg-blue-600 text-white hover:opacity-95 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 focus:z-10 "
                >
                  Thêm mới
                </button>
                <button
                  type="button"
                  class="w-full justify-center sm:w-auto text-gray-500 inline-flex items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
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
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};
export default EditProduct;
