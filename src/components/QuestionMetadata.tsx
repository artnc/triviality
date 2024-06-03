import { EXIT_TILE_ID, HINT_TILE_ID } from "../constants";
import * as styles from "./QuestionMetadata.module.scss";

export const QuestionMetadata = ({
  category,
  difficulty,
  hints,
  seenQuestions,
  selectedTileId,
  solved,
}: {
  category: string;
  difficulty: number;
  hints: number;
  seenQuestions: number[];
  selectedTileId: any;
  solved: boolean;
}) => {
  const h = Math.floor(hints);
  const hintsMessage = `You have ${h} ${h === 1 ? "hint" : "hints"} left.`;
  let children;
  if (solved) {
    children = `Question #${seenQuestions.length} solved! ${hintsMessage}`;
  } else {
    switch (selectedTileId) {
      case EXIT_TILE_ID: {
        children =
          "Thanks for playing! " +
          `Question #${seenQuestions.length} will be saved.`;
        break;
      }
      case HINT_TILE_ID: {
        children = h ? `${hintsMessage} Use one?` : "You have no hints left!";
        break;
      }
      default: {
        children = [
          <span key={0} className={styles.bold}>
            {category}
          </span>,
          <span key={1} className={styles.for}>
            &nbsp;&nbsp;for&nbsp;&nbsp;
          </span>,
          <span key={2} className={styles.bold}>
            ${difficulty}
          </span>,
        ];
        break;
      }
    }
  }
  return <p className={styles["question-metadata"]}>{children}</p>;
};
