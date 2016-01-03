import 'lib/amplitude';

const AMPLITUDE_API_KEY = '43c9261027eec7e7a89ceca5f5d4563d';
const DO_NOT_TRACK = __DEV__ || window.location.search.includes('dnt') ||
  window.localStorage.dnt === 'true';

if (DO_NOT_TRACK) {
  window.localStorage.dnt = 'true';
} else {
  window.amplitude.init(AMPLITUDE_API_KEY, null, {
    includeReferrer: true
  });
}

export const track = (eventName, properties = {}) => {
  if (DO_NOT_TRACK) {
    console.log(`Tracking ${eventName}:`, properties);
    return;
  }
  window.amplitude.logEvent(eventName, Object.assign({}, properties, {
    screen_height: window.screen.height,
    screen_width: window.screen.width
  }));
};
