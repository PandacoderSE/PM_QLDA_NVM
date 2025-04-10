import { ChangeEvent } from "react";

interface Props {
  id: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  maxLength?: number;
  onChange?: (content: string) => void;
  className?: string; // Thêm props className
}

const TextInput = ({
  id,
  placeholder,
  required = false,
  onChange,
  value,
  maxLength,
  className, // Thêm props className
}: Props) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    value = e.target.value;
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleClick = () => {
    value = "";
    if (onChange) {
      onChange("");
    }
  };

  return (
    <>
      <div className={`flex items-center flex-1 ${className}`}>
        <div className="flex items-center ml-4 cursor-pointer w-full">
          <div className="w-full">
            <div className="relative">
              <input
                type="text"
                id={id}
                className="block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-400 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={handleChange}
                maxLength={maxLength}
              />
              {required && (
                <span className="absolute left-0 top-0 transform translate-y-0 text-red-500 pointer-events-none">
                  *
                </span>
              )}
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" // Điều chỉnh vị trí top-1/2
                onClick={handleClick}
              >
                X
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TextInput;
