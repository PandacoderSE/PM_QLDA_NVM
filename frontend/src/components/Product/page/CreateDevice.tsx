import { ChangeEvent, useEffect, useState } from "react";
import TextInput from "../components/TextInput";

import DatePickerInput from "../components/DatePickerInput";
import { Category } from "../../../model/Category";
import getAllCategory from "../../Services/CategoryService";
import { SelectInput } from "../components/SelectInput";
import TextAreaInput from "../components/TextAreaInput";
import { Modal } from "@mui/material";
import deviceService, { DeviceRequest } from "../../Services/deviceService";
import CustomAlert from "../../Alert/CustomAlert.tsx";
import AlertInfo from "../../Alert/AlertInfo.jsx";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

const CreateDevice = ({ isOpen, handleClose }: Props) => {
  const [accountingCode, setAccountingCode] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [manufacturer, setManufacturer] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined );
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [specification, setSpecification] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Alert
  const [alert, setAlert] = useState({ message: "", type: "" });
  const showAlert = (message: any, type: any) => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 5000);
  };

  useEffect(() => {
     fetchCategoryList();
  }, []);

  const getRequest = (): DeviceRequest => {
    const request: DeviceRequest = {
      accountingCode: accountingCode,
      serialNumber: serialNumber,
      manufacture: manufacturer,
      notes: notes,
      purchaseDate: purchaseDate?.toISOString(),
      purpose: purpose,
      categoryId: categoryId,
      expirationDate: expirationDate?.toISOString(),
      specification: specification,
    };
    return request;
  };

  const resetParams = (): void => {
    setAccountingCode("");
    setSerialNumber("");
    setPurchaseDate(null);
    setExpirationDate(null);
    setManufacturer("");
    setPurpose("");
    setCategoryId(0);
    setSpecification("");
    setNotes("");
  };

  const createDevice = async () => {
    try {
      await deviceService.createDevice(getRequest());
    } catch (error: any) {
      throw error;
    }
  };

  const validateRequest = () => {
    if (accountingCode.length == 0) throw Error("Accounting Code là bắt buộc");
    if (serialNumber.length == 0) throw Error("Serial Number là bắt buộc");
    if (purchaseDate === null) throw Error("Purchase Date là bắt buộc");
    if (expirationDate === null) throw Error("Expiration Date là bắt buộc");
    if (manufacturer.length === 0) throw Error("Manufacturer là bắt buộc");
    if (purpose.length === 0) throw Error("Purpose là bắt buộc");
    if (specification.length === 0) throw Error("Specification là bắt buộc");
  };

  const handleSubmit = async () => {
    try {
      validateRequest();
      await createDevice();
      resetParams();
      handleClose();
    } catch (error: any) {
      throw error;
    }
  };

  const fetchCategoryList = () => {
    getAllCategory()
      .then((categories) => {
        setCategoryList(categories);
        setCategoryId(categories[0].id);
      })
      .catch((error) => console.log("Error fetching category: ", error));
  };

  const handlePurchaseDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const purchaseDate = new Date(event.target.value);
    if (expirationDate != null && purchaseDate > expirationDate) {
      showAlert("Ngày mua phải nhỏ hơn ngày hết hạn", "warning");
    }
    if (event.target.value === "") setPurchaseDate(null);
    else setPurchaseDate(new Date(event.target.value));
  };

  const handleExpirationDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const expirationDate = new Date(event.target.value);
    if (purchaseDate != null && expirationDate < purchaseDate) {
      showAlert("Ngày hết hạn phải lớn hơn ngày mua", "warning");
    }
    if (event.target.value === "") setExpirationDate(null);
    else setExpirationDate(new Date(event.target.value));
  };

  const handleChangeCategory = (event: ChangeEvent<HTMLSelectElement>) => {
    const category = categoryList.find((c) => c.name === event.target.value);
    if (category) {
      setCategoryId(category.id != undefined ? category.id : 0);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 text-black"
    >
      <div className="flex">
        <div className="flex flex-col flex-grow">
          <main className="flex-grow ease-soft-in-out relative h-full max-h-screen rounded-xl transition-all duration-200 mt-4 p-4">
            <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
              <div className="pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                <h3 className="text-lg text-center font-semibold text-gray-900 dark:text-white uppercase">
                  Thêm mới sản phẩm
                </h3>
              </div>
              <form
                action="#"
                className="grid gap-4 sm:col-span-2 md:gap-6 sm:grid-cols-4"
              >
                <TextInput
                  id="accounting-code"
                  placeholder="Accounting Code"
                  required={true}
                  maxLength={20}
                  value={accountingCode}
                  onChange={(content: string) => {
                    setAccountingCode(content);
                  }}
                ></TextInput>

                <TextInput
                  id="serial-number"
                  placeholder="Serial Number"
                  required={true}
                  value={serialNumber}
                  maxLength={50}
                  onChange={(content: string) => {
                    setSerialNumber(content);
                  }}
                ></TextInput>

                <DatePickerInput
                  id="purchase-date"
                  onChange={handlePurchaseDateChange}
                  placeholder="Purchase date"
                  required={true}
                ></DatePickerInput>
                <DatePickerInput
                  id="expiration-date"
                  onChange={handleExpirationDateChange}
                  placeholder="Expiration date"
                  required={true}
                ></DatePickerInput>

                <TextInput
                  id="manufacturer"
                  placeholder="Manufacturer"
                  required={true}
                  maxLength={255}
                  value={manufacturer}
                  onChange={(content: string) => {
                    setManufacturer(content);
                  }}
                ></TextInput>

                <TextInput
                  id="purpose"
                  placeholder="Purpose"
                  required={true}
                  value={purpose}
                  maxLength={255}
                  onChange={(content: string) => {
                    setPurpose(content);
                  }}
                ></TextInput>

                <SelectInput
                  id="category"
                  items={categoryList}
                  onChange={handleChangeCategory}
                ></SelectInput>

                <TextAreaInput
                  id="spec"
                  placeholder="specification"
                  rows={8}
                  maxLength={255}
                  onChange={(content: string) => {
                    setSpecification(content);
                  }}
                  required={true}
                >
                  <span className="text-red-500">* </span>Specification 
                </TextAreaInput>

                <TextAreaInput
                  id="notes"
                  placeholder="take some notes here"
                  rows={8}
                  maxLength={255}
                  onChange={(content: string) => setNotes(content)}
                >
                  Notes
                </TextAreaInput>

                <div className="z-10 items-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
                  <CustomAlert
                    buttonText="Thêm"
                    title="Xác nhận thêm mới sản phẩm? "
                    icon="question"
                    showCancelButton={true}
                    confirmButtonText="Xác nhận"
                    cancelButtonText="Hủy"
                    customMessage="Thêm thành công!"
                    customMessageError="Thêm thất bại"
                    onConfirm={handleSubmit}
                    bgButtonColor="bg-green-500 px-2.5 py-2.5"
                    bgButtonHover="hover:bg-green-800"
                    textButtonColor="text-white"
                    textColor="#000000"
                    bgColor="#FFFFFF z-[9999]"
                    showSecondAlert={true}
                  />
                </div>
              </form>
            </div>
          </main>
        </div>
        {alert.message && (
          <AlertInfo message={alert.message} type={alert.type} />
        )}
      </div>
    </Modal>
  );
};

export default CreateDevice;
