import React, { useState, useEffect } from "react";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    const scrollContainer = document.getElementById("scroll-container");
    if (scrollContainer && scrollContainer.scrollTop > 30) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    const scrollContainer = document.getElementById("scroll-container");
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const scrollContainer = document.getElementById("scroll-container");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", toggleVisibility);
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", toggleVisibility);
      }
    };
  }, []);

  return (
    <div>
      {isVisible && (
        <div
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center cursor-pointer"
          style={{ width: "48px", height: "48px" }}
        >
          <KeyboardDoubleArrowUpIcon />
        </div>
      )}
    </div>
  );
};

export default ScrollToTopButton;
