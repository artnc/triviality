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
const isQuestionValid = (bankSize, seenQuestions, question) => {
  const lowercasedClueText = question.question.toLowerCase();
  let valid;
  try {
    valid = question.value &&
      question.value >= 600 &&
      question.value <= 1600 &&
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

const stripHtmlTags = html => {
  const node = document.createElement('div');
  node.innerHTML = html;
  return node.textContent || node.innerText || '';
};

const DOUBLED_PRICES_AIRDATE = '2001-11-26T12:00:00.000Z';
const preprocessQuestion = question => {
  if (question.airdate < DOUBLED_PRICES_AIRDATE) {
    question.value *= 2;
  }
  const processedQuestion = Object.assign({}, question, {
    answer: stripHtmlTags(question.answer)
      .replace(/\\/g, '')
      .replace(/^an? /, '')
      .replace(/\(.+\) ?/g, '')
      .trim(),
    question: stripHtmlTags(question.question)
      .split('/')[0]
      .replace(/\\/g, '')
      .replace(/, ?([^\d])/g, ', $1')
      .replace(/: ?/g, ': ')
      .replace(/ *-- */g, '\u2014')
      .replace(/ ?& ?/g, ' and ')
      .trim()
  });
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

export const getQuestion = (bankSize, seenQuestions, callback) => {
  const retry = () => window.setTimeout(() => (
    getQuestion(bankSize, seenQuestions, callback)
  ), 125);
  http.getJSON('http://jservice.io/api/random', data => {
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
    callback(postprocessQuestion(bankSize, question));
  });
};
