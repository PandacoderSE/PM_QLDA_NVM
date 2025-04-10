import React, { useEffect, useState } from "react";
import { useNavigate, useNavigation } from "react-router-dom";
import DoughnutChart from "./DoughnutChart";
import ScrollToTopButton from "../Default/ScrollToTopButton";
import AnimatedCard from "../Animation/AnimatedCard";
import axios from "axios";
import { Modal } from "@mui/material";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getToken } from "../Services/localStorageService";
import handleAlert from "../Alert/handleAlert";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const Statiscis = () => {
  const [devices, setDevices] = useState(null);
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2025);
  const [deviceResponse, setDeviceResponse] = useState([]);
  // Xử lý modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpenCard, setIsOpenCard] = useState();

  const openModal = () => {
    setIsModalOpen(true);
    setShowAll(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleIsCardOpen = () => {
    setIsOpenCard(true);
  };
  const handleIsCardClose = () => {
    setIsOpenCard(false);
  };
  // Kết thúc xử lý modal

  // Xử lý side bar và phân trang
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(() => {
    const savedState = localStorage.getItem("isDrawerOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const [selected, setSelected] = useState("statiscis");
  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(!isDrawerOpen);
    localStorage.setItem("isDrawerOpen", JSON.stringify(newState));
  };
  const handleSelect = (page) => setSelected(page);
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  // Kết thúc xử lý side bar và phân trang

  // Định nghĩa tháng và năm
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];
  const years = Array.from(
    { length: 50 },
    (_, i) => new Date().getFullYear() - i
  );
  // Kết thúc Định nghĩa tháng và năm

  // Lấy dữ liệu thiết bị by trạng thái
  useEffect(() => {
    const fetchDevices = async () => {
      const response = await axios.get(
        "http://localhost:8080/api/v1/devices/by-notes",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setDevices(response.data.data);
    };
    fetchDevices();
  }, []);
  
  // Lọc theo trạng thái, mỗi trạng thái chứa 1 list
  const daSuDung = devices?.filter((device) => device[1] === "DA_SU_DUNG");
  const chuaSuDung = devices?.filter((device) => device[1] === "CHUA_SU_DUNG");
  return (
    <AnimatedCard animationType={"slideUp"} duration={0.5}>
      <div className="flex h-screen">
        <main class="ease-soft-in-out xl:ml-68.5 relative h-full max-h-screen rounded-xl transition-all duration-200 w-full">
          <div class="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-2 mt-8"></div>
          {/* Navigation */}

          {/* Filter bar : department, user, manufacture */}
          <main className=" relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 border border-blue-gray-100 shadow-sm ">
            <div class="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 border border-blue-gray-100 shadow-sm">
              <div class="  relative bg-clip-border  mx-4 rounded-xl overflow-hidden bg-white text-gray-700">
                <div class="">
                  <div class="max-w-full px-3 lg:flex-none">
                    <div class="">
                      <h3 className="text-center font-bold text-xl mt-4 mb-2">
                        Biểu đồ phân tích số lượng trang thiết bị
                      </h3>
                     
                      {deviceResponse.length > 0 && (
                        <div className="mx-auto" style={{ width: "70%" }}>
                          <a
                            href="#"
                            className="mx-auto mb-4 block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                          >
                            <h5 class="mb-2 text-xl font-bold  text-gray-900 dark:text-white">
                              Trong tháng <b>{month}</b> năm <b>{year}</b>, các
                              thiết bị được thêm mới và chưa được bàn giao là:{" "}
                            </h5>
                            {deviceResponse.map((device, index) => (
                              <p class="font-normal text-gray-700 dark:text-gray-400">
                                Serial number: {device[0]}
                              </p>
                            ))}
                            <a
                              onClick={() => navigate("/manager-QR")}
                              href="#"
                              class="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                              Bàn giao thiết bị ngay
                              <svg
                                class="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 10"
                              >
                                <path
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M1 5h12m0 0L9 1m4 4L9 9"
                                />
                              </svg>
                            </a>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DoughnutChart />
            <div className="mx-auto my-4">
              <button
                onClick={openModal}
                className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
              >
                Xem chi tiết
              </button>
            </div>

            {isModalOpen && (
              <Modal
                open={isModalOpen}
                onClose={closeModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 text-black"
              >
                <div
                  className="bg-white p-5 rounded-lg"
                  style={{ width: "700px" }}
                >
                  <h1 className="font-bold text-center uppercase text-xl">
                    Danh sách thiết bị
                  </h1>{" "}
                  <h2 className="font-bold">Thiết bị đã sử dụng:</h2>{" "}
                  <ul>
                    {daSuDung?.map((device) => (
                      <li key={device[0]}>
                        Serial number: {device[0]}
                       
                      </li>
                    ))}
                  </ul>
                  <h2 className="font-bold">Thiết bị chưa sử dụng: </h2>{" "}
                  <ul>
                    {" "}
                    {chuaSuDung?.map((device) => (
                      <li key={device[0]}>
                        Serial number: {device[0]} 
                      </li>
                    ))}{" "}
                  </ul>{" "}
                  <div className="mx-auto">
              <button
              onClick={() => navigate('/assign-device')}
                className="mt-3 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
              >
                Bàn giao thiết bị
              </button>
            </div>
                
                </div>
              </Modal>
            )}
          </main>
          {/* Category */}
        </main>
        <ScrollToTopButton />
      </div>
    </AnimatedCard>
  );
};

export default Statiscis;
