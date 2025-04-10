import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { MouseEvent, useState } from "react";

interface Props {
  children: string;
  options: string[];
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}
export const MenuSort = ({ children, options, onClick }: Props) => {
  const [selectedItem, setSelectedItem] = useState<string>("");

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setSelectedItem(event.currentTarget.innerText);
    if (onClick) {
      onClick(event);
    }
  };
  return (
    <>
      <div className="flex items-center ">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
              {children}
              <ChevronDownIcon
                aria-hidden="true"
                className=" ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
              />
            </MenuButton>
          </div>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="py-1">
              {options.map((option) => (
                <MenuItem key={option}>
                  <button
                    className={
                      "group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10" +
                      (selectedItem === option
                        ? "font-medium text-gray-900"
                        : "text-gray-500")
                    }
                    onClick={handleClick}
                  >
                    {option}
                  </button>
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Menu>
      </div>
    </>
  );
};
