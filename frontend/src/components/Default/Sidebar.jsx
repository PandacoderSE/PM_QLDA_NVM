// Sidebar_T.jsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Card,
  IconButton,
  AccordionHeader,
  AccordionBody,
  Accordion,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ClipboardDocumentIcon,
  UserIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  QrCodeIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  BellIcon
} from "@heroicons/react/24/solid";

import i18n from "../../i18n/i18n";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getToken } from "../Services/localStorageService";
import axios from "axios";
import {
  ChevronRightIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/outline";
import { use } from "i18next";

function Sidebar({
  isDrawerOpen,
  toggleDrawer,
  selected,
  handleSelect,
  isOpenMenu = false,
}) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [isOpen, setIsOpen] = useState(isOpenMenu);
  const [currentSelected, setCurrentSelected] = useState(selected);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };
  const handleResize = () => {
    if (window.innerWidth < 800 && isDrawerOpen) {
      toggleDrawer();
    } else if (window.innerWidth >= 800 && !isDrawerOpen) {
      toggleDrawer();
    }
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isDrawerOpen]);
  const token = getToken();
  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/user/getRoleByUser",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRoles(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    fetchRoles();
  }, []);
  
  useEffect(() => {
    const savedSelected = sessionStorage.getItem("selected");
    setCurrentSelected(savedSelected !== null ? savedSelected : "home");
  }, [selected]);
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-color text-sidebar-color flex flex-col transition-all duration-300 shadow-lg z-10 ${
        isDrawerOpen ? "w-60" : "w-14"
      }`}
    >
      <Card
        color="transparent"
        shadow={false}
        className="h-full flex flex-col justify-between text-color"
      >
        <div>
          <div className="mb-2 flex items-center justify-between p-4">
            <img
              src="https://img.upanh.tv/2025/03/20/NMAXSOFT-2.png" 
              alt="Logo"
              className={`transition-all duration-200 ${
                isDrawerOpen ? "block" : "hidden"
              }`}
            />
            <IconButton
              className="pl-2"
              variant="text"
              size="lg"
              onClick={toggleDrawer}
            >
              {isDrawerOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path
                    className="icon-color"
                    d="M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9.59L17.42 12 21 8.41 19.59 7l-5 5 5 5L21 15.59z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24V24H0V0z" fill="none" />
                  <path
                    className="icon-color"
                    transform="rotate(180 12 12)"
                    d="M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9.59L17.42 12 21 8.41 19.59 7l-5 5 5 5L21 15.59z"
                  />
                </svg>
              )}
            </IconButton>
          </div>

          <List>
            <ListItem
              selected={currentSelected === "home"}
              onClick={() => {
                handleSelect("home");
                navigate("/home");
              }}
              className={`${
                currentSelected === "home" ? "bg-sidebar-color text-sidebar-color" : ""
              }`}
            >
              <ListItemPrefix>
                <HomeIcon
                  className={`transition-all duration-200 ${
                    isDrawerOpen ? "h-6 w-6" : "h-4 w-4"
                  }`}
                />
              </ListItemPrefix>
              <Typography
                variant="h6"
                className={`transition-all duration-200 ${
                  isDrawerOpen ? "block" : "hidden"
                } ease-in-out`}
              >
                {t("homePage")}
              </Typography>
            </ListItem>

            <Accordion
              open={isOpen}
              icon={
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`mx-auto h-4 w-4 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  } ${isDrawerOpen ? "block" : "hidden"}`}
                />
              }
            >
              <ListItem className="p-0" selected={isOpen}>
                <AccordionHeader
                  onClick={() => handleOpen()}
                  className="border-b-0 p-3"
                >
                  <ListItemPrefix>
                    <ClipboardDocumentIcon
                      className={`transition-all duration-200 ${
                        isDrawerOpen ? "h-6 w-6" : "h-4 w-4"
                      }`}
                    />
                  </ListItemPrefix>
                  <Typography
                    variant="h6"
                    color="blue-gray"
                    className={`transition-all duration-200 mr-auto ${
                      isDrawerOpen ? "block" : "hidden"
                    } ease-in-out`}
                  >
                    {t("materials-management")}
                  </Typography>
                </AccordionHeader>
              </ListItem>
              <AccordionBody className="py-1">
                <List className="p-0">
                  <ListItem
                    selected={currentSelected === "product"}
                    onClick={() => {
                      handleSelect("product");
                      navigate("/product");
                    }}
                    className={`${
                      currentSelected === "product"
                        ? "bg-sidebar-color text-sidebar-color"
                        : ""
                    }`}
                  >
                    <ListItemPrefix>
                      <ChevronRightIcon
                        strokeWidth={3}
                        className={`transition-all duration-200 ${
                          isDrawerOpen ? "h-3 w-5" : "h-3 w-5"
                        }`}
                      />
                    </ListItemPrefix>
                    <Typography
                      variant="h6"
                      className={`transition-all duration-200 ${
                        isDrawerOpen ? "block" : "hidden"
                      } ease-in-out`}
                    >
                      {t("list-materials")}
                    </Typography>
                  </ListItem>
                  <ListItem
                    selected={currentSelected === "assign-device"}
                    onClick={() => {
                      handleSelect("assign-device");
                      navigate("/assign-device");
                    }}
                    className={`${
                      currentSelected === "assign-device"
                        ? "bg-sidebar-color text-sidebar-color"
                        : ""
                    }`}
                  >
                    <ListItemPrefix>
                      <ChevronRightIcon
                        strokeWidth={3}
                        className={`transition-all duration-200 ${
                          isDrawerOpen ? "h-3 w-5" : "h-3 w-5"
                        }`}
                      />
                    </ListItemPrefix>
                    <Typography
                      variant="h6"
                      className={`transition-all duration-200 ${
                        isDrawerOpen ? "block" : "hidden"
                      } ease-in-out`}
                    >
                      {t("equip-handover")}
                    </Typography>
                  </ListItem>
                </List>
              </AccordionBody>
            </Accordion>

            <ListItem
              selected={currentSelected === "category"}
              onClick={() => {
                handleSelect("category");
                navigate("/category");
              }}
              className={`${
                currentSelected === "category"
                  ? "bg-sidebar-color text-sidebar-color"
                  : ""
              }`}
            >
              <ListItemPrefix>
                <ArchiveBoxIcon
                  className={`transition-all duration-200 ${
                    isDrawerOpen ? "h-6 w-6" : "h-4 w-4"
                  }`}
                />
              </ListItemPrefix>
              <Typography
                variant="h6"
                className={`transition-all duration-200 ${
                  isDrawerOpen ? "block" : "hidden"
                } ease-in-out`}
              >
                {t("category-management")}
              </Typography>
            </ListItem>

            {roles.includes("ADMIN") && (
              <ListItem
                selected={currentSelected === "user-management"}
                onClick={() => {
                  handleSelect("user-management");
                  navigate("/user-management");
                }}
                className={`${
                  currentSelected === "user-management"
                    ? "bg-sidebar-color text-sidebar-color"
                    : ""
                }`}
              >
                <ListItemPrefix>
                  <UserIcon
                    className={`transition-all duration-200 ${
                      isDrawerOpen ? "h-6 w-6" : "h-4 w-4"
                    }`}
                  />
                </ListItemPrefix>
                <Typography
                  variant="h6"
                  className={`transition-all duration-200 ${
                    isDrawerOpen ? "block" : "hidden"
                  } ease-in-out`}
                >
                  {t("user-management")}
                </Typography>
              </ListItem>
            )}

            <ListItem
              selected={currentSelected === "statiscis"}
              onClick={() => {
                handleSelect("statiscis");
                navigate("/statiscis");
              }}
              className={`${
                currentSelected === "statiscis"
                  ? "bg-sidebar-color text-sidebar-color"
                  : ""
              }`}
            >
              <ListItemPrefix>
                <ChartBarIcon
                  className={`transition-all duration-200 ${
                    isDrawerOpen ? "h-6 w-6" : "h-4 w-4"
                  }`}
                />
              </ListItemPrefix>
              <Typography
                variant="h6"
                className={`transition-all duration-200 ${
                  isDrawerOpen ? "block" : "hidden"
                } ease-in-out`}
              >
                {t("statiscis")}
              </Typography>
            </ListItem>
            <ListItem
                  selected={currentSelected === "notification"}
                  onClick={() => {
                    handleSelect("notification");
                    navigate("/notification");
                  }}
                  className={`${
                    currentSelected === "notification"
                      ? "bg-sidebar-color text-sidebar-color"
                      : ""
                  }`}
                >
                  <ListItemPrefix>
                    <BellIcon
                      className={`transition-all duration-200 ${
                        isDrawerOpen ? "h-6 w-6" : "h-4 w-4"
                      }`}
                    />
                  </ListItemPrefix>
                  <Typography
                    variant="h6"
                    className={`transition-all duration-200 ${
                      isDrawerOpen ? "block" : "hidden"
                    } ease-in-out`}
                  >
                    {/* {t("notification")} */}
                    Thông Báo
                  </Typography>
                </ListItem>
          </List>
        </div>
      </Card>
    </div>
  );
}

export default Sidebar;
