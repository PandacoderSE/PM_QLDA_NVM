import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserMenu from "../Login/UserMenu";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n/i18n";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const NavBar = ({ handleSelect }) => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const { t, i18n } = useTranslation();
  const [isJapanese, setIsJapanese] = useState(i18n.language === "ja");
  const toggleLanguage = () => {
    const newLanguaege = isJapanese ? "vi" : "ja";
    i18n.changeLanguage(newLanguaege);
    localStorage.setItem("userLanguage", newLanguaege);
    setIsJapanese(!isJapanese);
  };

  // Chuyển màu
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  useEffect(() => {
    const savedTheme = darkMode ? "dark" : "light";
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", savedTheme);
  }, [darkMode]);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = "6f49f0eba10c91d0cf37a1a7c28192af";
      const city = "Hanoi";
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=${localStorage.getItem(
        "userLanguage"
      )}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        data.weather[0].description =
          data.weather[0].description.charAt(0).toUpperCase() +
          data.weather[0].description.slice(1);
        setWeather(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeather();
  }, [i18n.language]);

  return (
    <nav
      className="relative  flex flex-wrap items-center justify-between px-0 py-2 pt-4 mx-6 transition-all shadow-none duration-250 ease-soft-in rounded-2xl lg:flex-nowrap lg:justify-start"
      navbar-main="true"
      navbar-scroll="true"
    >
      <div className="flex items-center justify-between flex-grow px-4 py-1 mx-auto flex-wrap-inherit ">
        <div className="flex items-center">
          <nav>
            {weather && (
              <div className="mr-4 text-sm flex items-center">
                {weather.name}: {weather.main.temp}°C,{" "}
                {weather.weather[0].description}
                <img
                  src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                  alt={weather.weather[0].description}
                  className="w-8 h-8 ml-2"
                />
              </div>
            )}
            {/* <ol className="flex flex-wrap pt-1 mr-12 bg-transparent rounded-lg sm:mr-16">
          <li className="leading-normal">
            <a className={`text-color cursor-pointer ${navSelected === "home" ? "font-bold text-color" : "text-slate-700"}`} onClick={() => { navigate("/home"); localStorage.setItem("navSelected", JSON.stringify("home")); setNavSelected(localStorage.getItem("navSelected")); }}>
              {navSelected === "home" ? `${t("homePage")}` : `${t("homePage")}/`}
            </a>
          </li>
          {navSelected !== "home" && navSelected && (
            <li className="pl-2 font-bold capitalize leading-normal text-slate-700 text-color">
              {navSelected === "materials-management" && `${t("materials-management")}`}
              {navSelected === "user-management" && `${t("user-management")}`}
              {navSelected === "statiscis" && `${t("statiscis")}`}
              {navSelected === "qr-code-management" && `${t("qr-code-manager")}`}
              {navSelected === "category-management" && `${t("category-management")}`}
            </li>
          )}
        </ol> */}
          </nav>
        </div>
        <div className="flex items-center justify-end w-full lg:w-auto">
          <ul className="flex flex-row justify-end pl-0 mb-0 list-none lg:w-full">
            {/* dask night */}
            <li className="flex items-center">
          <div className="inline-flex items-center gap-2">
            <label htmlFor="switch-component-on" className="text-slate-600 text-sm cursor-pointer" onClick={toggleLanguage}>
              <img src={isJapanese ? "./src/assets/img/japan.png" : "./src/assets/img/vietnam.png"} alt={isJapanese ? "Cờ Nhật Bản" : "Cờ Việt Nam"} className="w-10" />
            </label>
          </div>
        </li>
        <li className="flex items-center px-4">
          <div className="inline-flex items-center gap-2">
            <label htmlFor="switch-theme-on" className="text-color text-sm cursor-pointer" onClick={toggleDarkMode}>
              {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
            </label>
          </div>
        </li>
            <li className="flex items-center">
              <UserMenu handleSelect={handleSelect} />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
