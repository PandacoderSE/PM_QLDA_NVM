import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { setToken } from "../Services/localStorageService";
import jwtDecode from "jwt-decode";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("selected", "home");
  }, []);

  const dangnhap = async (event) => {
    event.preventDefault();

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

      const token = response.data.data.token;
      setToken(token);

      alert("Đăng nhập thành công");
      const decodedToken = jwtDecode(token);
      const tokenExpiry = decodedToken.exp * 1000;
      localStorage.setItem("tokenExpiry", tokenExpiry.toString());
      navigate("/home");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Tài khoản, mật khẩu không chính xác.");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-4">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-500 hover:shadow-3xl">
        {/* Left: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
              Đăng Nhập Hệ Thống
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              Truy cập tài khoản của bạn để tiếp tục
            </p>
          </div>
          <form onSubmit={dangnhap} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tên đăng nhập
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Nhập tên đăng nhập"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-orange-500 transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.79m0 0L21 21"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
            >
              Đăng nhập
            </button>
          </form>
        </div>
        {/* Right: Image Section */}
        <div className="hidden md:block w-1/2 relative">
          <img
            src="./src/assets/img/background3.png"
            alt="Login background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/70 to-transparent flex items-center justify-center">
            <div className="text-center text-white p-6">
              <h2 className="text-2xl font-bold">Chào mừng bạn!</h2>
              <p className="mt-2 text-sm opacity-90">
                Đăng nhập để trải nghiệm hệ thống
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;