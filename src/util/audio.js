export const SOUNDS = {
  BUTTON: '/trivia/sounds/button.wav',
  ERASE: '/trivia/sounds/erase.wav',
  ERROR: '/trivia/sounds/error.wav',
  HINT: '/trivia/sounds/hint.wav',
  LETTER: '/trivia/sounds/letter.wav',
  WIN: '/trivia/sounds/win.wav'
};

// Prefetch all sounds
Object.keys(SOUNDS).forEach(sound => (new Audio(SOUNDS[sound])));

const SOUNDS_ENABLED = true;
export const playSound = file => {
  SOUNDS_ENABLED && (new Audio(file)).play();
};
