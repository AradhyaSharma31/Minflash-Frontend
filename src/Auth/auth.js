// is Logged in

export const isLoggedIn = () => {
  let data = localStorage.getItem("data");
  if (data != null) return true;
  else return false;
};

// do Login => data => set to localStorage

export const doLogin = (data, next) => {
  localStorage.setItem("data", JSON.stringify(data));
  next();
};

// do Logout => remove from localStorage

export const doLogout = (next) => {
  localStorage.removeItem("data");
  next();
};

// get Current User

export const getCurrentUserDetail = () => {
  if (isLoggedIn()) {
    return JSON.parse(localStorage.getItem("data"))?.userDTO;
  } else return undefined;
};

// get Current User Token

export const getCurrentUserToken = () => {
  if (isLoggedIn()) {
    return JSON.parse(localStorage.getItem("data"))?.token;
  } else return undefined;
};
