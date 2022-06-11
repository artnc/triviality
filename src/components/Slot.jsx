import classNames from "classnames";
import React from "react";

import styles from "styles/Slot.scss";
import { createPureComponent } from "util/react";

export const Slot = createPureComponent({
  render() {
    const { children, solved } = this.props;

    return (
      <div className={classNames(styles.slot, { [styles.solved]: solved })}>
        {children}
      </div>
    );
  },
});
