const normalizeString = html => {
  const node = document.createElement("div");
  node.innerHTML = html;
  return (node.textContent || node.innerText || "")
    .replace(/\\/g, "")
    .replace(/'/g, "\u2019")
    .replace(/"(.+?)"/g, "\u201c$1\u201d")
    .replace(/ *\/ */g, " / ")
    .replace(/ *\( */g, " (")
    .replace(/ *\) */g, ") ")
    .replace(/ +([,:])/g, "$1")
    .replace(/([,:])([^\d])/g, "$1 $2")
    .replace(/ *; */g, "; ")
    .replace(/ *-- */g, "\u2014")
    .replace(/ *& */g, " and ")
    .replace(/\s+/g, " ")
    .trim();
};

/** Fisher-Yates shuffle */
const shuffleString = string => {
  const a = string.split("");
  const n = a.length;
  let j;
  for (let i = n - 1; i; --i) {
    j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join("");
};

export const getQuestion = async (bankSize, seenQuestions) => {
  const url = `https://corsproxy.io/?${encodeURIComponent(
    // Add timestamp to defeat corsproxy.io caching
    `http://cluebase.lukelav.in/clues/random?_=${Date.now()}`
  )}`;
  const response = await (await fetch(url)).json();
  let {
    category,
    clue: prompt,
    id,
    response: solution,
    value: difficulty,
  } = response.data[0];
  if ([100, 300, 500].includes(difficulty)) {
    // TODO: Normalize clue values based on the threshold date 2001-11-26,
    // when Jeopardy doubled all clue values. jService included airdate in
    // clue API repsonses, but Cluebase requires an additional API call for
    // it :/ For now we just normalize only clues whose values imply that
    // they must have aired before the threshold date
    difficulty *= 2;
  }
  solution = normalizeString(solution)
    .split("/")[0]
    .replace(/\(.+\)/g, "")
    .replace(/^an? /, "")
    .replace(/\s+/g, " ")
    .replace(/</g, "") // IDK why Cluebase data sometimes has trailing "<"
    .trim();
  prompt = normalizeString(prompt).replace(/\s+/g, " ").trim();
  category = normalizeString(category);

  // Check question validity
  const isValid =
    difficulty >= 400 &&
    difficulty <= 1600 &&
    difficulty !== 1000 &&
    prompt.length <= 140 &&
    solution.match(/\w/g).length <= bankSize &&
    // Avoid multiple-choice clues because they're too easy
    !prompt.toLowerCase().includes(solution.toLowerCase()) &&
    !/\((cheryl|im|jimmy|jon|kelly|sarah|sofia) |(audio|video) clue|clue crew|following clip|(heard|seen) here/i.test(
      prompt
    ) &&
    !seenQuestions.includes(id);
  if (!isValid) {
    console.log("API call returned invalid data. Retry scheduled.", response);
    await new Promise(resolve => setTimeout(resolve, 125));
    return await getQuestion(bankSize, seenQuestions);
  }

  console.log(`API call succeeded. Solution: ${solution}`);
  solution = solution.toUpperCase();
  const tileString = (() => {
    const solutionChars = solution.match(/\w/g);
    let tileString = solutionChars.join("");
    const digitRatio =
      (tileString.match(/\d/g) || []).length / tileString.length;
    for (let i = 0; i < bankSize - solutionChars.length; ++i) {
      const pool =
        Math.random() < digitRatio
          ? "0123456789"
          : `${"AEHINORST".repeat(3)}${"BCDFGKLMPUVWY".repeat(2)}JXQZ`;
      tileString += pool[Math.floor(Math.random() * pool.length)];
    }
    return shuffleString(tileString);
  })();
  const RUN_DELIMITER = '@#"';
  const filteredSolution = solution.replace(/[^\w]/g, "");
  return {
    category,
    difficulty,
    filteredSolution,
    guessTileIds: new Array(filteredSolution.length).fill(null),
    id,
    prompt,
    selectedTileId: 0,
    solutionRuns: solution
      .trim()
      .replace(/(\w+)/g, `${RUN_DELIMITER}$1${RUN_DELIMITER}`)
      .split(RUN_DELIMITER)
      .filter(run => run.length)
      .map(run => (run.charAt(0).match(/\w/) ? run.length : run)),
    solved: false,
    tiles: tileString.split("").map((char, id) => ({ char, id, used: false })),
    tileString,
  };
};
