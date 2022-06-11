export const exit = () => {
  if (window.tvMode) {
    window.open("", "_self").close();
  } else {
    window.location.href = "https://chaidarun.com/";
  }
};
