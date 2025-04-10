import React, { useState, useEffect } from "react";
import Aside from "../Default/Aside";
import Navigation from "../Default/Navigation";
import axios from "axios";
import { getToken } from "../Services/localStorageService.js";
import Modal from "@mui/material/Modal";
import Sidebar_T from "../Default/Sidebar";
import NavBar_T from "../Default/NavBar";
function Profile() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState(
        {
            firstname: '',
            lastname: '',
            email: '',
            phone: ''
        });
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
    };
    // validate
    const [errors, setErrors] = useState({});
    const validateField = (name, value) => {
        let error = '';

        if (name === "email") {
            if (!value) {
              error = "Email là bắt buộc";
            } else if (!/\S+@\S+\.\S+/.test(value)) {
              error = "Email không hợp lệ";
            }
          }  else if (name === "firstname") {
            if (!value) {
              error = "Tên là bắt buộc";
            } else if (!/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/.test(value)) {
              error = "Tên chỉ được chứa chữ cái";
            }
          } else if (name === "lastname") {
            if (!value) {
              error = "Họ là bắt buộc";
            } else if (!/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/.test(value)) {
              error = "Họ chỉ được chứa chữ cái";
            }
          } 
        else if (name === "phone") {
            if (!value) {
              error = "Số điện thoại là bắt buộc";
            } else if (!/^\d{10}$/.test(value)) {
              error = "Số điện thoại phải chứa 10 ký tự số";
            }
          }

        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Validate field on change
        validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        // Validate field on blur
        validateField(name, value);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const fieldsToValidate = ['email', 'firstname', 'lastname', 'phone'];
            fieldsToValidate.forEach(field => {
                validateField(field, profileData[field]);
            });
 
            // Check for existing errors
            const hasErrors = Object.values(errors).some(error => error !== '');
 
            if (hasErrors) {
                console.error("Validation errors exist. Update aborted.");
                return;
            }
            const token = getToken();
            if (!token) {
                console.error("Token không tồn tại");
                return;
            }
            const updatedProfileData = {
                firstname: profileData.firstname || userInfo.firstname,
                lastname: profileData.lastname || userInfo.lastname,
                email: profileData.email || userInfo.email,
                phone: profileData.phone || userInfo.phone
            };

            const response = await axios.put("http://localhost:8080/api/v1/user/updateProfile", updatedProfileData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data && response.data.success) {
                alert('Cập nhật hồ sơ thành công');
                setUserInfo(response.data.data);
            } else {
                console.error('Cập nhật hồ sơ thất bại');
            }
        } catch (error) {
            console.error("Cập nhật hồ sơ thất bại:", error);
        }
    };



    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải trên 6 kí tự');
            return;
        }else if(newPassword !== confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không trùng khớp');
            return;
        }

        try {
            const token = getToken();
            if (!token) {
                console.error("Token không tồn tại");
                return;
            }

            const response = await axios.put("http://localhost:8080/api/v1/user/updatePassword", {
                oldPassword,
                newPassword
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data && response.data.success) {
                alert('Cập nhật mật khẩu thành công');
                closeModal();
            } else {
                setError('Cập nhật mật khẩu thất bại');
            }
        } catch (error) {
            console.error("Cập nhật mật khẩu thất bại:", error);
            setError('Cập nhật mật khẩu thất bại');
        }
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = getToken();
                if (!token) {
                    console.error("Token không tồn tại");
                    return;
                }

                const response = await axios.get("http://localhost:8080/api/v1/user/myInfo", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data && response.data.data) {
                    setUserInfo(response.data.data); // Lưu thông tin người dùng vào state
                    setProfileData({
                        firstname: response.data.data.firstname,
                        lastname: response.data.data.lastname,
                        email: response.data.data.email,
                        phone: response.data.data.phone
                    });
                } else {
                    console.error("Phản hồi API không chứa dữ liệu người dùng");
                }
            } catch (error) {
                console.error("Lấy thông tin người dùng thất bại:", error);
            }
        };

        fetchUserInfo();
    }, []);
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(() => {
        const savedState = localStorage.getItem("isDrawerOpen");
        return savedState !== null ? JSON.parse(savedState) : true;
    });
    const [selected, setSelected] = React.useState(''); //Điều chỉnh phù hợp để bôi đậm lựa chọn trên sidebar và navbar

    const toggleDrawer = () => {
        const newState = !isDrawerOpen;
        setIsDrawerOpen(!isDrawerOpen);
        localStorage.setItem("isDrawerOpen", JSON.stringify(newState));
    }

    const handleSelect = (page) => setSelected(page);
    return (
        <div className='flex h-screen'>
        
                <main className="flex-grow ease-soft-in-out relative h-full max-h-screen rounded-xl transition-all duration-200  p-4">
                    <div class="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('https://png.pngtree.com/background/20211217/original/pngtree-fresh-and-beautiful-blue-sky-and-white-clouds-photography-map-picture-image_1560337.jpg')] bg-cover	bg-center"><div class="absolute inset-0 h-full w-full bg-gray-900/75"></div></div>
                    <div class="relative flex flex-col bg-clip-border rounded rounded-xl bg-white text-gray-700 shadow-md mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
                        <div className="flex">
                            <div className="container mx-auto p-4">
                                <div className="flex flex-wrap">
                                    <div className="w-full">
                                        <div className="bg-white rounded-lg p-6">
                                            <div className="mb-4">
                                                <h4 className="text-xl font-semibold">Chỉnh sửa trang cá nhân</h4>
                                            </div>
                                            {userInfo ? (
                                                <form>
                                                    <div className="flex flex-wrap -mx-3 mb-6">
                                                        <div className="w-full md:w-6/12 px-3 mb-6 md:mb-0">
                                                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                                                Tên đăng nhập
                                                            </label>
                                                            <input
                                                                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                                                                type="text"
                                                                placeholder=" Tên đăng nhập"
                                                                defaultValue={userInfo.username}
                                                                disabled
                                                            />
                                                        </div>
                                                        <div className="w-full md:w-6/12 px-3 mb-6 md:mb-0">
                                                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                                                Email
                                                            </label>
                                                            <input
                                                                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                                                                type="email"
                                                                name="email"
                                                                placeholder="Email"
                                                                value={profileData.email}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                            />
                                                            {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap -mx-3 mb-6">
                                                        <div className="w-full md:w-6/12 px-3 mb-6 md:mb-0">
                                                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                                                Tên
                                                            </label>
                                                            <input
                                                                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                                                                type="text"
                                                                name="firstname"
                                                                placeholder="Tên"
                                                                value={profileData.firstname}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                            />
                                                            {errors.firstname && <div className="text-red-500 text-xs">{errors.firstname}</div>}
                                                        </div>
                                                        <div className="w-full md:w-6/12 px-3 mb-6 md:mb-0">
                                                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                                                Họ
                                                            </label>
                                                            <input
                                                                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                                                                type="text"
                                                                name="lastname"  // Thêm thuộc tính name
                                                                placeholder="Họ"
                                                                value={profileData.lastname}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                            />
                                                            {errors.lastname && <div className="text-red-500 text-xs">{errors.lastname}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap -mx-3 mb-6">
                                                        <div className="w-full px-3">
                                                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                                                                Số điện thoại
                                                            </label>
                                                            <input
                                                                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                                                                type="text"
                                                                name="phone"  // Thêm thuộc tính name
                                                                placeholder="Số điện thoại"
                                                                value={profileData.phone}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                            />
                                                            {errors.phone && <div className="text-red-500 text-xs">{errors.phone}</div>}

                                                        </div>
                                                    </div>
                                                    <button
                                                        className="bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gradient-to-r hover:from-neutral-400 hover:to-orange-700"
                                                        type="submit"
                                                        onClick={handleUpdateProfile}
                                                    >
                                                        Cập nhật
                                                    </button>
                                                    <button
                                                        className="bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gradient-to-r hover:from-neutral-400 hover:to-orange-700"
                                                        type="button" style={{ margin: '0px 10px 10px 10px' }}
                                                        onClick={openModal}
                                                    >
                                                        Thay đổi mật khẩu
                                                    </button>
                                                </form>
                                            ) : (
                                                <p>Loading...</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Modal
                    open={isModalOpen}
                    onClose={closeModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
                >
                    <div className="bg-white p-5 rounded-lg">
                        <h2 className="text-center font-bold text-xl mb-4">Đổi mật khẩu</h2>
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Mật khẩu cũ
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    type="password"
                                    placeholder="Mật khẩu cũ"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Mật khẩu mới
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    type="password"
                                    placeholder="Mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Xác nhận mật khẩu mới
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    type="password"
                                    placeholder="Xác nhận mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-xs italic">{error}</p>}
                            <div className="flex items-center justify-between">
                                <button
                                    className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gradient-to-r hover:from-neutral-400 hover:to-orange-700e"
                                    type="submit"
                                    style={{ marginRight: '30px' }}
                                >
                                    Đổi mật khẩu
                                </button>
                                <button
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gradient-to-r hover:from-neutral-400 hover:to-orange-700"
                                    type="button"
                                    onClick={closeModal}
                                >
                                    Hủy
                                </button>
                            </div>

                        </form>
                    </div>
                </Modal>
        </div>
    );
}

export default Profile;

