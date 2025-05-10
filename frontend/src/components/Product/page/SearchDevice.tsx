import { ChangeEvent, Key, useEffect, useRef, useState } from "react";
import ScrollToTopButton from "../../Default/ScrollToTopButton";
import TextInput from "../components/TextInput";
import { SelectInput } from "../components/SelectInput";
import BaseButton from "../components/BaseButton";
import { Device } from "../../../model/Device";
import DeviceTable from "../components/DeviceTable";
import DatePickerInput from "../components/DatePickerInput";
import { Category } from "../../../model/Category";
import deviceService, { DeviceListRequest } from "../../Services/deviceService";
import { Page } from "../../../model/Page";
import getAllCategory from "../../Services/CategoryService";
import CreateDevice from "./CreateDevice";
import CustomAlert from "../../Alert/CustomAlert.tsx";
import api from "../../Services/api";
import AlertInfo from "../../Alert/AlertInfo";
import {
  MdAddCircle,
  MdDelete,
  MdDownload,
  MdFilterAltOff,
  MdQrCode2,
  MdSearch,
  MdUpload,
} from "react-icons/md";

const SearchDevice = () => {
  const locationList = [
    { id: undefined, name: "Location" },
    {
      id: 1,
      name: "789",
    },
    {
      id: 2,
      name: "20HB",
    },
    {
      id: 3,
      name: "14HB",
    },
  ];

  const [accountingCode, setAccountingCode] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [manufacturer, setManufacturer] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [purpose, setPurpose] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [fileName, setFileName] = useState<string>("qrcodes.zip");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // Alert
  const [alert, setAlert] = useState({ message: "", type: "" });
  const showAlert = (message: any, type: any) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 5000);
  };
  const [devicePage, setDevicePage] = useState<Page<Device>>({
    contents: [],
    first: true,
    last: true,
    isEmpty: true,
    numberOfElement: 0,
    offset: 0,
    page: 0,
    pageSize: 0,
    totalElement: 0,
    totalPages: 0,
  });
  const [filterKey, setFilterKey] = useState<Key>(Date.now());
  const [tableKey, setTableKey] = useState<Key>(Date.now());
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([
    { name: "Category" },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  let location: string = "";
  let page: number = 1;

  const handleClear = async () => {
    setAccountingCode("");
    setSerialNumber("");
    setManufacturer("");
    setNotes("");
    setPurchaseDate(null);
    setPurpose("");
    setCategoryId(undefined);
    setExpirationDate(null);
    setFilterKey(Date.now());

    const request = {
      page: 1,
      pageSize: 10,
      accountingCode: "",
      serialNumber: "",
      manufacturer: "",
      notes: "",
      purchaseDate: undefined,
      purpose: "",
      categoryId: undefined,
      expirationDate: undefined,
      location: "",
    };
    await fetchDeviceData(request);
    setTableKey(Date.now());
  };

  const handleSelectDevice = (deviceId: string[]) => {
    setSelectedDeviceIds(deviceId);
  };

  const handleClickDelete = async () => {
    const deviceIds = selectedDeviceIds.map((id) => parseInt(id));
    if (deviceIds.length === 0) {
      showAlert("Chưa thiết bị nào được chọn", "error");
      return; // Dừng lại nếu không có thiết bị nào được chọn
    }
  
    try {
      await deviceService.deleteDevice(deviceIds);
      showAlert("Xóa thành công!", "success"); // Hiển thị thông báo thành công
      const request = getRequest();
      fetchDeviceData(request); // Làm mới dữ liệu
      setTableKey(Date.now()); // Cập nhật bảng
      setSelectedDeviceIds([]); // Xóa danh sách đã chọn
    } catch (error: any) {
      console.error("Delete error:", error);
      // Hiển thị thông báo lỗi từ server hoặc mặc định
      const errorMessage = error.message || "Xóa thất bại, vui lòng thử lại.";
      showAlert(errorMessage, "error");
    }
  };

  const getRequest = () => {
    const request = {
      page: page,
      pageSize: 10,
      accountingCode: accountingCode,
      serialNumber: serialNumber,
      manufacturer: manufacturer,
      notes: notes,
      purchaseDate: purchaseDate?.toISOString(),
      purpose: purpose,
      categoryId: categoryId,
      expirationDate: expirationDate?.toISOString(),
      location: location,
    };
    return request;
  };

  const fetchDeviceData = async (request: DeviceListRequest) => {
    try {
      const devicePage = await deviceService.getDevices(request);
      setDevicePage(devicePage);
    } catch (error) {
      showAlert("Lỗi khi lấy dữ liệu thiết bị", "error");
      console.log("Error fetching devices:", error);
    }
  };

  const fetchCategoryList = () => {
    getAllCategory()
      .then((categories) => {
        setCategoryList([...categoryList, ...categories]);
      })
      .catch((error) => {
        showAlert("Lỗi khi lấy dữ liệu danh mục", "error");
        console.log("Error fetching category: ", error);
      });
  };

  useEffect(() => {
    const request = getRequest();
    fetchDeviceData(request);
    fetchCategoryList();
  }, []);

  const handleChangeCategory = (event: ChangeEvent<HTMLSelectElement>) => {
    const category = categoryList.find((c) => c.name === event.target.value);
    if (category) {
      setCategoryId(category?.id);
    }
  };

  const handleClickSearch = async () => {
    page = 1;
    const request = getRequest();
    await fetchDeviceData(request);
    setTableKey(Date.now());
  };

  const handleChangeLocation = (event: ChangeEvent<HTMLSelectElement>) => {
    location = "";
    const selectedLocation = event.target.value;
    if (selectedLocation !== "All") location = selectedLocation;
  };

  const handlePageChange = (selectedItem: { selected: number }) => {
    page = selectedItem.selected + 1;
    const request = getRequest();
    fetchDeviceData(request);
  };

  const handleDeviceUpdate = async () => {
    await fetchDeviceData(getRequest());
    setTableKey(Date.now());
  };

  const handleDeviceCreateClose = () => {
    fetchDeviceData(getRequest());
    setIsOpen(false);
  };
  const handleDownloadQRCode = async () => {
    try {
      const deviceIds = selectedDeviceIds.map((id) => parseInt(id, 10));
      const response = await api.downloadQRCode(deviceIds);
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showAlert("Đang được tải xuống", "success");
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        showAlert(error.response.data.message, "error");
      }
    }
  };
  const handleExportExcel = async () => {
    try {
      const deviceIds = selectedDeviceIds.map((id) => parseInt(id, 10));
      const response = await api.exportSelectedDevicesToExcel(deviceIds);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showAlert("Đang được tải xuống", "success");
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        showAlert(error.response.data.message, "error");
      } else if (error.response && error.response.status === 500) {
        showAlert(error.response.data.message, "error");
      }
    }
  };
  const handleDownloadClick = () => {
    if (selectedDeviceIds.length === 0) {
      showAlert("Bạn chưa chọn thiết bị để download qr code", "error");
    } else {
      setModalType("QRCode");
      setFileName("qrcodes.zip");
      setShowModal(true);
    }
  };
  const handleExportClick = () => {
    if (selectedDeviceIds.length === 0) {
      showAlert("Bạn chưa chọn thiết bị để export excel", "error");
    } else {
      setModalType("Excel");
      setFileName("devices.xlsx");
      setShowModal(true);
    }
  };
  const handleModalConfirm = async () => {
    setShowModal(false);
    if (modalType === "QRCode") {
      await handleDownloadQRCode();
    } else if (modalType === "Excel") {
      await handleExportExcel();
    }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const fileExtension = e.target.files?.[0].name.split(".").pop();
    if (fileExtension !== "xlsx" && fileExtension !== "xls") {
      showAlert("File bạn chọn không đúng định dạng", "error");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    } else {
      if (selectedFile) setFile(selectedFile);
    }
  };
  const handleImport = async () => {
    try {
      if (file) {
        const fileExtension = file.name.split(".").pop();
        if (fileExtension !== "xlsx" && fileExtension !== "xls") {
          showAlert("File bạn chọn không đúng định dạng", "error");
          return;
        }
        setLoading(true);
        await api.importFromExcel(file);
        showAlert("Import thành công", "success");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        showAlert("Không có file nào được chọn", "error");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        showAlert(error.response.data.message, "error");
      } else if (error.response && error.response.status === 500) {
        showAlert(error.response.data.message, "error");
      } else if (error.response && error.response.status === 400) {
        showAlert(error.response.data.message, "error");
      }
    } finally {
      setLoading(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      const request = getRequest();
      fetchDeviceData(request);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-grow" style={{ width: "85%" }}>
        <main className="flex-grow ease-soft-in-out relative h-full max-h-screen rounded-xl transition-all duration-200 mt-4 p-4">
          {/* filter */}
          <div className="flex flex-grow">
            <div key={filterKey} className="flex flex-col space-y-3 w-full">
              <main className="sm:px-6 lg:px-8 flex items-center justify-start flex-wrap">
                {/* accounting code */}
                <TextInput
                  id="accountingCode"
                  placeholder="Accounting Code"
                  maxLength={20}
                  onChange={(e) => setAccountingCode(e)}
                  value={accountingCode}
                />
                {/* serial number */}
                <TextInput
                  id="serialNumber"
                  placeholder="Serial number"
                  value={serialNumber}
                  maxLength={50}
                  onChange={(e) => setSerialNumber(e)}
                />

                {/* manufacturer */}
                <TextInput
                  id="manufacturer"
                  placeholder="Manufacture"
                  maxLength={255}
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e)}
                />
              </main>
              <main className="px-4 sm:px-6 lg:px-8 flex items-center">
                {/* notes */}
                <TextInput
                  id="notes"
                  value={notes}
                  maxLength={255}
                  placeholder="Notes"
                  onChange={(e) => setNotes(e)}
                />
                {/* purpose */}
                <TextInput
                  id="purpose"
                  placeholder="Purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e)}
                />
              </main>
              <main className="px-4 sm:px-6 lg:px-8 flex justify-start">
                {/* category */}
                <SelectInput
                  id="category"
                  items={categoryList}
                  onChange={handleChangeCategory}
                />
                {/* location
                <SelectInput
                  id="location"
                  items={locationList}
                  onChange={handleChangeLocation}
                /> */}
              </main>
              <main className="px-4 sm:px-6 lg:px-8 flex justify-start">
                {/* purchase date */}
                <DatePickerInput
                  id="purchaseDate"
                  onChange={(e) => {
                    if (e.target.value === "") setPurchaseDate(null);
                    else setPurchaseDate(new Date(e.target.value));
                  }}
                  placeholder="Purchase Date"
                />
                {/* expiration date */}
                <DatePickerInput
                  id="expirationDate"
                  onChange={(e) => {
                    if (e.target.value === "") setExpirationDate(null);
                    else setExpirationDate(new Date(e.target.value));
                  }}
                  placeholder="Expiration Date"
                />
              </main>
            </div>
            <div className="flex items-center">
              <BaseButton
                buttonCss="px-3 py-3 m-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                onClick={handleClickSearch}
              >
                <MdSearch size={24} />
              </BaseButton>
              <BaseButton
                buttonCss="px-3 py-3 m-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white"
                onClick={handleClear}
              >
                <MdFilterAltOff size={24} />
              </BaseButton>
            </div>
          </div>

          {/* Buttons */}
          <div className="max-w-8xl px-4 sm:px-6 lg:px-8 mt-10 flex justify-between items-center space-y-4">
            <div className="space-y-4">
              <div className="flex space-x-4 pl-4 justify-center items-center">
                <div className="items-center justify-center">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="w-full text-black font-semibold text-sm bg-white border file:cursor-pointer cursor-pointer file:border-0 file:py-3 file:px-4 file:mr-4 file:bg-gray-200 file:hover:bg-gray-300 file:text-black rounded"
                  />
                </div>

                <BaseButton
                  buttonCss="flex bg-green-300 hover:bg-green-400 hover:text-gray-700 px-2.5 py-2.5 rounded-lg text-gray-600"
                  onClick={handleImport}
                >
                  {loading ? (
                    "Đang import..."
                  ) : (
                    <>
                      <MdUpload size={24} />
                      <img
                        src="./src/assets/img/excel.png"
                        alt="Icon excel"
                        className="w-6"
                      />
                    </>
                  )}
                </BaseButton>

                <BaseButton
                  buttonCss="flex bg-blue-300 hover:bg-blue-400 hover:text-gray-700 px-2.5 py-2.5 rounded-lg text-gray-600"
                  onClick={handleExportClick}
                >
                  <MdDownload size={24} />
                  <img
                    src="./src/assets/img/excel.png"
                    alt="Icon excel"
                    className="w-6"
                  />
                </BaseButton>

                <BaseButton
                  buttonCss="flex bg-purple-300 hover:bg-purple-400 hover:text-gray-700 px-2.5 py-2.5 rounded-lg text-gray-600"
                  onClick={handleDownloadClick}
                >
                  <MdDownload size={24} />
                  <MdQrCode2 size={24} />
                </BaseButton>
              </div>
            </div>

            <div className="items-center">
              {/* <BaseButton onClick={handleClickDelete}>Xóa</BaseButton> */}
              <div className="flex justify-center items-center">
                <BaseButton
                  buttonCss="bg-green-500 hover:bg-green-600 px-2.5 py-2.5 mr-5 rounded-lg text-white"
                  onClick={() => setIsOpen(true)}
                >
                  <MdAddCircle size={24} />
                </BaseButton>

                <CustomAlert
                  buttonText={<MdDelete size={24} />}
                  title="Xác nhận xóa thiết bị? "
                  icon="question"
                  showCancelButton={true}
                  confirmButtonText="Xác nhận"
                  cancelButtonText="Hủy"
                  customMessage="Xóa thành công!"
                  customMessageError="Xóa thất bại"
                  onConfirm={handleClickDelete}
                  bgButtonColor="bg-red-500 px-2.5 py-2.5"
                  bgButtonHover="hover:bg-red-600"
                  textButtonColor="text-white text-sm font-medium"
                  showSecondAlert={true}
                />
              </div>
            </div>
          </div>

          {/* data table /> */}
          <div className="w-full px-6 py-6 mx-auto">
            <div className="flex flex-wrap -mx-3">
              <div className="flex-none w-full max-w-full px-3">
                <div className="relative flex flex-col min-w-0 mb-6 break-words bg-white border-0 border-transparent border-solid shadow-soft-xl rounded-2xl bg-clip-border">
                  <div className="flex-auto px-0 pt-0 pb-2">
                    <div className="p-0 overflow-x-auto">
                      <DeviceTable
                        onUpdateDevice={handleDeviceUpdate}
                        key={tableKey}
                        devicePage={devicePage}
                        onSelectDeviceId={handleSelectDevice}
                        onPageChange={handlePageChange}
                      ></DeviceTable>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <CreateDevice
          isOpen={isOpen}
          handleClose={handleDeviceCreateClose}
        ></CreateDevice>
      </div>

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Đặt tên tệp
                  </h3>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Enter file name"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleModalConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Xác nhận
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ScrollToTopButton />
      {alert.message && <AlertInfo message={alert.message} type={alert.type} />}
    </div>
  );
};

export default SearchDevice;
