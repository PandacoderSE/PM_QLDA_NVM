import React, { useState } from "react";
import { useNavigate, useNavigation } from "react-router-dom";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/thumbs";
import "swiper/css/effect-coverflow";
import "swiper/css/mousewheel";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import "swiper/css/grid";
import Aside from "./Aside";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  MinusIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid";
import UserMenu from "../Login/UserMenu";
import handleClicking from "../Alert/handleClickking";
import Chart from "../Statiscis/Chart";
import UserManagement from "../Admin/UserManagement";
import DoughnutChart from "../Statiscis/DoughnutChart";
import ScrollToTopButton from "./ScrollToTopButton";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import AnimatedCard from "../Animation/AnimatedCard";
import CoverFlow from "../Animation/CoverFlow";
import CardDefault from "./CardDefault";
import { LoadScript } from "@react-google-maps/api";
import Footer from "./Footer";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const HomePage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(() => {
    const savedState = localStorage.getItem("isDrawerOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const [selected, setSelected] = useState("home");
  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(!isDrawerOpen);
    localStorage.setItem("isDrawerOpen", JSON.stringify(newState));
  };
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const center = {
    lat: 21.028511,
    lng: 105.804817,
  };
  return (
    <>
      <AnimatedCard animationType={"slideUp"} duration={0.5}>
        {/* <CoverFlow/> */}
        <div className="flex flex-grow bg-orange-400 text-white p-2 items-center justify-center text-center">
          <p>
            <span className="font-bold text-2xl md:text-3xl">
              “Challenge for change”
            </span>
            <br />
            <span className="text-lg md:text-xl">NMAXSOFT Co.Ltd.</span>
          </p>
        </div>
        <CoverFlow />
        <div className="flex flex-wrap justify-center items-center">
          <CardDefault
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                />
              </svg>
            }
            title={"Danh sách vật tư"}
            content={
              "Chức năng dùng để kiểm soát danh sách vật tư có sẵn trong kho"
            }
          />
          <CardDefault
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002"
                />
              </svg>
            }
            title={"Bàn giao thiết bị"}
            content={"Chức năng dùng bàn giao thiết bị cho nhân viên sử dụng"}
          />
          <CardDefault
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                />
              </svg>
            }
            title={"Quản lý danh mục"}
            content={
              "Chức năng dùng để quản lý các danh mục, xem xét số lượng trong từng danh mục"
            }
          />
          <CardDefault
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
                />
              </svg>
            }
            title={"Thống kê"}
            content={
              "Chức năng dùng để trực quan hóa các bản thống kê thiết bị"
            }
          />
        </div>
      </AnimatedCard>
      <div className="my-6 flex justify-center">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4635.192195253579!2d105.7998028!3d21.0459244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab5012da64d7%3A0x85db86f3197d7b10!2zQ8O0bmcgdHkgVXNvbC1WaeG7h3QgTmFt!5e1!3m2!1svi!2s!4v1736936196683!5m2!1svi!2s"
          width="100%"
          height="300"
          allowFullScreen=""
          loading="lazy"
          className="border-0 rounded-lg"
        ></iframe>
      </div>
      <ScrollToTopButton />
      <Footer />
    </>
  );
};

export default HomePage;
