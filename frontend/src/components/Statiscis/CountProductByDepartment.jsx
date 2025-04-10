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

const CountProductByDepartment = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/devices/device-department-counts", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((response) => {
        const products = response.data;
        setData(products);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);
  console.log("Productxx :::" + data[1]);

  const chartData = {
    labels: data.map((d) => d[0]),
    datasets: [
      {
        label: "Phòng ban",
        data: data.map((d) => d[1]),
        backgroundColor: [
          "rgba(75,192,192,0.6)",
          "rgba(192,75,192,0.6)",
          "rgba(192,192,75,0.6)",
          "rgb(255, 99, 71)",
          "rgb(60, 179, 113)",
        ],
        borderColor: [
          "rgba(75,192,192,0.6)",
          "rgba(192,75,192,0.6)",
          "rgba(192,192,75,0.6)",
          "rgb(255, 99, 71)",
          "rgb(60, 179, 113)",
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
  const colors = [
    "rgba(75,192,192,0.6)",
    "rgba(192,75,192,0.6)",
    "rgba(192,192,75,0.6)",
    "rgb(255, 99, 71)",
    "rgb(60, 179, 113)",
  ];
  return (
    <div>
      <h2 className="font-bold">Phòng ban (số lượng sản phẩm)</h2>
      <div className="flex">
        <div style={{ width: "50%" }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="flex-1">
          {data.map((key, value) => (
            <div className=" px-6 mx-auto flex-1">
              <div
                style={{ backgroundColor: colors[value] }}
                className="p-4 mt-5 rounded-lg flex justify-between"
              >
                <p className="font-bold text-white">Phòng ban {key[0]}</p>
                <p className="font-bold text-white">Số lượng: {key[1]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <Doughnut data={chartData} options={chartOptions} /> */}
    </div>
  );
};

export default CountProductByDepartment;
