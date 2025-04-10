import { ChangeEvent, MouseEvent, useRef, useState } from "react";
import { Device } from "../../../model/Device";
import { Page } from "../../../model/Page";
import CheckBox from "./CheckBox";
import Pagination from "./Pagination";
import BaseButton from "./BaseButton";
import EditDevice from "../page/EditDevice";
import deviceService from "../../Services/deviceService";
import { MdEdit } from "react-icons/md";
import { Modal } from "@mui/material";

interface Props {
  devicePage: Page<Device>;
  onSelectDeviceId: (deviceId: string[]) => void;
  onPageChange: (selectedItem: { selected: number }) => void;
  onUpdateDevice: () => void;
}
const DeviceTable = ({
  devicePage,
  onSelectDeviceId,
  onPageChange,
  onUpdateDevice,
}: Props) => {
  const [isCheckAll, setIsCheckAll] = useState<boolean>(false);
  const [checkBoxKey, setCheckBoxKey] = useState(Date.now());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [device, setDevice] = useState<Device>(devicePage.contents[0]);
  const [key, setKey] = useState(Date.now());
  const checkedList = useRef<string[]>([]);

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    setIsCheckAll(() => event.target.checked);
    setCheckBoxKey(Date.now());
    if (!isCheckAll) {
      if (devicePage) {
        checkedList.current = devicePage?.contents.map((device) => device.id);
      }
    } else checkedList.current = [];

    onSelectDeviceId(checkedList.current);
  };

  const handleClick = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = event.target;
    if (checked) {
      checkedList.current = [...checkedList.current, id];
      onSelectDeviceId(checkedList.current);
    } else {
      checkedList.current = checkedList.current.filter((item) => item != id);
      onSelectDeviceId(checkedList.current);
    }
  };

  const getDevice = async (id: string) => {
    try {
      const selectedDevice = await deviceService.getDeviceById(id);
      setDevice(selectedDevice);
    } catch (error: any) {
      throw Error(error.message);
    }
  };

  const handleButtonClick = async (event: MouseEvent<HTMLButtonElement>) => {
    await getDevice(event.currentTarget.id);
    setKey(Date.now());
    setIsOpen(true);
  };
  const [modalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const handleImageClick = (device: Device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };
  const Base64ToImage: React.FC<{
    base64String: string;
    onClick: () => void;
  }> = ({ base64String, onClick }) => {
    return (
      <img
        src={`data:image/png;base64,${base64String}`}
        alt="QR Code"
        className="cursor-pointer"
        onClick={onClick}
      />
    );
  };
  const headings = [
    "No",
    "Accounting Code",
    "Serial Number",
    "Category",
    "SPEC",
    // "User",
    // "Department",
    "Manufacture",
    // "Location",
    "Purchase Date",
    "Purpose",
    "Expiration Date",
    "Notes",
    "QR",
    "Action",
  ];

  return (
    <>
      <div className="overflow-x-auto rounded-lg shadow-2xl">
        <table className="items-center w-full mb-0 align-top border-collapse text-slate-500">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
            <th className="bg-blue-50 px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border-r border-gray-300">
                <CheckBox
                  id="all"
                  value={false}
                  onChange={handleSelectAll}
                ></CheckBox>
              </th>
              {headings.map((heading, index) => (
                <th
                  className="bg-blue-50 font-bold px-6 py-3 text-left text-black tracking-wider border-r border-gray-300"
                  key={index}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devicePage?.contents.map((device, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-4 w-4 border-r border-gray-300">
                  <CheckBox
                    id={device.id}
                    value={isCheckAll}
                    key={checkBoxKey}
                    onChange={handleClick}
                  ></CheckBox>
                </td>
                <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">{index + 1}</h6>
                </td>
                <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {device.accountingCode}
                  </h6>
                </td>
                <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {device.serialNumber}
                  </h6>
                </td>
                <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {device.category?.name}
                  </h6>
                </td>
                <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {device.specification}
                  </h6>
                </td>
                {/* <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {device.user?.name}
                  </h6>
                </td>
                <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {device.user?.department}
                  </h6>
                </td> */}
                <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {device.manufacture}
                  </h6>
                </td>
                {/* <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {device.location}
                  </h6>
                </td> */}
                <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {new Date(device.purchaseDate).toLocaleDateString("vi-VN", {
                      timeZone: "Asia/Ho_Chi_Minh",
                    })}
                  </h6>
                </td>
                <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {device.purpose}
                  </h6>
                </td>
                <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {new Date(device.expirationDate).toLocaleDateString(
                      "vi-VN",
                      {
                        timeZone: "Asia/Ho_Chi_Minh",
                      }
                    )}
                  </h6>
                </td>
                <td className="text-black p-2 align-middle whitespace-nowrap text-sm border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    {device.notes}
                  </h6>
                </td>
                <td className="p-2 align-middle whitespace-nowrap text-sm font-semibold border-r border-gray-300">
                  <h6 className="mb-0 text-sm leading-normal">
                    <Base64ToImage
                      base64String={device.identifyCode}
                      onClick={() => handleImageClick(device)}
                    />
                  </h6>
                </td>
                <td className="p-6 align-middle whitespace-nowrap text-sm font-semibold border-r border-gray-300">
                  <BaseButton
                    buttonCss="bg-yellow-400 text-white hover:bg-yellow-600 px-2.5 py-2.5 rounded-lg"
                    id={device.id}
                    onClick={handleButtonClick}
                  >
                    <MdEdit size={24} />
                  </BaseButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {devicePage != undefined &&
                  devicePage.contents.length > 0 &&
                  devicePage.offset + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {devicePage != undefined &&
                  devicePage.numberOfElement + devicePage.offset}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {devicePage != undefined && devicePage.totalElement}
              </span>{" "}
              results
            </p>
          </div>
          <div>
            <Pagination
              pageCount={devicePage.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </div>
      {device != null && (
        <EditDevice
          key={key}
          device={device}
          isOpen={isOpen}
          handleClose={() => {
            onUpdateDevice();
            setIsOpen(false);
          }}
        ></EditDevice>
      )}
      {modalOpen && selectedDevice && (
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
        >
          <img
            src={`data:image/png;base64,${selectedDevice.identifyCode}`}
            alt="QR Code"
          />
        </Modal>
      )}
    </>
  );
};

export default DeviceTable;
