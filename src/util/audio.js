export const SOUNDS = {
  BUTTON: "trivia/sounds/button.wav",
  ERASE: "trivia/sounds/erase.wav",
  ERROR: "trivia/sounds/error.wav",
  HINT: "trivia/sounds/hint.wav",
  LETTER: "trivia/sounds/letter.wav",
  WIN: "trivia/sounds/win.wav",
};

// Prefetch all sounds
for (const sound in SOUNDS) {
  SOUNDS[sound] = new Audio(SOUNDS[sound]);
}

const SOUNDS_ENABLED = true;
export const playSound = audio => {
  if (SOUNDS_ENABLED) {
    audio.currentTime = 0;
    audio.play();
  }
};
