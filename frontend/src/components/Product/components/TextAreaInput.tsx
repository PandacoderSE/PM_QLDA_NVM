import { ChangeEvent } from "react";

interface Props {
  children: React.ReactNode;
  id: string;
  rows: number;
  placeholder: string;
  onChange: (content: string) => void;
  required?: boolean;
  value?: string;
  maxLength?: number;
}

const TextAreaInput = ({
  id,
  rows,
  placeholder,
  children,
  onChange,
  required = false,
  value,
  maxLength,
}: Props) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };
  return (
    <div className="sm:col-span-2">
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {children}
      </label>
      <textarea
        value={value}
        id="description"
        rows={rows}
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={handleChange}
        required={required}
      ></textarea>
    </div>
  );
};

export default TextAreaInput;
