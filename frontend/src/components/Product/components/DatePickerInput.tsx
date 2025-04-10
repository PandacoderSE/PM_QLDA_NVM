import { ChangeEvent } from "react";

interface Props {
  id: string;
  placeholder?: string;
  value?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string; // Thêm props className
}

const DatePickerInput = ({
  id,
  placeholder,
  value,
  onChange,
  required = false,
  className, // Thêm props className
}: Props) => {
  return (
    <>
      <div className={`flex items-center flex-1 ${className}`}>
        <div className="flex items-center ml-4 cursor-pointer w-full">
          <div className="w-full">
            <div className="">
              <div>
                <div className="relative">
                  <input
                    id={id}
                    type="text"
                    className="block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-400 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder={placeholder}
                    onChange={onChange}
                    value={value}
                    required={required}
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => (e.target.type = "text")}
                  />
                  {required && (
                    <span className="absolute left-0 top-0 transform translate-y-0 text-red-500 pointer-events-none">
                      *
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DatePickerInput;
