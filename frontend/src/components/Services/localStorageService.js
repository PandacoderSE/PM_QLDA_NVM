export const KEY_TOKEN = "accessToken";

export const setToken = (token) => {
  localStorage.setItem(KEY_TOKEN, token);
};

export const getToken = () => {
  return localStorage.getItem(KEY_TOKEN);
};
export const getTokenAccess = () => {
  return localStorage.getItem(KEY_TOKEN);
};

export const removeToken = () => {
  return localStorage.removeItem(KEY_TOKEN);
};
export const removeTokenExpi = () => {
  return localStorage.removeItem("tokenExpiry");
};
export const getSelected = () => {
  return localStorage.getItem("selected");
};
export const setSelected = (selected) => {
  return localStorage.getItem("selected", JSON.stringify(selected));
};
export const removeSelected = () => {
  return localStorage.removeItem("selected");
};
export const getNavSelected = () => {
  return localStorage.getItem("navSelected");
};
export const setNavSelected = () => {
  return localStorage.getItem("navSelected", JSON.stringify(setNavSelected));
};
export const removeNavSelected = () => {
  return localStorage.removeItem("navSelected");
};
