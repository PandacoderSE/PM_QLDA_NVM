import { ChangeEvent, useState } from "react";

interface Props {
  id: string;
  value: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const CheckBox = ({ id, onChange, value }: Props) => {
  const [isCheck, setCheck] = useState(value);

  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    setCheck(event.target.checked);
    if (onChange) {
      onChange(event);
    }
  };
  return (
    <>
      <div className="flex items-center">
        <input
          id={id}
          type="checkbox"
          onChange={handleCheck}
          className="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          checked={isCheck}
        />
        <label htmlFor={id} className="sr-only">
          checkbox
        </label>
      </div>
    </>
  );
};

export default CheckBox;
