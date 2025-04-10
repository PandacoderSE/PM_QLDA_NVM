import {
  removeNavSelected,
  removeSelected,
  removeToken,
} from "./localStorageService";

export const logOut = () => {
  removeToken();
  removeNavSelected();
  removeSelected();
};
