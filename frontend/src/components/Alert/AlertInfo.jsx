import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const AlertInfo = ({ message, type, z = "z-0" }) => {
  const [visible, setVisible] = useState(false);
  const baseStyle = `${z} transition-transform transform duration-200 fixed top-16 right-4 z-50 flex items-center p-4 mb-4 border-t-4 rounded-lg role="alert"`;
  let alertStyle = "";
  let svgPath = "";

  switch (type) {
    case "info":
      alertStyle = `${baseStyle} text-blue-800 border-blue-300 bg-blue-50 dark:text-blue-400 dark:bg-gray-800 dark:border-blue-800`;
      svgPath =
        "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 1 1 1 1v4h1a1 1 0 1 1 0 2Z";
      break;
    case "success":
      alertStyle = `${baseStyle} text-green-800 border-green-300 bg-green-50 dark:text-green-400 dark:bg-gray-800 dark:border-green-800`;
      svgPath =
        "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 1 1 1 1v4h1a1 1 0 1 1 0 2Z";
      break;
    case "error":
      alertStyle = `${baseStyle} text-red-800 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800`;
      svgPath =
        "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z";
      break;
    case "warning":
      alertStyle = `${baseStyle} text-yellow-800 border-yellow-300 bg-yellow-50 dark:text-yellow-300 dark:bg-gray-800 dark:border-yellow-800`;
      svgPath =
        "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z";
      break;
    case "dark":
      alertStyle = `${baseStyle} text-gray-800 border-gray-300 bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600`;
      svgPath =
        "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z";
      break;
    default:
      alertStyle = baseStyle;
  }

  useEffect(() => {
    if (message) {
      setVisible(true);
      setTimeout(() => setVisible(false), 10000);
    }
  }, [message]);

  return (
    <div
      className={`${alertStyle} ${
        visible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <svg
        className="flex-shrink-0 w-4 h-4"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d={svgPath} />
      </svg>
      <div className="ms-3 text-sm font-medium">{message}</div>
    </div>
  );
};

AlertInfo.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["info", "success", "error", "warning", "dark"])
    .isRequired,
};

export default AlertInfo;
