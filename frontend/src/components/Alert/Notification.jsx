import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function Notification() {
  const MySwal = withReactContent(Swal);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  const handleClick = () => {
    MySwal.fire({
      title: "Bạn có muốn đăng xuất không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire("Đã đăng xuất!", "", "success");
      }
    });
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <li className="flex items-center relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="block px-1.5 py-2 text-sm font-semibold transition-all ease-nav-brand text-slate-500 flex items-center border border-gray-300 rounded hover:bg-gradient-to-r hover:from-neutral-400 hover:to-orange-700 hover:text-white"
      >
        <span className="hidden sm:inline">Welcome, Văn Mạnh</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 ml-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20"
          style={{ top: "50px" }}
        >
          <div className="py-1">
            <a
              onClick={() => navigate("/profile")}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </a>

            <a
              onClick={handleClick}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Log Out
            </a>
          </div>
        </div>
      )}
    </li>
  );
}

export default Notification;
