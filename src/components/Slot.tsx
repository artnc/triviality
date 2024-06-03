import classNames from "classnames";
import * as styles from "./Slot.module.scss";

export const Slot = ({
  children,
  solved,
}: {
  children: React.ReactNode;
  solved: boolean;
}) => (
  <div className={classNames(styles.slot, { [styles.solved]: solved })}>
    {children}
  </div>
);
