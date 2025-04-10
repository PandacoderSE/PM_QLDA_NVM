import { Modal } from "@mui/material";
import TextInput from "../components/TextInput";
import DatePickerInput from "../components/DatePickerInput";
import { SelectInput } from "../components/SelectInput";
import TextAreaInput from "../components/TextAreaInput";
import CustomAlert from "../../Alert/CustomAlert.tsx";
import { Device } from "../../../model/Device.ts";
import { ChangeEvent, useEffect, useState } from "react";
import getAllCategory from "../../Services/CategoryService.ts";
import { Category } from "../../../model/Category.ts";
import deviceService, { DeviceRequest } from "../../Services/deviceService.ts";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  device: Device;
}

const EditDevice = ({ isOpen, handleClose, device }: Props) => {
  const [editedDevice, setEditedDevice] = useState<Device>(device);
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategoryList();
  }, []);

  const getRequest = (): DeviceRequest => {
    const request: DeviceRequest = {
      accountingCode: editedDevice.accountingCode,
      serialNumber: editedDevice.serialNumber,
      manufacture: editedDevice.manufacture,
      notes: editedDevice.notes,
      purchaseDate: new Date(editedDevice.purchaseDate).toISOString(),
      purpose: editedDevice.purpose,
      categoryId:
        editedDevice.category.id !== undefined ? editedDevice.category.id : 0,
      expirationDate: new Date(editedDevice.expirationDate).toISOString(),
      specification: editedDevice.specification,
    };
    return request;
  };

  const validateRequest = () => {
    if (editedDevice.accountingCode.length == 0)
      throw Error("Accounting Code là bắt buộc");
    if (editedDevice.serialNumber.length == 0)
      throw Error("Serial Number là bắt buộc");
    if (editedDevice.purchaseDate === null)
      throw Error("Purchase Date là bắt buộc");
    if (editedDevice.expirationDate === null)
      throw Error("Expiration Date là bắt buộc");
    if (editedDevice.manufacture.length === 0)
      throw Error("Manufacturer là bắt buộc");
    if (editedDevice.purpose.length === 0) throw Error("Purpose là bắt buộc");
    if (editedDevice.specification.length === 0)
      throw Error("Specification là bắt buộc");
  };

  const updateDevice = async () => {
    try {
      console.log("request: ", getRequest());
      await deviceService.updateDevice(editedDevice.id, getRequest());
    } catch (error: any) {
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      validateRequest();
      await updateDevice();
      handleClose();
    } catch (error: any) {
      throw error;
    }
  };

  const fetchCategoryList = () => {
    getAllCategory()
      .then((categories) => {
        setCategoryList(categories);
      })
      .catch((error) => console.log("Error fetching category: ", error));
  };

  const handlePurchaseDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "")
      setEditedDevice({ ...editedDevice, purchaseDate: new Date() });
    else
      setEditedDevice({
        ...editedDevice,
        purchaseDate: new Date(event.target.value),
      });
  };

  const handleExpirationDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "")
      setEditedDevice({ ...editedDevice, expirationDate: new Date() });
    else
      setEditedDevice({
        ...editedDevice,
        expirationDate: new Date(event.target.value),
      });
  };

  const handleChangeCategory = (event: ChangeEvent<HTMLSelectElement>) => {
    const category = categoryList.find((c) => c.name === event.target.value);
    if (category) {
      setEditedDevice({ ...editedDevice, category });
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
                  value={editedDevice.accountingCode}
                  maxLength={20}
                  onChange={(content: string) => {
                    setEditedDevice({
                      ...editedDevice,
                      accountingCode: content,
                    });
                  }}
                ></TextInput>

                <TextInput
                  id="serial-number"
                  placeholder="Serial Number"
                  required={true}
                  maxLength={50}
                  value={editedDevice.serialNumber}
                  onChange={(content: string) => {
                    console.log("content: ", content);
                    setEditedDevice({ ...editedDevice, serialNumber: content });
                  }}
                ></TextInput>

                <DatePickerInput
                  id="purchase-date"
                  value={
                    new Date(editedDevice.purchaseDate)
                      .toISOString()
                      .split("T")[0]
                  }
                  placeholder="Purchase date"
                  required={true}
                  onChange={handlePurchaseDateChange}
                ></DatePickerInput>
                <DatePickerInput
                  id="expiration-date"
                  value={
                    new Date(editedDevice.expirationDate)
                      .toISOString()
                      .split("T")[0]
                  }
                  required={true}
                  placeholder="Expiration date"
                  onChange={handleExpirationDateChange}
                ></DatePickerInput>

                <TextInput
                  id="manufacturer"
                  placeholder="Manufacturer"
                  required={true}
                  maxLength={255}
                  value={editedDevice.manufacture}
                  onChange={(content: string) => {
                    setEditedDevice({ ...editedDevice, manufacture: content });
                  }}
                ></TextInput>

                <TextInput
                  id="purpose"
                  placeholder="Purpose"
                  required={true}
                  maxLength={255}
                  value={editedDevice.purpose}
                  onChange={(content: string) => {
                    setEditedDevice({ ...editedDevice, purpose: content });
                  }}
                ></TextInput>
                {editedDevice.category ? (
                  <SelectInput
                    id="category"
                    items={categoryList}
                    value={
                      categoryList.find(
                        (c) => c.id === editedDevice.category.id
                      )?.name
                    }
                    onChange={handleChangeCategory}
                  ></SelectInput>
                ) : (
                  <SelectInput
                    id="category"
                    items={categoryList}
                    onChange={handleChangeCategory}
                  ></SelectInput>
                )}

                <TextAreaInput
                  id="spec"
                  placeholder="specification"
                  rows={8}
                  value={editedDevice.specification}
                  onChange={(content: string) => {
                    setEditedDevice({
                      ...editedDevice,
                      specification: content,
                    });
                  }}
                  maxLength={255}
                  required={true}
                >
                  <span className="text-red-500">* </span>Specification
                </TextAreaInput>

                <TextAreaInput
                  id="notes"
                  placeholder="take some notes here"
                  rows={8}
                  value={editedDevice.notes}
                  maxLength={255}
                  onChange={(content: string) =>
                    setEditedDevice({ ...editedDevice, notes: content })
                  }
                >
                  Notes
                </TextAreaInput>

                <div className="z-10 items-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
                  <CustomAlert
                    buttonText="Sửa"
                    title="Xác nhận chỉnh sửa sản phẩm? "
                    icon="question"
                    showCancelButton={true}
                    confirmButtonText="Xác nhận"
                    cancelButtonText="Hủy"
                    customMessage="Sửa thành công!"
                    customMessageError="Sửa thất bại"
                    onConfirm={handleSubmit}
                    bgButtonColor="bg-yellow-400 px-2.5 py-2.5"
                    bgButtonHover="hover:bg-yellow-500"
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
      </div>
    </Modal>
  );
};

export default EditDevice;
