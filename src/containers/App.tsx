import classNames from "classnames";
import { connect } from "react-redux";

import {
  Dispatch,
  addTile,
  hydrateNewQuestion,
  removeTile,
  useHint,
} from "../actions";
import { State, Tile } from "../reducers";
import { Bank } from "../components/Bank";
import { Guess } from "../components/Guess";
import { Prompt } from "../components/Prompt";
import { QuestionMetadata } from "../components/QuestionMetadata";
import * as styles from "./App.module.scss";

const App = ({
  currentQuestion,
  dispatch,
  hints,
  seenQuestions,
}: State & { dispatch: Dispatch }) => {
  if (!currentQuestion) {
    return null;
  }
  const {
    category,
    difficulty,
    guessTileIds,
    prompt,
    selectedTileId,
    solutionRuns,
    solved,
    tiles,
  } = currentQuestion;

  solved && dispatch(hydrateNewQuestion(false));

  return (
    <div className={classNames(styles.app, { [styles.hidden]: !category })}>
      <QuestionMetadata
        category={category}
        difficulty={difficulty}
        hints={hints}
        seenQuestions={seenQuestions}
        selectedTileId={selectedTileId}
        solved={solved}
      />
      <Prompt>{prompt}</Prompt>
      <Guess
        guessTileIds={guessTileIds}
        onPromptClick={() => dispatch(removeTile())}
        solutionRuns={solutionRuns}
        solved={solved}
        tiles={tiles}
      />
      <Bank
        hints={hints}
        onRemoveClick={() => dispatch(removeTile())}
        onHintClick={() => dispatch(useHint())}
        onTileClick={(tile: Tile) => dispatch(addTile(tile.id))}
        selectedTileId={selectedTileId}
        solved={solved}
        tiles={tiles}
      />
    </div>
  );
};

export default connect(state => state)(App) as any;
