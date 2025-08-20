import { Question } from "../reducers";

const normalizeString = (html: string) => {
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

// Fisher-Yates
const shuffleString = (str: string) => {
  const a = str.split("");
  const n = a.length;
  let j;
  for (let i = n - 1; i; --i) {
    j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join("");
};

const LETTERS = `${"AEHINORST".repeat(3)}${"BCDFGKLMPUVWY".repeat(2)}JXQZ`;
const DIGITS = "0123456789";

export const getQuestion = async (
  bankSize: number,
  seenQuestions: number[],
): Promise<Question> => {
  const url =
    "https://corsproxy.io/?" +
    encodeURIComponent(
      // Add timestamp to defeat corsproxy.io caching
      // TODO: Softcode highest extant game ID
      `https://j-archive.com/showgame.php?game_id=${
        Math.floor(Math.random() * 9262) + 1
      }&_=${Date.now()}`,
    );

  // Parse show number from HTML
  const $doc = new DOMParser().parseFromString(
    await (await fetch(url)).text(),
    "text/html",
  );
  const showNumber = parseInt(
    $doc.querySelector("h1")?.textContent?.match(/Show #(\d+)/)?.[1] ?? "-1",
  );

  // Find all clue elements
  const $$clues = Array.from(
    $doc.querySelectorAll('td[class="clue_text"][id*="clue_J_"]'),
  ).filter((el, i) => i % 2 === 0);
  if (!$$clues.length) {
    console.log("No clues found in HTML. Retry scheduled.");
    await new Promise(resolve => setTimeout(resolve, 125));
    return await getQuestion(bankSize, seenQuestions);
  }

  // Process all clues to find usable ones
  const usableClues = [];
  for (const $clue of $$clues) {
    const clueId = $clue.getAttribute("id");
    const $response = $doc.getElementById(`${clueId}_r`);
    if (!(clueId && $response)) {
      continue;
    }

    // Parse HTML
    const category = normalizeString(
      (() => {
        const categoryMatch = clueId.match(/clue_J_(\d+)_/);
        if (categoryMatch) {
          const categoryNum = categoryMatch[1];
          const $category =
            $doc.querySelectorAll("td.category_name")[
              parseInt(categoryNum) - 1
            ];
          if ($category) {
            return $category.textContent?.trim();
          }
        }
      })() ?? "",
    );
    const difficulty = (() => {
      const valueMatch = $clue
        .closest("table")
        ?.querySelector(".clue_value")
        ?.textContent?.trim()
        ?.match(/\$(\d+)/);
      const value = valueMatch ? parseInt(valueMatch[1]) : -1;
      // https://j-archive.com/showgame.php?game_id=1062
      return showNumber < 3966 ? value * 2 : value;
    })();
    const id = parseInt(
      $response
        .closest("table")
        ?.querySelector('a[href*="suggestcorrection.php?clue_id="]')
        ?.getAttribute("href")
        ?.match(/clue_id=(\d+)/)?.[1] ?? "0",
    );
    const prompt = normalizeString($clue.textContent?.trim() ?? "")
      .replace(/\s+/g, " ")
      .trim();
    const solution = normalizeString(
      $response.querySelector("em.correct_response")?.textContent?.trim() ?? "",
    )
      .split("/")[0]
      .replace(/\(.+\)/g, "")
      .replace(/^an? /, "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();

    // Check question usability
    const solutionChars = solution.match(/\w/g) ?? [];
    if (
      id &&
      category &&
      difficulty >= 400 &&
      difficulty <= 1600 &&
      prompt.length <= 140 &&
      solutionChars.length > 1 &&
      solutionChars.length <= bankSize &&
      // Avoid multiple-choice clues because they're too easy
      !prompt.toUpperCase().includes(solution) &&
      !/\((cheryl|im|jimmy|jon|kelly|sarah|sofia) |(audio|video) clue|clue crew|following clip|(heard|seen) here/i.test(
        prompt,
      ) &&
      !seenQuestions.includes(id)
    ) {
      usableClues.push({
        category,
        difficulty,
        id,
        prompt,
        solution,
        solutionChars,
      });
    }
  }

  // If no usable clues found, retry
  console.log("Found", usableClues.length, "usable clues");
  if (!usableClues.length) {
    console.log("No usable clues found. Retry scheduled.");
    await new Promise(resolve => setTimeout(resolve, 125));
    return await getQuestion(bankSize, seenQuestions);
  }
  const { category, difficulty, id, prompt, solution, solutionChars } =
    usableClues[Math.floor(Math.random() * usableClues.length)];

  console.log(`API call succeeded. Solution: ${solution}`);
  const tileString = (() => {
    let tileString = solutionChars.join("");
    const digitRatio =
      (tileString.match(/\d/g) || []).length / tileString.length;
    for (let i = 0; i < bankSize - solutionChars.length; ++i) {
      const pool = Math.random() < digitRatio ? DIGITS : LETTERS;
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
