export const LOCALSTORAGE = {
  DNT: "triviality_dnt",
  STATE: "triviality_state",
};

export const getItem = (key: string) =>
  key in window.localStorage ? JSON.parse(window.localStorage[key]) : undefined;

export const setItem = (key: string, value: any) => {
  window.localStorage[key] = JSON.stringify(value);
};
