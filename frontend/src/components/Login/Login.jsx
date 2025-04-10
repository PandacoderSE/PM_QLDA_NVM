import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { setToken } from "../Services/localStorageService";
import jwtDecode from "jwt-decode";
function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    sessionStorage.setItem("selected", "home");
  }, [])
  const dangnhap = async (event) => {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form

    if (!username || !password) {
      alert("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/login",
        {
          username,
          password,
        }
      );

      const token = response.data.data.token; // Lấy token từ phản hồi JSON
      setToken(token);

      alert("Đăng nhập thành công");
      // localStorage.setItem('tokenExpiry', 600000);
      const decodedToken = jwtDecode(token);
      const tokenExpiry = decodedToken.exp * 1000; // Chuyển đổi từ giây sang milliseconds
      localStorage.setItem("tokenExpiry", tokenExpiry.toString());
      navigate("/home");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Tài khoản , mật khẩu không chính xác.");
      } else if (error.response && error.response.status === 404) {
        alert("Tài khoản không tồn tại");
      } else if (error.response && error.response.status === 403) {
        alert("Tài khoản không có quyền truy cập");
      } else {
        alert("Lỗi server rồi");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full lg:w-auto m-4 lg:m-20 bg-white shadow-lg rounded-lg flex flex-col lg:flex-row justify-center">
        <div className="p-4 lg:p-20 m-4 lg:m-10">
          <div className="flex flex-col items-center mt-10">
            <h1 className="text-3xl md:text-5xl xl:text-4xl font-bold text-gray-900">
              Sign in account
            </h1>
            <div className="w-full flex-1 mt-8">
              <form onSubmit={dangnhap} className="mx-auto max-w-xs">
                <div className="relative mt-6">
                  <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Username"
                    className="peer mt-2 w-full bg-transparent border-b-2 border-gray-300 px-0 py-1 placeholder-transparent focus:border-gray-500 focus:outline-none"
                    autoComplete="off"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <label
                    htmlFor="username"
                    className="pointer-events-none absolute top-0 left-0 origin-left -translate-y-1/2 bg-transparent transform text-sm text-gray-800 opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:pl-0 peer-focus:text-sm peer-focus:text-gray-800"
                  >
                    Username
                  </label>
                </div>
                <div className="relative mt-6">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    className="peer mt-2 w-full bg-transparent border-b-2 border-gray-300 px-0 py-1 placeholder-transparent focus:border-gray-500 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label
                    htmlFor="password"
                    className="pointer-events-none absolute top-0 left-0 origin-left -translate-y-1/2 transform text-sm text-gray-800 opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:pl-0 peer-focus:text-sm peer-focus:text-gray-800"
                  >
                    Password
                  </label>
                </div>
                <div className="flex items-center justify-between mt-8">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-orange-500 to-orange-500 shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 transition duration-300 ease-in-out"
                  >
                    Log In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="hidden lg:block p-4 lg:p-0">
          <div className="h-full w-full">
            <img
              src="./src/assets/img/background3.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
