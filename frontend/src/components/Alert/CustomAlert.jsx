import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "tailwindcss/tailwind.css";

const CustomAlert = ({
  buttonText,
  title,
  icon,
  showCancelButton,
  confirmButtonText,
  cancelButtonText,
  customMessage,
  customMessageError,
  onConfirm,
  textColor,
  bgColor,
  bgButtonColor,
  bgButtonHover,
  textButtonColor,
  showSecondAlert,
}) => {
  const MySwal = withReactContent(Swal);

  const handleClick = () => {
    MySwal.fire({
      title: title,
      icon: icon,
      showCancelButton: showCancelButton,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      customClass: {
        popup: `${bgColor} p-6 rounded-lg shadow-lg`,
        title: `text-2xl font-bold ${textColor}`,
        confirmButton:
          "bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-md",
        cancelButton:
          "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow-md",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm()
          .then(() => {
            if (showSecondAlert) {
              MySwal.fire({
                title: customMessage,
                icon: "success",
                customClass: {
                  popup: `${bgColor} p-6 rounded-lg shadow-lg`,
                  title: `text-2xl font-bold ${textColor}`,
                  confirmButton:
                    "bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-md",
                },
              });
            }
          })
          .catch((error) => {
            MySwal.fire({
              title: customMessageError,
              text: error.message,
              icon: "error",
              customClass: {
                popup: "bg-red-100 p-6 rounded-lg shadow-lg",
                title: "text-2xl font-bold text-red-800",
                confirmButton:
                  "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow-md",
              },
            });
          });
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${bgButtonColor} ${bgButtonHover} ${textButtonColor} font-bold px-4 py-2 m-2 rounded-lg shadow-md`}
    >
      {buttonText}
    </button>
  );
};

export default CustomAlert;
