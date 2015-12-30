import http from './http';

const BAD_STRINGS = [
  '(i\m ',
  '(jimmy ',
  '(kelly ',
  '(sarah ',
  'clue crew',
  'heard here',
  'seen here'
];
const isChallengeValid = (bankSize, seenChallenges, challenge) => {
  const lowercasedClueText = challenge.question.toLowerCase();
  let valid;
  try {
    valid = challenge.value &&
      challenge.value >= 600 &&
      challenge.value <= 1200 &&
      challenge.value !== 1000 &&
      challenge.answer.length &&
      challenge.question.length &&
      challenge.invalid_count === null &&
      lowercasedClueText.length <= 140 &&
      challenge.answer.match(/\w/g).length <= bankSize &&
      !BAD_STRINGS.some((s) => lowercasedClueText.includes(s)) &&
      !seenChallenges.includes(challenge.id);
  } catch (e) {
    valid = false;
  }
  return valid;
};

const stripHtmlTags = (html) => {
  const node = document.createElement('div');
  node.innerHTML = html;
  return node.textContent || node.innerText || '';
};

const DOUBLED_PRICES_AIRDATE = '2001-11-26T12:00:00.000Z';
const preprocessChallenge = (challenge) => {
  if (challenge.airdate < DOUBLED_PRICES_AIRDATE) {
    challenge.value *= 2;
  }
  const processedChallenge = Object.assign({}, challenge, {
    answer: stripHtmlTags(challenge.answer)
      .replace(/\\/g, '')
      .replace(/^an? /, '')
      .replace(/\(.+\) ?/g, '')
      .trim(),
    question: stripHtmlTags(challenge.question)
      .replace(/\\/g, '')
      .replace(/, ?([^\d])/g, ', $1')
      .replace(/: ?/g, ': ')
      .replace(/ ?& ?/g, ' and ')
      .trim()
  });
  return processedChallenge;
};

const LETTERS = `${'AEHINORST'.repeat(3)}${'BCDFGKLMPUVWY'.repeat(2)}JXQZ`;
const DIGITS = '0123456789';
const getRandomChar = (pool) => {
  return pool[Math.floor(Math.random() * pool.length)];
};

// Fisher-Yates
const shuffleString = (string) => {
  const a = string.split('');
  const n = a.length;
  let j;
  for (let i = n - 1; i; --i) {
    j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join('');
};

const generateTileString = (bankSize, solution) => {
  const solutionChars = solution.match(/\w/g);
  let tileString = solutionChars.join('');
  const digitRatio = (tileString.match(/\d/g) || []).length / tileString.length;
  for (let i = 0; i < bankSize - solutionChars.length; ++i) {
    tileString += getRandomChar(Math.random() < digitRatio ? DIGITS : LETTERS);
  }
  return shuffleString(tileString);
};

const postprocessChallenge = (bankSize, challenge) => {
  const uppercasedSolution = challenge.answer.toUpperCase();
  return {
    category: challenge.category.title,
    difficulty: challenge.value,
    id: challenge.id,
    prompt: challenge.question,
    solution: uppercasedSolution,
    tileString: generateTileString(bankSize, uppercasedSolution)
  };
};

export const getChallenge = (bankSize, seenChallenges, callback) => {
  console.log('Calling jService API...');
  const retry = () => window.setTimeout(() => (
    getChallenge(bankSize, seenChallenges, callback)
  ), 125);
  http.getJSON('http://jservice.io/api/random', (data) => {
    if (data === null) {
      console.log('Call to jService API failed. Retry scheduled.');
      retry();
      return;
    }
    const challenge = preprocessChallenge(data[0]);
    if (!isChallengeValid(bankSize, seenChallenges, challenge)) {
      console.log(
        'Call to jService API returned bad data. Retry scheduled.',
        challenge
      );
      retry();
      return;
    }
    console.log('Call to jService API succeeded.');
    callback(postprocessChallenge(bankSize, challenge));
  });
};
