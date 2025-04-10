import { ChangeEvent, useState } from "react";
import { MdArrowDropDown } from "react-icons/md";

interface Props {
  id: string;
  value?: string;
  items: any[];
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  className?: string; // Thêm props className
}

export const SelectInput = ({ id, items, onChange, value, className }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleChangeOption = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedIndex(event.target.selectedIndex);
    if (onChange) {
      onChange(event);
    }
  };
  return (
    <>
      <div className={`flex items-center flex-1 ${className}`}>
        <div className="flex items-center ml-4 cursor-pointer w-full"> {/* Điều chỉnh lớp w-full thành w-1/3 */}
          <div className="w-full relative">
            <select
              id={id}
              className="block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-400 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              onChange={handleChangeOption}
              value={value}
            >
              {items.map((item, index) =>
                selectedIndex === index ? (
                  <option
                    value={item.name}
                    key={index}
                    className="ml-1 text-black-500 font-medium text-sm text-gray-700 hover:text-gray-900"
                  >
                    {item.name}
                  </option>
                ) : (
                  <option value={item.name} key={index}>
                    {item.name}
                  </option>
                )
              )}
            </select>
            <MdArrowDropDown
              className="absolute top-1/2 transform -translate-y-1/2 right-1 flex items-center pointer-events-none" // Điều chỉnh vị trí top-1/2
              size={24}
            />
          </div>
          
        </div>
      </div>
    </>
  );
};
