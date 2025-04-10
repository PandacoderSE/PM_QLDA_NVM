import { Bar, Doughnut, Line } from "react-chartjs-2";
import React, { useEffect, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  LineElement,
  PointElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import axios from "axios";
import { getToken } from "../Services/localStorageService";
import Chart from "./Chart";
import CountProductByDepartment from "./CountProductByDepartment";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartDataLabels,
  PointElement,
  LineElement
);

const DoughnutChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("Doughnut");
  const [isOpenStatiscisByDepartment, setIsOpenStatiscisByDepartment] =useState(false);
  const [isOpenStatiscis, setIsOpenStatiscis] = useState(true);
  const [isOpenDeviceStatus, setIsOpenDeviceStatus] = useState(false);
  const handleOpenStatiscis = () => {
    setIsOpenStatiscis(true);
  };
  const handleCloseOpenStatiscis = () => {
    setIsOpenStatiscis(false);
  };
  const handleOpenStatiscisByDepartment = () => {
    setIsOpenStatiscisByDepartment(true);
  };
  const handleCloseStatiscisByDepartment = () => {
    setIsOpenStatiscisByDepartment(false);
  };
  const handleOpenDeviceStatus = () => {
    setIsOpenDeviceStatus(true);
  };
  const handleCloseDeviceStatus = () => {
    setIsOpenDeviceStatus(false);
  };
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/devices/all", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((response) => {
        const products = response.data;
        const stats = { daSuDung: 0, chuaSuDung: 0, totalDevices: 0 };
        products.forEach((product) => {
          if (product.status === "DA_SU_DUNG") stats.daSuDung++;
          if (product.status === "CHUA_SU_DUNG") stats.chuaSuDung++;
          stats.totalDevices++;
        });
        setData(stats);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);
  console.log("StatusCoutn: " + data);
  const renderChart = () => {
    switch (chartType) {
      case "Bar":
        return <Bar data={chartData} options={chartOptions} />;
      case "Line":
        return <Line data={chartData} options={chartOptions} />;
      case "Doughnut":
      default:
        return <Doughnut data={chartData} options={chartOptions} />;
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const chartData = {
    labels: ["Đã sử dụng", "Chưa sử dụng"],
    datasets: [
      {
        label: "",
        data: [data.daSuDung, data.chuaSuDung],
        backgroundColor: [
          "rgba(75,192,192,0.6)",
          "rgba(192,75,192,0.6)",
          "rgba(192,192,75,0.6)",
        ],
        borderColor: [
          "rgba(75,192,192,1)",
          "rgba(192,75,192,1)",
          "rgba(192,192,75,1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: (value) => value,
        color: "black",
        font: {
          weight: "bold",
        },
      },
      legend: {
        display: true,
      },
    },
  };

  return (
    <div>
      <div>
        {isOpenStatiscis ? (
          <button
            onClick={handleCloseOpenStatiscis}
            type="button"
            class="ml-4 mt-5 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Ẩn xem theo danh mục
          </button>
        ) : (
          <button
            onClick={handleOpenStatiscis}
            type="button"
            class="ml-4 mt-5 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Thống kê theo danh mục
          </button>
        )}
        {isOpenStatiscisByDepartment ? (
          <button
            onClick={handleCloseStatiscisByDepartment}
            type="button"
            class="ml-4 mt-5 focus:outline-none text-white bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Ẩn xem theo phòng ban
          </button>
        ) : (
          <button
            onClick={handleOpenStatiscisByDepartment}
            type="button"
            class="ml-4 mt-5 focus:outline-none text-white bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Thống kê theo phòng ban
          </button>
        )}
        {isOpenDeviceStatus ? (
          <button
            onClick={handleCloseDeviceStatus}
            type="button"
            class="ml-4 mt-5 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Ẩn xem theo trạng thái
          </button>
        ) : (
          <button
            onClick={handleOpenDeviceStatus}
            type="button"
            class="ml-4 mt-5 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          >
            Thống kê theo trạng thái
          </button>
        )}
      </div>
      {isOpenDeviceStatus && (
        <div
          style={{ width: "100%" }}
          className="mx-auto bg-white rounded-lg flex"
        >
          <div style={{ width: "50%" }} className="flex-1">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className=" px-6 py-6 mx-auto flex-1 ">
            <div
              style={{ backgroundColor: "rgba(188,192,192,1)" }}
              className="p-4 rounded-lg flex justify-between"
            >
              <p className="font-bold text-white">Tổng sản phẩm hiện có</p>
              <div className="flex items-center justify-between">
                <p className="text-white">{data.totalDevices}</p>
              </div>
            </div>
            <div
              style={{ backgroundColor: "rgba(75,192,192,1)" }}
              className="p-4 mt-5 rounded-lg flex justify-between"
            >
              <p className="font-bold text-white">Số sản phẩm đã sử dụng</p>
              <div className="flex items-center justify-between">
                <p className="text-white">{data.daSuDung}</p>
              </div>
            </div>
            <div
              style={{ backgroundColor: "rgba(192,75,192,1)" }}
              className="p-4 rounded-lg mt-5 flex justify-between"
            >
              <p className="font-bold text-white">Số sản phẩm chưa sử dụng</p>
              <div className="flex items-center justify-between">
                <p className="text-white">{data.chuaSuDung}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpenStatiscis && (
        <div class="  relative bg-clip-border mt-4 mx-4 rounded-xl overflow-hidden bg-white text-gray-700">
          <div class="">
            <div class="max-w-full px-3 lg:flex-none">
              <div class="">
                <Chart />
              </div>
            </div>
          </div>
        </div>
      )}
      {isOpenStatiscisByDepartment && (
        <div class="  relative bg-clip-border mt-4 mx-4 rounded-xl overflow-hidden bg-white text-gray-700">
          <div class="">
            <div class="max-w-full px-3 lg:flex-none">
              <div class="">
                <CountProductByDepartment />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoughnutChart;
