import http from 'util/http';

const BAD_STRINGS = [
  '(cheryl ',
  '(i\m ',
  '(jimmy ',
  '(jon ',
  '(kelly ',
  '(sarah ',
  '(sofia ',
  'audio clue',
  'clue crew',
  'following clip',
  'heard here',
  'seen here',
  'video clue'
];
const isQuestionValid = (bankSize, seenQuestions, question) => {
  const lowercasedClueText = question.question.toLowerCase();
  let valid;
  try {
    valid = question.value &&
      question.value >= 400 &&
      question.value <= 1600 &&
      question.value !== 1000 &&
      question.answer.length &&
      question.question.length &&
      question.invalid_count === null &&
      lowercasedClueText.length <= 140 &&
      question.answer.match(/\w/g).length <= bankSize &&
      !BAD_STRINGS.some(s => lowercasedClueText.includes(s)) &&
      !seenQuestions.includes(question.id);
  } catch (e) {
    valid = false;
  }
  return valid;
};

const normalizeString = html => {
  const node = document.createElement('div');
  node.innerHTML = html;
  const text = node.textContent || node.innerText || '';
  return fixPunctuation(text);
};

export const fixPunctuation = (text) => (
  text && text
    .replace(/\\/g, '')
    .replace(/'/g, '\u2019')
    .replace(/"(.+?)"/g, '\u201c$1\u201d')
    .replace(/ *\/ */g, ' / ')
    .replace(/ *\( */g, ' (')
    .replace(/ *\) */g, ') ')
    .replace(/ +([,:])/g, '$1')
    .replace(/([,:])([^\d])/g, '$1 $2')
    .replace(/ *; */g, '; ')
    .replace(/ *-- */g, '\u2014')
    .replace(/ *& */g, ' and ')
    .replace(/\s+/g, ' ')
    .trim()
);

const DOUBLED_PRICES_AIRDATE = '2001-11-26T12:00:00.000Z';
const preprocessQuestion = question => {
  if (question.airdate < DOUBLED_PRICES_AIRDATE) {
    question.value *= 2;
  }
  const processedQuestion = Object.assign({}, question, {
    answer: normalizeString(question.answer)
      .split('/')[0]
      .replace(/\(.+\)/g, '')
      .replace(/^an? /, '')
      .replace(/\s+/g, ' ')
      .trim(),
    question: normalizeString(question.question)
      .replace(/\s+/g, ' ')
      .trim()
  });
  const category = processedQuestion.category;
  if (category) {
    category.title = normalizeString(category.title);
  }
  return processedQuestion;
};

const LETTERS = `${'AEHINORST'.repeat(3)}${'BCDFGKLMPUVWY'.repeat(2)}JXQZ`;
const DIGITS = '0123456789';
const getRandomChar = pool => {
  return pool[Math.floor(Math.random() * pool.length)];
};

// Fisher-Yates
const shuffleString = string => {
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

const postprocessQuestion = (bankSize, question) => {
  const uppercasedSolution = question.answer.toUpperCase();
  return {
    category: question.category.title,
    difficulty: question.value,
    id: question.id,
    prompt: question.question,
    solution: uppercasedSolution,
    tileString: generateTileString(bankSize, uppercasedSolution)
  };
};

const getRawQuestion = (bankSize, seenQuestions, callback) => {
  const retry = () => window.setTimeout(() => (
    getRawQuestion(bankSize, seenQuestions, callback)
  ), 125);
  http.getJSON('https://jservice.io/api/random', data => {
    if (data === null) {
      console.log('Call to jService API failed. Retry scheduled.');
      retry();
      return;
    }
    const question = preprocessQuestion(data[0]);
    if (!isQuestionValid(bankSize, seenQuestions, question)) {
      console.log(
        'Call to jService API returned invalid data. Retry scheduled.',
        question
      );
      retry();
      return;
    }
    console.log(`Call to jService API succeeded. Solution: ${question.answer}`);
    callback(postprocessQuestion(bankSize, question));
  });
};

// Arbitrary constant unlikely to ever appear naturally
const RUN_DELIMITER = '@#"';
const convertRawQuestion = questionJson => {
  // Post-process question
  const solutionChars = questionJson.tileString.split('');
  const solutionRuns = questionJson.solution.trim().replace(
    /(\w+)/g,
    `${RUN_DELIMITER}$1${RUN_DELIMITER}`
  ).split(RUN_DELIMITER).filter(run => run.length).map(run => (
    run.charAt(0).match(/\w/) ? run.length : run
  ));
  const filteredSolution = questionJson.solution.replace(/[^\w]/g, '');

  return {
    category: questionJson.category,
    difficulty: questionJson.difficulty,
    filteredSolution,
    guessTileIds: (new Array(filteredSolution.length)).fill(null),
    id: questionJson.id,
    prompt: questionJson.prompt,
    selectedTileId: 0,
    solutionRuns,
    solved: false,
    tiles: solutionChars.map((char, id) => ({char, id, used: false})),
    tileString: questionJson.tileString
  };
};

// Converts the server's question format into a Redux substate
export const getQuestion = (bankSize, seenQuestions, callback) => {
  getRawQuestion(bankSize, seenQuestions, questionJson => {
    callback(convertRawQuestion(questionJson));
  });
};
