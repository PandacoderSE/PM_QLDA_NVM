import { setNavSelected, setSelected } from "./localStorageService";

export const handleSelect = (page) => {
  setSelected(page);
  setNavSelected(page);
  localStorage.setItem("selected", JSON.stringify(page));
  localStorage.setItem("navSelected", JSON.stringify(page));
};
