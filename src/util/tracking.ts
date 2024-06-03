import "../lib/amplitude";
import { LOCALSTORAGE, getItem, setItem } from "./storage";

const AMPLITUDE_API_KEY = "43c9261027eec7e7a89ceca5f5d4563d";
const DO_NOT_TRACK =
  process.env.NODE_ENV !== "production" ||
  window.location.search.includes("dnt") ||
  getItem(LOCALSTORAGE.DNT);

if (DO_NOT_TRACK) {
  setItem(LOCALSTORAGE.DNT, true);
} else {
  window.amplitude.init(AMPLITUDE_API_KEY, null, { includeReferrer: true });
}

export const track = (eventName: string, properties = {}) => {
  if (DO_NOT_TRACK) {
    console.log(`Tracking ${eventName}:`, properties);
    return;
  }
  window.amplitude.logEvent(
    eventName,
    Object.assign({}, properties, {
      screen_height: window.screen.height,
      screen_width: window.screen.width,
    }),
  );
};
