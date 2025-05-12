import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import AnimatedCard from "../Animation/AnimatedCard";
import CoverFlow from "../Animation/CoverFlow";
import CardDefault from "./CardDefault";
import ScrollToTopButton from "./ScrollToTopButton";
import Footer from "./Footer";
import { getToken } from "../Services/localStorageService";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleAlert = (title, message, type, buttonText) => {
    alert(`${title}: ${message}`);
  };

  // Fetch notifications
  const fetchNotis = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/notifications/getAll",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      const fetchedNotifications = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setNotifications(fetchedNotifications);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error("Unauthorized access - Invalid or missing token");
        handleAlert(
          "Lỗi",
          "Bạn không có quyền truy cập. Vui lòng kiểm tra lại thông tin đăng nhập!",
          "error",
          "Đóng"
        );
      } else {
        console.error("Error fetching notifications", error);
        handleAlert(
          "Lỗi",
          "Không thể tải danh sách thông báo. Vui lòng thử lại sau!",
          "error",
          "Đóng"
        );
      }
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotis();
  }, []);

  // Calendar logic
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const selectDate = (day) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  };

  // Check if a day has notifications
  const hasNotifications = (day) => {
    return notifications.some((notification) => {
      const notificationDate = new Date(notification.createdTime);
      return (
        notificationDate.getFullYear() === currentMonth.getFullYear() &&
        notificationDate.getMonth() === currentMonth.getMonth() &&
        notificationDate.getDate() === day
      );
    });
  };

  // Filter notifications by selected date
  const filteredNotifications = notifications.filter((notification) => {
    const notificationDate = new Date(notification.createdTime);
    return (
      notificationDate.getFullYear() === selectedDate.getFullYear() &&
      notificationDate.getMonth() === selectedDate.getMonth() &&
      notificationDate.getDate() === selectedDate.getDate()
    );
  });

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // Open modal with notification details
  const openNotification = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const formatDateTime = (localDateTime) => {
    return new Date(localDateTime).toLocaleString("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const truncateContent = (content, maxLength = 100) => {
    const text = content.replace(/<[^>]+>/g, ""); // Strip HTML tags
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="bg-gray-100">
            <AnimatedCard animationType="slideUp" duration={0.5}>
        <div
          className="relative bg-orange-500 text-white py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-orange-500/60"></div>
          <div className="relative max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Welcome to NMAXSOFT
            </h1>
            <p className="mt-4 text-lg sm:text-xl opacity-90">
              Empowering your business with innovative technology
            </p>
            <button
              onClick={() => navigate("/about")}
              className="mt-6 inline-block bg-white text-orange-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-orange-50 hover:scale-105 transition duration-300"
            >
              Discover More
            </button>
          </div>
        </div>
      </AnimatedCard>
      {/* Notifications Calendar Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-orange-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-2 text-orange-600 hover:bg-orange-100 rounded-full"
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentMonth.toLocaleString("vi-VN", { month: "long", year: "numeric" })}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 text-orange-600 hover:bg-orange-100 rounded-full"
                  aria-label="Next month"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </div>
              <div role="grid" className="grid grid-cols-7 gap-1 text-center">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                  <div key={day} className="text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="h-10"></div>
                ))}
                {daysArray.map((day) => {
                  const isToday =
                    day === new Date().getDate() &&
                    currentMonth.getMonth() === new Date().getMonth() &&
                    currentMonth.getFullYear() === new Date().getFullYear();
                  const isSelected =
                    day === selectedDate.getDate() &&
                    currentMonth.getMonth() === selectedDate.getMonth() &&
                    currentMonth.getFullYear() === selectedDate.getFullYear();
                  const hasNotif = hasNotifications(day);
                  return (
                    <button
                      key={day}
                      onClick={() => selectDate(day)}
                      className={classNames(
                        "h-10 w-10 rounded-full flex flex-col items-center justify-center text-sm relative",
                        isSelected ? "bg-orange-500 text-white" : "text-gray-700",
                        isToday ? "bg-orange-200" : "hover:bg-orange-100",
                        "transition duration-200"
                      )}
                      aria-selected={isSelected}
                      aria-label={`Ngày ${day}${hasNotif ? " có thông báo" : ""}`}
                    >
                      <span>{day}</span>
                      {hasNotif && (
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 absolute bottom-1"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Notification Cards */}
            <div className="lg:col-span-2">
              {filteredNotifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer"
                      onClick={() => openNotification(notification)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Xem thông báo: ${notification.title}`}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {truncateContent(notification.content)}
                      </p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Người tạo: {notification.createby}</span>
                        <span>{formatDateTime(notification.createdTime)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">
                  Không có thông báo nào cho ngày {selectedDate.toLocaleDateString("vi-VN")}.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}


      {/* Showcase Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Technology Solutions"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
                <p className="text-white text-xl font-semibold">
                  Innovative Technology
                </p>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Team Collaboration"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
                <p className="text-white text-xl font-semibold">
                  Seamless Collaboration
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      {/* <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Location
          </h2>
          <div className="relative rounded-lg shadow-xl overflow-hidden border-2 border-orange-500">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4635.192195253579!2d105.7998028!3d21.0459244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab5012da64d7%3A0x85db86f3197d7b10!2zQ8O0bmcgdHkgVXNvbC1WaeG7h3QgTmFt!5e1!3m2!1svi!2s!4v1736936196683!5m2!1svi!2s"
              width="100%"
              height="450"
              allowFullScreen=""
              loading="lazy"
              className="border-0"
            ></iframe>
          </div>
        </div>
      </section> */}

      {/* Notification Details Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white rounded-lg p-6 border-t-4 border-orange-500">
            {selectedNotification && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedNotification.title}
                  </h3>
                  <button onClick={closeModal}>
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
                <div className="text-gray-600 mb-4">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedNotification.content,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Created by: {selectedNotification.createby}
                </p>
                <p className="text-sm text-gray-500">
                  Posted on: {formatDateTime(selectedNotification.createdTime)}
                </p>
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      <ScrollToTopButton />
      <Footer />
    </div>
  );
};

export default HomePage;