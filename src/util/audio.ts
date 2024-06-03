export const SOUNDS = {
  BUTTON: new Audio(require("url:../sounds/button.wav")),
  ERASE: new Audio(require("url:../sounds/erase.wav")),
  ERROR: new Audio(require("url:../sounds/error.wav")),
  HINT: new Audio(require("url:../sounds/hint.wav")),
  LETTER: new Audio(require("url:../sounds/letter.wav")),
  WIN: new Audio(require("url:../sounds/win.wav")),
};

const SOUNDS_ENABLED = true;
export const playSound = (audio: HTMLAudioElement) => {
  if (SOUNDS_ENABLED) {
    audio.currentTime = 0;
    audio.play();
  }
};
