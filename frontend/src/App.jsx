import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login/Login";
import Profile from "./components/Login/Profile";
import AddNewProduct from "./components/Product/AddNewProduct";
import EditProduct from "./components/Product/EditProduct";
import Statiscis from "./components/Statiscis/Statiscis";
import UserManagement from "./components/Admin/UserManagement";
import CreateNewUser from "./components/Admin/CreateNewUser";
import HomePage from "./components/Default/HomePage";
import CategoryManagement from "./components/Category/CategoryManagement";
import FlowersContainer from "./components/Flower/FlowersContainer";
import NotificationManagement from "./components/notification/NotificationManagement"
import "./components/Flower/FlowerStyles.css";
import "./App.css";
import { use } from "react";
import UserProduct from "./components/Product/UserProduct";
import {
  getToken,
  setToken,
  removeToken,
} from "./components/Services/localStorageService";
import axios from "axios";
import jwtDecode from "jwt-decode";
import ScrollToTopButton from "./components/Default/ScrollToTopButton";
import SearchDevice from "./components/Product/page/SearchDevice";
import Footer from "./components/Default/Footer";
import MainLayout from "./components/Default/MainLayout";
import Page404 from "./components/Error/Page404";
import Page403 from "./components/Error/Page403";
import persondevice from "./components/staff/persondevice/persondevice";
import feedback from "./components/staff/feedback/feedback";
import feedbackmanagement from "./components/FeedBackManagement/feedBackManagement";

const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = getToken();
  return token ? <Component {...rest} /> : <Navigate to="/" />;
};

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(() => {
    const savedState = localStorage.getItem("isDrawerOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [selected, setSelected] = useState(() => {
    const savedSelected = sessionStorage.getItem("selected");
    return savedSelected !== null ? savedSelected : "home";
  });

  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(newState);
    localStorage.setItem("isDrawerOpen", JSON.stringify(newState));
  };

  const handleSelect = (page) => {
    setSelected(page);
    sessionStorage.setItem("selected", page);
  };
  useEffect(() => {
    const path = location.pathname;
    const page = path === "/home" ? "home" : path.substring(1);
    setSelected(page);
    sessionStorage.setItem("selected", page);
  }, [location]);

  const [tokenExpiry, setTokenExpiry] = useState("");

  useEffect(() => {
    setTokenExpiry(localStorage.getItem("tokenExpiry"));
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const expiryTime = parseInt(tokenExpiry);
      const timeLeft = expiryTime - currentTime;

      if (timeLeft < 60000) {
        // Làm mới token nếu còn dưới 1 phút
        refreshToken();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [tokenExpiry]);

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/refresh",
        {
          token: getToken(),
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      const newToken = response.data.data.token;
      setToken(newToken);
      const decodedToken = jwtDecode(newToken);
      const newTokenExpiry = decodedToken.exp * 1000; // Chuyển đổi từ giây sang milliseconds
      localStorage.setItem("tokenExpiry", newTokenExpiry.toString());
      setTokenExpiry(newTokenExpiry);
    } catch (error) {
      removeToken();
    }
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/home-page"
            element={<PrivateRoute element={HomePage} />}
          />
          <Route
            element={
              <MainLayout
                isDrawerOpen={isDrawerOpen}
                toggleDrawer={toggleDrawer}
                selected={selected}
                handleSelect={handleSelect}
              />
            }
          >
            <Route path="/home" element={<PrivateRoute element={HomePage} />} />
            <Route
              path="/add-new-product"
              element={<PrivateRoute element={AddNewProduct} />}
            />
            <Route
              path="/edit-product"
              element={<PrivateRoute element={EditProduct} />}
            />
            <Route
              path="/product"
              element={<PrivateRoute element={SearchDevice} />}
            />
            <Route
              path="/statiscis"
              element={<PrivateRoute element={Statiscis} />}
            />
            <Route
              path="/profile"
              element={<PrivateRoute element={Profile} />}
            />
            <Route
              path="/user-management"
              element={<PrivateRoute element={UserManagement} />}
            />
            <Route
              path="/add-new-user"
              element={<PrivateRoute element={CreateNewUser} />}
            />
            <Route
              path="/assign-device"
              element={<PrivateRoute element={UserProduct} />}
            />
            <Route
              path="/category"
              element={<PrivateRoute element={CategoryManagement} />}
            />
            <Route
              path="/notification"
              element={<PrivateRoute element={NotificationManagement} />}
            />
            <Route
              path="/personal-device"
              element={<PrivateRoute element={persondevice} />}
            />
            <Route
              path="/feedback"
              element={<PrivateRoute element={feedback} />}
            />
            <Route
              path="/feedbackmanagement"
              element={<PrivateRoute element={feedbackmanagement} />}
            />
          </Route>
          <Route path="*" element={<Page404 />} />
          <Route path="/authed" element={<Page403 />} />
        </Routes>
      </BrowserRouter>
      {/* <FlowersContainer /> */}
    </>
  );
}

export default App;
